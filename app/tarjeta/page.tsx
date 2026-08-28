import type { Metadata } from 'next';
import TarjetaVirtual from './TarjetaVirtual';

export const metadata: Metadata = {
  title: 'Tarjeta profesional | BIO SKIN Congress 2026',
  description: 'Tarjeta profesional de networking de BIO SKIN Congress 2026.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export default function TarjetaPage() {
  return <TarjetaVirtual />;
}
