from typing import TypedDict, Optional, List, Any

class AgentState(TypedDict):
    # Input context
    input_data: dict
    skill_name: str
    org_id: str
    user_id: str

    # Planning
    plan: Optional[str]
    selected_skill: Optional[str]

    # Constitutional Limits
    limits_ok: bool
    limit_violation: Optional[str]

    # Execution / Skill Output
    skill_output: Optional[dict]
    error: Optional[str]

    # Audit Trail
    audit_logged: bool
    agent_log_id: Optional[str]

    # Final Result and Execution Status
    final_result: Optional[dict]
    status: str  # e.g., "running", "success", "error", "blocked"
