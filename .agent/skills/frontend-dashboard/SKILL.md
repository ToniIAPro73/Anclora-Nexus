```markdown
---
name: frontend-dashboard
description: "Construir dashboard Bento Grid premium con Next.js 15, design system Anclora Nexus (navy/gold/blue), glassmorphism avanzado, animaciones Framer Motion, y efectos visuales de lujo. Usar cuando se pida implementar frontend, dashboard, widgets, UI, Bento Grid, o diseño visual."
---

# Frontend Dashboard — Anclora Nexus v0

## Contexto
Lee spec.md Sección 18 para la base Bento Grid.
Lee product-spec-v0.md Sección 3.2 para los 6 widgets específicos Anclora.
Lee ESTE SKILL COMPLETO para el design system obligatorio y efectos premium.

## DESIGN SYSTEM ANCLORA NEXUS (OBLIGATORIO)

### Identidad Visual
Anclora Nexus es la capa tecnológica de Anclora Cognitive Solutions.
El dashboard debe transmitir: LUJO TECNOLÓGICO — la intersección entre
sofisticación inmobiliaria ultra-high-end y potencia de IA.

Inspiración visual: Bloomberg Terminal meets luxury yacht cockpit.
Estética: dark, limpia, con acentos gold y blue que recuerdan al mar
Mediterráneo y la exclusividad.

### Paleta de Colores (EXACTA — no modificar hexadecimales)

| Token | Hex | Uso |
|-------|-----|-----|
| Navy Deep | `#192350` | Fondo principal, superficies base |
| Navy Darker | `#0F1629` | Fondo extremo, gradientes profundos |
| Navy Mid | `#1A2A5C` | Superficies elevadas, sidebar |
| Blue Light | `#AFD2FA` | Acentos tecnológicos, glows, links |
| Blue Glow | `rgba(175,210,250,0.15)` | Halos, efectos de resplandor |
| Blue Muted | `#7BA3D4` | Texto secundario, iconos inactivos |
| Gold | `#D4AF37` | Acento premium, CTAs, bordes highlight, badges |
| Gold Muted | `#B8962E` | Gold en hover/active |
| Gold Glow | `rgba(212,175,55,0.20)` | Halo gold para elementos premium |
| White Soft | `#F5F5F0` | Texto principal |
| White Muted | `rgba(245,245,240,0.6)` | Texto secundario |
| White Subtle | `rgba(245,245,240,0.08)` | Bordes de widgets, separadores |
| Success | `#38A169` | Estados positivos, leads ganados |
| Warning | `#D69E2E` | Alertas, tareas próximas a vencer |
| Danger | `#E53E3E` | Errores, leads perdidos, urgencia máxima |

### Tipografía

```bash
npm install @fontsource/inter @fontsource/playfair-display
```

| Uso | Font | Weight | Tracking |
|-----|------|--------|----------|
| Headings de página | Playfair Display | 600 | -0.02em |
| Títulos de widgets | Inter | 600 | -0.01em |
| Body / datos | Inter | 400 | 0 |
| Números / métricas | Inter | 700 tabular-nums | -0.02em |
| Labels / captions | Inter | 500 uppercase | 0.05em |

Playfair Display aporta el toque de lujo editorial (serif elegante).
Inter aporta la legibilidad técnica (sans-serif, tabular figures para datos).

### Iconos

```bash
npm install lucide-react
```

Usar exclusivamente Lucide React (línea fina, consistente con estética minimal).
NO usar emojis como iconos en el dashboard. Usar emojis SOLO en mensajes de
notificación o contextos informales.

## Instrucciones

### Paso 1: Scaffolding

```bash
cd frontend
npx create-next-app@latest . --typescript --tailwind --eslint --app
npx shadcn@latest init
npm install zustand @supabase/supabase-js framer-motion
npm install @fontsource/inter @fontsource/playfair-display lucide-react
npm install clsx tailwind-merge tailwindcss-animate
```

### Paso 2: Estructura

