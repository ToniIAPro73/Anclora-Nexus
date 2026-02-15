import os

path = r"c:\Users\Usuario\Workspace\01_Proyectos\anclora-nexus\backend\api\routes\prospection.py"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Fix Import
content = content.replace(
    "from backend.api.deps import get_org_id",
    "from backend.api.deps import get_org_id, check_budget_hard_stop"
)

# Fix create_property
content = content.replace(
    "@router.post(\"/properties\", status_code=status.HTTP_201_CREATED)\nasync def create_property(\n    data: PropertyCreate,\n    org_id: str = Depends(get_org_id),\n) -> dict:",
    "@router.post(\"/properties\", status_code=status.HTTP_201_CREATED)\nasync def create_property(\n    data: PropertyCreate,\n    org_id: str = Depends(get_org_id),\n    _budget = Depends(check_budget_hard_stop),\n) -> dict:"
)

# Fix recompute_matches (Try different variations of spacing if needed, but let's try exact first)
content = content.replace(
    "@router.post(\"/matches/recompute\", response_model=RecomputeResponse)\nasync def recompute_matches(\n    data: Optional[RecomputeRequest] = None,\n    org_id: str = Depends(get_org_id),\n) -> RecomputeResponse:",
    "@router.post(\"/matches/recompute\", response_model=RecomputeResponse)\nasync def recompute_matches(\n    data: Optional[RecomputeRequest] = None,\n    org_id: str = Depends(get_org_id),\n    _budget = Depends(check_budget_hard_stop),\n) -> RecomputeResponse:"
)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated prospection.py successfully.")
