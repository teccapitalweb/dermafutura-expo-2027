'use client';

import { useEffect, useState } from 'react';

const WEBHOOK_SERVER = 'https://dermalysse-webhook-production.up.railway.app';

type Fichas = {
  ficha1Nombre: string;
  ficha1Precio: number;
  ficha2Nombre: string;
  ficha2Precio: number;
};

const FALLBACK: Fichas = {
  ficha1Nombre: 'Especial',
  ficha1Precio: 1000,
  ficha2Nombre: 'General',
  ficha2Precio: 500,
};

export default function CongresoTickets() {
  const [fichas, setFichas] = useState<Fichas>(FALLBACK);
  const [openFicha, setOpenFicha] = useState<'ficha1' | 'ficha2' | null>(null);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${WEBHOOK_SERVER}/congreso/precios`)
      .then((r) => (r.ok ? (r.json() as Promise<Fichas>) : null))
      .then((data) => {
        if (data && data.ficha1Nombre) setFichas(data);
      })
      .catch(() => {});
  }, []);

  async function comprar(e: React.FormEvent) {
    e.preventDefault();
    if (!openFicha) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${WEBHOOK_SERVER}/create-checkout-session-congreso`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ficha: openFicha,
          nombre,
          correo,
          telefono,
          successUrl: `${window.location.origin}${window.location.pathname}?congreso=success`,
          cancelUrl: `${window.location.origin}${window.location.pathname}?congreso=canceled`,
        }),
      });
      const data: { url?: string; error?: string } = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'No se pudo iniciar el pago');
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error, intenta de nuevo');
      setLoading(false);
    }
  }

  const cards: Array<{ key: 'ficha1' | 'ficha2'; nombre: string; precio: number }> = [
    { key: 'ficha1', nombre: fichas.ficha1Nombre, precio: fichas.ficha1Precio },
    { key: 'ficha2', nombre: fichas.ficha2Nombre, precio: fichas.ficha2Precio },
  ];

  return (
    <>
      <div className="pass-cards-grid">
        {cards.map((c) => (
          <div className="pass-card" key={c.key}>
            <div className="pass-top">
              <span>DERMAFUTURA / 2027</span>
              <span>{c.nombre.toUpperCase()}</span>
            </div>
            <div className="pass-price">
              <small>Precio</small>
              <strong>${c.precio.toLocaleString('es-MX')}</strong>
              <span>MXN</span>
            </div>
            <ul>
              <li>Acceso al programa científico</li>
              <li>Zona de innovación</li>
              <li>Experiencias y networking</li>
              <li>Ficha {c.nombre}</li>
            </ul>
            <button type="button" onClick={() => setOpenFicha(c.key)}>
              Comprar ficha {c.nombre}
            </button>
            <p>Pago seguro con Stripe</p>
          </div>
        ))}
      </div>

      {openFicha && (
        <div className="congreso-modal-backdrop" onClick={() => !loading && setOpenFicha(null)}>
          <form
            className="congreso-modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={comprar}
          >
            <h3>
              Ficha {openFicha === 'ficha1' ? fichas.ficha1Nombre : fichas.ficha2Nombre}
            </h3>
            <p className="congreso-modal-precio">
              ${(openFicha === 'ficha1' ? fichas.ficha1Precio : fichas.ficha2Precio).toLocaleString('es-MX')} MXN
            </p>
            <label>
              Nombre completo
              <input required value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre y apellidos" />
            </label>
            <label>
              Correo electrónico
              <input required type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="correo@ejemplo.com" />
            </label>
            <label>
              Teléfono
              <input required type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="10 dígitos" />
            </label>
            {error && <p className="congreso-modal-error">{error}</p>}
            <div className="congreso-modal-actions">
              <button type="button" onClick={() => setOpenFicha(null)} disabled={loading}>
                Cancelar
              </button>
              <button type="submit" disabled={loading}>
                {loading ? 'Procesando…' : 'Ir a pagar'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
