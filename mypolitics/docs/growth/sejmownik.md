# Sejmownik

> A place to follow the work of the Sejm - bills, votes and members of parliament - and to understand and take part in it; it grows the earlier idea of educational pages and is to become a separate app.

**Decision:** **🟢 GO**

## Context
*what?*

Sejmownik is a working name. It started as the October 2026 idea of educational subpages about members of parliament, politicians and so on, and a team member has since proposed what it grows into: a place within myPolitics to follow the work of the Sejm, its votes and the activity of its members, but above all to understand political processes better and to take part in them. It is meant to be more than an aggregator. The Sejm's public API makes the data convenient to get, and the product must not become a copy of it. The educational intent of the earlier idea stays and is the reason it exists.

Directions in the proposal:

- **Bills and votes** - a transparent legislative process, vote results and the activity of members.
- **Interaction** - a user states their own position on an important vote and compares it with the decisions of members of parliament. The same place can research public opinion on specific bills and regulations.
- **Member profiles** - attendance, votes, interpellations, statements, declarations set against actions, and an analysis of asset declarations. Competitors already do the last on social media.
- **AI and short video** - key moments of sittings, short clips and accessible summaries with context and sources, possibly verifying the hottest statements, which the proposal itself calls risky.
- **Civic education** - interactive explanations, quizzes and simulations of how the Sejm works and how a law is made.
- **Mobile app** - possibly later, with notifications about votes.

An AI-made HTML prototype exists. Its screens: a start page ("Zrozum, co dzieje się w Sejmie"), a bill list and detail (plain-language summary, legislative stage, key dates, related votes, source), a list of members and a profile (activity in the term, recent votes), a vote (overall result and the votes of selected members), citizen polls compared with the Sejm vote, statements in context, debates and video, civic education (the path of a bill, a quiz) and a personal profile (saved bills, followed members, saved votes).

The president decided on 2026-10-20:

- **A separate app later** - it becomes its own app (sejmownik-app); until then it is designed within the myPolitics app file.
- **First design covers the core** - start, bills (list and detail), a vote with the citizen poll and the comparison, members (list and profile), and civic education (the path of a bill and a quiz). It uses example data.
- **Left out for now** - video and AI clips, statements in context (fact-checking), and everything about accounts.

Scope by phase:

| Phase | What |
|---|---|
| Now (first design) | Start, bills list and detail, a vote with the citizen poll and comparison, members list and profile, civic education (path of a bill, quiz) |
| Later | Video and AI clips, statements in context, accounts (saved bills, followed members, saved votes), notifications and a mobile app, asset declaration analysis |

What the documents say that is near it:

- **Education is the stated purpose** - [why](../concept/why.md) says civic education is supposed to close the gap in understanding and does not, and that myPolitics exists to educate through play.
- **Education has a principle** - [principles](../concept/principles.md) name education through play, substance over emotion, and credibility above all.
- **Explanations are planned in the quiz, not written** - [info modals](../modules/quiz/results/info-modals.md), meant to explain what a module measures and how to read it, are themselves an idea with nothing in them yet. What exists is the vocabulary of axes that the [multi axis chart](../modules/quiz/results/modules/multi-axis-chart.md) and [archetypes](../modules/quiz/results/modules/archetype.md) teach.
- **People already appear as orientations** - candidates and parties can be ranked with faces in the [horizontal bar chart](../modules/quiz/results/modules/horizontal-bar-chart.md), and [how](../concept/how.md) describes politicians taking the quizzes and publishing their results.
- **No page about a person or an institution is documented** - there is no module for it.

How this relates to other ideas: [voting records comparison](./voting-records-comparison.md) is about how politicians and clubs voted compared on key topics, and the votes and member profiles here would show the same kind of data. The two are not merged and the overlap is an open question below.

## Opportunity
*why?*

- **It is the mission in its plainest form** - an explanation of how parliament works or who a politician is is education without a quiz around it.
- **It gives the quizzes somewhere to point** - a result that names a party or a candidate could lead to a page that says who they are.
- **It reaches people who do not take quizzes** - an explanatory page can be found by someone who searches for a name.
- **It shares its writing with the quiz** - axis descriptions are the same kind of text, and so will [info modals](../modules/quiz/results/info-modals.md) be once they are written; neither is a stock of content to draw from today.
- **The [media module](../modules/media/README.md) feeds it** - news aggregation could keep such pages linked to what is happening.
- **Opinion on real bills** - the citizen poll set beside the Sejm vote gives people a reason to take a position and to come back with every vote, which a quiz does not.
- **More than the source data** - plain-language summaries, the path of a bill and the quizzes add understanding that the Sejm API alone does not give.
- **A natural audience** - people who take the quizzes already care about politics; a place that shows how their representatives acted is the next step.

