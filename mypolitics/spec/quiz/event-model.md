# Event model

> Technical specification of the running state the questionnaire keeps while a quiz is taken, and of the engine that decides which checkpoint card, if any, appears between two questions.

Docs: [Event model](../../docs/modules/quiz/questionnaire/checkpoints/event-model.md).

## Kind
Front-end

## Scope
Logic with no screen of its own, in two parts.

- **The running state** - what the taker's answers add up to so far: points per orientation, the value of every axis, the ranking of named positions, the traits unlocked, the position on the compass and the quadrants it has been in, progress and time. It is recomputed after every answer, skip and step back, on the taker's device.
- **The engine** - asked once at every boundary between two questions, it answers with one card or with nothing. It runs trigger, confidence gate, selection and pacing, remembers what it has shown, and stops for good when the taker turns checkpoints off.

The running state is an approximation of the final result and is never sent anywhere. The final result is still calculated by the back-end after the answers are submitted.

Not covered here:

- **The frame a card is drawn in, its two buttons and how it sits in the screen** - [checkpoints](./checkpoints.md).
- **The wording of a card** - [random copy](./checkpoints-random-copy.md).
- **What each card draws, and anything a single card decides for itself** - the card specs: [halfway through](./halfway-through.md), [axis closeness](./axis-closeness.md), [new trait](./new-trait.md), [single axis puzzle](./single-axis-puzzle.md), [Nolan chart path](./nolan-chart-path.md), [double axis puzzle](./double-axis-puzzle.md) and [stats chart](./stats-chart.md). This spec fixes when each may fire; they must agree with the table under "Card types".
- **The session** - which questions are asked and in what order, how an answer, a skip, a step back and a reset are recorded, what survives a refresh, and where the seed comes from: [session and data](./session-and-data.md). **When the engine is asked, and what the screen does with its answer** - the [phases model](./phases-model.md). This spec only reads the session.
- **How an orientation is read from the API** - [universal orientation](./universal-orientation.md).
- **Where answer aggregates come from** - the [stats chart](./stats-chart.md). The engine takes them as an input that may be missing.
- **Two-beat events** - a guessing card that schedules its own follow-up a few questions later. **Not built.** Both puzzles reveal on their own card, so no event ever schedules another.
- **Per-quiz switches** - there are none. Every card type is on in every quiz that has the data for it.
- **Categories visited** - the doc lists it under coverage. No card uses it, so the state does not hold it.

## Data

### What the running state is computed from
| Input | Data | Meaning | Rules |
|---|---|---|---|
| Questions | The quiz's questions in the order the questionnaire asks them, each with its category and its possible answers | What can be answered | From the survey, read once |
| Possible answer | A weight and a list of orientations | What choosing it supports, and how strongly | The weight is a positive number. One weight for every orientation on the list |
| Categories | Each with a weight | How much an answer counts when the taker prioritised the category | From the survey |
| Prioritised categories | The topics the taker chose before the first question | Which categories get their weight applied | May be empty |
| Done questions | For every question the taker has passed, in order: the chosen answer, or a skip | The session so far | From the session. A step back removes the last one |
| Axes | Each with a kind, and a positive and a negative list of orientations | The pairs and the compass the quiz defines | From the survey |
| Orientations | The quiz's orientations, as [universal orientation](./universal-orientation.md) reads them | Names, types, hidden marks | From the survey |
| Trait list | The orientations the quiz uses as traits | What the new trait card can announce | Quiz configuration. No source exists today, so the list is empty in every quiz - see "What the survey gives today" |
| Time samples | For every done question, the seconds between its appearance and the answer or skip | The taker's own pace | Kept beside the state, not derived from the answers |
| Survey average | The quiz's average finish time, in minutes for the whole quiz | Fallback for the time estimate | From the survey. May be missing |

Everything except the time samples is derived: the same survey, the same prioritised categories and the same done questions always give the same running state. Nothing in it is stored on its own, so a refresh rebuilds it from the answers the session kept.

