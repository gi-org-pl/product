# Privacy and legal

> An account can exist. A link between a person and their views cannot.

**Decision:** **⚪ idea**

## Context
Political views are a special category of personal data, and they are the only thing this product collects at scale. Everything else here follows from that.

The rule is a separation, held by design rather than by policy:

- **Identity** - an account: name, e-mail, password, and what a creator owns - their quizzes, their [exports](../modules/quiz/data-harvesting/exports.md). Accounts exist so people can build things, not so we can know who answered what.
- **Views** - answers, results and [demographics](../modules/quiz/data-harvesting/demographics.md). Stored unlinked and processed statistically, whether or not the person answering has an account.

Nothing crosses that line. A registered user's answers are as anonymous as an anonymous user's, and the platform is built so that we could not reconstruct the link if we were asked to.

The legal frame around it:

- **Administrator** - Fundacja Generacja Innowacja, with processing kept inside the European Economic Area.
- **Special categories** - political views, worldview and religious belief, ethnicity, health and sexuality. Collected in anonymous form and used for statistics only.
- **Consent and age** - special-category consent starts at 16, and we do not process personal data below that age, while anonymous use stays open to anyone.
- **No consequential automation** - a result is a mirror, never a decision with legal or comparable effect.
- **Rights** - access, rectification, erasure, restriction and objection, with a route to the supervisory authority. Portability is not offered, because moving special-category data to another processor is the opposite of the promise.
- **Two public documents** - the terms of service and the privacy policy say all of this to users. This doc is the product-side rule they are meant to describe.

Where the boundary gets tested, and has to hold:

- **The results link** - an e-mail given for a saved result must not become an identity attached to answers - see [results saving and marketing](../modules/quiz/questionnaire/results-saving-and-marketing.md).
- **Comparison identifiers** - a result identifier is a bearer key to a set of views, and it is deliberately not a person - see [comparison modes](../modules/quiz/results/comparison/comparision-modes.md).
- **The respondent cookie** - a per-device respondent code is what makes results retrievable, and it is the closest thing to an identifier we hold.
- **Exports and datasets** - the anonymisation boundary has to survive leaving the platform - see [anonymisation](../modules/data/datasets/anonymisation.md) and [publication](../modules/data/datasets/publication.md).
- **[Analytics](./analytics.md) and third-party tags** - measurement scripts run on pages where people are answering political questions.

Security is what makes the separation real rather than stated: access limited to a small group and authorised per interaction, TLS in transit, hashed credentials, regular testing and patching, and hosting with physical controls.

## Opportunity
- **It is why the answers are honest** - people say what they think because nothing they say is attached to them, and the data is only worth having on that condition.
- **The strongest sentence we have** - "we cannot connect your views to you" is a claim almost nobody in this field can make, and it is the same asset as [neutrality](../concept/why.md).
- **No login wall** - anonymous-first means the funnel never asks for an account before the payoff, which is also the growth argument.
- **Publishable data** - discipline about special categories is what allows datasets and reports to exist at all.
- **Checkable, not just promised** - an [open codebase](./open-source-release.md) turns the separation into something a stranger can verify.
- **A stable line for building** - features get designed within the rule instead of arguing about it case by case.

## Risk
- **Every good feature wants the link** - result history, cross-device resume, personalised recommendations and creator analytics all become easy the moment views are attached to accounts, and each one arrives as a reasonable request.
- **Re-identification does not need a name** - demographics plus a narrow date range on a small quiz can single someone out without any identity being stored.
- **The respondent code is a shadow identity** - it survives sessions and ties answers together, and how long it may live is a decision nobody has written down.
- **Third-party tags sit next to special-category answers** - analytics and advertising scripts on the questionnaire are the least defensible thing in the current setup.
- **The published policy is broader than the product** - it contemplates sharing data with partners for advertising audiences, which the [endgame](../concept/endgame.md) rules out entirely. One of the two has to change, and the document is the easier one to fix.
- **Terms that change unilaterally and immediately** - defensible legally, weak for a product whose whole asset is trust.
- **A single breach ends the argument** - political views leaked once cannot be un-leaked, and no later measure repairs the claim.
