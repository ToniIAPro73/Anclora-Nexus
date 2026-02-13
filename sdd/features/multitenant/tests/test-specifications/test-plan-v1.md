# TEST PLAN: MULTI-TENANT MEMBERSHIPS V1

**Versión**: 1.0  
**Fecha**: 2026-02-13  
**Scope**: Feature Multi-Tenant Memberships v1  
**Coverage Target**: Backend 85% | Frontend 85% | DB 100%

---

## 1. ESTRATEGIA TESTING GENERAL

### 1.1 Pirámide de Tests

```
        E2E Tests (10%)
       /|\
      / | \
     /  |  \  Integration Tests (30%)
    /   |   \
   /____|____\  Unit Tests (60%)
```

### 1.2 Test Types por Layer

| Layer | Test Type | Framework | Coverage |
|-------|-----------|-----------|----------|
| **Database** | Validation scripts | SQL + Python | 100% |
| **Backend API** | Unit + Integration | pytest | 85% |
| **Frontend** | Unit + Component | Vitest + Testing Lib | 85% |
| **E2E** | End-to-end flow | pytest (API) + manual | 100% |

---

## 2. DATABASE TESTING (100% Coverage)

### 2.1 Scope

- Migration 008: organization_members table creation
- Migration 009: organizations alterations
- Migration 010: Role migration script
- All indices created correctly
- All constraints enforced
- FK integrity maintained

---

## 3. BACKEND API TESTING (85% Coverage)

### 3.1 Scope

**Endpoints to test** (6 new + 5 modified):

**New:**
- POST `/api/organizations/{org_id}/members` (invite)
- GET `/api/organizations/{org_id}/members` (list)
- PATCH `/api/organizations/{org_id}/members/{member_id}` (change role)
- DELETE `/api/organizations/{org_id}/members/{member_id}` (remove)
- GET `/api/invitations/{code}` (validate)
- POST `/api/invitations/{code}/accept` (accept)

**Modified (org_id filtering):**
- GET `/api/leads`
- GET `/api/properties`
- GET `/api/tasks`
- POST `/api/leads`
- POST `/api/properties`

---

## 4. FRONTEND TESTING (85% Coverage)

### 4.1 Scope

**Components to test:**
- TeamManagement
- OrgContext
- useOrgMembership
- useTeamManagement
- RoleBasedUIShell
- InvitationAccept
- ProtectedRoute

---

## 5. TEST ENVIRONMENTS

| Environment | Purpose | Database |
|-------------|---------|----------|
| **Local** | Development testing | Supabase Local (Docker) |
| **Test** | Automated CI/CD | Test DB (ephemeral) |
| **Staging** | Pre-production validation | Staging DB |

---

## 6. SUCCESS CRITERIA

**Coverage**:
- Backend: 85%+
- Frontend: 85%+
- DB: 100%

**Functional**:
- All 6 endpoints return correct status codes
- Middleware validates org membership
- Roles enforced correctly
- Invitation flow works end-to-end
- Data isolation working

---

**Status**: Ready for testing  
**Next**: See test-cases-*.md files for detailed scenarios
