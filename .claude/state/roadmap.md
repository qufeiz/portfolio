# Capability roadmap — planned agents (NOT built yet)

Capabilities are **project-level subagents**: each is a `.claude/agents/<name>.md` definition (the
worker's persona + the pointer to its `.claude/refs/<name>.md` how-to) that the lead discovers and
spawns by name with a high-level goal. Adding a capability is the **capability ratchet** — the
system grows by gaining agents, and the weekly loop picks up a new one automatically because it
iterates over "whatever `.claude/agents/*.md` exist" (see `AGENTS.md` › the loop + "How to add a
capability"). No loop edit is required to add any of the below — write the ref + the agent def, the
loop picks it up.

These are the capabilities the structure is designed to support but that we are **deliberately NOT
building in v1**. Each is a future agent that will slot in exactly like `portfolio-refresh` /
`portfolio-writer`.

| Planned agent | What it will do | Tool / note |
|---|---|---|
| `generate-figures` (`.claude/agents/generate-figures.md` + `.claude/refs/generate-figures.md`) | Produce beautiful **mermaid diagrams + figures** for blogs, case studies, and project descriptions | Future — write the ref + agent def, the loop picks it up. |
| `enhance-screenshots` (`.claude/agents/enhance-screenshots.md` + `.claude/refs/enhance-screenshots.md`) | Produce nicer / cleaner product screenshots (crop, frame, de-noise, consistent chrome) | Future — write the ref + agent def, the loop picks it up. Respect TreAxe's own official shots where they exist. |
| `embed-demos` (`.claude/agents/embed-demos.md` + `.claude/refs/embed-demos.md`) | Add live / interactive demos into the project pages | Future — write the ref + agent def, the loop picks it up. |

## Built (was planned, now shipped)

| Agent | What it does | Built |
|---|---|---|
| `make-video` (`.claude/agents/make-video.md` + `.claude/refs/make-video.md`) | Render a **screenshot-walkthrough / demo MP4** for a project page or article from a data-driven spec, using the **official Hyperframes skill** (HeyGen's HTML/CSS/JS→MP4 renderer); embed it base-aware; OFFLINE-only (the MP4 is a committed static asset, never a build step). Fulfilled via the request→fulfill handoff (a worker requests in `state/video-queue.md`; the lead spawns `make-video`). | 2026-06-15. Proof: `public/treaxe/walkthrough.mp4` (6 real TreAxe screens), embedded on `work/treaxe`. Reusable template in `.claude/make-video/`. (This was the roadmap's `make-demo-video`.) |

When one of the remaining planned agents is built: write its `.claude/refs/<name>.md` how-to + its
`.claude/agents/<name>.md` definition, append a `ref-add` entry to `log.md`, and move its row into
the "Built" table above. The loop needs no change to start delegating to it.
