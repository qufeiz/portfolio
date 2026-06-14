# AGENTS.md — portfolio agent (the LEAD ORCHESTRATOR runbook)

A repo-level, **self-improving** agent that maintains the owner's portfolio
(https://qufeiz.github.io/portfolio/) on a recurring weekly loop. It is a real member of the
owner's agent family and uses the **same orchestrate → gate → ratchet** pattern as the others
(`x-agent`, `life-wiki`, the PM/engineer/verifier `feature-team`).

> **Who is this for?** This file is for the **lead** — the long-lived orchestrator that runs the
> loop. A subagent spawned to do one unit of work (refresh, write) ignores this file and follows
> the one ref it was pointed at — `.claude/refs/<name>.md`. Project facts (deploy, structure,
> content rules) live in the repo-root **`CLAUDE.md`**; this file complements it with the operating
> model.
>
> **Convention:** capabilities = `.claude/refs/` how-to docs run via generic subagents (not Claude
> skills). The lead points a fresh throwaway subagent at one ref; there is no skill/agent-type
> ceremony.

> **The knowledge base.** `src/content/` is the portfolio's **single source of truth** (Astro
> content collections). `src/` only RENDERS it; the refs READ/WRITE it. Conventions + the
> baked-in honesty/confidentiality gates are in **`src/content/SCHEMA.md`** — `write-article.md`
> authors articles into `src/content/articles/` per that schema.

---

## The role — a lead that holds the plan and does NO grunt work

The lead is **long-lived**: it holds the plan, decides *when* to run, **delegates each discrete
unit of work to a throwaway subagent**, reviews the subagent's short report, and **self-improves
the refs** when a subagent falls short. The lead never does the scanning, writing, building, or
deploying itself — that work belongs in disposable subagent contexts so the lead's context stays
lean and strategic. This is the same split x-agent and life-wiki use.

## Capabilities are REF FILES (this is the architecture)

Capabilities are **ref files** — flat "how to do X" docs at **`.claude/refs/<name>.md`**, each one
self-contained. The lead spawns a generic throwaway subagent and tells it: *Read and follow
`.claude/refs/<name>.md` exactly; do one unit; `npm run build`; report; do NOT deploy.* No
skill/agent-type ceremony — this matches the rest of the owner's fleet (life-wiki, jobright, the
build team all work the same way: point a subagent at a ref/runbook). The lead **discovers** the
available refs at runtime and **delegates** to whichever ones the current cycle needs. v1 ships two:

- **`refresh-portfolio.md`** — scan the owner's `~/Projects/*` for real changes since the cursor and
  update the site (case studies, `src/data/*`, screenshots); proves `npm run build` passes. One
  scan-and-update pass per invocation.
- **`write-article.md`** — write/refresh ONE article for the "Agent Systems" section from real
  project work + the agent docs; honesty-gated; ends in `## Key takes` (x-agent post seeds); wires
  it into the site.

**The loop references "the available refs" GENERICALLY** — it iterates over whatever
`refs/*.md` exist and chooses among them. So a NEW ref slots in **without editing the
loop** (see "How to add a capability" below, and `state/roadmap.md` for the planned ones). Growing
the system = adding refs; that's the **capability ratchet**.

---

## ⚠️ There is a weekly loop — and it does NOT auto-start

The intended way to run this is a recurring loop (default cadence **weekly**): each fire delegates
work, gates it, deploys if clean, and ratchets the refs on a miss. **A fresh clone is dormant —
nothing runs until an agent starts the loop in a session.** It is not a background daemon.

- **What `/loop` is:** a Claude Code skill that re-runs a prompt on a schedule. Start it with
  `/loop <interval> <paste the loop prompt below>` (e.g. `/loop 1w`). **No `/loop`?** drive the
  same prompt from cron via `claude -p "<the loop prompt>" --dangerously-skip-permissions`, or
  paste it manually whenever you want a refresh. The logic is identical.
- **State** lives in `.claude/state/`: `log.md` (append-only ledger), `cursor.json`
  (repo → last-scanned commit), `article-queue.md` (writing backlog), `roadmap.md` (planned refs).

---

## The weekly loop — orchestrate → gate → ratchet (copy-paste ready)

Paste the block below verbatim into `/loop <interval>` (e.g. `/loop 1w`) or as the prompt for a
cron `claude -p`. It is self-contained: the lead delegates to whatever refs exist, gates the
output, deploys, ratchets on a miss, then stops until the next fire.

