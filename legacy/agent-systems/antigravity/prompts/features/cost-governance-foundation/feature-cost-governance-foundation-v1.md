PROMPT: Orquesta implementacion completa de `ANCLORA-CGF-001` en modo controlado.

PASOS:
1) Ejecutar Agent A (DB) y detener.
2) Revisar diff/contrato.
3) Ejecutar Agent B (Backend) y Agent C (Frontend) en paralelo.
4) Ejecutar Agent D (QA).
5) Ejecutar gate final.

REGLAS:
- No saltar orden.
- Cada agente para al completar su alcance.
- 1 prompt = 1 commit.
