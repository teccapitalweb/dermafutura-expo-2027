import type { Metadata } from 'next';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
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

export const metadata: Metadata = {
  metadataBase: new URL('https://dermafutura-expo-2027.coordinaciontecapita.chatgpt.site'),
  title: 'DermaFutura Expo 2027 — Ciencia, piel y futuro',
  description: 'Una nueva plataforma para conectar dermatología clínica, innovación, tecnología y cuidado integral.',
  openGraph: {
    title: 'DermaFutura Expo 2027 — Ciencia, piel y futuro',
    description: 'Una nueva plataforma para conectar dermatología clínica, innovación, tecnología y cuidado integral.',
    type: 'website',
    locale: 'es_MX',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'DermaFutura Expo 2027' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DermaFutura Expo 2027 — Ciencia, piel y futuro',
    description: 'Ciencia, innovación y cuidado que transforma la piel.',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-MX">
      <body className={`${display.variable} ${sans.variable}`}>{children}</body>
    </html>
  );
}
