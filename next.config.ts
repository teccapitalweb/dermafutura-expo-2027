import type { NextConfig } from 'next';

// Build estático para GitHub Pages: `GH_PAGES=1 npx next build`.
// Sin esa variable la configuracion queda vacia, tal como la espera vinext
// para el deploy normal a ChatGPT Sites / Cloudflare.
const isGithubPages = process.env.GH_PAGES === '1';

/*
  Por default (GH_PAGES=1 solo) el build sigue usando basePath
  /dermafutura-expo-2027 — así es como vive HOY en
  teccapitalweb.github.io/dermafutura-expo-2027/. Este es el modo SEGURO,
  no rompe el sitio actual.

  Solo cuando el dominio propio (congreso.dermalyssemx.com) ya esté
  confirmado y activo en GitHub → Settings → Pages, se agrega TAMBIÉN
  GH_PAGES_CUSTOM_DOMAIN=1 al build. Un dominio propio sirve en la RAÍZ,
  así que ahí SÍ hay que quitar el basePath — pero nunca antes de tener el
  dominio funcionando, o se rompe el sitio como acaba de pasar.
*/
const useCustomDomain = process.env.GH_PAGES_CUSTOM_DOMAIN === '1';

const nextConfig: NextConfig = isGithubPages
  ? {
      output: 'export',
      images: { unoptimized: true },
      trailingSlash: true,
      ...(useCustomDomain
        ? {}
        : { basePath: '/dermafutura-expo-2027', assetPrefix: '/dermafutura-expo-2027' }),
    }
  : {};

export default nextConfig;
