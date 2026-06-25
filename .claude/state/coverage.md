# Coverage map — what's covered, by ASPECT (the high-level index)

The **shared, cheap-to-read index** for BOTH worker agents (`portfolio-writer` AND
`portfolio-refresh`). Read it FIRST every run so you never re-scan every project + article. It is
the high-level "what's covered" layer; the append-only DETAILED action log is `state/log.md`.

> **Two-level memory (both agents):**
> 1. **`coverage.md` (this file)** = the index. Per source: which ASPECTS are covered (and by which
>    article/site surface) vs. which are still OPEN. Cheap to scan. Both agents READ it first and
>    UPDATE it after acting.
> 2. **`state/log.md`** = the append-only DETAILED log. Every run appends one dated, grep-parseable
>    entry (writer: which article + which project/aspect; scanner: which exact site files changed).

> **Aspect-level is the point.** Don't track a project as merely "covered/not". Track WHICH parts
> are done so the writer can read "aspect A covered, B open → I'll write B" and the scanner can see
> what site surfaces already reflect a project. After covering an aspect, MOVE it from Open → Covered
> and name the article/surface.

> The confidentiality/PII gates in `sources.md` still bind: never open an aspect on a
> `skip-confidential` / `skip-PII` / `skip-not-mine` source.

Legend: `(article: <slug>)` = the `/notes/<slug>` article that covers it · `(site: <surface>)` =
a `/work` case page or data surface.

---

## TreAxe  — `case-study` (live: www.treaxe.io; co-built/co-owned)
- **Covered**
  - The product overview + build (site: `/work/treaxe` case page; `src/data/projects.ts`).
  - Payments / Stripe flow (site: case page; article: `independent-verification` uses the real
    Send-Invoice catastrophe as its worked example).
- **Open** (candidate aspects, not yet written)
  - RLS / Supabase auth + multi-tenant access model.
  - The AI assistant feature.
  - The proposal / estimate-PDF generator.
  - Leads → estimates → projects → invoices pipeline as a workflow story.
  - The client portal.

## FredGPT — `case-study` (CMU 14-798 team practicum; 🔒 confidentiality-gated)
- **Covered**
  - Problem statement + demo (site: `/work/fredgpt` case page; public screenshots + demo video).
- **Open**
  - The agentic architecture over FRED economic data (publish the MECHANISM only; never `Private/`
    SOW/TOS/budget/sponsor; no public code link).
  - The eval / accuracy approach (only if groundable from public material).

## Agent systems (the fleet + the build team) — the site's thesis
- **Covered**
  - The umbrella thesis + the two teams (article: `my-agent-teams`, the `hub`).
  - Orchestrate → gate → ratchet (article: `orchestrate-gate-ratchet`).
  - Independent verification (article: `independent-verification`).
  - The ratchet (article: `the-ratchet`).
  - Determinism around stochasticity (gating every stochastic step) (article: `determinism-around-stochasticity`).
  - Context engineering (bounded context, throwaway subagents) (article: `context-engineering`).
- **Open** (queued concept aspects — see `article-queue.md` › `agent-systems`)
  - Compiled knowledge & the self-ingest loop (life-wiki as a SYSTEM).
  - Honest automation (fail-closed gates, human-approval floor).
  - Two ways to package an agent (repo-level subagents vs. a standing team).

## EconoRAG (`econorag-frontend` + `my-langgraph-rag`) — `blog-candidate`
- **Covered**
  - The LangGraph ReAct architecture over FRED economic data: the tool-or-no-answer grounding rule,
    the agent/tools loop with a 4-call cap, the 7 FRED/FRASER/retrieval tools, out-of-band chart
    attachments, user_id-scoped retrieval, and the FastAPI/Fly.io shape; framed as the predecessor of
    the FredGPT line. (article: `econorag`)
- **Open:** none remaining for this source (the architecture aspect is now covered).

## jobright-agent — `blog-candidate`
- **Covered**
  - The end-to-end Jobright application automation (the `jobright-apply` skill) as an
    unsupervised-automation story: the never-auto-submit human approval gate, the orchestrator +
    throwaway apply-subagent split (one application per run), two-channel verification with the honest
    status ladder (confirmed / submitted-no-email / unverified / failed), the ATS dispatcher that
    routes by host and bails before filling on walled platforms, the CAPTCHA-is-a-hard-stop and
    never-invent-personal-data lines, and the encoded ATS gotchas (type-don't-inject React inputs,
    spam-detection stealth at submit, the rotating verification-code handshake). MECHANISM only — no
    real name/contact/employers (PII held). (article: `jobright-agent`)
- **Open:** none remaining for this source (the automation story is now covered).

