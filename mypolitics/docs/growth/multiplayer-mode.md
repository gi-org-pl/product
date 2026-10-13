# Multiplayer mode

> Taking a quiz together - a group led by a host, or two people - instead of alone.

**Decision:** **⚪ idea**

## Context
Raised by the owner in October 2026 as taking myPolitics in a multiplayer form, like in Kahoot, or one on one. There is no design and no product documentation for it yet.

Two shapes are meant:

- **A group session** - a host opens a session, and everyone who joins answers the same questions at the same time. In Kahoot, the form this is modelled on, the host shows the question on a shared screen, players join from their own devices with a code, and the host moves everyone on together.
- **A session of two** - two people take a quiz together, at the same time, instead of one after the other.

What the documents say that is near it:

- **Comparison exists, after the fact** - [comparison modes](../modules/quiz/results/comparison/comparision-modes.md) lets two takers compare by exchanging result identifiers: each takes the quiz alone, copies their identifier, and pastes the other's. Nothing is looked up by name and nobody is searchable.
- **The comparison shows a score and the answers** - [agreement info](../modules/quiz/results/comparison/agreement-info.md), [results comparison](../modules/quiz/results/comparison/results-comparision.md) and [answers comparison](../modules/quiz/results/comparison/answers-comparision.md).
- **A taker never needs an account** - [accounts](../platform/accounts.md) say an account does not gate taking a quiz and does not become a social graph.
- **The session is private to the tab** - [session and data](../modules/quiz/questionnaire/session-and-data.md) say a session lives in one browser tab, nothing is sent until the end, and it is not shared with another browser or device.
- **A quiz is long** - [gamification](../modules/quiz/questionnaire/gamification.md) says a political quiz worth taking needs 50 to 100 questions.

## Opportunity
- **Comparison is the social half of the product** - [comparison modes](../modules/quiz/results/comparison/comparision-modes.md) says "am I more X than you" is why results get shared, and doing it together puts that question at the centre.
- **It fits a room** - a classroom, a club or a meeting with a host is a setting where a group answer is the point, and where the product has no presence now.
- **It removes the pasting** - the identifier exchange is a step people must do on their own, and a shared session would do it for them.
- **It brings people in by being asked** - a join code is an invitation that does not rely on a post.

## Risk
What the documents say:

- **Nothing is sent while answering** - [session and data](../modules/quiz/questionnaire/session-and-data.md) say not one answer leaves the browser until the end. A shared session needs each device to tell something to the host or the other player while answering, which is the opposite.
- **The session ends with the tab and has no resume** - a live group depends on people staying connected, and the docs list a dropped tab and no resume elsewhere as known risks.
- **Views must stay unlinked from a person** - [privacy and legal](../platform/privacy-and-legal.md) keep identity and views apart. A room where answers sit next to a name or nickname puts them together, at least for its length.
- **No social graph** - [accounts](../platform/accounts.md) and [comparison modes](../modules/quiz/results/comparison/comparision-modes.md) are built so nobody finds people by name.
- **A friend's result is someone else's data** - the comparison docs note that no consent flow made it explicit that it is shown to a second person, and a group would show it to many.
- **An identifier is a bearer token** - whoever holds it sees the result.
- **Age** - [privacy and legal](../platform/privacy-and-legal.md) say consent for special-category data starts at 16 and that we do not process personal data below that age, while anonymous use stays open to anyone.
- **Telling people what they are changes the answers** - the checkpoint docs say so, and a group watching each other's answers is a stronger version of it.

Our reading, not stated in the documents:

- **There is no right answer** - the Kahoot form rests on scoring, speed and a leaderboard, and a political quiz has none of them. What a session ends with has to be something else, and it is not decided.
- **Time pressure fits badly** - a shared pace for 50 to 100 questions, or a shorter quiz for the form, changes what the quiz measures.
- **The host sees too much or too little** - a group result is only safe if it is an aggregate that cannot be traced to one person, and a small room makes that hard.
- **A room can be pressure** - answering political questions next to a teacher, a boss or a friend is not the same as answering alone, and honest answers are what the dataset is for.
- **Two shapes may be two products** - a host-led room and a pair need different things, and the idea does not say which comes first.
