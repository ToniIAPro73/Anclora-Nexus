'use client'

import Link from 'next/link'
import { useI18n } from '@/lib/i18n'

type Kind = 'privacy' | 'terms' | 'legal'

export function LegalDocument({ kind }: { kind: Kind }) {
  const { language } = useI18n()
  const content = getContent(language, kind)
  return (
    <main className="min-h-screen bg-navy-darker px-5 py-12 text-soft-white">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="rounded-2xl border border-gold/20 bg-navy-dark p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">Anclora Nexus</p>
          <h1 className="mt-3 text-4xl font-semibold">{content.title}</h1>
          <p className="mt-3 text-sm leading-7 text-white/65">{content.description}</p>
          <p className="mt-2 text-xs text-white/50">{content.updated}</p>
        </section>
        <section className="space-y-4 rounded-2xl border border-white/10 bg-navy-dark p-6">
          {content.blocks.map((block) => (
            <article key={block.title} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <h2 className="text-2xl font-semibold">{block.title}</h2>
              {block.paragraphs.map((paragraph) => <p key={paragraph} className="mt-3 text-sm leading-7 text-white/65">{paragraph}</p>)}
            </article>
          ))}
        </section>
        <nav className="flex flex-wrap gap-3 text-sm">
          <Link href="/terms" className="rounded-full border border-white/15 px-5 py-3">Terms</Link>
          <Link href="/privacy" className="rounded-full border border-white/15 px-5 py-3">Privacy</Link>
          <Link href="/legal" className="rounded-full border border-white/15 px-5 py-3">Legal</Link>
          <Link href="/dashboard" className="rounded-full bg-gold px-5 py-3 font-semibold text-navy-darker">Dashboard</Link>
        </nav>
      </div>
    </main>
  )
}

function getContent(language: string, kind: Kind) {
  const en = language === 'en'
  const de = language === 'de'
  const updated = de ? 'Aktualisiert: 17. Mai 2026' : en ? 'Last updated: 17 May 2026' : 'Última actualización: 17 de mayo de 2026'
  if (kind === 'privacy') return {
    title: de ? 'Datenschutzerklärung' : en ? 'Privacy policy' : 'Política de privacidad',
    description: de ? 'Verarbeitung personenbezogener Daten in Anclora Nexus.' : en ? 'Personal data processing in Anclora Nexus.' : 'Tratamiento de datos personales en Anclora Nexus.',
    updated,
    blocks: [
      { title: de ? 'Verantwortlicher' : en ? 'Controller' : 'Responsable', paragraphs: [de ? 'Verantwortlicher: Anclora Group, Eigentümerin und Betreiberin von Anclora Nexus.' : en ? 'Controller: Anclora Group, owner and operator of Anclora Nexus.' : 'Responsable: Anclora Group, entidad propietaria y operadora de Anclora Nexus.', 'hola@anclora.com'] },
      { title: 'Cookies', paragraphs: [de ? 'Notwendige Cookies unterstützen Sitzung, Sicherheit und Betrieb. Optionale Betriebsanalysen bleiben deaktiviert, sofern keine Zustimmung erfolgt.' : en ? 'Necessary cookies support session, security and operation. Optional operational analytics remain disabled unless accepted.' : 'Las cookies necesarias soportan sesión, seguridad y operación. El análisis operativo opcional permanece desactivado salvo consentimiento.'] },
    ],
  }
  if (kind === 'terms') return {
    title: de ? 'Nutzungsbedingungen' : en ? 'Terms of service' : 'Términos del servicio',
    description: de ? 'Nutzungsbedingungen für Anclora Nexus.' : en ? 'Use conditions for Anclora Nexus.' : 'Condiciones de uso de Anclora Nexus.',
    updated,
    blocks: [
      { title: de ? 'Betreiber' : en ? 'Operator' : 'Operador', paragraphs: [de ? 'Anclora Nexus ist Teil des operativen Ökosystems von Anclora Group.' : en ? 'Anclora Nexus is part of the Anclora Group operational ecosystem.' : 'Anclora Nexus forma parte del ecosistema operativo de Anclora Group.'] },
      { title: de ? 'Interner Dienst' : en ? 'Internal service' : 'Servicio interno', paragraphs: [de ? 'Der Zugriff ist auf autorisierte Profile beschränkt.' : en ? 'Access is limited to authorized profiles.' : 'El acceso está limitado a perfiles autorizados.'] },
    ],
  }
  return {
    title: de ? 'Impressum' : en ? 'Legal notice' : 'Aviso legal',
    description: de ? 'Eigentum und Kontakt.' : en ? 'Ownership and contact.' : 'Titularidad y contacto.',
    updated,
    blocks: [
      { title: de ? 'Eigentum' : en ? 'Ownership' : 'Titularidad', paragraphs: [de ? 'Eigentümerin und Betreiberin: Anclora Group.' : en ? 'Owner and operator: Anclora Group.' : 'Titular y operador: Anclora Group.', de ? 'Es wird keine erteilte Markeneintragung behauptet.' : en ? 'No granted trademark registration is asserted.' : 'No se afirma registro concedido de marca.'] },
      { title: de ? 'Kontakt' : en ? 'Contact' : 'Contacto', paragraphs: ['hola@anclora.com'] },
    ],
  }
}
