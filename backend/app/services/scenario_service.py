from __future__ import annotations

from datetime import UTC, datetime
from typing import Any, Callable, Dict, List

from app.core.exceptions import ScenarioNotFoundException
from app.schemas.call import CallScenarioConfig, ScenarioField, ScenarioInfo, ScenarioType

ScenarioBuilder = Callable[[CallScenarioConfig], Dict[str, Any]]


class ScenarioService:
    def __init__(self) -> None:
        self._scenarios: Dict[ScenarioType, ScenarioInfo] = {}
        self._builders: Dict[ScenarioType, ScenarioBuilder] = {}
        self._register_default_scenarios()

    def get_all_scenarios(self) -> List[ScenarioInfo]:
        return list(self._scenarios.values())

    def build_assistant_config(
        self, scenario: ScenarioType, config: CallScenarioConfig
    ) -> Dict[str, Any]:
        builder = self._builders.get(scenario)
        if not builder:
            raise ScenarioNotFoundException(f"Unknown scenario: {scenario}")
        return builder(config)

    def _register(
        self,
        scenario: ScenarioInfo,
        builder: ScenarioBuilder,
    ) -> None:
        self._scenarios[scenario.id] = scenario
        self._builders[scenario.id] = builder

    def _register_default_scenarios(self) -> None:
        self._register(
            ScenarioInfo(
                id="event_registration",
                label="Event Registration",
                description="Confirm attendance and answer quick event questions.",
                fields=[
                    ScenarioField(
                        key="event_name",
                        label="Event Name",
                        required=True,
                        placeholder="Quarterly Growth Summit",
                    ),
                    ScenarioField(
                        key="event_date",
                        label="Event Date",
                        required=True,
                        placeholder="2026-06-20",
                        type="date",
                    ),
                    ScenarioField(
                        key="attendee_name",
                        label="Attendee Name",
                        required=True,
                        placeholder="Priya Patel",
                    ),
                    ScenarioField(
                        key="organizer_name",
                        label="Organizer Name",
                        required=True,
                        placeholder="Echo Events",
                    ),
                    ScenarioField(
                        key="event_location",
                        label="Event Location",
                        required=False,
                        placeholder="Downtown Conference Hall",
                    ),
                    ScenarioField(
                        key="organizer_phone",
                        label="Organizer Phone",
                        required=False,
                        placeholder="+14085551234",
                        type="phone",
                    ),
                ],
            ),
            build_event_registration_config,
        )

        self._register(
            ScenarioInfo(
                id="lead_qualification",
                label="Lead Qualification",
                description="Qualify a lead and capture interest signals.",
                fields=[
                    ScenarioField(
                        key="lead_name",
                        label="Lead Name",
                        required=True,
                        placeholder="Jordan Lee",
                    ),
                    ScenarioField(
                        key="product_name",
                        label="Product Name",
                        required=True,
                        placeholder="Echo Voice Suite",
                    ),
                    ScenarioField(
                        key="company_name",
                        label="Company Name",
                        required=False,
                        placeholder="Acme Corp",
                    ),
                    ScenarioField(
                        key="preferred_demo_date",
                        label="Preferred Demo Date",
                        required=False,
                        placeholder="2026-06-22",
                        type="date",
                    ),
                    ScenarioField(
                        key="sales_rep_phone",
                        label="Sales Rep Phone",
                        required=False,
                        placeholder="+14155550123",
                        type="phone",
                    ),
                ],
            ),
            build_lead_qualification_config,
        )

        self._register(
            ScenarioInfo(
                id="appointment_reminder",
                label="Appointment Reminder",
                description="Confirm attendance for a scheduled appointment.",
                fields=[
                    ScenarioField(
                        key="client_name",
                        label="Client Name",
                        required=True,
                        placeholder="Samir Rahman",
                    ),
                    ScenarioField(
                        key="appointment_date",
                        label="Appointment Date",
                        required=True,
                        placeholder="2026-06-24",
                        type="date",
                    ),
                    ScenarioField(
                        key="provider_name",
                        label="Provider Name",
                        required=True,
                        placeholder="City Clinic",
                    ),
                    ScenarioField(
                        key="office_phone",
                        label="Office Phone",
                        required=False,
                        placeholder="+12125550110",
                        type="phone",
                    ),
                ],
            ),
            build_appointment_reminder_config,
        )

        self._register(
            ScenarioInfo(
                id="customer_satisfaction",
                label="Customer Satisfaction",
                description="Collect quick feedback after a recent interaction.",
                fields=[
                    ScenarioField(
                        key="customer_name",
                        label="Customer Name",
                        required=True,
                        placeholder="Elena Gomez",
                    ),
                    ScenarioField(
                        key="recent_interaction",
                        label="Recent Interaction",
                        required=True,
                        placeholder="Onboarding call",
                    ),
                    ScenarioField(
                        key="account_manager_phone",
                        label="Account Manager Phone",
                        required=False,
                        placeholder="+13105550155",
                        type="phone",
                    ),
                ],
            ),
            build_customer_satisfaction_config,
        )

        self._register(
            ScenarioInfo(
                id="payment_followup",
                label="Payment Follow-up",
                description="Check on an outstanding invoice and offer help.",
                fields=[
                    ScenarioField(
                        key="client_name",
                        label="Client Name",
                        required=True,
                        placeholder="Jordan Smith",
                    ),
                    ScenarioField(
                        key="invoice_number",
                        label="Invoice Number",
                        required=True,
                        placeholder="INV-2048",
                    ),
                    ScenarioField(
                        key="due_date",
                        label="Due Date",
                        required=True,
                        placeholder="2026-06-18",
                        type="date",
                    ),
                    ScenarioField(
                        key="billing_phone",
                        label="Billing Phone",
                        required=False,
                        placeholder="+12065550100",
                        type="phone",
                    ),
                ],
            ),
            build_payment_followup_config,
        )


