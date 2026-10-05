# Engaging loader

> The wait between the last answer and the result, spent on purpose.

**Decision:** **⚪ idea**

## Context
The results calculation phase - see [phases model](../questionnaire/phases-model.md) - fills the screen with a card that narrates the work instead of counting down to it. A dark animated field, a stack of short status lines, and the two result actions sitting greyed out until it is over.

![The loader and its text pool](../../../../assets/engaging-loader.png)

How it behaves:

- **Words instead of a percentage** - lines arrive one at a time, the current one spinning, and the finished ones stay on screen so the stack grows into visible progress.
- **The lines are jokes about political life** - "we count, we do not judge", "starting the third reading", "checking whether you pass the threshold", "we are in favour, and even against". The subject is the process, never the taker.
- **Drawn from a pool** - the sequence is shuffled per run and never repeats a line, the same mechanic as [random copy](../questionnaire/checkpoints/checkpoints-random-copy.md) on checkpoints.
- **The destination is already on screen** - download and full results are rendered disabled, so the taker sees where this ends before it ends, and nothing moves when the card resolves.
- **Continuity with the questionnaire** - the header keeps saying almost, the same way the closing phases do.
- **Its length is a decision** - the sequence sets the duration, not the arithmetic behind it.

## Opportunity
- **The one wait people are happy to sit through** - attention is at its peak between the last answer and the result, so this is the cheapest entertainment in the product.
- **A neutrality statement disguised as a joke** - "we count, we do not judge" says the thing our whole [credibility](../../../concept/why.md) rests on, in a form nobody skips.
- **Room for real work** - computing the result, rendering the card image and saving the session can all happen behind a wait that is already justified.
- **It grows for free** - a new line is a string, so the loader gets better every time someone thinks of a good one.
- **Voice where voice is safe** - humour about parliament costs nothing; humour about the taker's views would cost everything.

## Risk
- **A manufactured wait is still a wait** - if the calculation is quick, we are holding people back from the thing they came for, and they can feel it.
- **The jokes are untranslatable** - every line is a reference to Polish political life, so another country needs a new pool written from scratch, not a translation.
- **References date and take sides** - a line about a specific scandal ages into confusion, and any line read as aimed at one camp breaks the rule the product depends on.
- **Dead buttons invite tapping** - showing the actions early means showing something that does not respond.
- **A comedy card is the wrong place for a failure** - if a step breaks, the loader has to stop being funny and say so.
