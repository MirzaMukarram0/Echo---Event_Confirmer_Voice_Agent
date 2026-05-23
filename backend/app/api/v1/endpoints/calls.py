from __future__ import annotations

from datetime import datetime
from typing import Any, Dict

from fastapi import APIRouter, Depends, Response, status

from app.api.deps import (
    get_call_store,
    get_scenario_service,
    get_settings_dep,
    get_vapi_service,
)
from app.core.config import Settings
from app.core.exceptions import CallNotFoundException
from app.models.call_store import CallStore
from app.schemas.call import (
    CallListResponse,
    CallScenarioConfig,
    CallStatus,
    InitiateCallRequest,
    InitiateCallResponse,
)
from app.services.scenario_service import ScenarioService
from app.services.vapi_service import VapiService

router = APIRouter(prefix="/api/v1", tags=["calls"])


@router.post("/calls", response_model=InitiateCallResponse, status_code=202)
async def initiate_call(
    request: InitiateCallRequest,
    vapi: VapiService = Depends(get_vapi_service),
    store: CallStore = Depends(get_call_store),
    scenario_svc: ScenarioService = Depends(get_scenario_service),
    settings: Settings = Depends(get_settings_dep),
) -> InitiateCallResponse:
    scenario_config = CallScenarioConfig(**request.scenario_config)
    assistant_config = scenario_svc.build_assistant_config(
        request.scenario, scenario_config
    )
    metadata = {
        "scenario": request.scenario,
        "phone_number": request.phone_number,
    }
    vapi_response = await vapi.initiate_call(
        request.phone_number,
        assistant_config,
        settings.VAPI_PHONE_NUMBER_ID,
        metadata=metadata,
    )
    call_id = vapi_response.get("id")
    if not call_id:
        raise CallNotFoundException("Vapi did not return a call id.")
    call = CallStatus(
        call_id=call_id,
        status=vapi_response.get("status", "queued"),
        phone_number=request.phone_number,
        scenario=request.scenario,
        started_at=datetime.utcnow(),
    )
    store.save(call)
    return InitiateCallResponse(
        success=True,
        message="Call initiated.",
        **call.model_dump(),
    )


@router.get("/calls", response_model=CallListResponse)
async def list_calls(
    store: CallStore = Depends(get_call_store),
) -> CallListResponse:
    calls = store.list_all()
    return CallListResponse(calls=calls, total=len(calls))


@router.get("/calls/{call_id}", response_model=CallStatus)
async def get_call(
    call_id: str,
    vapi: VapiService = Depends(get_vapi_service),
    store: CallStore = Depends(get_call_store),
) -> CallStatus:
    cached = store.get(call_id)
    if cached:
        return cached

    vapi_response = await vapi.get_call(call_id)
    scenario, phone_number = _extract_metadata(vapi_response)
    if not scenario or not phone_number:
        raise CallNotFoundException("Call not found.")
    return CallStatus(
        call_id=vapi_response.get("id", call_id),
        status=vapi_response.get("status", "queued"),
        phone_number=phone_number,
        scenario=scenario,
    )


@router.delete("/calls/{call_id}", status_code=204)
async def end_call(
    call_id: str,
    vapi: VapiService = Depends(get_vapi_service),
    store: CallStore = Depends(get_call_store),
) -> Response:
    await vapi.end_call(call_id)
    store.update_status(call_id, status="ended", ended_at=datetime.utcnow())
    return Response(status_code=status.HTTP_204_NO_CONTENT)


def _extract_metadata(payload: Dict[str, Any]) -> tuple[str | None, str | None]:
    metadata = payload.get("metadata") if isinstance(payload.get("metadata"), dict) else {}
    scenario = metadata.get("scenario")
    phone_number = metadata.get("phone_number")
    if phone_number:
        return scenario, phone_number

    customer = payload.get("customer") if isinstance(payload.get("customer"), dict) else {}
    phone_number = customer.get("number")
    return scenario, phone_number
