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

### Concept posts (`category: agent-systems`) — the cross-cutting ideas
- [ ] `context-engineering` — **Bounded context, unbounded work** · `agent-systems` · the lead/worker split across the fleet · the long-lived orchestrator holds the plan; throwaway subagents do the grunt work and are discarded so context never accumulates.
- [ ] `compiled-knowledge` — **Compiled knowledge & the self-ingest loop** · `agent-systems` · `life-wiki` (the SYSTEM only) · turning years of raw chat logs into a queryable, deduped wiki; knowledge as a compiled, regenerable artifact, not a transcript pile. NEVER the private corpus.
- [ ] `honest-automation` — **Honest automation** · `agent-systems` · x-agent + this portfolio agent · agents that ship real, unsupervised work without overclaiming: fail-closed gates, "never claim a post you can't see," confidentiality, the human-approval floor.
- [ ] `packaging-an-agent` — **Two ways to package an agent** · `agent-systems` · this portfolio repo + the build team · a repo-level capability model (project-level subagents in `.claude/agents/`, each pointed at a `.claude/refs/` how-to) vs. a standing PM/engineer/verifier team; when each shape fits.

### Needs owner input before writing
- [ ] `ychack` — **YC hackathon build** · `projects` · `portfolio.zip › YChack` · only 3 image assets in the zip (no code/text) — owner must describe what was actually built before this can be written honestly.

## Done
- [x] `smartwatch-user-research` — **What people actually want from a smartwatch (and a smart dumbbell)** · `projects` · `portfolio.zip › SmartWatch用户调研` · a CMU smart-fitness-equipment course project written up as a two-phase UX/research artifact: discovery (secondary research on sedentary work + 10 spontaneous in-person interviews → the "sit 6-10h, know it's bad, push through" finding, the age-split behavior, and "nobody wanted a tracker, they wanted built-in movement") and a build/test (a CPX smart-dumbbell prototype, water-bottle simulated, chosen because hands-on-weight forces hands-free detection; an 8-participant think-aloud test where the no-buttons interaction held but classification of similar lifts (bicep vs hammer curl) failed and participants silently changed their own form to be read). Honest coursework framing, no invented metrics; interviewee/participant names + employers anonymized to role + age band. → `/notes/smartwatch-user-research`
- [x] `startup-experiments` — **Things I tried to start** · `projects` · `portfolio.zip › Startup` · early-venture experiments led by zoning-copilot: real FastAPI + Playwright + OpenAI Python that answers a California zoning question by walking an LLM down the live Municode TOC (no vector store) and answering only from the fetched code sections with citations; the crawler runs `fetch()` inside the authenticated browser session; a built-but-unshipped `planner.py`/`rag.py` indexing path noted honestly. Supporting (scoped honestly): AppraisalOS (a technical design doc, not code), n8n (screenshots only), wordpressseo (a real 29-node n8n RSS → OpenAI-translate → Telegram-approval → WordPress-draft workflow). Through-line: LLM/automation proposes, human/hard-rule disposes. → `/notes/startup-experiments`
- [x] `determinism-around-stochasticity` — **Determinism around stochasticity** · `agent-systems` · feature-team + the fleet's gates · an LLM call is a sample from a distribution, so you never trust one run, you gate it with deterministic code: the engineer's pure `validateX()` (passes every golden, fails every toy), the verifier's removable-handler proof (break the handler → red), x-agent's rules-as-data voice gate (`tweet_composer.py`, exit 1 on a tell, `--selftest`), and the fail-closed `privacy_scan.py` (default-deny `--shareable`; empty rule set → exit 2, never 0). Closes with "the LLM proposes, the deterministic layer disposes" + the meta-miss link to the ratchet. Cross-linked to `orchestrate-gate-ratchet` / `independent-verification` / `the-ratchet`. → `/notes/determinism-around-stochasticity`
- [x] `x-agent` — **Posting to X, headless, in my own voice** · `projects` · `x-agent` · two skills drive a real X account end-to-end via Playwright + a seeded cookie session (X blocks headless logins), behind a deterministic de-AI voice gate (the same no-em-dash/no-AI-tells floor this writer mirrors) that fails closed on AI tells; original posts add a fail-closed privacy gate + meaning-layer self-check + human approval; the post script reads the result back and logs an honest POSTED/UNCONFIRMED/ERROR status, idempotent by url. Mechanism only: no credentials, no seeded cookies, no account handle, no personal posts, no fabricated counts. Cross-link: this is the downstream consumer of every article's keyTakes. → `/notes/x-agent`
- [x] `jobright-agent` — **An agent that applies to jobs while I sleep** · `projects` · `jobright-agent` · end-to-end Jobright application automation packaged as the `jobright-apply` skill: orchestrator + throwaway apply-subagents, the never-auto-submit human gate, two-channel verification with honest statuses, the ATS dispatcher with walled-platform bailout, and the React-typing / spam-detection / rotating-code gotchas. PII held (no real name/contact/employers). → `/notes/jobright-agent`
- [x] `econorag` — **EconoRAG: a ReAct agent over Federal Reserve data** · `projects` · `econorag-frontend`+`my-langgraph-rag` · a LangGraph ReAct agent that answers economics questions only from live FRED tool calls + a user-scoped retrieved index (never general world knowledge); 7 tools, a 4-call cap, out-of-band chart attachments; predecessor of the FredGPT line. → `/notes/econorag`
- [x] `contract-retriever` — **From RAG to an agent that reads the files** · `projects` · `Contract-Retriever-RAG`+`-Agentic` · the client rejected vanilla vector search, so v1 was query-routing + hybrid SQL/RAG and v2 a Claude Agent SDK loop that navigates a `knowledge/` tree with no embeddings; same product, swapped retrieval engine. → `/notes/contract-retriever`
- [x] `my-agent-teams` — **The hub: "My Agent Teams"** · `agent-systems` (`kind: hub`, order 0) → `/notes/my-agent-teams`. The two teams (build team + fleet) + the orchestrate→gate→ratchet thesis; links the concept articles. Deeper per-team sections marked to-be-expanded.
- [x] `orchestrate-gate-ratchet` → `/notes/orchestrate-gate-ratchet` (migrated to KB)
- [x] `independent-verification` → `/notes/independent-verification` (migrated to KB)
- [x] `the-ratchet` → `/notes/the-ratchet` (migrated to KB)
