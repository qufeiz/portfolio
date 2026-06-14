# Skill roadmap — planned capabilities (NOT built yet)

The architecture is a **pluggable skill registry**: each capability is a self-contained
`skills/<name>/SKILL.md` that the lead discovers and delegates to. Adding a skill is the
**capability ratchet** — the system grows by gaining skills, and the weekly loop picks up a new
skill automatically because it iterates over "whatever skills exist" (see `AGENTS.md` › the loop +
"How to add a new skill"). No loop edit is required to add any of the below.

These are the skills the structure is designed to support but that we are **deliberately NOT
building in v1**. Each will slot into the registry exactly like `portfolio-refresh` /
`portfolio-write`.

| Planned skill | What it will do | Tool / note |
|---|---|---|
| `make-demo-video` | Generate HTML / animated demo videos for project pages and articles | tool: **hyperframe**. Future — slots into the skill registry; lead orchestrates it on the loop. |
| `generate-figures` | Produce beautiful **mermaid diagrams + figures** for blogs, case studies, and project descriptions | Future — slots into the skill registry; lead orchestrates it on the loop. |
| `enhance-screenshots` | Produce nicer / cleaner product screenshots (crop, frame, de-noise, consistent chrome) | Future — slots into the skill registry; lead orchestrates it on the loop. Respect TreAxe's own official shots where they exist. |
| `embed-demos` | Add live / interactive demos into the project pages | Future — slots into the skill registry; lead orchestrates it on the loop. |

When one of these is built: drop its `SKILL.md` into `skills/<name>/`, append a `skill-add` entry to
`log.md`, and move its row out of this table. The loop needs no change to start delegating to it.
