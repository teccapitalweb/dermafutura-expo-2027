'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

const WEBHOOK_SERVER = 'https://dermalysse-webhook-production.up.railway.app';
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{32,96}$/;

type Perfil = {
  nombre: string;
  cargo: string;
  empresa: string;
  bio: string;
  correo: string;
  telefono: string;
  sitioWeb: string;
  linkedin: string;
  instagram: string;
};

type TarjetaRespuesta = {
  status: 'disponible' | 'privada' | 'publicada';
  codigo?: string;
  perfil?: Perfil;
  error?: string;
};

type Estado =
  | { tipo: 'cargando' }
  | { tipo: 'error'; mensaje: string }
  | { tipo: 'disponible'; codigo: string }
  | { tipo: 'privada'; codigo: string }
  | { tipo: 'publicada'; codigo: string; perfil: Perfil };

type Icono = 'phone' | 'mail' | 'web' | 'linkedin' | 'instagram';
type AccionIcono = 'contact' | 'share' | 'download';

function Icon({ name }: { name: Icono }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (name === 'phone') return <svg viewBox="0 0 24 24" {...common}><path d="M7.2 3.5 4.6 4.7c-1.1.5-1.5 1.8-1.1 2.9 2.1 6.1 6.8 10.8 12.9 12.9 1.1.4 2.4 0 2.9-1.1l1.2-2.6-4.2-2-1.5 2c-3.4-1.4-6.2-4.2-7.6-7.6l2-1.5-2-4.2Z" /></svg>;
  if (name === 'mail') return <svg viewBox="0 0 24 24" {...common}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></svg>;
  if (name === 'web') return <svg viewBox="0 0 24 24" {...common}><circle cx="12" cy="12" r="9" /><path d="M3.5 12h17M12 3c2.4 2.5 3.7 5.5 3.7 9S14.4 18.5 12 21c-2.4-2.5-3.7-5.5-3.7-9S9.6 5.5 12 3Z" /></svg>;
  if (name === 'linkedin') return <svg viewBox="0 0 24 24" {...common}><rect x="4" y="9" width="3.5" height="10" /><circle cx="5.8" cy="5.6" r="1.8" /><path d="M11 19V9h3.4v1.7c.9-1.3 2.2-2 3.7-2 2.1 0 3.9 1.4 3.9 4.7V19h-3.6v-5c0-1.5-.6-2.4-1.9-2.4-1.4 0-2 1-2 2.8V19H11Z" /></svg>;
  return <svg viewBox="0 0 24 24" {...common}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>;
}

function AccionIcon({ name }: { name: AccionIcono }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (name === 'contact') return <svg viewBox="0 0 24 24" {...common}><path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h4" /><circle cx="12" cy="8" r="3" /><path d="M7.5 17c.7-2.5 2.2-3.8 4.5-3.8s3.8 1.3 4.5 3.8" /></svg>;
  if (name === 'share') return <svg viewBox="0 0 24 24" {...common}><circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" /><path d="m8.2 10.8 7.6-4.5M8.2 13.2l7.6 4.5" /></svg>;
  return <svg viewBox="0 0 24 24" {...common}><path d="M12 3v12m0 0 4.5-4.5M12 15l-4.5-4.5" /><path d="M5 19h14" /></svg>;
}

