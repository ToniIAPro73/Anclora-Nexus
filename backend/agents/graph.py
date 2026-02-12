from langgraph.graph import StateGraph, START, END
from backend.agents.state import AgentState
from backend.agents.nodes.all_nodes import (
    process_input_node,
    planner_node,
    limit_check_node,
    executor_node,
    result_handler_node,
    audit_logger_node,
    finalize_node
)

def create_graph():
    workflow = StateGraph(AgentState)

    # 1. Add Nodes
    workflow.add_node("process_input", process_input_node)
    workflow.add_node("planner", planner_node)
    workflow.add_node("limit_check", limit_check_node)
    workflow.add_node("executor", executor_node)
    workflow.add_node("result_handler", result_handler_node)
    workflow.add_node("audit_logger", audit_logger_node)
    workflow.add_node("finalize", finalize_node)

    # 2. Add Edges (Linear for now, as per simplified v0 spec)
    workflow.add_edge(START, "process_input")
    workflow.add_edge("process_input", "planner")
    workflow.add_edge("planner", "limit_check")
    
    # Conditional Edge for limit_check
    def check_limits_condition(state: AgentState):
        if state.get("limits_ok", False):
            return "executor"
        return "finalize"

    workflow.add_conditional_edges(
        "limit_check",
        check_limits_condition,
        {
            "executor": "executor",
            "finalize": "finalize"
        }
    )

    workflow.add_edge("executor", "result_handler")
    workflow.add_edge("result_handler", "audit_logger")
    workflow.add_edge("audit_logger", "finalize")
    workflow.add_edge("finalize", END)

    return workflow.compile()

# Compile the graph
agent_executor = create_graph()
