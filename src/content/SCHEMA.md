# `src/content/` — the portfolio knowledge base (SCHEMA + conventions)

This directory is the portfolio's **knowledge base (KB)** and its **single source of truth**.
It is implemented with [Astro content collections](https://docs.astro.build/en/guides/content-collections/)
(Astro 6). Everything the site shows about articles — and, eventually, projects — originates here.

## The core rule (read this first)

> **`src/content/` is the source of truth. `src/` only RENDERS it. The skills READ and WRITE
> `src/content/`.**

- `src/content/` — the **content** (the KB). Markdown + frontmatter. Edited by humans and by the
  portfolio skills.
- `src/` (pages, components, layouts) — the **renderer**. It reads the collections via
  `astro:content` and presents them with the design system. It must not be where content *lives*.
- `.claude/skills/*` — the **maintainers**. `portfolio-write` authors new articles *into*
  `src/content/articles/` following this file; `portfolio-refresh` syncs case data. They never
  invent a parallel content store.

Config lives at the project root in **`src/content.config.ts`** (Astro 6 location), where each
collection is declared with the `glob()` loader and a Zod schema.

---

## Collections

### `articles` — the "Agent Systems" writing (LIVE)

Markdown files in **`src/content/articles/<slug>.md`**. The filename (minus `.md`) is the slug and
the URL: `/<base>/notes/<slug>`.

Frontmatter schema:

| Field | Type | Notes |
|---|---|---|
| `title` | string | Article title (rendered as the page H1 + in the index). |
| `deck` | string | One-line framing under the title and in the section list. |
| `order` | number | Sort order in the section. **The hub is `0`**, concepts ascend from `1`. |
| `kind` | `'hub' \| 'concept' \| 'team'` | `hub` = the umbrella intro; `concept` = a cross-cutting idea; `team` = a specific team/agent write-up (future). |
| `tags` | string[] | Topical tags. Optional (defaults to `[]`). |
| `keyTakes` | string[] | **3-6 standalone one-liners.** Dual-purpose: rendered as a "Key takes" block AND lifted by the **x-agent** as post seeds. Each must read well with zero context and must not overclaim. |
| `draft` | boolean? | When `true`, omitted from the build/index (still in the KB). Defaults `false`. |

**Body convention:** the markdown body is the prose ONLY. Do **not** include a `## Key takes`
heading in the body — key takes live in the `keyTakes` frontmatter array and are rendered from
there (single source, no duplication). Do **not** include an H1 (`# Title`) in the body either; the
page renders `title` as the heading. Start the body with the article's lede paragraph.

### `projects` — case-study metadata (SCHEMA ONLY — not yet migrated)

The schema is defined in `src/content.config.ts` but **has no entries yet** and is **not wired into
any page**. The rich, polished case pages (`src/pages/work/treaxe.astro`,
`src/pages/work/fredgpt.astro`) and `src/data/projects.ts` still own project rendering. See "Next
step" below.

---

## Naming

- **Article files:** kebab-case slug == URL == filename, e.g. `the-ratchet.md` → `/notes/the-ratchet`.
- **One concept per file.** A new article is a new file; never append a second article to an existing one.
- **The hub** (`kind: 'hub'`, `order: 0`) is `my-agent-teams.md` and links to the concept articles.

### Cross-links inside article markdown

Write internal links **root-relative**, e.g. `[The ratchet](/notes/the-ratchet)` for another
article or `[Work](/#work)` for a homepage section. A rehype plugin (`rehypeBasePaths` in
`astro.config.mjs`) automatically prepends the `/portfolio` base to root-relative `href`/`src` in
rendered markdown, so links resolve correctly on GitHub Pages. **Never hardcode `/portfolio`** in
markdown (the plugin adds it) and **never use a bare slug** like `(the-ratchet)` (it resolves
relative to the current page → 404). External (`https://…`) and in-page (`#…`) links pass through
untouched.

---

## Asset homes

Article/diagram assets live under **`public/`**, referenced base-aware (never a hardcoded leading
`/` — route through `src/lib/url.ts`'s `asset()` / `link()`, or `import.meta.env.BASE_URL`):

| Asset kind | Home | Referenced as |
|---|---|---|
| Agent-systems article figures/diagrams | `public/assets/agent-systems/...` | `asset('assets/agent-systems/<file>')` |
| Project (case study) screenshots | `public/<project>/...` (e.g. `public/treaxe/`, `public/fredgpt/`) | via gallery data (`src/data/treaxeShots.ts`) |

Prefer a project's **own official screenshots** over re-captures (e.g. TreAxe's
`docs/features/*/images/` and `docs/product/images/`).

---

## The gates baked into the KB

Every entry in this KB is bound by the same gates the lead enforces (see `.claude/AGENTS.md` ›
Gates). Authoring into `src/content/` is **gated**, not free-form:

### Honesty
- **No invented metrics, awards, or role specifics.** If a number/claim can't be grounded in a real
  repo or doc, it does not go in — leave a `TODO(owner)` instead.
- **TreAxe** is **co-built with Barrat Mohammad** (co-owned codebase). Never imply sole authorship.
- **FredGPT** is a **CMU 14-798 (Fall 2025) team practicum for client Launchpad Edge.** Never imply
  sole authorship; it is collaborative academic work.

### Confidentiality
- **Never publish FredGPT `Private/` material** — client SOW, TOS, budget, or sponsor notes. Only the
  demo video, public screenshots, and the public problem statement are publishable. **No public code
  link for FredGPT.** Co-owned repos (e.g. TreAxe) are fine to link.

### Grounded + real
- Every substantive claim points to a real repo/doc/mechanism, not a generality. The fleet
  descriptions in `my-agent-teams.md`, for instance, are grounded in the actual `AGENTS.md` /
  `CLAUDE.md` of `x-agent`, `life-wiki`, and `jobright-agent`.

---

## Next step: the `projects` migration

The `projects` collection is **defined but intentionally empty** in v1. The next step is to migrate
project metadata out of `src/data/projects.ts` into `src/content/projects/<slug>.md` entries and
have the case pages read from the collection — **without** regressing the existing polished case
pages. That migration is out of scope for the KB-foundation work and should be done deliberately,
project by project, keeping `/work/treaxe` and `/work/fredgpt` rendering identically throughout.
