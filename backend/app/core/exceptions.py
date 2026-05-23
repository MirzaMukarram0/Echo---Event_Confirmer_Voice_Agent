from __future__ import annotations

from typing import Any, Dict, Optional


class VoiceAgentException(Exception):
    pass


class VapiException(VoiceAgentException):
    def __init__(
        self, message: str, status_code: int = 500, payload: Optional[Dict[str, Any]] = None
    ) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.payload = payload


class VapiNotConfiguredException(VoiceAgentException):
    pass


class CallNotFoundException(VoiceAgentException):
    pass


class InvalidPhoneNumberException(VoiceAgentException):
    pass
