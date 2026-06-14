# AGENTS.md — portfolio agent (the LEAD ORCHESTRATOR runbook)

A repo-level, **self-improving** agent that maintains the owner's portfolio
(https://qufeiz.github.io/portfolio/) on a recurring weekly loop. It is a real member of the
owner's agent family and uses the **same orchestrate → gate → ratchet** pattern as the others
(`x-agent`, `life-wiki`, the PM/engineer/verifier `feature-team`).

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

- **`portfolio-refresh`** (`.claude/agents/portfolio-refresh.md` → reads `.claude/refs/refresh-portfolio.md`)
  — scan the owner's `~/Projects/*` for real changes since the cursor and update the site (case
  studies, `src/data/*`, screenshots); proves `npm run build` passes. One scan-and-update pass per
  invocation.
- **`portfolio-writer`** (`.claude/agents/portfolio-writer.md` → reads `.claude/refs/write-article.md`)
  — write/refresh ONE article for the "Agent Systems" section from real project work + the agent
  docs; honesty-gated; ends in `keyTakes` (x-agent post seeds); wired into the site automatically by
  the collection.

**The loop references "the available agents" GENERICALLY** — it iterates over whatever
`.claude/agents/*.md` exist and chooses among them. So a NEW agent slots in **without editing the
loop** (see "How to add a capability" below, and `state/roadmap.md` for the planned ones). Growing
the system = adding an agent def (+ its ref); that's the **capability ratchet**.

