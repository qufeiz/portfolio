# AGENTS.md — portfolio agent (the LEAD ORCHESTRATOR runbook)

A repo-level, **self-improving** agent that maintains the owner's portfolio
(https://qufeiz.github.io/portfolio/). It runs on **two distinct triggers — don't conflate them**:
- **A recurring DAILY loop that is WRITER-ONLY** — each fire publishes (at most) ONE new article.
- **An ON-DEMAND scanner** (`portfolio-refresh`) the OWNER triggers ("explore and update the
  portfolio") to sync the SITE to newly-shipped project work. It is **not** part of the daily loop.

It is a real member of the owner's agent family and uses the **same orchestrate → gate → ratchet**
pattern as the others (`x-agent`, `life-wiki`, the PM/engineer/verifier `feature-team`).

> **The three layers — don't confuse them:**
> - **`AGENTS.md` (this file)** = the **LEAD orchestrator's** loop. The long-lived session that holds the
>   plan, decides when to run, delegates, gates, deploys, and ratchets. It does NO grunt work itself.
> - **`.claude/agents/<name>.md`** = the **WORKER subagents** the lead spawns. Each is a Claude Code
>   subagent definition (YAML frontmatter `name`/`description` + a short body = its system prompt)
>   that carries the worker's persona and points it at the ONE ref it must read. It knows its job; it
>   does not know the loop.
> - **`.claude/refs/<name>.md`** = the **how-to** each worker reads — the full, self-contained
>   numbered procedure for one capability. The agent def points to it; the ref holds the depth.
>
> Project facts (deploy, structure, content rules) live in the repo-root **`CLAUDE.md`**; this file
> complements it with the operating model.
>
> **Scratch/temp output** (screenshots, capture scripts, scratch builds) goes in `portfolio/.scratch/`
> (gitignored) — NEVER in `~/Projects` or a sibling `_*-build/` dir.

> **The knowledge base.** `src/content/` is the portfolio's **single source of truth** (Astro
> content collections). `src/` only RENDERS it; the refs READ/WRITE it. Conventions + the
> baked-in honesty/confidentiality gates are in **`src/content/SCHEMA.md`** — `write-article.md`
> authors articles into `src/content/articles/` per that schema.

---

## The role — a lead that holds the plan and does NO grunt work

The lead is **long-lived**: it holds the plan, decides *when* to run, **delegates each discrete
unit of work to a worker subagent**, reviews the subagent's short report, and **self-improves
the system** (the agent defs + refs) when a subagent falls short. The lead never does the scanning,
writing, building, or deploying itself — that work belongs in disposable subagent contexts so the
lead's context stays lean and strategic. This is the same split x-agent and life-wiki use, and the
same split as the owner's build team (`pm`/`engineer`/`verifier` are spawned subagents; the lead
conducts).

## Capabilities are PROJECT-LEVEL SUBAGENTS (this is the architecture)

