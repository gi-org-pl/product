# Voting records comparison

> How politicians and parliamentary clubs voted, compared on key topics.

**Decision:** **⚪ idea**

## Context
Raised by the owner in October 2026 as obtaining data on the votes of politicians and parliamentary clubs, and comparing their agreement on key topics. There is no design and no product documentation for it yet, and no source of the data has been chosen.

The idea as proposed:

- **Data on votes** - how each politician and each club voted on a set of matters in parliament.
- **Agreement between them** - how often two politicians or two clubs voted the same way, counted on key topics rather than on everything.

What the documents say that is near it:

- **Agreement is already a number** - [agreement info](../modules/quiz/results/comparison/agreement-info.md) shows one score for how much a taker and a friend or an orientation agree, and [comparison modes](../modules/quiz/results/comparison/comparision-modes.md) lets the taker compare with a party or a candidate.
- **Parties and candidates are orientations** - the [result modules](../modules/quiz/results/modules/README.md) draw them with scores that the quiz author configures. A voting record would be a second kind of evidence about the same parties.
- **Data and news are modules** - the [data module](../modules/data/README.md) covers publishing and analysis, and [news to data](../modules/media/linking/news-to-data.md) is a planned link, still an empty template.
- **The external sources are not documented** - the file on [poll sources](../modules/polls/aggregation/sources.md) is an empty template, so there is no rule for how an outside data source is chosen, licensed or refreshed.

Possible sources, as examples that were not checked: the parliament's own published voting records, and civic monitoring projects that republish them. Whether either is complete, current or free to reuse is not known.

The idea is related to the one about educational pages on members of parliament and politicians, since a page about a person could show how they voted. That idea is in a separate proposal, and the two are not linked here.

## Opportunity
- **Evidence instead of declaration** - a quiz result says what a party claims or what an author decided it stands for; a voting record is what it did.
- **A new use of the comparison** - the agreement score and the comparison view could be applied to something real, with a taker able to ask which club voted most like them.
- **A reason to return after an election** - the records change with every session of parliament, which a quiz does not.
- **It extends the data** - [news to data](../modules/media/linking/news-to-data.md) calls tying outside facts to our datasets the differentiator, and votes would be one more such fact.

## Risk
What the documents say:

- **A single percentage flattens everything** - [agreement info](../modules/quiz/results/comparison/agreement-info.md) says two people can agree in 95% and still differ on the only question either cares about.
- **A scoreboard reading** - [comparison modes](../modules/quiz/results/comparison/comparision-modes.md) warns that "95% progressive" becomes a label, not a comparison.
- **Real people are a hard case** - the [horizontal bar chart](../modules/quiz/results/modules/horizontal-bar-chart.md) says attributing our arithmetic to individuals is where accusations of bias start.
- **Credibility and neutrality** - [principles](../concept/principles.md) say nothing ships that we could not defend publicly, and that we hold no position.
- **The country is context** - [internationalisation](../platform/internationalisation.md) says the parties and the people a country argues about do not transfer.
- **No rule for external data** - the [poll sources](../modules/polls/aggregation/sources.md) file that would hold one is empty.

Our reading, not stated in the documents:

- **"Key topics" is an editorial choice** - who picks the matters and how they are grouped decides the result, and the grouping is itself a claim.
- **A vote is not a view** - a club may vote with its leadership against some members' opinion, absence and abstention mean different things, and a bill can carry several topics at once.
- **Matching a vote to a quiz axis needs a method** - the quiz measures orientations and a vote concerns a specific bill. Joining them is where most of the work and most of the risk sit.
- **Data may be incomplete or have terms** - if a source has gaps, limits reuse or changes format, the comparison is only as good as it is.
- **It touches the neutrality of a named person** - a statement about how someone voted is checkable, and a wrong one reaches them directly.
