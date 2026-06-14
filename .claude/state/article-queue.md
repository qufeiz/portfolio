# Article queue — the "Agent Systems" writing backlog

The `portfolio-write` skill draws the NEXT article from here. One idea per row. When an article
is drafted + wired into the site, move its row to **Done** (with the published path/anchor) and the
lead notes a `loop-run` in `log.md`. Articles are **dual-purpose**: each ends in `## Key takes`
that the x-agent (`/home/codex/Projects/x-agent`) can lift as post seeds.

> Honesty gate applies to every article (see `AGENTS.md` › Gates): no invented metrics,
> collaborations credited, FredGPT confidentiality respected. Ground each piece in REAL project
> work + the agent docs.

## Already drafted — MIGRATED into the KB (done; do NOT redo)
The three seed notes have been migrated from `/home/codex/Projects/_portfolio-build/notes/` into the
knowledge base at `src/content/articles/` (Astro content collection). They render at `/notes/<slug>`
and are listed by the collection-driven "Agent Systems" section. See `src/content/SCHEMA.md`.

- [x] `00-orchestrate-gate-ratchet.md` — **Orchestrate → Gate → Ratchet** → `src/content/articles/orchestrate-gate-ratchet.md` → `/notes/orchestrate-gate-ratchet`
- [x] `01-independent-verification.md` — **Independent verification** → `src/content/articles/independent-verification.md` → `/notes/independent-verification`
- [x] `02-the-ratchet.md` — **The ratchet** → `src/content/articles/the-ratchet.md` → `/notes/the-ratchet`

## Queue — write/refresh ONE per loop fire (top = next)
- [ ] **Determinism around stochasticity** — the model is a probability distribution; you don't trust a single run, you gate it. The deterministic checks (validateX, removable-handler, fail-closed scanners) that wrap every stochastic step.
- [ ] **Context engineering** — bounded context, unbounded work: the long-lived orchestrator holds the plan, throwaway subagents do the grunt work and are discarded so context never accumulates.
- [ ] **Compiled knowledge & the self-ingest loop** — turning years of raw chat logs into a queryable, deduped wiki (life-wiki); knowledge as a compiled, regenerable artifact, not a transcript pile.
- [ ] **Honest automation** — agents that ship real, unsupervised work without overclaiming: fail-closed gates, "never claim a post you can't see," confidentiality, and the human-approval floor.
- [ ] **Two ways to package an agent** — a repo-level skill registry (this portfolio agent, x-agent) vs. a standing PM/engineer/verifier team; when each shape fits.

## Done
- [x] **The hub: "My Agent Teams"** → `src/content/articles/my-agent-teams.md` (`kind: hub`, order 0) → `/notes/my-agent-teams`. Concise v1: the two teams (build team + fleet) + the orchestrate→gate→ratchet thesis, links the concept articles. Deeper per-team sections marked to-be-expanded.
- [x] `00-orchestrate-gate-ratchet.md` → `/notes/orchestrate-gate-ratchet` (migrated to KB)
- [x] `01-independent-verification.md` → `/notes/independent-verification` (migrated to KB)
- [x] `02-the-ratchet.md` → `/notes/the-ratchet` (migrated to KB)
