# Single axis puzzle

> Technical specification of the checkpoint card that hides one axis, asks the taker which pole they are closer to, and then shows the reading.

Docs: [Single axis puzzle](../../docs/modules/quiz/questionnaire/checkpoints/single-axis-puzzle.md). | Design: Figma - [ask](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5515-67799) | [hit](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5516-67925) | [miss](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5516-68299)

| Ask | Hit | Miss |
|---|---|---|
| ![Guess the axis](../../assets/single-axis-puzzle-checkpoint-1.png) | ![Guessed right](../../assets/single-axis-puzzle-checkpoint-2.png) | ![Guessed wrong](../../assets/single-axis-puzzle-checkpoint-3.png) |

## Kind
Front-end

## Scope
One checkpoint card with three states: what it puts into the shared card frame in each (a masked or uncovered axis bar in the visual slot, a lead-in and a statement, two option rows while it asks), which axes can get the card and when it asks to be shown, what a tap on an option does, and what happens in a quiz that cannot run it. The card holds one piece of state of its own - whether the taker has guessed, and what.

Not covered here:

- **The card frame, the progress bar and the controls above it, the buttons "Dalej" and "Wyłącz checkpointy", and what each does** - the [checkpoints](./checkpoints.md) spec. This spec only says in which state "Dalej" is offered.
- **Which card wins a slot, the pacing numbers, the opt-out, the seeded draw and the running state this card reads** - the [event model](./event-model.md) spec. This spec states the card's own trigger and gate.
- **The pools of alternative lines and how one is drawn** - the [checkpoint random copy](./checkpoints-random-copy.md) spec.
- **How the bar draws two fills, caps, labels and the marker** - the [universal axis](./universal-axis.md) spec. This spec names the two things the bar cannot draw yet.
- **The passive card about the same axis** - the [axis closeness](./axis-closeness.md) spec.
- **A reveal a few questions later** - the two-beat events of the event model doc are not built. The reveal is on the card.
- **Keeping the guess** - no part of the product stores it; the result the API takes has no field for it.

## Data
| Input | Data | Meaning | Rules |
|---|---|---|---|
| Axis | A start pole and an end pole, each an orientation | The axis the card is about | One eligible axis, chosen as under "When it may fire" |
| Start value, end value | Numbers, 0-100 | How strongly the answers so far support each pole | From the running state, read once when the card fires |
| Answered questions behind the axis | Count | How much the reading rests on | From the running state. Skipped questions do not count |
| Axes already spoken about | A set | Axes that had this card or an axis closeness card in this run | From the event model |
| Lines | A lead-in and a statement for each of ask, hit and miss | The wording | From three copy pools, one per state |

An orientation carries a name, an image and a colour, as the [universal orientation](./universal-orientation.md) spec defines it.

An **eligible axis** is a two-sided axis exactly as the [axis closeness](./axis-closeness.md) spec reads one from the quiz: one orientation on each side, both of them named, not hidden, different from each other, and both scored by at least one question of the quiz. Everything that spec leaves out is left out here as well - an axis with several orientations on a side, such as the two compass axes of the identity quiz, and an axis that spec reads as one-sided. Two axes with the same two orientations are one axis for this card.

The **start pole** is the orientation the quiz sends on the axis's negative side and the **end pole** the one on its positive side. In the quizzes in use this is also the order in which the axis's own name lists them.

A question is **behind an axis** when at least one of its possible answers scores one of the two poles. A skipped question is behind nothing.

The **leading pole** is the pole with the higher value, and the **lead** is the higher value minus the lower one, in points. Both are taken from the exact values.

## Interface
| Direction | Name | Shape | Notes |
|---|---|---|---|
| In | Running state | For every eligible axis: both values and the count of answered questions behind it | Read at each question boundary |
| In | Axes already spoken about | A set of axes | Kept by the event model for the run |
| In | Lines | A lead-in and a statement for the state being shown | Drawn by the copy pool. The hit and the miss pools have a slot for the leading pole's name |
| Out | Candidate | At most one axis per question boundary, with its two values | Offered to the event model |
| Out | Card content | The visual, the lead-in, the statement, the option rows, and whether "Dalej" is offered | Handed to the card frame when the event model picks this card |
| Out | Axis spoken about | The axis | Told to the event model when the card is shown, so the axis gets no second card of either kind |

