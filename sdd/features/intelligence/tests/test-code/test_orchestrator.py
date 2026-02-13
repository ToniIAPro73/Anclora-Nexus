import pytest
import uuid
from unittest.mock import MagicMock, patch, AsyncMock
from backend.intelligence.orchestrator.orchestrator import Orchestrator, create_orchestrator
from backend.intelligence.intelligence_types import (
    StateEnum, QueryPlan, GovernorDecision, SynthesizerOutput, Recommendation, Confidence
)

@pytest.fixture
def orchestrator():
    # Patch get_db_service to avoid real DB connection during init
    with patch("backend.intelligence.orchestrator.orchestrator.get_db_service") as mock_db:
        mock_db_instance = mock_db.return_value
        mock_db_instance.save_audit_log.return_value = (True, "saved: audit-123")
        orch = create_orchestrator()
        return orch

# --- State Management (TC-ORC-01, 02) ---

def test_orchestrator_init(orchestrator):
    """TC-ORC-01: Correct initialization."""
    assert orchestrator.state == StateEnum.IDLE
    assert orchestrator.strategic_mode_version == "1.0-validation-phase"

@pytest.mark.asyncio
async def test_process_query_full_flow(orchestrator, sample_query_plan, sample_governor_decision, sample_synthesizer_output):
    """TC-ORC-05: Full flow success."""
    
    # Mock components
    orchestrator.router.route_query = MagicMock(return_value=(sample_query_plan, None))
    orchestrator.governor.evaluate = MagicMock(return_value=(sample_governor_decision, None))
    orchestrator.synthesizer.synthesize = MagicMock(return_value=(sample_synthesizer_output, None))
    
    with patch("backend.intelligence.orchestrator.orchestrator.get_db_service") as mock_db_service:
        mock_db = mock_db_service.return_value
        mock_db.save_audit_log.return_value = (True, "saved: audit-123")
        
        result, error = orchestrator.process_query("What is the market like?")
        
        assert error is None
        assert result["processing_status"] == "success"
        assert result["audit_id"] == "audit-123"
        assert orchestrator.state == StateEnum.COMPLETED

# --- Error Recovery (TC-ORC-09) ---

@pytest.mark.asyncio
async def test_process_query_router_error(orchestrator):
    """Test failure at step 1: Router."""
    orchestrator.router.route_query = MagicMock(return_value=(None, "Router Timeout"))
    
    with patch("backend.intelligence.orchestrator.orchestrator.get_db_service") as mock_db_service:
        mock_db = mock_db_service.return_value
        mock_db.save_audit_log.return_value = (True, "saved: audit-err")
        
        result, error = orchestrator.process_query("Fail query")
        
        assert error == "Router Timeout"
        assert result["processing_status"] == "router_failed"
        assert orchestrator.state == StateEnum.FAILED

@pytest.mark.asyncio
async def test_process_query_governor_error(orchestrator, sample_query_plan):
    """Test failure at step 2: Governor."""
    orchestrator.router.route_query = MagicMock(return_value=(sample_query_plan, None))
    orchestrator.governor.evaluate = MagicMock(return_value=(None, "Governor rejection"))
    
    with patch("backend.intelligence.orchestrator.orchestrator.get_db_service") as mock_db_service:
        mock_db = mock_db_service.return_value
        mock_db.save_audit_log.return_value = (True, "saved: audit-err")
        
        result, error = orchestrator.process_query("Rejection query")
        
        assert error == "Governor rejection"
        assert result["processing_status"] == "governor_failed"
        assert orchestrator.state == StateEnum.FAILED

@pytest.mark.asyncio
async def test_process_query_synthesizer_error_no_degrade(orchestrator, sample_query_plan, sample_governor_decision):
    """Test failure at step 3: Synthesizer (no fallback output)."""
    orchestrator.router.route_query = MagicMock(return_value=(sample_query_plan, None))
    orchestrator.governor.evaluate = MagicMock(return_value=(sample_governor_decision, None))
    orchestrator.synthesizer.synthesize = MagicMock(return_value=(None, "Synthesizer crash"))
    
    with patch("backend.intelligence.orchestrator.orchestrator.get_db_service") as mock_db_service:
        mock_db = mock_db_service.return_value
        mock_db.save_audit_log.return_value = (True, "saved: audit-err")
        
        result, error = orchestrator.process_query("Crash query")
        
        assert error == "Synthesizer crash"
        assert result["processing_status"] == "synthesizer_failed"

