# Horizontal bar chart

> A ranked list of orientations, best match first.

**Decision:** **⚪ idea**

## Context
A list of [single axis bars](./universal-axis.md), one per orientation, sorted by score. Each row carries the orientation's avatar or icon, its name, an optional badge, and its bar.

![Ranked lists, flat and grouped](../../../../../assets/horizontal-bar-chart.png)

How it behaves:

- **Ranked, and cut short** - the top few rows show by default, and a chevron opens the rest, because a list of twenty is a table, not a result.
- **Badges qualify a row** - a verified mark or an "official" label sits next to the name, so an authoritative entry is distinguishable from a derived one.
- **Grouping is optional** - the same list can be broken by category, where each category collapses to the orientation that won it and opens into its own ranking.
- **Comparison sits on each row** - a friend's score is hatched onto the same bars.

Any set of orientations can be ranked this way:

- **Candidates** - the asset's example, ranked by match, with faces and party colours.
- **Parties** - the same list at party level.
- **Archetypes** - the ranking behind the [archetype module](./archetype.md).
- **Ideologies or traits** - anything scored, when the interesting thing is the order rather than the axis.

## Opportunity
- **Rank is the most legible finding there is** - "who is closest to me" needs no explanation at all.
- **It carries an election quiz on its own** - candidates ranked with faces is the entire product for that use case.
- **Grouping without a new module** - by category or flat is a configuration, not a second chart.
- **It degrades gracefully** - three orientations or thirty both look intentional.

## Risk
- **The top row becomes the result** - whatever leads is what gets quoted, no matter how close the second is.
- **Small gaps look decisive** - 90% against 85% is a photo finish drawn as a clear win.
- **Faces make it personal** - a ranked list of real people attributes our arithmetic to individuals, which is where accusations of bias start.
- **The cut hides the tail** - orientations below the fold effectively do not exist, and the author chooses where the fold is.
- **Badges carry authority we grant** - marking one entry official implies the others are not, which is a claim about people outside the product.
