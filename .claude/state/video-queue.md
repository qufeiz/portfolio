# Video queue — requested walkthrough / demo videos (the request→fulfill handoff)

A worker subagent (writer or scanner) **cannot spawn another subagent** ("Agent is not available
inside subagents"). So a worker that wants a video does NOT render it — it **requests** one by
appending a row here (a small video-spec). The **LEAD**, after the worker reports a video request,
spawns the `make-video` subagent (`subagent_type: make-video`) to fulfill it: render OFFLINE,
deliver the MP4 + poster, embed it base-aware, build-verify. (A writer can alternatively put a
`video:` block in an article's frontmatter — see `src/content/SCHEMA.md` and the writer ref — and
flag it in its report; same lead-fulfills handoff.) See `AGENTS.md` › "Fulfilling a video request".

## How to request (worker → this file)
Append an **Open** row with enough for `make-video` to build a spec without re-deriving it:
- **slug** — short id for the request (e.g. `treaxe-walkthrough`).
- **target page** — the Astro page to embed on (e.g. `src/pages/work/treaxe.astro`), or the article slug.
- **title / subtitle / outro** — the title-card + outro text (true to the product; no em-dashes).
- **shots** — ordered `image (relative to public/) | fit (cover|contain) | caption`. Captions TRUE
  to the product; pull from the real source (e.g. `src/data/treaxeShots.ts`), trimmed for legibility.
- **output** — `public/<dir>/<name>.mp4`.
- **note** — why (what gap the video fills).

The lead hands the row to `make-video`, which writes the actual `<name>.spec.json` from it, renders,
embeds, and (when done) moves the row to **Done** with the delivered path + size + duration.

---

## Open
_(none — the TreAxe walkthrough below was the v1 proof and is already fulfilled.)_

## Done
| slug | target page | output | result |
|---|---|---|---|
| `treaxe-walkthrough` | `src/pages/work/treaxe.astro` | `public/treaxe/walkthrough.mp4` | 1920x1080 H.264/yuv420p, 26.0s, 9.6MB, poster `public/treaxe/walkthrough.poster.jpg`. 6 shots (dashboard, leads/CRM, estimates, invoices, project-overview, proposal-PDF) from `public/treaxe/*.png`, captions from `src/data/treaxeShots.ts`. Rendered offline via Hyperframes. Embedded in the "Walkthrough" section. |
