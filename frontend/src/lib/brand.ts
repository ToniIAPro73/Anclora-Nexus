export const NEXUS_BRAND = {
  name: 'Anclora Nexus',
  subtitle: 'Capa operativa interna de Anclora para pipeline, relaciones y coordinacion comercial.',
  defaultLanguage: 'es',
  supportedLanguages: ['es', 'en', 'de', 'ru'] as const,
  assets: {
    logoPrimary: '/brand/logo-nexus-v1.png',
    logoFallback: '/brand/logo-nexus.png',
    favicon: '/favicon.png',
  },
  theme: {
    mode: 'dark',
    cssVars: {
      '--brand-font-display': '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      '--brand-font-sans': '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      '--brand-font-mono': '"JetBrains Mono", "SFMono-Regular", Consolas, monospace',
      '--brand-background': '#0F1629',
      '--brand-background-elevated': '#192350',
      '--brand-background-muted': '#141C3A',
      '--brand-foreground': '#F5F5F0',
      '--brand-accent': '#AFD2FA',
      '--brand-accent-muted': '#93B4D9',
      '--brand-highlight': '#D4AF37',
      '--brand-highlight-muted': '#B8962E',
      '--brand-surface': 'rgba(20, 28, 58, 0.88)',
      '--brand-surface-hover': 'rgba(25, 35, 80, 0.96)',
      '--brand-muted': 'rgba(245, 245, 240, 0.6)',
      '--brand-subtle': 'rgba(245, 245, 240, 0.08)',
    } as const,
  },
} as const

export type NexusLanguage = (typeof NEXUS_BRAND.supportedLanguages)[number]

export function isSupportedNexusLanguage(value: string | null | undefined): value is NexusLanguage {
  return typeof value === 'string' && (NEXUS_BRAND.supportedLanguages as readonly string[]).includes(value)
}
