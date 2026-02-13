# TEST CASES: ROLE-BASED ACCESS CONTROL

**Scope**: Owner/Manager/Agent role validation  
**Test Count**: 17 scenarios  
**Framework**: pytest  
**Target Coverage**: 90%+

---

## OWNER TESTS

### Test O.1: Owner can invite all roles
- Invite as owner, manager, agent
- All succeed with 201

### Test O.2: Owner can change roles
- Change manager to agent
- 200 OK + role updated

### Test O.3: Owner cannot demote self if only owner
- Only 1 owner in org
- 409 Conflict

### Test O.4: Owner sees all org data
- Owner has full access to all leads/properties/tasks
- 200 OK + all data visible

---

## MANAGER TESTS

### Test M.1: Manager cannot invite
- 403 Forbidden

### Test M.2: Manager cannot change roles
- 403 Forbidden

### Test M.3: Manager sees all members (read-only)
- 200 OK + no edit options

### Test M.4: Manager sees all org data
- 200 OK + all data visible

### Test M.5: Manager can edit leads
- 200 OK + updated

---

## AGENT TESTS

### Test A.1: Agent cannot see team members
- 403 Forbidden

### Test A.2: Agent sees only assigned leads
- 3 assigned, 5 total
- 200 OK + 3 leads (assigned only)

### Test A.3: Agent cannot see other agent's leads
- 403 Forbidden

### Test A.4: Agent can create tasks (limited)
- 201 Created

### Test A.5: Agent cannot create leads
- 403 Forbidden

---

## MIDDLEWARE VALIDATION

### Test MW.1: Non-member blocked
- 403 Forbidden

### Test MW.2: Middleware validates required role
- 403 Forbidden for insufficient role

### Test MW.3: Middleware blocks suspended member
- 403 Forbidden for suspended status

---

**Coverage**: 17 tests = 94%+