## Risk
*why not?*

What the documents say:

- **Neutrality** - [principles](../concept/principles.md) say we hold no position and that the host moderates and does not argue. A page that describes a politician has to be written to that rule, and it is easy to break by what is left out.
- **Real people are a harder case** - the [horizontal bar chart](../modules/quiz/results/modules/horizontal-bar-chart.md) says faces make it personal and that attributing our arithmetic to individuals is where accusations of bias start.
- **Credibility is the only asset that cannot be rebuilt** - [principles](../concept/principles.md) say it has to hold up to hostile reading from every direction.
- **Money near civic education is a risk** - [endgame](../concept/endgame.md) warns that charging near a public good invites the accusation that we sell political conclusions.
- **The country is context** - [internationalisation](../platform/internationalisation.md) says the parties and the people a country argues about do not transfer.

Our reading, not stated in the documents:

- **Facts go stale** - who sits in parliament and in which club changes, so every page has an owner or it becomes wrong.
- **Where facts come from is open** - the idea does not say what the pages are based on, and a page about a person is only as good as its sources.
- **It is a different product** - the quiz is a funnel with a payoff; a library of pages needs navigation, search, an editorial calendar and people to write, which a volunteer team may not have.
- **Scope after the core is not set** - the first design is fixed, but the order and size of the later phases (video, fact-checking, accounts, a mobile app) are not, and they are very different amounts of work.
- **A page can read as endorsement** - choosing whom to write about, and in what order, is itself a statement.

Added by Sejmownik, our reading:

- **Neutrality** - the product shows facts and sources and does not rate members of parliament. No scores, rankings or labels of a person; a comparison is shown as agreement with a specific vote, never as a verdict.
- **Fact-checking and AI clips** - verifying statements and cutting AI clips can be wrong or read as taking a side, and a wrong claim about a named person reaches them directly. This is why both are left out of the first design.
- **Data freshness** - votes and sittings change often, so the data needs an automatic refresh with a visible date, and a stale page is worse than none.
- **Legal use of public data** - the terms of the Sejm API and of any other source, and the handling of members' personal data, have not been checked.
- **Competitors** - civic monitoring projects and social media accounts already cover votes and asset declarations, so a copy of them gives no reason to come.
- **A self-selected poll is not public opinion** - the citizen poll counts only the people who visit and answer, as [community voting](./community-voting.md) says of a shared link, and the myPolitics audience is not the population. The comparison with the Sejm vote must be labelled as responses from Sejmownik participants, never as the opinion of the country, unless a sampling method is defined.
- **Poll answers are political views** - [privacy and legal](../platform/privacy-and-legal.md) and [principles](../concept/principles.md) require views to be stored unlinked from identity. Citizen poll answers, and the saved bills and followed members of the later accounts phase, must stay anonymous and never be tied to a profile or account.
- **A separate product** - an own app needs its own team, hosting and editorial work, which a volunteer team may not have.

## Decision
*why GO/NO-GO?*

**🟢 GO**, for the core scope only. The template has three statuses - GO, NO-GO and idea - and the earlier file was an idea because it had no design and no decision. Now the president has decided to build it, set its scope and start the design (2026-10-20), which is the condition the [growth README](./README.md) names for leaving the parked state. The design is in progress, so the Design line is left out until the frames exist (page "Sejmownik" in the myPolitics app file) and is added then, and this file stays in growth until it has one and is moved under its own app or module. The parts left out above stay ideas and each needs its own decision.

Open questions:

- **Name** - is "Sejmownik" final, or only a working name?
- **Sources** - which data does it use, on which terms, and how often is it refreshed?
- **Voting records** - is this the same work as [voting records comparison](./voting-records-comparison.md), or separate?
- **Link to the quiz** - how does a taker move from a quiz result to a vote, or is there no link?
- **Poll method** - is a poll of participants enough, or is a representative method needed before it is described as public opinion?
- **Neutral wording** - who writes and checks the summaries and the wording of the poll comparison?
- **Later phases** - in what order, and who decides on video, fact-checking and accounts?
