# Document Template Library — QA & Smoke Tests

## Automated Tests

| File | Tests | Coverage |
|------|-------|---------|
| `test_dms_generation_service.py` | 11 | `render_template`, `generate_from_template`, placeholder detection |
| `test_dms_legal_review_validator.py` | 5 | `validate_legal_document` — happy path, canonical template, safe failure |
| `test_dms_template_library.py` | 7 | Template CRUD routes — list, create, get, publish, deprecate, versions |

Run locally (pure-function tests only):

```bash
python3 -m pytest backend/tests/test_dms_generation_service.py backend/tests/test_dms_legal_review_validator.py -v
```

Run full suite (CI / Render with full deps):

```bash
python3 -m pytest backend/tests/test_dms_*.py -v
```

---

## Smoke Tests — curl

Replace `$TOKEN` and `$ORG` with real values. All requests proxied via Next.js (`/api/*`).

### 1. List templates

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/dms/templates/ | jq length
```

### 2. Create a draft template

```bash
curl -s -X POST http://localhost:3000/api/dms/templates/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Arras Prueba",
    "template_document_type": "arras_penitenciales",
    "jurisdiction": "España"
  }' | jq '{id,status}'
# Expected: {"id":"...","status":"draft"}
```

### 3. Upload a template version (.txt)

```bash
curl -s -X POST http://localhost:3000/api/dms/templates/$TEMPLATE_ID/versions \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/arras.txt;type=text/plain" \
  -F "change_summary=Versión inicial" | jq '{id,version_number}'
# Expected: {"id":"...","version_number":1}
```

### 4. Define a field

```bash
curl -s -X POST http://localhost:3000/api/dms/templates/$TEMPLATE_ID/versions/$VERSION_ID/fields \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "field_key": "buyer_name",
    "label": "Nombre del comprador",
    "field_type": "text",
    "required": true
  }' | jq '{id,field_key}'
```

### 5. Generate a document

```bash
curl -s -X POST http://localhost:3000/api/dms/folders/$FOLDER_ID/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "template_version_id": "'$VERSION_ID'",
    "title": "Arras Ana Pérez",
    "generation_payload": {
      "buyer_name": "Ana Pérez",
      "sale_price": "250.000 EUR",
      "arras_amount": "25.000 EUR"
    }
  }' | jq '{id,status}'
# Expected: {"id":"...","status":"draft"}
```

### 6. Trigger auto legal review

```bash
curl -s -X POST http://localhost:3000/api/dms/generated/$DOC_ID/review/auto \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "document_text": "Contrato de arras...",
    "document_type": "arras_penitenciales"
  }' | jq '{status,risk_level,block_signing}'
```

### 7. Add a party

```bash
curl -s -X POST http://localhost:3000/api/dms/folders/$FOLDER_ID/parties \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "party_role": "buyer",
    "full_name": "Ana Pérez García",
    "dni_nie_passport": "12345678A",
    "email": "ana@example.com",
    "nationality": "española"
  }' | jq '{id,full_name,kyc_verified}'
```

### 8. Get effective retention policy

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/dms/retention/effective?document_type=arras_penitenciales" | jq .
# Expected: {retention_days:2555, auto_archive:true, auto_delete:false}
```

### 9. Text diff between versions

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/dms/generated/$DOC_ID/versions/diff?from_version=1&to_version=2" \
  | jq '{lines_changed, from_version, to_version}'
```

---

## Edge Case Checklist

| Scenario | Expected behavior |
|----------|------------------|
| Generate with unfilled `{{field}}` | 422 — lists unfilled placeholders |
| Generate with `[NOMBRE]` bracket placeholder | 422 — placeholder detected |
| Publish already-deprecated template | 400 |
| Add version to deprecated template | 400 |
| Add fields to immutable version | 400 |
| Upload new version of signed document | 400 |
| Change status of signed document | 400 |
| Retention policy with `auto_delete: true` | 400 — disabled |
| Retention policy under 365 days | 400 |
| Advisor AI unavailable during auto review | `review_required`, `block_signing: false` |
| Advisor AI returns critical risk | `block_signing: true`, document → `review_required` |
| Global template — modify from another org | 403 |
| Template not found for org | 404 |
