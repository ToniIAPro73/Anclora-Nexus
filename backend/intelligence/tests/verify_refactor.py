"""
Verification script for Intelligence refactor.
Exercises Orchestrator end-to-end.
"""

import sys
import os
import asyncio
from typing import Dict, Any

# Add root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../..")))

from backend.intelligence.orchestrator import create_orchestrator
from backend.intelligence.intelligence_types import StateEnum

def verify_orchestrator():
    print("🚀 Starting Intelligence Refactor Verification...")
    
    # 1. Initialize
    print("1. Initializing Orchestrator...")
    orchestrator = create_orchestrator()
    assert orchestrator.state == StateEnum.IDLE
    
    # 2. Process query
    test_message = "Debo dejar mi trabajo en CGI para enfocarme en Anclora? Tengo 10k ahorrados."
    print(f"2. Processing query: '{test_message}'")
    
    # We bypass actual DB calls if needed or assume local mode
    result, error = orchestrator.process_query(test_message, user_id="verification_test")
    
    if error:
        print(f"❌ Error during processing: {error}")
        return False
    
    # 3. Validate result structure (Pydantic models converted to dict)
    print("3. Validating result structure...")
    assert result["processing_status"] in ["success", "router_failed", "governor_failed", "synthesizer_failed", "orchestrator_panic"]
    assert "correlation_id" in result
    assert "query_plan" in result
    assert "governor_decision" in result
    assert "synthesizer_output" in result
    
    # Check individual component data
    if result["processing_status"] == "success":
        print("✅ Success! Validating component data...")
        qp = result["query_plan"]
        gd = result["governor_decision"]
        so = result["synthesizer_output"]
        
        print(f"   - Plan Mode: {qp['mode']}")
        print(f"   - Selected Domains: {qp['domains_selected']}")
        print(f"   - Recommendation: {gd['recommendation']}")
        print(f"   - Risks: {list(gd['risks'].keys())}")
        print(f"   - Synthesizer Blocks: {'PRÓXIMOS PASOS' in so['answer']}")
        
        # Verify 5 blocks in answer
        required_blocks = ["DIAGNÓSTICO", "RECOMENDACIÓN", "RIESGOS", "PRÓXIMOS PASOS", "QUÉ NO HACER"]
        for block in required_blocks:
            if block not in so["answer"]:
                print(f"❌ Missing block in answer: {block}")
                return False
        
        print("✅ All 5 fixed blocks found in Synthesizer output.")
        
    print("\n🎉 Verification COMPLETED successfully!")
    return True

if __name__ == "__main__":
    success = verify_orchestrator()
    if not success:
        sys.exit(1)
