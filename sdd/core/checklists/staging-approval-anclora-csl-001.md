# Staging Approval Checklist (Tickbox)

## Feature
- **ID**: `ANCLORA-CSL-001`
- **Name**: Currency & Surface Localization v1
- **Date**:
- **Validated by**:
- **Environment**: Staging

## Release Decision
- [ ] GO
- [ ] NO-GO

---

## A. Pre-checks
- [ ] Migrations aplicadas en staging sin error.
- [ ] Backend desplegado con último commit de CSL.
- [ ] Frontend desplegado con último commit de CSL.
- [ ] Variables de entorno correctas (frontend/backend apuntando al mismo entorno).

## B. DB Contract Validation
- [ ] Existen columnas en `properties`:
  - [ ] `useful_area_m2`
  - [ ] `built_area_m2`
  - [ ] `plot_area_m2`
- [ ] Constraint no-negativa valida.
- [ ] Constraint `useful_area_m2 <= built_area_m2` valida.
- [ ] Backfill desde `surface_m2` se ejecutó según lo esperado.

## C. API Functional Validation
- [ ] Crear propiedad vía API/UI con superficies válidas.
- [ ] Actualizar propiedad vía API/UI con superficies válidas.
- [ ] Intento inválido (`useful_area_m2 > built_area_m2`) devuelve error controlado.
- [ ] Respuesta API incluye campos de superficie esperados.

## D. Origin-Based Editability Rules
- [ ] Propiedad `manual`: campos comerciales editables.
- [ ] Propiedad `widget`: `source_system/source_portal/match_score` bloqueados.
- [ ] Propiedad `pbm`: `source_system/source_portal/match_score` bloqueados.
- [ ] `price/useful/built/plot` permanecen editables según spec.

## E. UI/UX Validation
- [ ] Formato moneda correcto (sin símbolos duplicados ni mojibake).
- [ ] Conversión y visualización de unidades de superficie correcta.
- [ ] No solape visual en cards de propiedades (título/estado/score).
- [ ] Sidebar render correcto (sin recorte de logo con toggle).
- [ ] Prospección carga datos sin necesidad de pinchar cada tab (si aplica en scope actual).

## F. Regression Checks
- [ ] Flujo de propiedades no se rompe.
- [ ] Flujo de prospección no se rompe.
- [ ] Flujo de contactos/equipo no se ve afectado por CSL.
- [ ] Auth/tenant isolation siguen correctos.

## G. Observations / Defects
- [ ] Sin defectos P0/P1.
- [ ] Defectos P2/P3 registrados y aceptados.

### Notes
- 

### Defect Log
1. 

---

## Final Sign-off
- **Decision**: [ ] GO  [ ] NO-GO
- **Approved by**:
- **Date/Time**:
- **Evidence links**:
  - 
