from datetime import datetime, timezone
from typing import Any, Dict, Optional
from uuid import uuid4

from fastapi import HTTPException, status

from backend.models.automation import (
    AlertListResponse,
    AutomationExecutionStatus,
    AutomationRuleStatus,
    DryRunRequest,
    DryRunResponse,
    ExecuteRequest,
    ExecuteResponse,
    ExecutionLogResponse,
    RuleCreateRequest,
    RuleListResponse,
    RuleResponse,
    RuleUpdateRequest,
    ScopeMetadata,
)
from backend.models.membership import UserRole
from backend.services.finops import finops_service
from backend.services.supabase_service import supabase_service


class AutomationService:
    def __init__(self) -> None:
        self.client = supabase_service.client

    def _now(self) -> str:
        return datetime.now(timezone.utc).isoformat()

    def _table_exists(self, table: str) -> bool:
        try:
            self.client.table(table).select("id").limit(1).execute()
            return True
        except Exception:
            return False

    async def _get_role(self, org_id: str, user_id: str) -> str:
        try:
            result = (
                self.client.table("organization_members")
                .select("role,status")
                .eq("org_id", org_id)
                .eq("user_id", user_id)
                .eq("status", "active")
                .limit(1)
                .execute()
            )
            if result.data:
                return str(result.data[0].get("role") or UserRole.AGENT.value)
        except Exception:
            pass
        return UserRole.OWNER.value

    def _assert_can_write(self, role: str) -> None:
        if role not in {UserRole.OWNER.value, UserRole.MANAGER.value}:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="FORBIDDEN_ROLE_SCOPE")

    async def _get_rule(self, org_id: str, rule_id: str) -> Optional[Dict[str, Any]]:
        result = (
            self.client.table("automation_rules")
            .select("*")
            .eq("org_id", org_id)
            .eq("id", rule_id)
            .limit(1)
            .execute()
        )
        return result.data[0] if result.data else None

    async def list_rules(self, org_id: str, user_id: str) -> RuleListResponse:
        role = await self._get_role(org_id, user_id)
        if not self._table_exists("automation_rules"):
            return RuleListResponse(scope=ScopeMetadata(org_id=org_id, role=role), items=[], total=0)
        result = (
            self.client.table("automation_rules")
            .select("*", count="exact")
            .eq("org_id", org_id)
            .order("updated_at", desc=True)
            .execute()
        )
        items = [RuleResponse(**item) for item in (result.data or [])]
        return RuleListResponse(scope=ScopeMetadata(org_id=org_id, role=role), items=items, total=result.count or len(items))

    async def create_rule(self, org_id: str, user_id: str, payload: RuleCreateRequest) -> RuleResponse:
        role = await self._get_role(org_id, user_id)
        self._assert_can_write(role)
        if not self._table_exists("automation_rules"):
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="AUTOMATION_SCHEMA_NOT_READY")
        now = self._now()
        data = {
            "org_id": org_id,
            "name": payload.name,
            "status": AutomationRuleStatus.ACTIVE.value,
            "event_type": payload.event_type,
            "channel": payload.channel,
            "action_type": payload.action_type,
            "schedule_cron": payload.schedule_cron,
            "max_cost_eur_per_run": payload.max_cost_eur_per_run,
            "requires_human_checkpoint": payload.requires_human_checkpoint,
            "conditions": payload.conditions,
            "created_at": now,
            "updated_at": now,
        }
        result = self.client.table("automation_rules").insert(data).execute()
        created = result.data[0]
        try:
            await supabase_service.insert_audit_log(
                {
                    "org_id": org_id,
                    "entity_type": "automation_rule",
                    "entity_id": created["id"],
                    "action": "create",
                    "actor_user_id": user_id,
                    "details": {"name": payload.name, "channel": payload.channel},
                }
            )
        except Exception:
            pass
        return RuleResponse(**created)

    async def update_rule(self, org_id: str, user_id: str, rule_id: str, payload: RuleUpdateRequest) -> Optional[RuleResponse]:
        role = await self._get_role(org_id, user_id)
        self._assert_can_write(role)
        if not self._table_exists("automation_rules"):
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="AUTOMATION_SCHEMA_NOT_READY")
        existing = await self._get_rule(org_id, rule_id)
        if not existing:
            return None
        data = payload.model_dump(exclude_unset=True)
        if not data:
            return RuleResponse(**existing)
        data["updated_at"] = self._now()
        result = (
            self.client.table("automation_rules")
            .update(data)
            .eq("org_id", org_id)
            .eq("id", rule_id)
            .execute()
        )
        updated = result.data[0]
        try:
            await supabase_service.insert_audit_log(
                {
                    "org_id": org_id,
                    "entity_type": "automation_rule",
                    "entity_id": rule_id,
                    "action": "update",
                    "actor_user_id": user_id,
                    "details": data,
                }
            )
        except Exception:
            pass
        return RuleResponse(**updated)

    async def _evaluate_guardrails(
        self,
        org_id: str,
        rule: Dict[str, Any],
        cost_estimate_eur: float,
        confirm_human_checkpoint: bool,
        for_execute: bool,
    ) -> Dict[str, Any]:
        reasons: list[str] = []

        if str(rule.get("status")) != AutomationRuleStatus.ACTIVE.value:
            reasons.append("RULE_NOT_ACTIVE")

        max_cost = float(rule.get("max_cost_eur_per_run") or 0)
        if max_cost > 0 and cost_estimate_eur > max_cost:
            reasons.append("COST_LIMIT_EXCEEDED")

        if bool(rule.get("requires_human_checkpoint")) and for_execute and not confirm_human_checkpoint:
            reasons.append("HUMAN_CHECKPOINT_REQUIRED")

        budget = await finops_service.get_budget_status(org_id)
        if budget.status == "hard_stop":
            reasons.append("FINOPS_HARD_STOP_ACTIVE")

        blocked = len(reasons) > 0
        return {
            "decision": "blocked" if blocked else "allow",
            "reasons": reasons,
            "guardrails": {
                "max_cost_eur_per_run": max_cost,
                "cost_estimate_eur": cost_estimate_eur,
                "requires_human_checkpoint": bool(rule.get("requires_human_checkpoint")),
                "human_checkpoint_confirmed": bool(confirm_human_checkpoint),
                "finops_status": budget.status,
            },
        }

    async def dry_run(self, org_id: str, user_id: str, rule_id: str, payload: DryRunRequest) -> Optional[DryRunResponse]:
        role = await self._get_role(org_id, user_id)
        if not self._table_exists("automation_rules"):
            return None
        rule = await self._get_rule(org_id, rule_id)
        if not rule:
            return None
        evaluation = await self._evaluate_guardrails(
            org_id=org_id,
            rule=rule,
            cost_estimate_eur=payload.cost_estimate_eur,
            confirm_human_checkpoint=False,
            for_execute=False,
        )
        return DryRunResponse(
            scope=ScopeMetadata(org_id=org_id, role=role),
            rule_id=rule_id,
            decision=evaluation["decision"],
            reasons=evaluation["reasons"],
            guardrails=evaluation["guardrails"],
        )

    async def execute(self, org_id: str, user_id: str, rule_id: str, payload: ExecuteRequest) -> Optional[ExecuteResponse]:
        role = await self._get_role(org_id, user_id)
        self._assert_can_write(role)
        if not self._table_exists("automation_rules") or not self._table_exists("automation_executions"):
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="AUTOMATION_SCHEMA_NOT_READY")
        rule = await self._get_rule(org_id, rule_id)
        if not rule:
            return None

        evaluation = await self._evaluate_guardrails(
            org_id=org_id,
            rule=rule,
            cost_estimate_eur=payload.cost_estimate_eur,
            confirm_human_checkpoint=payload.confirm_human_checkpoint,
            for_execute=True,
        )
        trace_id = str(uuid4())
        execution_status = (
            AutomationExecutionStatus.BLOCKED.value
            if evaluation["decision"] == "blocked"
            else AutomationExecutionStatus.EXECUTED.value
        )
        execution_data = {
            "org_id": org_id,
            "rule_id": rule_id,
            "status": execution_status,
            "decision": evaluation["decision"],
            "reasons": evaluation["reasons"],
            "cost_estimate_eur": payload.cost_estimate_eur,
            "event_payload": payload.event_payload,
            "trace_id": trace_id,
            "created_at": self._now(),
        }
        execution = self.client.table("automation_executions").insert(execution_data).execute().data[0]

        if evaluation["decision"] == "blocked" and self._table_exists("automation_alerts"):
            self.client.table("automation_alerts").insert(
                {
                    "org_id": org_id,
                    "rule_id": rule_id,
                    "alert_type": "guardrail_block",
                    "message": ",".join(evaluation["reasons"]) if evaluation["reasons"] else "blocked",
                    "is_active": True,
                    "created_at": self._now(),
                }
            ).execute()

        try:
            await supabase_service.insert_audit_log(
                {
                    "org_id": org_id,
                    "entity_type": "automation_execution",
                    "entity_id": execution["id"],
                    "action": "execute",
                    "actor_user_id": user_id,
                    "details": {
                        "rule_id": rule_id,
                        "decision": evaluation["decision"],
                        "reasons": evaluation["reasons"],
                        "trace_id": trace_id,
                    },
                }
            )
        except Exception:
            pass

        return ExecuteResponse(
            scope=ScopeMetadata(org_id=org_id, role=role),
            rule_id=rule_id,
            execution_id=execution["id"],
            status=AutomationExecutionStatus(execution_status),
            decision=evaluation["decision"],
            reasons=evaluation["reasons"],
            trace_id=trace_id,
        )

    async def list_executions(
        self,
        org_id: str,
        user_id: str,
        execution_status: Optional[str] = None,
        rule_id: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> ExecutionLogResponse:
        role = await self._get_role(org_id, user_id)
        if not self._table_exists("automation_executions"):
            return ExecutionLogResponse(scope=ScopeMetadata(org_id=org_id, role=role), items=[], total=0)
        query = self.client.table("automation_executions").select("*", count="exact").eq("org_id", org_id).order("created_at", desc=True)
        if execution_status:
            query = query.eq("status", execution_status)
        if rule_id:
            query = query.eq("rule_id", rule_id)
        query = query.range(offset, offset + limit - 1)
        result = query.execute()
        return ExecutionLogResponse(
            scope=ScopeMetadata(org_id=org_id, role=role),
            items=result.data or [],
            total=result.count or len(result.data or []),
        )

    async def list_alerts(self, org_id: str, user_id: str) -> AlertListResponse:
        role = await self._get_role(org_id, user_id)
        if not self._table_exists("automation_alerts"):
            return AlertListResponse(scope=ScopeMetadata(org_id=org_id, role=role), items=[], total=0)
        result = (
            self.client.table("automation_alerts")
            .select("*", count="exact")
            .eq("org_id", org_id)
            .eq("is_active", True)
            .order("created_at", desc=True)
            .execute()
        )
        return AlertListResponse(
            scope=ScopeMetadata(org_id=org_id, role=role),
            items=result.data or [],
            total=result.count or len(result.data or []),
        )

    async def acknowledge_alert(self, org_id: str, user_id: str, alert_id: str) -> bool:
        role = await self._get_role(org_id, user_id)
        self._assert_can_write(role)
        if not self._table_exists("automation_alerts"):
            return False
        result = (
            self.client.table("automation_alerts")
            .update({"is_active": False, "resolved_at": self._now()})
            .eq("org_id", org_id)
            .eq("id", alert_id)
            .execute()
        )
        if not result.data:
            return False
        try:
            await supabase_service.insert_audit_log(
                {
                    "org_id": org_id,
                    "entity_type": "automation_alert",
                    "entity_id": alert_id,
                    "action": "acknowledge",
                    "actor_user_id": user_id,
                    "details": {"status": "resolved"},
                }
            )
        except Exception:
            pass
        return True


automation_service = AutomationService()
