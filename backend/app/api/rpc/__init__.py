from app.api.rpc import methods  # noqa: F401 — сам факт импорта регистрирует все методы
from app.api.rpc.router import router

__all__ = ["router"]
