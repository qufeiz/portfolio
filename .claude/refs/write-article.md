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
Step 0 — Load gates (AGENTS.md › Gates) + SCHEMA.md + read state/article-queue.md, pick the NEXT item
Step 1 — Gather REAL source: the project work + the agent docs the piece is about
Step 2 — Draft (or refresh) ONE article as src/content/articles/<slug>.md per SCHEMA.md
Step 3 — Fill `keyTakes` frontmatter (3-6 standalone one-liners = x-agent post seeds)
Step 4 — HONESTY GATE: no invented metrics; collaborations credited; confidentiality held
Step 5 — `npm run build` must pass (the site renders the collection automatically)
Step 6 — Update article-queue.md (move the row to Done); report (do NOT deploy)
```

---

## Step 0 — Gates + pick the next article

Read `/home/codex/Projects/portfolio/.claude/AGENTS.md` › **Gates** and
`/home/codex/Projects/portfolio/src/content/SCHEMA.md` (the KB conventions + the `articles`
frontmatter). Then read `/home/codex/Projects/portfolio/.claude/state/article-queue.md` and take
the **top unchecked item**.

**Seed content (already migrated — done, do NOT redo):** the three seed notes (00 orchestrate /
01 independent-verification / 02 the-ratchet) and the **hub** (`my-agent-teams`) already live in
the KB at `src/content/articles/`. Their queue rows are in **Done**. New work is the next unchecked
**Queue** item — write it as a fresh `src/content/articles/<slug>.md`.

---

## Step 1 — Gather REAL source (ground the piece)

An article is about how the owner's agent systems actually work. Pull from what exists:
- the **agent docs** — `AGENTS.md` / `CLAUDE.md` / ref docs / `loop-prompt.md` across
  `/home/codex/Projects/{x-agent,life-wiki,feature-team,jobright-agent,portfolio}` and the
  feature-build team refs under `~/.claude/agents/`.
- the **real project work** — the same repos' code/state (e.g. `posted.jsonl`, the loop prompts,
  the PM/engineer/verifier split). Read enough to be concrete; don't dump whole files.
- the **drafted notes** at `/home/codex/Projects/_portfolio-build/notes/` for the seed pieces.

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
- **Collaborations credited** — TreAxe co-built with Barrat Mohammad; FredGPT a CMU team practicum
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

## Step 6 — Update the queue + report (do NOT deploy)

Move the article's row in `article-queue.md` to the **Done** section with its site path/anchor.
Then report — concise and honest:
- **article**: title + the site path you created/updated; new vs refresh.
- **source**: the real repos/docs you grounded it in.
- **key takes**: paste them (so the lead can hand them to the x-agent).
- **honesty gate**: the written-out PASS/FAIL for each item above.
- **build**: PASS / FAIL.
- **self_check**: did you follow this ref? Anything ambiguous/missing/worked-around — name it for the ratchet.

## References
| Path | Use |
|---|---|
| `/home/codex/Projects/portfolio/.claude/AGENTS.md` | Lead runbook + the Gates |
| `/home/codex/Projects/portfolio/src/content/SCHEMA.md` | **The KB conventions + the `articles` frontmatter schema — read before writing** |
| `/home/codex/Projects/portfolio/src/content/articles/` | The KB — where you write the new `<slug>.md` (and where the migrated seeds + hub already live) |
| `/home/codex/Projects/portfolio/.claude/state/article-queue.md` | The backlog — pick the next item, move it to Done |
| `/home/codex/Projects/_portfolio-build/notes/` | 00/01/02 — original seed drafts (already migrated into the KB) |
| `/home/codex/Projects/{x-agent,life-wiki,feature-team,jobright-agent}` | Real agent-system source to ground articles in |
| `/home/codex/Projects/portfolio/src/components/AgentSystems.astro` · `src/pages/notes/[...slug].astro` | The renderer (collection-driven — no manual wiring) |
| `/home/codex/Projects/x-agent` | The downstream consumer of `keyTakes` (post seeds) |
