# Community voting

> A public question that the community votes on, built to be shared.

**Decision:** **⚪ idea**

## Context
Raised by the owner in October 2026 as "the concept of community voting (viral-maxxing)", with a [question page on cosign.co](https://cosign.co/questions/highest-taste-companies) as the example. There is no design and no product documentation for it yet.

What was seen on that page, and on the site's home page:

- **A question is a title and a ranked list** - the page is a public question, "High taste companies", with a list of answers ordered by rank. The page's data holds 262 answers in total, and the list shown has 52 entries.
- **Each entry has a rank, an image, a name and a "Cosign" control** - the page's data carries a vote count per entry, and the top entry has 39. The rendered list did not show the counts as text when read.
- **Anyone can propose an entry** - an "Add a company" control sits at the top of the list.
- **Two ways out of the page** - "Share on X" and "Download as image".
- **Co-signing is the vote** - the page description speaks of answers and "the attributable cosigns behind them", and the home page describes the site as a professional network where a co-sign is an endorsement of a person or company by someone who knows them, and where lists and rankings are public.

What could not be checked: voting itself was not tried, so it is not known whether voting needs an account, whether the people who voted are shown, how many votes one person may give, how added entries are moderated, or how ties are ordered. The site does not say what makes it spread; that the page offers sharing and an image is what can be seen.

The idea for myPolitics is a public question - for example a ranking of things the community is asked about - that anyone can vote on and that is made to be shared as a link and as an image.

## Opportunity
- **A reason to share that is not a result** - a result is personal, a ranking is a thing to argue over with others.
- **A reason to come back** - a list that moves as people vote gives a returning visit a purpose without an account.
- **Content from the community** - the audience writes the entries, which the product does not have to produce.
- **It fits what spreads** - [how](../concept/how.md) describes growth that is organic and share-driven, and an image of a ranking is a thing to post.
- **A door into the quizzes** - a question page is a place to point to a quiz that answers the same question about the taker.

## Risk
What the documents say:

- **Neutrality** - [principles](../concept/principles.md) say we hand people the canvas of the discussion and stay off it, and that nothing ships that we could not defend publicly. A ranking carrying our name takes a position by what it lists and how it orders.
- **Views are the special category** - [privacy and legal](../platform/privacy-and-legal.md) keep views unlinked from any person. Attributable votes, as on the page above, are the opposite of that rule.
- **An account never gates** - [accounts](../platform/accounts.md) say an account does not gate taking a quiz and does not become a social graph. Voting that needs an account, or shows who voted, would cross both.
- **Community content needs a gate** - [moderation](../modules/quiz/community/moderation.md) says everything published under our name is our credibility and that a gate is what makes opening the editor survivable. Open entries would need one too.
- **A public question is a statement** - the [short results card](../modules/quiz/results/short-results-card.md) docs note that an image circulates without the explanation next to it.

Our reading, not stated in the documents:

- **Votes are not a sample** - a ranking from whoever shared the link is not a poll, and next to our polls and datasets it could read as one.
- **Anonymous voting invites abuse** - without an identity, one person can vote many times, and political topics attract organised voting.
- **Naming people or parties** - entries that are real politicians are a harder case than companies, as the faces of the [horizontal bar chart](../modules/quiz/results/modules/horizontal-bar-chart.md) already show.
- **Who writes the question** - if the community does, we host whatever is asked; if we do, the choice of questions is editorial.
- **We could not see what makes the page spread** - what looks like the mechanism is the two sharing controls, and that is not confirmed.
