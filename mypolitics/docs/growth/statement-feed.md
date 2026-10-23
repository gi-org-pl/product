# Statement feed

> An experimental way of taking a quiz: a feed of statements the taker reacts to, with no fixed length and a result that sharpens the longer they stay.

**Decision:** **⚪ idea**

## Context
Raised by the owner in October 2026. There is no design and no product documentation for it yet; what follows is the idea as proposed, read against what the documents already say.

The idea as proposed:

- **A feed instead of questions** - the taker sees one statement after another, as in a social media feed, and reacts to each.
- **Less friction** - answering a question and thinking about it for long is the cost the idea removes. It leans on reaction and emotion, and on an interface the taker already knows from social media. That sits uneasily with the product principles; see Risk.
- **No fixed number of statements** - the taker could go on without end. After a number of statements they can already see a result, and the more they answer, the more accurate it is, or the more [result modules](../modules/quiz/results/modules/README.md) become available.

What the documents say about the quiz this would sit next to:

- **A question is a statement plus an answer** - and almost every political question uses the four-step agreement scale, with no neutral point ([answer model](../modules/quiz/questionnaire/answer-model.md)). The same document says one tap per question is what makes swipe or keyboard input a later addition rather than a rewrite.
- **A quiz is long on purpose** - [questionnaire](../modules/quiz/questionnaire/README.md) puts 50 to 100 questions between the start and the result, and [progress and pacing](../modules/quiz/questionnaire/progress-and-pacing.md) spends a curve on keeping takers through it.
- **Skips already exist** - the session holds "the answers and the skips in the order they were given" ([session and data](../modules/quiz/questionnaire/session-and-data.md)).
- **The running state is local** - it is worked out in the browser after every answer, is an estimate and never the result, and nothing is sent until the single hand-in at the end (same file).
- **Mid-quiz claims are gated on stability** - the [event model](../modules/quiz/questionnaire/checkpoints/event-model.md) lets a card state a number only when it is stable, and says early statements can contradict the result.
- **A result is a header plus modules** - the [header](../modules/quiz/results/modules/header.md) names one orientation with a banded confidence (under 50% no match, 50 to 80% partial, above 80% real), and the [modules](../modules/quiz/results/modules/README.md) are composed by the quiz author from the same bar. A module missing from a quiz is simply not drawn.

The documents do not describe a quiz of unbounded length, a reaction other than the four-step scale, or a result that can be opened more than once per session. Those are what this idea would add.

### The feed
One statement at a time, full width, the way a post fills a phone screen. The statements are the ones a quiz already has: each carries the orientations and weights its answers score, so the feed needs no new content to start.

### Reactions
A small set, proposed here as a starting point and not a decision:

| Reaction | What it records |
|---|---|
| **Agree** | The positive answer on the existing scale |
| **Disagree** | The negative answer on the existing scale |
| **Skip** | No answer; the statement is set aside, as a skip is today |

Only agreement questions can be shown. A question whose answers are custom (the [answer model spec](../../spec/quiz/answer-model.md) documents a many-answer question) has no positive or negative scale answer to record, so the feed either filters such questions out of the quiz's pool or defines a scoring mapping for them; the first is the proposal.

Open question: whether strong versions are needed (a long press, a second button). The scale in the answer model has four steps and two reactions carry half of that resolution. A feed answer would be incomparable with a classic one unless a fixed rule maps it onto the scale.

### Results with an open number of answers
The feed has no last question, so the result cannot be "the end". A proposed shape, mapped onto the existing result structure:

- **A minimum for a first result** - after a set number of reactions the taker can open a result. The number is not known from the documents and has to come from data: the smallest count at which the leading orientation holds. Below it the feed offers nothing, because the event model already says a claim after three answers is one we cannot keep.
- **Confidence grows with answers, but not by itself** - the header's percentage is the strength of answer support, not a sample size. The running score in the [event model spec](../../spec/quiz/event-model.md) is points over the maximum of the questions done so far, so one strong answer can already read 100% and a later answer can lower it. The header band therefore cannot be the progress indicator. A separate measure is needed for unlocking: coverage (how many answers each axis or orientation has) and stability (how much the leading orientation moves over the last reactions). The header keeps its meaning; coverage and stability decide when it and each module may be shown.
- **Modules unlock** - the simplest modules need little: the header and a [single axis chart](../modules/quiz/results/modules/single-axis-chart.md). The ones that cross or group axes need more answers on more axes: the [Nolan chart](../modules/quiz/results/modules/nolan-chart.md), the [multi axis chart](../modules/quiz/results/modules/multi-axis-chart.md) and [traits](../modules/quiz/results/modules/traits.md). How many answers each needs is a measurement, not a guess; each module would get a threshold and below it is not drawn, which is already how a missing module behaves.
- **The result can be opened at any time** once it is available, and the taker returns to the feed without losing anything. The result they see is the state at that moment, and says how many reactions it rests on.
- **Which statement comes next matters** - a feed that serves statements at random fills the axes unevenly. Choosing the next statement to cover the least-known axis is likely needed for confidence to grow; how a quiz author configures that is open.

