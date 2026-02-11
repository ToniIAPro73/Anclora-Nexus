
```markdown
---
name: frontend-bento
description: "Construir el dashboard Bento Grid con Next.js 15, glassmorphism, widgets en tiempo real, y WebSocket. Usar cuando se pida implementar frontend, dashboard, widgets, UI, o Bento Grid."
---

# Frontend Bento Grid Skill

## Contexto
Lee spec.md Seccion 18 (Frontend — Dashboard Bento Grid) completa.
Lee spec.md Seccion 17.2 (WebSocket API) para eventos real-time.

## Instrucciones

### Paso 1: Scaffolding
```bash
npx create-next-app@latest openclaw-frontend --typescript --tailwind --eslint --app --src-dir=false
cd openclaw-frontend
npx shadcn@latest init
npm install zustand framer-motion @supabase/supabase-js
```

### Paso 2: Estructura de componentes
Seguir spec.md Seccion 18.1. Crear componentes de widgets en `components/widgets/`.

### Paso 3: Bento Grid Layout
Implementar grid CSS 6x4 responsive (spec.md 18.2):
- Mobile: 1 columna
- Tablet: 2 columnas
- Desktop: 6 columnas

### Paso 4: Glassmorphism
Aplicar estilos de spec.md 18.4: background rgba(17,24,39,0.8), backdrop-filter blur(15px), border-radius 16px.

### Paso 5: Widgets
Implementar los 6 widgets de spec.md 18.3:
1. AgentThoughtStream (4x2) — WebSocket agent_state
2. MonetaryPulse (2x2) — Supabase Realtime approval_tickets
3. EfficiencySavings (2x1) — REST /analytics
4. SkillLab (2x2) — REST /skills
5. MemoryNavigator (2x1) — REST /memory/search
6. KillSwitch (1x1) — Boton rojo, confirmacion doble + MFA

### Paso 6: Auth
Integrar Supabase Auth con login, MFA setup, y protected routes.

### Paso 7: Estado global
Zustand store con slices: auth, agents, approvals, notifications.

## Criterios de Aceptacion
- Dashboard renderiza 6 widgets en layout correcto
- Glassmorphism visible en Chrome, Firefox, Safari
- WebSocket conecta y muestra agent_state en tiempo real
- MonetaryPulse muestra tickets pendientes con Approve/Reject
- KillSwitch requiere confirmacion doble
- Responsive: funciona en mobile/tablet/desktop
```
