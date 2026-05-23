from __future__ import annotations

from fastapi import APIRouter

from app.api.v1.endpoints import calls, health, scenarios, webhooks

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(calls.router)
api_router.include_router(scenarios.router)
api_router.include_router(webhooks.router)
