# Archetype

> The named character the taker came out closest to, and what it means.

**Decision:** **⚪ idea**

Design: [Figma](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5513-28187)

## Context
An archetype is an orientation like any other - an entity that collects points - and this module is the one that tells its story. The leading archetype, its match, a description written by the author, and the ranking behind it.

![Archetype states, from no match to the full ranking](../../../../../assets/archetype.png)

How it behaves:

- **The winner and its match** - name, avatar and a [bar](./universal-axis.md), banded the same way the [header](./header.md) bands confidence: under 50% is no match, 50 to 80% partial, above 80% a real one.
- **No match is a result** - when nothing clears the bar the module says so instead of naming the least bad option.
- **A description that can grow** - a short paragraph by default, expandable into the full text the author wrote about that archetype.
- **The others are one tap away** - the second control opens the ranking of every archetype with its own match, which is a [horizontal bar chart](./horizontal-bar-chart.md) underneath.
- **The same numbers travel** - this is the block the [short results card](../short-results-card.md) and the [header](./header.md) both read from.

Because an archetype is only an orientation, the module fits anything with a name and a character:

- **Ideological archetypes** - "green progressive", the asset's example.
- **A president or a candidate profile** - the kind of politician the taker wants, rather than a specific person.
- **Non-political personas** - the same module carries a music or personality quiz without changes.

## Opportunity
- **A name is the most shareable result there is** - "I am a green progressive" travels where a percentage does not.
- **The description does the educating** - it is the one place in the product with room to explain what a position actually holds.
- **The ranking prevents a single label from lying** - showing the runners-up makes a 55% match look like the near-thing it is.
- **Author-written, product-shaped** - every quiz gets the same module and fills it with its own cast.

## Risk
- **A label sticks** - people adopt the name we hand them, and the caveat under it does not travel with it.
- **The description is the author's voice in our frame** - a community quiz can write a characterisation we would never publish.
- **Long text competes with the result** - the block is the only prose on the screen, and most takers will not read it.
- **The bands decide how often we refuse** - the same threshold problem as the header, with the same consequence for trust.
- **Runner-ups reveal the model** - a taker who sees five archetypes within ten points learns the result was close to arbitrary.