function urlSegura(value: string, red?: 'linkedin' | 'instagram'): string {
  const raw = String(value || '').trim();
  if (!raw) return '';
  let candidate = raw;
  if (red === 'instagram' && !/^https?:\/\//i.test(candidate)) {
    candidate = `https://instagram.com/${candidate.replace(/^@/, '')}`;
  } else if (red === 'linkedin' && !/^https?:\/\//i.test(candidate)) {
    candidate = candidate.includes('.') ? `https://${candidate}` : `https://linkedin.com/in/${candidate.replace(/^@/, '')}`;
  } else if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate}`;
  }
  try {
    const parsed = new URL(candidate);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.toString() : '';
  } catch {
    return '';
  }
}

function iniciales(nombre: string): string {
  return nombre.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'BS';
}

function descargarArchivo(contenido: Blob, nombre: string) {
  const url = URL.createObjectURL(contenido);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function escaparVcard(value: string): string {
  return String(value || '').replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/([,;])/g, '\\$1');
}

function nombreSeguro(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'contacto';
}

export default function TarjetaVirtual() {
  const [estado, setEstado] = useState<Estado>({ tipo: 'cargando' });

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('id')?.trim() || '';
    if (!TOKEN_PATTERN.test(token)) {
      const invalidFrame = window.requestAnimationFrame(() => {
        setEstado({ tipo: 'error', mensaje: 'Este enlace no corresponde a una tarjeta válida.' });
      });
      return () => window.cancelAnimationFrame(invalidFrame);
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12000);
    fetch(`${WEBHOOK_SERVER}/congreso/tarjeta/${encodeURIComponent(token)}`, {
      cache: 'no-store',
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({})) as TarjetaRespuesta;
        if (response.status === 403 || data.status === 'privada') return { ...data, status: 'privada' as const };
        if (!response.ok) throw new Error(data.error || 'No pudimos abrir esta tarjeta.');
        return data;
      })
      .then((data) => {
        const codigo = data.codigo || 'QR';
        if (data.status === 'publicada' && data.perfil?.nombre) {
          setEstado({ tipo: 'publicada', codigo, perfil: data.perfil });
        } else if (data.status === 'privada') {
          setEstado({ tipo: 'privada', codigo });
        } else {
          setEstado({ tipo: 'disponible', codigo });
        }
      })
      .catch((error: unknown) => {
        const mensaje = error instanceof DOMException && error.name === 'AbortError'
          ? 'La conexión tardó demasiado. Revisa tu internet e inténtalo otra vez.'
          : error instanceof Error ? error.message : 'No pudimos abrir esta tarjeta.';
        setEstado({ tipo: 'error', mensaje });
      })
      .finally(() => window.clearTimeout(timeout));

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  if (estado.tipo !== 'publicada') {
    const cargando = estado.tipo === 'cargando';
    const titulo = cargando ? 'Abriendo conexión' : estado.tipo === 'disponible' ? 'Tarjeta disponible' : estado.tipo === 'privada' ? 'Perfil no disponible' : 'No encontramos la tarjeta';
    const mensaje = cargando ? 'Estamos preparando la tarjeta profesional.' : estado.tipo === 'disponible' ? 'Esta tarjeta todavía no ha sido vinculada. Preséntala en recepción para asignarla a tu ficha.' : estado.tipo === 'privada' ? 'La persona propietaria decidió pausar temporalmente la visualización de sus datos.' : estado.mensaje;
    const codigo = estado.tipo === 'disponible' || estado.tipo === 'privada' ? estado.codigo : 'BIO SKIN / 2026';
    return (
      <main className="digital-card-page">
        <div className="digital-card-grain" />
        <section className="digital-card-state" aria-live="polite">
          <div className={`digital-card-state-mark${cargando ? ' is-loading' : ''}`}><span /></div>
          <p className="digital-card-eyebrow">BIO SKIN Congress 2026</p>
          <h1>{titulo}</h1>
          <p>{mensaje}</p>
          <span className="digital-card-code">{codigo}</span>
        </section>
      </main>
    );
  }

  return <TarjetaPublicada codigo={estado.codigo} perfil={estado.perfil} />;
}

function TarjetaPublicada({ codigo, perfil }: { codigo: string; perfil: Perfil }) {
  const [mensajeAccion, setMensajeAccion] = useState('');
  const [generandoPdf, setGenerandoPdf] = useState(false);
  const contactos = useMemo(() => {
    const items: Array<{ icon: Icono; label: string; href: string }> = [];
    const tel = perfil.telefono.replace(/[^+\d]/g, '');
    if (tel) items.push({ icon: 'phone', label: 'Llamar', href: `tel:${tel}` });
    if (perfil.correo) items.push({ icon: 'mail', label: 'Correo', href: `mailto:${perfil.correo}` });
    const web = urlSegura(perfil.sitioWeb);
    const linkedin = urlSegura(perfil.linkedin, 'linkedin');
    const instagram = urlSegura(perfil.instagram, 'instagram');
    if (web) items.push({ icon: 'web', label: 'Sitio web', href: web });
    if (linkedin) items.push({ icon: 'linkedin', label: 'LinkedIn', href: linkedin });
    if (instagram) items.push({ icon: 'instagram', label: 'Instagram', href: instagram });
    return items;
  }, [perfil]);

  function guardarContacto() {
    const partes = perfil.nombre.trim().split(/\s+/);
    const apellido = partes.length > 1 ? partes.pop() || '' : '';
    const nombres = partes.join(' ') || perfil.nombre;
    const lineas = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `N:${escaparVcard(apellido)};${escaparVcard(nombres)};;;`,
      `FN:${escaparVcard(perfil.nombre)}`,
      perfil.empresa && `ORG:${escaparVcard(perfil.empresa)}`,
      perfil.cargo && `TITLE:${escaparVcard(perfil.cargo)}`,
      perfil.telefono && `TEL;TYPE=CELL:${escaparVcard(perfil.telefono)}`,
      perfil.correo && `EMAIL;TYPE=INTERNET:${escaparVcard(perfil.correo)}`,
      perfil.sitioWeb && `URL:${escaparVcard(urlSegura(perfil.sitioWeb))}`,
      perfil.linkedin && `X-SOCIALPROFILE;TYPE=linkedin:${escaparVcard(urlSegura(perfil.linkedin, 'linkedin'))}`,
      perfil.instagram && `X-SOCIALPROFILE;TYPE=instagram:${escaparVcard(urlSegura(perfil.instagram, 'instagram'))}`,
      perfil.bio && `NOTE:${escaparVcard(perfil.bio)}`,
      'END:VCARD',
    ].filter(Boolean).join('\r\n');
    descargarArchivo(new Blob([lineas], { type: 'text/vcard;charset=utf-8' }), `${nombreSeguro(perfil.nombre)}.vcf`);
    setMensajeAccion('Contacto guardado en formato vCard.');
  }

  async function compartirPerfil() {
    const url = window.location.href;
    const data = { title: `${perfil.nombre} · BIO SKIN Congress 2026`, text: `Conoce el perfil profesional de ${perfil.nombre}.`, url };
    try {
      if (navigator.share) {
        await navigator.share(data);
        setMensajeAccion('Perfil compartido.');
        return;
      }
      await navigator.clipboard.writeText(url);
      window.location.href = `mailto:?subject=${encodeURIComponent(data.title)}&body=${encodeURIComponent(`${data.text}\n\n${url}`)}`;
      setMensajeAccion('Enlace copiado y correo preparado.');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setMensajeAccion('No fue posible compartir. Copia el enlace desde el navegador.');
    }
  }

  async function descargarPdf() {
    setGenerandoPdf(true);
    setMensajeAccion('Preparando ficha PDF…');
    try {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = 210;
      const pageH = 297;
      pdf.setFillColor(6, 17, 14);
      pdf.rect(0, 0, pageW, pageH, 'F');
      pdf.setDrawColor(127, 230, 194);
      pdf.setLineWidth(.35);
      pdf.circle(25, 24, 10, 'S');
      pdf.setTextColor(245, 250, 248);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text('BS', 25, 27.5, { align: 'center' });
      pdf.setFontSize(13);
      pdf.text('BIO SKIN', 42, 21);
      pdf.setTextColor(127, 230, 194);
      pdf.setFontSize(7);
      pdf.text('CONGRESS 2026 / PROFESSIONAL NETWORK', 42, 27);
      pdf.setDrawColor(44, 78, 68);
      pdf.line(15, 41, 195, 41);

      pdf.setFillColor(10, 32, 25);
      pdf.roundedRect(15, 54, 48, 58, 3, 3, 'F');
      pdf.setDrawColor(20, 184, 166);
      pdf.rect(19, 58, 40, 50, 'S');
      pdf.setTextColor(245, 250, 248);
      pdf.setFontSize(27);
      pdf.text(iniciales(perfil.nombre), 39, 88, { align: 'center' });

      pdf.setTextColor(127, 230, 194);
      pdf.setFontSize(7);
      pdf.text('TARJETA PROFESIONAL / NETWORKING', 73, 59);
      pdf.setTextColor(245, 250, 248);
      pdf.setFontSize(25);
      const nombreLineas = pdf.splitTextToSize(perfil.nombre, 120).slice(0, 3);
      pdf.text(nombreLineas, 73, 72);
      const nombreAlto = nombreLineas.length * 10;
      let y = 72 + nombreAlto + 5;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      if (perfil.cargo) { pdf.text(pdf.splitTextToSize(perfil.cargo, 118), 73, y); y += 8; }
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(144, 169, 160);
      if (perfil.empresa) { pdf.text(pdf.splitTextToSize(perfil.empresa, 118), 73, y); y += 8; }

      let bloqueY = Math.max(128, y + 10);
      if (perfil.bio) {
        pdf.setDrawColor(44, 78, 68);
        pdf.line(15, bloqueY, 195, bloqueY);
        bloqueY += 12;
        pdf.setTextColor(196, 211, 205);
        pdf.setFontSize(10);
        const bioLineas = pdf.splitTextToSize(perfil.bio, 180).slice(0, 9);
        pdf.text(bioLineas, 15, bloqueY);
        bloqueY += bioLineas.length * 6 + 8;
      }

      pdf.setFillColor(245, 250, 248);
      pdf.roundedRect(15, bloqueY, 180, 52, 4, 4, 'F');
      pdf.setTextColor(6, 17, 14);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.text('CONTACTO PROFESIONAL', 23, bloqueY + 12);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      const detalles = [perfil.telefono, perfil.correo, perfil.sitioWeb, perfil.linkedin, perfil.instagram].filter(Boolean);
      detalles.slice(0, 5).forEach((detalle, index) => pdf.text(pdf.splitTextToSize(String(detalle), 155)[0], 23, bloqueY + 22 + index * 6));

      pdf.setTextColor(127, 230, 194);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7);
      pdf.text('CONEXIONES QUE QUEDAN', 15, 280);
      pdf.setTextColor(144, 169, 160);
      pdf.setFont('helvetica', 'normal');
      pdf.text(codigo, 195, 280, { align: 'right' });
      pdf.setFontSize(6.5);
      pdf.text(pdf.splitTextToSize(window.location.href, 180)[0], 15, 287);
      pdf.save(`${codigo}-${nombreSeguro(perfil.nombre)}.pdf`);
      setMensajeAccion('Ficha PDF descargada.');
    } catch {
      setMensajeAccion('No pudimos generar el PDF. Inténtalo otra vez.');
    } finally {
      setGenerandoPdf(false);
    }
  }

  return (
    <main className="digital-card-page digital-card-published">
      <div className="digital-card-grain" />
      <div className="digital-card-orbit digital-card-orbit-a" />
      <div className="digital-card-orbit digital-card-orbit-b" />
      <section className="digital-card-shell">
        <header className="digital-card-header">
          <Link className="digital-card-brand" href="/" aria-label="Ir a BIO SKIN Congress 2026">
            <span className="digital-card-brand-mark">BS</span>
            <span>BIO SKIN<small>Congress 2026</small></span>
          </Link>
          <span className="digital-card-code">{codigo}</span>
        </header>

        <div className="digital-card-profile">
          <div className="digital-card-profile-main">
            <div className="digital-card-monogram" aria-hidden="true"><span>{iniciales(perfil.nombre)}</span></div>
            <div className="digital-card-copy">
              <p className="digital-card-eyebrow">Tarjeta profesional / Networking</p>
              <h1>{perfil.nombre}</h1>
              {(perfil.cargo || perfil.empresa) && (
                <div className="digital-card-role">
                  {perfil.cargo && <strong>{perfil.cargo}</strong>}
                  {perfil.empresa && <span>{perfil.empresa}</span>}
                </div>
              )}
            </div>
          </div>
          {perfil.bio && <p className="digital-card-bio">{perfil.bio}</p>}
        </div>

        {contactos.length > 0 && (
          <nav className="digital-card-contacts" aria-label="Datos de contacto">
            {contactos.map((contacto) => {
              const externo = contacto.href.startsWith('http');
              return (
                <a key={`${contacto.icon}-${contacto.href}`} href={contacto.href} aria-label={contacto.label} title={contacto.label} target={externo ? '_blank' : undefined} rel={externo ? 'noopener noreferrer' : undefined}>
                  <Icon name={contacto.icon} />
                  <span>{contacto.label}</span>
                </a>
              );
            })}
          </nav>
        )}

        <div className="digital-card-actions" aria-label="Acciones del perfil">
          <button type="button" onClick={guardarContacto}><AccionIcon name="contact" /><span><strong>Guardar contacto</strong><small>Descargar vCard</small></span></button>
          <button type="button" onClick={compartirPerfil}><AccionIcon name="share" /><span><strong>Compartir perfil</strong><small>Correo, WhatsApp y más</small></span></button>
          <button type="button" onClick={descargarPdf} disabled={generandoPdf}><AccionIcon name="download" /><span><strong>{generandoPdf ? 'Preparando PDF…' : 'Descargar ficha PDF'}</strong><small>Guardar una copia</small></span></button>
        </div>
        <p className="digital-card-action-message" role="status" aria-live="polite">{mensajeAccion}</p>

        <div className="digital-card-footer">
          <div><small>Conexiones que quedan</small><strong>Dermatología · Ciencia · Futuro</strong></div>
          <span>Perfil compartido con autorización</span>
        </div>
      </section>

    </main>
  );
}
