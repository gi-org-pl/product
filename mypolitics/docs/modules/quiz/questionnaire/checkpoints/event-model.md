# Event model

> How the questionnaire decides that something is worth showing mid-quiz.

**Decision:** **⚪ idea**

## Context
[Checkpoints](./README.md) are the cards a taker sees between questions. The event model is the layer underneath: what decides which card appears, when, and whether it is even true yet.

After every answer the questionnaire recomputes a running state, and that state is the only input the model has:

- **Scores** - where the taker currently sits on each axis and orientation.
- **Traits** - which named traits the answers have unlocked so far.
- **Coverage** - which parts of the map have been visited, for example compass quadrants or categories.
- **Progress** - questions answered, questions left, time remaining.
- **Rarity** - how the taker's answers sit against everyone else's - see [module statistics](../../results/module-statistics.md).

From there the pipeline is:

1. **Trigger** - each checkpoint type declares a condition over that state. A trait was unlocked. An axis crossed a threshold. Half the questions are done. An answer is shared by under 10% of takers.
2. **Confidence gate** - a trigger only counts if the number behind it is stable. Telling someone their radicalism is high after three answers is a claim we cannot keep, and being wrong mid-quiz costs more than saying nothing.
3. **Selection** - several triggers fire at once, so candidates are ranked and exactly one wins. More personal and rarer events beat generic ones, and a type already seen loses to one that has not.
4. **Pacing** - a minimum gap in questions, a cap per quiz, no two cards of the same type in a row, nothing at the very start or right before the end. Pacing overrules triggers: a card that cannot be shown now is dropped, not queued.
5. **Card** - the winning event resolves to a headline, one sentence, and a visual borrowed from the result modules.

Two behaviours the model has to carry beyond a single card:

- **Two-beat events** - a guessing card asks something and schedules its own follow-up, which resolves a few questions later and depends on both the guess and the state at that point - hit or miss.
- **Opt-out** - every card offers turning checkpoints off, so the model has to degrade to showing nothing at all without the questionnaire noticing.

Two properties hold the whole thing together. **Determinism** - the same answers in the same order produce the same events, so a quiz can be tested and a taker's session can be explained. **Zero configuration** - types are on by default and copy works without an author writing any, because community quizzes will ship without touching the settings.

## Opportunity
- **One mechanism, many cards** - a new checkpoint type is a trigger plus copy, not new questionnaire code.
- **Interruptions are budgeted in one place** - pacing lives in the model instead of each card deciding for itself, which is what keeps the [gamification](../gamification.md) loop intact.
- **The confidence gate protects credibility** - we only say mid-quiz what the answers already support, held to the same standard as the result screen.
- **Shared visual language** - cards render result modules, so a checkpoint and the final result look like one product.
- **Testable** - replaying a set of answers reproduces the exact sequence of events, which makes both bugs and complaints answerable.

## Risk
- **It is an interruption engine** - every card stops the flow the questionnaire exists to sustain, and enough of them break the thing they were meant to reward.
- **Early statements can contradict the result** - a confident reading at question 20 that the final result overturns reads as us being wrong, not as us being early.
- **Rarity needs live aggregates** - population comparisons are either expensive to compute mid-quiz or stale by the time they are shown.
- **Unresolved two-beat events** - a guess whose follow-up never fires, because the taker quit or the quiz ended first, has to fail silently.
- **Configuration spreads** - per-quiz toggles multiply the states to test, and community quizzes will find combinations we never tried.
- **Opt-out is effectively permanent** - almost nobody turns checkpoints back on, so the first card a taker sees decides whether the system exists for them at all.