## Opportunity
- **It removes the heaviest cost of the classic quiz** - the docs name the first stretch of a long quiz as where takers leave. A feed has no stretch to survive.
- **It may reach a different taker** - people who would not start a 100-question quiz might react to a statement.
- **It reuses much of what exists** - statements, scoring, the running state and the result modules are all there. The new parts are the card, the reactions, the thresholds and a hand-in contract for sessions that do not end (see Risk).
- **It fits the product's own bet** - [gamification](../modules/quiz/questionnaire/gamification.md) says the reward has to feel closer with every answer; a result that exists early and improves is the strongest form of that.
- **Data of a new kind** - many quick reactions per taker, comparable with the same taker's considered answers if they take both.

## Risk
- **Doom-scrolling is a dark pattern** - the idea borrows the mechanics of products built to maximise time spent. For a civic product that is not acceptable, so the ethical limits are part of the idea:
    - **No engagement-maximising tricks** - no variable rewards, streaks, notifications, autoplay or sounds, no "one more" nudges.
    - **Clear stopping points** - the feed breaks at set counts with a plain card that says what the taker has so far and offers the result; it continues only on a tap.
    - **The result is visible at any time** once it exists, never hidden behind more answers.
    - **The count is shown honestly** - how many reactions the result rests on, with no curve that flatters progress.
    - **Reduced motion** and no animation for its own sake.
- **It pulls against a principle** - [principles](../concept/principles.md) are constraints, and "Substance over emotion" asks every design decision to move the user a step from feeling toward understanding. A feed that removes thinking and leans on emotion is the inverse of that on its face, so compliance is a gate for any decision to go ahead, not a detail: the result and its modules (explanations, multi-axis results) must stay where the taker ends up, the feed has to lead into them, and a design that keeps the user at the level of feeling does not pass. "Education through play" is the principle the idea can honestly stand on.
- **Quick reactions are not considered answers** - an emotion-led reaction may differ from the answer the same person gives after reading the statement twice. The result is then a different measurement and must not be presented as the same one.
- **Comparability with the classic quiz** - a feed result rests on two reactions and an unfixed set of statements, so it does not pool with classic results, and [comparison](../modules/quiz/results/comparison/README.md) between a feed result and a classic one would mislead until a mapping is validated.
- **The hand-in assumes an ending** - today answers stay in the browser until one terminal hand-in ([session and data](../modules/quiz/questionnaire/session-and-data.md)) and the result flow submits once with no way back ([engaging loader spec](../../spec/quiz/engaging-loader.md)). Submitting at the first result would freeze every later reaction; waiting for a last question means an open-ended session that is abandoned contributes no data at all, including no mode-marked row for the validation below. An explicit contract is needed before the existing data and result path can be called reusable: a snapshot that can be updated, or a finish the taker triggers, with a rule for sessions that are left open.
- **Selection bias** - the taker who stops early and the one who goes on for hundreds of statements are different people; results at different counts are not equally trustworthy, and aggregate statistics must not mix them.
- **Seeing a reading changes the answers** - the docs say so for checkpoints ([axis closeness](../modules/quiz/questionnaire/checkpoints/axis-closeness.md)); a result available at any time makes steering possible. [Live results preview](./live-results-preview.md) carries the same risk.
- **Confidence is misread as accuracy** - the header file says the number describes the answers. In a feed the number moves, which makes the misreading easier.
- **Statements out of context** - a bare statement without the framing of a quiz is easier to misread and to quote.
- **Accessibility** - fast reactions are hard for screen reader users, for takers who need more time and for takers who cannot swipe. Every reaction must be a button reachable by keyboard, nothing may time out, and a card must read in a sensible order.
- **Wording** - the feature is civic, not political: statements and copy keep the neutral register of the classic quiz.

## Decision
**⚪ idea.** Parked in growth like the other ideas here: no design, no product documentation, not on the roadmap.

Gate for any GO: the mode passes the "Substance over emotion" principle (see Risk), and the unlock measure is defined separately from header confidence.

It should stay an experiment: an opt-in mode next to the classic quiz, never a replacement for it. A way to validate it:

- **Randomised A/B for the comparison** - takers are assigned a mode at random, so a difference in completion can be attributed to the mode; answers are marked by mode in the dataset. A taker-chosen opt-in is a feasibility cohort only: people who pick the feed differ in their willingness to finish, so its numbers are reported separately and are not compared with the classic quiz's.
- **Completion** - the share of takers who reach a first result, against the same share in the classic quiz.
- **Answers per session** - the distribution, and where takers stop; a long tail is a signal to review the stopping points, not a goal.
- **Result stability against the classic quiz** - for takers who do both, how often the leading orientation agrees, at which reaction count it starts to, and how that compares with the classic quiz repeated by the same person.
- **Module thresholds** - the count at which each module becomes reliable.
- **Stopping behaviour** - whether takers leave at a stopping point or continue, to check that the stops work as stops.
- **Accessibility test** with keyboard and screen reader before any wider rollout.

Open questions:

- Which reactions, and is there a strong version?
- How many reactions give a first result, and who decides "enough" per quiz?
- Who chooses the next statement, and can a quiz author configure the order?
- What rule maps a feed reaction onto the four-step scale, if the data is to be pooled with the classic quiz?
- Does the feed use one quiz, or a pool of statements across quizzes?
- Should a feed result be saved and shared like a classic one, and what does the short results card say about its count?
- Where is the line between a stopping point and an interruption?
- What is the hand-in contract for a session with no last question: updatable snapshot, taker-triggered finish, or both?
