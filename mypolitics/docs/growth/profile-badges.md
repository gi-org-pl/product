# Profile badges

> A collectible badge for each completed quiz, shown in the profile and never tied to a result.

**Decision:** **⚪ idea**

## Context
Raised by Oskar Barcz on Discord on 2026-10-06, with [this short](https://youtube.com/shorts/Jm--Uxq4Kd4) as the inspiration. There is no design and no product documentation for it yet.

The idea as proposed:

- **A badge per quiz** - finishing a quiz gives the taker a badge that is visible in their profile.
- **A collection** - badges add up, so a profile shows how many quizzes someone has been through.
- **No result inside** - a badge does not represent the outcome. Only the date it was earned is stored, so that it cannot be linked back to the answers.

It sits between two existing docs. [Gamification](../modules/quiz/questionnaire/gamification.md) rewards the taker inside one quiz; a badge would reward them across quizzes. [Accounts](../platform/accounts.md) are deliberately a creator and administration feature that a taker may never need; a badge would be the first thing an account gives a taker.

Badges are also what [early access rollout](./early-access-rollout.md) would count.

## Opportunity
- **A reason to come back** - today nothing connects one finished quiz to the next one, and a collection does.
- **A reason for a taker to have an account** - it answers the "two half-features" risk in [accounts](../platform/accounts.md), where a profile with nothing in it looks broken.
- **It fits the product we already have** - the reward is attached to finishing, which is the behaviour the whole questionnaire is built to protect.
- **It gives us a returning-user signal** - a count of badges is a way to recognise loyal takers without knowing anything about their views.
- **Cheap to show off** - a badge is shareable in a way a political result often is not.

## Risk
- **It is a record of who took what** - the rule in [privacy and legal](../platform/privacy-and-legal.md) is that an account never connects a person to their views, and a badge ties an identity to a specific quiz at a specific time.
- **A date can be enough to join the two** - an anonymous answer set and a badge created at the same moment can be matched by timing alone, so "only the date is stored" has to mean a coarse date and an award that is not written in the same step as the answers.
- **Taking a quiz can itself be telling** - a badge for a quiz on a sensitive topic says something about its holder even with no result attached.
- **It asks takers to register** - the funnel has no sign-up wall today, and a reward that only exists with an account pulls in the other direction.
- **Public profiles are a new surface** - a visible collection is the start of the social graph that accounts were written to avoid.
- **Collecting can beat answering** - people who click through for the badge make every dataset downstream worse.
