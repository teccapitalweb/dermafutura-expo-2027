import type { Metadata } from 'next';
import { Bungee_Outline, Cormorant_Garamond, Manrope } from 'next/font/google';
import './globals.css';

const display = Cormorant_Garamond({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
});

const sans = Manrope({
  variable: '--font-sans',
  subsets: ['latin'],
});

const outline = Bungee_Outline({
  variable: '--font-outline',
  subsets: ['latin'],
  weight: '400',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://dermafutura-expo-2027.coordinaciontecapita.chatgpt.site'),
  title: 'BIO SKIN Congress 2026 — Ciencia, piel y futuro',
  description: 'Una nueva plataforma para conectar dermatología clínica, innovación, tecnología y cuidado integral.',
  openGraph: {
    title: 'BIO SKIN Congress 2026 — Ciencia, piel y futuro',
    description: 'Una nueva plataforma para conectar dermatología clínica, innovación, tecnología y cuidado integral.',
    type: 'website',
    locale: 'es_MX',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'BIO SKIN Congress 2026' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BIO SKIN Congress 2026 — Ciencia, piel y futuro',
    description: 'Ciencia, innovación y cuidado que transforma la piel.',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-MX">
      <body className={`${display.variable} ${sans.variable} ${outline.variable}`}>{children}</body>
    </html>
  );
}