The guess never leaves the card. Continuing and turning checkpoints off belong to the frame.

## Behaviour

### When it may fire
| Property | Value |
|---|---|
| Trigger | An eligible axis that was not spoken about has both values, and one is ahead by 15 points or more |
| Gate | At least 5 answered questions are behind the axis |
| Class | Personal |
| How often | Once per axis in a run. No limit of its own per quiz - pacing is the limit |

The trigger and the gate are those of the two-sided [axis closeness](./axis-closeness.md) card, number for number. What differs is what the card does with the axis.

| Case | Behaviour |
|---|---|
| An axis meets the trigger and the gate at a question boundary | It is a candidate at that boundary |
| It still meets them at the next boundary and was not shown | It is a candidate again. Nothing is queued: the candidate is worked out from the state each time |
| Several axes qualify at one boundary | The card puts forward one, by the same order as axis closeness: the widest lead; on equal leads the one with more answered questions behind it; then the earlier one in the quiz's order |
| The axis put forward also qualifies for axis closeness | The event model shows one of the two. Either way the axis is spoken about |
| The axis has already had a puzzle or an axis closeness card | Never a candidate again in this run. One axis, one card |
| The lead falls under 15 points before the card is shown | It stops being a candidate. A near-tie has nothing to guess at |
| One of the two values is absent | Not a candidate. A lead needs two values |
| An axis read as one-sided | Not eligible. There is no second pole to offer; the single variant of axis closeness is its card |
| The card was shown and later answers overturn the reading | Nothing. There is no correction card |
| The taker goes back and removes answers behind a shown axis | The axis stays spoken about |
| The quiz is reset | A new run: every axis can get a card again |
| Checkpoints were turned off earlier | Never shown |
| The quiz has no eligible axis | The card never fires. Nothing replaces it and the taker sees no gap |

The pacing numbers that decide whether an offered card is shown are the event model's and are not repeated here.

### Options
| Case | Behaviour |
|---|---|
| Always | Two option rows, one per pole |
| Order | The start pole first, the end pole second - the same order as the caps of the bar above them. The order is not shuffled |
| A row | The pole's image on its colour, then its name |
| The correct option | The leading pole. Nothing on the card marks it before the tap |
| Distractors | None. Both rows are the axis's own poles |

### Ask
| Case | Behaviour |
|---|---|
| Visual | A double-sided bar with both caps and both pole names under them, the whole track covered by the hatched mask |
| Fills, marker | Not drawn. Nothing about either value can be read from the masked bar |
| Text | The ask line |
| Options | The two option rows, under the text |
| "Dalej" | Not offered. The guess is the only way forward, apart from turning checkpoints off |
| "Wyłącz checkpointy" | Offered, as on every card |

This follows the ask frame of this card, which has no "Dalej", and the doc, which says so in words. The [double axis puzzle](./double-axis-puzzle.md) asks differently.

### Guess
| Case | Behaviour |
|---|---|
| The taker taps the option of the leading pole | The card moves to hit |
| The taker taps the other option | The card moves to miss |
| A second tap, on either option, while the card is changing | Ignored. The first tap is the guess |
| After the guess | The option rows are gone and the guess cannot be changed |
| "Wyłącz checkpointy" tapped while asking | The frame's opt-out. Nothing is revealed |

Hit or miss is decided against the two values read when the card fired. The card never recomputes them.

### Reveal
The reveal is immediate and in place: the same card, with the mask lifted.

| Case | Behaviour |
|---|---|
| Visual, hit and miss alike | The same double-sided bar, uncovered: each side filled from its own cap in its pole's colour, the marker at the midpoint, both names under the caps |
| Numbers | Not drawn on the bar, in any state of this card |
| Values that do not reach 100 together | The gap stays in the middle, as the universal axis draws it |
| Text, hit | The hit line, naming the leading pole |
| Text, miss | The miss line. It may name the leading pole; either way the bar shows how it came out |
| The option the taker tapped | Not marked, not coloured and not repeated. A miss is not shown as an error |
| "Dalej" | Offered. It continues to the next question |
| "Wyłącz checkpointy" | Offered |
| The taker prefers reduced motion | The mask is swapped for the fills at once, with no transition |

