"""
Anclora Intelligence v1 — Basic E2E Tests
Test the Orchestrator pipeline
"""

import sys
from pathlib import Path

# Add backend to path for imports
backend_path = Path(__file__).parent.parent.parent
sys.path.insert(0, str(backend_path))

# Now import from intelligence package
from intelligence.orchestrator import create_orchestrator


def test_orchestrator_basic():
    """Test basic orchestrator functionality."""
    print("\n" + "="*70)
    print("TEST 1: Basic Orchestrator Flow")
    print("="*70)
    
    orchestrator = create_orchestrator()
    
    message = "¿Es buen momento para solicitar excedencia en CGI?"
    print(f"\n📝 Input message: {message}")
    
    result, error = orchestrator.process_query(message)
    
    if error:
        print(f"❌ ERROR: {error}")
        return False
    
    print(f"\n✅ Processing completed")
    print(f"   - Correlation ID: {result.get('correlation_id')}")
    print(f"   - Status: {result.get('processing_status')}")
    print(f"   - Total time: {result.get('execution_times', {}).get('total_ms', 0):.2f}ms")
    
    # Verify structure
    assert "query_plan" in result, "Missing query_plan"
    assert "governor_decision" in result, "Missing governor_decision"
    assert "synthesizer_output" in result, "Missing synthesizer_output"
    
    print(f"\n📊 Query Plan:")
    print(f"   - Domains: {result['query_plan']['domains_selected']}")
    print(f"   - Mode: {result['query_plan']['mode']}")
    print(f"   - Confidence: {result['query_plan']['confidence']}")
    
    print(f"\n⚖️  Governor Decision:")
    print(f"   - Recommendation: {result['governor_decision']['recommendation']}")
    print(f"   - Labor risk: {result['governor_decision']['risks']['labor']}")
    print(f"   - Tax risk: {result['governor_decision']['risks']['tax']}")
    
    print(f"\n🎨 Synthesizer Output:")
    print(f"   - Recommendation: {result['synthesizer_output']['meta']['recommendation']}")
    answer_preview = result['synthesizer_output']['answer'][:200] + "..."
    print(f"   - Answer preview: {answer_preview}")
    
    return True


def test_orchestrator_market_domain():
    """Test orchestrator with market domain."""
    print("\n" + "="*70)
    print("TEST 2: Market Domain (Your Expertise)")
    print("="*70)
    
    orchestrator = create_orchestrator()
    
    message = "¿Cuál es el precio de mercado para una villa en Andratx?"
    print(f"\n📝 Input message: {message}")
    
    result, error = orchestrator.process_query(message)
    
    if error:
        print(f"❌ ERROR: {error}")
        return False
    
    print(f"\n✅ Processing completed")
    print(f"   - Domains: {result['query_plan']['domains_selected']}")
    print(f"   - Recommendation: {result['governor_decision']['recommendation']}")
    
    return True


def test_orchestrator_multiple_domains():
    """Test orchestrator with multiple domains."""
    print("\n" + "="*70)
    print("TEST 3: Multiple Domains (Complex Query)")
    print("="*70)
    
    orchestrator = create_orchestrator()
    
    message = "¿Debo crear una SL para la actividad inmobiliaria? ¿Cuál es el impacto fiscal vs seguir como independiente?"
    print(f"\n📝 Input message: {message}")
    
    result, error = orchestrator.process_query(message)
    
    if error:
        print(f"❌ ERROR: {error}")
        return False
    
    print(f"\n✅ Processing completed")
    print(f"   - Domains: {result['query_plan']['domains_selected']}")
    print(f"   - Mode: {result['query_plan']['mode']}")
    print(f"   - Recommendation: {result['governor_decision']['recommendation']}")
    
    return True


def run_all_tests():
    """Run all tests."""
    print("\n" + "█"*70)
    print("█ ANCLORA INTELLIGENCE v1 — TEST SUITE")
    print("█"*70)
    
    tests = [
        ("Basic E2E Flow", test_orchestrator_basic),
        ("Market Domain", test_orchestrator_market_domain),
        ("Multiple Domains", test_orchestrator_multiple_domains),
    ]
    
    passed = 0
    failed = 0
    
    for test_name, test_func in tests:
        try:
            if test_func():
                passed += 1
            else:
                failed += 1
        except Exception as e:
            print(f"\n❌ TEST FAILED: {test_name}")
            print(f"   Exception: {str(e)}")
            failed += 1
    
    # Summary
    print("\n" + "="*70)
    print("TEST SUMMARY")
    print("="*70)
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")
    print(f"📊 Total: {passed + failed}")
    print("="*70 + "\n")
    
    return failed == 0


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
