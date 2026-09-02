'use client';

import { useState } from 'react';

const links = [
  ['#voces', 'Voces'],
  ['#programa', 'Programa'],
  ['#pases', 'Pases'],
  ['#sede', 'Sede'],
  ['#interes', 'Únete a la lista'],
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className={`mobile-nav${open ? ' is-open' : ''}`}>
      <button type="button" aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen((value) => !value)}>
        <span className="mobile-nav-icon" aria-hidden="true"><i /><i /><i /></span>
        <span>Menú</span>
      </button>
      {open ? (
        <nav className="mobile-nav-panel" id="mobile-navigation" aria-label="Navegación para teléfono">
          {links.map(([href, label]) => <a href={href} key={href} onClick={() => setOpen(false)}>{label}</a>)}
        </nav>
      ) : null}
    </div>
  );
}
