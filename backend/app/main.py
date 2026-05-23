from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.core.exceptions import (
    CallNotFoundException,
    InvalidPhoneNumberException,
    ScenarioNotFoundException,
    VapiException,
    VapiNotConfiguredException,
    VoiceAgentException,
)
from app.core.logging import configure_logging
from app.models.call_store import CallStore
from app.services.scenario_service import ScenarioService
from app.services.vapi_service import VapiService


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    app.state.call_store = CallStore()
    app.state.scenario_service = ScenarioService()
    app.state.vapi_service = VapiService(settings)
    yield
    await app.state.vapi_service.aclose()


def create_app() -> FastAPI:
    settings = get_settings()
    configure_logging(settings.DEBUG)

    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        lifespan=lifespan,
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(VapiException)
    async def vapi_exception_handler(request: Request, exc: VapiException) -> JSONResponse:
        payload = {"detail": str(exc)}
        if exc.payload:
            payload["payload"] = exc.payload
        return JSONResponse(status_code=exc.status_code, content=payload)

    @app.exception_handler(VapiNotConfiguredException)
    async def vapi_not_configured_handler(
        request: Request, exc: VapiNotConfiguredException
    ) -> JSONResponse:
        return JSONResponse(status_code=503, content={"detail": str(exc)})

    @app.exception_handler(InvalidPhoneNumberException)
    async def invalid_phone_handler(
        request: Request, exc: InvalidPhoneNumberException
    ) -> JSONResponse:
        return JSONResponse(status_code=400, content={"detail": str(exc)})

    @app.exception_handler(CallNotFoundException)
    async def call_not_found_handler(
        request: Request, exc: CallNotFoundException
    ) -> JSONResponse:
        return JSONResponse(status_code=404, content={"detail": str(exc)})

    @app.exception_handler(ScenarioNotFoundException)
    async def scenario_not_found_handler(
        request: Request, exc: ScenarioNotFoundException
    ) -> JSONResponse:
        return JSONResponse(status_code=400, content={"detail": str(exc)})

    @app.exception_handler(VoiceAgentException)
    async def voice_agent_handler(
        request: Request, exc: VoiceAgentException
    ) -> JSONResponse:
        return JSONResponse(status_code=400, content={"detail": str(exc)})

    app.include_router(api_router)

    return app


app = create_app()
