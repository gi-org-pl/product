# Quality score

> The ranking that decides which community quizzes get shown.

**Decision:** **⚪ idea**

## Context
One score per quiz, combining:
- **Volume** - completed questionnaires.
- **Completion rate** - finished / started, a proxy for too long, too boring, or broken.
- **Rating** - average [post-quiz rating](./quiz-rating.md).
- **Recency** - publication date, decaying with age.
- **Boost** - a manual multiplier set by admins only.

Volume, completion rate and rating say how good a quiz is; recency says how much benefit of the doubt it still gets. A freshly approved quiz has no volume and no ratings, so without a recency head start it would never be shown and would never earn either. That head start fades as the other three inputs gather enough data to stand on their own.

Boost is the manual override on top of all that. Admins set it on a quiz we want featured - a strong quiz nobody has found yet, something tied to an election or a news cycle, a creator worth backing. It is editable by admins only, never by the creator, and it can be set below 1 to bury something we cannot remove but do not want to promote.

The score orders [discovery](./discovery.md) and the [follow-up recommendation](../results/follow-up-recommendation.md).

### Proposed calculation
Each input is normalised to a 0-1 spectrum first, so they can be weighed against each other.

| Input | 0 means | 1 means | Spectrum |
|---|---|---|---|
| Volume | nobody took it | 1 000+ completions | completions / 1 000, capped at 1 |
| Completion rate | nobody finishes | everybody finishes | finished / started |
| Rating | average score 0 | average score 10 | average [rating](./quiz-rating.md) / 10 |
| Recency | 30 days old or older | approved today | 1 - days since approval / 30 |
| Boost | - | - | admin multiplier, 1 by default, 0.5 to 2 |

Then:

**score = (0.3 x volume + 0.3 x completion rate + 0.3 x rating + 0.1 x recency) x boost x 100**

Two rules keep it honest:
- Below 50 completions a quiz has no meaningful completion rate or rating, so it borrows the platform average for both until it gets there.
- Recency counts from the first approval, not from the latest edit - see [authoring flow](./authoring-flow.md).

Examples:

| Quiz | Volume | Completion | Rating | Recency | Score |
|---|---|---|---|---|---|
| Approved today, no data | 0.00 | 0.60 | 0.70 | 1.00 | **49** |
| Established, weak (3.5/10, 35% finish) | 0.70 | 0.35 | 0.35 | 0.00 | **42** |
| Established, strong (8.5/10, 70% finish) | 0.70 | 0.70 | 0.85 | 0.00 | **68** |

A new quiz opens level with a weak established one and has a month to prove it deserves more.

## Opportunity
- Catalog quality stops depending on manual curation: [moderation](./moderation.md) decides what is allowed, the score decides what is good.
- Volume and completion rate come from data the quiz already collects - see [data harvesting](../data-harvesting/README.md).
- Aligns creator incentives with what the questionnaire needs anyway: clearer, better-paced, finishable quizzes.
- Recency keeps the catalog alive: new quizzes get a real first audience, and a creator's launch is worth something without us promoting it by hand.
- Boost is the editorial escape hatch: the score is automatic by default, but we can still feature something on judgement without hand-building a separate promo surface.

## Risk
- Rich-get-richer: established quizzes accumulate volume and new ones never get impressions. Recency is the counterweight, but the 30-day window decides whether it actually works.
- Recency cuts both ways: too strong and the catalog churns, burying good evergreen quizzes; too weak and it changes nothing.
- A fresh publication date is farmable by republishing the same quiz as new.
- Completion rate penalises deliberately long quizzes that are genuinely valuable - "+500 questions" would score badly.
- Gameable by a creator with their own audience.
- Opaque ranking of political content invites accusations of bias; we have to be able to explain any placement - and a hidden manual boost is exactly what an accusation of bias looks like.
- Boost is the one input that is pure judgement, so it needs an audit trail: who set it, when, why, and when it expires.
- Every number above is a guess until we have live data - the weights, the 1 000-completion cap and the 30-day window all need retuning once the catalog is real.
