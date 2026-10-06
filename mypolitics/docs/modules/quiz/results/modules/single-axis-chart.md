# Single axis chart

> One orientation, one bar, one number.

**Decision:** **⚪ idea**

Design: [Figma](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5508-22154)

## Context
The simplest module there is: a [bar](./universal-axis.md) filled from zero to the orientation's score, with the orientation named in the title.

![Single axis states and examples](../../../../../assets/single-axis-chart.png)

How it behaves:

- **The title is the orientation** - name, icon and colour, so the card identifies itself before the bar is read.
- **Zero to one hundred** - the scale is absolute, not a contest with anything else on screen.
- **Empty is a state** - an orientation with no answers behind it shows an empty track rather than nothing at all.
- **Comparison marks the same bar** - a friend's score appears as a hatched band and their avatar on the track.

Any orientation works, because every orientation is just an entity with points:

- **Radicalism** in an ideology quiz - how strongly the answers lean that way.
- **A party or a candidate** - the match between the taker and that programme.
- **An archetype** - the same number the [archetype module](./archetype.md) shows at the top of its ranking.
- **A trait** - how close the taker sits to a trait they did not fully earn.

## Opportunity
- **Nothing to explain** - one bar, one label; it is the module that needs the least help from the info button.
- **It fits anywhere** - narrow enough for a checkpoint card, a result column or a downloadable image.
- **It is the fallback** - any quiz, however thin its configuration, can still show one of these.
- **Absolute numbers are honest** - a low score stays low instead of looking large because its neighbours are smaller.

## Risk
- **A number without a reference means little** - 40% of an orientation invites the question "compared with what", and the module cannot answer it alone.
- **Standing alone exaggerates** - one orientation on its own card looks like a finding, even when it was the least interesting one scored.
- **Empty tracks look broken** - an orientation the quiz never asked about reads as a failure rather than as an absence.
