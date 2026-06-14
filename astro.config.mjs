// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

const BASE = '/portfolio';

// Rehype plugin: prepend the configured base to ROOT-RELATIVE links/assets that
// appear inside rendered MARKDOWN (content-collection article bodies). Astro
// applies the base to its own templates/helpers, but NOT to hrefs/srcs authored
// in markdown — so a cross-link like `[x](/notes/x)` would otherwise miss the
// /portfolio subpath. This keeps article authors writing base-agnostic
// root-relative links (per src/content/SCHEMA.md) while resolving correctly on
// GitHub Pages. Absolute (http...), in-page (#...), and already-based links are
// left untouched.
function rehypeBasePaths() {
  const attrByTag = { a: 'href', img: 'src', source: 'src' };
  return (tree) => {
    const visit = (node) => {
      if (node.type === 'element' && attrByTag[node.tagName]) {
        const attr = attrByTag[node.tagName];
        const val = node.properties?.[attr];
        if (
          typeof val === 'string' &&
          val.startsWith('/') &&
          !val.startsWith('//') &&
          !val.startsWith(`${BASE}/`) &&
          val !== BASE
        ) {
          node.properties[attr] = `${BASE}${val}`;
        }
      }
      if (Array.isArray(node.children)) node.children.forEach(visit);
    };
    visit(tree);
  };
}

// Hosted at https://qufeiz.github.io/portfolio/ (GitHub Pages project subpath).
// `site` + `base` must be set so every internal link / asset resolves under /portfolio/.
// In templates we always build URLs from import.meta.env.BASE_URL so nothing hardcodes "/".
export default defineConfig({
  site: 'https://qufeiz.github.io',
  base: BASE,
  trailingSlash: 'ignore',
  output: 'static',
  integrations: [sitemap()],
  markdown: {
    rehypePlugins: [rehypeBasePaths],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
