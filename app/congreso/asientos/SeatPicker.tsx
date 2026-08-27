'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

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

/*
  La URL de regreso a Stripe se calcula quitando "/congreso/asientos" del
  pathname actual — así funciona igual en los dos builds (GH Pages con
  basePath /dermafutura-expo-2027 y el deploy normal sin basePath) sin
  tener que hardcodear ninguno de los dos.
*/
function urlHome(query: string): string {
  const home = window.location.pathname.replace(/\/congreso\/asientos\/?$/, '/');
  return `${window.location.origin}${home}${query}#sede`;
}

export default function SeatPicker() {
  const router = useRouter();
  const params = useSearchParams();
  const fichaParam = params.get('ficha');
  const ficha: 'ficha1' | 'ficha2' | null = fichaParam === 'ficha1' || fichaParam === 'ficha2' ? fichaParam : null;

  const [fichas, setFichas] = useState<Fichas>(FALLBACK);
  const [layout, setLayout] = useState<FilaLayout[]>([]);
  const [asientos, setAsientos] = useState<Record<string, Asiento>>({});
  const [cargando, setCargando] = useState(true);
  const [seleccionado, setSeleccionado] = useState<string | null>(null);
  const [pagando, setPagando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!ficha) { router.replace('/#pases'); return; }
    fetch(`${WEBHOOK_SERVER}/congreso/precios`)
      .then((r) => (r.ok ? (r.json() as Promise<Fichas>) : null))
      .then((data) => { if (data && data.ficha1Nombre) setFichas(data); })
      .catch(() => {});
  }, [ficha, router]);

  const cargarAsientos = useCallback(async () => {
    setCargando(true);
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
      setCargando(false);
    }
  }, []);

  useEffect(() => { if (ficha) cargarAsientos(); }, [ficha, cargarAsientos]);

  if (!ficha) return null; // se redirige en el useEffect de arriba

  async function pagar() {
    if (!ficha || !seleccionado) return;
    setPagando(true);
    setError('');
    try {
      const res = await fetch(`${WEBHOOK_SERVER}/create-checkout-session-congreso`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ficha,
          asiento: seleccionado,
          successUrl: urlHome('?congreso=success'),
          cancelUrl: urlHome('?congreso=canceled'),
        }),
      });
      const data: { url?: string; error?: string } = await res.json();
      if (res.status === 409) {
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

  const zonaActiva = ZONA_POR_FICHA[ficha];
  const nombreFicha = ficha === 'ficha1' ? fichas.ficha1Nombre : fichas.ficha2Nombre;
  const precioFicha = ficha === 'ficha1' ? fichas.ficha1Precio : fichas.ficha2Precio;

  return (
    <main className="seatpage">
      <header className="seatpage-head">
        <button
          type="button"
          className="seatpage-back"
          onClick={() => router.push('/#pases')}
          aria-label="Volver a los pases"
        >
          ←
        </button>
        <div className="seatpage-headinfo">
          <p className="seatpage-tag">BIO SKIN Congress 2026 · Ficha {nombreFicha}</p>
          <h1>Elige tu asiento</h1>
        </div>
        <div className="seatpage-headprecio">
          <small>Precio</small>
          <strong>${precioFicha.toLocaleString('es-MX')} MXN</strong>
        </div>
      </header>

      <div className="seatpage-body">
        <div className="seatpage-stage" aria-hidden="true"><span>ESCENARIO</span></div>

        {cargando ? (
          <p className="seatpage-loading">Cargando mapa de asientos…</p>
        ) : (
          <div className="seatpage-rows">
            {layout.map((f) => (
              <div className="seatmap-row" key={f.fila} data-zona={f.zona}>
                <span className="seatmap-rowlabel">{f.fila === 'P' ? '★' : f.fila}</span>
                <div className="seatmap-seats">
                  {Array.from({ length: f.asientos }, (_, i) => {
                    const id = `${f.fila}${i + 1}`;
                    const a = asientos[id];
                    const estado = a?.estado ?? 'libre';
                    const esDeMiZona = f.zona === zonaActiva;
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
                        aria-pressed={seleccionado === id}
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
      </div>

      <footer className="seatpage-actions">
        <button type="button" className="seatmap-btn-ghost" onClick={() => router.push('/#pases')} disabled={pagando}>
          Atrás
        </button>
        <button type="button" className="seatmap-btn-primary" onClick={pagar} disabled={!seleccionado || pagando}>
          {pagando ? 'Redirigiendo…' : seleccionado ? `Pagar asiento ${seleccionado}` : 'Elige un asiento'}
        </button>
      </footer>
    </main>
  );
}
