# Agent D - QA Prompt (ANCLORA-SPO-001)

Validate:
1) API contracts and deterministic responses.
2) Org/role scope behavior under positive and negative paths.
3) UI states and functional flows.
4) i18n compliance and absence of hardcoded text.
5) No open P0/P1 defects before gate.
6) Execute baseline checks:
   - `python -m pytest -q backend/tests/test_source_observatory_routes.py`
   - `python -m pytest -q backend/tests/test_deal_margin_routes.py`
   - `cd frontend; npm run -s lint`

Output:
- QA report with GO/NO-GO decision and blocker list.
