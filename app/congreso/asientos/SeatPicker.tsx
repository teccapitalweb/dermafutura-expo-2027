'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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
type MapaSala = { layout: FilaLayout[]; asientos: Asiento[] };
type CacheSala = MapaSala & { guardadoEn: number };
type CheckoutPendiente = {
  sessionId: string;
  asientos?: string[];
  asiento?: string;
  ficha: 'ficha1' | 'ficha2';
  creadoEn: number;
};
type CompradorRecordado = {
  nombre?: string;
  correo?: string;
  telefono?: string;
  guardadoEn?: number;
};

const FALLBACK: Fichas = {
  ficha1Nombre: 'Especial',
  ficha1Precio: 15,
  ficha2Nombre: 'General',
  ficha2Precio: 10,
};

const ZONA_POR_FICHA: Record<'ficha1' | 'ficha2', string> = {
  ficha1: 'preferente',
  ficha2: 'general',
};

const LAYOUT_INICIAL: FilaLayout[] = [
  { fila: 'P', asientos: 8, zona: 'ponente' },
  ...['A', 'B', 'C', 'D'].map((fila) => ({ fila, asientos: 10, zona: 'preferente' })),
  ...['E', 'F', 'G', 'H', 'I', 'J'].map((fila) => ({ fila, asientos: 10, zona: 'general' })),
];
const CACHE_SALA = 'bioskin-congress-seatmap-v2';
const CHECKOUT_PENDIENTE = 'bioskin-congress-checkout-pending-v1';
const COMPRADOR_RECORDADO = 'dermafutura-congress-buyer-v1';
const VIGENCIA_CACHE_MS = 90_000;
const MAX_ASIENTOS_GRUPO = 10;

const ESPERA_MAXIMA_MS = 12000;

async function obtenerJson<T>(url: string, init?: RequestInit, reintentos = 0): Promise<T> {
  let ultimoError: unknown;

  for (let intento = 0; intento <= reintentos; intento += 1) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), ESPERA_MAXIMA_MS);

    try {
      const respuesta = await fetch(url, {
        ...init,
        cache: 'no-store',
        signal: controller.signal,
      });

      if (!respuesta.ok) {
        const detalle = await respuesta.json().catch(() => ({})) as { error?: string };
        throw new Error(detalle.error || `Error ${respuesta.status}`);
      }

      return await respuesta.json() as T;
    } catch (error) {
      ultimoError = error;
      if (intento < reintentos) {
        await new Promise((resolve) => window.setTimeout(resolve, 700));
      }
    } finally {
      window.clearTimeout(timeout);
    }
  }

  throw ultimoError instanceof Error ? ultimoError : new Error('No fue posible conectar con la sala');
}

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

function urlCancelacion(ficha: 'ficha1' | 'ficha2'): string {
  const url = new URL(window.location.href);
  url.search = '';
  url.hash = '';
  url.searchParams.set('ficha', ficha);
  url.searchParams.set('checkout', 'canceled');
  return url.toString();
}

