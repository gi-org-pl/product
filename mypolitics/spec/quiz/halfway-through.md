# Halfway through

> Technical specification of the checkpoint card that tells the taker they are past the midpoint and how long the rest will take.

Docs: [Halfway through](../../docs/modules/quiz/questionnaire/checkpoints/halfway-through.md). | Design: [Figma](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5515-67631)

![Halfway through checkpoint](../../assets/halfway-through-checkpoint.png)

## Kind
Front-end

## Scope
One checkpoint card: what it puts into the shared card frame (a large percentage in the visual slot, a lead-in and a statement with the minutes left), the condition under which it asks to be shown, how the minutes are worked out, and what happens in a quiz or a session that cannot run it. It is the only card that says nothing about the taker's views, so it borrows no result module.

Not covered here:

- **The card frame, the progress bar and the controls above it, the buttons "Dalej" and "Wyłącz checkpointy", and what each does** - the [checkpoints](./checkpoints.md) spec.
- **Which card wins a slot, the pacing numbers, the opt-out, the seeded draw and the running state this card reads** - the [event model](./event-model.md) spec. This spec only states the card's own trigger and gate.
- **The pool of alternative lines and how one is drawn** - the [checkpoint random copy](./checkpoints-random-copy.md) spec.
- **The curve of the progress bar** - [progress and pacing](./progress-and-pacing.md). This card only has to agree with it.
- **A second card at the midpoint** - the doc used to name a "halfway split"; nothing defines it and it is not built.

## Data
| Input | Data | Meaning | Rules |
|---|---|---|---|
| Questions done | Count | Questions answered plus questions skipped | From the running state |
| Questions in the quiz | Count | Every question of the quiz | Category select does not change it |
| Timed questions | Count, and seconds each | How long each done question stayed on screen before it was answered or skipped | From the running state. Used on this device only |
| Quiz average finish time | Minutes, for the whole quiz | The quiz's own `averageFinishTime` | Optional. Fallback only |
| Lead-in and statement | Text with one slot | The line drawn for this card | From the copy pool |

**Progress** is questions done divided by questions in the quiz - the same value the progress bar is fed.

**The midpoint boundary** is the first moment between two questions at which progress is 50% or more: after question 51 of 102, after question 5 of 9.

**A timed question** is a done question whose time on screen was measured in this session. Time spent on a checkpoint card is not part of any question's time. One question counts for at most 60 seconds, so a taker who walked away once does not get an estimate in hours.

**Time left** is a whole number of minutes, never zero.

## Interface
| Direction | Name | Shape | Notes |
|---|---|---|---|
| In | Running state | Questions done, questions in the quiz, timed questions | Read at the midpoint boundary |
| In | Quiz | Average finish time | Read once, with the quiz |
| In | Line | Lead-in and statement with the minutes slot | Drawn by the copy pool for this card |
| Out | Candidate | "Halfway through is due", with the percentage and the minutes | Offered to the event model at the midpoint boundary only |
| Out | Card content | The percentage for the visual slot, the lead-in, the statement | Handed to the card frame when the event model picks this card |

The card raises no event of its own. Continuing and turning checkpoints off belong to the frame.

## Behaviour

### When it may fire
| Property | Value |
|---|---|
| Trigger | The midpoint boundary |
| Gate | No confidence gate. The only condition is that time left can be worked out |
| Class | Generic. Any personal card that qualifies at the same boundary takes the slot |
| How often | Once per run of the quiz |

| Case | Behaviour |
|---|---|
| The midpoint boundary is reached, no personal card qualifies, pacing allows a card | The card is shown before the next question |
| A personal card qualifies at the same boundary | That card is shown. This one is dropped and does not come back later |
| Pacing does not allow a card at that boundary | Dropped. It does not move to a later boundary |
| The question that reaches the midpoint was skipped | The same as when it was answered. A skip moves progress |
| Checkpoints were turned off earlier | Never shown |
| The taker goes back across the midpoint and reaches it again | If the card was shown, nothing: a card is never shown twice. If it was dropped, that boundary is the midpoint boundary again and the card is offered again under the same pacing - the event model remembers the cards it showed and nothing else |
| The quiz is reset | A new run: the midpoint can be used once again |
| The page is refreshed after the midpoint has passed | Nothing. The boundary is behind the taker, and a card that was shown is in the record the session restores |
| Time left cannot be worked out | The card is not offered at all |

### Percentage
| Case | Behaviour |
|---|---|
| Progress is a whole percent | Shown as it is, with the percent sign: "50%" |
| Progress is not a whole percent | Rounded down: 5 of 9 reads "55%" |
| Any quiz | The number is progress at the boundary, not a fixed "50%". It is never below 50 |

Above the midpoint the progress bar shows the true value, so the bar above the card and the number on it say the same thing.

### Time left
| Case | Behaviour |
|---|---|
| 5 or more timed questions | Questions left times the taker's own average seconds per timed question, rounded up to whole minutes |
| Fewer than 5 timed questions, and the quiz has an average finish time above zero | The average finish time times the share of questions left, rounded up to whole minutes |
| Fewer than 5 timed questions, and no usable average finish time | No estimate. The card is not offered |
| The result is under one minute | 1 |
| The result is above 99 minutes | No estimate. The card is not offered |

