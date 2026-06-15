// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// --- Blog-enhancement integrations (all BUILD-TIME / static-safe) -----------
// Everything below renders at build time or with a tiny client script — NO
// headless browser is needed at build, so it builds anywhere (GitHub Pages).
import mermaid from 'astro-mermaid';                 // ```mermaid → client-rendered SVG (dark-aware)
import expressiveCode from 'astro-expressive-code';  // build-time Shiki code blocks (Shiki, copy, diff, focus, titles)
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers';
import readingTime from 'reading-time';              // word-count → "X min read"
import { toString as mdToString } from 'mdast-util-to-string';
import remarkDirective from 'remark-directive';      // :::note / :::tip / :::warning callout syntax

const BASE = '/portfolio';

// ---------------------------------------------------------------------------
// rehypeBasePaths — prepend the /portfolio base to ROOT-RELATIVE links/assets
// authored inside rendered MARKDOWN article bodies. Astro applies the base to
// its own templates/helpers, but NOT to hrefs/srcs written in markdown — so a
// cross-link like `[x](/notes/x)` would otherwise miss the /portfolio subpath.
// Article authors keep writing base-agnostic root-relative links (per
// src/content/SCHEMA.md). Absolute (http...), in-page (#...), and already-based
// links are left untouched.
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// remarkReadingTime — inject `minutesRead` (e.g. "4 min read") into each
// article's frontmatter at build time, derived from the rendered markdown body.
// Surfaced on article pages (and the /writing index). Build-only, zero runtime.
// ---------------------------------------------------------------------------
function remarkReadingTime() {
  return (tree, file) => {
    const text = mdToString(tree);
    const stats = readingTime(text);
    file.data.astro.frontmatter.minutesRead = stats.text; // "X min read"
  };
}

// ---------------------------------------------------------------------------
// remarkCallouts — turn remark-directive container syntax into styled callout
// blocks, e.g.:
//   :::note      → neutral / spark (teal)
//   :::tip       → teal (spark)
//   :::warning   → amber
//   :::caution   → rust
// Authors write:
//   :::tip{title="Heads up"}
//   Body markdown here.
//   :::
// We emit a <aside class="callout callout-<kind>"> with an optional title; the
// design-token styling lives in src/styles/global.css. Runs AFTER
// remark-directive has parsed the `:::` blocks into directive nodes.
// ---------------------------------------------------------------------------
const CALLOUT_KINDS = new Set(['note', 'tip', 'warning', 'caution', 'important']);
const CALLOUT_LABEL = {
  note: 'Note',
  tip: 'Tip',
  warning: 'Warning',
  caution: 'Caution',
  important: 'Important',
};
function remarkCallouts() {
  return (tree) => {
    const visit = (node) => {
      if (node.children) node.children.forEach(visit);
      if (node.type === 'containerDirective' && CALLOUT_KINDS.has(node.name)) {
        const kind = node.name;
        const data = node.data || (node.data = {});
        // Title: from {title="..."} attribute, else the default label.
        const title = node.attributes?.title || CALLOUT_LABEL[kind];
        data.hName = 'aside';
        data.hProperties = { className: ['callout', `callout-${kind}`] };
        // Prepend a title row inside the aside.
        node.children.unshift({
          type: 'paragraph',
          data: { hName: 'p', hProperties: { className: ['callout-title'] } },
          children: [{ type: 'text', value: title }],
        });
      }
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
  integrations: [
    // mermaid MUST come first — it registers its own remark/rehype passes and
    // expects to process ```mermaid fences before other markdown processors.
    // theme:'dark' is the default; autoTheme keeps it correct if a data-theme
    // toggle is ever added. This is a dark-only site (no data-theme attr), so it
    // resolves to the dark theme on every page.
    mermaid({
      theme: 'dark',
      autoTheme: true,
    }),
    // expressive-code enhances every fenced code block in markdown at BUILD time
    // (Shiki highlighting + frames/titles + copy button + diff/focus markers +
    // optional line numbers). No browser needed.
    expressiveCode({
      themes: ['github-dark'], // warm-friendly dark theme that fits the ink palette
      plugins: [pluginLineNumbers()],
      // Copy button is on by default; show language/title frame chrome.
      styleOverrides: {
        borderRadius: '2px',           // matches --radius
        borderColor: '#2c281f',        // --color-line
        codeFontFamily:
          '"JetBrains Mono", "SFMono-Regular", ui-monospace, monospace', // --font-mono
        frames: {
          editorActiveTabIndicatorTopColor: '#e8a13c', // --color-amber
          frameBoxShadowCssValue: 'none',
        },
      },
      defaultProps: {
        // Line numbers off by default; opt in per-block with showLineNumbers.
        showLineNumbers: false,
      },
    }),
    sitemap(),
  ],
  markdown: {
    // remark-directive parses `:::` blocks; remarkCallouts maps the callout
    // kinds to styled <aside>s; remarkReadingTime injects minutesRead.
    remarkPlugins: [remarkDirective, remarkCallouts, remarkReadingTime],
    rehypePlugins: [rehypeBasePaths],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
