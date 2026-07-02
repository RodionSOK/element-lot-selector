import secrets
from datetime import datetime, timedelta, timezone

import jwt

from app.config import Settings
from app.schemas.auth import LoginRequest, TokenResponse
from app.services.errors import AuthenticationError


def authenticate(data: LoginRequest, settings: Settings) -> TokenResponse:
    valid_username = secrets.compare_digest(data.username, settings.admin_username)
    valid_password = secrets.compare_digest(data.password, settings.admin_password)

    if not (valid_username and valid_password):
        raise AuthenticationError("invalid username or password")

    expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expires_minutes)
    payload = {"sub": data.username, "exp": int(expires_at.timestamp())}
    token = jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)

    return TokenResponse(access_token=token)


def decode_token(token: str, settings: Settings) -> str:
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    except jwt.PyJWTError as exc:
        raise AuthenticationError("invalid or expired token") from exc

    return payload["sub"]
