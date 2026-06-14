// Base-aware URL helpers. The site is served under /portfolio/ on GitHub Pages,
// so every internal href and asset src MUST be prefixed with BASE_URL. Never
// hardcode a leading "/" for internal resources — route everything through here.

const BASE = import.meta.env.BASE_URL; // e.g. "/portfolio/" (or "/portfolio")

/** Join the configured base with a relative path, collapsing duplicate slashes. */
export function withBase(path: string): string {
  const base = BASE.endsWith('/') ? BASE.slice(0, -1) : BASE;
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${base}${clean}`.replace(/([^:]\/)\/+/g, '$1');
}

/** Internal page link (e.g. work/treaxe → /portfolio/work/treaxe). */
export const link = (path: string) => withBase(path);

/** Public asset reference (e.g. fredgpt/demo.mp4 → /portfolio/fredgpt/demo.mp4). */
export const asset = (path: string) => withBase(path);
