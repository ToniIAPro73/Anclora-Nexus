from typing import List, Optional

from pydantic import BaseModel, Field


FEATURE_VERSION = "ANCLORA-DMS-001.v1"


class ScopeMetadata(BaseModel):
    org_id: str
    role: str


class MarginAssumptions(BaseModel):
    deal_value_eur: float = Field(..., gt=0, le=500000000)
    acquisition_cost_eur: float = Field(..., ge=0, le=500000000)
    closing_cost_eur: float = Field(0, ge=0, le=500000000)
    renovation_cost_eur: float = Field(0, ge=0, le=500000000)
    holding_cost_eur: float = Field(0, ge=0, le=500000000)
    tax_cost_eur: float = Field(0, ge=0, le=500000000)
    commission_rate_pct: float = Field(3, ge=0, le=25)
    confidence_pct: float = Field(80, ge=1, le=100)


class SimulationRequest(BaseModel):
    assumptions: MarginAssumptions
    scenario_name: Optional[str] = Field(None, max_length=120)


class MarginDriver(BaseModel):
    label: str
    value_eur: float


class SimulationResult(BaseModel):
    scenario_name: str
    gross_margin_eur: float
    gross_margin_pct: float
    expected_commission_eur: float
    expected_margin_eur: float
    recommendation_band: str
    drivers: List[MarginDriver]


class SimulationResponse(BaseModel):
    version: str = FEATURE_VERSION
    scope: ScopeMetadata
    result: SimulationResult


class CompareRequest(BaseModel):
    scenarios: List[SimulationRequest] = Field(..., min_length=2, max_length=5)


class CompareResponse(BaseModel):
    version: str = FEATURE_VERSION
    scope: ScopeMetadata
    results: List[SimulationResult]
    best_scenario: str
