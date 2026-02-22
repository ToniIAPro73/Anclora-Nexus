name: multichannel-feed-orchestrator
description: Implementa publicacion multicanal XML/JSON con validacion previa, ejecucion controlada y panel operativo completo.
---

# Skill - Multichannel Feed Orchestrator

## Lecturas obligatorias
1) `sdd/core/constitution-canonical.md`
2) `sdd/features/multichannel-feed-orchestrator/multichannel-feed-orchestrator-INDEX.md`
3) `sdd/features/multichannel-feed-orchestrator/multichannel-feed-orchestrator-spec-v1.md`
4) `.agent/rules/feature-multichannel-feed-orchestrator.md`

## Instrucciones
- Implementar primero contratos API y servicio.
- Garantizar que validar/publicar sean acciones separadas y explícitas.
- Exponer una pantalla operacional completa, no MVP de pruebas.
- Mantener trazabilidad de runs y feedback claro al usuario.

## Stop rules
- No introducir conectores externos reales sin contrato seguro.
- No hacer scraping ni automatizaciones fuera del alcance de la feature.
