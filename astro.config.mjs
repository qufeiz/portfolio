// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// Hosted at https://qufeiz.github.io/portfolio/ (GitHub Pages project subpath).
// `site` + `base` must be set so every internal link / asset resolves under /portfolio/.
// In templates we always build URLs from import.meta.env.BASE_URL so nothing hardcodes "/".
export default defineConfig({
  site: 'https://qufeiz.github.io',
  base: '/portfolio',
  trailingSlash: 'ignore',
  output: 'static',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
