'use client';

import { useCallback, useEffect, useState } from 'react';

const WEBHOOK_SERVER = 'https://dermalysse-webhook-production.up.railway.app';

type Fichas = {
  ficha1Nombre: string;
  ficha1Precio: number;
  ficha2Nombre: string;
  ficha2Precio: number;
};

type FilaLayout = { fila: string; asientos: number; zona: string };
type Asiento = {
  id: string;
  fila: string;
  numero: number;
  zona: 'ponente' | 'preferente' | 'general';
  estado: 'libre' | 'ocupado' | 'reservado';
};

const FALLBACK: Fichas = {
  ficha1Nombre: 'Preferente',
  ficha1Precio: 1000,
  ficha2Nombre: 'General',
  ficha2Precio: 500,
};

const ZONA_POR_FICHA: Record<'ficha1' | 'ficha2', string> = {
  ficha1: 'preferente',
  ficha2: 'general',
};

export default function CongresoTickets() {
  const [fichas, setFichas] = useState<Fichas>(FALLBACK);
  const [fichaAbierta, setFichaAbierta] = useState<'ficha1' | 'ficha2' | null>(null);
  const [layout, setLayout] = useState<FilaLayout[]>([]);
  const [asientos, setAsientos] = useState<Record<string, Asiento>>({});
  const [cargandoMapa, setCargandoMapa] = useState(false);
  const [seleccionado, setSeleccionado] = useState<string | null>(null);
  const [pagando, setPagando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${WEBHOOK_SERVER}/congreso/precios`)
      .then((r) => (r.ok ? (r.json() as Promise<Fichas>) : null))
      .then((data) => {
        if (data && data.ficha1Nombre) setFichas(data);
      })
      .catch(() => {});
  }, []);

  const cargarAsientos = useCallback(async () => {
    setCargandoMapa(true);
    try {
      const res = await fetch(`${WEBHOOK_SERVER}/congreso/asientos`);
      if (!res.ok) throw new Error();
      const data: { layout: FilaLayout[]; asientos: Asiento[] } = await res.json();
      setLayout(data.layout);
      const mapa: Record<string, Asiento> = {};
      for (const a of data.asientos) mapa[a.id] = a;
      setAsientos(mapa);
    } catch {
      setError('No se pudo cargar el mapa de asientos, intenta de nuevo');
    } finally {
      setCargandoMapa(false);
    }
  }, []);

  function abrirMapa(ficha: 'ficha1' | 'ficha2') {
    setFichaAbierta(ficha);
    setSeleccionado(null);
    setError('');
    cargarAsientos();
  }

  function cerrarMapa() {
    if (pagando) return;
    setFichaAbierta(null);
    setSeleccionado(null);
    setError('');
  }

  async function pagar() {
    if (!fichaAbierta || !seleccionado) return;
    setPagando(true);
    setError('');
    try {
      const res = await fetch(`${WEBHOOK_SERVER}/create-checkout-session-congreso`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ficha: fichaAbierta,
          asiento: seleccionado,
          successUrl: `${window.location.origin}${window.location.pathname}?congreso=success`,
          cancelUrl: `${window.location.origin}${window.location.pathname}?congreso=canceled`,
        }),
      });
      const data: { url?: string; error?: string } = await res.json();
      if (res.status === 409) {
        // Alguien ganó el asiento hace un momento: recargar mapa y avisar.
        setSeleccionado(null);
        setError(data.error || 'Ese asiento acaba de ocuparse, elige otro');
        await cargarAsientos();
        setPagando(false);
        return;
      }
      if (!res.ok || !data.url) throw new Error(data.error || 'No se pudo iniciar el pago');
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error, intenta de nuevo');
      setPagando(false);
    }
  }

  const cards: Array<{ key: 'ficha1' | 'ficha2'; nombre: string; precio: number; zonaTexto: string }> = [
    { key: 'ficha1', nombre: fichas.ficha1Nombre, precio: fichas.ficha1Precio, zonaTexto: 'Filas A–D al frente' },
    { key: 'ficha2', nombre: fichas.ficha2Nombre, precio: fichas.ficha2Precio, zonaTexto: 'Filas E–J' },
  ];

  const zonaActiva = fichaAbierta ? ZONA_POR_FICHA[fichaAbierta] : null;
  const nombreFichaAbierta = fichaAbierta === 'ficha1' ? fichas.ficha1Nombre : fichas.ficha2Nombre;
  const precioFichaAbierta = fichaAbierta === 'ficha1' ? fichas.ficha1Precio : fichas.ficha2Precio;

  return (
    <>
      <div className="pass-cards-grid">
        {cards.map((c) => (
          <div className="pass-card" key={c.key}>
            <div className="pass-top">
              <span>BIO SKIN / 2026</span>
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
              <li>{c.zonaTexto}</li>
            </ul>
            <button type="button" onClick={() => abrirMapa(c.key)}>
              Elegir asiento · Ficha {c.nombre}
            </button>
            <p>Pago seguro con Stripe</p>
          </div>
        ))}
      </div>

      {fichaAbierta && (
        <div className="seatmap-backdrop" onClick={cerrarMapa}>
          <div className="seatmap-modal" onClick={(e) => e.stopPropagation()}>
            <header className="seatmap-head">
              <div>
                <p className="seatmap-tag">Ficha {nombreFichaAbierta} · ${precioFichaAbierta.toLocaleString('es-MX')} MXN</p>
                <h3>Elige tu asiento</h3>
              </div>
              <button type="button" className="seatmap-close" onClick={cerrarMapa} aria-label="Cerrar">✕</button>
            </header>

            <div className="seatmap-stage" aria-hidden="true"><span>ESCENARIO</span></div>

            {cargandoMapa ? (
              <p className="seatmap-loading">Cargando mapa de asientos…</p>
            ) : (
              <div className="seatmap-rows">
                {layout.map((f) => (
                  <div className="seatmap-row" key={f.fila} data-zona={f.zona}>
                    <span className="seatmap-rowlabel">{f.fila === 'P' ? '★' : f.fila}</span>
                    <div className="seatmap-seats">
                      {Array.from({ length: f.asientos }, (_, i) => {
                        const id = `${f.fila}${i + 1}`;
                        const a = asientos[id];
                        const estado = a?.estado ?? 'libre';
                        const esDeMiZona = zonaActiva !== null && f.zona === zonaActiva;
                        const clicable = esDeMiZona && estado === 'libre' && !pagando;
                        const clases = [
                          'seat',
                          `seat-${estado}`,
                          seleccionado === id ? 'seat-seleccionado' : '',
                          f.zona === 'ponente' ? 'seat-ponente' : '',
                          !esDeMiZona && f.zona !== 'ponente' ? 'seat-otra-zona' : '',
                        ].filter(Boolean).join(' ');
                        return (
                          <button
                            key={id}
                            type="button"
                            className={clases}
                            disabled={!clicable}
                            onClick={() => setSeleccionado(seleccionado === id ? null : id)}
                            aria-label={`Asiento ${id} ${estado}`}
                            title={f.zona === 'ponente' ? 'Reservado para ponentes' : `${id} · ${estado}`}
                          >
                            {i + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="seatmap-legend">
              <span><i className="seat-demo demo-libre" /> Disponible</span>
              <span><i className="seat-demo demo-seleccionado" /> Tu asiento</span>
              <span><i className="seat-demo demo-ocupado" /> Ocupado</span>
              <span><i className="seat-demo demo-ponente" /> Ponentes</span>
            </div>

            {error && <p className="seatmap-error">{error}</p>}

            <footer className="seatmap-actions">
              <button type="button" className="seatmap-btn-ghost" onClick={cerrarMapa} disabled={pagando}>
                Cancelar
              </button>
              <button type="button" className="seatmap-btn-primary" onClick={pagar} disabled={!seleccionado || pagando}>
                {pagando ? 'Redirigiendo…' : seleccionado ? `Pagar asiento ${seleccionado}` : 'Elige un asiento'}
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
