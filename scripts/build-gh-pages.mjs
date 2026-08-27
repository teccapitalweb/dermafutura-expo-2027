// Build estatico para GitHub Pages.
//
// El sitio se sirve con dominio propio (congreso.dermalyssemx.com, ver
// public/CNAME), que GitHub Pages sirve en la RAIZ del dominio — por eso el
// export ya no usa basePath ni reescribe rutas /images/ con ningun prefijo
// (ver next.config.ts). Este script solo corre el build y deja lista la
// bandera anti-Jekyll.
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { writeFileSync } from 'node:fs';

const OUT_DIR = 'out';

execFileSync('npx', ['next', 'build'], {
  stdio: 'inherit',
  env: { ...process.env, GH_PAGES: '1' },
  shell: true,
});

// GitHub Pages corre Jekyll por defecto y Jekyll ignora los directorios que
// empiezan con guion bajo, lo que borraria todo _next/. Este archivo lo evita.
writeFileSync(join(OUT_DIR, '.nojekyll'), '');

console.log('\nGitHub Pages listo: build exportado sin basePath (dominio propio en raiz), .nojekyll escrito.');
