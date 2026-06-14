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
| `make-demo-video` (`.claude/agents/make-demo-video.md` + `.claude/refs/make-demo-video.md`) | Generate HTML / animated demo videos for project pages and articles | tool: **hyperframe**. Future — write the ref + agent def, the loop picks it up. |
| `generate-figures` (`.claude/agents/generate-figures.md` + `.claude/refs/generate-figures.md`) | Produce beautiful **mermaid diagrams + figures** for blogs, case studies, and project descriptions | Future — write the ref + agent def, the loop picks it up. |
| `enhance-screenshots` (`.claude/agents/enhance-screenshots.md` + `.claude/refs/enhance-screenshots.md`) | Produce nicer / cleaner product screenshots (crop, frame, de-noise, consistent chrome) | Future — write the ref + agent def, the loop picks it up. Respect TreAxe's own official shots where they exist. |
| `embed-demos` (`.claude/agents/embed-demos.md` + `.claude/refs/embed-demos.md`) | Add live / interactive demos into the project pages | Future — write the ref + agent def, the loop picks it up. |

When one of these is built: write its `.claude/refs/<name>.md` how-to + its `.claude/agents/<name>.md`
definition, append a `ref-add` entry to `log.md`, and move its row out of this table. The loop needs
no change to start delegating to it.
