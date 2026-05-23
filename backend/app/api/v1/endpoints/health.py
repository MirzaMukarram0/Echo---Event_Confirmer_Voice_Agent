from __future__ import annotations

from fastapi import APIRouter, Depends

from app.api.deps import get_settings_dep
from app.core.config import Settings

router = APIRouter(prefix="/api/v1", tags=["health"])


@router.get("/health")
async def health_check(
    settings: Settings = Depends(get_settings_dep),
) -> dict:
    return {
        "status": "ok",
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "vapi_configured": settings.is_vapi_configured,
    }