Unlike the result's [double axis chart](./double-axis-chart.md), the card has no module wrapper, no title chip, no statistics or info buttons and no comparison.

### Text
| State | Slot | Figma text, exactly | What varies |
|---|---|---|---|
| Ask | Lead-in | "Jak myślisz?" | The line, drawn from the ask pool |
| Ask | Statement | "Do czego jest Tobie bliżej? Zgadnij teraz!" | The line, drawn from the ask pool |
| Ask | Option rows | "Interwencjonizm", "Wolny rynek" | The names of the two poles |
| Every state | Names under the bar | "Interwencjonizm", "Wolny rynek" | The names of the two poles |
| Hit | Lead-in | "Trafione!" | The line, drawn from the hit pool |
| Hit | Statement | "Wolny rynek jest ci najbliższy na tym etapie quizu." | The line, drawn from the hit pool. "Wolny rynek" is the slot for the leading pole's name |
| Miss | Lead-in | "A to ciekawe!" | The line, drawn from the miss pool |
| Miss | Statement | "Wyszło inaczej niż myślałeś." | The line, drawn from the miss pool. The Figma line has no slot; the pool has one for the leading pole's name |
| Ask | Buttons | "Wyłącz checkpointy" | Nothing. It belongs to the frame |
| Hit, miss | Buttons | "Dalej", "Wyłącz checkpointy" | Nothing. They belong to the frame |

The lead-in is drawn muted and the statement strong, as on every card. The frame draws the dash between them.

Two of the Figma lines cannot go into a pool as written, and the [checkpoint random copy](./checkpoints-random-copy.md) spec holds the lines that replace them:

- **The miss statement uses a gendered verb form** - "myślałeś". The taker's gender is not known during the questions, so every line of the three pools has to be neutral.
- **The hit statement bends an adjective to the pole's name** - "najbliższy" fits "Wolny rynek" and not "Religijność". A pole's name is author-supplied, so every line keeps it in the nominative and agrees nothing with it.

Every hit line keeps the hedge of the frame - "na tym etapie quizu" or words to the same effect - so the reveal reads as a standing that can still move.

## States and lifecycle
| State | Condition | What is possible in it |
|---|---|---|
| Ask | The card was just shown | Tap one of the two options, or turn checkpoints off |
| Hit | The taker tapped the leading pole | Continue, or turn checkpoints off |
| Miss | The taker tapped the other pole | Continue, or turn checkpoints off |

The card starts in ask and moves once. The state lasts as long as the card is on screen. If the questionnaire shows the same card again after a page refresh, it starts in ask again with the same axis and the same values, and the earlier guess is gone.

## Rules and constraints
- **Hit or miss, never right or wrong.** No state uses the words or the colours of an error or a success. The taker's expectation is not what is being marked.
- **The mask hides everything a value could leak.** No fill, no marker, no number and no description of the values exists in the ask state, for any way of reading the card.
- **The reading is the one of the moment the card fired.** Nothing on the card updates while it is open.
- **One axis, one card.** A puzzle and an axis closeness card never share an axis in one run.
- **Two-pole axes only.** The card has no form for an axis with one orientation.
- **Nothing here is configurable.** No author setting turns the card on or off, picks its axis or changes its wording.

### Calls
| Call | Cost |
|---|---|
| The reveal is on the card. The event model doc describes a follow-up a few questions later, and the card's doc leaves it open | No second beat of anticipation |
| The ask state has no "Dalej", as its frame and the doc say | A taker who does not know the two words can only guess blindly or turn every checkpoint off, and that opt-out is permanent in practice |
| The bar carries no numbers on this card, as in all three frames. The result's double axis chart draws them | The reveal is less exact than the result, and the universal axis has to learn to leave numbers out |
| The options keep the order of the bar and are not shuffled | The first row is the start pole every time, so a taker who taps the first row without reading always guesses the same side |
| With several axes passing the gate, the widest lead is offered | The safest reading wins the slot, which is also the one the taker is most likely to guess. Hits become cheaper and misses rarer |
| Once per axis, with no limit of its own per quiz | In a quiz with nothing but axes, pacing allows up to three puzzles in one run |
| Axes with several orientations on a side are left out, as in axis closeness | Aggregated axes, the compass axes among them, never get a puzzle |
| The guess is not kept anywhere. The doc of the sibling puzzle calls it worth keeping | The comparison between expectation and result is lost until the result can carry it |

