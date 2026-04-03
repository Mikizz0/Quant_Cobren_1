import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  // Títol principal de la pestanya
  title: {
    default: "QuantCobren.cat",
    template: "%s | QuantCobren.cat", // Permet títols dinàmics a cada pàgina
  },
  // Descripció per a Google i cercadors
  description: "Portal de transparència independent sobre els sous i càrrecs públics a Catalunya.",
  
  // Configuració per a xarxes socials i aplicacions de missatgeria (WhatsApp, Twitter, etc.)
  openGraph: {
    title: "QuantCobren.cat | Transparència de sous públics",
    description: "Descobreix i compara el sou dels càrrecs públics de la Generalitat, Parlament i Diputacions.",
    url: "https://quantcobren.cat", // Canvia-ho per la teva URL final
    siteName: "QuantCobren.cat",
    locale: "ca_ES",
    type: "website",
    // Pots afegir una imatge OpenGraph més endavant per a un resultat òptim
    // images: [{ url: 'https://quantcobren.cat/og-image.png' }],
  },
  // Millora la indexació de Google
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ca" className={`${inter.variable} h-full antialiased`}>
      {/* Next.js gestionarà automàticament les meta-dades i la icona al <head> */}
      <body className="min-h-full flex flex-col font-sans bg-zinc-50 text-zinc-900">
        {children}
      </body>
    </html>
  );
}