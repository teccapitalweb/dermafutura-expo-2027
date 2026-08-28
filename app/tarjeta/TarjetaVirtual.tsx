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

function Icon({ name }: { name: Icono }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (name === 'phone') return <svg viewBox="0 0 24 24" {...common}><path d="M7.2 3.5 4.6 4.7c-1.1.5-1.5 1.8-1.1 2.9 2.1 6.1 6.8 10.8 12.9 12.9 1.1.4 2.4 0 2.9-1.1l1.2-2.6-4.2-2-1.5 2c-3.4-1.4-6.2-4.2-7.6-7.6l2-1.5-2-4.2Z" /></svg>;
  if (name === 'mail') return <svg viewBox="0 0 24 24" {...common}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></svg>;
  if (name === 'web') return <svg viewBox="0 0 24 24" {...common}><circle cx="12" cy="12" r="9" /><path d="M3.5 12h17M12 3c2.4 2.5 3.7 5.5 3.7 9S14.4 18.5 12 21c-2.4-2.5-3.7-5.5-3.7-9S9.6 5.5 12 3Z" /></svg>;
  if (name === 'linkedin') return <svg viewBox="0 0 24 24" {...common}><rect x="4" y="9" width="3.5" height="10" /><circle cx="5.8" cy="5.6" r="1.8" /><path d="M11 19V9h3.4v1.7c.9-1.3 2.2-2 3.7-2 2.1 0 3.9 1.4 3.9 4.7V19h-3.6v-5c0-1.5-.6-2.4-1.9-2.4-1.4 0-2 1-2 2.8V19H11Z" /></svg>;
  return <svg viewBox="0 0 24 24" {...common}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>;
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
          <div className="digital-card-monogram" aria-hidden="true"><span>{iniciales(perfil.nombre)}</span></div>
          <div className="digital-card-copy">
            <p className="digital-card-eyebrow">Tarjeta profesional / Networking</p>
            <h1>{perfil.nombre}</h1>
            {(perfil.cargo || perfil.empresa) && (
              <p className="digital-card-role">
                {perfil.cargo && <strong>{perfil.cargo}</strong>}
                {perfil.cargo && perfil.empresa && <span> / </span>}
                {perfil.empresa}
              </p>
            )}
            {perfil.bio && <p className="digital-card-bio">{perfil.bio}</p>}
          </div>
        </div>

        <div className="digital-card-footer">
          <div><small>Conexiones que quedan</small><strong>Dermatología · Ciencia · Futuro</strong></div>
          <span>Perfil compartido con autorización</span>
        </div>
      </section>

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
    </main>
  );
}
