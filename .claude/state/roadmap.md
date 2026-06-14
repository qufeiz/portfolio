# Capability roadmap — planned ref files (NOT built yet)

Capabilities are **ref files**: each is a self-contained `.claude/refs/<name>.md` how-to that the
lead discovers and points a generic throwaway subagent at. Adding a capability is the **capability
ratchet** — the system grows by gaining refs, and the weekly loop picks up a new one automatically
because it iterates over "whatever refs exist" (see `AGENTS.md` › the loop + "How to add a
capability"). No loop edit is required to add any of the below — write the ref, the loop picks it up.

These are the capabilities the structure is designed to support but that we are **deliberately NOT
building in v1**. Each is a future ref file that will slot in exactly like `refs/refresh-portfolio.md`
/ `refs/write-article.md`.

| Planned ref | What it will do | Tool / note |
|---|---|---|
| `refs/make-demo-video.md` | Generate HTML / animated demo videos for project pages and articles | tool: **hyperframe**. Future — write the ref, the loop picks it up. |
| `refs/generate-figures.md` | Produce beautiful **mermaid diagrams + figures** for blogs, case studies, and project descriptions | Future — write the ref, the loop picks it up. |
| `refs/enhance-screenshots.md` | Produce nicer / cleaner product screenshots (crop, frame, de-noise, consistent chrome) | Future — write the ref, the loop picks it up. Respect TreAxe's own official shots where they exist. |
| `refs/embed-demos.md` | Add live / interactive demos into the project pages | Future — write the ref, the loop picks it up. |

When one of these is built: write its `.claude/refs/<name>.md` how-to, append a `ref-add` entry to
`log.md`, and move its row out of this table. The loop needs no change to start delegating to it.
