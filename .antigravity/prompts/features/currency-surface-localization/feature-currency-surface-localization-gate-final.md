# Release Gate Final - ANCLORA-CSL-001

## Resultado
**GO (Conditional -> GO tras validación manual en Staging)**

## Fecha
2026-02-15

## Evidencias

### Gate 1: Contrato DB/API
- Estado: ✅ PASS
- Evidencia:
  - `025_currency_surface_localization.sql` aplicada correctamente.
  - `026_currency_surface_localization_rollback.sql` validada.
  - Columnas `useful_area_m2`, `built_area_m2`, `plot_area_m2` creadas.
  - Checks no-negativos y `useful_area_m2 <= built_area_m2` activos.
  - Backfill desde `surface_m2` validado.
  - Rollback + re-migración (idempotencia) validado.

### Gate 2: Persistencia y lógica backend
- Estado: ⚠️ PARTIAL (lógica validada, integración bloqueada en entorno de test)
- Evidencia:
  - Tests de lógica y modelos OK (`test_csl_models.py`, `test_csl_service.py`).
  - Corrección en `ProspectionService`: tabla `prospected_properties -> properties`.
  - Bloqueador de entorno en `pyjuyaityvcrzfaetrdi`:
    - `PGRST204: Could not find 'properties' in schema cache`
    - Vista temporal accesible (`debug_properties_view`) confirma datos/permisos base correctos.

### Gate 3: Frontend/UI
- Estado: ✅ PASS
- Evidencia:
  - Formato de moneda y conversión de unidades validados.
  - Bloqueo de campos por origen corregido en `PropertyFormModal.tsx`:
    - Bloqueados: `source_system`, `source_portal`, `match_score`.
    - Editables: campos comerciales (`price`, superficies).

### Gate 4: Bloqueantes P0/P1
- Estado: ✅ NO BLOQUEANTES FUNCIONALES
- Nota:
  - Incidencia de PostgREST es **entorno-específica** (test instance), no regresión funcional de feature.

### Gate 5: Documentación
- Estado: ✅ PASS
- Evidencia:
  - Documentación de feature y prompts actualizados.

---

## Condición para GO definitivo
Ejecutar validación manual en Staging:
1. Crear propiedad vía UI/API.
2. Editar propiedad vía UI/API.
3. Verificar regla `useful_area_m2 <= built_area_m2`.
4. Verificar bloqueo de source fields en origen `widget/pbm`.
5. Verificar que `price/useful/built/plot` permanecen editables.

---

## Decisión final
- **GO condicionado aprobado.**
- Tras checklist manual en Staging: **GO definitivo a producción**.
