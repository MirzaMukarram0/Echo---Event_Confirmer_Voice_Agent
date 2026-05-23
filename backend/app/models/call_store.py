from __future__ import annotations

from datetime import datetime
from threading import Lock
from typing import Dict, List, Optional

from app.schemas.call import CallStatus


class CallStore:
    def __init__(self) -> None:
        self._calls: Dict[str, CallStatus] = {}
        self._lock = Lock()

    def save(self, call: CallStatus) -> CallStatus:
        with self._lock:
            self._calls[call.call_id] = call
        return call

    def get(self, call_id: str) -> Optional[CallStatus]:
        with self._lock:
            return self._calls.get(call_id)

    def update_status(self, call_id: str, **kwargs: object) -> Optional[CallStatus]:
        with self._lock:
            call = self._calls.get(call_id)
            if not call:
                return None
            update_payload = call.model_dump()
            update_payload.update(kwargs)
            started_at = update_payload.get("started_at")
            ended_at = update_payload.get("ended_at")
            if started_at and ended_at and not update_payload.get("duration_seconds"):
                if isinstance(started_at, datetime) and isinstance(ended_at, datetime):
                    update_payload["duration_seconds"] = int(
                        (ended_at - started_at).total_seconds()
                    )
            updated = CallStatus(**update_payload)
            self._calls[call_id] = updated
            return updated

    def list_all(self) -> List[CallStatus]:
        with self._lock:
            calls = list(self._calls.values())
        calls.sort(key=lambda item: item.started_at or datetime.min, reverse=True)
        return calls

    def delete(self, call_id: str) -> bool:
        with self._lock:
            if call_id in self._calls:
                del self._calls[call_id]
                return True
        return False