```
frontend/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx            # Login premium con logo animado
│   ├── dashboard/
│   │   └── page.tsx                  # Bento Grid 6 widgets
│   ├── leads/
│   │   ├── page.tsx                  # Lista leads
│   │   └── [id]/page.tsx             # Detalle lead
│   ├── properties/
│   │   └── page.tsx                  # Lista propiedades
│   ├── tasks/
│   │   └── page.tsx                  # Lista tareas
│   ├── globals.css                   # Estilos globales + design tokens
│   ├── layout.tsx                    # Root layout con fonts
│   └── page.tsx                      # Redirect a /dashboard
├── components/
│   ├── widgets/
│   │   ├── LeadsPulse.tsx            # 4x2 — leads con prioridad
│   │   ├── TasksToday.tsx            # 2x2 — tareas pendientes hoy
│   │   ├── PropertyPipeline.tsx      # 2x2 — kanban propiedades
│   │   ├── QuickStats.tsx            # 2x1 — métricas animadas
│   │   ├── AgentStream.tsx           # 2x1 — stream IA con typing effect
│   │   └── QuickActions.tsx          # 2x1 — botones con ripple
│   ├── ui/                           # shadcn components (dark theme override)
│   ├── layout/
│   │   ├── Sidebar.tsx               # Nav lateral con logo
│   │   ├── Header.tsx                # Top bar con greeting + status
│   │   └── BentoGrid.tsx             # Grid container reutilizable
│   ├── effects/
│   │   ├── GoldShimmer.tsx           # Efecto shimmer gold en bordes
│   │   ├── PulseOrb.tsx              # Orbe animado para status
│   │   ├── CountUp.tsx               # Contador animado para métricas
│   │   ├── TypeWriter.tsx            # Efecto máquina de escribir IA
│   │   └── StaggerList.tsx           # Entrada secuencial de listas
│   └── brand/
│       ├── Logo.tsx                  # Logo SVG/PNG responsive
│       └── Badge.tsx                 # Badge de prioridad con glow
├── lib/
│   ├── supabase.ts                   # Client + Realtime subscriptions
│   ├── store.ts                      # Zustand slices
│   ├── types.ts                      # TypeScript interfaces
│   ├── api.ts                        # Fetch wrappers a backend
│   └── cn.ts                         # clsx + tailwind-merge helper
├── public/
│   ├── brand/
│   │   ├── logo-nexus.png            # Logo principal
│   │   └── favicon.png               # Favicon
│   └── og-image.png                  # Open Graph (optional)
└── tailwind.config.ts                # Extended con design tokens
```

