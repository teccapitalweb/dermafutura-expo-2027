'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const WEBHOOK_SERVER = 'https://dermalysse-webhook-production.up.railway.app';
const CACHE_SALA = 'bioskin-congress-seatmap-v2';

type Fichas = {
  ficha1Nombre: string;
  ficha1Precio: number;
  ficha2Nombre: string;
  ficha2Precio: number;
};

type MapaSalaCache = {
  layout: unknown[];
  asientos: unknown[];
};

const FALLBACK: Fichas = {
  ficha1Nombre: 'Preferente',
  ficha1Precio: 1000,
  ficha2Nombre: 'General',
  ficha2Precio: 500,
};

export default function CongresoTickets() {
  const router = useRouter();
  const [fichas, setFichas] = useState<Fichas>(FALLBACK);

  useEffect(() => {
    router.prefetch('/congreso/asientos?ficha=ficha1');
    router.prefetch('/congreso/asientos?ficha=ficha2');

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 9000);

    fetch(`${WEBHOOK_SERVER}/congreso/precios`, { cache: 'no-store', signal: controller.signal })
      .then((r) => (r.ok ? (r.json() as Promise<Fichas>) : null))
      .then((data) => {
        if (data && data.ficha1Nombre) setFichas(data);
      })
      .catch(() => {});

    fetch(`${WEBHOOK_SERVER}/congreso/asientos`, { cache: 'no-store', signal: controller.signal })
      .then((r) => (r.ok ? (r.json() as Promise<MapaSalaCache>) : null))
      .then((data) => {
        if (data && Array.isArray(data.layout) && Array.isArray(data.asientos)) {
          sessionStorage.setItem(CACHE_SALA, JSON.stringify({ ...data, guardadoEn: Date.now() }));
        }
      })
      .catch(() => {})
      .finally(() => window.clearTimeout(timeout));

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [router]);

  const cards: Array<{ key: 'ficha1' | 'ficha2'; nombre: string; precio: number; zonaTexto: string }> = [
    { key: 'ficha1', nombre: fichas.ficha1Nombre, precio: fichas.ficha1Precio, zonaTexto: 'Filas A–D al frente' },
    { key: 'ficha2', nombre: fichas.ficha2Nombre, precio: fichas.ficha2Precio, zonaTexto: 'Filas E–J' },
  ];

  return (
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
          <button type="button" onClick={() => router.push(`/congreso/asientos?ficha=${c.key}`)}>
            Elegir asiento · Ficha {c.nombre}
          </button>
          <p>Pago seguro con Stripe</p>
        </div>
      ))}
    </div>
  );
}
