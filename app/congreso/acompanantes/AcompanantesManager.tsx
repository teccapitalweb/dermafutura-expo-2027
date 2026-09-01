'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';

const WEBHOOK_SERVER = 'https://dermalysse-webhook-production.up.railway.app';
const COMPRADOR_RECORDADO = 'dermafutura-congress-buyer-v1';

type Comprador = { nombre: string; correo: string; telefono: string };
type Asistente = {
  registroId: string;
  asiento: string;
  nombre: string;
  correo: string;
  telefono: string;
  cargo: string;
  empresa: string;
  bio: string;
  sitioWeb: string;
  linkedinWeb: string;
  instagram: string;
  mostrarCorreo: boolean;
  mostrarTelefono: boolean;
  mostrarSitioWeb: boolean;
  mostrarLinkedin: boolean;
  mostrarInstagram: boolean;
  tarjetaVisible: boolean;
  consentimientoPublicacion: boolean;
  datosEstado: 'completo' | 'pendiente';
  esComprador: boolean;
  qrAsignado: boolean;
};
type Gestion = {
  alcance: 'compra' | 'asiento';
  compra: {
    ficha: string;
    fichaId: string;
    asientos: string[];
    cantidad: number;
    comprador: Comprador;
  };
  asistentes: Asistente[];
  estadoDatos?: 'completo' | 'pendiente';
};

async function respuestaJson<T>(url: string, init?: RequestInit): Promise<T> {
  const respuesta = await fetch(url, { cache: 'no-store', ...init });
  const data: unknown = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) {
    const mensaje = data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
      ? data.error
      : 'No pudimos completar la solicitud';
    throw new Error(mensaje);
  }
  return data as T;
}

