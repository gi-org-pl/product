# Double axis puzzle

> Shows how close the taker is to a named position without saying which one, and asks them to guess it.

**Decision:** **⚪ idea**

## Context
The harder sibling of the [single axis puzzle](./single-axis-puzzle.md). There the fill is hidden and the poles are named; here the fill is shown and the name is hidden, so the taker knows they are close to something and has to work out what - see [checkpoints](./README.md) for the shared card frame and [event model](./event-model.md) for what makes it fire.

The card runs in three states:

- **Ask** - a closeness bar drawn at its real value with the label masked, offered against three named positions. "What do you think - you are very close to one of these, guess which!"
- **Hit** - the label uncovers into the full [archetype](../../results/modules/archetype.md) row, name and avatar and all. "Got it - the green progressive is very close to you at this stage of the quiz."
- **Miss** - nothing uncovers. "Missed - someone else is closest to you. Who? We are not telling yet!"

| Ask | Hit | Miss |
|---|---|---|
| ![Guess the position](../../../../../assets/double-axis-puzzle-checkpoint-1.png) | ![Guessed right](../../../../../assets/double-axis-puzzle-checkpoint-2.png) | ![Guessed wrong](../../../../../assets/double-axis-puzzle-checkpoint-3.png) |

How it behaves:

- **The options are whole positions, not poles** - each one sits on two axes at once, so the guess is about which character the taker resembles rather than which side of a line they fall on.
- **Three options, one of them true** - the two distractors are the design work: too obvious and there is no game, too random and it is a lottery.
- **A miss reveals nothing** - unlike the single axis puzzle, the answer is withheld, because the closest position is the headline of the result screen and spending it here would give the ending away.
- **The withholding is the hook** - "we are not telling yet" turns a wrong guess into a reason to finish the quiz.
- **Fires on separation** - the closest position has to be clearly ahead of the runner-up, otherwise the answer we are marking against is arbitrary.
- **Once per quiz** - it is the most demanding card we show, and a second one would be a chore.
- **Needs named positions** - a quiz without archetypes cannot run this checkpoint at all.

The guess itself is worth keeping: what someone expects to be, next to what their answers make them, is a comparison no other part of the product collects.

## Opportunity
- **Curiosity with a real answer behind it** - the taker is shown a genuine number and asked to name it, which is a puzzle rather than a quiz interruption.
- **A miss still pays** - withholding the answer converts the weakest outcome into anticipation instead of disappointment.
- **Self-perception data** - guess against measured position, at scale, is a dataset worth analysing on its own.
- **Teaches the cast early** - meeting three archetypes mid-quiz makes the result screen legible when it names one.
- **Reuses what exists** - the archetype row and the closeness bar are already built for the result.

## Risk
- **It can spoil the ending** - even a hit hands over the headline of the result screen with half the quiz still to go.
- **A miss is a dead end** - the taker committed, got told they were wrong, and received nothing back; the copy is doing all the work of making that feel playful.
- **One in three is a weak game** - too few options and hits are cheap, too many and the card turns into a list nobody reads.
- **Distractors are hard to pick well** - they have to be plausible against this taker's position, which means generating them per taker, not per quiz.
- **Committing to a character contaminates what follows** - stronger than an axis guess, because the taker has now picked an identity and the remaining questions are a chance to live up to it.
- **The position moves** - the archetype that was closest at question 11 may not be the one on the result screen, and a taker who guessed it right will remember that we agreed with them.
- **Not every quiz can run it** - archetypes are optional in a quiz design, so the event model needs something else to reach for.
