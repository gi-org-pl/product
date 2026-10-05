# Open-source release

> Publishing every repository, so the product can be checked instead of trusted.

**Decision:** **⚪ idea**

## Context
Everything we build goes public: the application, the API, the scoring, the [quiz schema](../modules/quiz/editor/json-schema.md), the infrastructure that runs it. What stays private is the data and the keys - the database, anything personal, secrets, and the credentials behind them.

The reason is credibility. Our whole claim is that the questions are fair and the numbers are computed honestly, and that claim is unverifiable against a black box. Publishing turns "trust us" into "read it" - see [why](../concept/why.md), where credibility is named as the entire asset.

What has to be settled before anything is pushed:

- **Licence** - permissive or copyleft, and what a commercial fork is allowed to do. This touches the paid direction in [endgame](../concept/endgame.md) and the [myQuizzes](../modules/quiz/myquizzes/business-model.md) business model.
- **History** - old commits can hold secrets or personal data, and publishing history cannot be undone. Either the history is cleaned or the repositories start fresh.
- **Contributions** - source-available first, with outside pull requests accepted later, is a smaller promise than an open contribution process a volunteer team has to staff.
- **What data comes with it** - none by default. Published datasets are a separate track with their own rules - see [publication](../modules/data/datasets/publication.md) and [privacy and legal](./privacy-and-legal.md).

## Opportunity
- **It settles the argument we cannot win with words** - the scoring is the part people suspect, and the only convincing answer is the source.
- **Researchers can audit us** - the [reports](../modules/data/reports/README.md) and datasets carry more weight when the pipeline behind them is inspectable.
- **It recruits** - a volunteer organisation pays in growth and portfolio, and a public repository is where that payment becomes visible - see [how](../concept/how.md).
- **It travels** - the [internationalisation](./internationalisation.md) ambition is far cheaper if another country can run the stack rather than commission one.
- **It forces hygiene** - secrets management, readable code, tests and documentation stop being optional once anyone can look.
- **It matches what we already do** - the schema and the authoring skill are published artefacts already; this is the same principle applied to everything else.

## Risk
- **A biased fork wearing our face** - the code is the easy part to copy, and a lookalike with tuned questions damages the original.
- **Gameable mechanics** - [moderation](../modules/quiz/community/moderation.md) rules and the [quality score](../modules/quiz/community/quality-score.md) work partly because their thresholds are not public.
- **The repository becomes a political surface** - issues and pull requests are public, and a politically charged product attracts pressure that a volunteer team has to moderate.
- **Review is a real cost** - outside contributions need people, and the constraint that created this whole product is that we do not have them.
- **Publishing is irreversible** - a leaked secret or a personal record in an old commit is public the moment it is pushed.
- **Open does not mean trusted** - almost nobody will read the code, and the credibility gain depends on the few who do saying so publicly.
