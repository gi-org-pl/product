# Axis closeness

> Technical specification of the checkpoint card that tells the taker where they already stand on one axis.

Docs: [Axis closeness](../../docs/modules/quiz/questionnaire/checkpoints/axis-closeness.md). | Design: Figma - [single axis](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5515-67082) | [double axis](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5515-67161)

| Single axis | Double axis |
|---|---|
| ![Single axis checkpoint](../../assets/single-axis-checkpoint.png) | ![Double axis checkpoint](../../assets/double-axis-checkpoint.png) |

## Kind
Front-end

## Scope
One checkpoint card in two variants: what it puts into the shared card frame (a titled bar in the visual slot, a lead-in and a statement), which axes of a quiz it can speak about, when an axis is clear enough to be stated, how often, and what happens in a quiz that has no such axis. The card is passive: it shows a reading and takes no input.

The bar is the [universal axis](./universal-axis.md), the same one the [single axis chart](./single-axis-chart.md) and the [double axis chart](./double-axis-chart.md) put on the result screen. The card does not use those two modules as they are built: each of them is a [module wrapper](./module-wrapper.md) with a chip title and two action buttons, and a checkpoint borrows a module's visual, not its frame.

Not covered here:

- **The card frame, the progress bar and the controls above it, the buttons "Dalej" and "Wyłącz checkpointy"** - the [checkpoints](./checkpoints.md) spec.
- **Which card wins a slot, the pacing numbers, the opt-out and the running state with its scores** - the [event model](./event-model.md) spec. This spec states the card's own trigger and gate, and which axis it puts forward.
- **How a score is computed mid-quiz** - the running state in the [event model](./event-model.md) spec. The card takes a value per orientation as given.
- **How the bar draws fills, caps, the marker and labels** - the [universal axis](./universal-axis.md) spec.
- **What an orientation is and which name and image it shows** - the [universal orientation](./universal-orientation.md) spec.
- **The pools of alternative lines** - the [checkpoint random copy](./checkpoints-random-copy.md) spec.
- **The guessing card on the same axes** - the single axis puzzle. The two share the axes and never both speak about one.

## Data
| Input | Data | Meaning | Rules |
|---|---|---|---|
| Axes | For each axis of the quiz: the orientations on its first side and on its second side | What the card can speak about | From the quiz, in the quiz's order. The first side is the one the quiz sends as negative, the second the one it sends as positive |
| Entries | An orientation and its value, 0-100 | The taker's running score for that orientation | From the running state. The value is absent until an answered question can score the orientation |
| Answered questions behind an axis | Count | How much the reading rests on | From the running state. Skipped questions do not count |
| Axes already spoken about | A set | Axes that had this card or a single axis puzzle in this run | From the event model |
| Lead-in and statement | Text with name slots | The line drawn for this card and variant | From the copy pool |

A **scorable orientation** is an orientation of the quiz that is not hidden and that at least one question of the quiz can score - some possible answer of some question lists it.

An **eligible axis** is read from the quiz like this:

| The axis has | Reading |
|---|---|
| One scorable orientation on each side | Two-sided. The double variant |
| One scorable orientation on one side, and nothing or an orientation no question can score on the other | One-sided. The single variant, about the scorable orientation |
| More than one orientation on a side | Not eligible. A side without one name and one image cannot be drawn or named |
| The type of a compass axis - it is one of the two axes that form the quiz's compass | Not eligible, whatever it holds. The compass tells its own story on the Nolan chart path card |
| A hidden orientation on either side | Not eligible. Hidden wins |
| The same orientation on both sides | Not eligible |
| No scorable orientation | Not eligible |

A question is **behind an axis** when at least one of its possible answers scores an orientation of that axis.

The **lean** of an axis is a number of points: for a one-sided axis the value minus 50, for a two-sided axis the higher value minus the lower one. The **leading side** of a two-sided axis is the one with the higher value.

## Interface
| Direction | Name | Shape | Notes |
|---|---|---|---|
| In | Quiz | Axes and orientations | Read once per quiz and language |
| In | Running state | An entry per orientation, answered questions behind each axis | Read at every question boundary |
| In | Axes already spoken about | A set of axes | Kept by the event model for the run |
| In | Line | Lead-in, and a statement for the variant | Drawn by the copy pool |
| Out | Candidate | At most one axis per question boundary, with its variant and entries | Offered to the event model |
| Out | Card content | Title, bar entries, lead-in, statement | Handed to the card frame when the event model picks this card |
| Needs | Universal axis without value labels | The bar drawn with no number on or next to a fill | Not available today: the built bar always prints a value that fits. See Dependencies |

The card raises no event of its own.

## Behaviour

### When it may fire
| Property | Value |
|---|---|
| Trigger | An eligible axis that was not spoken about leans clearly: a one-sided axis has a value of 70 or more; a two-sided axis has both values and one is ahead by 15 points or more |
| Gate | At least 5 answered questions are behind the axis |
| Class | Personal |
| How often | Once per axis in a run. Both variants are one card type, so two of them never follow each other |

