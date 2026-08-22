# Post-survey module

> Extra question sets appended after a quiz, to read the current mood.

**Decision:** **⚪ idea**

## Context
A post-survey is a short set of questions shown once a quiz is finished - the para-poll. The quiz measures political values, which move slowly; the post-survey asks about current affairs, which move every week.

- **Technically a quiz** - authored in the [editor](../editor/README.md) with the same schema, only served differently.
- **Attached by the front-end** - the questionnaire ends, and the front-end appends the post-survey as extra questions before the [result screen](../results/README.md) closes the session.
- **Optional** - it is offered, never forced. The user has already finished what they came for.
- **Two payoffs for the taker** - a bit more insight about themselves, and access to how everyone else answered.
- **Rotating** - which set is attached changes over time, so we can always be asking about what is current.

The answers are collected for [myPolitics data](../../data/README.md) - live analysis, internal analysis and reports.

## Opportunity
- **Reach we already have** - a question added today rides on existing quiz traffic and collects thousands of answers with no separate promotion, no panel, no budget.
- **Fresh data on top of stable data** - the quiz says what someone believes, the post-survey says what they think about this month. Joined, that is a dataset nobody else in Poland has.
- **Cheap** - no new product surface. A set is written in the editor and attached.
- **Something back for the taker** - seeing how the country answered is a reason to take the survey, and a reason to come back for the next one.
- **Feeds the credibility layer** - [reports](../../data/reports/README.md) and [analysis](../../data/analysis/README.md) need current data, not just an annual quiz.

## Risk
- **Cost at the finish line** - extra questions sit exactly where the result and the share are, which is the worst possible place to add friction.
- **Our audience is not the population** - a fast, cheap sample is still a skewed one, whatever [demographics](./demographics.md) we attach to it.
- **Wording is the whole game** - current-affairs questions are where neutrality is hardest to hold and easiest to be accused of losing.
- **Consent boundary** - these answers are collected in a different context than the quiz, so they have to sit inside the same anonymisation rules - see [exports](./exports.md).
- **Ragged time series** - rotation means questions come and go; comparing periods only works if the wording stays stable when it is reused.
