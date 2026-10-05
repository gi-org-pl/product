# Universal axis

> The bar every result module is built from.

**Decision:** **⚪ idea**

## Context
Almost everything the result screen shows is a score on a scale, so almost everything is drawn with the same bar. The universal axis is that bar, and it comes in two forms: one-sided, filled from zero for a single orientation, and double-sided, split between two orientations that oppose each other.

![One-sided and double-sided, with every state](../../../../../assets/universal-axis.png)

What one bar is made of:

- **A capped track** - the orientation's icon sits at the end that belongs to it: one cap on a one-sided bar, both caps on a double-sided one.
- **A fill and its value** - the number is written inside the fill, and moves out or changes colour when the fill is too small to hold it. A double-sided bar hides a side's value entirely once it gets small enough to be unreadable.
- **A marker** - a tick across the track, configurable, sitting at 50% by default, so a lead can be read without arithmetic.
- **Optional labels** - the orientation name under the cap it belongs to, for the modules that need naming and not for the ones that do not.
- **Empty states** - a bare track with no orientation at all, and a two-sided track where both orientations scored nothing.
- **A comparison overlay** - hatching drawn between the two values with the other side's avatar at their position, so it reads as a direction: the hatching runs forward when they are ahead of the taker and back over the fill when they are behind. A fully hatched bar means only they have a value here - see [comparison modes](../comparison/comparision-modes.md).

Every module above it is an arrangement of these bars: one bar is a [single axis chart](./single-axis-chart.md), a two-sided one is a [double axis chart](./double-axis-chart.md), a grouped stack is a [multi axis chart](./multi-axis-chart.md), a ranked list is a [horizontal bar chart](./horizontal-bar-chart.md), and the [Nolan chart](./nolan-chart.md), [archetype](./archetype.md) and the mid-quiz checkpoints all open into the same bar again.

## Opportunity
- **One thing to learn** - a taker who reads the first bar can read every module in the product, including the ones on a shared image and the ones shown mid-quiz.
- **One thing to build** - comparison, empty states, value placement, colour and animation are solved once and inherited everywhere.
- **New modules are cheap** - a new module is a new arrangement of bars, not new drawing.
- **It survives any orientation** - parties, candidates, ideologies, archetypes and traits are all entities with points, so the same bar renders all of them.
- **The marker makes the bar honest** - a configurable reference line is what stops a lead being read as a landslide.
- **It scales down** - the same bar stays legible on a checkpoint card and inside a downloadable image.

## Risk
- **Percentages invite false precision** - the bar looks like a measurement even when it rests on a handful of answers.
- **Two orientations on one track imply a zero sum** - splitting a bar claims the poles trade against each other, which is a modelling decision the drawing hides.
- **Small values disappear** - hiding a number that will not fit keeps the bar clean and quietly removes the least flattering figures from the screen.
- **Hatching has to read as a direction** - if ahead and behind look alike, the comparison says nothing, and it is the same pattern in both cases.
- **Icon and colour do the identifying** - with many orientations on screen the palette runs out and rows start to look alike.
- **Long names break the layout** - an author-written orientation title has no length limit, and the caps leave little room.
