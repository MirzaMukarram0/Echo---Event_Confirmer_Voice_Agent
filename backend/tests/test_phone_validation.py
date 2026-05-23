from __future__ import annotations

import pytest

from app.core.exceptions import InvalidPhoneNumberException
from app.schemas.call import InitiateCallRequest


def test_phone_validation_rejects_missing_plus() -> None:
    with pytest.raises(InvalidPhoneNumberException):
        InitiateCallRequest(
            phone_number="14155550123",
            scenario="event_registration",
            scenario_config={},
        )


def test_phone_validation_accepts_e164() -> None:
    request = InitiateCallRequest(
        phone_number="+14155550123",
        scenario="event_registration",
        scenario_config={},
    )
    assert request.phone_number == "+14155550123"
