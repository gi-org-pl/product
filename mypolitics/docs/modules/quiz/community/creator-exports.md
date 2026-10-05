# Creator exports

> Creators can export the data their own quiz collected.

**Decision:** **⚪ idea**

## Context
A creator can pull the answers their quiz collected as a CSV file, for any period since it went public. The mechanics - format, date range, queueing, retention - are the shared pipeline described in [exports](../data-harvesting/exports.md).

What is specific here is access: a quiz's data can be exported only by its creator and by myPolitics admins. Nobody else, and no creator sees another creator's data.

## Opportunity
- The data is the real payoff for a creator. Hundreds of thousands of answers to questions they wrote is something they cannot get by building a quiz anywhere else - and it is a strong reason to build it here.
- Costs us almost nothing: the answers are already collected, the export is a read on top of [data harvesting](../data-harvesting/README.md).
- Creators who analyse and publish their own results carry the platform outward for us.
- Admins get the same tool for support and [moderation](./moderation.md) checks.

## Risk
- We hand special-category data to people we do not control, and cannot take it back once it is downloaded - the terms a creator accepts matter as much as the export itself.
- A creator can cross-reference their own quiz's rows with the audience they promoted it to, which is a re-identification path we cannot see.
- Ownership gets messy if a quiz is co-authored or handed over - see [authoring flow](./authoring-flow.md).
