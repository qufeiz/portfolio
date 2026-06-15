# Portfolio-agent log — append-only

Every loop fire, ratchet, and structural change appends ONE entry here. Headers are
grep-parseable: `## YYYY-MM-DD <TYPE> | <one-line>`. Types:

- `init`       — the system was created / re-scaffolded
- `loop-run`   — a weekly loop fired (what the subagents did, what shipped)
- `loop-adjust`— the ratchet: a subagent fell short, a ref (`.claude/refs/<name>.md`) was edited to fix it
- `ref-add`    — a new capability ref was added to `.claude/refs/` (the capability ratchet)
- `deploy`     — a publish to GitHub Pages + the live-verify result

Newest at the bottom. Grep examples:
`grep '^## .* loop-adjust' state/log.md` · `grep '^## .* deploy' state/log.md`

---

## 2026-06-14 init | v1 scaffold: lead orchestrator (AGENTS.md) + portfolio-refresh + portfolio-write capabilities + state
- Created `.claude/AGENTS.md` (lead runbook + the canonical weekly loop prompt + gates + "how to add a capability").
- Created the two v1 capabilities: `portfolio-refresh` + `portfolio-write` (originally `skills/<name>/SKILL.md`; recast to `.claude/refs/<name>.md` flat how-to docs — see the recast entry below).
- Seeded state: `cursor.json` (HEADs of TreAxe, x-agent, life-wiki, jobright-agent, feature-team, portfolio; FredGPT source = null/not-a-repo, see `FREDGPT.zip`), `article-queue.md` (6 article ideas), `roadmap.md` (4 planned capabilities).
- Seed content noted: 3 drafted articles (then in a since-removed build scratch dir, now migrated into `src/content/articles/`) (00,01,02) to be wired into the site's "Agent Systems" section.
- Loop NOT run; nothing deployed. This is scaffolding/architecture — specifics to be improved later.

## 2026-06-14 loop-adjust | capability model recast from "skills" to "refs" (simpler, easier to update)
- Capabilities are now flat "how-to" REF FILES at `.claude/refs/<name>.md` run via generic throwaway subagents — not Claude skills / agent-types. Matches the rest of the owner's fleet (point a subagent at a ref/runbook).
- Moved `skills/portfolio-refresh/SKILL.md` → `.claude/refs/refresh-portfolio.md`; `skills/portfolio-write/SKILL.md` → `.claude/refs/write-article.md` (all instructional content preserved; write-article still targets `src/content/articles/<slug>.md` per `src/content/SCHEMA.md`). Removed the now-empty `.claude/skills/`.
- Reframed `AGENTS.md` (architecture + loop step 0 = `ls .claude/refs/*.md`, step 1 = spawn one subagent per ref with the "Read and follow `.claude/refs/<name>.md` exactly" brief), `roadmap.md` (planned capabilities = future ref files), and the `skill-add` ledger type → `ref-add`. Adding a capability = write one ref file; updating = edit it.

