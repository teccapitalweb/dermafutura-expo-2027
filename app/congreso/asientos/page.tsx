import { Suspense } from 'react';
import SeatPicker from './SeatPicker';

export const metadata = {
  title: 'Elige tu asiento · BIO SKIN Congress 2026',
};

export default function AsientosPage() {
  return (
    <Suspense fallback={<main className="seatpage seatpage-route-loading"><div className="seatpage-loading"><span /><strong>Abriendo la sala</strong><small>Un momento, por favor.</small></div></main>}>
      <SeatPicker />
    </Suspense>
  );
}
