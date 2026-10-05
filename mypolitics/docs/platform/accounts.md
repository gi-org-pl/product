# Accounts

> What an account unlocks, and what it deliberately never binds.

**Decision:** **⚪ idea**

## Context
An account exists so people can build and own things. It does not exist so we can know who answered what - the separation in [privacy and legal](./privacy-and-legal.md) is the rule this whole doc sits inside.

What an account unlocks:

- **Authoring** - the [editor](../modules/quiz/community/authoring-flow.md), a creator's drafts, and the review state of everything they have submitted.
- **Ownership** - the quizzes someone made, and the [exports](../modules/quiz/community/creator-exports.md) of the data those quizzes collected.
- **Convenience** - [demographics](../modules/quiz/data-harvesting/demographics.md) given once and reused, so a returning taker is not asked on every quiz.
- **Administration** - moderation and the admin-only controls, such as the boost in [quality score](../modules/quiz/community/quality-score.md).

What an account never does:

- **It does not gate taking a quiz** - the questionnaire, the result, the card and comparison all work with no account at all. The funnel never asks for one before the payoff.
- **It does not attach views to a person** - a registered taker's answers are stored exactly as anonymously as anyone else's, and nothing joins the two.
- **It does not become a social graph** - comparison runs on exchanged identifiers, not on finding people by name - see [comparison modes](../modules/quiz/results/comparison/comparision-modes.md).
- **It does not replace the results link** - a saved result arrives by [e-mail](../modules/quiz/questionnaire/results-saving-and-marketing.md), which is how a taker returns to it without registering.

That leaves accounts as a creator and administration feature that a taker may never need, and the asymmetry is deliberate: the people who build carry an identity, the people who answer do not.

## Opportunity
- **It keeps the funnel open** - the highest-drop-off moment in any product is a sign-up wall, and this product does not have one.
- **Creators need identity anyway** - authorship, review state, ownership of data and the right to publish all require a durable account, so the cost lands only on the people getting something back for it.
- **The privacy claim stays simple** - "an account does not connect you to your answers" is a sentence we can hold to, and a sentence a bolted-on login would have ruined.
- **One place for permissions** - creator, admin and reviewer roles all hang off the same object rather than being invented per feature.
- **It scales with the platform** - the more the [community](../modules/quiz/community/README.md) authors, the more the account is worth, without ever touching takers.

## Risk
- **Every feature will ask to cross the line** - result history, cross-device resume, personalised recommendations and creator analytics are all reasonable requests that end with views attached to an identity.
- **Two half-features** - an account that does very little for takers may look broken to people who expect a normal profile.
- **Password and recovery obligations** - the moment accounts exist we own credentials, resets and the support that comes with them, on a volunteer team.
- **Creator identity is exposure** - a public quiz has an author, and in political content an author is a person who can be targeted.
- **An admin account is the highest-value target we have** - moderation, boost and exports sit behind it.
