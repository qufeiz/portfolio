# Article queue — the writing backlog

The `write-article` ref draws the NEXT article from here. **But the queue is not read alone:** the
writer FIRST reads `state/sources.md` + `state/coverage.md` + this file (all cheap), picks a queued
item whose source aspect is still **Open** in `coverage.md`, writes ONE article, then updates the
ledger (move the row to Done here, flip the aspect to Covered in `coverage.md`, append a detailed
entry to `state/log.md`). It does NOT re-scan every project + article each run — the ledger is its
memory.

> **Honesty + confidentiality gate** (see `sources.md` › HARD GATES and `AGENTS.md` › Gates): no
> invented metrics, collaborations credited, FredGPT confidentiality respected, never blog a
> `skip-confidential` / `skip-PII` / `skip-not-mine` source. Ground each piece in REAL work + docs.

Each row: **slug · title · category · source · one-line angle.** `category` is the frontmatter
`category` (`agent-systems` | `projects` | `life` | `essays`) per `src/content/SCHEMA.md`.

## Already drafted — MIGRATED into the KB (done; do NOT redo)
- [x] `orchestrate-gate-ratchet` — **Orchestrate → Gate → Ratchet** · `agent-systems` → `/notes/orchestrate-gate-ratchet`
- [x] `independent-verification` — **Independent verification** · `agent-systems` → `/notes/independent-verification`
- [x] `the-ratchet` — **The ratchet** · `agent-systems` → `/notes/the-ratchet`

---

## Queue — write/refresh ONE per loop fire (top = next). Check `coverage.md` for the OPEN aspect.

### Project posts (`category: projects`) — one per genuinely-bloggable, not-yet-covered source
- [ ] `jobright-agent` — **An agent that applies to jobs while I sleep** · `projects` · `jobright-agent` · end-to-end Jobright application automation packaged as the `jobright-apply` skill; a real unsupervised-automation worker in the fleet.
- [ ] `x-agent` — **Posting to X, headless, in my own voice** · `projects` · `x-agent` · two skills drive an X account end-to-end via Playwright + seeded cookies, with a de-AI voice gate so the output never reads like a model. (Cross-link: this is the consumer of every article's keyTakes.)
- [ ] `arxiv2table` — **Can LLMs summarize papers into tables?** · `projects` · `arXiv2Table`/`arxivDIGESTables` · the benchmark + eval-protocol for tabular paper summaries (arXiv 2504.10284). CONFIRM the owner's role before publishing.
- [ ] `smartwatch-user-research` — **What people actually want from a smartwatch** · `projects` · `portfolio.zip › SmartWatch用户调研` · a user-research study (interviews + test assignment) as a UX/research write-up.
- [ ] `startup-experiments` — **Things I tried to start** · `projects` · `portfolio.zip › Startup` · early-venture experiments; lead with zoning-copilot (RAG over zoning code), plus AppraisalOS / n8n / wordpressseo.
- [ ] `ychack` — **YC hackathon build** · `projects` · `portfolio.zip › YChack` · the hackathon project. CONFIRM what was actually built (only image assets present) before drafting.

### Concept posts (`category: agent-systems`) — the cross-cutting ideas
- [ ] `determinism-around-stochasticity` — **Determinism around stochasticity** · `agent-systems` · feature-team + the fleet's gates · the model is a probability distribution; you don't trust a single run, you gate it. The deterministic checks (validateX, removable-handler, fail-closed scanners) that wrap every stochastic step.
- [ ] `context-engineering` — **Bounded context, unbounded work** · `agent-systems` · the lead/worker split across the fleet · the long-lived orchestrator holds the plan; throwaway subagents do the grunt work and are discarded so context never accumulates.
- [ ] `compiled-knowledge` — **Compiled knowledge & the self-ingest loop** · `agent-systems` · `life-wiki` (the SYSTEM only) · turning years of raw chat logs into a queryable, deduped wiki; knowledge as a compiled, regenerable artifact, not a transcript pile. NEVER the private corpus.
- [ ] `honest-automation` — **Honest automation** · `agent-systems` · x-agent + this portfolio agent · agents that ship real, unsupervised work without overclaiming: fail-closed gates, "never claim a post you can't see," confidentiality, the human-approval floor.
- [ ] `packaging-an-agent` — **Two ways to package an agent** · `agent-systems` · this portfolio repo + the build team · a repo-level capability model (project-level subagents in `.claude/agents/`, each pointed at a `.claude/refs/` how-to) vs. a standing PM/engineer/verifier team; when each shape fits.

## Done
- [x] `econorag` — **EconoRAG: a ReAct agent over Federal Reserve data** · `projects` · `econorag-frontend`+`my-langgraph-rag` · a LangGraph ReAct agent that answers economics questions only from live FRED tool calls + a user-scoped retrieved index (never general world knowledge); 7 tools, a 4-call cap, out-of-band chart attachments; predecessor of the FredGPT line. → `/notes/econorag`
- [x] `contract-retriever` — **From RAG to an agent that reads the files** · `projects` · `Contract-Retriever-RAG`+`-Agentic` · the client rejected vanilla vector search, so v1 was query-routing + hybrid SQL/RAG and v2 a Claude Agent SDK loop that navigates a `knowledge/` tree with no embeddings; same product, swapped retrieval engine. → `/notes/contract-retriever`
- [x] `my-agent-teams` — **The hub: "My Agent Teams"** · `agent-systems` (`kind: hub`, order 0) → `/notes/my-agent-teams`. The two teams (build team + fleet) + the orchestrate→gate→ratchet thesis; links the concept articles. Deeper per-team sections marked to-be-expanded.
- [x] `orchestrate-gate-ratchet` → `/notes/orchestrate-gate-ratchet` (migrated to KB)
- [x] `independent-verification` → `/notes/independent-verification` (migrated to KB)
- [x] `the-ratchet` → `/notes/the-ratchet` (migrated to KB)
