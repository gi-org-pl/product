# Random copy

> Every card draws its wording from a pool, so the same finding never sounds the same twice.

**Decision:** **⚪ idea**

## Context
Every checkpoint says its finding the same way: a grey lead-in, then the statement in bold, with the values filled in from the taker's state - see [checkpoints](./README.md). That template is what makes the cards cheap to build, and it is also what makes them feel mechanical once a taker has seen three of them.

Random copy is the fix. Each card type owns a pool of phrasings, and one is drawn when the card fires.

Roughly what a pool holds:

| Card | Lead-ins it can draw |
|---|---|
| [Axis closeness](./axis-closeness.md) | "We already know this", "No surprises here", "That much is settled" |
| [New trait](./new-trait.md) | "Well, that's a surprise", "Look what you picked up", "Not everyone gets this one" |
| [Nolan chart path](./nolan-chart-path.md) | "What am I doing here?", "Quite a journey", "You do get around" |
| [Stats chart](./stats-chart.md) | "A rare specimen", "Not many of you", "You are in a small group" |
| [Puzzles](./single-axis-puzzle.md), on a hit | "Got it", "You knew that one", "No fooling you" |
| [Puzzles](./single-axis-puzzle.md), on a miss | "Missed", "Now that's interesting", "Not quite" |

How it behaves:

- **Pools are per card and per state** - a hit and a miss never draw from the same pool, because the tone is the finding as much as the words are.
- **No repeats within a session** - a phrasing already used is out of the pool for the rest of that quiz.
- **Random, but replayable** - the draw is seeded per session, so the same answers reproduce the same cards, which is the determinism the [event model](./event-model.md) depends on.
- **Values stay in slots** - orientation names, counts and percentages are injected, never written into a variant, so a pool works across every quiz.
- **Ours by default** - the pools ship with the product; an author writing their own copy is a later idea, not a requirement, because community quizzes ship with nothing configured.

The language constraint is real and shapes how variants get written. Polish inflects: a verb form carries the taker's gender, and an injected name needs the right case. Variants have to be authored per language rather than translated line by line, and phrasings that would need to bend an author-supplied name - a quiz's own orientation title - have to be built to keep it in the nominative instead.

The spec comes later: pool structure, seeding and slot syntax are implementation questions, not product ones.

## Opportunity
- **Variety for the price of writing sentences** - no engineering per card, and the system gets deeper every time someone adds a line.
- **Personality is the product here** - the cards are the only place the quiz talks to the taker directly, and a voice is what separates this from a progress bar.
- **It hides the template** - a taker who never notices the same sentence twice never notices there is a template at all.
- **Tone can be tuned by pool** - if a card is landing badly, the fix is rewriting a few strings, not changing the mechanic.
- **A natural place to experiment** - alternative phrasings are comparable against completion, so the pools can be improved with evidence.

## Risk
- **Humour on political content misfires** - a joke about a trait someone takes seriously reads as mockery, and we cannot see which trait matters to which taker.
- **Localisation multiplies** - every language needs its own pool written from scratch, and gendered forms can double the count inside a single language.
- **Voice drifts** - many hands writing variants produces a product that sounds like several different people.
- **Mismatched pairings** - a light lead-in landing on a heavy statement is a combination nobody reviewed, and there are many more combinations than reviewers.
- **Testing surface grows** - every variant is a string that can overflow a card or read wrong with an unusual value in the slot.