## Invalid and edge input
| Input | Behaviour |
|---|---|
| An axis names an orientation the quiz does not have | That reference is dropped, as the universal orientation specifies. An axis left with an empty side is not eligible |
| A pole without a name, or with a name of only space | The axis is not eligible. An option without a name cannot be guessed |
| A pole name with two forms | The form the universal orientation gives a taker who was not asked their gender yet |
| A pole name with line breaks or doubled spaces | Collapsed to one line |
| A pole without an image | Its cap and its option row show the colour alone |
| A pole without a colour | The neutral fallback, on the cap, the fill and the option row |
| Both poles without image and colour | The two rows differ by name only. The card is still shown |
| A pole name longer than its option row | It wraps onto further lines. It is never cut |
| A pole name longer than the room under the bar | Truncated by the bar, complete for assistive technology |
| A value absent or not a number | Treated as absent. The axis is not a candidate |
| A value outside 0-100 | Clamped before the lead is measured |
| Values that exceed 100 together | The lead is measured on the values as given; the bar scales the fills |
| Both values equal | No leading pole. The axis is not a candidate |
| A pool line without the name slot | Shown as written |
| A line longer than the card | It wraps onto further lines |

Nothing here throws, and a card that cannot be built is skipped without the taker seeing anything.

## Privacy and data handling
- **The guess is a statement about the taker's political self-image.** It lives in the card for as long as the card is on screen. It is not kept with the session, not sent with the result and not sent to analytics.
- **The reading is part of the running state.** It is computed on the device from the answers and is never sent.

## Non-functional

### Rendering contexts
The questionnaire only, inside the card frame, at every width the questionnaire supports. The card is not part of the result screen or of the generated result image.

### Accessibility
- The two options are buttons, grouped and named by the statement. Each is named by its pole; the image adds nothing to the name.
- Keyboard: the options are reached in their order, before the frame's buttons, and each is activated with Enter or Space. Each shows a visible focus state. No other key is bound.
- The pressable area of an option is at least the minimum touch target.
- The masked bar is announced as a single image whose description names both poles and says the reading is hidden. It carries no value.
- The uncovered bar is announced as a single image whose description names both poles and says which one the taker is closer to. It carries no numbers, as the bar shows none.
- When the card moves to hit or miss, focus moves to the new text, as the frame does for every card that changes in place, so the new lead-in and statement are announced without the taker having to look for them. "Dalej" is the next stop. Focus is never left on an option that is gone.
- Hit and miss differ by their words, never by colour alone.

## Dependencies
Needs the [checkpoints](./checkpoints.md) frame, the [event model](./event-model.md) with the running state it defines (both values of every axis, the answered questions behind it, the axes already spoken about), three pools in [checkpoint random copy](./checkpoints-random-copy.md), and the [universal axis](./universal-axis.md). It is built after [axis closeness](./axis-closeness.md), which shares its gate and the rule of one card per axis.

What the card needs and the app cannot do today:

| Need | Today |
|---|---|
| A masked bar: caps and names drawn, the whole track hatched, no fills, no marker | The universal axis hatches only the band between a taker and the other side of a comparison. Hatching the whole track needs a comparison and draws its image |
| A bar without numbers, to the eye and in its description | The universal axis always draws a value that fits and always announces it. Axis closeness needs the same addition and brings it |
| A bar description that says "hidden" or "closer to", with no values | The universal axis writes its own description from names and values |
| An option row with an orientation's image and name | The answer row of the questionnaire has a fixed icon per answer kind and no image |
| "Dalej" left out in one state of a card | Decided by the checkpoints frame |

Relies on:

- [Single axis puzzle doc](../../docs/modules/quiz/questionnaire/checkpoints/single-axis-puzzle.md) - the idea this implements.
- [Universal axis](./universal-axis.md) - the bar, and [universal orientation](./universal-orientation.md) - what a pole is.
- [Double axis chart](./double-axis-chart.md) - the uncovered bar is that module's bar, without its frame.

Relied on by:

- [Double axis puzzle](./double-axis-puzzle.md) - reuses the option row and the bar without numbers.
- [Axis closeness](./axis-closeness.md) - an axis that had this card gets none of its own.
