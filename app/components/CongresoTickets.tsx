'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const WEBHOOK_SERVER = 'https://dermalysse-webhook-production.up.railway.app';

type Fichas = {
  ficha1Nombre: string;
  ficha1Precio: number;
  ficha2Nombre: string;
  ficha2Precio: number;
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
    fetch(`${WEBHOOK_SERVER}/congreso/precios`)
      .then((r) => (r.ok ? (r.json() as Promise<Fichas>) : null))
      .then((data) => {
        if (data && data.ficha1Nombre) setFichas(data);
      })
      .catch(() => {});
  }, []);

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
