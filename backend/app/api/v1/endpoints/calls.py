from __future__ import annotations

from datetime import UTC, datetime
from typing import Any, Dict

import structlog

from fastapi import APIRouter, Depends, Response, status

from app.api.deps import (
    call_rate_limiter,
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
logger = structlog.get_logger(__name__)


@router.post("/calls", response_model=InitiateCallResponse, status_code=202, dependencies=[Depends(call_rate_limiter)])
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

    logger.info(
        "initiating_call",
        phone=request.phone_number,
        scenario=request.scenario,
    )

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
        started_at=datetime.now(UTC),
    )
    store.save(call)

    logger.info("call_initiated", call_id=call_id, scenario=request.scenario)

    return InitiateCallResponse(
        success=True,
        message="Call initiated.",
        call_id=call.call_id,
        status=call.status,
        phone_number=call.phone_number,
        scenario=call.scenario,
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
    
    # If the call is already in a terminal state, just return the cache
    if cached and cached.status in ["ended", "failed"]:
        return cached

    # Polling fallback: if webhooks are not configured, poll Vapi for updates
    try:
        vapi_response = await vapi.get_call(call_id)
        status_val = vapi_response.get("status")
        transcript = vapi_response.get("transcript")
        cost = vapi_response.get("cost")
        
        if cached:
            updates = {}
            if status_val: updates["status"] = status_val
            if transcript: updates["transcript"] = transcript
            if cost is not None: updates["cost"] = float(cost)
            
            if updates:
                updated_call = store.update_status(call_id, **updates)
                if updated_call:
                    return updated_call
            return cached

        # If not cached at all, create it
        scenario, phone_number = _extract_metadata(vapi_response)
        if not scenario or not phone_number:
            raise CallNotFoundException("Call not found.")
        return CallStatus(
            call_id=vapi_response.get("id", call_id),
            status=status_val or "queued",
            phone_number=phone_number,
            scenario=scenario,
            transcript=transcript,
            cost=float(cost) if cost is not None else None,
        )
    except Exception as e:
        logger.error("vapi_poll_failed", error=str(e))
        if cached:
            return cached
        raise


@router.delete("/calls/{call_id}", status_code=204)
async def end_call(
    call_id: str,
    vapi: VapiService = Depends(get_vapi_service),
    store: CallStore = Depends(get_call_store),
) -> Response:
    logger.info("ending_call", call_id=call_id)
    await vapi.end_call(call_id)
    store.update_status(call_id, status="ended", ended_at=datetime.now(UTC))
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
