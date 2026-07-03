from typing import Any

import structlog
from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, ValidationError
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.rpc.registry import REGISTRY
from app.api.rpc.registry import RpcContext
from app.config import Settings, get_settings
from app.db import get_db
from app.services.auth import decode_token
from app.services.errors import AuthenticationError, ConflictError, FeedFetchError, NotFoundError

logger = structlog.get_logger(__name__)

router = APIRouter()

_ERROR_CODES: dict[type[Exception], int] = {
    NotFoundError: -32001,
    ConflictError: -32002,
    AuthenticationError: -32003,
    FeedFetchError: -32602,
}


def _error(request_id: Any, code: int, message: str) -> dict[str, Any]:
    return {"jsonrpc": "2.0", "id": request_id, "error": {"code": code, "message": message}}


def _serialize(result: Any) -> Any:
    if isinstance(result, BaseModel):
        return result.model_dump(mode="json")
    if isinstance(result, list):
        return [_serialize(item) for item in result]
    return result


@router.post("/rpc")
async def rpc_endpoint(
    request: Request,
    session: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict[str, Any]:
    body = await request.json()
    request_id = body.get("id")
    method_name = body.get("method")
    raw_params = body.get("params") or {}

    spec = REGISTRY.get(method_name)
    if spec is None:
        return _error(request_id, -32601, f"method '{method_name}' not found")

    admin: str | None = None
    auth_header = request.headers.get("authorization", "")
    if auth_header.startswith("Bearer "):
        try:
            admin = decode_token(auth_header.removeprefix("Bearer "), settings)
        except AuthenticationError:
            admin = None

    if spec.requires_admin and admin is None:
        return _error(request_id, -32003, "authentication required")

    try:
        params = spec.params_model.model_validate(raw_params) if spec.params_model else None
    except ValidationError as exc:
        return _error(request_id, -32602, str(exc))

    ctx = RpcContext(session=session, settings=settings, admin=admin)

    try:
        result = await spec.handler(params, ctx)
    except (NotFoundError, ConflictError, AuthenticationError, FeedFetchError) as exc:
        return _error(request_id, _ERROR_CODES[type(exc)], str(exc))
    except Exception:
        logger.exception("rpc.internal_error", method=method_name)
        return _error(request_id, -32603, "internal error")

    return {"jsonrpc": "2.0", "id": request_id, "result": _serialize(result)}
