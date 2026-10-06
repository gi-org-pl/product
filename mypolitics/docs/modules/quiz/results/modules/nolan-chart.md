# Nolan chart

> Two axes crossed into a map, with the taker standing somewhere on it.

**Decision:** **⚪ idea**

Design: [Figma](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5508-25681)

## Context
A square split into four quadrants, with a dot where the taker's two scores put them. The axes are named down the side and along the bottom with their values, and the title says which quadrant they are in and how far out.

![The compass, its levels and the maths behind them](../../../../../assets/nolan-chart.png)

How it behaves:

- **The quadrant gives the name, the distance gives the strength** - how far the dot sits from the centre decides whether the result is centre, moderate or extreme, and the quadrant decides what it is moderate or extreme in. "Centre", "moderate green", "extreme green" are the same position at three distances.
- **The title carries the verdict** - the quadrant name sits in the [wrapper](./module-wrapper.md) title, coloured to match the quadrant.
- **It opens into its own axes** - expanding reveals the two [double axis charts](./double-axis-chart.md) the position was built from, so the map can be checked against its numbers.
- **Comparison puts two dots on one map** - a friend appears as a marked position, and the axes below carry the same overlay.

The pair of axes is the author's choice:

- **Economy against worldview** - the asset's example, the classic compass.
- **Liberty against authority** - the original Nolan pairing.
- **Any two axes a quiz scores** - including two candidates, if that is the comparison the author wants to draw.

## Opportunity
- **A position is more memorable than two numbers** - people remember where they stand on a map, and the map is what they screenshot.
- **It is the most recognisable object in political self-testing** - the compass is what most takers arrived expecting.
- **Distance adds a dimension for free** - the same two scores yield a strength as well as a direction, with no extra questions.
- **The maths is small and explainable** - a radius and two thresholds, which the info button can state in one sentence.

## Risk
- **Two axes stand in for everything** - a quiz with ten axes still gets flattened to two, and the two chosen become the identity.
- **The thresholds are arbitrary** - where moderate becomes extreme is a constant we picked, and it decides how many people are told they are extreme.
- **"Extreme" is a loaded word** - a neutral distance measure lands as a judgement about a person.
- **The centre is not neutral** - sitting at the origin can mean balance, indifference or a quiz that failed to place someone, and the dot looks the same in all three cases.
- **Quadrant colours become identities** - a colour that reads as a party is a claim we did not intend to make.