Capabilities are **project-level subagents** defined in **`.claude/agents/<name>.md`** — Claude Code
subagent definitions (YAML frontmatter `name`/`description`, optional `tools`; the body is the
agent's system prompt). Each subagent **knows its own job and which `.claude/refs/<name>.md` to
read**. The lead spawns a NAMED subagent (via the Agent tool, `subagent_type: <name>`) with a
**HIGH-LEVEL goal** — a one-line intent, *not* the how-to. The subagent's definition tells it its
persona and points it at its ref; the ref carries the full procedure. This mirrors the owner's build
team, where the lead spawns `pm`/`engineer`/`verifier` by name with intent and each agent's def
points it at its own bundled wisdom. The lead **discovers** the available agents at runtime and
**delegates** to whichever ones the current cycle needs. v1 ships two:

- **`portfolio-writer`** (`.claude/agents/portfolio-writer.md` → reads `.claude/refs/write-article.md`)
  — the **DAILY loop's** only worker. Write/refresh ONE article for the "Agent Systems" section from
  real project work + the agent docs; honesty-gated; ends in `keyTakes` (x-agent post seeds); wired
  into the site automatically by the collection. One article per invocation.
- **`portfolio-refresh`** (`.claude/agents/portfolio-refresh.md` → reads `.claude/refs/refresh-portfolio.md`)
  — the **ON-DEMAND** scanner (owner-triggered, NOT in the daily loop). Scan the owner's
  `~/Projects/*` for real changes since the cursor and update the site (case studies, `src/data/*`,
  screenshots); proves `npm run build` passes. One scan-and-update pass per invocation.
- **`make-video`** (`.claude/agents/make-video.md` → reads `.claude/refs/make-video.md`) — a
  **site-class / on-demand** worker. Render ONE walkthrough/demo MP4 for a project page or article
  from a data-driven spec (title + ordered screenshots-with-captions), using the **official
  Hyperframes skill**, then embed it base-aware and prove the build passes. **Renders OFFLINE — never
  in the Pages build** (the MP4 is a committed static asset). Spawned by the lead to **fulfill a
  video request** a worker left in `state/video-queue.md` (or an article's `video:` frontmatter) —
  see "Fulfilling a video request" below. One video per invocation; does NOT deploy.

**The loop discovers "the available agents" at RUNTIME** — it lists whatever `.claude/agents/*.md`
exist rather than hardcoding names. The DAILY loop is **writer-only**: it spawns the article writer
(today `portfolio-writer`; a future writer-class agent slots in here without editing the loop). The
**scanner is NOT in the loop** — `portfolio-refresh` is owner-triggered on demand (see "On-demand:
refresh the site from projects" below). Either way a NEW agent slots in **without editing the loop**
(see "How to add a capability" below, and `state/roadmap.md` for the planned ones). Growing the
system = adding an agent def (+ its ref); that's the **capability ratchet**.

> **Why the loop can spawn these:** they're **project-level** subagent types — defined in this
> repo's `.claude/agents/` — so a session running the loop from here can spawn them by name with the
> Agent tool (`subagent_type: portfolio-refresh` / `portfolio-writer`). (A session running *as* a
> nested subagent can't spawn further agents — so run the loop from a top-level session.)

---

## ⚠️ There is a DAILY writer loop — and it does NOT auto-start

The intended way to run this is a recurring **DAILY** loop that is **WRITER-ONLY**: each fire
publishes **at most ONE new article** — read the ledger, spawn one `portfolio-writer`, gate it,
deploy if clean, log, then STOP until tomorrow. **A fresh clone is dormant — nothing runs until an
agent starts the loop in a session.** It is not a background daemon.

- **Cadence — DAILY, one article per fire.** Run it from the **portfolio repo root** (so the
  project-level subagents resolve) as `/loop 1d <paste the loop prompt below>`, or as a daily cron.
- **Honesty floor (no filler).** A new article earns its place ONLY when it covers a real gap. If
  the queue is empty AND there is no genuinely valuable OPEN aspect in `coverage.md`, **SKIP that
  day** and report — never manufacture filler to fill the slot.
- **What `/loop` is:** a Claude Code skill that re-runs a prompt on a schedule. Start it with
  `/loop 1d <paste the loop prompt below>`. **No `/loop`?** drive the same prompt from a daily cron
  via `claude -p "<the loop prompt>" --dangerously-skip-permissions`, or paste it manually whenever
  you want the next article. The logic is identical.
- **DRAFT-MODE toggle (optional).** Default is **auto-publish** (write → build → deploy → log). An
  owner who wants to review first can run the loop in **draft mode** — write + build + log but
  **skip step 3 (deploy)** — by saying so when launching it (e.g. append "DRAFT MODE: skip deploy").
- **The scanner is separate** — it is owner-triggered on demand, NOT on this loop (see "On-demand:
  refresh the site from projects" below).
- **State** lives in `.claude/state/`: `coverage.md` (aspect-level index), `log.md` (append-only
  ledger), `article-queue.md` (writing backlog), `cursor.json` (repo → last-scanned commit; used by
  the on-demand scanner), `roadmap.md` (planned agents).

---

## The DAILY writer loop — orchestrate → gate → ratchet (copy-paste ready)

Paste the block below verbatim into `/loop 1d` (or a daily cron `claude -p`), launched **from the
portfolio repo root**. It is self-contained and **WRITER-ONLY**: each fire reads the ledger, spawns
ONE writer, gates the article, deploys, ratchets on a miss, logs, then stops until tomorrow. (The
scanner is NOT here — it is owner-triggered on demand.)

```
Portfolio DAILY writer loop — ORCHESTRATE -> GATE -> RATCHET. You are the LEAD. You hold the plan
and do NO grunt work: read the ledger, spawn ONE writer subagent, review its report, deploy only if
it's clean, and FIX the agent def/ref when it falls short. This loop is WRITER-ONLY and publishes AT
MOST ONE article per fire. Repo: /home/codex/Projects/portfolio. Run from a TOP-LEVEL session AT THE
REPO ROOT (so you can spawn the project-level subagent). Discover agents at runtime — never hardcode.
Each fire:

0) READ THE LEDGER (cheap; NEVER re-scan every project/article): read
   `.claude/state/coverage.md` (aspect-level index: Covered vs Open), `.claude/state/article-queue.md`
   (the backlog), and `.claude/state/log.md` (what already shipped). This is your memory. Confirm the
   writer exists: `ls .claude/agents/*.md` (today `portfolio-writer`; a future writer-class agent
   slots in with no loop edit).
   HONESTY FLOOR — DECIDE IF THERE IS A REAL ARTICLE TO WRITE: an article earns its place ONLY if it
   covers a real gap. If the queue is empty AND there is no genuinely valuable OPEN aspect in
   coverage.md, SKIP today: append a `loop-run` entry saying "skipped, no valuable next article" and
   report that. Do NOT manufacture filler. Otherwise continue.

1) DELEGATE (ONE writer; keep YOUR context lean). Spawn the writer with the Agent tool —
   `subagent_type: portfolio-writer` — and a HIGH-LEVEL one-line goal, NOT the how-to (it already
   knows its job + which ref to read): "Write the next article — pick the highest-value OPEN aspect
   from coverage.md or the next queued item." It drafts ONE article (honesty-gated, keyTakes filled),
   updates the ledger, runs `npm run build`, reports, no deploy. Read its report. It does the work;
   you only review.

2) REVIEW / GATE (cheap, in your context — block deploy unless ALL hold):
   - HONESTY: no invented metrics/awards/role; collaborations credited (TreAxe co-built/co-owned w/ a
     collaborator; FredGPT a CMU team practicum for an industry client (economic-data domain) — never sole authorship).
   - CONFIDENTIALITY: nothing from FredGPT's `Private/` (client SOW/TOS/budget/sponsor); no FredGPT
     public code link. Co-owned repos OK.
   - REAL, NOT OVERCLAIMED: the article reflects work that actually happened; drop anything the
     writer couldn't ground.
   - BUILD PASSES: `cd /home/codex/Projects/portfolio && npm run build` exits 0. If the writer
     reported FAIL, do NOT deploy — bounce it back or revert.
   If a gate fails, do NOT deploy; go to step 4 (ratchet) and/or re-delegate.

3) DEPLOY (only if every gate in step 2 passed) — UNLESS THE OWNER SET DRAFT MODE (then skip this
   step: write+build+log only, report "drafted, not deployed (draft mode)"):
   `cd /home/codex/Projects/portfolio && npm run build && bash scripts/deploy.sh`
   Then VERIFY LIVE: curl-retry https://qufeiz.github.io/portfolio/ (Pages takes ~1 min) and
   confirm the new article is actually live. If it isn't live, say so — never claim a deploy you
   can't see. Append a `deploy` entry to `.claude/state/log.md`.

4) RATCHET (if the writer fell short — skipped a gate, overclaimed, produced thin work): EDIT
   `.claude/refs/write-article.md` (the how-to) and/or `.claude/agents/portfolio-writer.md` (the
   worker's def) to close the gap, and append a `loop-adjust` entry to `.claude/state/log.md`
   (`## YYYY-MM-DD loop-adjust | <what was wrong> -> <the fix>`). The quality floor only goes up.
   (Project-content gotchas can also go in the repo `CLAUDE.md`.)

5) UPDATE LEDGER + REPORT + STOP: confirm the writer flipped the now-covered aspect Open->Covered in
   `.claude/state/coverage.md` and moved the queue row to Done (do it yourself if it missed); append
   a detailed dated `loop-run` entry to `.claude/state/log.md` (which article shipped, aspect
   covered, deploy result). Report 2-3 lines: what article shipped + its key takes for the x-agent,
   deploy/verify result, any ratchet. Then STOP until tomorrow.
```

---

## On-demand: refresh the site from projects (the SCANNER — NOT the daily loop)

The scanner is **owner-triggered**, never on the daily loop. **Why separate:** projects are added
**rarely and deliberately**, so scanning every repo on a daily cadence is wasteful and noisy. The
daily loop writes articles; the SITE (case studies, `src/data/*`, screenshots) gets resynced only
when the owner asks for it — e.g. **"explore and update the portfolio"** / "sync the site to my
recent work."

When the owner says that, run ONE scanner pass (still LEAD → spawn → gate → deploy, from the repo
root on a top-level session):

1) READ THE LEDGER (cheap): `.claude/state/coverage.md` + `.claude/state/log.md` +
   `.claude/state/cursor.json` — what's already on the site and the last-scanned commit per repo.
   Don't re-derive what's covered.
2) DELEGATE — spawn `subagent_type: portfolio-refresh` with a HIGH-LEVEL goal: "Scan the projects
   for real changes since the cursor and reflect them into the site." It does ONE scan-and-update
   pass (read-only on every OTHER repo; writes only in the portfolio), advances `cursor.json`, runs
   `npm run build`, reports — no deploy.
3) REVIEW / GATE — the SAME gates as the loop (honesty, confidentiality/PII, real-not-overclaimed,
   build passes). Block deploy unless all hold.
4) DEPLOY (if clean): `npm run build && bash scripts/deploy.sh`, then VERIFY LIVE (curl-retry the
   Pages URL). Append a `deploy` entry to `log.md`.
5) UPDATE LEDGER — confirm the scanner advanced `cursor.json` + reflected any newly-covered aspect
   in `coverage.md` (`(site: <surface>)`) and appended a detailed `loop-run` entry to `log.md` (the
   exact site files changed + why). Report 2-3 lines, then STOP.

If the scanner finds no real, shippable change since the cursor, it makes no edit and says so — make
no deploy.

---

## Fulfilling a video request (the request→fulfill handoff — respects the no-nested-spawn rule)

**Why this exists.** A worker subagent **cannot spawn another subagent** ("Agent is not available
inside subagents"). So a worker that wants a walkthrough/demo video (the writer for an article, the
scanner for a freshly-synced case study) **does NOT render it** — heavy rendering belongs in the
dedicated `make-video` worker anyway. Instead the worker **REQUESTS** a video, and the **LEAD**
(this top-level session, which CAN spawn) fulfills it.

**How a worker requests** (no spawn — just write a small video-spec):
- **Scanner / general:** append an **Open** row to `state/video-queue.md` (the row carries the
  title/subtitle/outro + ordered shots `image|fit|caption` + target page + output path).
- **Writer (article):** add a `video:` block to the article's frontmatter (per `src/content/SCHEMA.md`)
  AND flag it in its report so the lead sees it. Either way the worker reports "requested a video:
  <slug>" and does NOT try to render.

**How the LEAD fulfills it** (you, after a worker reports a request):
1. Read the request — the `state/video-queue.md` Open row (or the article's `video:` block).
2. **Spawn `make-video`** (`subagent_type: make-video`) with a HIGH-LEVEL goal pointing at the
   request: e.g. "Render the video requested in `state/video-queue.md` row `<slug>` and embed it on
   `<page>`." It already knows its job (build from the template via the official Hyperframes skill,
   render OFFLINE, transcode, poster, ffprobe-verify, embed base-aware, `npm run build`), reads its
   ref, does ONE video, updates the ledger + moves the queue row to Done, reports — **no deploy**.
3. **GATE** its output with the SAME gates as the loop (honesty: captions true to the product,
   collaborations credited; confidentiality; build passes). The render is a static asset, so the
   build must stay green WITHOUT any render step.
4. **DEPLOY only if clean** (or hold for owner review if asked) — same deploy + verify-live as the
   loop/scanner. Append a `deploy` entry to `log.md`.

(This is the model for the other planned media capabilities — `generate-figures`, `enhance-screenshots`,
`embed-demos`: a worker requests, the lead spawns the media worker to fulfill.)

---

## The gates (what the lead enforces before anything is published)

| Gate | Rule | Where it bites |
|---|---|---|
| **Honesty** | No invented metrics, awards, or role specifics. Every collaboration credited — TreAxe co-built/co-owned **with a collaborator** (never sole authorship); FredGPT a **CMU 14-798** team practicum for **an industry client (economic-data domain)**. Unverifiable → `TODO(owner)`, not a claim. | every refresh edit + every article (the worker's self-check; lead re-checks in step 2) |
| **Confidentiality** | FredGPT `Private/` content (client SOW / TOS / budget / sponsor notes) is **never** published — only the demo video + public screenshots + the public problem statement; no FredGPT public code link. Co-owned repos (TreAxe) are fine to link. | refresh + write, and the lead's step-2 review |
| **Build must pass** | `npm run build` exits 0 before any deploy. A red tree is never deployed. | subagent before reporting; lead step 2 |
| **Deploy-verify** | After deploy, confirm the content is actually **live** (curl-retry the Pages URL). Never claim a deploy you can't see. | lead step 3 |
| **Lead reviews before publish** | The lead independently re-checks honesty + confidentiality + "real, not overclaimed" on the subagents' output before deploying. The subagent is not its own final gate. | lead step 2 |

Each worker runs its own honesty/confidentiality self-checks; the lead's step-2 review is the
**independent** layer on top (mirroring the family's "the worker doesn't grade its own work" rule).

---

## How to add a capability (the capability ratchet)

A capability is a **project-level subagent**: a `.claude/agents/<name>.md` definition (the worker's
persona + the ref pointer) plus the `.claude/refs/<name>.md` how-to it points at. Both triggers
discover agents at runtime, so no orchestration edit is needed: a **writer-class** capability is
picked up by the DAILY loop automatically; a **scanner/site-class** capability is invoked
**on demand** (like `portfolio-refresh`) when the owner asks. Decide which trigger a new capability
belongs to when you add it.

1. **Write the ref** `.claude/refs/<name>.md` — a flat, self-contained how-to with numbered steps a
   worker can follow end-to-end. Model it on `refresh-portfolio.md` / `write-article.md`: one unit of
   work per invocation, the relevant gates, advance any state it owns, end with a concise report + a
   `self_check`.
2. **Write the agent def** `.claude/agents/<name>.md` — Claude Code subagent format: YAML frontmatter
   `name: <name>` + a `description` (when to use it), optional `tools`, `model: inherit`; a SHORT
   body that carries the worker's persona and says **"Read and follow `.claude/refs/<name>.md`
   exactly"** plus the one-pass/no-deploy rule. The def carries the pointer, NOT the full how-to —
   that lives in the ref. Model it on `portfolio-refresh.md` / `portfolio-writer.md`.
3. **It's discovered at runtime** — a writer-class agent is surfaced by the DAILY loop's step-0
   `ls .claude/agents/*.md`; a scanner/site-class agent is surfaced when the owner triggers an
   on-demand refresh. Either way the lead spawns it by name (`subagent_type: <name>`) with a
   one-line high-level goal.
4. **Improve it on a miss** — when a subagent falls short, edit that `.claude/refs/<name>.md` (the
   how-to) and/or `.claude/agents/<name>.md` (the worker's def) and log a `loop-adjust` (the
   ratchet). The floor only rises.
5. **Record it** — append a `ref-add` entry to `state/log.md`; if it was on the roadmap, move its
   row out of `state/roadmap.md`.

**Built capabilities beyond the v1 two:** `make-video` (`.claude/agents/make-video.md` +
`.claude/refs/make-video.md`) — Hyperframes screenshot-walkthrough → MP4, fulfilled via the
request→fulfill handoff above. **Planned capabilities** still in **`state/roadmap.md`**:
`generate-figures` (mermaid diagrams + figures), `enhance-screenshots`, `embed-demos`. Each is just
a new `.claude/agents/<name>.md` (+ its `.claude/refs/<name>.md`), invoked by whichever trigger fits
(mostly on-demand/site-class, like the scanner) with no orchestration change.

---

## State files

| File | What it holds |
|---|---|
| `state/sources.md` | **Source catalog** + the HARD confidentiality/PII gates (`skip-confidential`/`skip-PII`/`skip-not-mine`). Both workers read it first; never blog a barred source. |
| `state/coverage.md` | **Aspect-level coverage index** (the cheap high-level memory): per project, which ASPECTS are Covered vs Open. BOTH workers read it first and update it after. |
| `state/log.md` | Append-only, grep-parseable **DETAILED action log**: `init` / `loop-run` / `loop-adjust` / `ref-add` / `deploy`. Both workers append a dated entry per run (writer: article+aspect; scanner: site files changed). |
| `state/cursor.json` | `repo → last-scanned commit`. `portfolio-refresh` reads it, then advances each entry to that repo's HEAD. Seeded with the key projects' HEADs. |
| `state/article-queue.md` | The writing backlog (slug · title · category · source · angle). `portfolio-writer` pulls the next OPEN-aspect item; done rows move to **Done**. |
| `state/video-queue.md` | The **video request** backlog (the request→fulfill handoff). A worker appends an Open row (a small video-spec); the LEAD spawns `make-video` to fulfill it; done rows move to **Done**. |
| `state/roadmap.md` | Planned-but-unbuilt capabilities (future agent defs + refs) the system is designed to support. |

> **Two-level writer/scanner memory (read-first, update-after — never re-scan everything):**
> `coverage.md` is the cheap aspect-level INDEX both workers read first; `log.md` is the append-only
> DETAILED log they write after. `sources.md` holds the source catalog + the hard PII/confidentiality
> gates. See `src/content/SCHEMA.md` › "Writer memory: sources + coverage ledger".

## References
| Path | Use |
|---|---|
| `/home/codex/Projects/portfolio/CLAUDE.md` | Project facts: deploy command, structure, honesty/confidentiality content rules, design-system gotchas |
| `/home/codex/Projects/portfolio/src/content/SCHEMA.md` | The KB conventions: collections, frontmatter, asset homes, the baked-in gates. `src/content/` is the source of truth. |
| `/home/codex/Projects/portfolio/.claude/agents/portfolio-refresh.md` | The site-sync WORKER subagent def (→ points at `refs/refresh-portfolio.md`) |
| `/home/codex/Projects/portfolio/.claude/agents/portfolio-writer.md` | The article WORKER subagent def (→ points at `refs/write-article.md`) |
| `/home/codex/Projects/portfolio/.claude/refs/refresh-portfolio.md` | The site-sync how-to (the ref `portfolio-refresh` reads) |
| `/home/codex/Projects/portfolio/.claude/refs/write-article.md` | The article how-to (the ref `portfolio-writer` reads; dual-purpose → x-agent) |
| `/home/codex/Projects/portfolio/.claude/agents/make-video.md` | The video WORKER subagent def (→ points at `refs/make-video.md`) |
| `/home/codex/Projects/portfolio/.claude/refs/make-video.md` | The video how-to (Hyperframes screenshot-walkthrough → MP4, OFFLINE; the ref `make-video` reads) |
| `/home/codex/Projects/portfolio/.claude/make-video/` | The reusable composition template (`build-composition.mjs` + vendored GSAP/fonts + the TreAxe example spec) |
| `/home/codex/Projects/portfolio/scripts/deploy.sh` | The deploy: source→main, build→gh-pages, `.nojekyll` |
| `/home/codex/Projects/portfolio/src/content/articles/` | The three seed articles (migrated from the old build dir's `notes/`) + later pieces |
| `/home/codex/Projects/x-agent` | Sibling agent + downstream consumer of article `keyTakes` |
