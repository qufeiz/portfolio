# `src/content/` — the portfolio knowledge base (SCHEMA + conventions)

This directory is the portfolio's **knowledge base (KB)** and its **single source of truth**.
It is implemented with [Astro content collections](https://docs.astro.build/en/guides/content-collections/)
(Astro 6). Everything the site shows about articles — and, eventually, projects — originates here.

## The core rule (read this first)

> **`src/content/` is the source of truth. `src/` only RENDERS it. The capability refs READ and
> WRITE `src/content/`.**

- `src/content/` — the **content** (the KB). Markdown + frontmatter. Edited by humans and by the
  portfolio capability refs.
- `src/` (pages, components, layouts) — the **renderer**. It reads the collections via
  `astro:content` and presents them with the design system. It must not be where content *lives*.
- `.claude/refs/*.md` — the **maintainers**. Capabilities = `.claude/refs/` how-to docs run via
  generic subagents (not Claude skills). `write-article.md` authors new articles *into*
  `src/content/articles/` following this file; `refresh-portfolio.md` syncs case data. They never
  invent a parallel content store.

Config lives at the project root in **`src/content.config.ts`** (Astro 6 location), where each
collection is declared with the `glob()` loader and a Zod schema.

---

## Collections

### `articles` — the "Writing" collection (LIVE)

Markdown files in **`src/content/articles/<slug>.md`**. The filename (minus `.md`) is the slug and
the URL: `/<base>/notes/<slug>`.

This is the site's **general "Writing"** section — agent-systems essays, project write-ups, life
updates, general notes. It started as agent-systems-only and was generalized; "Agent systems" is now
just one `category` (below), not the name of the whole section.

> **The section name lives in ONE place** — `WRITING_SECTION` in `src/data/site.ts` (currently
> `'Writing'`). The nav, the home section, the `/writing` index, and article back-links all read
> from it, so renaming the section to **"Blog"** (or anything else) later is a **one-word swap**.
> The route (`/writing`) and the collection name (`articles`) are stable internals — don't churn
> them for a label change.

Frontmatter schema:

| Field | Type | Notes |
|---|---|---|
| `title` | string | Article title (rendered as the page H1 + in the index). |
| `deck` | string | One-line framing under the title and in the section list. |
| `order` | number | Sort order in the section. **The hub is `0`**, concepts ascend from `1`. |
| `kind` | `'hub' \| 'concept' \| 'team'` | Structural role *within the agent-systems essay series*: `hub` = the umbrella intro; `concept` = a cross-cutting idea; `team` = a specific team/agent write-up (future). Distinct from `category`. |
| `category` | `'agent-systems' \| 'projects' \| 'life' \| 'essays'` | **The primary browse axis** — what the piece is broadly ABOUT (see taxonomy below). Defaults to `'essays'`. Rendered as a badge on each article + drives the `/writing` category filter rail. |
| `tags` | string[] | Fine-grained topical tags + the project cross-link. Optional (defaults to `[]`). |
| `keyTakes` | string[] | **3-6 standalone one-liners.** Dual-purpose: rendered as a "Key takes" block AND lifted by the **x-agent** as post seeds. Each must read well with zero context and must not overclaim. |
| `draft` | boolean? | When `true`, omitted from the build/index (still in the KB). Defaults `false`. |

#### `category` — the primary browse axis (READ THIS before authoring)

`category` is the **broad bucket** a piece belongs to; it is the **primary filter** on `/writing` (a
rail: All · Agent systems · Projects · Life · Essays) and a badge on every article + the home list.
Pick exactly one. It is the coarse "what is this about" axis — `tags` stay the fine-grained axis, and
the two combine (AND) on `/writing`.

| Value | For | Examples |
|---|---|---|
| `agent-systems` | Essays on the agent systems I build — the thesis of the site. | `my-agent-teams`, `orchestrate-gate-ratchet`, `independent-verification`, `the-ratchet` (all 4 current articles). |
| `projects` | A write-up centered on a specific project I shipped/worked on. | A TreAxe or FredGPT build-story (future). |
| `life` | Life updates, personal notes. | (future) |
| `essays` | General writing that fits none of the above (the **default**). | (future) |

- The enum is defined in `src/content.config.ts`; the **labels + rail order** live in `CATEGORIES`
  in `src/data/site.ts` (agent-systems first = the thesis stays prominent). **Adding a category =
  add the value to the Zod enum AND to `CATEGORIES`.**
- `category` (broad: what it's about) ≠ `kind` (structural role inside the agent-systems series). An
  `agent-systems` piece is still a `hub`/`concept`/`team`; `kind` only really carries meaning within
  the agent-systems series.
- Don't mislabel to farm prominence — a piece is `agent-systems` only if it's genuinely about the
  agent work.

**Body convention:** the markdown body is the prose ONLY. Do **not** include a `## Key takes`
heading in the body — key takes live in the `keyTakes` frontmatter array and are rendered from
there (single source, no duplication). Do **not** include an H1 (`# Title`) in the body either; the
page renders `title` as the heading. Start the body with the article's lede paragraph.

#### Tags — the cross-cutting taxonomy (READ THIS before tagging)

`tags` is a flat, lowercase, kebab-case list. It does two jobs:

1. **Topical browse/filter.** Tags are surfaced as chips on `/writing` and on each article page; the
   `/writing` tag rail filters the list (`/writing?tag=<tag>`). Keep tags reusable — prefer an
   existing tag over a near-synonym.
2. **The project ↔ article cross-link (the important convention).** **An article ABOUT a project is
   tagged with that project's slug** (the `slug` field in `src/data/projects.ts`), e.g. `treaxe` or
   `fredgpt`. That single tag is what wires the article into the project's **"Related writing"** block
   on its case page (`/work/<slug>`). The article still **lives once** in `/writing`; it is only
   *surfaced* on the project page — never duplicated.

   - Project slugs (valid cross-link tags today): **`treaxe`**, **`fredgpt`**.
   - A project tag is only honest when the article genuinely concerns that project (e.g.
     `independent-verification.md` is tagged `treaxe` because its central worked example is the real
     TreAxe Send-Invoice catastrophe). Don't tag a project just to farm a backlink.
   - Cross-link is implemented in `src/lib/content.ts` (`relatedArticles(slug)`); the block renders
     nothing when zero articles match.

### `projects` — case-study metadata (SCHEMA ONLY — not yet migrated)

The schema is defined in `src/content.config.ts` but **has no entries yet** and is **not wired into
any page**. The rich, polished case pages (`src/pages/work/treaxe.astro`,
`src/pages/work/fredgpt.astro`) and `src/data/projects.ts` still own project rendering. See "Next
step" below.

**Note:** `src/data/projects.ts` is the source of truth for the **`/work` index** and now carries
`tags` + `order` per project (used for the scale-ready sort: featured first, then `order`). When the
`projects` collection is eventually migrated, the collection schema must keep `tags` so the
project ↔ article cross-link (below) survives the move.

---

## Information architecture (the routes)

The site scales by giving each content type its own **dedicated index page** instead of one long
home. The home is a **curated** entry point, not the catalog.

| Route | What it is | Source |
|---|---|---|
| `/` (home) | Curated: Hero → **Featured Work** (top ~3) → **Writing** (top ~3 recent) → About → Contact. Fixed size regardless of total count. | `WorkIndex.astro` (`featuredProjects`), `Writing.astro` (`recentArticles`) |
| `/work` | **All** projects, scale-ready (featured first, then `order`). | `src/data/projects.ts` (`sortedProjects`) |
| `/writing` | **All** articles, scale-ready (hub first, then `order`) + a `?category=` filter rail (primary) and a `?tag=` rail (secondary). | `articles` collection (`publishedArticles`) |
| `/work/<slug>` | One project case page (+ tag chips + **Related writing**). | case pages + `relatedArticles(slug)` |
| `/notes/<slug>` | One article page. | `articles` collection |

Both index pages carry a `// TODO: paginate at N` note for when counts grow large. The `/writing`
filters are client-side: a **`?category=`** rail (the primary axis — Agent systems · Projects · Life
· Essays) and a **`?tag=`** rail (secondary, fine-grained), which combine (AND); no per-facet pages.
A `// TODO` notes the option to promote them to static pages later.

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
- **FredGPT** is a **CMU 14-798 (Fall 2025) team practicum for an industry client (economic-data domain).** Never imply
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
