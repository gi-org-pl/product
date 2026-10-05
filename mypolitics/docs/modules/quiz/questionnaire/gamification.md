# Gamification

> Making 50-100 questions pleasant to get through.

**Decision:** **⚪ idea**

## Context
A political quiz worth taking needs 50 to 100 questions. Fewer, and the result is not defensible; that many, and the taker is asked to work for ten minutes before receiving anything at all. Every other product in the category solves this by being shorter and worse.

The problem is not length, it is the payoff sitting entirely at the end. So the answer is to move some of it forward:

- **[Checkpoints](./checkpoints/README.md)** - cards between questions that tell the taker something true about themselves before the quiz is over. This is the main mechanism, and most of the design work lives there.
- **[Progress and pacing](./progress-and-pacing.md)** - a progress bar that never makes the remaining stretch look flat.

Checkpoints carry the load because they are the only one that pays in the currency the taker actually came for. A smoother bar makes the work lighter; a checkpoint makes the work *worth it*, by handing over a piece of the result early. What that costs and how it is rationed is the [event model](./checkpoints/event-model.md).

The bet in one line: the reward has to feel closer with every question answered, not only at the last one.

## Opportunity
- **It is what lets the quiz be long** - if the middle pays, we can ask the number of questions the result actually needs instead of the number the funnel tolerates.
- **The payoff already exists** - checkpoints spend the result modules we have built anyway, so the reward costs content, not new product.
- **Abandonment stops being total** - a taker who quits at question 30 has still learned something, which is worth more than a completion we did not get.
- **It compounds with the data** - the longer people stay, the better every dataset, export and report downstream gets.
- **Nobody else can copy the good version** - rarity and comparison cards need a population behind them, which is the one thing a new competitor cannot ship with.

## Risk
- **Every reward is an interruption** - the mechanism that makes the quiz bearable is also the thing stopping the flow, and enough of it breaks what it was meant to protect.
- **Paying early can end the visit** - a taker who has been given a piece of the result may decide they have enough and never reach the end.
- **Telling people what they are changes what they answer** - the whole approach feeds readings back mid-quiz, and that is a data quality problem, not only a UX one.
- **It cannot rescue a bad quiz** - dressing up 80 dull questions makes them dressed up, not interesting.
- **The opt-out is permanent in practice** - almost nobody turns checkpoints back on, so a taker who dismisses the first card is doing the long version with none of this.
- **We are solving a problem we chose** - the length is our decision, and every mechanism here is the cost of defending it.
