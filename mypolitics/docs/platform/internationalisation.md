# Internationalisation

> Every module goes international. The quiz goes first.

**Decision:** **⚪ idea**

## Context
The [endgame](../concept/endgame.md) is the largest international platform for political and psychometric self-awareness. The method behind it is not Polish - only the interface and the question sets are. Internationalisation is the work of separating those two things.

Three layers, and only the first is translation:

- **Interface** - the product's own strings, handled by translation tooling and shipped per language.
- **Content** - questions, orientations, archetypes, descriptions and the copy pools behind [checkpoints](../modules/quiz/questionnaire/checkpoints/checkpoints-random-copy.md) and the [loader](../modules/quiz/results/engaging-loader.md). These are written per language, not translated - a joke about a third reading and a question about the Round Table mean nothing outside Poland.
- **Context** - the parties, candidates and axes a country actually argues about. Nothing here transfers, and nothing here should.

**Quiz goes first**, because it is the only module that does not need local staff. A creator in another country can author a quiz for their own politics on our infrastructure the day the interface speaks their language - see [community quizzes](../modules/quiz/community/README.md). Data follows, since datasets and reports are per market. Polls and Media come last: both depend on local sources, local aggregation and people who read the local press.

What has to change underneath:

- **Language becomes a property of a quiz**, not only of the interface, so a quiz is authored, browsed and scored in one language.
- **Discovery has to be per language** - a Polish quiz surfacing to a Spanish taker is noise, so [quality score](../modules/quiz/community/quality-score.md) and the catalogue need language as a filter.
- **Moderation has to be possible in that language** - the [approval gate](../modules/quiz/community/moderation.md) assumes we can read what we are approving.
- **The legal frame is per market** - EEA rules carry across Europe, everything beyond it needs its own review, and age thresholds differ - see [privacy and legal](./privacy-and-legal.md).
- **Domains and search** - we already run on two domains, and each language needs to be findable on its own terms.

## Opportunity
- **The infrastructure is the thing worth sharing** - the editor, the result modules and the scoring took eight years to build, and a country that wants a political compass currently starts from nothing.
- **Creators bring the content we cannot staff** - the same argument as community quizzes, applied to a whole country. We supply the platform, they supply the politics.
- **It smooths the election cycle** - traffic today rises and falls with Polish elections, and every additional market is another cycle on a different calendar.
- **The non-political side travels furthest** - psychometrics and [myQuizzes](../modules/quiz/myquizzes/README.md) carry across borders far more easily than any political question set, and that is also where the paid tier lives.
- **[Open source](./open-source-release.md) makes it cheap to adopt** - a country can run the stack rather than commission one.
- **One product, many markets** - nothing per-country gets built: language is configuration, not a fork.

## Risk
- **Moderation in a language we cannot read** - the credibility gate is the whole community model, and it does not survive being applied to text nobody on the team understands.
- **Neutrality is culturally specific** - a question that reads as balanced in Poland can read as partisan elsewhere, and we would not know until it does.
- **Content debt multiplies** - every copy pool, description and result text is written again per language, by someone who knows both the language and the politics.
- **A translated question is not the same question** - answers collected in two languages are not automatically comparable, which limits what pooled analysis can honestly say.
- **It splits a team that is already thin** - a second market before the first product is finished is how both get half-built.
- **Legal exposure grows with the map** - special-category data outside the EEA is a different problem in every jurisdiction.
- **The brand fragments** - several domains, several languages and community-authored content in each is a lot of surface for a name whose only asset is trust.
