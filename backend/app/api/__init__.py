from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.drivers import router as drivers_router
from app.api.ambulances import router as ambulances_router
from app.api.emergency import router as emergency_router
from app.api.admin import router as admin_router
from app.api.ai import router as ai_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(drivers_router)
api_router.include_router(ambulances_router)
api_router.include_router(emergency_router)
api_router.include_router(admin_router)
api_router.include_router(ai_router)
