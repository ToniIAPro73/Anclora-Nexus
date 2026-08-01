import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { CurrencyProvider } from "@/lib/currency";
import { OrgProvider } from "@/lib/contexts/OrgContext";
import { NEXUS_BRAND } from "@/lib/brand";
import { I18nProvider } from "@/lib/i18n";
import { fetchUserAndOrg } from "@/lib/server-auth";
import { CookieConsent } from "@/components/legal/CookieConsent";
import { LegalFooter } from "@/components/legal/LegalFooter";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: NEXUS_BRAND.name,
  description: NEXUS_BRAND.subtitle,
  icons: {
    icon: [
      { url: NEXUS_BRAND.assets.favicon, sizes: 'any' },
      { url: NEXUS_BRAND.assets.favicon32, type: 'image/png', sizes: '32x32' },
    ],
    shortcut: NEXUS_BRAND.assets.favicon,
    apple: NEXUS_BRAND.assets.appleTouchIcon,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch user and org data server-side once per request
  const initialData = await fetchUserAndOrg()

  return (
    <html lang={NEXUS_BRAND.defaultLanguage} className="dark" data-brand="nexus" data-brand-mode={NEXUS_BRAND.theme.mode}>
      <body
        className={`${inter.variable} ${jetbrains.variable} antialiased font-sans bg-navy-darker text-soft-white`}
      >
        <I18nProvider>
          <CurrencyProvider>
            <OrgProvider initialMembership={initialData.membership}>
              {children}
              <LegalFooter />
              <CookieConsent />
            </OrgProvider>
          </CurrencyProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
