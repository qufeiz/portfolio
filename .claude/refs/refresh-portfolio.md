# Ref — refresh the portfolio from projects

> The how-to for the **`portfolio-refresh`** worker subagent (`.claude/agents/portfolio-refresh.md`).
> The lead spawns that named subagent with a high-level goal ("Refresh the site from recent project
> changes"); its def points it here, and you follow this ref exactly: do one scan-and-update pass,
> `npm run build`, report, do NOT deploy.
> Scan the owner's `~/Projects/*` for real changes since the cursor and update the portfolio site to
> match — case studies, `src/data/*`, screenshots — then prove the build still passes. Use whenever
> the task is to bring the site up to date with what the owner has actually shipped. ONE
> scan-and-update pass per invocation; the lead runs it on the weekly loop. For WRITING an
> article/blog, use `write-article.md` instead.

# Portfolio Refresh — sync the site to what the owner actually shipped

You are a **focused single-pass worker** spawned by the portfolio lead. Your ENTIRE job is: find
what changed in the owner's projects since the cursor, reflect the *real, non-overclaimed* changes
into the portfolio site, run `npm run build`, and return a concise report. You do **NOT** run the
loop, deploy, or write articles (that's `write-article.md`). One pass, then report.

> The owner's other repos are **READ-ONLY** to you — you only read their `git log` / files. You
> write **only** inside `/home/codex/Projects/portfolio` (and append to `.claude/state/`). Never
> commit or edit another repo.

> You **propose**, you never overclaim. If a change isn't clearly real and shippable, leave a note
> for the lead rather than inventing copy. Honesty + confidentiality gates (below) are mandatory.

**Before starting, create a TodoWrite list with these steps:**
```
Step 0 — LEDGER FIRST: read state/coverage.md + state/log.md + state/cursor.json (cheap) to see
         what's already covered/done. Load gates (AGENTS.md › Gates + sources.md › HARD GATES).
Step 1 — Per repo: git log <last>..HEAD — collect REAL changes since the cursor
Step 2 — Map changes → site edits (case study / src/data/* / screenshots). Skip noise.
Step 3 — Apply edits in /home/codex/Projects/portfolio ONLY. Honesty + confidentiality/PII on every edit.
Step 4 — `npm run build` must pass. Fix or revert until green.
Step 5 — UPDATE THE LEDGER: advance cursor.json; reflect any newly-covered aspect in coverage.md;
         append a DETAILED entry to state/log.md. Report (do NOT deploy).
```

---

## Step 0 — LEDGER FIRST, then gates + cursor (don't re-derive what's known)

You have a two-level memory shared with the writer. **Read the cheap layers BEFORE scanning** so you
don't re-derive what's already on the site:

1. **`/home/codex/Projects/portfolio/.claude/state/coverage.md`** — the aspect-level coverage index:
   which project aspects are already reflected on the site / in articles. Use it to recognize what's
   already covered instead of re-deriving it from scratch.
2. **`/home/codex/Projects/portfolio/.claude/state/log.md`** — the append-only DETAILED action log:
   what previous runs changed. Skim the recent entries so you don't repeat work.
3. **`/home/codex/Projects/portfolio/.claude/state/cursor.json`** — `repo → last-scanned commit`.

Then read `/home/codex/Projects/portfolio/.claude/AGENTS.md` › **Gates** (honesty, confidentiality,
build-must-pass) and `/home/codex/Projects/portfolio/.claude/state/sources.md` › **HARD GATES** (the
`skip-confidential` / `skip-PII` / `skip-not-mine` walls — e.g. Tessera/Bosch, the zip's personal
PII docs, Karpathy's pattern doc). They bind every edit you make. Never surface a barred source.

`coverage.md` (the index) is the high-level memory; `state/log.md` (the detailed log) is the per-run
history. You READ them first and APPEND to the log after (Step 5) — that loop is what keeps you from
re-scanning everything.

---

## Step 1 — Find real changes since the cursor (one git pass per repo)

For each repo in `cursor.json.repos` with a non-null commit:
```bash
git -C <repo> log --oneline <last-commit>..HEAD          # what shipped since we last looked
git -C <repo> diff --stat <last-commit>..HEAD            # where it landed
```
If `<last-commit>` already equals HEAD, there is nothing new for that repo — skip it.

For a repo with `null` (e.g. `FREDGPT.zip`, not a git repo on this box), scan its case-study source
(the already-published assets in `public/fredgpt/` + the FredGPT case content) instead of `git log`,
and respect its confidentiality note in `cursor.json`.

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
| Agent-systems work (this repo, x-agent, life-wiki, feature-team) | belongs in an ARTICLE — note it for `write-article.md`, don't force it into a case card |

Prefer a project's **own official screenshots** over re-captures (e.g. TreAxe's
`docs/features/*/images/` and `docs/product/images/`).

---

## Step 3 — Apply edits (portfolio repo ONLY) under the gates

Edit only files under `/home/codex/Projects/portfolio/`. On EVERY edit:
- **Honesty** — no invented metrics, awards, or role specifics. Collaborations stay credited
  (TreAxe co-built/co-owned with a collaborator — never imply sole authorship). If you can't verify a
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

## Step 5 — UPDATE THE LEDGER + report (do NOT deploy)

Update all the memory layers you touched:
1. **`cursor.json`** — for every repo you actually scanned, set its entry to that repo's current HEAD
   (`git -C <repo> rev-parse HEAD`) and bump the top-level `updated`. (Leave a skipped repo untouched.)
2. **`coverage.md`** — if a site edit now makes a project aspect covered (a new case-page section, a
   new screenshot set, a stack change), flip that aspect Open→Covered with `(site: <surface>)`. If a
   scan surfaced a brand-new bloggable aspect, note it under that project's Open list (and, if a
   whole new source appeared, add a row to `sources.md`). If you made no site edits, leave it.
3. **`state/log.md`** — append ONE dated, grep-parseable entry (newest at the bottom):
   `## YYYY-MM-DD loop-run | refresh: <one-line>` followed by detailed bullets — repos scanned + new
   commit counts, the EXACT site files changed and why (or "no edits"), build PASS/FAIL, any
   coverage update. This is the DETAILED action log; be specific enough that the next run can trust
   it instead of re-deriving.

Then report — this is ALL the lead sees, so be concise and brutally honest:
- **scanned**: repos checked + how many new commits each had (or "no change").
- **changed**: the exact site files you edited and the one-line reason for each (or "no edits — nothing portfolio-worthy shipped").
- **gates**: honesty + confidentiality/PII held? Any `TODO(owner)` you left? Anything you deliberately did NOT write because it would overclaim?
- **build**: PASS / FAIL (paste the tail if it failed).
- **ledger**: confirm cursor advanced + coverage/log updated.
- **for write-article**: any agent-systems work or newly-open project aspect that should become an article.
- **self_check**: did you follow this ref? Anything ambiguous/missing/that you worked around — name it so the lead can ratchet this ref.

## References
| Path | Use |
|---|---|
| `/home/codex/Projects/portfolio/.claude/AGENTS.md` | The lead runbook + the Gates that bind every edit |
| `/home/codex/Projects/portfolio/CLAUDE.md` | Project context: deploy, structure, honesty/confidentiality content rules, design-system gotchas |
| `/home/codex/Projects/portfolio/.claude/state/sources.md` | Source catalog + the HARD confidentiality/PII gates — read first; never surface a barred source |
| `/home/codex/Projects/portfolio/.claude/state/coverage.md` | Aspect-level coverage index — read first (Step 0), update covered aspects after (Step 5) |
| `/home/codex/Projects/portfolio/.claude/state/log.md` | The append-only DETAILED action log — skim recent entries (Step 0), append your run (Step 5) |
| `/home/codex/Projects/portfolio/.claude/state/cursor.json` | repo → last-scanned commit (read at Step 0, advance at Step 5) |
| `/home/codex/Projects/portfolio/src/data/` | `projects.ts`, `site.ts`, `treaxeShots.ts` — the site's data layer |