## 2026-06-14 loop-adjust | capability model evolved to project-level subagent DEFS + refs (matches the owner's build team)
- Capabilities are now **project-level subagents** in `.claude/agents/<name>.md` (Claude Code subagent format: YAML `name`/`description`/optional `tools` + a short body = system prompt that carries the persona + the ref pointer), each pointing at its `.claude/refs/<name>.md` how-to. Mirrors the owner's `pm`/`engineer`/`verifier` defs+refs pattern. The lead now spawns a NAMED subagent (`subagent_type: <name>`) with a HIGH-LEVEL goal, not the verbatim "read this ref" brief — the def already tells the worker its job + which ref to read.
- Created `.claude/agents/portfolio-refresh.md` (→ `refs/refresh-portfolio.md`) + `.claude/agents/portfolio-writer.md` (→ `refs/write-article.md`). Refs KEPT as-is (only their top "who points at this" blurb updated to name the worker; the how-to content is unchanged; write-article still targets `src/content/articles/<slug>.md` per `src/content/SCHEMA.md`).
- Reframed `AGENTS.md`: added the 3-layer naming clarifier (AGENTS.md = LEAD loop · `.claude/agents/` = WORKER subagents · `.claude/refs/` = the how-tos), loop step 0 = `ls .claude/agents/*.md`, step 1 = spawn the named subagent with a one-line goal (+ note that the loop can spawn these because they're project-level types, run from a top-level session). `roadmap.md` planned capabilities = future agent defs + refs. `npm run build` sanity check passed; nothing deployed.

## 2026-06-14 loop-adjust | split the operating model: DAILY writer-only loop + ON-DEMAND scanner (was: loop spawned BOTH each fire)
- The recurring loop is now **WRITER-ONLY and DAILY** — one article per fire. Rewrote the `AGENTS.md` loop: (0) read ledger (coverage+queue+log, never re-scan), (1) spawn ONE `portfolio-writer` with a high-level "write the next highest-value OPEN aspect / next queued item" goal, (2) gate (honesty/confidentiality/build), (3) deploy + verify live, (4) ratchet on a miss, (5) update coverage/log + report 2-3 lines, STOP until tomorrow. Added an HONESTY FLOOR (skip the day with no filler if no real OPEN aspect) and a DRAFT-MODE toggle (write+build+log, skip deploy; default = auto-publish). Cadence/run note updated to `/loop 1d` or daily cron, FROM the repo root.
- The SCANNER (`portfolio-refresh`) is now **on-demand, NOT in the loop** — added an "On-demand: refresh the site from projects" section (owner says "explore and update the portfolio" → read ledger → scan since cursor → update site → gate → deploy → update coverage/log). Rationale stated: projects are added rarely/deliberately, so daily re-scans are wasteful.
- Preserved: capabilities = agents+refs, discover-at-runtime, the gates table, the in-repo `.scratch/` convention, run-from-repo-root, the two-level memory (coverage index + action log). Generalized "how to add a capability" to route a new agent to the writer-loop (writer-class) vs on-demand (scanner/site-class) trigger. Mirrored the two-trigger note into `state/coverage.md`. No build, no deploy (a parallel pass owns `src/content/articles/`).

## 2026-06-15 ref-add | built `make-video` capability (Hyperframes screenshot-walkthrough → MP4) + the request→fulfill handoff
- New project-level subagent: `.claude/agents/make-video.md` → `.claude/refs/make-video.md`. Renders ONE walkthrough/demo MP4 for a page/article from a data-driven spec, using the OFFICIAL Hyperframes skill (`npx skills add heygen-com/hyperframes`; installed to `.agents/skills/hyperframes-*` + workflows) as the authoritative guide. Reusable template lives in `.claude/make-video/` (`build-composition.mjs` generator + vendored GSAP + the site fonts as woff2 + the TreAxe example spec). Renders OFFLINE only (HARD): the MP4/poster are committed static assets under `public/`; `npm run build` only copies them, never renders.
- Proof shipped: rendered `public/treaxe/walkthrough.mp4` (1920x1080 H.264/yuv420p, 26.0s, 9.6MB, faststart) + `public/treaxe/walkthrough.poster.jpg` from the 6 real TreAxe screens (dashboard, leads/CRM Kanban, estimates, invoices, project-overview, proposal-PDF) with captions trimmed from `src/data/treaxeShots.ts` (no em-dashes). Validated via the documented Hyperframes loop: lint 0-errors + validate (WCAG AA, no console errors) + inspect 0-layout-issues. Embedded a base-aware `<video ... poster={asset(...)}>` in a new "Walkthrough" section of `src/pages/work/treaxe.astro` (existing gallery kept).
- Request→fulfill handoff (respects no-nested-spawn): added `state/video-queue.md`; writer + scanner refs/defs now REQUEST a video (queue row, flagged in their report) instead of rendering; `AGENTS.md` gained a "Fulfilling a video request" section (lead spawns `subagent_type: make-video`). Moved `make-demo-video` out of `roadmap.md` (planned → built as `make-video`).
- Env note: ffmpeg/ffprobe at ~/.local/bin; Hyperframes' Chrome downloader is offline-blocked, so HYPERFRAMES_BROWSER_PATH points at the installed Playwright chrome-headless-shell. `npm run build` PASS (render is NOT a build step). NOT deployed (owner reviews the video first).

## 2026-06-15 loop-run | wrote contract-retriever: Contract-Retriever (RAG→agentic rebuild) covered
- Grounded in the two real repos: `Contract-Retriever-RAG` (v1: Next.js + DeepSeek router + hybrid SQLite/RAG + the pure `validateAnswer()` gate) and `Contract-Retriever-Agentic` (v2: Python FastAPI + a Claude Agent SDK loop over a `knowledge/` tree of human-readable `data_structure.md` maps, no embeddings). Same product (cited grounded answers, honest refusal, no fabricated cross-domain join), swapped retrieval engine; the post centers on how the verification strategy had to change (deterministic gate → statistical bar: golden evals + trace inspection + repeated-N + LLM judge).
- keyTakes: 6 standalone one-liners filled in frontmatter (x-agent post seeds).
- Build: PASS. Em-dash / AI-tell grep: clean (no matches).
