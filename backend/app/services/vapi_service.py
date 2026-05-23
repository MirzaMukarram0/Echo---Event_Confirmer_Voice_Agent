from __future__ import annotations

from typing import Any, Dict

import httpx

from app.core.config import Settings
from app.core.exceptions import VapiException


class VapiService:
    def __init__(self, settings: Settings) -> None:
        self._client = httpx.AsyncClient(
            base_url=settings.VAPI_BASE_URL,
            headers={"Authorization": f"Bearer {settings.VAPI_API_KEY}"},
            timeout=30.0,
        )

    async def initiate_call(
        self, phone: str, assistant_config: Dict[str, Any], phone_number_id: str
    ) -> Dict[str, Any]:
        payload = {
            "assistant": assistant_config,
            "phoneNumberId": phone_number_id,
            "customer": {"number": phone},
        }
        response = await self._client.post("/call/phone", json=payload)
        if response.status_code != 201:
            raise VapiException(
                "Failed to initiate call",
                response.status_code,
                response.json(),
            )
        return response.json()

    async def get_call(self, call_id: str) -> Dict[str, Any]:
        response = await self._client.get(f"/call/{call_id}")
        if response.status_code != 200:
            raise VapiException(
                "Failed to fetch call",
                response.status_code,
                response.json(),
            )
        return response.json()

    async def end_call(self, call_id: str) -> Dict[str, Any]:
        response = await self._client.post(f"/call/{call_id}/end")
        if response.status_code not in (200, 204):
            raise VapiException(
                "Failed to end call",
                response.status_code,
                response.json(),
            )
        return response.json() if response.content else {}

    async def aclose(self) -> None:
        await self._client.aclose()
