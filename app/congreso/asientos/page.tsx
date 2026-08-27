import { Suspense } from 'react';
import SeatPicker from './SeatPicker';

export const metadata = {
  title: 'Elige tu asiento · BIO SKIN Congress 2026',
};

export default function AsientosPage() {
  return (
    <Suspense fallback={<div className="seatpage-loading">Cargando…</div>}>
      <SeatPicker />
    </Suspense>
  );
}
