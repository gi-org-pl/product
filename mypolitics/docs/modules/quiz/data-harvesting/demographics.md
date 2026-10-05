# Demographics

> The four demographic fields the quiz collects.

**Decision:** **⚪ idea**

## Context
The quiz asks four demographic questions, as dropdowns with fixed option lists:

- **Age** - banded, not a birth date.
- **Gender** - fixed list.
- **Settlement size** - village through to a city over 500k, the closest thing to an urban/rural axis.
- **Education** - highest level completed.

How they behave:

- **Optional** - every field is skippable, and a skipped field is missing data, not a guessed one.
- **Fixed lists, no free text** - answers stay comparable across quizzes and years, and nobody can type anything identifying.
- **Asked once** - stored on the account and reused, so a returning user is not asked again on every quiz.
- **Shown near the end** - they sit with the [post-survey](./post-survey-module.md), after the questions the user actually came for.

The fields travel with the answers into [exports](./exports.md) and into the [data module](../../data/README.md), which decides what can honestly be said with them.

## Opportunity
- **Cross-tabs are where the value is** - views by age, by city size, by education is the analysis nobody else can run on this scale in Poland.
- **Four fields is the minimum that works** - enough to segment on, few enough to not wreck the funnel.
- **Collected once, used everywhere** - the same fields cover every quiz and every post-survey, so answers pool into one dataset.
- **Consistency is what makes history usable** - stable fields mean answers collected years apart can still be compared.

## Risk
- **Every field costs completions** - four dropdowns before the payoff is real friction, and the payoff is the reason people came.
- **Demographics narrow anonymity** - age band, gender, town size and education next to a political result is close to identifying in a small community - see [exports](./exports.md).
- **Self-declared and unverifiable** - people misreport, and our audience skews young regardless.
- **Option lists age badly** - changing education levels or gender options later breaks comparability with everything collected before.
