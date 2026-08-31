'use client';

import { useEffect, useState } from 'react';

const CHECKOUT_PENDIENTE = 'bioskin-congress-checkout-pending-v1';
const CACHE_SALA = 'bioskin-congress-seatmap-v2';

export default function CongresoPurchaseStatus() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get('congreso') !== 'success') return;
    sessionStorage.removeItem(CHECKOUT_PENDIENTE);
    sessionStorage.removeItem(CACHE_SALA);
    const timer = window.setTimeout(() => setVisible(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  function cerrar() {
    setVisible(false);
    const url = new URL(window.location.href);
    url.searchParams.delete('congreso');
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  }

  if (!visible) return null;

  return (
    <div className="purchase-success-backdrop" role="presentation">
      <section className="purchase-success" role="dialog" aria-modal="true" aria-labelledby="purchase-success-title">
        <span className="purchase-success-kicker">Pago confirmado · BIO SKIN 2026</span>
        <div className="purchase-success-mark" aria-hidden="true">✓</div>
        <h2 id="purchase-success-title">Tu compra se realizó con éxito</h2>
        <p>Tus lugares quedaron confirmados. Stripe guardó únicamente el nombre, correo y teléfono del comprador.</p>
        <div className="purchase-success-note">
          <strong>Puedes rellenarlo después</strong>
          <span>Enviaremos a tu correo un enlace privado para completar o compartir los datos de cada asistente.</span>
        </div>
        <button type="button" onClick={cerrar}>Continuar al sitio</button>
      </section>
    </div>
  );
}
