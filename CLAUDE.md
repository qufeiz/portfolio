# Portfolio — agent context (local, gitignored)

Astro static portfolio for **Qufeiii** (GitHub `qufeiz`, qufeizzz@gmail.com). Featured work: **TreAxe** + **FredGPT** (an "agent team" case study is planned, likely the lead project).

## Deploy
- Host: **GitHub Pages** → https://qufeiz.github.io/portfolio/ (repo `github.com/qufeiz/portfolio`, served from `gh-pages` branch).
- ⚠️ Vercel CLI is NOT authenticated on this box — use GH Pages. To ship:
  `cd /home/codex/Projects/portfolio && npm run build && bash scripts/deploy.sh`
  (pushes source→`main`, build→`gh-pages`, adds `.nojekyll`). Pages takes ~1 min to rebuild; verify with curl/retry.

## Structure
- Pages: `src/pages/index.astro` (hero + work + about), `src/pages/work/treaxe.astro`, `work/fredgpt.astro`.
- Data: `src/data/site.ts` (identity — has TODOs), `src/data/projects.ts` (project meta), `src/data/treaxeShots.ts` (TreAxe gallery; images in `public/treaxe/`).
- Components: `Case*.astro`, `Gallery.astro`, `Hero.astro`, `About.astro`.
- `src/styles/global.css` — design system + the **global `.shell` gutter**. Keep `.shell` GLOBAL (it was once scoped to Base.astro → case pages went full-bleed; don't reintroduce that).
- Scroll-reveal: `.reveal` is `opacity:0` until JS adds `.is-in`; there's a `<noscript>` fallback. A no-scroll full-page screenshot looks blank below the fold — scroll first when capturing.

## Content & honesty rules
- **TreAxe** — co-built/co-owned **with a collaborator**; never imply sole authorship. Live product: www.treaxe.io. Demo login shown on site: `staging-test@treaxe-test.com / TreAxeDemo2026!` (staging only). Gallery uses TreAxe's OWN official screenshots from `~/Projects/TreAxe/docs/features/*/images/` and `docs/product/images/` (prefer these over re-captures).
- **FredGPT** — CMU 14-798 Fall-2025 team practicum for **an industry client (economic-data domain)**. 🔒 Publish ONLY the demo video + screenshots + the public problem statement. NEVER the client SOW/TOS/budget/sponsor notes (the `Private/` folder in the source zip). No public code repo link.
- Don't invent metrics, awards, or role specifics. TODO comments mark where the owner must confirm.

## Open TODOs (owner)
- Fill display name / location / socials in `site.ts`; confirm exact role splits on both case pages.
- Optional: connect Vercel (1-click import) for a nicer URL + custom domain; rotate the TreAxe staging service-role key (it surfaced in a build session).
- Build the **agent-team** case study (PM → engineer → verifier multi-agent system + the fleet: X-agent, jobright, life-wiki, this portfolio agent). Likely the lead piece; angle: "this portfolio was built by my own agent team."

## Scratch / temp output
- Temp output (screenshots, capture scripts, scratch builds) goes in `portfolio/.scratch/` (gitignored) — NEVER in `~/Projects` or any sibling `_*-build/` dir.

## Working style (owner preference)
- Delegate context-heavy grunt work (browser captures, reading many screenshots, build/deploy/verify) to **subagents**; keep the main thread for decisions. Use `SendUserFile` to show results (it doesn't cost context); avoid reading piles of images inline.
