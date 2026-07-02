from typing import Annotated

from fastapi import Depends, Header

from app.config import Settings, get_settings
from app.services.auth import decode_token
from app.services.errors import AuthenticationError

async def get_current_admin(
    settings: Annotated[Settings, Depends(get_settings)],
    authorization: Annotated[str | None, Header()] = None,
) -> str:
    if authorization is None or not authorization.startswith("Bearer "):
        raise AuthenticationError("missing bearer token")
    
    token = authorization.removeprefix("Bearer ")
    return decode_token(token, settings)
