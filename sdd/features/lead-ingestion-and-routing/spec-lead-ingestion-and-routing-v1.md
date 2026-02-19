# Lead Ingestion and Routing v1 (ANCLORA-LIR-001)

## Objetivo
Unificar la entrada de contactos por múltiples orígenes y aplicar una política única de routing operativo.

## Orígenes Soportados
- `manual`
- `cta_web`
- `import`
- `referral`
- `partner`
- `social`

## Normalización Mínima
Todo lead entrante debe persistir:
- `source` (legacy)
- `source_system`
- `source_channel`
- `source_detail`
- `ingestion_mode`

## Política de Routing (v1)
Aplicable a leads nuevos, especialmente `source_system=cta_web`:
1. Seleccionar agente activo con menor carga abierta.
2. Si hay empate entre agentes, asignar al owner.
3. Si no hay agentes activos, asignar al owner.
4. Persistir la decisión en `leads.notes.routing`.

## Avisos de Aplicación (v1)
- Para `cta_web`, generar una tarea interna de aviso ligada al lead.
- Mantener trazabilidad mediante logs/audit existentes.

## Compatibilidad
- No requiere migraciones de esquema para v1.
- Se apoya en tablas existentes (`leads`, `tasks`, `organization_members`, `organizations`).
