from collections.abc import Awaitable, Callable
from dataclasses import dataclass
from typing import Any

from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import Settings


@dataclass
class RpcContext:
    session: AsyncSession
    settings: Settings
    admin: str | None


@dataclass
class RpcMethodSpec:
    handler: Callable[[BaseModel | None, RpcContext], Awaitable[Any]]
    params_model: type[BaseModel] | None
    requires_admin: bool


REGISTRY: dict[str, RpcMethodSpec] = {}


def rpc_method(
    name: str,
    *,
    params_model: type[BaseModel] | None = None,
    requires_admin: bool = False,
) -> Callable:
    def decorator(func: Callable) -> Callable:
        REGISTRY[name] = RpcMethodSpec(
            handler=func, params_model=params_model, requires_admin=requires_admin
        )
        return func

    return decorator