def _get_text(config: CallScenarioConfig, key: str, fallback: str) -> str:
    value = getattr(config, key, None)
    if not value:
        return fallback
    return str(value)


def build_event_registration_config(config: CallScenarioConfig) -> Dict[str, Any]:
    attendee_name = _get_text(config, "attendee_name", "there")
    event_name = _get_text(config, "event_name", "the upcoming event")
    event_date = _get_text(config, "event_date", datetime.now(UTC).date().isoformat())
    organizer_name = _get_text(config, "organizer_name", "the events team")
    event_location = _get_text(config, "event_location", "the team will email details")
    organizer_phone = _get_text(config, "organizer_phone", "")
    organizer_line = (
        f"Organizer phone: {organizer_phone}"
        if organizer_phone
        else "Organizer phone: not provided"
    )

    return {
        "name": "Aria",
        "model": {
            "provider": "openai",
            "model": "gpt-4o-mini",
            "systemPrompt": (
                "You are Aria, a warm and professional event coordinator assistant "
                f"for {organizer_name}. You are calling {attendee_name} to confirm "
                f"their registration for {event_name} on {event_date}.\n\n"
                "Your goals:\n"
                "1. Confirm their identity politely\n"
                "2. Confirm whether they are still attending\n"
                "3. If yes: share any key logistics (check-in time, location, dress code) if asked\n"
                "4. If no: acknowledge gracefully, offer to note the cancellation\n"
                "5. Answer basic event questions using only the context below\n"
                "6. End the call within 3 minutes\n\n"
                "Event context:\n"
                f"- Event: {event_name}\n"
                f"- Date: {event_date}\n"
                f"- Location: {event_location}\n"
                f"- Organizer: {organizer_name}\n"
                f"- {organizer_line}\n\n"
                "Rules:\n"
                "- Never invent details not in your context\n"
                "- For unknown questions: 'I will have the team follow up by email'\n"
                "- Be warm but concise and avoid rambling\n"
                "- If the person seems busy or uninterested, politely end the call"
            ),
        },
        "voice": {"provider": "playht", "voiceId": "jennifer"},
        "firstMessage": (
            f"Hello, may I speak with {attendee_name}? This is Aria calling from "
            f"{organizer_name} about your registration for {event_name}."
        ),
        "endCallMessage": "Thank you for your time. Have a great day!",
        "endCallPhrases": [
            "goodbye",
            "bye",
            "I have to go",
            "cancel my registration",
            "not interested",
        ],
        "maxDurationSeconds": 180,
    }


def build_lead_qualification_config(config: CallScenarioConfig) -> Dict[str, Any]:
    lead_name = _get_text(config, "lead_name", "there")
    product_name = _get_text(config, "product_name", "our solution")
    company_name = _get_text(config, "company_name", "your team")
    demo_date = _get_text(config, "preferred_demo_date", "a future date")

    return {
        "name": "Aria",
        "model": {
            "provider": "openai",
            "model": "gpt-4o-mini",
            "systemPrompt": (
                "You are Aria, a professional sales assistant. You are calling "
                f"{lead_name} at {company_name} to understand interest in {product_name}.\n\n"
                "Goals:\n"
                "1. Confirm if they have a few minutes to talk\n"
                "2. Understand their needs and timeline\n"
                "3. Offer to schedule a demo\n"
                "4. Keep the call under 3 minutes\n\n"
                "If they ask about scheduling, suggest the preferred demo date: "
                f"{demo_date}.\n"
                "Rules:\n"
                "- Do not pressure the lead\n"
                "- If not interested, thank them and end politely"
            ),
        },
        "voice": {"provider": "playht", "voiceId": "jennifer"},
        "firstMessage": (
            f"Hi {lead_name}, this is Aria from Echo. I am reaching out about "
            f"{product_name}. Do you have a moment?"
        ),
        "endCallMessage": "Thanks for your time. Have a great day!",
        "endCallPhrases": ["goodbye", "bye", "not interested"],
        "maxDurationSeconds": 180,
    }


