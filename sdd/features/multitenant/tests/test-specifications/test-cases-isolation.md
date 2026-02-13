# TEST CASES: DATA ISOLATION & FK INTEGRITY

**Scope**: org_id filtering, FK constraints, orphaned records  
**Test Count**: 21 scenarios  
**Framework**: pytest  
**Target Coverage**: 100%+

---

## DATA ISOLATION

### Test DI.1: Owner sees only own org data
- Owner A in org-001, Owner B in org-002
- Owner A GETs only org-001 data

### Test DI.2: Agent sees only assigned data
- 2 assigned, 5 total
- Agent sees 2 only

### Test DI.3: Cross-org access blocked
- 403 Forbidden

---

## FK INTEGRITY

### Test FK.1: organization_members references valid organizations
- org_id exists in organizations

### Test FK.2: organization_members references valid users
- user_id exists in auth.users

### Test FK.3: invited_by references valid user
- invited_by exists or is NULL

### Test FK.4: Cascade delete organization removes members
- Org deleted → all members deleted

### Test FK.5: Cascade delete user removes membership
- User deleted → membership deleted

---

## ORPHANED RECORDS

### Test OR.1: No users without org
- Query WHERE org_id IS NULL
- Count = 0

### Test OR.2: No members with invalid org_id
- No orphaned org_id references

### Test OR.3: No members with invalid user_id
- No orphaned user_id references

---

## CONSTRAINT VALIDATION

### Test CV.1: UNIQUE(org_id, user_id) enforced
- Duplicate insert fails

### Test CV.2: Role enum validated
- Invalid role fails

### Test CV.3: Status enum validated
- Invalid status fails

### Test CV.4: invitation_code UNIQUE
- Duplicate code fails

---

## ORG_ID FILTERING

### Test OF.1: GET leads filters by org_id
- Org A has 3, Org B has 2
- User in both sees only org A

### Test OF.2: POST leads creates with org_id
- Lead created with correct org_id

### Test OF.3: Agent filtering + org filtering
- 2 assigned of 5 total in org
- Agent sees 2 only

---

## ROLE-BASED FILTERING

### Test RF.1: Agent sees only assigned
- 2 of 5 leads
- Agent sees 2

### Test RF.2: Manager sees all org data
- 5 leads
- Manager sees 5

### Test RF.3: Owner sees all org data
- 5 leads
- Owner sees 5

---

**Coverage**: 21 tests = 99%+