export default function AcompanantesManager() {
  const [token, setToken] = useState('');
  const [gestion, setGestion] = useState<Gestion | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [invitando, setInvitando] = useState('');

  const cargar = useCallback(async (tokenActual: string) => {
    setCargando(true);
    setError('');
    try {
      const data = await respuestaJson<Gestion>(`${WEBHOOK_SERVER}/congreso/acompanantes/${encodeURIComponent(tokenActual)}`);
      setGestion(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos abrir el enlace');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    const actual = new URL(window.location.href).searchParams.get('token')?.trim() || '';
    setToken(actual);
    if (!actual) {
      setError('Este enlace está incompleto. Abre nuevamente el botón que recibiste por correo.');
      setCargando(false);
      return;
    }
    void cargar(actual);
  }, [cargar]);

  useEffect(() => {
    const comprador = gestion?.alcance === 'compra' ? gestion.compra.comprador : null;
    if (!comprador?.correo) return;
    try {
      localStorage.setItem(COMPRADOR_RECORDADO, JSON.stringify({
        nombre: comprador.nombre,
        correo: comprador.correo,
        telefono: comprador.telefono,
        guardadoEn: Date.now(),
      }));
    } catch {
      // El modo privado puede impedir guardar datos; el formulario sigue funcionando normalmente.
    }
  }, [gestion]);

  const pendientes = useMemo(
    () => gestion?.asistentes.filter((asistente) => asistente.datosEstado !== 'completo').length || 0,
    [gestion]
  );

  function actualizar(registroId: string, campo: keyof Asistente, value: string | boolean) {
    setGestion((actual) => actual ? {
      ...actual,
      asistentes: actual.asistentes.map((asistente) => asistente.registroId === registroId
        ? { ...asistente, [campo]: value }
        : asistente)
    } : actual);
    setMensaje('');
  }

  function usarContactoComprador(registroId: string) {
    const comprador = gestion?.compra.comprador;
    if (!comprador) return;
    setGestion((actual) => actual ? {
      ...actual,
      asistentes: actual.asistentes.map((asistente) => asistente.registroId === registroId
        ? { ...asistente, correo: comprador.correo, telefono: comprador.telefono }
        : asistente)
    } : actual);
    setMensaje('Copiamos el correo y teléfono del comprador. Solo falta escribir el nombre de esta persona.');
  }

  async function guardar(finalizar: boolean, mostrarMensaje = true): Promise<boolean> {
    if (!gestion || !token) return false;
    setGuardando(true);
    setError('');
    setMensaje('');
    try {
      const data = await respuestaJson<Gestion & { guardado: boolean }>(
        `${WEBHOOK_SERVER}/congreso/acompanantes/${encodeURIComponent(token)}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ finalizar, asistentes: gestion.asistentes })
        }
      );
      setGestion(data);
      if (mostrarMensaje) {
        setMensaje(finalizar
          ? 'Los datos quedaron guardados y ya aparecen en el administrador.'
          : 'Guardamos tu avance. Puedes cerrar esta página y regresar desde el mismo enlace.');
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos guardar los datos');
      return false;
    } finally {
      setGuardando(false);
    }
  }

  async function enviarInvitacion(asistente: Asistente) {
    if (!token) return;
    const guardado = await guardar(false, false);
    if (!guardado) return;
    setInvitando(asistente.registroId);
    setError('');
    setMensaje('');
    try {
      const data = await respuestaJson<{ enlace: string; correo: string; envio: string }>(
        `${WEBHOOK_SERVER}/congreso/acompanantes/${encodeURIComponent(token)}/invitar`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ registroId: asistente.registroId, correo: asistente.correo })
        }
      );
      await navigator.clipboard?.writeText(data.enlace).catch(() => undefined);
      setMensaje(data.correo && data.envio === 'enviada'
        ? `Enviamos la invitación para ${asistente.asiento} y también copiamos el enlace.`
        : `El enlace privado para ${asistente.asiento} quedó copiado. Puedes enviarlo por WhatsApp o correo.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos crear la invitación');
    } finally {
      setInvitando('');
    }
  }

  function enviarFormulario(event: FormEvent) {
    event.preventDefault();
    void guardar(true);
  }

  if (cargando) {
    return <main className="attendee-page"><section className="attendee-state"><i /><p>Abriendo tu compra de forma segura…</p></section></main>;
  }

  if (error && !gestion) {
    return (
      <main className="attendee-page">
        <section className="attendee-state attendee-state-error">
          <span>Enlace privado</span>
          <h1>No pudimos abrir tus lugares</h1>
          <p>{error}</p>
          <a href="/">Volver al congreso</a>
        </section>
      </main>
    );
  }

  if (!gestion) return null;

  return (
    <main className="attendee-page">
      <div className="attendee-shell">
        <header className="attendee-header">
          <a className="attendee-brand" href="/" aria-label="Volver a BIO SKIN Congress"><b>BS</b><span>BIO SKIN<small>Congress 2026</small></span></a>
          <span className="attendee-private">Enlace privado y seguro</span>
        </header>

        <section className="attendee-intro">
          <div>
            <span className="attendee-kicker">Acreditación · {gestion.compra.ficha}</span>
            <h1>{gestion.alcance === 'compra' ? 'Completa a tu grupo.' : 'Completa tus datos.'}</h1>
            <p>{gestion.alcance === 'compra'
              ? 'Cada lugar tendrá su propio registro y gafete. Puedes guardar un avance, compartir un asiento o terminarlo todo ahora.'
              : 'Estos datos se guardarán únicamente en el lugar que te asignaron.'}</p>
          </div>
          <aside>
            <small>{gestion.compra.cantidad === 1 ? 'Lugar' : 'Lugares de la compra'}</small>
            <strong>{gestion.alcance === 'compra' ? gestion.compra.asientos.join(', ') : gestion.asistentes[0]?.asiento}</strong>
            <span className={pendientes ? 'pending' : 'complete'}>{pendientes ? `${pendientes} pendiente${pendientes === 1 ? '' : 's'}` : 'Datos completos'}</span>
          </aside>
        </section>

        <form className="attendee-form" onSubmit={enviarFormulario}>
          <div className="attendee-list">
            {gestion.asistentes.map((asistente, index) => {
              const completo = asistente.datosEstado === 'completo';
              return (
                <article className="attendee-card" key={asistente.registroId}>
                  <div className="attendee-card-head">
                    <div><span>{asistente.esComprador ? 'Comprador' : `Asistente ${index + 1}`}</span><h2>Asiento {asistente.asiento}</h2></div>
                    <i className={completo ? 'complete' : 'pending'}>{completo ? 'Completo' : 'Pendiente'}</i>
                  </div>

                  {!asistente.esComprador && gestion.alcance === 'compra' && gestion.compra.comprador.correo ? (
                    <button className="attendee-autofill" type="button" onClick={() => usarContactoComprador(asistente.registroId)}>
                      Usar correo y teléfono del comprador
                    </button>
                  ) : null}

                  <div className="attendee-grid">
                    <label className="attendee-wide"><span>Nombre completo <em>Opcional</em></span><input value={asistente.nombre} onChange={(event) => actualizar(asistente.registroId, 'nombre', event.target.value)} autoComplete="name" placeholder="Nombre y apellidos" /></label>
                    <label><span>Correo electrónico <em>Opcional</em></span><input type="email" value={asistente.correo} onChange={(event) => actualizar(asistente.registroId, 'correo', event.target.value)} autoComplete="email" placeholder="nombre@correo.com" /></label>
                    <label><span>Teléfono <em>Opcional</em></span><input type="tel" value={asistente.telefono} onChange={(event) => actualizar(asistente.registroId, 'telefono', event.target.value)} autoComplete="tel" placeholder="+52" /></label>
                    <label><span>Cargo o especialidad <em>Opcional</em></span><input value={asistente.cargo} onChange={(event) => actualizar(asistente.registroId, 'cargo', event.target.value)} placeholder="Dermatóloga, especialista…" /></label>
                    <label><span>Empresa o consultorio <em>Opcional</em></span><input value={asistente.empresa} onChange={(event) => actualizar(asistente.registroId, 'empresa', event.target.value)} autoComplete="organization" placeholder="Empresa o lugar de trabajo" /></label>
                    <label className="attendee-wide"><span>Presentación breve <em>Opcional</em></span><textarea rows={3} value={asistente.bio} onChange={(event) => actualizar(asistente.registroId, 'bio', event.target.value)} placeholder="Descripción profesional breve" /></label>
                    <label><span>Sitio web <em>Opcional</em></span><input value={asistente.sitioWeb} onChange={(event) => actualizar(asistente.registroId, 'sitioWeb', event.target.value)} autoComplete="url" placeholder="https://" /></label>
                    <label><span>LinkedIn <em>Opcional</em></span><input value={asistente.linkedinWeb} onChange={(event) => actualizar(asistente.registroId, 'linkedinWeb', event.target.value)} autoComplete="url" placeholder="Perfil profesional" /></label>
                    <label><span>Instagram <em>Opcional</em></span><input value={asistente.instagram} onChange={(event) => actualizar(asistente.registroId, 'instagram', event.target.value)} autoComplete="off" placeholder="@usuario" /></label>
                  </div>

                  <div className="attendee-privacy">
                    <label><input type="checkbox" checked={asistente.mostrarCorreo} onChange={(event) => actualizar(asistente.registroId, 'mostrarCorreo', event.target.checked)} />Mostrar correo</label>
                    <label><input type="checkbox" checked={asistente.mostrarTelefono} onChange={(event) => actualizar(asistente.registroId, 'mostrarTelefono', event.target.checked)} />Mostrar teléfono</label>
                    <label><input type="checkbox" checked={asistente.mostrarSitioWeb} onChange={(event) => actualizar(asistente.registroId, 'mostrarSitioWeb', event.target.checked)} />Mostrar sitio web</label>
                    <label><input type="checkbox" checked={asistente.mostrarLinkedin} onChange={(event) => actualizar(asistente.registroId, 'mostrarLinkedin', event.target.checked)} />Mostrar LinkedIn</label>
                    <label><input type="checkbox" checked={asistente.mostrarInstagram} onChange={(event) => actualizar(asistente.registroId, 'mostrarInstagram', event.target.checked)} />Mostrar Instagram</label>
                    <label><input type="checkbox" checked={asistente.tarjetaVisible} onChange={(event) => actualizar(asistente.registroId, 'tarjetaVisible', event.target.checked)} />Tarjeta visible</label>
                  </div>

                  <label className="attendee-consent">
                    <input type="checkbox" checked={asistente.consentimientoPublicacion} onChange={(event) => actualizar(asistente.registroId, 'consentimientoPublicacion', event.target.checked)} />
                    <span>Autorizo que estos datos se utilicen para mi tarjeta virtual. Puedo asistir aunque no active esta opción.</span>
                  </label>

                  {!asistente.esComprador && gestion.alcance === 'compra' ? (
                    <div className="attendee-share">
                      <p><strong>¿Prefieres que esta persona lo rellene?</strong><span>Escribe su correo arriba o copia un enlace para enviarlo por tu cuenta.</span></p>
                      <button type="button" disabled={Boolean(invitando) || guardando} onClick={() => void enviarInvitacion(asistente)}>
                        {invitando === asistente.registroId ? 'Preparando…' : asistente.correo ? 'Enviar enlace individual' : 'Copiar enlace individual'}
                      </button>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>

          {error ? <p className="attendee-message error" role="alert">{error}</p> : null}
          {mensaje ? <p className="attendee-message success" role="status">{mensaje}</p> : null}

          <footer className="attendee-actions">
            <div><strong>No necesitas terminar ahora.</strong><span>El botón “Guardar y rellenar después” conserva incluso formularios incompletos.</span></div>
            <button className="attendee-later" type="button" disabled={guardando} onClick={() => void guardar(false)}>{guardando ? 'Guardando…' : 'Guardar y rellenar después'}</button>
            <button className="attendee-finish" type="submit" disabled={guardando}>{guardando ? 'Guardando…' : 'Confirmar lo capturado'}</button>
          </footer>
        </form>

        <p className="attendee-security">Tus datos no aparecen en el mapa público. Solo recepción puede consultar el registro completo.</p>
      </div>
    </main>
  );
}
