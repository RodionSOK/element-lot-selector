from fastapi import APIRouter

from app.api.rest import admin, applications, bookings, lots

router = APIRouter()
router.include_router(lots.router)
router.include_router(bookings.router)
router.include_router(applications.router)
router.include_router(admin.router)
