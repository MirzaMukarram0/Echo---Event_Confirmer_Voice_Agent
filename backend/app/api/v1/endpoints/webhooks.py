from __future__ import annotations

from datetime import UTC, datetime
from typing import Any, Dict, Set

import structlog

from fastapi import APIRouter, Depends, Request, HTTPException

from app.api.deps import get_call_store, get_settings_dep
from app.core.config import Settings
from app.models.call_store import CallStore
from app.schemas.call import WebhookEvent

router = APIRouter(prefix="/api/v1", tags=["webhooks"])
logger = structlog.get_logger(__name__)

# Track processed webhook events for idempotency within this process lifetime
_processed_events: Set[str] = set()


@router.post("/webhooks/vapi", status_code=200)
async def vapi_webhook(
    payload: WebhookEvent,
    request: Request,
    store: CallStore = Depends(get_call_store),
    settings: Settings = Depends(get_settings_dep),
) -> Dict[str, Any]:
    if settings.VAPI_WEBHOOK_SECRET:
        secret = request.headers.get("x-vapi-secret")
        if secret != settings.VAPI_WEBHOOK_SECRET:
            logger.warning("webhook_unauthorized", detail="Invalid x-vapi-secret header.")
            raise HTTPException(status_code=401, detail="Invalid webhook signing secret.")

    msg = payload.message
    event_type = msg.get("type")
    call_id = _extract_call_id(msg)

    if not call_id:
        logger.warning("webhook_missing_call_id", event_type=event_type)
        return {"received": True}

    # Idempotency guard: skip duplicate events
    event_key = f"{call_id}:{event_type}"
    if event_key in _processed_events:
        logger.info("webhook_duplicate_skipped", call_id=call_id, event_type=event_type)
        return {"received": True}

    logger.info("webhook_received", call_id=call_id, event_type=event_type)

    if event_type == "call-started":
        store.update_status(call_id, status="in-progress")
        _processed_events.add(event_key)

    elif event_type == "end-of-call-report":
        store.update_status(
            call_id,
            status="ended",
            ended_at=datetime.now(UTC),
            transcript=msg.get("transcript"),
            recording_url=msg.get("recordingUrl"),
            ended_reason=msg.get("endedReason"),
            cost=msg.get("cost"),
        )
        _processed_events.add(event_key)

    elif event_type == "status-update":
        vapi_status = msg.get("status")
        if vapi_status == "ended":
            store.update_status(call_id, status="ended", ended_at=datetime.now(UTC))
        elif vapi_status == "in-progress":
            store.update_status(call_id, status="in-progress")

    return {"received": True}


def _extract_call_id(message: Dict[str, Any]) -> str | None:
    call = message.get("call") if isinstance(message.get("call"), dict) else {}
    return call.get("id")