### Words
| Word | Means |
|---|---|
| Done | A question the taker answered or skipped |
| Answered | A done question that has an answer. A skip is done and not answered |
| Left | The questions not done yet |
| Boundary | The moment after a question is done and before the next one appears. Boundary *n* is the one after the *n*-th done question |
| Feeds | A question feeds an orientation when at least one of its possible answers lists it. It feeds an axis when it feeds any orientation of the axis |
| Multiplier | The weight of the question's category when the taker prioritised that category, otherwise 1 |
| Points | What the taker's answers gave an orientation so far |
| Maximum | The most the done questions could have given that orientation |
| Value | Points as a share of the maximum, 0 to 100. Absent when the maximum is zero |
| Standing trigger | A condition over the state that stays true once reached, and is looked at again at every boundary |
| Moment trigger | A condition tied to one boundary. When that boundary passes, it is gone |

### Scores
Per orientation the state holds points, maximum and value. The arithmetic is the back-end calculator's (algorithm `mp-qu-2025-1.0.1`), applied to the done questions only:

> points = sum over answered questions whose chosen answer lists the orientation of (the chosen answer's weight x the multiplier)
>
> maximum = sum over done questions that feed the orientation of (the highest weight among the possible answers that list it x the multiplier)
>
> value = points / maximum x 100

The back-end sums the maximum over every question of the quiz. The running state sums it over the done questions only, because a question the taker has not seen cannot count against them yet. Once every question is done the two are the same numbers.

### Axes
An axis of kind `axis` takes part in cards. Each side of it has a value:

> side value = sum of the side's points / sum of the side's maximums x 100

| Kind of axis | Condition | Used by |
|---|---|---|
| Two-sided | One orientation on the negative side and one on the positive side, and at least one question of the quiz feeds each | Axis closeness (double), single axis puzzle |
| Single-orientation | One orientation that some question feeds on one side, and on the other side nothing, or one orientation that no question feeds | Axis closeness (single), about the orientation that is fed |
| Not used for cards | Any side with more than one orientation; a hidden or nameless orientation on a side; the same orientation on both sides; no orientation that a question feeds | Nothing |

The negative side is the start of the bar and the positive side is its end, as the [double axis chart](./double-axis-chart.md) names them. The two side values are independent and are never made to add up to a hundred.

The **lean** of an axis is a number of points, taken from the exact values:

| Kind | Lean |
|---|---|
| Two-sided | The higher side value minus the lower one. The **leading side** is the higher one. Without both values there is no lean |
| Single-orientation | The value minus 50 |

The state also holds, per axis, the number of answered questions that feed it.

### Named positions
The positions the double axis puzzle offers are the quiz's orientations of type identity that are not hidden and have a name. The **match** of a position is its value. The state holds them ranked by match, highest first, equal matches in the quiz's order.

### Traits
A trait from the trait list is **unlocked** when all three hold:

- every question of the quiz that feeds it is answered - none is left and none was skipped,
- in each of them the chosen answer lists the trait,
- in each of them the chosen answer carries the highest weight the question has for the trait.

That is the same as the trait's points being equal to the most it can score in the whole quiz, so a trait unlocked mid-quiz is a trait in the final result. The state holds the unlocked traits in the quiz's order.

### Compass
A quiz has a compass when its axes include one of kind `compass_x_axis` and one of kind `compass_y_axis`, and each of the two has at least one orientation on its negative side and one on its positive side. A compass axis may have several orientations on a side; the side has one value, as above.

> coordinate = (positive side value - negative side value) / 100

This is the coordinate of the [Nolan chart](./nolan-chart.md): the negative side is the start pole at -1, the positive side the end pole at 1, the horizontal axis runs left to right and the vertical axis bottom to top. The quadrant is given by the two signs, and a coordinate of exactly zero counts toward the end pole. The level - centre, moderate or extreme - is the Nolan chart's too, by the distance from the centre.

A **position** exists once all four side values exist. Before that the taker has no position, which is not the same as standing in the centre.

The state holds a **trail**: one position for every answered question, in order, from the first one that has a position. A skip adds no position. A quadrant is **visited** when at least one position of the trail lies in it at the moderate or the extreme level; a position at the centre level is on the trail and visits nothing. **Quadrants visited** is the list of visited quadrants, in the order they were first visited. These are the definitions the [Nolan chart path](./nolan-chart-path.md) card draws from.

### Progress and time
| Value | Definition |
|---|---|
| All | The number of questions in the session |
| Done, answered, skipped, left | Counts, as defined under Words |
| Share done | Done / all |
| Midpoint boundary | The first boundary at which the share done is one half or more |
| Timed questions | The done questions that have a time sample |
| Average pace | The mean of the time samples, each counted as 60 seconds at most |
| Time left | Left x average pace, in minutes, rounded up to a whole minute, never below 1 |
| Time left, fewer than 5 timed questions | Survey average x (left / all), rounded up to a whole minute, never below 1 |
| Time left, fewer than 5 timed questions and no survey average | None. Nothing is invented in its place |

A time sample covers the time a question is on screen. The time a card is on screen belongs to no question.

### What the survey gives today
Checked against the identity quiz as the survey API sends it (102 questions, 58 orientations, 18 axes, 5 categories).

| Need | Where it is read from | Today |
|---|---|---|
| Points and maximum | `questions[].possibleAnswers[].weight` and `.orientationIds`, `questions[].categoryId` | Derivable. Weights in the sample are 1, 2, 3, 4 and 6; every question has 3 to 5 possible answers |
| Multiplier | `categories[].weight`, and the topics the taker chose | Derivable. 1.25 for each of the five categories of the sample |
| Two-sided axes | `axis[]` with `type` `axis`, `positiveOrientations`, `negativeOrientations` | Derivable. 15 in the sample |
| Single-orientation axes | The same, with one side empty or fed by no question | Derivable. One in the sample: "Decentralizacja-Centralizacja", where no question feeds "Centralizacja". No axis of the sample is defined with one side only |
| Compass | `axis[]` with `type` `compass_x_axis` and `compass_y_axis` | Position, trail and quadrants visited are derivable. The names and colours of the quadrants and the name of the centre are not: the API has no field for them |
| Named positions | `orientations[]` with `type` `IDENTITY` | Derivable by type: 15 in the sample. The API has no mark for "archetype", so the type stands in for it |
| Traits | Nothing | Not derivable. There is no orientation type for a trait and no field that marks one, so the trait list is empty and no trait is ever unlocked |
| Answer aggregates | Nothing | Not available. No endpoint returns how takers answered a question |
| Survey average | `averageFinishTime` | Present: 15 in the sample, read as minutes |
| An answer on a range | Nothing | Does not exist. The API carries one chosen answer per question, so every answer is a choice among possible answers |
| Parties | `orientations[]` with `type` `PARTY` | No answer feeds a party; they are tied to identities through `linkedOrientations`. The engine does not use them |

A mark for traits is asked of the back-end as a field of its own, as [universal orientation](./universal-orientation.md) requires for every property the API does not send. Until it exists the new trait card is built and tested with a trait list passed in, and never appears in a real quiz.

### What the engine remembers
| Entity | Data | Meaning | Rules |
|---|---|---|---|
| Cards shown | For each: the type, the variant, what it was about (an axis, a trait, a position, a question), the boundary it appeared at, the values it showed, and the wording it drew | The only memory the engine has | Written the moment a card is put on screen. Kept with the session, in the checkpoint record of [session and data](./session-and-data.md), together with the time samples. A reset starts a new session with an empty record |
| Opt-out | Yes or no | Whether the taker turned checkpoints off | Kept with the session. Carried over by a reset |

The engine keeps no queue and no list of triggers that fired. A step back never removes a card from the list.

## Interface
| Direction | Name | Shape | Notes |
|---|---|---|---|
| In | Survey | Questions, possible answers, categories, axes, orientations, average finish time | Read once per quiz |
| In | Session | Done questions in order, prioritised categories, seed | Read at every boundary |
| In | Trait list | Orientation identifiers | Optional. Empty today |
| In | Answer aggregates | For a question: how many takers chose each side, and how many answers there are | Optional. Used only if already loaded when the question is answered |
| In | Question shown, question done | Two signals with a time | For the time samples |
| Out | Running state | Everything under Data | For the engine, and for a card that needs a value |
| Out | Card for this boundary | One card, or nothing | Asked once per boundary. The answer is immediate |
| Out | Card | Type, variant, subject, the values it shows as they stood at the boundary, and its wording | Frozen when it fires. A card does not change with later answers |
| In | Card shown | The card that was put on screen | Adds it to the cards shown |
| In | Opt-out | A signal with no payload | From the card frame's second button |
| Out | Seeded draw | A choice from a list, for a named purpose | For the wording, and for any card that needs chance - the distractors and the order of options in a puzzle |

## Behaviour

### What one question adds
A question in a category the taker did not prioritise, with four possible answers:

| Possible answer | Weight | Orientations |
|---|---|---|
| A1 | 2 | X, Y |
| A2 | 1 | X |
| A3 | 2 | Z |
| A4 | 4 | Z |

The highest weight per orientation is 2 for X, 2 for Y and 4 for Z.

| Case | X | Y | Z |
|---|---|---|---|
| The taker chooses A1 | 2 of 2 | 2 of 2 | 0 of 4 |
| The taker chooses A2 | 1 of 2 | 0 of 2 | 0 of 4 |
| The taker chooses A4 | 0 of 2 | 0 of 2 | 4 of 4 |
| The taker skips the question | 0 of 2 | 0 of 2 | 0 of 4 |
| The question is not done yet | nothing | nothing | nothing |
| The category is prioritised with weight 1.25, and the taker chooses A2 | 1.25 of 2.5 | 0 of 2.5 | 0 of 5 |
| The category is prioritised with weight 1.25, and the taker skips | 0 of 2.5 | 0 of 2.5 | 0 of 5 |
| The taker steps back from this question | Everything it added is taken away again | | |

A skipped question gives no points and still adds its maximum, exactly as it does in the final result, where a question without an answer scores nothing against the full quiz. A skip therefore lowers a value; it never raises one.

### Adding questions up
Three done questions. Q1 is the question above, not prioritised, answered A2. Q2 is in a prioritised category with weight 1.25 and has two possible answers: B1 with weight 3 for X, B2 with weight 1 for Z; the taker chose B1. Q3 is not prioritised, has C1 with weight 2 for Y and C2 with weight 2 for Z, and was skipped.

| Orientation | Points | Maximum | Value | Shown as |
|---|---|---|---|---|
| X | 1 + 3.75 = 4.75 | 2 + 3.75 = 5.75 | 82.6 | 83 |
| Y | 0 | 2 + 2 = 4 | 0 | 0 |
| Z | 0 | 4 + 1.25 + 2 = 7.25 | 0 | 0 |
| An orientation none of the three feeds | 0 | 0 | Absent | Nothing |

When every question of the quiz is done, points and maximum equal the back-end's `points` and `maxPossible` for the same answers. The back-end's own four test cases are the reference for that.

### Axes and compass
| Case | Behaviour |
|---|---|
| A two-sided axis, negative side 12 of 20, positive side 3 of 15 | Side values 60 and 20. Lean 40, the negative side leads |
| A two-sided axis with side values 47 and 47 | Lean 0. No leading side |
| A single-orientation axis at 83 | Lean 33 |
| A single-orientation axis at 40 | Lean -10. It cannot qualify: only a high reading is stated |
| A side whose maximum is still zero | No value for that side, no lean, and the axis cannot qualify yet |
| Compass, horizontal axis positive 60 and negative 20, vertical axis positive 20 and negative 60 | Position 0.40, -0.40: the end half of the horizontal axis, the start half of the vertical one. The distance from the centre is 0.57, so the level is moderate and the quadrant is visited |
| Compass position 0.04, -0.02 | On the trail, at the centre level. It visits no quadrant |
| One of the four compass sides has no value yet | No position, and nothing is added to the trail |
| The position moves into a quadrant it has visited before | The trail grows. Quadrants visited does not |
| The taker steps back | The last position leaves the trail. A quadrant only that position was in leaves quadrants visited |

### Time
| Case | Behaviour |
|---|---|
| 51 questions left, 40 timed questions with an average pace of 9.2 seconds | 469.2 seconds: 8 minutes |
| 51 of 102 left, 3 timed questions, survey average 15 | 7.5 minutes: 8 minutes |
| 4 left, average pace 6 seconds | 24 seconds: 1 minute |
| The taker leaves a question open for ten minutes | That sample counts as 60 seconds |
| The page is reloaded while a question is open | That question gets no sample. Earlier samples are kept with the session |
| The taker steps back | The sample of the removed question is dropped; answering it again makes a new one |

Time never decides whether a card fires or which one. It only fills the minutes a card prints.

### The pipeline
At every boundary the questionnaire asks for a card. The engine answers in this order:

| Step | What happens | Result when it fails |
|---|---|---|
| 0. Opt-out | If the taker turned checkpoints off, stop | Nothing |
| 1. Slot | The pacing rules that do not depend on the card are checked - see "Pacing" | Nothing. No trigger is looked at |
| 2. Trigger | Every card type's condition is checked against the state | A type whose condition is false is not a candidate |
| 3. Confidence gate | Each candidate's own gate is checked | A candidate that fails its gate is dropped |
| 4. Selection | The candidates are ranked and the first one wins | With no candidate: nothing |
| 5. Pacing, last rule | A winner of the same type as the previous card is dropped, and the next in the ranking takes its place | With nobody left: nothing |
| 6. Card | The winner gets its values and its wording, and is handed over | - |

The order the doc gives is trigger, gate, selection, pacing. Step 1 is pacing moved to the front, which changes no outcome: a closed slot shows nothing whichever step finds out.

### Card types
One row per type. Priority 1 is the highest; it is the third key of selection.

| Priority | Type | Kind | Trigger | Confidence gate | How often |
|---|---|---|---|---|---|
| 1 | Stats chart | Personal, moment | The question done at this boundary was answered, its aggregates are already loaded, and the side the taker chose was chosen by 10% of takers or fewer | At least 100 answers to that question. No gate on the taker's scores | Once per session |
| 2 | New trait | Personal, standing | A trait is unlocked and has not been announced | None. The unlock is the threshold: every question tied to the trait answered, all lined up | Once per trait |
| 3 | Double axis puzzle | Personal, standing | The quiz has at least 3 named positions, and one of them is the closest | The closest position's match is at least 5 points above the runner-up's, its match is 50 or more, and at least half the questions are done | Once per session |
| 4 | Nolan chart path | Personal, standing | The quiz has a compass, and at least 2 quadrants were visited | At least 10 questions done. No gate on certainty - it fires on movement | The two-or-three-quadrant version once. The four-quadrant version once, also after the smaller one |
| 5 | Axis closeness | Personal, standing | An axis that has had no card qualifies | At least 5 answered questions feed the axis, and it leans clearly: a single-orientation axis has a value of 70 or more, a two-sided axis has a lean of 15 points or more | Once per axis. An axis gets one card in a session, closeness or puzzle |
| 6 | Single axis puzzle | Personal, standing | A two-sided axis that has had no card qualifies | The gate of a two-sided axis in axis closeness | Once per axis. An axis gets one card in a session, closeness or puzzle |
| 7 | Halfway through | Generic, moment | This boundary is the midpoint boundary | No confidence gate. A time left must exist | Once per session |

"Once per session" is what the card specs call once per run of the quiz: a reset starts a new session, and with it a new count. Axis closeness has two variants - single for a single-orientation axis, double for a two-sided one - and is one type. The Nolan chart path has two versions and is one type. Both puzzles keep their states (ask, hit, miss) on one card, and count as one card.

A standing trigger that loses, or meets a closed slot, is simply true again at the next boundary. That is not a queue: the engine remembers nothing about it, and if the state changes in between the candidate is gone. A moment trigger that loses is lost.

### Selection
The candidates that passed their gates are ordered by these keys, in this order. The first candidate is the winner.

| Key | Rule |
|---|---|
| 1. Personal before generic | Any personal candidate beats halfway through |
| 2. New before seen | A type that has not been shown in this session beats one that has |
| 3. Priority | The lower number in the table above |
| 4. Within one type | See below |

| Case | Behaviour |
|---|---|
| Several axes qualify | The one with the highest lean. Equal leans: the one with more answered questions feeding it. Still equal: the earlier one in the quiz's order |
| Several traits are unlocked and unannounced | The earlier one in the quiz's order. The others stay candidates for later boundaries |
| Four quadrants were visited and the four-quadrant version has not been shown | The Nolan candidate is the four-quadrant version, and it counts as a type not yet seen - the one exception to key 2 |
| Two or three quadrants were visited and no Nolan card has been shown | The Nolan candidate is the two-or-three-quadrant version |
| Two or three quadrants were visited and the smaller version has been shown | No Nolan candidate, even if the count went from two to three |
| The four-quadrant version has been shown | No Nolan candidate for the rest of the session |
| Axis closeness and the single axis puzzle are both candidates | Each proposes its own best axis, which may be the same one. Whichever type wins takes its axis; the other proposes again at a later boundary, from the axes still without a card |
| Halfway through is a candidate together with a personal one | The personal one wins and halfway through is lost for this session |
| Halfway through is the only candidate | It wins |

### Pacing
*n* is the number of done questions at the boundary, *all* the number of questions in the session.

| Rule | A card may appear only when |
|---|---|
| Not at the start | *n* is 5 or more |
| Not before the end | 4 or more questions are left |
| Gap | At least 6 questions were done since the boundary of the previous card |
| Rate | Card number *k* of the session appears no earlier than boundary (*k* - 1) x *R*, where *R* is 10, or one sixth of *all* when that is more |
| Cap | Fewer than 6 cards were shown |
| No repeat in a row | Its type is not the type of the previous card, however long ago that was |

| Case | Behaviour |
|---|---|
| A quiz of 102 questions | *R* is 17. Cards may appear from boundaries 5, 17, 34, 51, 68 and 85 on, the last one at boundary 98 at the latest |
| A quiz of 30 questions | *R* is 10. The first card may appear from boundary 5, the second from boundary 10 - or 11 if the first came at 5, because of the gap - and the third from boundary 20. The last boundary a card can use is 26, so there are three cards at most |
| A quiz of 100 questions | *R* is 16.67, compared as it is: the second card needs boundary 17, the third 34, the fourth 50 |
| A quiz of fewer than 9 questions | No boundary passes both end rules. No card ever appears |
| A card was shown at boundary 20 and a standing trigger is true at boundary 23 | Nothing. The gap is 3 |
| The winner is an axis closeness card and the previous card was one too | It is dropped and the next candidate of another type is shown. With none, nothing |
| The taker steps back behind the boundary of the last card and answers again | Nothing appears until 6 questions past that boundary. A card is never shown twice and none appears on ground already covered |
| A puzzle | One card, whatever the taker does on it |

Pacing overrules triggers. A card that cannot be shown now is dropped, not queued.

### Opt-out
| Case | Behaviour |
|---|---|
| The taker presses "Wyłącz checkpointy" on any card | The opt-out is set. The card closes and the next question appears |
| Any later boundary of the session | Nothing, at step 0. The questionnaire gets the same answer it gets when no trigger fires |
| The opt-out is pressed on a puzzle before a guess | The same. There is no reveal |
| The taker resets the quiz | A new session starts, with a new seed and no cards shown. The opt-out is carried over |
| The page is reloaded | The opt-out and the cards shown come back with the session |
| A session started any other way - another quiz, or the same quiz after the taker was sent to the results | Checkpoints are on again |

No control turns checkpoints back on within a session.

### Determinism and seed
| Case | Behaviour |
|---|---|
| The same survey, seed, prioritised categories, sequence of answers, skips and steps back, the same guesses on puzzles and the same aggregates | The same cards at the same boundaries, with the same values and the same wording |
| The same answers given faster or slower | The same cards. Only the minutes on a halfway card can differ |
| A decision between candidates | Never uses chance. Ties end in the quiz's order |
| A seeded draw | Depends on the seed, on the name of its purpose and on how many draws that purpose has had. It does not depend on the order of other draws, on the clock or on the device |
| Aggregates that changed between two sessions | The stats chart may fire in one and not in the other. Everything else is the same |

The seed is the session's own identifier, made when the session starts - see [session and data](./session-and-data.md). The engine never makes one.

## States and lifecycle
| State | Condition | What is possible in it |
|---|---|---|
| On | The session has no opt-out | Every boundary is evaluated. A card may appear |
| A card is up | The questionnaire put the engine's card on screen | Nothing is evaluated. The card is already in the cards shown |
| Off | The taker turned checkpoints off | No boundary is evaluated for the rest of the session, and after any reset |

The running state exists from the first done question to the end of the session and has no states of its own. It is not needed while the engine is off, except where the questionnaire itself reads it.

## Rules and constraints
- **One card per boundary, at most.** Selection has one winner.
- **Nothing is queued.** The engine's memory is the cards it showed and the opt-out.
- **A card is never retracted and never repeated.** Not by a step back, not by a refresh, not by a later answer that makes it untrue.
- **The engine never waits.** It answers at once from what is already on the device. Aggregates that are not loaded when the question is answered mean no stats candidate.
- **Thresholds are compared on exact values**, before any rounding. A value of 69.6 is not 70.
- **The state is derived.** Apart from the time samples it holds nothing that cannot be rebuilt from the survey and the done questions.
- **Zero configuration.** No author setting turns a type on or off or changes a threshold. The thresholds are constants, the same in every quiz.
- **Not sent.** The running state, the cards shown and the time samples never leave the device.
- **Not supported: a follow-up event.** A card cannot schedule anything.

### Calls and their cost
| Call | Instead of | Cost |
|---|---|---|
| The scores port the calculator the back-end runs today, `mp-qu-2025-1.0.1`: points are weight times the category's own weight when prioritised | The older back-end calculator, with a fixed multiplier of 1.33 and every answer scored on a scale offset by 3. The back-end replaced it in February 2025; it takes a message the API no longer sends and gives values the result page would not show | None for the product. Anything that still says prioritised answers are multiplied by 1.33 is out of date: the multiplier is the category's own weight, 1.25 in the sample |
| The running maximum counts done questions only | The back-end's maximum over the whole quiz | Mid-quiz values are higher than "share of the final score" would be, and move a lot in the first questions. That is what the confidence gate is for |
| Trait unlocked means every tied question answered with the trait's highest weight | The doc's "announce as of now" option | It fires late or never in a long quiz, and one skip on a tied question rules the trait out |
| Positions are the identity orientations | A mark for archetypes, which the API does not have | A quiz that uses identities for something else still gets the puzzle |
| The closest position must have a match of 50 or more | The brief's gate of separation and half the quiz only | The puzzle fires less often. Without it a hit would uncover a name the [archetype](./archetype.md) module itself refuses to show below 50 |
| A quadrant counts as visited only at the moderate or the extreme level | Counting every change of sign | A taker who hovers around the centre never gets the path card. In the sample the compass has no data before question 41, and its first positions cross the centre lines on single answers |
| An axis with a side no question feeds is read as single-orientation | Leaving it out | The card states a high reading for one pole of an axis the author drew with two |
| An axis with several orientations on a side is used for the compass only | Pooling the side and naming it after its first orientation | Such an axis never gets a card |
| A standing trigger is checked again at every boundary | Reading "dropped, not queued" as "lost for good" | A card can appear some questions after its condition first became true. Without it a single closed slot would cost an axis its card for the whole quiz |
| The rate stretches to one card per sixth of the quiz in quizzes longer than 60 questions | One card per 10 questions in every quiz | The second card of a 102-question quiz cannot come before question 17. Without it all six cards could be spent by question 50 and the second half would have none |
| "One card per 10 questions" is read as: card number *k* not before boundary (*k* - 1) x 10 | A sliding window of 10 questions, which would contradict the gap of 6 | Two cards can be 6 questions apart early in a quiz |
| A same-type winner is replaced by the next candidate | Dropping the winner and showing nothing | None. The dropped card is still not queued |
| Halfway through fires only at the midpoint boundary and loses to any personal card | The doc's "universal fallback that always can" | In a quiz rich in axes it will rarely be seen |
| The stats chart fires once per session | "Any question in any quiz" | A second rare answer goes unmentioned. Said twice, "rare" starts to read as "fringe" |
| A time sample counts as 60 seconds at most | No rule in the doc | A slow, careful taker gets an estimate that is too short |
| No time left without 5 timed questions or a survey average, and then no halfway card | Inventing a pace | A quiz without an average finish time can lose the card |
| A boundary after a skip is evaluated like any other | Evaluating only after answers | A card can follow a skip |

## Invalid and edge input
| Input | Behaviour |
|---|---|
| A possible answer that lists an orientation the quiz does not have | That reference is dropped. The rest of the answer counts |
| A possible answer that lists the same orientation twice | Counted once |
| A weight that is missing, not a number, zero or negative | Counted as zero |
| A category weight that is missing, not a number, zero or negative | The multiplier is 1 |
| A prioritised category the quiz does not have | Ignored |
| A done question the quiz does not have | Ignored |
| A chosen answer that is not one of the question's possible answers | The question counts as skipped |
| The same question done twice | The later entry counts |
| A question with no possible answers | It adds nothing. It still counts as a question for progress |
| An orientation no question feeds | No value. It cannot be a position. On an axis it counts as an empty side |
| An axis with an unknown kind | Ignored |
| Two axes of the same compass kind | The first in the quiz's order is the compass axis |
| Only one of the two compass axes, or a compass axis with an empty side | The quiz has no compass |
| An axis naming an orientation the quiz does not have | That reference is dropped. If a side is left empty the axis is read by what remains |
| The same orientation on both sides of an axis | The axis is not used |
| A trait in the trait list that the quiz does not have, that is hidden, has no name, or is fed by no question | Never unlocked |
| Fewer than 3 named positions | No double axis puzzle |
| Two positions with the same match at the top | The separation is zero. No double axis puzzle |
| Aggregates with fewer than 100 answers, with shares that are not numbers, or for another question | No stats candidate |
| Survey average missing, zero, negative or not a number | Treated as missing. With fewer than 5 timed questions there is no time left, and halfway through is not a candidate |
| A time sample that is negative or not a number | Dropped |
| A quiz with no questions | No state, no boundary, no card |
| A seed that is missing or empty | The draws use a fixed seed. The session still works and is still repeatable |

Nothing here throws. Quiz data is author-supplied and can be wrong; one bad question never costs the quiz its other cards.

## Privacy and data handling
- **The running state is a reading of political views.** It exists in memory on the taker's device and is never sent, logged or put into an analytics event.
- **The cards shown are kept with the session**, in the same browser storage as the answers, and say which axis, trait or position a card was about. They are cleared when the session is: on reset, and when the taker is sent to the results.
- **Time samples** are kept the same way and are never sent.
- **The seed is the session identifier.** Draws are derived from it and reveal nothing about the answers.
- **Nothing here identifies a person**, and nothing here is joined to an e-mail address or to demographics.

## Failure modes
| Failure | Behaviour |
|---|---|
| The running state cannot be computed | The boundary gets no card and the next question appears. The questionnaire is not told why |
| The engine fails while choosing a card | The same |
| A card fires and one of its values is missing - an axis lost its name, a position its match | It is not a candidate. Another one may win |
| The wording cannot be drawn | The card is not shown and is not added to the cards shown |
| The cards shown cannot be read back after a refresh | The engine starts with an empty list. A card may then repeat once |
| The aggregate source fails or is slow | No stats candidate. Nothing else is affected |

A failure in this spec never stops the quiz and never shows an error to the taker. The worst outcome is a quiz without cards.

## Non-functional
- **Fast enough not to be noticed.** State and decision are ready before the answer's own animation ends, in a quiz of a hundred questions and a few hundred orientations. The next question never waits for them.
- **Pure.** State and decision are functions of their inputs, with no clock, no chance outside the seeded draw and no network, so they are tested by replaying answers.
- **Reference numbers.** The worked examples in this spec, the back-end's four calculator cases, and a replay of the sample quiz are test cases.
- **The same everywhere.** The seeded draw gives the same result in every browser.

## Dependencies
Relies on:

- [Event model doc](../../docs/modules/quiz/questionnaire/checkpoints/event-model.md) and [gamification](../../docs/modules/quiz/questionnaire/gamification.md) - the idea this implements.
- [Universal orientation](./universal-orientation.md) - names, types and hidden marks.
- [Double axis chart](./double-axis-chart.md) - which side of a pair is the start and which the end. [Nolan chart](./nolan-chart.md) - the coordinate and the quadrant. [Archetype](./archetype.md) and the [header](./header.md) - the match bands. [Traits](./traits.md) - a trait is an orientation used as one.
- [Session and data](./session-and-data.md) - the done questions, the prioritised categories, the seed, and the checkpoint record that stores the cards shown and the time samples. The [phases model](./phases-model.md) - the screen that asks for a card at every boundary.
- The survey API, for the quiz, and the back-end calculator `mp-qu-2025-1.0.1`, whose arithmetic the scores repeat.

Relied on by:

- [Checkpoints](./checkpoints.md) - the frame that shows what the engine returns and sends back the opt-out.
- [Random copy](./checkpoints-random-copy.md) - draws its lines with the seeded draw.
- Every card spec, for its trigger, gate and frequency: [halfway through](./halfway-through.md), [axis closeness](./axis-closeness.md), [new trait](./new-trait.md), [single axis puzzle](./single-axis-puzzle.md), [Nolan chart path](./nolan-chart-path.md), [double axis puzzle](./double-axis-puzzle.md), [stats chart](./stats-chart.md).