def build_appointment_reminder_config(config: CallScenarioConfig) -> Dict[str, Any]:
    client_name = _get_text(config, "client_name", "there")
    appointment_date = _get_text(
        config, "appointment_date", datetime.now(UTC).date().isoformat()
    )
    provider_name = _get_text(config, "provider_name", "our team")
    office_phone = _get_text(config, "office_phone", "")
    office_line = f"Office phone: {office_phone}" if office_phone else "Office phone:"

    return {
        "name": "Aria",
        "model": {
            "provider": "openai",
            "model": "gpt-4o-mini",
            "systemPrompt": (
                "You are Aria, a courteous appointment reminder assistant for "
                f"{provider_name}. You are calling {client_name} about their "
                f"appointment on {appointment_date}.\n\n"
                "Goals:\n"
                "1. Confirm their identity\n"
                "2. Confirm attendance or reschedule request\n"
                "3. Keep the call under 2 minutes\n\n"
                f"{office_line}\n"
                "Rules:\n"
                "- If they need to reschedule, tell them someone will follow up"
            ),
        },
        "voice": {"provider": "playht", "voiceId": "jennifer"},
        "firstMessage": (
            f"Hello {client_name}, this is Aria calling from {provider_name} "
            f"about your appointment on {appointment_date}."
        ),
        "endCallMessage": "Thank you for confirming. Have a good day!",
        "endCallPhrases": ["goodbye", "bye", "reschedule"],
        "maxDurationSeconds": 120,
    }


def build_customer_satisfaction_config(config: CallScenarioConfig) -> Dict[str, Any]:
    customer_name = _get_text(config, "customer_name", "there")
    interaction = _get_text(config, "recent_interaction", "your recent experience")

    return {
        "name": "Aria",
        "model": {
            "provider": "openai",
            "model": "gpt-4o-mini",
            "systemPrompt": (
                "You are Aria, a customer care assistant. You are calling "
                f"{customer_name} about {interaction}.\n\n"
                "Goals:\n"
                "1. Ask for a quick satisfaction rating\n"
                "2. Capture any feedback or issues\n"
                "3. Thank them and end the call within 2 minutes\n\n"
                "Rules:\n"
                "- If there is a serious issue, say a team member will follow up"
            ),
        },
        "voice": {"provider": "playht", "voiceId": "jennifer"},
        "firstMessage": (
            f"Hi {customer_name}, this is Aria with a quick check-in about "
            f"{interaction}. Do you have a minute to share feedback?"
        ),
        "endCallMessage": "Thanks for your feedback. We appreciate it!",
        "endCallPhrases": ["goodbye", "bye"],
        "maxDurationSeconds": 120,
    }


def build_payment_followup_config(config: CallScenarioConfig) -> Dict[str, Any]:
    client_name = _get_text(config, "client_name", "there")
    invoice_number = _get_text(config, "invoice_number", "the outstanding invoice")
    due_date = _get_text(config, "due_date", datetime.now(UTC).date().isoformat())

    return {
        "name": "Aria",
        "model": {
            "provider": "openai",
            "model": "gpt-4o-mini",
            "systemPrompt": (
                "You are Aria, a polite billing assistant. You are calling "
                f"{client_name} about invoice {invoice_number} due on {due_date}.\n\n"
                "Goals:\n"
                "1. Confirm they received the invoice\n"
                "2. Ask if they need any help with payment\n"
                "3. Keep the call under 2 minutes\n\n"
                "Rules:\n"
                "- Do not pressure the client\n"
                "- If they need help, tell them someone will follow up"
            ),
        },
        "voice": {"provider": "playht", "voiceId": "jennifer"},
        "firstMessage": (
            f"Hello {client_name}, this is Aria from Echo billing. I am calling "
            f"about invoice {invoice_number} due on {due_date}."
        ),
        "endCallMessage": "Thanks for your time. Have a good day!",
        "endCallPhrases": ["goodbye", "bye"],
        "maxDurationSeconds": 120,
    }
