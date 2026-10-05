# Axis closeness

> Tells the taker where they already stand on one axis, once the reading is safe to state.

**Decision:** **⚪ idea**

## Context
A passive card shown between questions. It names one axis, draws the taker's current position on it, and says what that position means in one sentence - see [checkpoints](./README.md) for the shared card frame and [event model](./event-model.md) for what makes it fire.

Two variants, one per axis type:

- **Single axis** - one orientation, filled from zero. "Your radicalism is high."
- **Double axis** - two opposing orientations, filled towards the leading side. "Your euroscepticism is greater than your federalism."

| Single axis | Double axis |
|---|---|
| ![Single axis checkpoint](../../../../../assets/single-axis-checkpoint.png) | ![Double axis checkpoint](../../../../../assets/double-axis-checkpoint.png) |

How it behaves:

- **Reuses the result chart** - the same [single-axis](../../results/modules/single-axis-chart.md) and [double-axis](../../results/modules/double-axis-chart.md) modules the result screen uses, so mid-quiz and final look like one product.
- **Copy is lead-in plus statement** - a grey opener that signals certainty, then the finding in bold. "We already know this - your radicalism is high."
- **Fires on confidence, not on progress** - the axis needs enough answers behind it and a clear enough lean. A near-tie has nothing worth saying.
- **Once per axis** - the same axis never gets two cards in one quiz, and the [event model](./event-model.md) picks which axis wins when several qualify.
- **Passive** - no input, just continue, plus the checkpoint opt-out every card carries.

## Opportunity
- **Turns progress into payoff** - eleven questions in, the taker gets a real finding about themselves instead of a progress bar, which is the whole gamification bet.
- **Teaches the vocabulary early** - by the time the result screen shows a dozen axes, the taker has already met one and knows how to read it.
- **Cheapest checkpoint we have** - it needs only the scores already being computed, no aggregates, no extra questions, no author configuration.
- **Works in any quiz** - every quiz has axes, so this is the one checkpoint that never needs a fallback.

## Risk
- **An early reading can be overturned** - "your radicalism is high" at question 11 against a balanced final result makes us look wrong rather than early.
- **It can change the answers that follow** - telling someone what they are mid-quiz invites them to answer consistently with the label instead of honestly, which is a data quality problem, not just a UX one.
- **Comparative phrasing confuses** - "more eurosceptic than federalist" is easy to read as "you are a eurosceptic", which is not what the axis says.
- **Choosing the axis is a ranking problem** - a card about a dull axis burns the slot a striking one deserved.
- **Wording carries judgement** - "high radicalism" reads as a verdict, and on a political axis a verdict is exactly what we cannot be seen to hand out.
