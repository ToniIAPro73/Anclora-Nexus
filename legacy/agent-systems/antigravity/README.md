# Antigravity Legacy Agent System

Estado: DEPRECATED  
Fecha de deprecación: 2026-05-05

## Motivo

El flujo operativo del proyecto Anclora Nexus deja de usar `.antigravity` como ubicación activa de prompts y reglas de ejecución.

La ubicación canónica actual para prompts de agentes es `.agent/prompts/`.

## Regla vigente

No añadir nuevos prompts a `.antigravity`.

Todo nuevo prompt de ejecución por feature debe crearse en `.agent/prompts/features/<feature>/`.

## Motivo operativo

Antigravity no puede instalarse en el portátil corporativo actual. El flujo de trabajo se centraliza en VS Code, Codex/Gemini/Claude y la estructura `.agent`.

## Trazabilidad

Esta carpeta se conserva únicamente como histórico para evitar pérdida de contexto.
