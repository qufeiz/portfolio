---
name: "portfolio-refresh"
description: "Scan the owner's ~/Projects/* for real changes since the cursor and update the portfolio site to match — case studies, src/data/*, screenshots — then prove the build still passes. Use whenever the task is to bring the site up to date with what the owner has actually shipped. ONE scan-and-update pass per invocation; the lead runs it on the weekly loop. For WRITING an article/blog, use portfolio-write instead."
license: MIT
metadata:
  version: 1.0.0
  author: Qufei Zhang
  category: portfolio
  updated: 2026-06-14
---

# Portfolio Refresh — sync the site to what the owner actually shipped

You are a **focused single-pass worker** spawned by the portfolio lead. Your ENTIRE job is: find
what changed in the owner's projects since the cursor, reflect the *real, non-overclaimed* changes
into the portfolio site, run `npm run build`, and return a concise report. You do **NOT** run the
loop, deploy, or write articles (that's `portfolio-write`). One pass, then report.

> The owner's other repos are **READ-ONLY** to you — you only read their `git log` / files. You
> write **only** inside `/home/codex/Projects/portfolio` (and append to `.claude/state/`). Never
> commit or edit another repo.

> You **propose**, you never overclaim. If a change isn't clearly real and shippable, leave a note
> for the lead rather than inventing copy. Honesty + confidentiality gates (below) are mandatory.

**Before starting, create a TodoWrite list with these steps:**
```
Step 0 — Load gates (AGENTS.md › Gates) + read state/cursor.json
Step 1 — Per repo: git log <last>..HEAD — collect REAL changes since the cursor
Step 2 — Map changes → site edits (case study / src/data/* / screenshots). Skip noise.
Step 3 — Apply edits in /home/codex/Projects/portfolio ONLY. Honesty + confidentiality on every edit.
Step 4 — `npm run build` must pass. Fix or revert until green.
Step 5 — Advance cursor.json to each scanned repo's HEAD. Report (do NOT deploy).
```

---

## Step 0 — Load the gates + the cursor

Read `/home/codex/Projects/portfolio/.claude/AGENTS.md` › **Gates** (honesty, confidentiality,
build-must-pass). They bind every edit you make. Then read
`/home/codex/Projects/portfolio/.claude/state/cursor.json` — the map of `repo → last-scanned commit`.

---

## Step 1 — Find real changes since the cursor (one git pass per repo)

For each repo in `cursor.json.repos` with a non-null commit:
```bash
git -C <repo> log --oneline <last-commit>..HEAD          # what shipped since we last looked
git -C <repo> diff --stat <last-commit>..HEAD            # where it landed
```
If `<last-commit>` already equals HEAD, there is nothing new for that repo — skip it.

For a repo with `null` (e.g. `_fredgpt-build`, not a git repo on this box), scan its working tree /
case-study source instead of `git log`, and respect its confidentiality note in `cursor.json`.

**Keep this lean.** You are looking for changes that are *portfolio-worthy*: a new feature/screen, a
shipped milestone, a stack change, a new screenshot — not refactors, lint, or WIP. Read commit
subjects and the diffstat; only open files when a change looks site-relevant. Do not read whole
repos.

---

## Step 2 — Map real changes to site edits

Decide, per real change, where it belongs on the site (no edit if nothing is genuinely new):

| What changed in a project | Where it goes in the portfolio |
|---|---|
| New/changed feature, screen count, milestone, status | the project's case page (`src/pages/work/<slug>.astro`) + its row in `src/data/projects.ts` |
| Stack / tooling change | the `stack: [...]` array in `src/data/projects.ts` |
| New/better official screenshots | copy into `public/<project>/`, wire via the gallery data (e.g. `src/data/treaxeShots.ts`) |
| A new project worth showing | a new row in `src/data/projects.ts` (+ a case page) — flag to the lead first if unsure |
| Agent-systems work (this repo, x-agent, life-wiki, feature-team) | belongs in an ARTICLE — note it for `portfolio-write`, don't force it into a case card |

Prefer a project's **own official screenshots** over re-captures (e.g. TreAxe's
`docs/features/*/images/` and `docs/product/images/`).

---

## Step 3 — Apply edits (portfolio repo ONLY) under the gates

Edit only files under `/home/codex/Projects/portfolio/`. On EVERY edit:
- **Honesty** — no invented metrics, awards, or role specifics. Collaborations stay credited
  (TreAxe co-built with Barrat Mohammad — never imply sole authorship). If you can't verify a
  number, don't write it; leave a `TODO(owner)` comment.
- **Confidentiality** — FredGPT: never publish anything from the source `Private/` folder
  (client SOW / TOS / budget / sponsor notes); only the demo video + public screenshots + the
  public problem statement. No public code repo link for FredGPT. Co-owned repos are fine to link.
- Keep the design-system rules in the project `CLAUDE.md` (e.g. the global `.shell` gutter, the
  `.reveal` scroll behavior) — don't regress them.

If a change is ambiguous or you'd have to overclaim to write it, **make no edit** and record it in
your report for the lead to judge. Proposing-not-inventing beats a confident wrong claim.

---

## Step 4 — Build must pass (the deterministic gate)

```bash
cd /home/codex/Projects/portfolio && npm run build
```
This must exit 0. If it fails, fix your edit or revert it — **never** leave the tree red. A green
build is the floor for handing back to the lead; the lead will not deploy a tree you can't build.

---

## Step 5 — Advance the cursor + report (do NOT deploy)

For every repo you actually scanned, set its entry in `cursor.json` to that repo's current HEAD
(`git -C <repo> rev-parse HEAD`) and bump the top-level `updated`. (Leave a repo untouched if you
skipped it.)

Then report — this is ALL the lead sees, so be concise and brutally honest:
- **scanned**: repos checked + how many new commits each had (or "no change").
- **changed**: the exact site files you edited and the one-line reason for each (or "no edits — nothing portfolio-worthy shipped").
- **gates**: honesty + confidentiality held? Any `TODO(owner)` you left? Anything you deliberately did NOT write because it would overclaim?
- **build**: PASS / FAIL (paste the tail if it failed).
- **for portfolio-write**: any agent-systems work that should become an article.
- **self_check**: did you follow this skill? Anything ambiguous/missing/that you worked around — name it so the lead can ratchet this SKILL.md.

## References
| Path | Use |
|---|---|
| `/home/codex/Projects/portfolio/.claude/AGENTS.md` | The lead runbook + the Gates that bind every edit |
| `/home/codex/Projects/portfolio/CLAUDE.md` | Project context: deploy, structure, honesty/confidentiality content rules, design-system gotchas |
| `/home/codex/Projects/portfolio/.claude/state/cursor.json` | repo → last-scanned commit (read at Step 0, advance at Step 5) |
| `/home/codex/Projects/portfolio/src/data/` | `projects.ts`, `site.ts`, `treaxeShots.ts` — the site's data layer |
