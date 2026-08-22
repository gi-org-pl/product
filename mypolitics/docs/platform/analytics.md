# Analytics

> Measuring how the product is used, without ever measuring what people think.

**Decision:** **⚪ idea**

## Context
Today we count users. That is close to everything we know, and it is why most product arguments end in opinion: we cannot say whether a change helped, which question loses people, or whether the thing we built to keep them there does.

This is product analytics - how the product behaves in use. It is not the research data in the [data module](../modules/data/README.md), which is what people think. The two must not meet.

What is worth measuring:

- **The funnel by phase** - where takers stop, broken down by the [phases](../modules/quiz/questionnaire/phases-model.md) they stop in, so drop-off has an address instead of being "the quiz".
- **Time per question and per quiz** - which questions stall people, and how long a quiz really takes against what [pacing](../modules/quiz/questionnaire/progress-and-pacing.md) promises.
- **Completion rate per quiz** - already a dependency, because [quality score](../modules/quiz/community/quality-score.md) cannot rank anything without it.
- **Sharing** - card downloads, shares, comparison links opened, and [follow-up](../modules/quiz/results/follow-up-recommendation.md) taps. This is the growth loop the whole model rests on, and it is currently unmeasured.
- **Hotspots** - what gets tapped and what gets ignored: info buttons, module statistics, expanded groups, the parts of the result nobody opens.
- **Checkpoint effects** - opt-out rate and the effect on completion, which is the only way the [event model](../modules/quiz/questionnaire/checkpoints/event-model.md) gets tuned rather than guessed at.

Where the line sits:

- **Events describe behaviour, never content** - that a question was answered in nine seconds is analytics; what was answered is not.
- **Nothing joins to identity** - the separation in [privacy and legal](./privacy-and-legal.md) applies here first, because analytics is the system most tempted to break it.
- **Special categories stay out of third-party tools** - measurement running on the pages where people answer political questions has to be ours, scoped, and defensible.

## Opportunity
- **Almost anything beats a user count** - the cheapest wins in the product are currently invisible to us.
- **It makes the gamification bet testable** - [checkpoints and pacing](../modules/quiz/questionnaire/gamification.md) exist to hold people to the end, and that claim is measurable or it is decoration.
- **It unblocks the community module** - ranking community quizzes needs completion data before it needs anything else.
- **It measures the growth engine** - reach is built rather than bought, as [how](../concept/how.md) puts it, and sharing is the mechanism nobody has ever instrumented.
- **The events already happen** - this is instrumentation, not new product surface.
- **It lets copy be improved by evidence** - the loader lines and checkpoint pools become comparable against completion instead of taste.

## Risk
- **Analytics is where the privacy rule breaks first** - every useful join is one step towards attaching behaviour to a person, and third-party tags on the questionnaire are already the weakest point we have.
- **Hotspots shade into session recording** - watching interaction on a screen where someone is stating political views is a line we should not cross, however normal the tooling is elsewhere.
- **Optimising completion can cost honesty** - shorter, blander, easier quizzes finish better, and a completion metric will quietly ask for exactly that.
- **Consent skews the sample** - we only measure the people who accept measurement, and they are not a random half.
- **Dashboards rot** - a volunteer team builds them once, reads them for a month, and then trusts numbers nobody has checked since.
- **More numbers do not fix the wrong headline** - user count is what gets quoted publicly, and it will keep being quoted whatever else we collect.