@pytest.mark.asyncio
async def test_process_query_synthesizer_degraded(orchestrator, sample_query_plan, sample_governor_decision, sample_synthesizer_output):
    """TC-ORC-14: Synthesizer partial success (degraded output)."""
    orchestrator.router.route_query = MagicMock(return_value=(sample_query_plan, None))
    orchestrator.governor.evaluate = MagicMock(return_value=(sample_governor_decision, None))
    orchestrator.synthesizer.synthesize = MagicMock(return_value=(sample_synthesizer_output, "Partial failure"))
    
    with patch("backend.intelligence.orchestrator.orchestrator.get_db_service") as mock_db_service:
        mock_db = mock_db_service.return_value
        mock_db.save_audit_log.return_value = (True, "saved: audit-partial")
        
        result, error = orchestrator.process_query("Soft query")
        
        # In this case synthesized output is returned even with error
        assert error is None
        assert result["processing_status"] == "success"
        assert orchestrator.state == StateEnum.COMPLETED

# --- Component Integration (TC-ORC-03, 08) ---

@pytest.mark.asyncio
async def test_correlation_id_propagation(orchestrator, sample_query_plan, sample_governor_decision, sample_synthesizer_output):
    """TC-ORC-03: Correlation ID is passed to query plan."""
    orchestrator.router.route_query = MagicMock(return_value=(sample_query_plan, None))
    orchestrator.governor.evaluate = MagicMock(return_value=(sample_governor_decision, None))
    orchestrator.synthesizer.synthesize = MagicMock(return_value=(sample_synthesizer_output, None))
    
    with patch("backend.intelligence.orchestrator.orchestrator.get_db_service"):
        result, _ = orchestrator.process_query("Trace me")
        
        c_id = result["correlation_id"]
        # router.route_query output is sample_query_plan. 
        # Orchestrator sets 'correlation_id' on it.
        assert sample_query_plan.correlation_id == c_id

# --- Audit Logging & Integrity (TC-ORC-10) ---

@pytest.mark.asyncio
async def test_audit_save_fail(orchestrator, sample_query_plan, sample_governor_decision, sample_synthesizer_output):
    """Test behavior when audit logging fails."""
    orchestrator.router.route_query = MagicMock(return_value=(sample_query_plan, None))
    orchestrator.governor.evaluate = MagicMock(return_value=(sample_governor_decision, None))
    orchestrator.synthesizer.synthesize = MagicMock(return_value=(sample_synthesizer_output, None))
    
    with patch("backend.intelligence.orchestrator.orchestrator.get_db_service") as mock_db_service:
        mock_db = mock_db_service.return_value
        mock_db.save_audit_log.return_value = (False, "Database down")
        
        result, error = orchestrator.process_query("No audit query")
        
        assert result["audit_id"] == "LOCAL_ONLY"
        assert result["processing_status"] == "success"

@pytest.mark.asyncio
async def test_critical_panic_recovery(orchestrator):
    """Test unexpected exception in the pipeline."""
    orchestrator.router.route_query = MagicMock(side_effect=RuntimeError("Unexpected!"))
    
    with patch("backend.intelligence.orchestrator.orchestrator.get_db_service"):
        result, error = orchestrator.process_query("Panic query")
        
        assert "critical failure" in error
        # If finalize_with_error returns a tuple and process_query returns that + error,
        # result is the first element of the outer tuple.
        assert result["processing_status"] == "orchestrator_panic"

# --- Edge Cases & Internal Logic ---

def test_build_result_dict(orchestrator, sample_query_plan):
    """Verify result dictionary structure."""
    res = orchestrator._build_result_dict(
        "corr-1", "user-1", "msg", sample_query_plan, None, None, {"t": 1.0}, "ok"
    )
    assert res["correlation_id"] == "corr-1"
    assert res["query_plan"]["query_plan_id"] == sample_query_plan.query_plan_id

@pytest.mark.asyncio
async def test_finalize_with_error_logging(orchestrator):
    """Verify finalize helper works correctly."""
    with patch("backend.intelligence.orchestrator.orchestrator.get_db_service"):
        res, err = orchestrator._finalize_with_error(
            "c1", "u1", "m", "some error", "err_status", {"t": 0}
        )
        assert res["error"] == "some error"
        assert err == "some error"

