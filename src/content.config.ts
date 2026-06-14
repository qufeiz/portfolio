// ============================================================================
// CONTENT COLLECTIONS — the portfolio's knowledge base (single source of truth)
// ----------------------------------------------------------------------------
// `src/content/` IS the knowledge base. `src/` only RENDERS it; the skills
// (portfolio-write / portfolio-refresh) READ and WRITE `src/content/`. See
// `src/content/SCHEMA.md` for the full conventions + the honesty/confidentiality
// gates baked into the KB.
//
// Astro 6 content-collections API: config lives at the project root as
// `src/content.config.ts`, collections are defined with the `glob()` loader
// from `astro/loaders`, and pages read them via `getCollection` / `getEntry` /
// `render` from `astro:content`.
// ============================================================================
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// --- articles --------------------------------------------------------------
// The "Writing" — the general blog/notes collection. Started as agent-systems
// essays (the hub + concept pieces) and now spans more: project write-ups, life
// updates, general essays. The `category` field is the primary browse axis on
// /writing; the section itself is named "Writing" (see WRITING_SECTION in
// src/data/site.ts — a one-place swap to "Blog" later). Markdown body +
// frontmatter. `portfolio-write` authors new files into `src/content/articles/`
// following SCHEMA.md.
const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    // One-line framing shown under the title and in the index list.
    deck: z.string(),
    // Sort order within the section (hub is 0, then ascending).
    order: z.number(),
    // What kind of article this is:
    //   'hub'     — the umbrella intro ("My Agent Teams")
    //   'concept' — a cross-cutting idea (orchestrate / verification / ratchet)
    //   'team'    — a specific team/agent write-up (future)
    kind: z.enum(['hub', 'concept', 'team']),
    // The PRIMARY browse axis on /writing — what the piece is ABOUT, broadly:
    //   'agent-systems' — essays on the agent systems I build (the thesis)
    //   'projects'      — write-ups of a specific project I shipped/worked on
    //   'life'          — life updates, personal notes
    //   'essays'        — general writing that fits none of the above
    // Rendered as a badge on each article and as the category filter rail.
    category: z.enum(['agent-systems', 'projects', 'life', 'essays']).default('essays'),
    tags: z.array(z.string()).default([]),
    // 3-6 standalone one-liners. Dual-purpose: also the x-agent's post seeds.
    keyTakes: z.array(z.string()).default([]),
    // Hide from build/index when true (still in the KB, not yet published).
    draft: z.boolean().optional().default(false),
  }),
});

// --- projects --------------------------------------------------------------
// SCHEMA ONLY for now (no entries yet). The rich, polished case pages
// (`src/pages/work/{treaxe,fredgpt}.astro`) still own project rendering. This
// collection reserves the shape for a FUTURE migration of project metadata out
// of `src/data/projects.ts` into the KB — it is intentionally not wired into
// any page yet. See SCHEMA.md › "Next step: the projects migration".
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    role: z.string(), // honest framing: "co-built", "team practicum", etc.
    stack: z.array(z.string()),
    status: z.string(),
    year: z.string().optional(),
    links: z
      .array(
        z.object({
          label: z.string(),
          href: z.string(),
          kind: z.enum(['primary', 'secondary']).default('secondary'),
          note: z.string().optional(),
        }),
      )
      .default([]),
    demo: z.string().optional(),
    featured: z.boolean().default(false),
    order: z.number(),
  }),
});

export const collections = { articles, projects };