```
Portfolio maintenance loop — ORCHESTRATE -> GATE -> RATCHET. You are the LEAD. You hold the plan
and do NO grunt work: delegate each unit to a throwaway subagent, review its report, deploy only
if it's clean, and FIX the ref when a subagent falls short. Repo: /home/codex/Projects/portfolio.
Each fire:

0) DISCOVER THE REFS (do this every fire — never hardcode the ref list):
   `ls /home/codex/Projects/portfolio/.claude/refs/*.md`. These are the available capabilities
   (flat how-to docs). Read `.claude/state/{cursor.json,article-queue.md,log.md}` to see what's
   pending. Choose which refs this cycle needs (default: refresh-portfolio THEN write-article; plus
   any other ref that now exists and is relevant — a new ref slots in here automatically, no loop
   edit).

1) DELEGATE (one throwaway subagent per chosen ref; keep YOUR context lean). For each chosen ref,
   spawn a generic throwaway subagent with the standard brief: "Read and follow
   /home/codex/Projects/portfolio/.claude/refs/<name>.md exactly; do one unit; `npm run build`;
   return your concise report; do NOT deploy." The two v1 capabilities:
   - REFRESH — `.claude/refs/refresh-portfolio.md`: ONE scan-and-update pass over the owner's
     projects since the cursor; updates the site; runs `npm run build`.
   - WRITE — `.claude/refs/write-article.md`: draft/refresh the NEXT article from
     state/article-queue.md, honesty-gated, ending in `## Key takes`, wired into the site; runs
     `npm run build`.
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

4) RATCHET (if a subagent fell short of its ref — skipped a gate, overclaimed, missed a real
   change, produced thin work): EDIT the relevant `.claude/refs/<name>.md` to close the gap,
   and append a `loop-adjust` entry to `.claude/state/log.md` (`## YYYY-MM-DD loop-adjust | <what
   was wrong> -> <the fix>`). The quality floor only goes up. (Project-content gotchas can also go
   in the repo `CLAUDE.md`.)

5) LOG + REPORT + STOP: append a `loop-run` entry to `.claude/state/log.md` (what each subagent did,
   what shipped, deploy result). Report 2-3 lines: what refreshed, what article shipped + its key
   takes for the x-agent, deploy/verify result, any ratchet. Then STOP until the next fire.
```

---

## The gates (what the lead enforces before anything is published)

| Gate | Rule | Where it bites |
|---|---|---|
| **Honesty** | No invented metrics, awards, or role specifics. Every collaboration credited — TreAxe co-built with **Barrat Mohammad** (co-owned, never sole authorship); FredGPT a **CMU 14-798** team practicum for **an industry client (economic-data domain)**. Unverifiable → `TODO(owner)`, not a claim. | every refresh edit + every article (the ref's self-check; lead re-checks in step 2) |
| **Confidentiality** | FredGPT `Private/` content (client SOW / TOS / budget / sponsor notes) is **never** published — only the demo video + public screenshots + the public problem statement; no FredGPT public code link. Co-owned repos (TreAxe) are fine to link. | refresh + write, and the lead's step-2 review |
| **Build must pass** | `npm run build` exits 0 before any deploy. A red tree is never deployed. | subagent Step 4/5; lead step 2 |
| **Deploy-verify** | After deploy, confirm the content is actually **live** (curl-retry the Pages URL). Never claim a deploy you can't see. | lead step 3 |
| **Lead reviews before publish** | The lead independently re-checks honesty + confidentiality + "real, not overclaimed" on the subagents' output before deploying. The subagent is not its own final gate. | lead step 2 |

Each ref runs its own honesty/confidentiality self-checks; the lead's step-2 review is the
**independent** layer on top (mirroring the family's "the worker doesn't grade its own work" rule).

---

## How to add a capability (the capability ratchet)

A capability is just **one markdown file** — a `.claude/refs/<name>.md` how-to. The loop picks a new
one up automatically — no loop edit required, because the loop discovers refs at runtime (step 0).

1. **Write** `.claude/refs/<name>.md` — a flat, self-contained how-to with numbered steps a
   throwaway subagent can follow end-to-end. Model it on `refresh-portfolio.md` / `write-article.md`:
   one unit of work per invocation, the relevant gates, advance any state it owns, end with a
   concise report + a `self_check`.
2. **The loop discovers it next fire** — the next fire's step-0 discovery (`ls refs/*.md`) surfaces
   it; the lead chooses it when relevant and spawns a generic subagent with the standard brief:
   "Read and follow `.claude/refs/<name>.md` exactly; do one unit; `npm run build`; report; do NOT
   deploy."
3. **Improve the ref on a miss** — when a subagent falls short, edit that `.claude/refs/<name>.md`
   and log a `loop-adjust` (the ratchet). The floor only rises.
4. **Record it** — append a `ref-add` entry to `state/log.md`; if it was on the roadmap, move its
   row out of `state/roadmap.md`.

**Planned capabilities** the structure already supports (not built in v1) are future ref files in
**`state/roadmap.md`**: `refs/make-demo-video.md` (hyperframe), `refs/generate-figures.md` (mermaid
diagrams + figures), `refs/enhance-screenshots.md`, `refs/embed-demos.md`. Each is just a new ref
file the loop will pick up with no change.

---

## State files

| File | What it holds |
|---|---|
| `state/log.md` | Append-only, grep-parseable ledger: `init` / `loop-run` / `loop-adjust` / `ref-add` / `deploy`. |
| `state/cursor.json` | `repo → last-scanned commit`. `portfolio-refresh` reads it, then advances each entry to that repo's HEAD. Seeded with the key projects' HEADs. |
| `state/article-queue.md` | The "Agent Systems" writing backlog. `portfolio-write` pulls the next item; done rows move to **Done**. |
| `state/roadmap.md` | Planned-but-unbuilt capabilities (future ref files) the system is designed to support. |

## References
| Path | Use |
|---|---|
| `/home/codex/Projects/portfolio/CLAUDE.md` | Project facts: deploy command, structure, honesty/confidentiality content rules, design-system gotchas |
| `/home/codex/Projects/portfolio/src/content/SCHEMA.md` | The KB conventions: collections, frontmatter, asset homes, the baked-in gates. `src/content/` is the source of truth. |
| `/home/codex/Projects/portfolio/.claude/refs/refresh-portfolio.md` | The site-sync ref (capability) |
| `/home/codex/Projects/portfolio/.claude/refs/write-article.md` | The article ref (capability; dual-purpose → x-agent) |
| `/home/codex/Projects/_portfolio-build/deploy-pages.sh` | The deploy: source→main, build→gh-pages, `.nojekyll` |
| `/home/codex/Projects/_portfolio-build/notes/` | 00/01/02 — the three already-drafted seed articles |
| `/home/codex/Projects/x-agent` | Sibling agent + downstream consumer of article `## Key takes` |
