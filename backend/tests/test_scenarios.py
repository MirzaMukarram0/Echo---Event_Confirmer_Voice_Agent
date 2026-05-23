from __future__ import annotations

from app.services.scenario_service import ScenarioService


def test_scenario_registry_has_event_registration() -> None:
    service = ScenarioService()
    scenarios = service.get_all_scenarios()
    scenario_ids = {scenario.id for scenario in scenarios}
    assert "event_registration" in scenario_ids