Examples, for 102 questions with 51 left: an own pace of 8.2 seconds gives 7 minutes; an average finish time of 15 minutes gives 8.

### Text
| Slot | Figma text, exactly | What varies |
|---|---|---|
| Visual | "50%" | The number - see Percentage |
| Lead-in | "Jesteś na półmetku" | The line, drawn from the pool |
| Statement | "To już prawie koniec, pozostałe pytania zajmą ok. ___ min." | The line, drawn from the pool. "___" is the minutes slot |
| Buttons | "Dalej", "Wyłącz checkpointy" | Nothing. They belong to the frame |

The lead-in is drawn muted and the statement strong, and the two are joined by the dash the frame shows - the same on every card, so it is specified once in [checkpoints](./checkpoints.md).

The Figma line has no verb form that depends on the taker's gender, so it is used as written and is the first line of this card's pool. Every other line of the pool has to keep that property: the taker's gender is not known during the questions.

## States and lifecycle
The card has one look. What changes is whether it can still appear.

| State | Condition | What is possible in it |
|---|---|---|
| Waiting | Progress is below 50% | Nothing yet |
| Offered | The midpoint boundary, with an estimate | The event model shows it or drops it |
| Shown | The event model picked it | Continue, or turn checkpoints off - both in the frame |
| Used | The midpoint boundary has passed, shown or not | Nothing, until a reset - or, when the card was not shown, until the taker steps back across the midpoint |

## Rules and constraints
- **Time, never a count.** The card does not say how many questions are left. The controls bar above it already carries the count for the current category.
- **The estimate is rounded up.** A promise the taker can check is better kept than beaten by a rounding.
- **The card never updates while it is open.** Percentage and minutes are those of the boundary.
- **Nothing here is configurable.** No author setting turns it on, off or changes its wording.
- **A quiz too short for a card at its midpoint never shows it.** With the pacing numbers of the event model - no card before 5 questions are done and none within the last 3 - that is every quiz of fewer than 9 questions.

### Calls
| Call | Cost |
|---|---|
| The estimate uses the taker's own pace, and the quiz's average finish time only when fewer than 5 questions were timed. The doc marks this as open | A slow first half gives a discouraging number exactly at the drop-off point |
| The card is dropped when a personal card qualifies at the midpoint. The doc calls it "the universal fallback" that "always can" | In a quiz rich in personal cards many takers never see it |
| The number is true progress rounded down, not a fixed "50%" as the frame draws | In a quiz with an odd number of questions it reads 50 to 55, under a lead-in that says "halfway" |
| One question counts for at most 60 seconds | A taker who really needs longer per question gets an estimate that is too low |
| No estimate means no card, instead of a card without a time | A quiz with no average finish time loses the card for a taker who has fewer than 5 timed questions at the midpoint |
| An estimate above 99 minutes is treated as broken data | None for real quizzes: 99 minutes for half a quiz is not a quiz we ship |
| The card is shown at most once per run, and a midpoint that passed without it is not remembered: the event model keeps the cards it showed and no list of triggers | A taker who steps back across the midpoint after the card was dropped is offered it again. The gap rule nearly always drops it again |

## Invalid and edge input
| Input | Behaviour |
|---|---|
| Average finish time missing, zero, negative or not a number | Treated as absent |
| A time sample that is negative or not a number | Dropped, as the event model says. That question is not a timed one |
| A quiz with no questions | No midpoint, no card |
| Questions done above questions in the quiz | Progress is read as 100%. The boundary has passed, no card |
| A quiz with one or two questions | The midpoint exists, pacing never allows it, no card |
| A pool line without the minutes slot | The line is shown as written |
| A pool line longer than the card | It wraps onto further lines. It is never cut |

Nothing here throws, and a card that cannot be built is skipped without the taker seeing anything.

## Privacy and data handling
- **Time per question stays on the device.** It is used for this estimate and is not sent with the result or to analytics by this card.
- **The card carries nothing political.** It reads no score, no orientation and no answer.

## Non-functional

### Rendering contexts
The questionnaire only, inside the card frame, at every width the questionnaire supports. The card is not part of the result screen or of the generated result image.

### Accessibility
- The percentage is text, not a picture, and is read once, before the lead-in and the statement.
- The lead-in and the statement are read as one sentence, in that order.
- Muted and strong are a visual distinction only; nothing is conveyed by colour alone.
- The minutes are read as a number with its unit, "ok. 7 min.", not as a blank.
- Focus, the announcement when the card appears and the order of the two buttons are the frame's.

## Dependencies
Needs the [checkpoints](./checkpoints.md) frame and the [event model](./event-model.md), with the running state it defines (questions done, time per question), and one pool in [checkpoint random copy](./checkpoints-random-copy.md). It needs no result module.

Relies on:

- [Halfway through doc](../../docs/modules/quiz/questionnaire/checkpoints/halfway-through.md) - the idea this implements.
- [Progress and pacing](./progress-and-pacing.md) - the bar this card's number has to agree with.

Relied on by nothing. It can be built alongside the other cards.
