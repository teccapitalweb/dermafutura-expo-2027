import type { Metadata } from 'next';
import AcompanantesManager from './AcompanantesManager';

export const metadata: Metadata = {
  title: 'Datos de asistentes · BIO SKIN Congress',
  description: 'Completa de forma privada los datos de cada lugar de tu compra.',
  referrer: 'no-referrer',
  robots: { index: false, follow: false }
};

export default function AcompanantesPage() {
  return <AcompanantesManager />;
}
