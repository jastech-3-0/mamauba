import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { I18nProvider } from "@/lib/i18n/provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Corporación Mamauba · Plataforma de capital con IA",
  description:
    "Plataforma de levantamiento de capital nacional e internacional con IA. Donaciones, crowdfunding, cooperación internacional y postulación automática a convocatorias para el desarrollo social sostenible de comunidades campesinas, indígenas, afros y LGBTIQ+.",
  keywords: [
    "Corporación Mamauba",
    "ESAL Colombia",
    "captación de capital",
    "donaciones",
    "cooperación internacional",
    "IA convocatorias",
    "impacto social",
    "comunidades indígenas",
    "comunidades afros",
    "LGBTIQ+",
    "transporte férreo",
    "desarrollo territorial",
  ],
  authors: [{ name: "Corporación Mamauba" }],
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Corporación Mamauba · Plataforma de capital con IA",
    description:
      "Capital nacional e internacional con IA para comunidades campesinas, indígenas, afros y LGBTIQ+.",
    url: "https://mamauba.org",
    siteName: "Corporación Mamauba",
    type: "website",
    locale: "es_CO",
  },
  twitter: {
    card: "summary_large_image",
    title: "Corporación Mamauba · Plataforma de capital con IA",
    description: "Capital con IA para el desarrollo territorial en Colombia.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jakarta.variable} ${mono.variable} antialiased bg-background text-foreground font-sans`}
      >
        <I18nProvider>{children}</I18nProvider>
        <Toaster />
      </body>
    </html>
  );
}
