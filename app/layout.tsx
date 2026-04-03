import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "QuantCobren.cat",
    template: "%s | QuantCobren.cat",
  },
  description: "Portal de transparència independent sobre els sous i càrrecs públics a Catalunya.",
  openGraph: {
    title: "QuantCobren.cat | Transparència de sous públics",
    description: "Descobreix i compara el sou dels càrrecs públics de la Generalitat, Parlament i Diputacions.",
    url: "https://quantcobren.cat", 
    siteName: "QuantCobren.cat",
    locale: "ca_ES",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ca" className={`${inter.variable} h-full antialiased`}>
      {/* IMPORTANT: He restaurat 'flex-col' i 'font-sans' perquè 
          Tailwind torni a aplicar els estils correctament.
      */}
      <body className={`${inter.className} min-h-full flex flex-col font-sans bg-zinc-50 text-zinc-900`}>
        {children}
      </body>
    </html>
  );
}