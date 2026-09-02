'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const links = [
  ['#voces', 'Voces'],
  ['#programa', 'Programa'],
  ['#pases', 'Pases'],
  ['#sede', 'Sede'],
  ['#interes', 'Únete a la lista'],
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;

    const scrollY = window.scrollY;
    const initialHash = window.location.hash;
    const body = document.body;
    const root = document.documentElement;
    const previousBodyStyles = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflow: body.style.overflow,
    };
    const previousOverscrollBehavior = root.style.overscrollBehavior;
    const previousScrollBehavior = root.style.scrollBehavior;

    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';
    body.style.overflow = 'hidden';
    root.style.overscrollBehavior = 'none';

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    window.addEventListener('keydown', closeOnEscape);

    return () => {
      window.removeEventListener('keydown', closeOnEscape);
      body.style.position = previousBodyStyles.position;
      body.style.top = previousBodyStyles.top;
      body.style.width = previousBodyStyles.width;
      body.style.overflow = previousBodyStyles.overflow;
      root.style.overscrollBehavior = previousOverscrollBehavior;
      root.style.scrollBehavior = 'auto';

      window.requestAnimationFrame(() => {
        if (window.location.hash === initialHash) window.scrollTo(0, scrollY);
        window.requestAnimationFrame(() => {
          root.style.scrollBehavior = previousScrollBehavior;
        });
      });
    };
  }, [open]);

  return (
    <div className={`mobile-nav${open ? ' is-open' : ''}`}>
      <button className="mobile-nav-toggle" type="button" aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen((value) => !value)}>
        <span className="mobile-nav-icon" aria-hidden="true"><i /><i /><i /></span>
        <span>Menú</span>
      </button>
      {mounted && open ? createPortal(
        <>
          <button className="mobile-nav-backdrop" type="button" aria-label="Cerrar menú" onClick={() => setOpen(false)} />
          <nav className="mobile-nav-panel" id="mobile-navigation" aria-label="Navegación para teléfono">
            {links.map(([href, label]) => <a href={href} key={href} onClick={() => setOpen(false)}>{label}</a>)}
          </nav>
        </>,
        document.body,
      ) : null}
    </div>
  );
}
