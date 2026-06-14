---
title: "Independent verification"
deck: "Killing \"looks-done-but-isn't\" — why the checker is never the author."
order: 2
kind: concept
category: agent-systems
tags: ["verification", "testing", "journey-tests", "quality", "multi-agent", "treaxe"]
keyTakes:
  - "The most dangerous state for software isn't broken — it's looks done: every signal says success and the feature does nothing."
  - "A green test suite proves the assertions you chose currently pass — not that the feature works. Those are different claims."
  - "Send-Invoice: a one-line onClick={() => setStatus(\"sent\")} shipped to production for months; the test checked the status pill, which was wired straight to the field it flipped. No email was ever sent."
  - "The litmus for a real test: if deleting the feature's logic would still let it pass, it's not a test — it's theater."
  - "The author is the worst grader of their own work because they test the code path they wrote, not the outcome the user needs. Make the checker someone who never wrote the code."
---

Why I split the builder from the checker, the four gates the checker runs, and the bug that taught me a green test suite can certify a feature that does nothing.

The most dangerous state for software isn't broken — it's *looks done*. A button that fires, a toast that appears, a status pill that flips to "sent," a test suite that's all green. Every signal says success, and the feature does nothing. My build team is organized around one structural defense against this: the agent that **checks** the work is never the agent that **wrote** it.

## Author ≠ checker

The team is three roles. The **PM** owns the golden bar — the real, non-toy reference a build is measured against. The **engineer** builds to it and writes the tests. The **verifier** independently grades it and is **read-only on source — it never authored the code it checks**. That independence is the whole point. The engineer hands off to the verifier when a build is ready ("that's a handoff, not self-grading; you may never BE the verifier or override its verdict"), and the verifier's `pass` boolean alone decides ship vs. bounce-back.

This matters because the author is the worst possible grader of their own work. They know what the code is *supposed* to do, so they test the code path they wrote — not the outcome the user needs. An independent checker doesn't share that mental model. It starts from "what does the user see?" and works backward, which is exactly where the author's blind spot lives.

## The four gates

The verifier doesn't eyeball a diff. It runs four specific gates, each designed to catch a different flavor of looks-done-but-isn't.

**Gate 1 — Behavioral (removable-handler-proof).** The journey test must assert the real visible outcome, and it must be *removable-handler-proof*: break the handler, and the test must go red. The litmus is blunt — "if removing the core logic of the feature … would still let the test pass, the test is wrong." This is the gate that kills tests asserting that a modal closed or a URL changed.

**Gate 2 — Visual (real render vs. golden).** Capture the *actual* rendered output — the frontend, the generated PDF, the sent email — using the golden data, and compare it to the PM's golden reference, re-capturing until it matches. It must show real work, not an empty form, a toy, or a "no results" answer. An empty-state screenshot reads as "the product has nothing."

**Gate 3 — Content-fidelity (`validateX()`).** Removable-handler proves the handler *does something*; it can't tell real content from a plausible toy — "a saved RFI whose question is 'please clarify', a sent email whose body is a placeholder" passes it. So a separate pure `validateX()` function encodes the golden bar (cites a real reference, required fields specific not generic, non-generic phrasing via a stop-list) and is pinned by a unit test that passes every golden example and fails every toy. "Real, not toy" becomes a red test instead of a judgment call.

**Gate 4 — Docs-match-code.** Docs describe what actually shipped — no stale prose, the human guide matches its skeleton, the public site matches the fidelity bar, the API reference matches the contract. Documentation that lies is its own looks-done failure.

For APIs there's a fifth surface: one gate row per endpoint — contract-conformance, **tenant-isolation (never skipped)**, validation-rejects, auth-required, backward-compat, rate-limit, no-unbounded-dump, idempotency — each with a removable check.

## Why a green suite hides a broken feature

Here is the thing that took me a real production incident to internalize: **a fully green test suite is not evidence the feature works.** It's evidence the assertions the author chose to write currently pass. If those assertions check the wrong layer, green means nothing.

## The Send-Invoice catastrophe

This is the worked example, and I make every agent read it before writing a single test. A construction app had a "Send to Client" button on an invoice. The entire onClick handler was:

```tsx
onClick={() => setStatus("sent")}
```

One line. No email address looked up. No sending mechanism called. No external system touched. The database field flipped from `"draft"` to `"sent"`, a status pill rendered "sent," and the client received nothing — ever.

The journey test for it:

```typescript
await sendBtn.click();
const sentPill = page.locator("span").filter({ hasText: /^sent$/i }).first();
await expect(sentPill).toBeVisible({ timeout: 10000 });
```

It checked that the status pill said "sent." The pill was wired directly to the field `setStatus("sent")` had just changed. The test verified that the one-line handler ran — and nothing else. As the autopsy puts it, the test "could not have been more precisely designed to miss the bug if the author had been deliberately trying to hide it." It was green for **months**. Production state. The contractor thought invoices were going out; the client never got one.

This is a category error: the test confused *recording that something happened* with *making it happen*. "A status field is a note in a notebook. It is not an email." The developer's code path (click → status → pill → pass) and the user's goal (client receives the invoice → can pay) "have nothing in common."

And the lesson generalizes past the one bug. Even after a `SendInvoiceModal` was bolted on, the feature stayed broken six ways: the app doesn't know the contractor's own from-address, no email account is OAuth-connected, the client-email lookup usually returns nothing, `setStatus("sent")` fires *before* any byte leaves the machine, `mailto:` fails silently with no default mail client, and there's no delivery confirmation. A test asserting "the modal opened" or "the pill says sent" passes through all of it.

The fix isn't a cleverer assertion — it's the discipline. Assert what the user sees: a populated To: field with a real address, a subject with the invoice number, a body with the total, and a status that changes *only after* the send is confirmed. Better still, an independent grader who never wrote `setStatus("sent")` and has no reason to believe the pill.
