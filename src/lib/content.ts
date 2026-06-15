// Content helpers — scale-ready sorting + the project↔article cross-link.
//
// The taxonomy convention (see src/content/SCHEMA.md): an article ABOUT a
// project is tagged with that project's slug (e.g. `treaxe`). The article lives
// ONCE in /writing; it merely SURFACES on the project's case page via
// `relatedArticles(projectSlug)`. No duplication of content.
import { getCollection, render, type CollectionEntry } from 'astro:content';

export type Article = CollectionEntry<'articles'>;

/** All published (non-draft) articles, hub first (order 0) then ascending. */
export async function publishedArticles(): Promise<Article[]> {
  const articles = await getCollection('articles', ({ data }) => !data.draft);
  return articles.sort((a, b) => a.data.order - b.data.order);
}

/**
 * Articles whose `tags` include the given project slug — the project's "Related
 * writing". Returns [] when none match (caller renders nothing). The article is
 * NOT moved or copied; it stays in /writing and is only surfaced here.
 */
export async function relatedArticles(projectSlug: string): Promise<Article[]> {
  const articles = await publishedArticles();
  return articles.filter((a) => a.data.tags.includes(projectSlug));
}

/**
 * Map of article id → "X min read", computed at build time from each article's
 * `remarkPluginFrontmatter.minutesRead` (injected by the remarkReadingTime
 * plugin in astro.config.mjs). Lets the /writing index show reading time
 * without each page re-deriving it. Articles missing the field are absent.
 */
export async function articleReadingTimes(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  for (const a of await publishedArticles()) {
    const { remarkPluginFrontmatter } = await render(a);
    const mins = remarkPluginFrontmatter?.minutesRead;
    if (typeof mins === 'string') map.set(a.id, mins);
  }
  return map;
}

/** Top N articles for the curated home page (hub + lowest order). Fixed size. */
export async function recentArticles(n = 3): Promise<Article[]> {
  return (await publishedArticles()).slice(0, n);
}

/** Distinct tags across all published articles, with counts (for /writing). */
export async function articleTagCounts(): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  for (const a of await publishedArticles()) {
    for (const t of a.data.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return counts;
}

/**
 * Published-article count per `category` value (for the /writing category rail).
 * Returns a Map keyed by the category value; categories with zero articles are
 * simply absent (the rail still shows them, with a 0, off the CATEGORIES order).
 */
export async function articleCategoryCounts(): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  for (const a of await publishedArticles()) {
    const c = a.data.category;
    counts.set(c, (counts.get(c) ?? 0) + 1);
  }
  return counts;
}
