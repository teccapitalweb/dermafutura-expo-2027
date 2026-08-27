import type { NextConfig } from 'next';

// Build estático para GitHub Pages: `GH_PAGES=1 npx next build`.
// Sin esa variable la configuracion queda vacia, tal como la espera vinext
// para el deploy normal a ChatGPT Sites / Cloudflare.
const isGithubPages = process.env.GH_PAGES === '1';

/*
  El sitio ahora se sirve con dominio propio (congreso.dermalyssemx.com, ver
  public/CNAME) — GitHub Pages sirve un dominio propio en la RAÍZ, no bajo
  /dermafutura-expo-2027/. Por eso ya NO se usa basePath/assetPrefix: con el
  dominio propio, cualquier prefijo aquí rompe todas las rutas de imágenes,
  CSS y JS (404 en todo menos el index).

  Si en algún momento hace falta volver a servir SOLO en
  teccapitalweb.github.io/dermafutura-expo-2027 (sin dominio propio, p. ej.
  para probar antes de activar el DNS), agrega de nuevo basePath/assetPrefix
  aquí y en scripts/build-gh-pages.mjs.
*/
const nextConfig: NextConfig = isGithubPages
  ? {
      output: 'export',
      images: { unoptimized: true },
      trailingSlash: true,
    }
  : {};

export default nextConfig;
