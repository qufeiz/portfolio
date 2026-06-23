---
title: "What people actually want from a smartwatch (and a smart dumbbell)"
deck: "A CMU course project on smart fitness equipment: ten field interviews about sitting all day, then a built dumbbell-shaped prototype I put in front of eight people to see if it could read their exercises without a single button press."
date: 2026-06-23
order: 11
kind: concept
category: projects
tags: ["user-research", "ux", "usability-testing", "interviews", "hardware", "prototype", "cmu", "side-projects"]
keyTakes:
  - "Ten spontaneous field interviews, all strangers, all in person. The repeated finding: people sit 6 to 10 hours a day, know it is bad, and push through anyway because the deadline wins. Awareness almost never turned into a workplace change."
  - "Older interviewees had already changed their habits and felt the cost in their backs and hips. Younger ones knew the risk and did not feel any urgency yet. Same facts, completely different behavior, split by age."
  - "The thing nobody asked for was a tracker. Almost every fix people described was movement built into the day (walks, sit-stand desks, walking meetings), not another number on a wrist. That reframed the design question away from measurement and toward nudging."
  - "For the build, I tested a smart dumbbell instead of the smartwatch on purpose: your hands are full of weight, so buttons are not an option and the device has to detect and classify the exercise on its own. The hard case is the honest case."
  - "Eight think-aloud sessions. The headline result held: people followed the audio and LED feedback and never reached for a button, which was the design goal. The failure was classification: similar lifts like bicep and hammer curls got confused, and fast or sloppy reps got dropped."
  - "The most useful finding was behavioral, not technical. People silently slowed down and cleaned up their form to make the device read them correctly. A detector that is wrong in a legible way quietly trains the user, for better and for worse."
---

This was a course project at CMU on designing smart fitness equipment. It ran in two halves that taught me different things. The first half was discovery: figure out what problem a wearable should even solve, by reading the research and then going out and talking to real people about how much they sit. The second half was a build: take a microcontroller, turn it into a smart dumbbell, and put it in front of strangers and friends to see whether the interaction actually worked. I am writing it up as a research artifact, honestly, including the parts that did not work.

A note on names: the people I interviewed and tested were strangers, friends, and classmates who agreed to a short, informal session. I am keeping them anonymous here and describing them by role and age band only. None of the numbers below are invented. Where the source notes say "most of the time" or "occasionally," I have kept it qualitative instead of inventing a percentage, because the test was direct observation, not instrumented measurement.

## Half one: the problem is sitting, not steps

Before talking to anyone I did background reading to make sure the problem was real and not just a hunch. The shape of it: roughly 1 in 4 US adults sit more than 8 hours a day, office workers spend something like two-thirds to three-quarters of the workday seated, and even offices that hand out sit-stand desks see people still sitting most of the time. The health literature ties prolonged sitting to metabolic, cardiovascular, and mental-health outcomes, and the part that stuck with me is that meeting your exercise targets does not cancel it out. Long uninterrupted sitting carries its own risk. So the interesting design space was not "track more exercise," it was "interrupt the sitting."

:::note
I used a research assistant tool to help surface the studies, then read and summarized the sources myself rather than trusting a generated summary. The interview protocol and every field note below are first-hand.
:::

Then I went and did ten interviews. Every one was a cold, in-person approach: someone sitting alone at a coworking space, a guy on the next machine at my gym, people on a break in an office-park lobby. No scheduling, no screener survey, no email thread. I introduced myself as a CMU student doing a school project and asked four or five short questions about their job, how much they sit, whether they think about it, and what (if anything) they do about it.

The interviewees were a real cross-section of knowledge work: software engineers, a couple of data scientists, an engineering manager, a product manager, a couple of startup founders, an information-systems specialist, across age bands from 25 to 64. A few patterns came out clearly enough that I would bet on them.

**People sit a lot, and they know it.** Estimates clustered at 6 to 10 hours a day. The jobs were the cause: meetings, coding, analysis, dashboards. Even the people who worked out six days a week still sat through most of the workday.

**Awareness rarely turned into action.** Several people told me, in different words, that they know sitting is bad but "push through" because of deadlines and delivery pressure. One founder said outright he was aware of the heart-disease link but was too busy working to do much about it. The fixes that did exist were individual (a walk, the gym) rather than anything built into the workplace.

**Age split the behavior.** This was the sharpest divide. The older interviewees (the 45-plus group) had already felt the cost (neck and shoulder tightness, low-back stiffness, hip arthritis) and had changed habits: two short walks a day on a doctor's advice, capping any single sitting stretch at 45 minutes, walking instead of sitting on breaks. The younger group knew the risks intellectually and felt no urgency about them yet.

**Almost nobody wanted a tracker.** When I asked what they do or would want, the answers were about movement, not measurement: walks, a sit-stand desk, working standing during long calls, wishing the office had "active" furniture like leaning stools. One engineer said his best ideas come on short walks and that he tries to design his own environment to make himself move. The implied product was a nudge toward movement, not another number on a wrist.