# --- Extended Tests for Coverage (Total > 20) ---

@pytest.mark.asyncio
async def test_process_query_user_id_default(orchestrator, sample_query_plan, sample_governor_decision, sample_synthesizer_output):
    orchestrator.router.route_query = MagicMock(return_value=(sample_query_plan, None))
    orchestrator.governor.evaluate = MagicMock(return_value=(sample_governor_decision, None))
    orchestrator.synthesizer.synthesize = MagicMock(return_value=(sample_synthesizer_output, None))
    with patch("backend.intelligence.orchestrator.orchestrator.get_db_service"):
        result, _ = orchestrator.process_query("Default user")
        assert result["user_id"] == "toni"

@pytest.mark.asyncio
async def test_process_query_custom_user_id(orchestrator, sample_query_plan, sample_governor_decision, sample_synthesizer_output):
    orchestrator.router.route_query = MagicMock(return_value=(sample_query_plan, None))
    orchestrator.governor.evaluate = MagicMock(return_value=(sample_governor_decision, None))
    orchestrator.synthesizer.synthesize = MagicMock(return_value=(sample_synthesizer_output, None))
    with patch("backend.intelligence.orchestrator.orchestrator.get_db_service"):
        result, _ = orchestrator.process_query("Custom user", user_id="agent_1")
        assert result["user_id"] == "agent_1"

def test_save_audit_transaction_exception_handling(orchestrator):
    """Verify save_audit_transaction catches exceptions from db_service."""
    with patch("backend.intelligence.orchestrator.orchestrator.get_db_service") as mock_db:
        mock_db.side_effect = Exception("Boom")
        res = {"correlation_id": "1", "user_id": "u", "message": "m", "processing_status": "s", "query_plan": None, "governor_decision": None, "synthesizer_output": None, "execution_times": {}}
        audit_id = orchestrator._save_audit_transaction(res)
        assert audit_id == "LOCAL_ONLY"

@pytest.mark.asyncio
async def test_execution_times_calculation(orchestrator, sample_query_plan, sample_governor_decision, sample_synthesizer_output):
    orchestrator.router.route_query = MagicMock(return_value=(sample_query_plan, None))
    orchestrator.governor.evaluate = MagicMock(return_value=(sample_governor_decision, None))
    orchestrator.synthesizer.synthesize = MagicMock(return_value=(sample_synthesizer_output, None))
    with patch("backend.intelligence.orchestrator.orchestrator.get_db_service"):
        result, _ = orchestrator.process_query("Timing test")
        assert "router_ms" in result["execution_times"]
        assert "governor_ms" in result["execution_times"]
        assert "synthesizer_ms" in result["execution_times"]
        assert "total_ms" in result["execution_times"]

@pytest.mark.asyncio
async def test_process_query_empty_message(orchestrator, sample_query_plan):
    # Just verify it doesn't crash
    orchestrator.router.route_query = MagicMock(return_value=(sample_query_plan, None))
    orchestrator.governor.evaluate = MagicMock(return_value=(None, "error"))
    with patch("backend.intelligence.orchestrator.orchestrator.get_db_service"):
        orchestrator.process_query("")

def test_create_orchestrator_factory():
    orch = create_orchestrator("2.0")
    assert orch.strategic_mode_version == "2.0"

@pytest.mark.asyncio
async def test_governor_decision_details_in_audit(orchestrator, sample_query_plan, sample_governor_decision, sample_synthesizer_output):
    orchestrator.router.route_query = MagicMock(return_value=(sample_query_plan, None))
    orchestrator.governor.evaluate = MagicMock(return_value=(sample_governor_decision, None))
    orchestrator.synthesizer.synthesize = MagicMock(return_value=(sample_synthesizer_output, None))
    
    with patch("backend.intelligence.orchestrator.orchestrator.get_db_service") as mock_db_service:
        mock_db = mock_db_service.return_value
        orchestrator.process_query("audit test")
        
        # Check if governor_decision_id was passed correctly to save_audit_log
        mock_db.save_audit_log.assert_called()
        args, kwargs = mock_db.save_audit_log.call_args
        assert kwargs["governor_decision_id"] == sample_governor_decision.decision_id