| Case | Behaviour |
|---|---|
| An axis meets the trigger and the gate at a question boundary | It is a candidate at that boundary |
| It still meets them at the next boundary and was not shown | It is a candidate again. Nothing is queued: the candidate is worked out from the state each time |
| Its reading falls back under the threshold before it was shown | It stops being a candidate |
| A one-sided axis has a value of 30 or less | Nothing. Only a high reading is stated |
| A two-sided axis has one value absent | Not a candidate. A lead needs two values |
| A two-sided axis is ahead by less than 15 points | Not a candidate. A near-tie says nothing |
| Several axes qualify at one boundary | The card puts forward one: the largest lean; on equal lean the one with more answered questions behind it; then the earlier one in the quiz's order |
| The axis put forward also qualifies for the single axis puzzle | The event model shows one of the two. Either way the axis is spoken about |
| The card was shown and later answers overturn the reading | Nothing. There is no correction card |
| The taker goes back and removes answers behind a shown axis | The axis stays spoken about |
| The quiz is reset | A new run: every axis can be spoken about again |
| Checkpoints were turned off | Never shown |
| The quiz has no eligible axis | Never shown. The quiz runs without this card |

The thresholds are compared on the exact values, not on rounded ones. The card prints no number, so rounding cannot make it contradict itself.

### Visual
The visual slot holds a title and one bar.

| Case | Behaviour |
|---|---|
| Single variant | The title is the orientation's name. The bar is one-sided: the orientation's image on the start cap, the fill from that cap |
| Double variant | The title is the leading orientation's name. The bar is double-sided: the first side on the start cap, the second on the end cap, each filled from its own cap, each named under its cap |
| Either variant | The marker is at the middle. No value is printed on or next to a fill |
| Double variant, values that do not reach 100 together | The gap stays in the middle, as the bar draws it |
| Double variant, values that exceed 100 together | Scaled by the bar. The lead is still decided on the values as given |
| The leading side is the second side | The bar keeps its sides. Only the title and the statement name the leader |
| An orientation without an image or a colour | As the bar draws it: a cap in the colour alone, or the neutral fallback |

The title is plain text. It is not the chip the result modules use, and it has no emphasised or quiet look: on this card the reading is always a clear one.

### Text
| Slot | Figma text, exactly | What varies |
|---|---|---|
| Title, single | "Radykalizm" | The orientation's name, as written |
| Title, double | "Eurosceptycyzm" | The leading orientation's name, as written |
| Labels under the bar, double | "Eurosceptycyzm", "Federacjonizm" | The two names, as written |
| Lead-in, single | "To już wiemy" | The line, drawn from the pool |
| Statement, single | "Twój radykalizm jest wysoki!" | The line and the name in it |
| Lead-in, double | "Tego już jesteśmy pewni" | The line, drawn from the pool |
| Statement, double | "Twój eurosceptycyzm wynosi więcej niż federacjonizm!" | The line and the two names in it |
| Buttons | "Dalej", "Wyłącz checkpointy" | Nothing. They belong to the frame |

Both Figma lead-ins fit either variant; the card needs lead-ins that do, and one statement shape per variant. How the pools are cut and drawn is the [checkpoint random copy](./checkpoints-random-copy.md) spec's.

The two Figma statements cannot be used as templates, because they bend the name: it is put in lower case, and "Twój ... wysoki" agrees with the grammatical gender of "radykalizm". "Religijność" or "Państwo minimum" in the same slot would read wrong, and a name is author-written text that is shown as written. The statements this card needs keep each name whole, in the nominative, inside quotation marks:

| Variant | Statement | Slots |
|---|---|---|
| Single | "Twój wynik na skali „{orientation}” jest wysoki!" | The orientation's name |
| Double | "Twój wynik po stronie „{leading}” jest wyższy niż po stronie „{other}”!" | The leading orientation's name, then the other one |

Every line of the pools has to hold to the same three rules: the name is never inflected or re-cased, nothing in the line agrees with the name's gender, and no verb form depends on the taker's gender, which is not known during the questions. The two statements above are the first lines of this card's two pools. Every line is held in the [checkpoint random copy](./checkpoints-random-copy.md) spec, and its wording is the one that stands.

## States and lifecycle
| State | Condition | What is possible in it |
|---|---|---|
| Single variant shown | The event model picked a one-sided axis | Read the card, continue, or turn checkpoints off - the last two in the frame |
| Double variant shown | The event model picked a two-sided axis | The same |

An axis moves one way: not yet clear, candidate, spoken about. It leaves the last state only on a reset. The card on screen does not change while it is open; it shows the reading of the boundary it fired at.

## Rules and constraints
- **A clear lean or nothing.** The card never states a low reading, a tie or a narrow lead.
- **No number.** The card says "high" and "more than", and the bar shows roughly how much. A percentage worked out from part of the answers is a precision the final result may not keep.
- **One orientation per side.** The card never adds orientations up to make a side.
- **The sides are the quiz's.** The card does not swap them to put the leader first.
- **One size of bar.** The bar fills the width of the visual slot and keeps its proportions, as the universal axis requires in every context.
- **Nothing here is configurable.** No author setting picks the axis or the wording.
- **Not supported: an explanation of the axis.** The card has no info button and does not show the axis's description.