## x-agent — `blog-candidate`
- **Covered**
  - The de-AI voice gate is the STYLE PRECEDENT this portfolio's writer now follows
    (no em-dashes, no AI tells); x-agent is also the downstream consumer of every article's `keyTakes`.
  - The X/Twitter automation as its own piece — why it seeds an authenticated cookie session into a
    Playwright `storageState` instead of logging in (X walls headless logins with SMS); the two skills
    (replies + life-wiki-grounded original posts); the deterministic fail-closed voice gate
    (`tweet_composer.py`, rules-as-data, exit 1 on AI tells) as a quality mechanism; the layered
    privacy stack on original posts (default-deny sweep + fail-closed scanner + meaning-layer
    self-check + human approval); and the read-the-result-back honest status (POSTED/UNCONFIRMED/ERROR,
    idempotent-by-url logging). MECHANISM only — no credentials/cookies/handle/personal posts; the
    posted log characterized qualitatively, no fabricated counts. (article: `x-agent`)
- **Open:** none remaining for this source (the automation story is now covered).

## life-wiki — `blog-candidate` (SYSTEM only)
- **Covered:** none. (Named as a fleet member in `my-agent-teams`.)
- **Open:** the compiled-knowledge SYSTEM — chat history → interlinked time-aware markdown, the
  self-ingest loop (overlaps the `compiled-knowledge` concept piece). **NEVER the private corpus.**
  (article: queued `life-wiki` / `compiled-knowledge`)

## Contract-Retriever (`-RAG` → `-Agentic`) — `blog-candidate`
- **Covered**
  - The RAG → agentic rebuild story — v1 query-routing + hybrid SQL/RAG + cited answers,
    v2 a Claude Agent SDK loop navigating a `knowledge/` tree with no embeddings; why the client
    rejected vanilla vector search; the verification strategy that had to change with the engine.
    (article: `contract-retriever`)

## SmartWatch user research (`portfolio.zip` › `SmartWatch用户调研`) — `blog-candidate`
- **Covered**
  - The CMU smart-fitness-equipment course project as a two-phase UX/research write-up: the discovery
    half (secondary research on sedentary work + 10 spontaneous in-person interviews surfacing the
    "sit 6-10h, know it's bad, push through anyway" + the age-split-behavior + "nobody wanted a
    tracker" findings) and the build/test half (a CPX-based smart dumbbell prototype, water-bottle
    simulated, deliberately the harder hands-free case; an 8-participant think-aloud test where the
    no-buttons interaction held but classification of similar lifts failed, and participants silently
    changed their own form to make the detector read them). Third-party interviewee/participant names
    + employers anonymized (role + age band only); framed honestly as coursework, no invented metrics.
    (article: `smartwatch-user-research`)
- **Open:** none remaining for this source (the study is now covered).

## Startup experiments (`portfolio.zip` › `Startup`) — `blog-candidate`
- **Covered**
  - The early-venture experiments as one "things I tried to start" post led by zoning-copilot: the
    real FastAPI + Playwright + OpenAI mechanism that walks an LLM down the live Municode TOC (no
    vector store), borrows the browser's authenticated session to call the codesToc API, and answers
    only from the fetched sections with citations; the built-but-unshipped `planner.py`/`rag.py`
    indexing path called out honestly; AppraisalOS framed as a design doc (not code), n8n as
    screenshots only, wordpressseo as a real 29-node RSS → translate → Telegram-approval → WordPress
    n8n workflow. (article: `startup-experiments`)
- **Open:** none remaining for this source (the experiments are now covered).

## YChack (`portfolio.zip` › `YChack`) — `blog-candidate` (confirm scope first)
- **Covered:** none.
- **Open:** the YC hackathon build — CONFIRM what was actually built (only image assets present)
  before drafting. (article: queued `ychack`)

## This portfolio (the self-maintaining agent) — `blog-candidate`
- **Covered:** described as a fleet member in `my-agent-teams`.
- **Open:** a standalone "the agent that maintains its own portfolio" project post — only if it adds
  beyond the `packaging` concept article (the two overlap; prefer the concept piece unless the
  project angle is distinct).

---

## How each agent uses + updates this map

> **Two triggers, one shared index** (see `AGENTS.md`): `portfolio-writer` runs on the **DAILY
> writer loop** (one article/fire; skip the day if there's no real OPEN aspect to cover — no filler).
> `portfolio-refresh` runs **on demand** when the owner asks to "explore and update the portfolio"
> (projects change rarely, so the SITE is resynced deliberately, NOT daily). Both read this index
> first and update it after.

**`portfolio-writer`** (DAILY loop; read first → write one → update):
1. Read this map + `article-queue.md`. Pick the next queued item whose source aspect is **Open** here.
2. Write ONE article. Then MOVE that aspect from Open → Covered with `(article: <slug>)`, and append
   a detailed `loop-run`/article entry to `state/log.md` (article + project/aspect covered).

**`portfolio-refresh`** (ON-DEMAND, owner-triggered; read first → update site → update):
1. Read this map + `state/log.md` (+ `cursor.json`) to see what's already covered/done — don't
   re-derive it.
2. Do the scan-and-update pass. Then, if a site surface now covers a project aspect (a new case-page
   section, a new screenshot set, a stack change), reflect it here (Covered, `(site: <surface>)`),
   and append a detailed entry to `state/log.md` (the exact site files changed + the project/aspect).