### Paso 3: Tailwind Config con Design Tokens

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          deep: '#192350',
          darker: '#0F1629',
          mid: '#1A2A5C',
          surface: 'rgba(25, 35, 80, 0.8)',
          hover: 'rgba(25, 35, 80, 0.95)',
        },
        blue: {
          light: '#AFD2FA',
          glow: 'rgba(175, 210, 250, 0.15)',
          muted: '#7BA3D4',
        },
        gold: {
          DEFAULT: '#D4AF37',
          muted: '#B8962E',
          glow: 'rgba(212, 175, 55, 0.20)',
        },
        soft: {
          white: '#F5F5F0',
          muted: 'rgba(245, 245, 240, 0.6)',
          subtle: 'rgba(245, 245, 240, 0.08)',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        widget: '16px',
        'widget-inner': '12px',
      },
      backdropBlur: {
        widget: '20px',
      },
      boxShadow: {
        widget: '0 4px 24px rgba(0, 0, 0, 0.2)',
        'widget-hover': '0 8px 40px rgba(0, 0, 0, 0.35)',
        'gold-glow': '0 0 20px rgba(212, 175, 55, 0.15)',
        'blue-glow': '0 0 20px rgba(175, 210, 250, 0.12)',
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      },
      animation: {
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(212, 175, 55, 0.10)' },
          '50%': { boxShadow: '0 0 25px rgba(212, 175, 55, 0.25)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
```

### Paso 4: Globals CSS

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@import '@fontsource/inter/400.css';
@import '@fontsource/inter/500.css';
@import '@fontsource/inter/600.css';
@import '@fontsource/inter/700.css';
@import '@fontsource/playfair-display/600.css';

@layer base {
  body {
    @apply bg-navy-darker text-soft-white antialiased;
    background: linear-gradient(135deg, #0F1629 0%, #192350 50%, #1A2A5C 100%);
    background-attachment: fixed;
  }

  /* Scrollbar premium */
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: rgba(175, 210, 250, 0.2);
    border-radius: 3px;
  }
  ::-webkit-scrollbar-thumb:hover { background: rgba(175, 210, 250, 0.35); }

  /* Selection */
  ::selection { background: rgba(212, 175, 55, 0.3); color: #F5F5F0; }
}

@layer components {
  /* ─── Widget Card Base ─── */
  .widget-card {
    @apply relative overflow-hidden;
    background: rgba(25, 35, 80, 0.6);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(245, 245, 240, 0.06);
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow:
      0 4px 24px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.04);
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .widget-card:hover {
    border-color: rgba(245, 245, 240, 0.12);
    box-shadow:
      0 8px 40px rgba(0, 0, 0, 0.35),
      inset 0 1px 0 rgba(255, 255, 255, 0.06);
    transform: translateY(-2px);
  }

  /* ─── Gold Shimmer Border (top edge on hover) ─── */
  .widget-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(
      90deg, transparent 0%, rgba(212,175,55,0.0) 20%,
      rgba(212,175,55,0.4) 50%, rgba(212,175,55,0.0) 80%, transparent 100%
    );
    opacity: 0;
    transition: opacity 0.4s ease;
  }
  .widget-card:hover::before { opacity: 1; }

  /* ─── Widget con acento Gold ─── */
  .widget-card-gold {
    @apply widget-card;
    border-color: rgba(212, 175, 55, 0.15);
  }
  .widget-card-gold:hover {
    border-color: rgba(212, 175, 55, 0.35);
    box-shadow: 0 8px 40px rgba(0,0,0,0.35), 0 0 20px rgba(212,175,55,0.10);
  }

  /* ─── Typography ─── */
  .widget-title {
    @apply text-sm font-semibold uppercase tracking-widest;
    color: rgba(175, 210, 250, 0.7);
    letter-spacing: 0.08em;
    margin-bottom: 1rem;
  }
  .metric-value {
    @apply font-sans font-bold tabular-nums;
    font-size: 2.25rem; line-height: 1;
    color: #F5F5F0; letter-spacing: -0.02em;
  }

  /* ─── Priority Badges ─── */
  .priority-badge {
    @apply inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold;
  }
  .priority-5 { @apply bg-red-500/20 text-red-400; box-shadow: 0 0 8px rgba(239,68,68,0.25); }
  .priority-4 { @apply bg-gold/20 text-gold; box-shadow: 0 0 8px rgba(212,175,55,0.2); }
  .priority-3 { @apply bg-blue-light/20 text-blue-light; }
  .priority-2 { @apply bg-soft-muted/20 text-soft-muted; }
  .priority-1 { @apply bg-soft-subtle text-soft-muted; }

  /* ─── Status Dots ─── */
  .status-dot-active {
    @apply w-2 h-2 rounded-full bg-emerald-400;
    box-shadow: 0 0 8px rgba(52, 211, 153, 0.5);
  }

  /* ─── Sidebar ─── */
  .sidebar {
    background: rgba(15, 22, 41, 0.95);
    backdrop-filter: blur(20px);
    border-right: 1px solid rgba(245, 245, 240, 0.04);
  }
  .sidebar-link {
    @apply flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium
           text-soft-muted transition-all duration-200;
  }
  .sidebar-link:hover { @apply text-soft-white bg-navy-surface; }
  .sidebar-link-active { @apply text-gold bg-gold-glow; }
}
```

### Paso 5: Componentes de Efectos Premium

#### 5.1 GoldShimmer — borde shimmer dorado en hover
```tsx
// components/effects/GoldShimmer.tsx
'use client'
import { motion } from 'framer-motion'

export function GoldShimmer({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={`relative group ${className}`}
      whileHover={{ scale: 1.005 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="absolute -inset-[1px] rounded-widget opacity-0 group-hover:opacity-100
                      transition-opacity duration-700 pointer-events-none"
           style={{
             background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.15), transparent)',
             backgroundSize: '200% 100%',
             animation: 'shimmer 3s ease-in-out infinite',
           }} />
      {children}
    </motion.div>
  )
}
```

#### 5.2 CountUp — métricas con conteo animado
```tsx
// components/effects/CountUp.tsx
'use client'
import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

export function CountUp({
  target, duration = 1200, prefix = '', suffix = '', className = 'metric-value',
}: {
  target: number; duration?: number; prefix?: string; suffix?: string; className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!isInView) return
    const start = performance.now()
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [isInView, target, duration])

  return <span ref={ref} className={className}>{prefix}{value.toLocaleString('es-ES')}{suffix}</span>
}
```

#### 5.3 TypeWriter — efecto escritura IA para AgentStream
```tsx
// components/effects/TypeWriter.tsx
'use client'
import { useEffect, useState } from 'react'

export function TypeWriter({
  text, speed = 25, className = '', onComplete,
}: {
  text: string; speed?: number; className?: string; onComplete?: () => void
}) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDisplayed(''); setDone(false)
    let i = 0
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1)); i++
      if (i >= text.length) { clearInterval(interval); setDone(true); onComplete?.() }
    }, speed)
    return () => clearInterval(interval)
  }, [text, speed, onComplete])

  return (
    <span className={className}>
      {displayed}
      {!done && <span className="inline-block w-[2px] h-[1em] bg-gold ml-0.5 animate-pulse align-middle" />}
    </span>
  )
}
```

#### 5.4 PulseOrb — indicador de estado con glow
```tsx
// components/effects/PulseOrb.tsx
'use client'
import { motion } from 'framer-motion'

export function PulseOrb({ status = 'active', size = 8 }: {
  status?: 'active' | 'processing' | 'error' | 'idle'; size?: number
}) {
  const colors = {
    active:     { bg: '#34D399', glow: 'rgba(52,211,153,0.4)' },
    processing: { bg: '#D4AF37', glow: 'rgba(212,175,55,0.4)' },
    error:      { bg: '#E53E3E', glow: 'rgba(229,62,62,0.4)' },
    idle:       { bg: 'rgba(245,245,240,0.3)', glow: 'transparent' },
  }
  const { bg, glow } = colors[status]

  return (
    <span className="relative inline-flex" style={{ width: size * 2, height: size * 2 }}>
      {status !== 'idle' && (
        <motion.span className="absolute inset-0 rounded-full" style={{ background: glow }}
          animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} />
      )}
      <span className="relative inline-flex rounded-full"
            style={{ width: size, height: size, background: bg, margin: 'auto' }} />
    </span>
  )
}
```

#### 5.5 StaggerList — entrada secuencial de elementos
```tsx
// components/effects/StaggerList.tsx
'use client'
import { motion } from 'framer-motion'

export function StaggerList({ children, delay = 0.06, className = '' }: {
  children: React.ReactNode; delay?: number; className?: string
}) {
  return (
    <motion.div className={className} initial="hidden" animate="visible"
      variants={{ visible: { transition: { staggerChildren: delay } } }}>
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={{
      hidden: { opacity: 0, y: 8 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
    }}>
      {children}
    </motion.div>
  )
}
```

### Paso 6: Bento Grid Layout

Grid 6 columnas responsive:
- Mobile (<768px): 1 columna
- Tablet (768-1024px): 2 columnas
- Desktop (>1024px): 6 columnas

```
┌────────────────────────┬────────────┐
│   LeadsPulse           │ TasksToday │
│   (col-span-4, row-2) │ (span-2,2) │
│                        │            │
├────────────┬───────────┼────────────┤
│ Property   │ QuickStats│ AgentStream│
│ Pipeline   │ (span-2,1)│ (span-2,1) │
│ (span-2,2) ├───────────┴────────────┤
│            │ QuickActions (span-4,1) │
└────────────┴─────────────────────────┘
```

```tsx
// components/layout/BentoGrid.tsx
'use client'
import { motion } from 'framer-motion'

export function BentoGrid({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4 p-4 xl:p-6"
      initial="hidden" animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.08 } } }}>
      {children}
    </motion.div>
  )
}

export function BentoCell({ children, colSpan = 1, rowSpan = 1, className = '' }: {
  children: React.ReactNode; colSpan?: number; rowSpan?: number; className?: string
}) {
  const colClass = { 1: 'xl:col-span-1', 2: 'xl:col-span-2', 3: 'xl:col-span-3', 4: 'xl:col-span-4' }
  const rowClass = { 1: '', 2: 'xl:row-span-2' }
  return (
    <motion.div
      className={`col-span-1 md:col-span-${Math.min(colSpan, 2)} ${colClass[colSpan as keyof typeof colClass] || ''} ${rowClass[rowSpan as keyof typeof rowClass] || ''} ${className}`}
      variants={{
        hidden: { opacity: 0, y: 16, scale: 0.98 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
      }}>
      {children}
    </motion.div>
  )
}
```

### Paso 7: Widget Specifications (comportamiento visual por widget)

Cada widget aplica `.widget-card` + efectos específicos:

**LeadsPulse (4×2):**
- Tabla: Nombre, Presupuesto, Prioridad, Fuente, Status, Fecha
- Priority badge con glow por nivel (5=rojo pulsante, 4=gold shimmer, 3=blue)
- Nuevos leads entran con `slideUp` animation (Framer Motion)
- Header: PulseOrb verde + "LIVE" para indicar Realtime activo
- Row hover: borde izquierdo ilumina con color de prioridad del lead

**TasksToday (2×2):**
- Lista checkbox + título + due_time
- Checkbox: transición suave, gold tick al completar
- Tareas vencidas: text-danger + PulseOrb rojo
- Al completar: strikethrough animado + fade a soft-muted

**PropertyPipeline (2×2):**
- Mini kanban horizontal: 4 columnas (prospect, listed, offer, sold)
- Cada propiedad: card mínima con precio (CountUp) y tipo
- Columna "sold": badge gold con shimmer
- Transición entre columnas: Framer Motion layoutId

**QuickStats (2×1):**
- 3 métricas en fila: Leads/semana, Tasa respuesta, Mandatos activos
- Valores: CountUp animation al entrar en viewport
- Trend: flecha verde ↑ / roja ↓ con delta % vs semana anterior
- Números: metric-value class (Inter 700, 2.25rem, tabular-nums)

**AgentStream (2×1):**
- Últimas 5 ejecuciones IA cronológicas
- Última entrada: TypeWriter effect activo (simulando razonamiento IA)
- Previas: texto completo sin animación
- Cada entrada: PulseOrb(status) + agent name + summary
- Timestamps en text-xs text-soft-muted

**QuickActions (4×1 desktop, full mobile):**
- 3 botones: "Nuevo Lead", "Ejecutar Prospección", "Generar Recap"
- Estilo: widget-card-gold con icono Lucide + label
- Hover: gold-glow shadow + scale(1.02) con spring animation
- Click: ripple dorado (CSS radial-gradient animado desde punto de click)
- Loading: spinner gold rotativo reemplaza icono durante ejecución

### Paso 8: Login Page

Especificación visual de `app/(auth)/login/page.tsx`:

- Fondo: gradiente navy-darker → navy-deep con background-attachment fixed
- Centro: Card glassmorphism (widget-card, max-w-md) conteniendo:
  - Logo `public/brand/logo-nexus.png` a 80×80px con float animation sutil
  - "Anclora Nexus" en font-display text-2xl text-soft-white
  - "Private Estate Intelligence" en text-xs uppercase tracking-[0.2em] text-soft-muted
  - Separator: línea 1px gradiente gold (transparent→gold→transparent) 60% width
  - Input email: bg-navy-surface, border soft-subtle, focus border-gold shadow-gold-glow
  - Botón "Acceder": bg-gold text-navy-darker font-semibold rounded-widget-inner, hover bg-gold-muted
  - "Powered by OpenClaw" en text-xs text-soft-muted mt-8
- Fondo sutil: 12-15 partículas flotantes (divs 2-4px, blue-light opacity 0.04)
  con float animation (distintas duraciones 5-8s). Solo framer-motion divs, NO canvas/WebGL.

### Paso 9: Supabase Realtime

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export function subscribeToLeads(cb: (p: any) => void) {
  return supabase.channel('leads-rt')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, cb)
    .subscribe()
}

export function subscribeToAgentLogs(cb: (p: any) => void) {
  return supabase.channel('logs-rt')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'agent_logs' }, cb)
    .subscribe()
}

