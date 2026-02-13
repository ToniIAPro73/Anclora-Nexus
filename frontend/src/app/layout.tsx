import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";
import { OrgProvider } from "@/lib/contexts/OrgContext";


const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Anclora Nexus — AI Real Estate Intelligence",
  description: "Luxury real estate operations powered by OpenClaw",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.variable} ${playfair.variable} antialiased font-sans bg-navy-darker text-soft-white`}>
        <I18nProvider>
          <OrgProvider>
            {children}
          </OrgProvider>
        </I18nProvider>

      </body>
    </html>
  );
}


