'use client';

import { useEffect, useState } from 'react';
import programa from '../../data/programa.json';

type Bloque = {
  id: string;
  hora: string;
  type: string;
  title: string;
  detalle: string;
  ponente?: string;
  rol?: string;
  destacado?: boolean;
};

function minutosDesdeMedianoche(hora: string): number {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + (m || 0);
}

function iniciales(nombre: string): string {
  return nombre
    .replace(/^(Dr\.|Dra\.)\s*/i, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('');
}

// Bloque cuya hora de inicio es la más reciente que ya pasó (o es ahora mismo),
// sin pasar de la última actividad del día. Antes de que empiece el programa, ninguno está activo.
function calcularBloqueEnCurso(bloques: Bloque[], ahoraMin: number): string | null {
  let activo: string | null = null;
  for (const b of bloques) {
    if (minutosDesdeMedianoche(b.hora) <= ahoraMin) activo = b.id;
    else break;
  }
  return activo;
}

export default function ScheduleList() {
  const [activo, setActivo] = useState<string | null>(null);
  const [enCurso, setEnCurso] = useState<string | null>(null);

  useEffect(() => {
    const actualizar = () => {
      const ahora = new Date();
      setEnCurso(calcularBloqueEnCurso(programa as Bloque[], ahora.getHours() * 60 + ahora.getMinutes()));
    };
    actualizar();
    const id = setInterval(actualizar, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="schedule">
      {(programa as Bloque[]).map((item) => {
        const abierto = activo === item.id;
        const esAhora = enCurso === item.id;
        return (
          <article
            key={item.id}
            className={`${item.destacado ? 'is-featured ' : ''}${abierto ? 'is-open ' : ''}${esAhora ? 'is-now' : ''}`}
            onClick={() => setActivo(abierto ? null : item.id)}
            role="button"
            tabIndex={0}
            aria-expanded={abierto}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setActivo(abierto ? null : item.id);
              }
            }}
          >
            <time>{item.hora}</time>
            <div className="schedule-main">
              <small>{item.type}</small>
              {esAhora && <span className="schedule-live"><i></i>En curso</span>}
              <h3>{item.title}</h3>
              {item.ponente && (
                <div className="schedule-ponente">
                  <span className="schedule-ponente-avatar" aria-hidden="true">{iniciales(item.ponente)}</span>
                  <span>{item.ponente}{item.rol ? <em> · {item.rol}</em> : null}</span>
                </div>
              )}
              <div className="schedule-detalle">
                <p>{item.detalle}</p>
              </div>
            </div>
            <span className="schedule-toggle" aria-hidden="true">{abierto ? '–' : '+'}</span>
          </article>
        );
      })}
    </div>
  );
}
