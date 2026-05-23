from __future__ import annotations

from fastapi import APIRouter, Depends

from app.api.deps import get_scenario_service
from app.schemas.call import ScenarioListResponse
from app.services.scenario_service import ScenarioService

router = APIRouter(prefix="/api/v1", tags=["scenarios"])


@router.get("/scenarios", response_model=ScenarioListResponse)
async def list_scenarios(
    service: ScenarioService = Depends(get_scenario_service),
) -> ScenarioListResponse:
    return ScenarioListResponse(scenarios=service.get_all_scenarios())
