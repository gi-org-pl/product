# Checkpoints

> Partial results between questions - what each card can say, and what it costs to say it.

## Contents
| File | Description |
|---|---|
| [Axis closeness](./axis-closeness.md) | Where the taker stands on one axis |
| [Double axis puzzle](./double-axis-puzzle.md) | Guess which named position you are closest to |
| [Event model](./event-model.md) | What fires a checkpoint, and when |
| [Halfway through](./halfway-through.md) | Progress and time left, nothing personal |
| [New trait](./new-trait.md) | A trait unlocked at full agreement |
| [Nolan chart path](./nolan-chart-path.md) | The route travelled across the compass |
| [Random copy](./checkpoints-random-copy.md) | Varying the wording so cards do not repeat |
| [Single axis puzzle](./single-axis-puzzle.md) | Guess which side of one axis you came out on |
| [Stats chart](./stats-chart.md) | How rare the taker's answer is |

## Context
A checkpoint is a card shown between two questions, telling the taker something true about themselves before the quiz is over. It is the payoff the [gamification](../gamification.md) bet depends on: the reward has to feel closer with every question, and a progress bar cannot carry that alone.

What every card shares:

- **One card, one finding** - a headline, one sentence, and a visual borrowed from the [result modules](../../results/modules/module-wrapper.md).
- **Lead-in plus statement** - a grey opener that sets the tone, then the finding in bold. "We already know this - your radicalism is high."
- **The result screen's visuals** - checkpoints render the same charts as the result, so mid-quiz and final look like one product.
- **An opt-out on every card** - turning checkpoints off is always one tap away, and the system has to degrade to showing nothing at all.
- **Fired, not scheduled** - the [event model](./event-model.md) decides which card wins and whether pacing allows it; a card that cannot be shown now is dropped, not queued.

Two constraints apply to all of them. **Confidence** - a card only fires when the number behind it is stable, because being wrong mid-quiz costs more than saying nothing. **Zero configuration** - types work without an author writing any copy, because community quizzes ship without touching the settings.