---
title: "Orchestrate → Gate → Ratchet"
deck: "The three moves behind every agent system I build."
order: 1
kind: concept
category: agent-systems
tags: ["architecture", "multi-agent", "orchestration", "gates", "ratchet"]
keyTakes:
  - "A long-lived orchestrator should hold the plan and do none of the work — disposable subagents keep context lean so quality doesn't decay mid-job."
  - "Don't trust an LLM step; gate it. Wrap every stochastic move in a deterministic, fail-closed check — and a gate that passes when it can't tell is worse than no gate."
  - "When something slips through, fix the program, not the output. Patch one bad result and you've fixed one; patch the spec and you've fixed every future run."
  - "META-MISS: if a check was green while a real bug shipped, the bug isn't the only thing to fix — the check has a blind spot, so strengthen the check."
  - "Orchestrate → Gate → Ratchet, in that order: focused attention, made trustworthy, that compounds."
---

The three moves behind every agent system I build: a long-lived orchestrator delegates throwaway work, every stochastic step is wrapped in a deterministic gate, and a miss edits the program — not the output.

I keep building multi-agent systems that do real, unsupervised work — a PM/engineer/verifier team that ships software, an account that posts to X on its own, a wiki that compiles a person's life from years of chat logs. They look unrelated. Under the hood they are the same three moves, in the same order. I've started treating that order as the architecture, not an accident.

## Move 1 — Orchestrate: bounded context, unbounded work

The first problem with an LLM doing a long job is the context window. A single agent that builds a feature, posts a tweet, or ingests a thousand conversations fills its context, starts skimming, and quietly gets worse. My answer is always a split: a **long-lived orchestrator that holds the plan but does none of the work**, and **fresh subagents that do one discrete thing and are thrown away**.

In the build team, the lead conducts pm → engineer → verifier but writes no code; the engineer fans its full-app button audit out to parallel subagents (groups of five to eight files each) precisely because "a single agent fed 100+ button handlers will miss things — context fills up and it starts skimming." In x-agent the loop is explicit: the lead "decides *timing only* … then **delegates each post/reply to a fresh subagent**, reads its short report" — "the lead never does the posting work itself (that would bloat its context)." In life-wiki the orchestrator triages conversation by conversation against a resumable `_cursor`, extracting only "the meaningful layer" and discarding task mechanics.

The shape is identical: the orchestrator's context stays small and strategic; the work happens in disposable contexts that don't accumulate. Bounded context, unbounded work.

## Move 2 — Gate: wrap every stochastic step in something deterministic

A model's output is a probability distribution. You cannot trust it on any single run, so you don't *trust* it — you **gate** it. Every place a stochastic step could produce something plausible-but-wrong, I put a deterministic, fail-closed check between it and the world.

The build team is almost entirely gates. There's a **human design-approval gate** that blocks all code until a written design is approved ("the most expensive failures are the ones where you built the wrong thing *well*"). There's the **content-fidelity gate** — a pure `validateX()` function that encodes the golden bar and is pinned by a unit test that "passes every golden example and fails every toy example," turning "real, not toy" from a vibe into a red test. There's the **removable-handler proof**: a journey test is only valid if breaking the handler turns it red.

The fleet runs the same play. x-agent puts two scripts in front of every post — a **voice gate** (`tweet_composer.py --check`, exit 1 on an AI shape-tell) and a fail-closed **privacy gate** (`privacy_scan.py`, which blocks names, dollar amounts, and dates, and refuses a draft whose source page is private). life-wiki's "**never fabricate**" is a gate too: every claim must cite a conversation anchor, an uncited keeper is a lint failure, and orphans fail the lint. The deterministic check is the load-bearing part; the model just proposes.

The key property is **fail-closed**. A gate that passes when it can't tell is worse than no gate, because it manufactures confidence. The verifier's rule is explicit: if a tool needed to confirm a real effect is missing, "FLAG 'couldn't verify X' — never fake a pass."

## Move 3 — Ratchet: fix the program, not the output

The third move is what makes the systems get better instead of merely not-worse. When something slips through, I don't just fix the bad output — I **edit the skill or spec so that class of miss can't recur**. The quality floor only goes up.

The build team's loop is precise: write a sealed gotcha (the *why*, marked solved only when tested **and** user-confirmed), then add the **strongest enforcement that fits — CI/test > self-check > prose** ("prose is the floor because prose is hope"), then link the gotcha and the rule both ways. The highest-value version is the **META-MISS rule**: if a check was green while a real miss slipped through, you strengthen *that check*, because a green gate with a blind spot will let the next one through too. There's even an anti-padding rule — a new rule "earns its place only when a *real* miss demands it" — so the floor goes up, not sideways.

x-agent encodes the same loop in plain English: the lead "**improves the skills when the subagent falls short** (the ratchet)." life-wiki self-improves but "**PROPOSES, never silently mutates**" its own schema — the program changes deliberately, under review. In every case the artifact being edited is the *spec*, not the *instance*. Fix one tweet and you've fixed one tweet; fix the voice gate and you've fixed every future tweet.

## Why the order matters

Orchestrate without gates and you get a tidy pipeline that confidently ships garbage. Gate without a ratchet and you catch today's bugs but re-learn them forever. Ratchet without orchestration and you have great rules drowning in a context window too full to follow them. The three compose: orchestration buys you clean, focused attention; gates convert that attention into trustworthy output; the ratchet turns every failure into a permanent rung. It's the closest thing I have to a recipe for an agent you can leave running.
