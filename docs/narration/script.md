---
title: Making Placement Visible: the short version
engine: kokoro
voice: am_michael
pronounce:
  ECAT: E-C-A-T
  Novatr: Nova-ter
  Retool: Ree-tool
  Sanya: Sahn-ya
---

<!--
  Your narration script. One `## Heading` per chapter; paragraphs are separated by a blank line.
  {id=…} is the chapter's id, and {anchor=…} the page section it belongs to (they match: id=problem is the
  section with id="problem"). anchor=top means it belongs to no section (the intro). The heading text is the
  chapter's label on the player, and is not read aloud.

  Write for the ear: spell numbers out ("fifty-one point five"), no symbols, short sentences. Names the voice may
  mispronounce go under `pronounce:` above (and `engine:` / `voice:` name the voice: change them when you switch); each maps ONE word to ONE word. Then run:  npm run narration:script
-->

## Intro {id=intro anchor=top}

Learners at Novatr bought placement support, and experienced it as a black box. I led the design direction for the portal that opened it up. Here’s the short version.

## The problem {id=problem}

A learner finishing a Novatr course had already paid for placement help. What they met was a Slack channel, an email thread, and a Google Form. After they expressed interest, the process disappeared. They couldn’t see whether a job matched them, where an application stood, or why they were ineligible. Every one of those had an answer. None of them was being answered.

## Evidence {id=evidence}

Novatr measured satisfaction at every stage of the journey. Acquisition, activation and engagement all sat around eighty. Then completion fell to fifty-five, and placements to fifty-one point five.

Net Promoter Score told the same story. Placed graduates scored fourteen. Graduates who weren’t placed scored minus eighteen. And thirty percent of placements were self-placed: invisible to the company, and unacknowledged by the product.

## Reframing {id=reframing}

The team asked for a placement page. The evidence described a process with no visible state, so I argued for a system. We boiled the learner’s needs down to four: eligibility, communication, access, and tracking. ECAT.

Then we staged the work. Ship the learner portal. Adapt Retool for operations. And deliberately not build a hiring-partner portal, because partners had told us they wouldn’t use one. Applications kept going out by email, while the records behind them were built so a partner product could sit on top later.

## Leadership {id=leadership}

Sanya owned the detailed product design, on her first major project here. The flows, screens and states are hers. My part was framing, decision principles, and reviews.

In every review I asked one question: what must be true about this learner for this screen to appear, and what must they understand or do next? It turned a pile of screens into a bounded set of conditions. By the end, Sanya could model complex states on her own.

## The product {id=product}

Every surface answers two questions: where do I stand, and what happens next? The portal has no front door. A learner arrives through one banner on their course page, and it changes with where they are.

Eligibility shows the criteria, names the learner’s shortfall, and offers a route to close it. Location is a soft criterion: a job outside your preference isn’t hidden. You’re told, and you decide.

And every journey ends properly. Placed learners celebrate. Self-placed learners can share their news. Learners who aren’t placed get a page that acknowledges the difficulty. And one rule, which exists only as a note on the handover board: nobody loses access while they’re mid-process.

## Handover {id=handover}

The handover served two audiences: the engineers building it, and whoever built next. Sixty-three annotated screen states, about forty-five components, and a full mobile set. But the lasting part was the vocabulary. Status, relevance and eligibility were handed over as system definitions, so future products could adopt them instead of inventing competing versions.

## Launch, and what I’d change {id=launch}

The portal launched to graduating cohorts after about three months. One claim I won’t make: that it created more jobs. It made supply visible, and the gaps measurable.

What would I change? Split job evaluation from application tracking. Reconcile the two disqualification rules into one consequence model. Put a rubric behind human decisions that affect access to a paid service. And interview non-placed graduates at the start, because they answered surveys at half the rate of current learners. We heard least from the people we most needed to.

The most important outcome was a shared language for a process that used to exist as disconnected human actions.