### Calls
| Call | Cost |
|---|---|
| The bar carries no number, as Figma draws it on every checkpoint, although the same bar prints its value labels on the result screen | One addition to the shared bar, and a taker cannot see how high "high" is |
| The gate is 5 answered questions and the lean is 70 for one orientation, 15 points for a pair. The doc gives no numbers | On an axis with 5 questions behind it the card can only come after the last of them |
| An axis stays a candidate at every boundary while it qualifies, instead of only at the moment it crosses the threshold | The card can appear several questions after the reading became clear |
| Only a high reading of a single orientation is stated, never a low one | A taker who clearly rejects an orientation hears nothing about it |
| An axis whose second pole no question can score is read as one-sided | The same axis can look two-sided on the result screen and one-sided on the card |
| Axes with several orientations on a side, and both compass axes, are left out - the same axes the single axis puzzle leaves out | A quiz that only has compass axes never shows this card |
| Among several clear axes the widest lean wins | The card favours extreme readings over the axes an author marked as main |
| The statements are rewritten with the name in quotation marks, unlike the frame | The line reads less naturally than "Twój radykalizm jest wysoki!" |
| The doc says every quiz has axes and this card "never needs a fallback". A quiz without an eligible axis simply does not get it | Most quizzes the API serves today send no axes at all, and they never see this card |
| After this card an axis is not offered as a puzzle either | The puzzle loses the axes this card took first |

## Invalid and edge input
| Input | Behaviour |
|---|---|
| The quiz sends no axes, or something that is not a list | No eligible axis |
| An axis names an orientation the quiz does not have | That reference is dropped, as the universal orientation specifies. The axis is read from what is left |
| An axis with both sides empty | Not eligible |
| Two axes with the same orientations | One axis for this card: once either is spoken about, both are |
| A value outside 0-100 | Clamped before the trigger is checked and before the bar is drawn |
| A value that is not a number | Treated as absent |
| An orientation without a name | Not eligible. The statement would have nothing to say |
| A name longer than the card | It wraps in the title and in the statement and is never cut there. Under the bar it is truncated by the bar and stays complete for assistive technology |
| A name with line breaks or doubled spaces | Collapsed to one line |
| A name that contains quotation marks | Shown as written, inside the statement's own marks |
| A name with two forms | The form the universal orientation gives a taker who was not asked their gender yet |
| A pool line without a name slot | Shown as written |

Nothing here throws, and an axis that cannot be read is skipped without the taker seeing anything.

## Privacy and data handling
- **The running score never leaves the device.** The card reads it, shows it and stores nothing of its own.
- **The card is a political statement about one person.** It is shown only to that person, inside their own session, and is not part of anything that can be shared.

## Non-functional

### Rendering contexts
The questionnaire only, inside the card frame, at every width the questionnaire supports. The bar is the one the result screen and the generated result image use, at the same proportions.

### Accessibility
- The bar is one image, not interactive and not focusable, as the universal axis specifies.
- Its description is in words and carries what a sighted taker sees: the orientation names and where the reading lies - high for the single variant, which side is ahead for the double one. It carries no percentage, because the card shows none.
- The title is text and is read before the bar; the lead-in and the statement are read after it, as one sentence.
- The lean is never carried by colour or by the length of a fill alone: the statement says it.
- Under the bar a truncated name stays complete for assistive technology.
- Focus, the announcement when the card appears and the two buttons are the frame's.

### Performance
Working out the candidate is a pass over the quiz's axes after each answer. The identity quiz has 18; a few hundred must stay unnoticeable.

## Dependencies
Needs the [checkpoints](./checkpoints.md) frame, the [event model](./event-model.md) with the running state it defines, pools in [checkpoint random copy](./checkpoints-random-copy.md), and the built [universal axis](./universal-axis.md) and [universal orientation](./universal-orientation.md).

What it needs that is not there today:

- **A bar without value labels.** The built universal axis prints a value whenever it fits and announces percentages in its description. This card needs both left out. It is one addition to the shared bar, not a second bar; the single axis puzzle needs the same bar and adds its mask on top.
- **Scores during the quiz.** The result is calculated by the back-end after the last question; the running state brings the same arithmetic to the questionnaire.
- **Axes in the quiz.** Of the 14 quizzes the API lists, only three versions of the identity quiz send any axes; the presidential, the 2023 election and the Warsaw quizzes send none. No quiz sends an axis with a single orientation, so the single variant can appear today only through the "pole no question can score" reading - one of the 16 plain axes of the live identity quiz.

Relies on:

- [Axis closeness doc](../../docs/modules/quiz/questionnaire/checkpoints/axis-closeness.md) - the idea this implements.
- [Double axis chart](./double-axis-chart.md) - the rule that the title names the leading side comes from there. Its tie cases do not arise here.
- [Single axis chart](./single-axis-chart.md) - the one-sided bar with the image on its cap.

Relied on by the single axis puzzle, which uses the same eligible axes, the same gate and the same bar, and has to come after this card in the build.
