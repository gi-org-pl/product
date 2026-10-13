# Live results preview

> The taker watches the compass and the results change while they are still filling in the questionnaire.

**Decision:** **⚪ idea**

## Context
Raised by the owner in October 2026 as watching the changes in the compass and in the results already at the stage of filling in the questionnaire, as in the myPolitics Lab features. There is no design and no product documentation for it yet.

What the documents say about "myPolitics Lab": nothing. The name does not appear anywhere in the product documentation, so what those features are, and how they behave, is not known from the documents and is not described here.

What the documents say about what a taker sees while answering:

- **Checkpoints are the partial results** - [checkpoints](../modules/quiz/questionnaire/checkpoints/README.md) are cards between questions that tell the taker something true about themselves before the quiz is over, rendered with the same charts as the result.
- **They are rationed** - the [event model](../modules/quiz/questionnaire/checkpoints/event-model.md) recomputes a running state after every answer, fires a card only when the number behind it is stable, picks one card at a time, and applies a minimum gap and a cap per quiz. A card that cannot be shown now is dropped.
- **The compass already moves** - the [Nolan chart path](../modules/quiz/questionnaire/checkpoints/nolan-chart-path.md) draws a trail across the compass from where the taker started to where they are now.
- **The running picture is local** - [session and data](../modules/quiz/questionnaire/session-and-data.md) say it is worked out in the browser from the answers so far, is an estimate and never the result, and is never sent. Nothing leaves the browser until the end.
- **The taker can switch it off** - every card offers turning checkpoints off.

The idea as proposed: show a running view - the compass, and possibly the result modules - that updates with each answer, instead of a card now and then.

## Opportunity
- **The reward comes closer** - [gamification](../modules/quiz/questionnaire/gamification.md) bets that the reward has to feel closer with every question, and a view that moves with each answer is the strongest form of that.
- **It uses what exists** - the running state is already computed after every answer, and the charts already exist.
- **It teaches the compass** - a taker who sees a dot move after an answer learns what the answers do.
- **It could carry a long quiz** - the docs say a quiz needs 50 to 100 questions to be defensible, and a payoff throughout is what makes that bearable.

## Risk
What the documents say:

- **Seeing a reading changes the answers** - the docs say so in several places: [axis closeness](../modules/quiz/questionnaire/checkpoints/axis-closeness.md) says telling someone what they are invites them to answer consistently with the label instead of honestly, and calls it a data quality problem; [new trait](../modules/quiz/questionnaire/checkpoints/new-trait.md) and [gamification](../modules/quiz/questionnaire/gamification.md) say the same, and [stats chart](../modules/quiz/questionnaire/checkpoints/stats-chart.md) says showing the majority mid-quiz pulls later answers towards the crowd.
- **An early reading can be overturned** - a card at question 11 against a different final result makes us look wrong, which is why checkpoints wait for stability.
- **A movement can be noise** - the [Nolan chart path](../modules/quiz/questionnaire/checkpoints/nolan-chart-path.md) docs say that early in a quiz the position swings because there is almost no data, and that calling it a journey is a claim the numbers do not support.
- **Paying early can end the visit** - [gamification](../modules/quiz/questionnaire/gamification.md) warns that a taker given a piece of the result may decide they have enough.
- **The browser and the server can disagree** - [session and data](../modules/quiz/questionnaire/session-and-data.md) says the running picture and the final result are separate calculations.
- **Every reward is an interruption** - the docs ration cards for the sake of the flow.

Our reading, not stated in the documents:

- **The idea is the opposite of the current rationing** - checkpoints are built to say little and rarely, and a live view says everything all the time. The rules in the event model would have to be set aside, not extended.
- **It can turn the quiz into a game of steering** - a taker who sees the compass move can aim for a result, and the dataset the whole product depends on loses its honesty.
- **A fix could be a separate mode** - an opt-in view, with answers marked as given while watching, could keep the default quiz as it is, but that is a design question the docs do not touch.
- **We do not know what the Lab features do** - if they are an experiment with exactly this, what it taught is the most useful input and is not in the documents.
