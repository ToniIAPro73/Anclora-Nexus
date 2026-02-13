# TEST CASES: INVITATION FLOW

**Scope**: Invitation lifecycle (create, validate, accept, expiry)  
**Test Count**: 18 scenarios  
**Framework**: pytest  
**Target Coverage**: 93%+

---

## CODE GENERATION

### Test IG.1: Code is unique and random
- 100 invitations created
- All unique, no collisions

### Test IG.2: Code format validation
- Length=32, alphanumeric only
- Matches regex [a-zA-Z0-9]{32}

### Test IG.3: Code stored in DB
- Record exists with status=pending

---

## VALIDATION

### Test IV.1: Valid code returns correct data
- 200 OK + valid=true, email, role, org_name, expires_at

### Test IV.2: Invalid code returns 404
- 404 Not Found

### Test IV.3: Expired code returns 410
- Code created 8 days ago
- 410 Gone

### Test IV.4: Already accepted returns 410
- Code status changed to active
- 410 Gone

---

## ACCEPTANCE

### Test IA.1: Valid code accepts successfully
- 200 OK + member_id, status=active

### Test IA.2: Acceptance updates status
- Status changed from pending to active
- invitation_accepted_at set

### Test IA.3: Duplicate user blocked
- 409 Conflict

### Test IA.4: Expired code rejected
- 410 Gone

### Test IA.5: Invalid code rejected
- 404 Not Found

---

## EXPIRY

### Test IE.1: 7-day expiry calculated correctly
- Created at 2026-02-13 10:00:00
- Expires at 2026-02-20 10:00:00

### Test IE.2: Expired codes cannot be accepted
- 410 Gone

### Test IE.3: Just-expired codes return 410
- Code expires in 1 second
- 410 Gone after expiry

---

## ERROR CASES

### Test IE.1: Missing code parameter
- 404 Not Found

### Test IE.2: Malformed code
- 400 Bad Request

### Test IE.3: Accept without user_id
- 422 Unprocessable Entity

---

**Coverage**: 18 tests = 93%+