That last point is the one that reframed the project for me. The brief was "smart fitness equipment," and the obvious move was a wrist tracker that counts things. The interviews pointed somewhere else: the people I talked to were not short on data about themselves, they were short on movement during the day, and they did not connect to the gadget as the fix.

## Half two: build the hard version on purpose

The second half was the build. I had a Circuit Playground Express (a small sensor board with an accelerometer, LEDs, and a speaker) and the task of turning it into a piece of smart fitness equipment. The two obvious form factors were a wrist-worn smartwatch and a smart dumbbell. I chose the dumbbell, and the choice was deliberate.

:::tip{title="Why the dumbbell, not the watch"}
On a smartwatch you can fall back on buttons and a screen. On a dumbbell your hand is wrapped around a weight, so buttons are basically off the table and the device has to detect and classify the exercise automatically, then give feedback you can read without looking. That is the harder interaction problem, which is exactly why it is worth testing.
:::

The sensor placement mattered. I mounted the board near the middle of the handle (the most stable, symmetric part of the object, so the motion it reads is closest to the real movement), kept it inside its plastic case, and secured the battery so nothing dangled mid-rep. For the actual prototype I simulated the dumbbell with a water bottle and attached the sensor near the gripping area the same way. The big difference from the smartwatch version: the sensor now follows the object instead of the wrist, so its orientation changes and the pitch and roll readings the detection relies on change with it. That is the engineering reason the watch and the dumbbell are not the same product wearing different cases.

I was honest in the design write-up that a real version of this has problems a class prototype gets to ignore: dumbbells get dropped, hit, and covered in sweat, so the electronics would need a rugged sealed enclosure and a charging story that does not expose fragile connectors, and the mount cannot make the weight uncomfortable or unsafe to hold.

## The usability test: can people read it without a manual?

The research question for the test was narrow and falsifiable: **does the device detect and classify exercises accurately enough, and can people follow its feedback without pressing buttons?** The hypothesis was that it could detect most exercises, and that users could follow the feedback hands-free during a lift.

The design was a think-aloud session. Eight participants, all people who do casual gym or home workouts, none of them classmates from the course. Each one got a short explanation, then performed several reps of four exercises while narrating what they noticed:

- bicep curl
- hammer curl
- Zottman curl
- lateral raise

I watched two things: whether reps were counted correctly and whether exercises were misclassified, and I wrote down what people said as they used it. No instrumented metrics, just direct observation and the follow-up questions afterward (did it detect your exercise, was anything confusing, did you feel like you needed buttons, did the feedback make sense). I deliberately moved the questions to after the test instead of interrupting mid-exercise.

One method note worth keeping: early on I over-explained the device, and that changed how people used it. So I cut the explanation down and let later participants interact more naturally. That is a real lesson about contaminating your own test by priming the participant, and it is the kind of thing you only catch by running sessions back to back and noticing the first ones look different.

### What held, and what broke

The headline held up. Across the eight sessions people followed the audio and LED feedback and did the whole thing without reaching for a button. One participant explicitly liked that no buttons were needed and appreciated that it just worked. That is the design goal met: a hands-free interaction that people understood.

The failure was classification, and it failed in specific, repeatable ways:

- **Similar exercises got confused.** Bicep and hammer curls were the main offenders. The Zottman curl was inconsistent and sometimes misclassified. Lateral raises, which are a distinct motion, were detected reliably.
- **Fast or sloppy reps got dropped.** Several people found it worked better when they slowed down or did the movement with clean form. Detection quality tracked movement quality.
- **There was a cold start.** A couple of participants noticed the first few reps were sometimes not counted, and detection improved after the system had a moment to respond.

The most interesting finding was behavioral, and I did not predict it. People adjusted themselves to the device. When reps got missed, participants quietly slowed down and tightened up their form to make the device read them correctly. They were debugging the detector by changing their own behavior, without being asked to. A few got visibly confused when a rep was dropped because they could not tell whether the miss was their form or the device.

:::warning{title="A detector that fails legibly trains its user"}
The feedback was clear enough that people inferred what the device wanted (slower, cleaner reps) and gave it to them. That is good for the demo and risky for the product: the device was quietly coaching better form, but it was also rewarding whatever motion it happened to recognize, not necessarily good lifting. A fitness device that teaches you to move in whatever way it can read is a real failure mode hiding behind a successful test.
:::

## What I would change

The conclusion from the test is concrete. The core interaction works: people get hands-free feedback they understand and do not want buttons. The weak point is classification between similar movements and tolerance for messy, fast reps. For a next iteration I would improve the classifier so close exercises like bicep and hammer curls separate cleanly, make the feedback clearer when detection actually fails (so a user can tell "that was a miss" from "that was your form"), and reduce sensitivity to noisy or incorrect motion so the device is not silently training people to lift in whatever way it can read.

Stepping back to the whole project: the interviews said the problem people have is sitting and a missing reason to move, not a missing tracker, and the build said the interaction can be hands-free and legible but the classifier is where the honesty lives. Both halves pointed the same direction. The hardware is the easy part to demo and the hard part to get right, and the real signal came from watching what people did with the thing, not from what the thing reported about them.
