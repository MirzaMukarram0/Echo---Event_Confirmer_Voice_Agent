from __future__ import annotations

from typing import Any, Dict

import httpx
import structlog

from app.core.config import Settings
from app.core.exceptions import VapiException


class VapiService:
    def __init__(self, settings: Settings) -> None:
        self._logger = structlog.get_logger(__name__)
        self._client = httpx.AsyncClient(
            base_url=settings.VAPI_BASE_URL,
            headers={"Authorization": f"Bearer {settings.VAPI_API_KEY}"},
            timeout=30.0,
        )

    @staticmethod
    def _safe_payload(response: httpx.Response) -> Dict[str, Any]:
        try:
            payload = response.json()
            if isinstance(payload, dict):
                return payload
        except Exception:
            pass
        return {"raw": response.text}

    async def initiate_call(
        self,
        phone: str,
        assistant_config: Dict[str, Any],
        phone_number_id: str,
        metadata: Dict[str, Any] | None = None,
    ) -> Dict[str, Any]:
        payload = {
            "assistant": assistant_config,
            "phoneNumberId": phone_number_id,
            "customer": {"number": phone},
        }
        if metadata:
            payload["metadata"] = metadata
        response = await self._client.post("/call/phone", json=payload)
        if response.status_code != 201:
            error_payload = self._safe_payload(response)
            self._logger.error(
                "vapi_initiate_failed",
                status_code=response.status_code,
                payload=error_payload,
            )
            detail = error_payload.get("message") or error_payload.get("detail")
            raise VapiException(
                f"Failed to initiate call: {detail}" if detail else "Failed to initiate call",
                response.status_code,
                error_payload,
            )
        return response.json()

    async def get_call(self, call_id: str) -> Dict[str, Any]:
        response = await self._client.get(f"/call/{call_id}")
        if response.status_code != 200:
            error_payload = self._safe_payload(response)
            self._logger.error(
                "vapi_get_failed",
                status_code=response.status_code,
                payload=error_payload,
            )
            detail = error_payload.get("message") or error_payload.get("detail")
            raise VapiException(
                f"Failed to fetch call: {detail}" if detail else "Failed to fetch call",
                response.status_code,
                error_payload,
            )
        return response.json()

    async def end_call(self, call_id: str) -> Dict[str, Any]:
        response = await self._client.post(f"/call/{call_id}/end")
        if response.status_code not in (200, 204):
            error_payload = self._safe_payload(response)
            self._logger.error(
                "vapi_end_failed",
                status_code=response.status_code,
                payload=error_payload,
            )
            detail = error_payload.get("message") or error_payload.get("detail")
            raise VapiException(
                f"Failed to end call: {detail}" if detail else "Failed to end call",
                response.status_code,
                error_payload,
            )
        return response.json() if response.content else {}

    async def aclose(self) -> None:
        await self._client.aclose()
