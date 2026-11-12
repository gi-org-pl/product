# Legislative process simulator

> An interactive tool that shows how a law is made in Poland - who can start it, which way it goes and what can stop it - and lets a person play through scenarios instead of reading a diagram.

**Decision:** **⚪ idea**

## Context
*what?*

Raised in the Sejmownik channel on 2026-11-12, while the team discussed the civic education section of [Sejmownik](./sejmownik.md). That section so far explains the legislative process and holds a quiz to be written. The president noted that no one offers an interactive tool for understanding how the system works, and a team member proposed a section on the citizens' legislative initiative: what it is, what it looks like and the next steps.

The official diagram of the process is labelled "simplified" and still spreads into a large tree: who may introduce a bill (15 members of the Sejm, a Sejm committee, the Senate, the President, the Council of Ministers, 100 000 citizens), three readings in the Sejm with committee work, the Senate's 30 days and its amendments or motion to reject, the Sejm voting on the Senate's position, and the President's choice - sign, veto (overturned by a 3/5 majority) or refer the bill to the Constitutional Tribunal - before publication in the Journal of Laws. The design of Sejmownik shows this as a list of expandable elements. It is readable, but a picture cannot show it much better, and software can.

The idea as proposed:

- **The path as a map** - the whole process as an interactive diagram, each step opening an explanation in plain language with the article of the Constitution or the rules behind it.
- **Scenarios** - a person picks a starting point and decisions on the way ("the Senate proposes amendments", "the President vetoes") and follows where the bill goes, including the dead ends where it is rejected.
- **Citizens' legislative initiative** - a path of its own: the committee, collecting 100 000 signatures, the deadlines, and what happens to the bill in the Sejm afterwards.
- **Real bills as examples** - a scenario can replay the path of a real bill from the Sejm data that Sejmownik already uses.
- **Elections next** - the same approach fits other parts of the system people find hard, such as how seats are allocated with the D'Hondt method, which the team raised in the same conversation.

Interactive civics exercises exist in Polish schools, and the team remembers them as the most engaging lessons. The president's view is that they feel official - no animation, colour or illustration, more like an interactive exam - and that this can be done much better.

## Opportunity
*why?*

- **It fills the gap the president named** - the process is taught as a static diagram, and nothing lets a person try it.
- **It is the education Sejmownik exists for** - [Sejmownik](./sejmownik.md) puts civic education and simulations of how a law is made in its core scope, and this makes that part concrete.
- **Education through play** - [principles](../concept/principles.md) name it, and a scenario a person plays through is that principle applied to the system itself.
- **It links to real data** - a bill in Sejmownik can show where it stands on the same map.
- **Room for official support** - a neutral, factual tool about how parliament works could seek the patronage of the Sejm, as the president suggested.
- **Schools** - the same tool fits a civics lesson and the materials for teachers planned in myPolitics.

## Risk
*why not?*

- **Accuracy is the product** - a wrong deadline or majority in a tool about the law is worse than none; every step needs a source and a check by someone who knows the rules.
- **The rules change** - the Constitution changes rarely, but the Sejm's rules and the law on citizens' initiatives can, so the content needs an owner.
- **Neutrality** - scenarios about real bills must describe the procedure, never judge the bill or the people who voted.
- **Scope** - an interactive diagram with scenarios is real design and front-end work, and it competes with the Sejmownik core, which is not finished.
- **Patronage is not given** - official support depends on the Sejm, and the tool must stand on its own without it.

## Decision
*why GO/NO-GO?*

**⚪ idea**. Written down so it is not lost, as the president asked. The team will return to it once the Sejmownik base is finished; until then it needs a design and a decision.

Open questions:

- **Where it lives** - a section of Sejmownik, a page of its own, or a module shared with myPolitics quizzes?
- **Scenarios first** - which paths come first: an ordinary government bill, a citizens' initiative, a veto?
- **Who checks the content** - which expert reviews the steps, deadlines and majorities?
- **Real bills** - is replaying a real bill in scope from the start, or later?
- **Patronage** - is the Sejm's patronage worth seeking, and when?
