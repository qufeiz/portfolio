# Source catalog — what exists, what's bloggable, what's barred

The **writer's memory of every source it could draw from.** The `portfolio-writer` reads this
FIRST (with `coverage.md` + `article-queue.md`) so it never re-scans every project + article each
run. After it writes an article, it sets the source's **status** here and adds a row to
`coverage.md`. New sources get appended; the catalog is not regenerated from scratch.

Enumerated from: `ls ~/Projects`, `gh repo list qufeiz`, and the bloggable folders inside
`/home/codex/Projects/portfolio.zip` (top-level `portfolio/`). Last enumerated 2026-06-14.

## Columns
- **name** — repo/folder (and any sibling repos that make up one product).
- **what** — one line.
- **type** — `case-study` | `blog-candidate` | `skip-confidential` | `skip-PII` | `skip-not-mine`.
- **status** — `covered → <article>` or `pending` (or the skip reason for barred rows).

---

## ⛔ HARD GATES (encoded — never blog these)

> These are confidentiality/PII walls. The writer must NOT draft an article from any row below,
> regardless of the queue. If a queued item would touch one of these, drop it.

| name | what | type | status |
|---|---|---|---|
| `tessera` | Bosch work (schema/platform). | **skip-confidential** | NEVER blog — Bosch confidential |
| `tessera-schema-benchmark` | Schema-generation benchmark, Bosch context. | **skip-confidential** | NEVER blog — Bosch confidential |
| `Tessera-Bosch` (in `portfolio.zip`) | Bosch deliverables in the zip. | **skip-confidential** | NEVER blog — Bosch confidential |
| `portfolio.zip` › CV / Cover letters | `CV-qufeiz.*`, `Cover/`, cover letters. | **skip-PII** | NEVER blog — owner's real name; site uses "Qufeiii"/"Qufeiii" |
| `portfolio.zip` › `张去非_CMU`, `CMU` enrollment | `Enrollment_Verification_293040.pdf`, CMU enrollment docs. | **skip-PII** | NEVER blog — real name + enrollment number |
| `portfolio.zip` › AI-program application essays | application/admissions essays in the zip. | **skip-PII** | NEVER blog — personal application material, real name |
| `karpathy-llm-wiki` | Andrej Karpathy's "LLM Wiki" pattern doc (an idea file to copy into your own agent). | **skip-not-mine** | NEVER blog as mine — Karpathy's, not the owner's. (The owner's IMPLEMENTATION of the pattern = `life-wiki`, which IS bloggable.) |

The portfolio publishes under **"Qufeiii"** (GitHub `qufeiz`). The owner's real name appears ONLY
in the `skip-PII` zip docs above and must never reach the site.

---

## ✅ Case studies — already published (the `/work` pages)

| name | what | type | status |
|---|---|---|---|
| `TreAxe` | Construction-ops SaaS: leads → estimates → projects → invoices → payments + client portal (React/Vite/TS + Supabase + Stripe). **Co-built/co-owned with a collaborator.** Live: www.treaxe.io. | **case-study** | covered → `/work/treaxe` case page |
| `FREDGPT` / `FredSeriesAI` / `Fredgpt-Econograph-official-Backend` | Agentic GenAI over economic data (FRED). **CMU 14-798 Fall-2025 team practicum for an industry client.** 🔒 publish ONLY demo video + public screenshots + public problem statement; never the `Private/` SOW/TOS/budget/sponsor; no public code link. | **case-study** | covered → `/work/fredgpt` case page |

---

## 📝 Blog candidates — good to write about (not yet covered)

> "Good to write about" ≠ "auto-publish." Mark anything uncertain `blog-candidate` with a note;
> the lead reviews before publish. Ground every claim in the real repo/doc (honesty gate).

| name | what | type | status |
|---|---|---|---|
| EconoRAG (`econorag-frontend` + `my-langgraph-rag`) | LangGraph RAG over economic data; the public econorag frontend + the private langgraph-rag backend. Predecessor/cousin of the FredGPT line. | **blog-candidate** | pending → queued `econorag` |
| `jobright-agent` | Automates Jobright job applications end-to-end; the workflow lives in the `jobright-apply` skill. A real unsupervised-automation agent in the fleet. | **blog-candidate** | pending → queued `jobright-agent` |
| `x-agent` | Two skills drive an X/Twitter account for @ChristophZhang; posting works end-to-end headless via Playwright + seeded cookies. Home of the de-AI **voice gate** (no em-dashes, no AI tells). Downstream consumer of every article's `keyTakes`. | **blog-candidate** | pending → queued `x-agent` |
| `life-wiki` (the SYSTEM) | LLM-maintained "clone of my life" — years of chat history **compiled** into interlinked, time-aware markdown (Karpathy's LLM-Wiki pattern). **Blog the SYSTEM/mechanism only — NEVER the private corpus** (the compiled life content is personal). | **blog-candidate** | pending → queued `life-wiki` (system only) |
| Contract-Retriever (`Contract-Retriever-RAG` → `Contract-Retriever-Agentic`) | Business-knowledge assistant. v1: query-routing + hybrid SQL/RAG + grounded cited answers (Next.js + DeepSeek). v2: agentic re-platform — a Claude Agent SDK loop navigates a `knowledge/` tree and reads real files, **no embeddings**. Strong "RAG → agentic rebuild" story. | **blog-candidate** | pending → queued `contract-retriever` |
| `arXiv2Table` / `arxivDIGESTables` | "Can LLMs generate tabular summaries of science papers?" — a benchmark + eval-protocol (arXiv 2504.10284). Research/eval work. Confirm authorship/role before publishing (could be a contributed benchmark). | **blog-candidate** | pending → queued `arxiv2table` (confirm role) |
| `portfolio.zip` › `SmartWatch用户调研` | Smartwatch user-research study (interviews, test assignment). UX/research artifact. | **blog-candidate** | pending → queued `smartwatch-user-research` |
| `portfolio.zip` › `Startup` | Early-venture experiments: `zoning-copilot` (RAG planner/navigator over zoning code), `AppraisalOS`, `n8n` automations, `wordpressseo`. Pick the strongest (zoning-copilot) as the lead angle. | **blog-candidate** | pending → queued `startup-experiments` |
| `portfolio.zip` › `YChack` | YC hackathon project (image assets present; confirm what was built before drafting). | **blog-candidate** | pending → queued `ychack` (confirm scope) |
| `portfolio` (this repo) | The self-maintaining portfolio agent itself (lead + worker subagents + refs + this ledger). A clean "agent built its own portfolio" story — overlaps the `packaging` concept piece; write as a project post only if it adds beyond the concept article. | **blog-candidate** | pending (overlaps `packaging` concept) |

### Sibling / supporting agents (the fleet — bloggable as the SYSTEM, mostly via the concept pieces)
| name | what | type | status |
|---|---|---|---|
| `feature-team` / `saas-feature-wisdom` | The standing PM/engineer/verifier build team + its bundled wisdom repo. Already the backbone of the agent-systems concept articles. | **blog-candidate** | covered (system) → the 4 `agent-systems` articles; see `coverage.md` |

---

## Not separately catalogued (intentionally)
- The four already-published `agent-systems` articles' sources (the build team, x-agent, life-wiki,
  jobright, this portfolio agent) are mapped in `coverage.md`, not re-listed as pending here.
- Old/forked GitHub repos from `gh repo list` (course forks, templates, `qufeiz.github.io`,
  langchain/langgraph forks, etc.) are **not** owner-authored products and are not catalogued as
  candidates. Add a row only if one turns out to be genuine, shippable, owner-built work.
