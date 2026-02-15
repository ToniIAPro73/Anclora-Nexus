# SHARED CONTEXT: Prospection & Buyer Matching v1

## Contexto de negocio
Anclora Nexus necesita aumentar cierres de alto ticket conectando oferta y demanda de forma trazable.

## Objetivo técnico común
Implementar captación de inmuebles + captación de compradores + engine de matching con score explicable.

## Reglas comunes
- Cumplir constitution y governance.
- Isolation por org_id.
- Score en rango [0,100] y con desglose.
- Registro de actividad comercial por vínculo.

## Definiciones
- `high_ticket_score`: calidad comercial del inmueble premium.
- `match_score`: ajuste comprador-propiedad.
- `score_breakdown`: evidencia de cálculo por factor.

