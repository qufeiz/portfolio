# Portfolio — agent context (committed to git; this is the orientation doc a newcomer reads)

> This file IS tracked in git (only `.scratch/` is ignored), so anyone who clones the repo gets it.
> Keep real secrets OUT of it. The demo login below is staging-only and already public on the site.

Astro static portfolio for **Qufeiii** (GitHub `qufeiz`, qufeizzz@gmail.com). Featured work: **TreAxe** + **FredGPT** case studies, plus a self-maintaining **"Agent Systems" writing section** (see *Writing / content KB* and *Agent system* below).

## Deploy
- Host: **GitHub Pages** → https://qufeiz.github.io/portfolio/ (repo `github.com/qufeiz/portfolio`, served from `gh-pages` branch).
- ⚠️ Vercel CLI is NOT authenticated on this box — use GH Pages. To ship:
  `cd /home/codex/Projects/portfolio && npm run build && bash scripts/deploy.sh`
  (pushes source→`main`, build→`gh-pages`, adds `.nojekyll`). Pages takes ~1 min to rebuild; verify with curl/retry.

## Structure
- Pages: `src/pages/index.astro` (hero + work + about), `src/pages/work/treaxe.astro`, `work/fredgpt.astro`, `src/pages/writing/index.astro` (the **/writing** index), `src/pages/notes/[...slug].astro` (each article at **/notes/<slug>**), `src/pages/404.astro`.
- Data: `src/data/site.ts` (identity — has TODOs; also `WRITING_SECTION` + `CATEGORIES`), `src/data/projects.ts` (project meta), `src/data/treaxeShots.ts` (TreAxe gallery; images in `public/treaxe/`).
- Components: `Case*.astro`, `Gallery.astro`, `Hero.astro`, `About.astro`, `WorkIndex.astro`; **writing**: `Writing.astro` (home-page article list) + `RelatedWriting.astro` (related posts on case pages).
- `src/styles/global.css` — design system + the **global `.shell` gutter**. Keep `.shell` GLOBAL (it was once scoped to Base.astro → case pages went full-bleed; don't reintroduce that).
- Scroll-reveal: `.reveal` is `opacity:0` until JS adds `.is-in`; there's a `<noscript>` fallback. A no-scroll full-page screenshot looks blank below the fold — scroll first when capturing.

## Writing / content KB (the "Agent Systems" notes — where articles live)
- **Articles are an Astro content collection, NOT hand-built pages.** They live as markdown at `src/content/articles/<slug>.md`. To add a post you drop ONE `.md` file there; the site renders it automatically. There is no page to wire by hand and no data file to edit.
- **Schema / conventions:** `src/content/SCHEMA.md` (the human guide) + `src/content.config.ts` (the Zod frontmatter schema, incl. the `category` enum). Read SCHEMA.md before writing an article.
- **Query helper:** `src/lib/content.ts`. **Renders at:** `/notes/<slug>` via `src/pages/notes/[...slug].astro`; the index is `/writing` (`src/pages/writing/index.astro`); the home-page list is `src/components/Writing.astro`.
- **Section name + categories** are config in `src/data/site.ts` (`WRITING_SECTION`, `CATEGORIES`) — rename the whole section in one place.
- **Rendering features** (Mermaid diagrams, `:::note`/`:::tip`/`:::warning` callouts, annotated code blocks) are wired in `astro.config.mjs` and documented in `src/content/SCHEMA.md`.

## Agent system (this site partly maintains itself)
- `.claude/AGENTS.md` — the **lead loop runbook** (committed): the recurring daily writer loop, the on-demand site refresh, and the gates.
- `.claude/agents/*.md` — the **worker subagents**: `portfolio-writer` (writes ONE article per run), `portfolio-refresh` (re-syncs the site from projects, on demand), `make-video` (renders a walkthrough MP4 offline). Each points at a how-to in `.claude/refs/`.
- `.claude/refs/*.md` — the how-tos (`write-article.md`, `refresh-portfolio.md`, `make-video.md`).
- `.claude/state/*` — the **ledger = the agents' memory**: `coverage.md` (aspect-level "what's covered" index), `article-queue.md` (backlog), `log.md` (append-only run log), `sources.md` (source catalog + HARD confidentiality/PII gates), `video-queue.md`, `cursor.json`, `roadmap.md`. Agents READ the ledger first and UPDATE it after — they never re-scan everything.

## Content & honesty rules
- **TreAxe** — the owner did **all the engineering** (designed + built the product end to end: React frontend, Supabase data model + RLS, Edge Functions, Stripe/Gmail/pricing integrations); collaborators handle **sales & marketing**. Credit the engineering to the owner; do NOT imply the owner ran the business or owns the company. 🚫 **HARD BOUNDARY — `www.treaxe.io` / the prod Supabase (`osiwsexeqkcwgtaklwfi`) and its Vercel are on the COLLABORATOR's (Barrat's) account; the owner was only a guest. NEVER touch them — no seeding, no auth admin, no key use, not even read-only probes. The prod `SUPABASE_SECRET_KEY`/`SUPABASE_ACCESS_TOKEN` in `~/Projects/TreAxe/.env` are Barrat's — do not use them.** ✅ **Demo REBUILT on the owner's OWN stack (2026-06-24).** The old backend (`zelzkbyesrbprjptszcv`, "TreAxe Staging") was deleted, so the demo was rebuilt on a NEW Supabase project **`tuzcrumpfmpmdnhiptkd`** (org `mnkmchkvqezvsvnjakxq`, the owner's account) — 28 migrations + synthetic seed (a Henderson project + estimates/invoice/tasks/logs) + the demo user, wired to the owner's Vercel `treaxe-demo`. Login `staging-test@treaxe-test.com / TreAxeDemo2026!` is **verified working** (HTTP 200) and republished on the case page. **Degraded (edge functions not deployed on the new project):** AI assistant, email send, payments, and the `/api/*` surface — and `TreAxe/vercel.json` still rewrites `/api/*` to Barrat's prod functions (left untouched; out of scope). Core login + CRM/estimates/invoices browsing works. The new project's service key / db password live only in the gitignored `portfolio/.scratch/`. Gallery uses TreAxe's OWN official screenshots from `~/Projects/TreAxe/docs/features/*/images/` and `docs/product/images/` (prefer these over re-captures).
- **FredGPT** — CMU 14-798 Fall-2025 team practicum for **an industry client (economic-data domain)**. Role: the owner **led the engineering** (hybrid retrieval service, LangGraph agent backend, Bedrock guardrails, React frontend); teammates handled the non-engineering workstreams. 🔒 Publish ONLY the demo video + screenshots + the public problem statement. NEVER the client SOW/TOS/budget/sponsor notes (the `Private/` folder in the source zip). No public code repo link.
- Don't invent metrics, awards, or role specifics. TODO comments mark where the owner must confirm.

## Open TODOs (owner)
- Fill display name / location / socials in `site.ts`; confirm exact role splits on both case pages.
- Optional: connect Vercel (1-click import) for a nicer URL + custom domain; rotate the TreAxe staging service-role key (it surfaced in a build session).
- Build the **agent-team** case study (PM → engineer → verifier multi-agent system + the fleet: X-agent, jobright, life-wiki, this portfolio agent). The "Agent Systems" *writing* section already exists; this TODO is the dedicated `/work` case page if still wanted. Angle: "this portfolio was built by my own agent team."

## Scratch / temp output
- Temp output (screenshots, capture scripts, scratch builds) goes in `portfolio/.scratch/` (gitignored) — NEVER in `~/Projects` or any sibling `_*-build/` dir.

## Working style (owner preference)
- Delegate context-heavy grunt work (browser captures, reading many screenshots, build/deploy/verify) to **subagents**; keep the main thread for decisions. Use `SendUserFile` to show results (it doesn't cost context); avoid reading piles of images inline.
