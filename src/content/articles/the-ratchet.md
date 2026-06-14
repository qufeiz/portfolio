---
title: "The ratchet"
deck: "Systems that raise their own quality floor, one rung at a time."
order: 3
kind: concept
category: agent-systems
tags: ["ratchet", "self-improving", "quality", "ci", "process"]
keyTakes:
  - "Fix the program, not the output: patching the bug restores the floor; changing the spec that let it through raises the floor."
  - "The floor only goes up, and a specific miss happens at most once — that single invariant is the whole design."
  - "Enforcement is a ladder: CI/test > self-check > prose. Prose is the floor because prose is hope — climb as high as the rule allows."
  - "META-MISS: a green check that coexisted with a real bug has a blind spot; strengthen the check, not just the symptom."
  - "A \"self-improving system\" isn't one that retrains itself — it's one that converts every failure into a permanent, mechanical constraint."
  - "Seals decay: an old \"it's fixed\" is a hypothesis, not a guarantee. Re-confirm before you trust it, because a wrong \"fixed\" doc is worse than none."
---

A miss that ships shouldn't just get fixed — it should make the system permanently stronger. How I turn every failure into a rung that the floor can't fall back below.

Most quality processes are flat. You find a bug, you fix the bug, and the next bug of the same shape arrives on schedule, because nothing about the *system* changed. The build team is built the other way around: a miss that gets through is treated as a defect in the **program**, not the output. The rule is one sentence — **the floor only goes up** — and a specific miss is allowed to happen at most once.

## Fixing the output vs. fixing the program

This is the whole distinction. When a feature ships wrong, there are two repairs available. You can fix the **output**: patch the bad code, ship it, move on. Or you can fix the **program**: change the skill, spec, or check so that this *class* of mistake can't recur. Fixing the output restores the floor to where it was. Fixing the program raises it.

The build team's own skills are written as living proof of this. The feature-design skill says it plainly: "**This skill is a ratchet, not a fixed spec.** It exists because apps keep shipping things that look done but aren't — and nearly every rule below was added the first time one slipped through." The document grew because each real failure left a permanent rung behind. The screenshot self-check, the user-guide section skeleton, the content-fidelity gate — each is a scar from a specific miss, encoded so the miss can't repeat.

## The loop

When a miss gets through, the ratchet runs three steps in order.

**1. Seal the gotcha.** Write up the *why*, lead with the lesson, and mark it `SEALED` **only when the fix is tested *and* user-confirmed** — naming who confirmed it and which regression test guards it. If you can't seal it, you write it as *not sealed* and say what's verified vs. open. The reasoning is sharp: "a wrong 'it's fixed' doc is worse than none" — the next agent trusts it.

**2. Add the strongest enforcement that fits.** This is the heart of the ratchet, and it's an explicit ladder:

> **CI lint / test  >  forcing self-check  >  prose.**

CI and tests are mechanical and un-skippable; they catch the predicted miss on every push. A forcing self-check is the middle rung — a checklist item a human or agent must actively answer, for judgment a lint can't make ("is this the *golden* screenshot, or just *a* screenshot?"). Prose is the floor, and the framing is unsentimental: "**prose is the floor because prose is hope** — it states the rule and trusts everyone to remember." You reach for prose only when the miss genuinely can't be mechanized, and you climb as high as the rule allows. A rule that stays prose decays.

**3. Link the gotcha and the rule both ways.** The gotcha names where it's now enforced; the check points back to the *why*. A gotcha with no enforcement link is a flag — it means a lesson is only being *remembered*, not enforced. The two must never drift apart.

## The META-MISS rule

The highest-value signal in the whole system is this: **if a check or test was green while a real miss slipped through, the fix isn't only the miss — it's to strengthen *that check*.** A green gate that let a bug past has a blind spot, and patching only the bug leaves the blind spot open for the next one.

The kit's own example: the journey suite was green while a documentation screenshot was thin — a toy/empty-state shot. The miss wasn't just the bad screenshot. The *suite had a blind spot*. So the fix strengthened the check: a docs self-check was added, and a ledger lint was added to make "documented as gated" mechanical. You don't just clean up the symptom; you go fix the thing that was supposed to catch it and didn't.

## The anti-padding rule

A ratchet that only adds is easy to corrupt — you start manufacturing rules to look thorough, and the floor goes *sideways* (more words, same height) instead of up. So there's a guardrail: a new rule "earns its place **only when a *real* miss demands it.**" No fifth way to say something already enforced, no self-check nobody's failure motivated. "Thoroughness here is *the existing rules being enforced*, not *more rules*." It's a striking inversion — the discipline is as much about *not* adding rules as adding them.

## Seals decay, so re-confirm them

Even a sealed fix isn't true forever. A `SEALED` gotcha "certifies correctness **at write time, not forever**" — you treat an old seal as a *hypothesis*. If it names a file or flag, confirm that still exists before relying on it; if the bug recurs, you flip the status back and re-open it. A ratchet without this would slowly fill with stale certainties. The same instinct shows up in how I let systems edit themselves: the life-wiki self-improves its own schema but "**PROPOSES, never silently mutates**" — the program changes deliberately, under review, never behind your back.

## Why this is what "self-improving" actually means

"Self-improving system" usually gets used for something that retrains on its own outputs. I mean something more boring and more durable: a system where every failure is mechanically converted into a permanent constraint, climbing as far up the CI > self-check > prose ladder as it can, so the same mistake is structurally prevented from recurring. The intelligence isn't in any single run getting smarter. It's in the **floor under every future run** rising one rung at a time, and never falling back. Leave it running long enough and the cheap, repeatable failures are simply gone — not because anyone remembered, but because the program won't let them happen.
