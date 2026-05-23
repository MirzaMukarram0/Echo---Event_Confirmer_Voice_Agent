from __future__ import annotations

from datetime import datetime, timedelta

from app.models.call_store import CallStore
from app.schemas.call import CallStatus


def test_call_store_save_and_get() -> None:
    store = CallStore()
    call = CallStatus(
        call_id="call-1",
        status="queued",
        phone_number="+14155550123",
        scenario="event_registration",
        started_at=datetime.utcnow(),
    )
    store.save(call)

    fetched = store.get("call-1")
    assert fetched is not None
    assert fetched.call_id == call.call_id


def test_call_store_update_sets_duration() -> None:
    store = CallStore()
    started_at = datetime.utcnow()
    ended_at = started_at + timedelta(seconds=10)
    call = CallStatus(
        call_id="call-2",
        status="in-progress",
        phone_number="+14155550123",
        scenario="event_registration",
        started_at=started_at,
    )
    store.save(call)

    updated = store.update_status(
        "call-2",
        status="ended",
        ended_at=ended_at,
    )
    assert updated is not None
    assert updated.duration_seconds == 10
