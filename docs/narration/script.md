---
title: Making Placement Visible: the short version
engine: elevenlabs
voice: ElevenLabs Studio
pronounce:
  Novatr: Novater
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

Hello — thanks for taking a look at Placement Hub.

This is the short version of a project that started with one question: if placement support is part of a learner’s course experience, why is it so difficult to see?

At Novatr, learners had placement support. But once they showed interest, the process could become a black box. This is how we made it clearer, more understandable, and more humane.

## The problem {id=problem}

A learner could move between a Slack channel, an email thread, and a Google Form. They could raise their hand for placement support—but after that, things often went quiet.

They couldn’t see whether a role matched them, whether their profile had been reviewed, where an application stood, or why they were ineligible.

The placement team was doing real work behind the scenes. The problem was that almost none of it was visible to the learner it was meant to support.

## Evidence {id=evidence}

The data made the issue hard to ignore.

Satisfaction held through the learning experience, then dropped sharply when placement support mattered most. And graduates who were not placed reported a much weaker experience than those who were.

We also found that nearly a third of placements were self-placed—outcomes that were largely invisible to the company and unacknowledged by the product.

## Reframing {id=reframing}

The original request was for a placement page. But the research showed that a page alone would not solve it. Learners needed to know whether they were eligible, what had changed, which opportunities were open to them, and what to do next. We grouped those needs into eligibility, communication, access, and tracking.

That framework kept a three-month release focused. We built the learner portal, adapted the operations workflow, and deliberately chose not to build a hiring-partner portal for partners who had told us they preferred their existing process.

## Leadership {id=leadership}

The detailed product design was led by Sanya, our product designer. My role was to set the direction, frame decisions, and support the work through reviews.

One question became especially useful: what needs to be true about this learner for this screen to appear—and what do they need to understand or do next?

That shifted the work from a collection of screens to a clear model of conditions and outcomes.

## The product {id=product}

The portal answered two questions: where do I stand, and what happens next?

Learners entered through a banner on their course page. Depending on their situation, it could guide them to check eligibility, complete an interest form, wait for placement to unlock, or explore jobs.

Eligibility was not just enforced; it was explained. Learners could see why they fell short and what they could do about it.

Roles were grouped by relevance. And where a job was outside someone’s preferred location, we did not hide it. We gave them the context and let them decide.

Applications carried their status—and, when needed, their reason for not moving forward. Every journey also had an ending: celebration for placed learners, recognition for self-placed learners, and a considered closing experience for those who were not placed.

One rule mattered deeply to me: nobody should lose access while they are still mid-process.

## Handover {id=handover}

The handover was built for the engineers shipping the portal, and for whoever built on it later.

It included annotated states, components, mobile designs, and journey maps. But the lasting outcome was the shared vocabulary underneath it all: eligibility, relevance, application status, and placement standing as system concepts—not just labels on screens.

## Launch, and what I’d change {id=launch}

The portal launched to graduating cohorts after roughly three months.

I would not claim that it created more jobs. What it did was make opportunity supply visible, make gaps measurable, and give learners a clearer sense of where they stood.

Looking back, I would split job evaluation from application tracking, make decision rules more consistent, and involve non-placed graduates earlier.

The biggest lesson I took from Placement Hub is that a system is not just the screens people can see. It is also the rules and human work underneath them.

When those things are invisible, people fill the gaps with uncertainty. When they are clear, people can make better decisions—even when the outcome is not the one they hoped for.
