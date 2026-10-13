# Result chart forms

> Result modules that draw the taker's answers as a parliament, as possible majorities and as seats by topic.

**Decision:** **⚪ idea**

## Context
Raised by the owner in October 2026, with the Spanish political test Objetivo 176 as the inspiration. There is no design and no product documentation for it yet.

What was checked about the source: the test's page says it is an electoral simulator, a technical and educational experiment with no official or predictive value, that it uses no cookies, and that it does not store or send the answers. The result forms themselves are described here from a screenshot of the test on a phone shared in the community. The test's own page builds its content with a script that could not be read, so nothing below was confirmed on the live test.

Three forms are visible in the screenshot:

- **Your chamber** - a hemicycle of the parliament's seats, each dot a seat, coloured by party family, filled according to the taker's answers. A legend lists the seats per family, and a sentence names the largest group and says that no family reaches the majority alone, so negotiation would be needed. Tapping a family shows what it is made of and highlights its seats.
- **Possible majorities** - a few combinations of close families, each a stacked bar of its seats against a line at the majority threshold (176 seats in the original), with the total written beside it. The text says the combinations are drawn only among families that are close to each other: the left can reach a majority only with the liberals, the national conservatives only with the other conservatives.
- **Seats by topic** - one stacked bar per topic with the same distribution of seats for that topic alone, and a control with five steps from "nothing" to "very" that sets how much the topic matters to the taker. Changing the step changes the distribution of the whole chamber.

The idea for myPolitics is to offer such forms as additional [result modules](../modules/quiz/results/modules/README.md), next to the bars and charts that exist, for quizzes where it makes sense to read an answer set as a parliament.

## Opportunity
- **A different kind of result** - every module today is a bar or an arrangement of bars; a hemicycle is the one picture of a political result that a taker already knows from the news.
- **It makes a score concrete** - "no family reaches a majority alone" says more than a percentage on a bar, and needs no vocabulary.
- **The importance control is interactive** - a taker who sets how much a topic matters and watches the chamber move stays on the result screen longer than one who only reads it.
- **It fits the module model** - the author composes the result from modules, so a quiz that wants this form adds it and one that does not is unaffected.
- **It travels** - a hemicycle is a strong image for the [short results card](../modules/quiz/results/short-results-card.md) or a post.

## Risk
What the documents say:

- **Every module is built from one bar** - the [result modules](../modules/quiz/results/modules/README.md) are arrangements of the [universal axis](../modules/quiz/results/modules/universal-axis.md), which is how a new module stays cheap. A hemicycle and a threshold line are not arrangements of that bar.
- **A party match is the sharpest claim we make** - the [short results card](../modules/quiz/results/short-results-card.md) names it as the block most likely to be screenshotted, argued with and attributed to us, and the [horizontal bar chart](../modules/quiz/results/modules/horizontal-bar-chart.md) warns that small gaps look decisive and that a ranking of real parties attributes our arithmetic to them.
- **Grouping is a claim** - the [multi axis chart](../modules/quiz/results/modules/multi-axis-chart.md) says that deciding what belongs under a heading frames the result. Deciding which families are close enough to form a majority together is the same kind of decision.
- **The taker gives no weights today** - weights hang off the answers and are set by the author, see the [answer model](../modules/quiz/questionnaire/answer-model.md). The closest thing the taker controls is choosing the topics that matter in category select, see the [phases model](../modules/quiz/questionnaire/phases-model.md).
- **Mid-quiz readings can steer answers** - the checkpoints docs say that telling people what they are changes what they answer. A chamber that moves while answering would raise the same concern.
- **Nothing is written about seats** - the docs have no mapping from scores to seats, and the file for [election forecasts](../modules/polls/predictions/election-forecasts.md) is still an empty template.
- **The country is context** - [internationalisation](../platform/internationalisation.md) says the parties and axes a country argues about do not transfer.

Our reading, not stated in the documents:

- **A seat count looks like a forecast** - a hemicycle with a majority line invites reading the result as a prediction of an election, which a political self-knowledge quiz does not make. The original carries a disclaimer for exactly this reason, and ours would need one that survives a screenshot.
- **Turning answers into seats needs a method we do not have** - what a seat is, how seats are allotted among families and how the importance step changes them are all open, and the answer decides whether the picture is honest.
- **Our quizzes may not have families** - a quiz whose orientations are axes or archetypes has nothing to colour the seats with, so the form would suit only some quizzes.
- **Comparison and statistics are unspecified** - how a friend's chamber is overlaid, and what the stats and info buttons of the [module wrapper](../modules/quiz/results/modules/module-wrapper.md) say about it, is not obvious.
- **The idea of the original is not ours to copy** - we would take the idea of the forms, not the picture, the wording or the way the original assigns seats.
