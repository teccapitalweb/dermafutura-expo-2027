// Build estatico para GitHub Pages.
//
// Next aplica basePath a sus propios assets (_next/*), pero NO reescribe rutas
// absolutas escritas a mano: los <img src="/images/..."> de app/page.tsx ni el
// url(/images/...) de globals.css. Como el sitio se sirve en la subruta
// /dermafutura-expo-2027/, aqui se prefijan esas rutas sobre el export ya
// generado. El codigo fuente queda intacto, asi que el deploy normal a
// ChatGPT Sites / Cloudflare (que sirve en la raiz) sigue funcionando igual.
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const BASE_PATH = '/dermafutura-expo-2027';
const OUT_DIR = 'out';
const REWRITABLE = ['.html', '.css', '.txt', '.js'];

execFileSync('npx', ['next', 'build'], {
  stdio: 'inherit',
  env: { ...process.env, GH_PAGES: '1' },
  shell: true,
});

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

let patched = 0;
for (const file of walk(OUT_DIR)) {
  if (!REWRITABLE.some((ext) => file.endsWith(ext))) continue;
  const original = readFileSync(file, 'utf8');
  // Solo rutas que aun no llevan el prefijo, para que el script sea idempotente.
  const updated = original.replaceAll(
    /(["'(])\/images\//g,
    `$1${BASE_PATH}/images/`,
  );
  if (updated !== original) {
    writeFileSync(file, updated);
    patched += 1;
  }
}

// GitHub Pages corre Jekyll por defecto y Jekyll ignora los directorios que
// empiezan con guion bajo, lo que borraria todo _next/. Este archivo lo evita.
writeFileSync(join(OUT_DIR, '.nojekyll'), '');

console.log(`\nGitHub Pages listo: ${patched} archivo(s) con rutas /images/ prefijadas, .nojekyll escrito.`);
