from fastapi import APIRouter, Depends

from backend.api.deps import get_current_user, get_org_id
from backend.models.deal_margin import (
    CompareRequest,
    CompareResponse,
    SimulationRequest,
    SimulationResponse,
)
from backend.services.deal_margin_service import deal_margin_service

router = APIRouter()


@router.post("/simulate", response_model=SimulationResponse)
async def simulate_margin(
    payload: SimulationRequest,
    org_id: str = Depends(get_org_id),
    user=Depends(get_current_user),
) -> SimulationResponse:
    return await deal_margin_service.simulate(org_id=org_id, user_id=str(user.id), payload=payload)


@router.post("/compare", response_model=CompareResponse)
async def compare_margin_scenarios(
    payload: CompareRequest,
    org_id: str = Depends(get_org_id),
    user=Depends(get_current_user),
) -> CompareResponse:
    return await deal_margin_service.compare(org_id=org_id, user_id=str(user.id), payload=payload)
