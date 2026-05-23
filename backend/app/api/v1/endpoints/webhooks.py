from __future__ import annotations

from datetime import datetime
from typing import Any, Dict

from fastapi import APIRouter, Depends

from app.api.deps import get_call_store
from app.models.call_store import CallStore
from app.schemas.call import WebhookEvent

router = APIRouter(prefix="/api/v1", tags=["webhooks"])


@router.post("/webhooks/vapi", status_code=200)
async def vapi_webhook(
    payload: WebhookEvent,
    store: CallStore = Depends(get_call_store),
) -> Dict[str, Any]:
    msg = payload.message
    event_type = msg.get("type")
    call_id = _extract_call_id(msg)

    if not call_id:
        return {"received": True}

    if event_type == "call-started":
        store.update_status(call_id, status="in-progress")

    elif event_type == "end-of-call-report":
        store.update_status(
            call_id,
            status="ended",
            ended_at=datetime.utcnow(),
            transcript=msg.get("transcript"),
            recording_url=msg.get("recordingUrl"),
            ended_reason=msg.get("endedReason"),
            cost=msg.get("cost"),
        )

    return {"received": True}


def _extract_call_id(message: Dict[str, Any]) -> str | None:
    call = message.get("call") if isinstance(message.get("call"), dict) else {}
    return call.get("id")
