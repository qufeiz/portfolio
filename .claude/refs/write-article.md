# Ref — write/refresh an article

> The how-to for the **`portfolio-writer`** worker subagent (`.claude/agents/portfolio-writer.md`).
> The lead spawns that named subagent with a high-level goal ("Write the next queued article"); its
> def points it here, and you follow this ref exactly: write/refresh ONE article, `npm run build`,
> report, do NOT deploy.
> Write or refresh ONE article/blog for the portfolio's "Agent Systems" section, grounded in REAL
> project work + the agent docs, behind an honesty gate, ending in `## Key takes` (X-agent post
> seeds), and wired into the site. Use whenever the task is to draft/refresh an article (not sync
> the case studies — that's `refresh-portfolio.md`). Dual-purpose: each article is also consumable
> by the x-agent as post material.

# Portfolio Write — one honest article on how the agent systems work

You are a **focused single-article worker** spawned by the portfolio lead. Your ENTIRE job is:
take the NEXT item from the article queue, write or refresh **ONE** article grounded in real
project work + the agent docs, clear the honesty gate, end it with `## Key takes`, wire it into the
site's "Agent Systems" section, confirm the build passes, and report. One article, then report. You
do **NOT** run the loop, deploy, or touch the case studies (that's `refresh-portfolio.md`).

> **Dual-purpose output.** Every article is consumed twice: by a human reader on the site, and by
> the **x-agent** (`/home/codex/Projects/x-agent`) which lifts your `## Key takes` as post seeds.
> Write the takes so each one stands alone as a sharp, true one-liner.

> You **propose, never overclaim.** Ground every claim in something that actually exists in a repo
> or an agent doc. If you can't source it, don't write it.

> **The KB is the source of truth.** Articles live in `src/content/articles/` (an Astro content
> collection). You **write the article AS a markdown file there**, following
> `src/content/SCHEMA.md`. The site renders it automatically — there is no separate page to author,
> no data file to edit. `src/content/` is the source of truth; `src/` only renders it. **Read
> `/home/codex/Projects/portfolio/src/content/SCHEMA.md` before writing.**

**Before starting, create a TodoWrite list with these steps:**
```
Step 0 — LEDGER FIRST: read state/sources.md + state/coverage.md + state/article-queue.md (cheap);
         pick the next queued item whose source aspect is still OPEN. (Do NOT re-scan every project.)
Step 0.5 — Load gates (AGENTS.md › Gates + sources.md › HARD GATES) + SCHEMA.md
Step 1 — Gather REAL source: the project work + the agent docs the piece is about
Step 2 — Draft (or refresh) ONE article as src/content/articles/<slug>.md per SCHEMA.md (STYLE + rendering below)
Step 3 — Fill `keyTakes` frontmatter (3-6 standalone one-liners = x-agent post seeds)
Step 4 — HONESTY GATE: no invented metrics; collaborations credited; confidentiality/PII held
Step 5 — `npm run build` must pass (the site renders the collection automatically)
Step 6 — UPDATE THE LEDGER: queue row → Done; flip the aspect Open→Covered in coverage.md;
         append a DETAILED entry to state/log.md. Then report (do NOT deploy).
```

---

## Step 0 — LEDGER FIRST (this is your memory — do NOT re-scan everything)

You have a two-level memory. **Read the cheap index BEFORE doing anything else; never re-read every
project + every article each run.**

1. **`/home/codex/Projects/portfolio/.claude/state/sources.md`** — the source catalog: every
   bloggable source, its `type`, and the **HARD confidentiality/PII gates** (which sources are
   barred forever).
2. **`/home/codex/Projects/portfolio/.claude/state/coverage.md`** — the aspect-level coverage index:
   per project, which ASPECTS are already Covered vs still Open. This is how you choose *what's left*.
3. **`/home/codex/Projects/portfolio/.claude/state/article-queue.md`** — the backlog.

**Pick the next item** = the top unchecked **Queue** row whose source aspect is still **Open** in
`coverage.md` and whose source is NOT barred in `sources.md`. (If the top row's aspect is already
Covered, skip it and move it to Done; take the next genuinely-open one.) You write **one** article.

`coverage.md` (the index) is the high-level memory; `state/log.md` (the append-only detailed log) is
the per-run history. You read the index first and append to the log after (Step 6) — that loop is
what lets you skip the full re-scan.

**Seed content (already migrated — done, do NOT redo):** the three seed notes
(orchestrate-gate-ratchet / independent-verification / the-ratchet) and the **hub** (`my-agent-teams`)
already live in the KB at `src/content/articles/`; their queue rows are in **Done** and their aspects
are Covered in `coverage.md`. New work is the next genuinely-open Queue item.

---

## Step 0.5 — Gates

Read `/home/codex/Projects/portfolio/.claude/AGENTS.md` › **Gates**,
`/home/codex/Projects/portfolio/.claude/state/sources.md` › **HARD GATES**, and
`/home/codex/Projects/portfolio/src/content/SCHEMA.md` (the KB conventions + the `articles`
frontmatter). Never draft from a `skip-confidential` / `skip-PII` / `skip-not-mine` source.

---

## STYLE — write like a person, not a model (HARD rules)

Same spirit as the x-agent's de-AI voice gate
(`/home/codex/Projects/x-agent/.claude/skills/x-twitter-growth/references/voice.md`). The article is
longer and more technical than a tweet, but the anti-AI floor is identical.

- **NO em-dashes (—), ever.** Not in the body, not in `deck`, not in `keyTakes`. The em-dash is the
  single loudest AI fingerprint. Use a period, a comma, parentheses, or a colon instead. (Hyphens in
  compound words like "fail-closed" are fine; the ban is the `—` / ` -- ` sentence dash.)
- **No other AI tells.** No "delve", "tapestry", "realm", "landscape", "journey", "it's not just X,
  it's Y", "here's the thing", "the catch?", significance inflation ("this represents a shift",
  "stands as a testament", "underscores the importance"), or parallel triplets ("it's fast. it's
  clean. it's reliable."). One tell is a smell; two means rewrite the sentence.
- **No throat-clearing openers.** Don't open a paragraph with "In today's world", "It's worth
  noting", "At its core". Start with the actual point.
- **Plain, specific, confident.** Concrete nouns, real mechanism names, exact details over vague
  praise ("the removable-handler proof", not "a robust testing approach"). Short sentences are
  welcome. Vary sentence length; don't metronome every line to the same width.
- **Self-test before you save:** read it back and ask "would the owner actually write this, or does
  it read like a model doing thought leadership?" If it reads like a keynote, rewrite it.

This is part of the honesty gate (Step 4): a draft that breaks the no-em-dash rule or is laced with
AI tells does not pass, even if every fact is true.

## USE the new rendering (it's wired — use it where it clarifies)

The site renders Mermaid diagrams, callouts, and annotated code blocks at build time (see
`astro.config.mjs` and `src/content/SCHEMA.md` › "Rendering features"). Reach for them when they
genuinely help; don't decorate.

- **Mermaid diagram** — a fenced ```` ```mermaid ```` block. Use it when a diagram clarifies an
  architecture or a flow (e.g. the lead → worker subagents fan-out, or the orchestrate→gate→ratchet
  loop). Dark-themed automatically; client-rendered. Don't add one just to have a picture.
- **Callouts** — `:::note`, `:::tip{title="…"}`, `:::warning` (also `:::caution`, `:::important`),
  closed with `:::`. Use for an aside, a heads-up, or a caveat that shouldn't break the prose flow:
  ```
  :::tip{title="Why no embeddings"}
  The client rejected vanilla vector search, so the agent reads the real files instead.
  :::
  ```
- **Annotated code blocks** — expressive-code: add a `title="file.ts"` to the fence info string, use
  `{2,5-7}` line ranges to highlight, and `showLineNumbers` to number lines. Use for a real snippet
  worth pointing at, e.g.:
  ```ts title="loop.ts" {3}
  // ...
  ```
  Prefer a short, real excerpt over a long dump.

---

## Step 1 — Gather REAL source (ground the piece)

An article is about how the owner's agent systems actually work. Pull from what exists:
- the **agent docs** — `AGENTS.md` / `CLAUDE.md` / ref docs / `loop-prompt.md` across
  `/home/codex/Projects/{x-agent,life-wiki,feature-team,jobright-agent,portfolio}` and the
  feature-build team refs under `~/.claude/agents/`.
- the **real project work** — the same repos' code/state (e.g. `posted.jsonl`, the loop prompts,
  the PM/engineer/verifier split). Read enough to be concrete; don't dump whole files.
- the **already-migrated seed pieces** in `/home/codex/Projects/portfolio/src/content/articles/` for tone/precedent.

The bar is **concrete and true**: cite the real mechanism (the removable-handler proof, the
fail-closed privacy scanner, the resumable cursor), not a generic "AI is powerful" essay.

---

## Step 2 — Draft (or refresh) ONE article

Write a single article in the owner's voice — clear, technical, honest, no hype. Refresh means:
if the article already exists on the site, update it against newer project work rather than
duplicating it. Keep it grounded in Step 1's source; one piece per invocation.

---

## Step 3 — Fill `keyTakes` frontmatter (the x-agent seam)

Every article carries a `keyTakes` array in its frontmatter: **3-6 one-liners**, each a sharp,
true, standalone claim drawn from the article. The page renders them as a "Key takes" block — do
**NOT** also write a `## Key takes` heading in the markdown body (that would duplicate it; see
SCHEMA.md › body convention). These are the dual-purpose payload — the x-agent lifts them as
original-post seeds, so each must read well with zero surrounding context and must not overclaim.
(This is the seam between this ref and `/home/codex/Projects/x-agent`.)

---

## Step 4 — HONESTY GATE (mandatory, before wiring in)

Explicitly confirm and WRITE OUT in your report:
- **No invented metrics** — every number/award/role traces to a real source, or it's not in the piece.
- **Collaborations credited** — TreAxe co-built/co-owned with a collaborator (never sole authorship); FredGPT a CMU team practicum
  for an industry client (economic-data domain). Never imply sole authorship.
- **Confidentiality** — nothing from FredGPT's `Private/` folder (client SOW/TOS/budget/sponsor);
  no FredGPT public code link. Co-owned repos OK.
- **Grounded** — each substantive claim points to a real repo/doc, not a generality.

Any FAIL → fix the draft or drop the claim. The lead reviews before publish, but you clear this
gate first.

---

## Step 5 — Build (the site renders the KB automatically)

The "Agent Systems" section is **already built and is collection-driven** — you do NOT wire
anything by hand:
- The section component `src/components/AgentSystems.astro` lists every non-draft article from the
  `articles` collection (hub first by `order`), mounted on `src/pages/index.astro` + the "Agents"
  nav entry.
- Each article renders at `/notes/<slug>` via the dynamic route `src/pages/notes/[...slug].astro`,
  using the design system (`.shell` gutter, `.reveal` scroll behavior, the `keyTakes` block).

So your ONLY wiring job is to drop a correct `src/content/articles/<slug>.md` (Step 2). Then:
```bash
cd /home/codex/Projects/portfolio && npm run build   # must exit 0
```
Fix or revert until green — never hand back a red tree. (If you DO need a new section/route — e.g.
a `team` page shape — follow SCHEMA.md and mirror the existing components.)

---

## Step 6 — UPDATE THE LEDGER + report (do NOT deploy)

Update all three layers of your memory so the next run never re-derives this:
1. **`article-queue.md`** — move the article's row to **Done** with its `/notes/<slug>` path.
2. **`coverage.md`** — flip the aspect you just covered from **Open → Covered**, tagging it
   `(article: <slug>)`. (If you also opened up a new candidate aspect, note it under Open.)
3. **`state/log.md`** — append ONE dated, grep-parseable entry (newest at the bottom):
   `## YYYY-MM-DD loop-run | wrote <slug>: <project>/<aspect> covered` followed by 1-3 bullets
   (the source you grounded it in, the key takes, build PASS/FAIL). This is the DETAILED action log.

Then report — concise and honest:
- **article**: title + the site path you created/updated; new vs refresh.
- **source + aspect**: the real repos/docs you grounded it in, and which `coverage.md` aspect it closed.
- **key takes**: paste them (so the lead can hand them to the x-agent).
- **honesty gate**: the written-out PASS/FAIL for each item above (INCLUDING the no-em-dash / no-AI-tells style check).
- **build**: PASS / FAIL.
- **ledger**: confirm you updated queue + coverage + log.
- **self_check**: did you follow this ref? Anything ambiguous/missing/worked-around — name it for the ratchet.

## References
| Path | Use |
|---|---|
| `/home/codex/Projects/portfolio/.claude/AGENTS.md` | Lead runbook + the Gates |
| `/home/codex/Projects/portfolio/src/content/SCHEMA.md` | **The KB conventions + the `articles` frontmatter schema + the rendering features (Mermaid/callouts/code) + the writer-memory model — read before writing** |
| `/home/codex/Projects/portfolio/.claude/state/sources.md` | **Source catalog + the HARD confidentiality/PII gates — READ FIRST (Step 0)** |
| `/home/codex/Projects/portfolio/.claude/state/coverage.md` | **Aspect-level coverage index — READ FIRST; pick an OPEN aspect; flip it Covered after (Step 0/6)** |
| `/home/codex/Projects/portfolio/.claude/state/log.md` | The append-only DETAILED action log — append your run entry after (Step 6) |
| `/home/codex/Projects/x-agent/.claude/skills/x-twitter-growth/references/voice.md` | The de-AI voice gate this article style mirrors (no em-dashes, no AI tells) |
| `/home/codex/Projects/portfolio/src/content/articles/` | The KB — where you write the new `<slug>.md` (and where the migrated seeds + hub already live) |
| `/home/codex/Projects/portfolio/.claude/state/article-queue.md` | The backlog — pick the next item, move it to Done |
| `/home/codex/Projects/portfolio/src/content/articles/` | 00/01/02 seed drafts — already migrated into the KB; read for tone/precedent |
| `/home/codex/Projects/{x-agent,life-wiki,feature-team,jobright-agent}` | Real agent-system source to ground articles in |
| `/home/codex/Projects/portfolio/src/components/AgentSystems.astro` · `src/pages/notes/[...slug].astro` | The renderer (collection-driven — no manual wiring) |
| `/home/codex/Projects/x-agent` | The downstream consumer of `keyTakes` (post seeds) |
