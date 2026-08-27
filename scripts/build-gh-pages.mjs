// Build estatico para GitHub Pages.
//
// Modo SEGURO por default (basePath /dermafutura-expo-2027, como vive hoy en
// teccapitalweb.github.io/dermafutura-expo-2027/). Next aplica basePath a sus
// propios assets (_next/*), pero NO reescribe rutas absolutas escritas a mano:
// los <img src="/images/..."> de app/page.tsx ni el url(/images/...) de
// globals.css. Por eso aqui se prefijan esas rutas sobre el export ya
// generado.
//
// Cuando el dominio propio (congreso.dermalyssemx.com) ya este activo en
// GitHub -> Settings -> Pages, correr con:
//   GH_PAGES_CUSTOM_DOMAIN=1 node scripts/build-gh-pages.mjs
// (sin la variable, o en 0, se queda en modo seguro con basePath).
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const BASE_PATH = '/dermafutura-expo-2027';
const OUT_DIR = 'out';
const REWRITABLE = ['.html', '.css', '.txt', '.js'];
const useCustomDomain = process.env.GH_PAGES_CUSTOM_DOMAIN === '1';

execFileSync('npx', ['next', 'build'], {
  stdio: 'inherit',
  env: { ...process.env, GH_PAGES: '1', GH_PAGES_CUSTOM_DOMAIN: useCustomDomain ? '1' : '0' },
  shell: true,
});

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

let patched = 0;
if (!useCustomDomain) {
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
}

// GitHub Pages corre Jekyll por defecto y Jekyll ignora los directorios que
// empiezan con guion bajo, lo que borraria todo _next/. Este archivo lo evita.
writeFileSync(join(OUT_DIR, '.nojekyll'), '');

console.log(
  useCustomDomain
    ? '\nGitHub Pages listo (dominio propio, sin basePath): .nojekyll escrito.'
    : `\nGitHub Pages listo (modo seguro con basePath): ${patched} archivo(s) con rutas /images/ prefijadas, .nojekyll escrito.`
);