export default function SeatPicker() {
  const router = useRouter();
  const params = useSearchParams();
  const fichaParam = params.get('ficha');
  const ficha: 'ficha1' | 'ficha2' | null = fichaParam === 'ficha1' || fichaParam === 'ficha2' ? fichaParam : null;
  const checkoutCancelado = params.get('checkout') === 'canceled';

  const [fichas, setFichas] = useState<Fichas>(FALLBACK);
  const [layout, setLayout] = useState<FilaLayout[]>(LAYOUT_INICIAL);
  const [asientos, setAsientos] = useState<Record<string, Asiento>>({});
  const [cargando, setCargando] = useState(true);
  const [sincronizado, setSincronizado] = useState(false);
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const [pagando, setPagando] = useState(false);
  const [error, setError] = useState('');
  const liberandoReserva = useRef(false);
  const ventanaStripe = useRef<Window | null>(null);
  const monitorStripe = useRef<number | null>(null);

  useEffect(() => {
    if (!ficha) { router.replace('/#pases'); return; }
    obtenerJson<Fichas>(`${WEBHOOK_SERVER}/congreso/precios`)
      .then((data) => { if (data && data.ficha1Nombre) setFichas(data); })
      .catch(() => {});
  }, [ficha, router]);

  const cargarAsientos = useCallback(async (silencioso = false) => {
    if (!silencioso) {
      setCargando(true);
      setError('');
    }
    try {
      const data = await obtenerJson<MapaSala>(
        `${WEBHOOK_SERVER}/congreso/asientos`,
        undefined,
        1,
      );
      if (!Array.isArray(data.layout) || !Array.isArray(data.asientos)) throw new Error('Mapa incompleto');
      setLayout(data.layout);
      const mapa: Record<string, Asiento> = {};
      for (const a of data.asientos) mapa[a.id] = a;
      setAsientos(mapa);
      setSeleccionados((actuales) => actuales.filter((id) => mapa[id]?.estado === 'libre'));
      setSincronizado(true);
      setError('');
      sessionStorage.setItem(CACHE_SALA, JSON.stringify({ ...data, guardadoEn: Date.now() } satisfies CacheSala));
    } catch {
      if (!silencioso) setError('No pudimos confirmar la disponibilidad. Vuelve a sincronizar la sala.');
    } finally {
      if (!silencioso) setCargando(false);
    }
  }, []);

  const liberarReservaPendiente = useCallback(async () => {
    if (liberandoReserva.current) return;

    let pendiente: CheckoutPendiente | null = null;
    try {
      pendiente = JSON.parse(sessionStorage.getItem(CHECKOUT_PENDIENTE) || 'null') as CheckoutPendiente | null;
    } catch {
      sessionStorage.removeItem(CHECKOUT_PENDIENTE);
    }
    if (!pendiente?.sessionId) return;

    liberandoReserva.current = true;
    setPagando(false);
    try {
      const resultado = await obtenerJson<{ liberado: boolean; motivo: string; asientos?: string[]; asiento?: string }>(
        `${WEBHOOK_SERVER}/congreso/cancelar-reserva`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: pendiente.sessionId }),
        },
      );
      sessionStorage.removeItem(CHECKOUT_PENDIENTE);
      sessionStorage.removeItem(CACHE_SALA);
      setSeleccionados([]);
      await cargarAsientos();
      if (resultado.motivo !== 'pagado') {
        const liberados = resultado.asientos || (resultado.asiento ? [resultado.asiento] : pendiente.asientos || (pendiente.asiento ? [pendiente.asiento] : []));
        setError(`Pago cancelado. ${liberados.length > 1 ? `Los lugares ${liberados.join(', ')} vuelven` : `El lugar ${liberados[0] || ''} vuelve`} a estar disponible.`);
      }
    } catch {
      setError('No pudimos liberar la reserva de inmediato. Vuelve a sincronizar; se liberará automáticamente al vencer Stripe.');
    } finally {
      liberandoReserva.current = false;
    }
  }, [cargarAsientos]);

  useEffect(() => {
    if (!ficha) return;
    const inicio = window.setTimeout(() => {
      let cacheValida = false;
      try {
        const cache = JSON.parse(sessionStorage.getItem(CACHE_SALA) || 'null') as CacheSala | null;
        if (cache && Date.now() - cache.guardadoEn < VIGENCIA_CACHE_MS && Array.isArray(cache.layout) && Array.isArray(cache.asientos)) {
          const mapa: Record<string, Asiento> = {};
          for (const asiento of cache.asientos) mapa[asiento.id] = asiento;
          setLayout(cache.layout);
          setAsientos(mapa);
          setSeleccionados((actuales) => actuales.filter((id) => mapa[id]?.estado === 'libre'));
          setSincronizado(true);
          setCargando(false);
          cacheValida = true;
        }
      } catch {
        sessionStorage.removeItem(CACHE_SALA);
      }
      void cargarAsientos(cacheValida);
    }, 0);
    return () => window.clearTimeout(inicio);
  }, [ficha, cargarAsientos]);

  useEffect(() => {
    if (!ficha) return;
    const intervalo = window.setInterval(() => { void cargarAsientos(true); }, 10_000);
    return () => window.clearInterval(intervalo);
  }, [ficha, cargarAsientos]);

  useEffect(() => {
    if (!ficha) return;
    const alVolverDeStripe = () => { void liberarReservaPendiente(); };
    window.addEventListener('pageshow', alVolverDeStripe);
    if (checkoutCancelado) {
      alVolverDeStripe();
      const limpia = new URL(window.location.href);
      limpia.searchParams.delete('checkout');
      window.history.replaceState(null, '', `${limpia.pathname}${limpia.search}${limpia.hash}`);
    }
    return () => window.removeEventListener('pageshow', alVolverDeStripe);
  }, [ficha, checkoutCancelado, liberarReservaPendiente]);

  useEffect(() => () => {
    if (monitorStripe.current !== null) window.clearInterval(monitorStripe.current);
  }, []);

  if (!ficha) return null; // se redirige en el useEffect de arriba

  async function pagar() {
    if (!ficha || seleccionados.length === 0) return;
    // Mantener el selector abierto permite detectar que la persona cerró
    // Stripe y liberar inmediatamente el grupo. Si el navegador bloquea la
    // pestaña, se conserva el flujo anterior en esta misma ventana.
    const popupStripe = window.open('', 'dermafutura-stripe-checkout');
    if (popupStripe) {
      popupStripe.document.title = 'Preparando pago seguro';
      popupStripe.document.body.style.fontFamily = 'Arial, sans-serif';
      popupStripe.document.body.style.padding = '32px';
      popupStripe.document.body.textContent = 'Preparando tu pago seguro con Stripe…';
    }
    setPagando(true);
    setError('');
    try {
      let comprador: CompradorRecordado | undefined;
      try {
        const recordado = JSON.parse(localStorage.getItem(COMPRADOR_RECORDADO) || 'null') as CompradorRecordado | null;
        if (recordado?.correo && (!recordado.guardadoEn || Date.now() - recordado.guardadoEn < 180 * 24 * 60 * 60 * 1000)) {
          comprador = recordado;
        }
      } catch {
        // El almacenamiento puede estar desactivado; Stripe/Link continuará con su propio autocompletado.
      }
      const data = await obtenerJson<{ url?: string; sessionId?: string; error?: string }>(`${WEBHOOK_SERVER}/create-checkout-session-congreso`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ficha,
          // Compatibilidad segura: el servidor anterior puede seguir vendiendo
          // una entrada individual, pero nunca interpretará un grupo como una sola.
          asiento: seleccionados.length === 1 ? seleccionados[0] : undefined,
          asientos: seleccionados,
          comprador,
          successUrl: urlHome('?congreso=success'),
          cancelUrl: urlCancelacion(ficha),
        }),
      });
      if (!data.url || !data.sessionId) throw new Error(data.error || 'No se pudo iniciar el pago');
      sessionStorage.setItem(CHECKOUT_PENDIENTE, JSON.stringify({
        sessionId: data.sessionId,
        asientos: seleccionados,
        ficha,
        creadoEn: Date.now(),
      } satisfies CheckoutPendiente));
      if (popupStripe && !popupStripe.closed) {
        ventanaStripe.current = popupStripe;
        popupStripe.location.replace(data.url);
        if (monitorStripe.current !== null) window.clearInterval(monitorStripe.current);
        monitorStripe.current = window.setInterval(() => {
          if (!ventanaStripe.current?.closed) return;
          if (monitorStripe.current !== null) window.clearInterval(monitorStripe.current);
          monitorStripe.current = null;
          ventanaStripe.current = null;
          void liberarReservaPendiente();
        }, 750);
      } else if (popupStripe === null) {
        window.location.href = data.url;
      } else {
        await liberarReservaPendiente();
      }
    } catch (err) {
      if (popupStripe && !popupStripe.closed) popupStripe.close();
      const mensaje = err instanceof Error ? err.message : 'Ocurrió un error, intenta de nuevo';
      if (/ocup|reserv|409/i.test(mensaje)) {
        setError('Uno de esos lugares acaba de ocuparse. Conservamos los que siguen libres para que completes tu grupo.');
        await cargarAsientos();
      } else {
        setError(mensaje === 'This operation was aborted'
          ? 'Stripe tardó más de lo esperado. Tu asiento no fue cobrado; inténtalo de nuevo.'
          : mensaje);
      }
      setPagando(false);
    }
  }

  const zonaActiva = ZONA_POR_FICHA[ficha];
  const nombreFicha = ficha === 'ficha1' ? fichas.ficha1Nombre : fichas.ficha2Nombre;
  const precioFicha = ficha === 'ficha1' ? fichas.ficha1Precio : fichas.ficha2Precio;
  const zonaDescripcion = zonaActiva === 'preferente' ? 'Filas A–D · Vista preferente' : 'Filas E–J · Acceso general';
  const montoTotal = precioFicha * seleccionados.length;

  function alternarAsiento(id: string) {
    setError('');
    setSeleccionados((actuales) => {
      if (actuales.includes(id)) return actuales.filter((asiento) => asiento !== id);
      if (actuales.length >= MAX_ASIENTOS_GRUPO) {
        setError(`Puedes reservar hasta ${MAX_ASIENTOS_GRUPO} lugares en una sola compra.`);
        return actuales;
      }
      return [...actuales, id];
    });
  }

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
          <p className="seatpage-tag">BIO SKIN Congress 2026 · Seat edition</p>
          <h1>Elige tus lugares</h1>
        </div>
        <div className="seatpage-progress" aria-label="Paso 1 de 2">
          <span className="is-active"><b>1</b>Lugares</span>
          <i aria-hidden="true" />
          <span><b>2</b>Datos y pago</span>
        </div>
        <div className="seatpage-headprecio">
          <small>{seleccionados.length ? `Total · ${seleccionados.length} ${seleccionados.length === 1 ? 'lugar' : 'lugares'}` : 'Precio por lugar'}</small>
          <strong>${(seleccionados.length ? montoTotal : precioFicha).toLocaleString('es-MX')} MXN</strong>
        </div>
      </header>

      <div className="seatpage-body">
        <div className="seatpage-layout">
          <section className="seatmap-panel" aria-labelledby="seatmap-title">
            <div className="seatmap-panelhead">
              <div>
                <p>N° 01 / Selección individual o en grupo</p>
                <h2 id="seatmap-title">Sala principal</h2>
              </div>
              <span>{nombreFicha} · {zonaActiva === 'preferente' ? 'A—D' : 'E—J'}</span>
            </div>

            <div className="seatpage-stage-wrap" aria-hidden="true">
              <div className="seatpage-stage"><span>RUNWAY / ESCENARIO</span></div>
              <small>La mejor perspectiva comienza aquí</small>
            </div>

            {cargando && !sincronizado && (
              <div className="seatmap-sync" role="status" aria-live="polite">
                <span aria-hidden="true" />
                Confirmando disponibilidad en tiempo real
              </div>
            )}

            {layout.length === 0 ? (
              <div className="seatmap-empty" role="alert">
                <span aria-hidden="true">!</span>
                <h3>La sala no respondió</h3>
                <p>Tu selección sigue intacta. Vuelve a cargar el mapa para continuar.</p>
                <button type="button" onClick={() => cargarAsientos()}>Volver a cargar</button>
              </div>
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
                        const clicable = sincronizado && esDeMiZona && estado === 'libre' && !pagando;
                        const clases = [
                          'seat',
                          `seat-${estado}`,
                          seleccionados.includes(id) ? 'seat-seleccionado' : '',
                          f.zona === 'ponente' ? 'seat-ponente' : '',
                          !esDeMiZona && f.zona !== 'ponente' ? 'seat-otra-zona' : '',
                        ].filter(Boolean).join(' ');
                        return (
                          <button
                            key={id}
                            type="button"
                            className={clases}
                            disabled={!clicable}
                            onClick={() => alternarAsiento(id)}
                            aria-pressed={seleccionados.includes(id)}
                            aria-label={`Lugar ${id} ${seleccionados.includes(id) ? 'seleccionado' : estado}`}
                            title={f.zona === 'ponente' ? 'Reservado para ponentes' : `${id} · ${estado}`}
                          >
                            <span className="seat-chair" aria-hidden="true"><i>{i + 1}</i></span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="seatmap-legend" aria-label="Disponibilidad de asientos">
              <span><i className="seat-demo demo-libre" /> Disponible</span>
              <span><i className="seat-demo demo-seleccionado" /> Tu selección</span>
              <span><i className="seat-demo demo-reservado" /> En proceso de pago</span>
              <span><i className="seat-demo demo-ocupado" /> Vendido</span>
              <span><i className="seat-demo demo-ponente" /> Ponentes</span>
              <span><i className="seat-demo demo-otra" /> Otra zona</span>
            </div>

            {error && layout.length > 0 && (
              <div className="seatmap-error" role="alert">
                <span>{error}</span>
                <button type="button" onClick={() => cargarAsientos()}>Sincronizar de nuevo</button>
              </div>
            )}
          </section>

          <aside className="seatpage-summary" aria-live="polite">
            <p className="seatpage-summary-tag">N° 02 / Tu reservación</p>
            <h2>Ficha {nombreFicha}</h2>
            <p className="seatpage-summary-zone">{zonaDescripcion}</p>

            <div className="seatpage-summary-seat" data-empty={!seleccionados.length || undefined}>
              <span>{seleccionados.length === 1 ? 'Lugar seleccionado' : 'Lugares seleccionados'}</span>
              <strong>{seleccionados.length || '—'}</strong>
              {seleccionados.length > 0 ? (
                <div className="seatpage-summary-chips" aria-label={`Lugares: ${seleccionados.join(', ')}`}>
                  {seleccionados.map((id) => <i key={id}>{id}</i>)}
                </div>
              ) : (
                <small>Elige una o varias ubicaciones</small>
              )}
            </div>

            <dl className="seatpage-summary-details">
              <div><dt>Acceso</dt><dd>{nombreFicha}</dd></div>
              <div><dt>Precio por lugar</dt><dd>${precioFicha.toLocaleString('es-MX')} MXN</dd></div>
              <div><dt>Total</dt><dd>${montoTotal.toLocaleString('es-MX')} MXN</dd></div>
            </dl>

            <div className="seatpage-secure">
              <span aria-hidden="true">S</span>
              <p><strong>Pago protegido por Stripe</strong><small>Tus lugares se confirman juntos al completar el pago.</small></p>
            </div>
          </aside>
        </div>
      </div>

      <footer className="seatpage-actions">
        <div className="seatpage-actions-copy">
          <strong>{seleccionados.length ? `${seleccionados.length} ${seleccionados.length === 1 ? 'lugar' : 'lugares'} · ${seleccionados.join(', ')}` : 'Selecciona tus lugares'}</strong>
          <span>{seleccionados.length ? `Ficha ${nombreFicha} · Total $${montoTotal.toLocaleString('es-MX')} MXN` : zonaDescripcion}</span>
        </div>
        <button type="button" className="seatmap-btn-ghost" onClick={() => router.push('/#pases')} disabled={pagando}>
          Atrás
        </button>
        <button type="button" className="seatmap-btn-primary" onClick={pagar} disabled={!seleccionados.length || pagando}>
          {pagando ? 'Apartando tus lugares…' : seleccionados.length ? `Continuar · $${montoTotal.toLocaleString('es-MX')} MXN` : 'Elige al menos un lugar'}
        </button>
      </footer>
    </main>
  );
}