export function subscribeToTasks(cb: (p: any) => void) {
  return supabase.channel('tasks-rt')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, cb)
    .subscribe()
}

export default supabase
```

### Paso 10: Zustand Store

```typescript
// lib/store.ts
import { create } from 'zustand'
import type { Lead, Task, Property, AgentLog, DashboardStats } from './types'

interface AppState {
  leads: Lead[]; tasks: Task[]; properties: Property[]
  agentLogs: AgentLog[]; stats: DashboardStats
  sidebarOpen: boolean

  setLeads: (l: Lead[]) => void
  addLead: (l: Lead) => void
  updateLead: (id: string, d: Partial<Lead>) => void
  setTasks: (t: Task[]) => void
  toggleTask: (id: string) => void
  setProperties: (p: Property[]) => void
  addAgentLog: (l: AgentLog) => void
  setStats: (s: DashboardStats) => void
  toggleSidebar: () => void
}

export const useStore = create<AppState>((set) => ({
  leads: [], tasks: [], properties: [], agentLogs: [],
  stats: { leadsThisWeek: 0, responseRate: 0, activeMandates: 0 },
  sidebarOpen: true,

  setLeads: (leads) => set({ leads }),
  addLead: (lead) => set((s) => ({ leads: [lead, ...s.leads] })),
  updateLead: (id, data) => set((s) => ({
    leads: s.leads.map((l) => l.id === id ? { ...l, ...data } : l)
  })),
  setTasks: (tasks) => set({ tasks }),
  toggleTask: (id) => set((s) => ({
    tasks: s.tasks.map((t) => t.id === id
      ? { ...t, status: t.status === 'done' ? 'pending' : 'done' } : t)
  })),
  setProperties: (properties) => set({ properties }),
  addAgentLog: (log) => set((s) => ({ agentLogs: [log, ...s.agentLogs].slice(0, 20) })),
  setStats: (stats) => set({ stats }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}))
```

### Paso 11: Auth Supabase
- Login magic link (email) en /login
- Middleware protege todas las rutas excepto /login y /contact
- Redirect a /dashboard post-login
- Session persistence con Supabase auth helpers para Next.js

## Criterios de Aceptación Visual

- [ ] Paleta EXACTA: #192350, #AFD2FA, #D4AF37, #F5F5F0 (verificar con color picker)
- [ ] Glassmorphism: backdrop-filter blur(20px), bordes sutiles, visible en Chrome/Firefox/Safari
- [ ] Gold shimmer: aparece en top-edge de widgets al hover
- [ ] CountUp: métricas animan de 0 a valor al entrar en viewport
- [ ] TypeWriter: cursor gold parpadeante en AgentStream última entrada
- [ ] PulseOrb: glow pulse correcto por status (verde/gold/rojo/gris)
- [ ] Priority badges: glow de color por nivel (5=red, 4=gold, 3=blue)
- [ ] Stagger: widgets entran secuencialmente al cargar dashboard (0.08s delay)
- [ ] Login: logo con float, partículas sutiles, input focus gold
- [ ] Scrollbar: thin 6px, blue-muted, transparente al idle
- [ ] Dark theme 100% — CERO elementos blancos por defecto de shadcn sin override
- [ ] Font Playfair Display en headings de página, Inter en todo lo demás
- [ ] Responsive: mobile 1col, tablet 2col, desktop 6col grid
- [ ] Realtime: leads nuevos entran con slideUp animation
- [ ] QuickActions: ripple gold al click, spinner gold durante ejecución
- [ ] 60fps en todas las animaciones (verificar Chrome DevTools Performance)

## Anti-Patterns (NO hacer)

- NO usar colores default de shadcn/Tailwind sin override (grises genéricos).
- NO bordes blancos sólidos. Siempre soft-subtle (opacity 0.04-0.12).
- NO sombras negras duras. Siempre difuminadas con spread amplio.
- NO más de 2 animaciones simultáneas por widget (sobrecarga visual).
- NO gradientes de colores fuera de la paleta.
- NO border-radius < 12px en cards ni > 20px.
- NO font-weight < 400 en dark theme.
- NO emojis como iconos en UI. Solo Lucide React.
- NO background-color sólido en widgets. Siempre rgba con backdrop-filter.
```