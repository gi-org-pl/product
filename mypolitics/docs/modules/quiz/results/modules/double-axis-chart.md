# Double axis chart

> Two opposing orientations sharing one bar.

**Decision:** **⚪ idea**

Design: [Figma](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5500-2387)

## Context
One [bar](./universal-axis.md) split between two orientations that stand against each other. Each side keeps its own icon, colour and label; together they always add up to a hundred, and the title names whichever side is winning.

![Double axis states and examples](../../../../../assets/double-axis-chart.png)

How it behaves:

- **The title is the lead, not the axis** - the card says "euroscepticism", not "euroscepticism versus federalism", because the result is the side the taker landed on.
- **Both poles stay labelled** - each side is named under its own cap, so the number reads as a trade-off rather than a score.
- **A marker gives the reference** - the tick sits at an even split by default and can be moved, which is what makes 55% look like the narrow lead it is.
- **A tie has no winner** - an even split names neither side.
- **Comparison overlays the same track** - a friend's position appears as a hatched band with their avatar.

Examples of pairs it can carry:

- **Euroscepticism against federalism** - the pair the asset uses.
- **Interventionism against the free market** - an economic axis.
- **Progressivism against traditionalism** - a worldview axis.
- **Two candidates head to head** - orientations do not have to be ideologies.

## Opportunity
- **It shows the trade-off, not just the score** - politics is mostly a choice between two things, and one bar says that better than two.
- **Half the space of two charts** - a screen of axes stays readable on a phone.
- **It is the unit of the multi axis chart** - see [multi axis chart](./multi-axis-chart.md), which is a stack of these, and the [Nolan chart](./nolan-chart.md), which expands into two.
- **Pairs teach the vocabulary** - seeing the opposing pole named is how a taker learns what an axis means.

## Risk
- **It asserts a zero sum** - putting two orientations on one track claims that supporting one is opposing the other, which is a modelling choice the drawing hides.
- **The pairing is the author's opinion** - who stands opposite whom is a political statement, and community quizzes will make some that we would not.
- **A narrow lead looks like a verdict** - 51% names a side, and the title says that side without a hedge.
- **Two labels plus two icons is a crowded bar** - long author-written names have nowhere to go.