> **Why the loop can spawn these:** they're **project-level** subagent types — defined in this
> repo's `.claude/agents/` — so a session running the loop from here can spawn them by name with the
> Agent tool (`subagent_type: portfolio-refresh` / `portfolio-writer`). (A session running *as* a
> nested subagent can't spawn further agents — so run the loop from a top-level session.)

---

## ⚠️ There is a weekly loop — and it does NOT auto-start

The intended way to run this is a recurring loop (default cadence **weekly**): each fire delegates
work, gates it, deploys if clean, and ratchets on a miss. **A fresh clone is dormant —
nothing runs until an agent starts the loop in a session.** It is not a background daemon.

- **What `/loop` is:** a Claude Code skill that re-runs a prompt on a schedule. Start it with
  `/loop <interval> <paste the loop prompt below>` (e.g. `/loop 1w`). **No `/loop`?** drive the
  same prompt from cron via `claude -p "<the loop prompt>" --dangerously-skip-permissions`, or
  paste it manually whenever you want a refresh. The logic is identical.
- **State** lives in `.claude/state/`: `log.md` (append-only ledger), `cursor.json`
  (repo → last-scanned commit), `article-queue.md` (writing backlog), `roadmap.md` (planned agents).

---

## The weekly loop — orchestrate → gate → ratchet (copy-paste ready)

Paste the block below verbatim into `/loop <interval>` (e.g. `/loop 1w`) or as the prompt for a
cron `claude -p`. It is self-contained: the lead delegates to whatever agents exist, gates the
output, deploys, ratchets on a miss, then stops until the next fire.

```
Portfolio maintenance loop — ORCHESTRATE -> GATE -> RATCHET. You are the LEAD. You hold the plan
and do NO grunt work: spawn a named worker subagent per unit, review its report, deploy only if
it's clean, and FIX the agent def/ref when a subagent falls short. Repo:
/home/codex/Projects/portfolio. Run this from a TOP-LEVEL session (so you can spawn project-level
subagents). Each fire:

0) DISCOVER THE AGENTS (do this every fire — never hardcode the list):
   `ls /home/codex/Projects/portfolio/.claude/agents/*.md`. These are the available capabilities —
   project-level WORKER subagents, each named `<name>` and pointed at its own
   `.claude/refs/<name>.md`. Read `.claude/state/{cursor.json,article-queue.md,log.md}` to see what's
   pending. Choose which agents this cycle needs (default: portfolio-refresh THEN portfolio-writer;
   plus any other agent that now exists and is relevant — a new agent def slots in here
   automatically, no loop edit).

1) DELEGATE (one named worker subagent per chosen capability; keep YOUR context lean). For each
   chosen agent, spawn it with the Agent tool — `subagent_type: <name>` — and a HIGH-LEVEL one-line
   goal, NOT the how-to (the subagent already knows its job + which ref to read). The two v1
   capabilities:
   - REFRESH — `subagent_type: portfolio-refresh`, goal: "Refresh the site from recent project
     changes since the cursor." It does ONE scan-and-update pass, runs `npm run build`, reports, no
     deploy.
   - WRITE — `subagent_type: portfolio-writer`, goal: "Write the next queued article from
     state/article-queue.md." It drafts ONE article (honesty-gated, keyTakes filled), runs
     `npm run build`, reports, no deploy.
   Read each subagent's report. The subagents do the work; you only review.

2) REVIEW / GATE (cheap, in your context — block deploy unless ALL hold):
   - HONESTY: no invented metrics/awards/role; collaborations credited (TreAxe co-built w/ Barrat
     Mohammad; FredGPT a CMU team practicum for an industry client (economic-data domain) — never sole authorship).
   - CONFIDENTIALITY: nothing from FredGPT's `Private/` (client SOW/TOS/budget/sponsor); no FredGPT
     public code link. Co-owned repos OK.
   - REAL, NOT OVERCLAIMED: every change reflects something that actually shipped; drop anything a
     subagent couldn't ground.
   - BUILD PASSES: `cd /home/codex/Projects/portfolio && npm run build` exits 0. If a subagent
     reported FAIL, do NOT deploy — bounce it back or revert.
   If a gate fails, do NOT deploy; go to step 4 (ratchet) and/or re-delegate.

3) DEPLOY (only if every gate in step 2 passed):
   `cd /home/codex/Projects/portfolio && npm run build && bash /home/codex/Projects/_portfolio-build/deploy-pages.sh`
   Then VERIFY LIVE: curl-retry https://qufeiz.github.io/portfolio/ (Pages takes ~1 min) and
   confirm the new content is actually live. If it isn't live, say so — never claim a deploy you
   can't see. Append a `deploy` entry to `.claude/state/log.md`.

4) RATCHET (if a subagent fell short of its job — skipped a gate, overclaimed, missed a real
   change, produced thin work): EDIT the relevant `.claude/refs/<name>.md` (the how-to) and/or the
   `.claude/agents/<name>.md` (the worker's def) to close the gap, and append a `loop-adjust` entry
   to `.claude/state/log.md` (`## YYYY-MM-DD loop-adjust | <what was wrong> -> <the fix>`). The
   quality floor only goes up. (Project-content gotchas can also go in the repo `CLAUDE.md`.)

5) LOG + REPORT + STOP: append a `loop-run` entry to `.claude/state/log.md` (what each subagent did,
   what shipped, deploy result). Report 2-3 lines: what refreshed, what article shipped + its key
   takes for the x-agent, deploy/verify result, any ratchet. Then STOP until the next fire.
```

---

## The gates (what the lead enforces before anything is published)

| Gate | Rule | Where it bites |
|---|---|---|
| **Honesty** | No invented metrics, awards, or role specifics. Every collaboration credited — TreAxe co-built with **Barrat Mohammad** (co-owned, never sole authorship); FredGPT a **CMU 14-798** team practicum for **an industry client (economic-data domain)**. Unverifiable → `TODO(owner)`, not a claim. | every refresh edit + every article (the worker's self-check; lead re-checks in step 2) |
| **Confidentiality** | FredGPT `Private/` content (client SOW / TOS / budget / sponsor notes) is **never** published — only the demo video + public screenshots + the public problem statement; no FredGPT public code link. Co-owned repos (TreAxe) are fine to link. | refresh + write, and the lead's step-2 review |
| **Build must pass** | `npm run build` exits 0 before any deploy. A red tree is never deployed. | subagent before reporting; lead step 2 |
| **Deploy-verify** | After deploy, confirm the content is actually **live** (curl-retry the Pages URL). Never claim a deploy you can't see. | lead step 3 |
| **Lead reviews before publish** | The lead independently re-checks honesty + confidentiality + "real, not overclaimed" on the subagents' output before deploying. The subagent is not its own final gate. | lead step 2 |

Each worker runs its own honesty/confidentiality self-checks; the lead's step-2 review is the
**independent** layer on top (mirroring the family's "the worker doesn't grade its own work" rule).

---

## How to add a capability (the capability ratchet)

A capability is a **project-level subagent**: a `.claude/agents/<name>.md` definition (the worker's
persona + the ref pointer) plus the `.claude/refs/<name>.md` how-to it points at. The loop picks a
new one up automatically — no loop edit required, because the loop discovers agents at runtime
(step 0).

1. **Write the ref** `.claude/refs/<name>.md` — a flat, self-contained how-to with numbered steps a
   worker can follow end-to-end. Model it on `refresh-portfolio.md` / `write-article.md`: one unit of
   work per invocation, the relevant gates, advance any state it owns, end with a concise report + a
   `self_check`.
2. **Write the agent def** `.claude/agents/<name>.md` — Claude Code subagent format: YAML frontmatter
   `name: <name>` + a `description` (when to use it), optional `tools`, `model: inherit`; a SHORT
   body that carries the worker's persona and says **"Read and follow `.claude/refs/<name>.md`
   exactly"** plus the one-pass/no-deploy rule. The def carries the pointer, NOT the full how-to —
   that lives in the ref. Model it on `portfolio-refresh.md` / `portfolio-writer.md`.
3. **The loop discovers it next fire** — the next fire's step-0 discovery (`ls .claude/agents/*.md`)
   surfaces it; the lead chooses it when relevant and spawns it by name (`subagent_type: <name>`)
   with a one-line high-level goal.
4. **Improve it on a miss** — when a subagent falls short, edit that `.claude/refs/<name>.md` (the
   how-to) and/or `.claude/agents/<name>.md` (the worker's def) and log a `loop-adjust` (the
   ratchet). The floor only rises.
5. **Record it** — append a `ref-add` entry to `state/log.md`; if it was on the roadmap, move its
   row out of `state/roadmap.md`.

**Planned capabilities** the structure already supports (not built in v1) are future agents in
**`state/roadmap.md`**: `make-demo-video` (hyperframe), `generate-figures` (mermaid diagrams +
figures), `enhance-screenshots`, `embed-demos`. Each is just a new `.claude/agents/<name>.md` (+ its
`.claude/refs/<name>.md`) the loop will pick up with no change.

---

## State files

| File | What it holds |
|---|---|
| `state/log.md` | Append-only, grep-parseable ledger: `init` / `loop-run` / `loop-adjust` / `ref-add` / `deploy`. |
| `state/cursor.json` | `repo → last-scanned commit`. `portfolio-refresh` reads it, then advances each entry to that repo's HEAD. Seeded with the key projects' HEADs. |
| `state/article-queue.md` | The "Agent Systems" writing backlog. `portfolio-writer` pulls the next item; done rows move to **Done**. |
| `state/roadmap.md` | Planned-but-unbuilt capabilities (future agent defs + refs) the system is designed to support. |

## References
| Path | Use |
|---|---|
| `/home/codex/Projects/portfolio/CLAUDE.md` | Project facts: deploy command, structure, honesty/confidentiality content rules, design-system gotchas |
| `/home/codex/Projects/portfolio/src/content/SCHEMA.md` | The KB conventions: collections, frontmatter, asset homes, the baked-in gates. `src/content/` is the source of truth. |
| `/home/codex/Projects/portfolio/.claude/agents/portfolio-refresh.md` | The site-sync WORKER subagent def (→ points at `refs/refresh-portfolio.md`) |
| `/home/codex/Projects/portfolio/.claude/agents/portfolio-writer.md` | The article WORKER subagent def (→ points at `refs/write-article.md`) |
| `/home/codex/Projects/portfolio/.claude/refs/refresh-portfolio.md` | The site-sync how-to (the ref `portfolio-refresh` reads) |
| `/home/codex/Projects/portfolio/.claude/refs/write-article.md` | The article how-to (the ref `portfolio-writer` reads; dual-purpose → x-agent) |
| `/home/codex/Projects/_portfolio-build/deploy-pages.sh` | The deploy: source→main, build→gh-pages, `.nojekyll` |
| `/home/codex/Projects/_portfolio-build/notes/` | 00/01/02 — the three already-drafted seed articles |
| `/home/codex/Projects/x-agent` | Sibling agent + downstream consumer of article `keyTakes` |
