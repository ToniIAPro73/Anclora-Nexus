import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import type { CSSProperties } from "react";
import "./globals.css";
import { CurrencyProvider } from "@/lib/currency";
import { OrgProvider } from "@/lib/contexts/OrgContext";
import { NEXUS_BRAND } from "@/lib/brand";
import { I18nProvider } from "@/lib/i18n";

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
    icon: NEXUS_BRAND.assets.favicon,
    shortcut: NEXUS_BRAND.assets.favicon,
    apple: NEXUS_BRAND.assets.favicon,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={NEXUS_BRAND.defaultLanguage} className="dark" data-brand="nexus" data-brand-mode={NEXUS_BRAND.theme.mode}>
      <body
        className={`${inter.variable} ${jetbrains.variable} antialiased font-sans bg-navy-darker text-soft-white`}
        style={NEXUS_BRAND.theme.cssVars as CSSProperties}
      >
        <I18nProvider>
          <CurrencyProvider>
            <OrgProvider>
              {children}
            </OrgProvider>
          </CurrencyProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
