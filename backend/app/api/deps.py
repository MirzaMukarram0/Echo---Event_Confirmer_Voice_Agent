from __future__ import annotations

from fastapi import Request

from app.core.config import Settings, get_settings
from app.core.exceptions import VapiNotConfiguredException
from app.models.call_store import CallStore
from app.services.scenario_service import ScenarioService
from app.services.vapi_service import VapiService


def get_settings_dep() -> Settings:
    return get_settings()


def get_call_store(request: Request) -> CallStore:
    return request.app.state.call_store


def get_scenario_service(request: Request) -> ScenarioService:
    return request.app.state.scenario_service


def get_vapi_service(request: Request) -> VapiService:
    settings = get_settings()
    if not settings.is_vapi_configured:
        raise VapiNotConfiguredException("Vapi is not configured.")
    return request.app.state.vapi_service
