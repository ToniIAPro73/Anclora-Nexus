# TEST CASES: MEMBERSHIP CRUD OPERATIONS

**Scope**: 6 new endpoints (invite, list, change role, remove, validate code, accept)  
**Test Count**: 32+ scenarios  
**Framework**: pytest  
**Target Coverage**: 85%+

---

## ENDPOINT 1: POST /api/organizations/{org_id}/members (Invite)

### Test 1.1: Happy Path - Owner invites Manager
```
Given: Owner authenticated, Manager email
When: POST /api/organizations/org-001/members
  { "email": "manager@test.com", "role": "manager" }
Then: 201 Created + invitation_code + status=pending
```

### Test 1.2: Error - Non-owner cannot invite
```
Given: Agent authenticated
When: POST /api/organizations/org-001/members
Then: 403 Forbidden
```

### Test 1.3: Error - Invalid role
```
Given: Owner authenticated
When: POST with role="superadmin"
Then: 422 Unprocessable Entity
```

### Test 1.4: Error - Duplicate membership
```
Given: Manager already in org
When: POST invite Manager again
Then: 409 Conflict
```

### Test 1.5: Edge - Invitation code is unique
```
Given: 2 invitations created
When: Compare invitation_codes
Then: Both unique, no duplicates
```

---

## ENDPOINT 2: GET /api/organizations/{org_id}/members (List)

### Test 2.1: Happy Path - Owner sees all members
```
Given: Owner authenticated
When: GET /api/organizations/org-001/members
Then: 200 OK + all members
```

### Test 2.2: Happy Path - Manager sees all members (read-only)
```
Given: Manager authenticated
When: GET /api/organizations/org-001/members
Then: 200 OK + all members
```

### Test 2.3: Error - Agent cannot list members
```
Given: Agent authenticated
When: GET /api/organizations/org-001/members
Then: 403 Forbidden
```

### Test 2.4: Edge - Pagination works
```
Given: 50 members in org
When: GET with limit=10
Then: 200 OK + first 10 + has_next=true
```

---

## ENDPOINT 3: PATCH /api/organizations/{org_id}/members/{member_id} (Change Role)

### Test 3.1: Happy Path - Owner changes Manager role
```
Given: Owner authenticated
When: PATCH role to "manager"
Then: 200 OK + role changed
```

### Test 3.2: Error - Non-owner cannot change role
```
Given: Manager authenticated
When: PATCH change role
Then: 403 Forbidden
```

### Test 3.3: Error - Cannot change to invalid role
```
Given: Owner authenticated
When: PATCH role="superadmin"
Then: 422 Unprocessable Entity
```

### Test 3.4: Edge - Cannot demote last owner
```
Given: Only 1 owner in org
When: Try change that owner to agent
Then: 409 Conflict
```

---

## ENDPOINT 4: DELETE /api/organizations/{org_id}/members/{member_id} (Remove)

### Test 4.1: Happy Path - Owner removes Agent
```
Given: Owner authenticated
When: DELETE /api/organizations/org-001/members/agent-id
Then: 204 No Content + member removed
```

### Test 4.2: Error - Agent cannot remove anyone
```
Given: Agent authenticated
When: DELETE another member
Then: 403 Forbidden
```

### Test 4.3: Edge - Cannot remove last owner
```
Given: Only 1 owner
When: DELETE that owner
Then: 409 Conflict
```

### Test 4.4: Edge - Owner can remove self if others exist
```
Given: 2 owners, current is owner
When: DELETE self
Then: 204 No Content + removed
```

---

## ENDPOINT 5: GET /api/invitations/{code} (Validate)

### Test 5.1: Happy Path - Code is valid
```
Given: Valid code, not expired
When: GET /api/invitations/abc123xyz
Then: 200 OK + valid=true, role, expires_at
```

### Test 5.2: Error - Code is invalid
```
Given: Non-existent code
When: GET /api/invitations/fake-code
Then: 404 Not Found
```

### Test 5.3: Error - Code is expired
```
Given: Code created 8 days ago (7-day expiry)
When: GET /api/invitations/expired-code
Then: 410 Gone
```

### Test 5.4: Edge - Code already used
```
Given: Code was accepted
When: GET /api/invitations/used-code
Then: 410 Gone
```

---

## ENDPOINT 6: POST /api/invitations/{code}/accept (Accept)

### Test 6.1: Happy Path - User accepts invitation
```
Given: Valid code
When: POST /api/invitations/abc123xyz/accept { "user_id": "..." }
Then: 200 OK + member created + status=active
```

### Test 6.2: Error - Invalid code
```
Given: Fake code
When: POST accept
Then: 404 Not Found
```

### Test 6.3: Error - Expired code
```
Given: Expired code (7+ days old)
When: POST accept
Then: 410 Gone
```

### Test 6.4: Error - User already member
```
Given: User already in org
When: POST accept
Then: 409 Conflict
```

### Test 6.5: Edge - Role from invitation is honored
```
Given: Invitation with role=manager
When: Accept invitation
Then: User created as manager (not agent)
```

---

**Coverage**: 32 tests = 90%+
**Next**: See test_membership_crud.py for implementation
