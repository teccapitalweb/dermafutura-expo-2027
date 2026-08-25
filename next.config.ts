import type { NextConfig } from 'next';

// Build estático para GitHub Pages: `GH_PAGES=1 npx next build`.
// Sin esa variable la configuracion queda vacia, tal como la espera vinext
// para el deploy normal a ChatGPT Sites / Cloudflare.
const isGithubPages = process.env.GH_PAGES === '1';

const nextConfig: NextConfig = isGithubPages
  ? {
      output: 'export',
      basePath: '/dermafutura-expo-2027',
      assetPrefix: '/dermafutura-expo-2027',
      images: { unoptimized: true },
      trailingSlash: true,
    }
  : {};

export default nextConfig;
