# Quiz migration

> Moving every existing quiz off the old infrastructure, so it can be switched off.

**Decision:** **⚪ idea**

## Context
The old quizzes still run on the old stack. It is expensive to keep up and awkward to manage, and it is the only reason that stack exists - so the goal is not to move quizzes for their own sake, it is to reach the point where the old infrastructure can be turned off.

The conversion is largely mechanical. Our [quiz conversion bot](https://github.com/gi-org-pl/quiz-conversion-bot) reads an old quiz configuration and writes out the new one, so questions, answers, weights and orientations come across without hand work.

What the bot does not do is the results. The old configuration has nothing that maps onto the new [result modules](../modules/quiz/results/modules/README.md), so every migrated quiz still needs its result screen composed by hand - which modules it shows, which orientations they point at, what they are called, and the descriptions that go with them.

That splits the work in two:

- **Automatic** - the questionnaire side of a quiz, produced by the bot in bulk.
- **Manual** - the result side of a quiz, one quiz at a time, by a person who understands what that quiz was measuring.

Open before this can start in earnest:

- **What gets migrated at all** - the old stack holds community quizzes from the 2023 editor as well as ours, and some of them are not worth carrying over.
- **What happens to old results** - links people have shared point at results on the old stack, and turning it off breaks them unless the results move too.
- **Whether old results have to reproduce** - a migrated quiz scored by the new engine may not return the same answer as the old one did for the same answers.

## Opportunity
- **It removes a running cost** - the old stack is money spent every month on something we have already replaced.
- **Only a full migration pays** - one quiz left behind keeps both stacks alive, which is why finishing matters more than starting.
- **Migrated quizzes gain everything new** - checkpoints, comparison, exports and the shareable card apply to old quizzes the moment they land.
- **The bot makes the bulk free** - the expensive part is now only the results, not the whole configuration.
- **One system to operate** - a single codebase to deploy, monitor and hand to a volunteer, instead of two.

## Risk
- **The manual half is the real cost** - configuring result screens is per-quiz work by people we do not have spare, and the bot cannot shorten it.
- **Shared links are a promise** - a result someone posted years ago breaking is a visible failure, in the part of the product that earned us reach.
- **Old and new can disagree** - if the same answers produce a different result, we have to decide which one was right and say so.
- **Bot output still needs review** - a converted quiz that looks fine and scores wrong is worse than one that fails loudly.
- **Migration competes with everything** - it produces no new features, so it is the work that gets postponed while the old bill keeps arriving.
- **Switching off is irreversible** - the old stack is also the only copy of anything that was never migrated.
