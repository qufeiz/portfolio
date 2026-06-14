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
- Seeded state: `cursor.json` (HEADs of TreAxe, x-agent, life-wiki, jobright-agent, feature-team, portfolio; _fredgpt-build = null/not-a-repo), `article-queue.md` (6 article ideas), `roadmap.md` (4 planned capabilities).
- Seed content noted: 3 drafted articles at `/home/codex/Projects/_portfolio-build/notes/` (00,01,02) to be wired into the site's "Agent Systems" section.
- Loop NOT run; nothing deployed. This is scaffolding/architecture — specifics to be improved later.

## 2026-06-14 loop-adjust | capability model recast from "skills" to "refs" (simpler, easier to update)
- Capabilities are now flat "how-to" REF FILES at `.claude/refs/<name>.md` run via generic throwaway subagents — not Claude skills / agent-types. Matches the rest of the owner's fleet (point a subagent at a ref/runbook).
- Moved `skills/portfolio-refresh/SKILL.md` → `.claude/refs/refresh-portfolio.md`; `skills/portfolio-write/SKILL.md` → `.claude/refs/write-article.md` (all instructional content preserved; write-article still targets `src/content/articles/<slug>.md` per `src/content/SCHEMA.md`). Removed the now-empty `.claude/skills/`.
- Reframed `AGENTS.md` (architecture + loop step 0 = `ls .claude/refs/*.md`, step 1 = spawn one subagent per ref with the "Read and follow `.claude/refs/<name>.md` exactly" brief), `roadmap.md` (planned capabilities = future ref files), and the `skill-add` ledger type → `ref-add`. Adding a capability = write one ref file; updating = edit it.

## 2026-06-14 loop-adjust | capability model evolved to project-level subagent DEFS + refs (matches the owner's build team)
- Capabilities are now **project-level subagents** in `.claude/agents/<name>.md` (Claude Code subagent format: YAML `name`/`description`/optional `tools` + a short body = system prompt that carries the persona + the ref pointer), each pointing at its `.claude/refs/<name>.md` how-to. Mirrors the owner's `pm`/`engineer`/`verifier` defs+refs pattern. The lead now spawns a NAMED subagent (`subagent_type: <name>`) with a HIGH-LEVEL goal, not the verbatim "read this ref" brief — the def already tells the worker its job + which ref to read.
- Created `.claude/agents/portfolio-refresh.md` (→ `refs/refresh-portfolio.md`) + `.claude/agents/portfolio-writer.md` (→ `refs/write-article.md`). Refs KEPT as-is (only their top "who points at this" blurb updated to name the worker; the how-to content is unchanged; write-article still targets `src/content/articles/<slug>.md` per `src/content/SCHEMA.md`).
- Reframed `AGENTS.md`: added the 3-layer naming clarifier (AGENTS.md = LEAD loop · `.claude/agents/` = WORKER subagents · `.claude/refs/` = the how-tos), loop step 0 = `ls .claude/agents/*.md`, step 1 = spawn the named subagent with a one-line goal (+ note that the loop can spawn these because they're project-level types, run from a top-level session). `roadmap.md` planned capabilities = future agent defs + refs. `npm run build` sanity check passed; nothing deployed.
