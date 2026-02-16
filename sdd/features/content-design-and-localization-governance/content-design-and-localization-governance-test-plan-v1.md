# ANCLORA-CDLG-001 — Test Plan v1

## QA Blocks
1. Environment validation:
- `.env` and `frontend/.env.local` aligned.
- no hardcoded external `project_ref`.

2. i18n validation:
- new/modified keys exist in `es`, `en`, `de`, `ru`.

3. Visual validation:
- typography consistency,
- lateral spacing consistency,
- no avoidable vertical scroll in target screens.

4. Navigation validation:
- sidebar/header remain usable with menu growth.

5. Button contract validation:
- creation actions use `btn-create`,
- non-creation actions use `btn-action`.

6. Hygiene validation:
- no temporary debug/test scripts remain.

## Exit
- GO only if no P0/P1 and all mandatory contracts pass.

