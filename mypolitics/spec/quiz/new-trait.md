# New trait

> Technical specification of the checkpoint card that announces a trait once the taker's answers have earned it for good.

Docs: [New trait](../../docs/modules/quiz/questionnaire/checkpoints/new-trait.md). | Design: [Figma](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5515-67457)

![Trait checkpoint](../../assets/trait-checkpoint.png)

## Kind
Front-end

## Scope
One checkpoint card: what it puts into the shared card frame (one trait pill in the visual slot, a lead-in and a statement naming the trait), when a trait counts as earned mid-quiz, when the card asks to be shown, how often, and what happens in a quiz that has no traits. The card is passive: it announces and takes no input.

The pill is the one the [traits](./traits.md) module draws on the result screen, alone and without the module's frame.

Not covered here:

- **The card frame, the progress bar and the controls above it, the buttons "Dalej" and "Wyłącz checkpointy"** - the [checkpoints](./checkpoints.md) spec.
- **Which card wins a slot, the pacing numbers, the opt-out and the running state with its scores** - the [event model](./event-model.md) spec. This spec states the card's own trigger and gate, and which trait it puts forward.
- **How the pill looks** - the [traits](./traits.md) spec.
- **What an orientation is, and that a trait is an orientation used as one** - the [universal orientation](./universal-orientation.md) spec.
- **The pools of alternative lines** - the [checkpoint random copy](./checkpoints-random-copy.md) spec.
- **Which traits the result screen shows** - scoring and the [traits](./traits.md) module. This card must never announce a trait the result will not show; it may stay silent about one the result does show.
- **Whether a trait's name is acceptable** - moderation.

## Data
| Input | Data | Meaning | Rules |
|---|---|---|---|
| Traits of the quiz | A list of orientations | The orientations this quiz uses as traits | In the quiz's order. The same list the traits module on the result screen is given. **No quiz carries one today** - see Dependencies |
| Questions | Each question's possible answers and the orientations each one scores | What ties a question to a trait | From the quiz |
| Answers | For each question: answered with which answer, skipped, or still open | The taker's session | From the running state |
| Trait score | Points and the most points possible, over the questions answered so far | Whether the answers line up | From the running state |
| Traits already announced | A set | Traits that had this card in this run | From the event model |
| Lead-in and statement | Text with one name slot | The line drawn for this card | From the copy pool |

A **trait** is an orientation: a name, an icon and a colour, all author-written and untrusted. The API has no orientation type for it.

A question is **tied to a trait** when at least one of its possible answers scores that trait.

A trait is **complete** when every question tied to it has an answer. A skipped question has no answer, so one skip among them keeps the trait from ever being complete in this run.

The answers **line up** when the trait's points equal the most points possible - in every tied question the taker chose the answer that scores the trait highest. It is the rule myPolitics has always used for traits.

A trait is **earned for good** when it is complete and its answers line up. No later answer can take it away; only going back can.

## Interface
| Direction | Name | Shape | Notes |
|---|---|---|---|
| In | Quiz | Traits, questions, orientations | Read once per quiz and language |
| In | Running state | Answers and the score of each trait | Read at every question boundary |
| In | Traits already announced | A set of traits | Kept by the event model for the run |
| In | Line | Lead-in and statement with the name slot | Drawn by the copy pool |
| Out | Candidate | At most one trait per question boundary | Offered to the event model |
| Out | Card content | The trait for the pill, the lead-in, the statement | Handed to the card frame when the event model picks this card |
| Needs | The trait pill on its own | One pill, outside the traits module and outside a list | Not available today: the pill exists only inside the module. See Dependencies |

The card raises no event of its own.

## Behaviour

### When it may fire
| Property | Value |
|---|---|
| Trigger | A trait is earned for good and has not been announced. It is a standing trigger: true from the boundary at which the last open question tied to the trait was answered, and looked at again at every boundary until the trait is announced |
| Gate | None of its own. Being complete is the gate: the claim can no longer be overturned by answering |
| Class | Personal |
| How often | Once per trait in a run |

| Case | Behaviour |
|---|---|
| The last question tied to a trait is answered and everything lines up | The trait is a candidate at that question boundary, and at every later one until it is announced |
| The answers line up so far, and tied questions are still open | Nothing. The card waits until the trait is safe |
| One tied answer falls short of the highest-scoring one | The trait is lost for this run. Nothing is shown, then or later |
| A tied question is skipped | The trait cannot become complete. Nothing is shown |
| Another card wins the slot, or pacing allows none at that boundary | No card for the trait at that boundary. It stays a candidate and is offered again at the next one. Nothing is queued: the candidate is worked out from the state each time |
| Several traits are earned and not yet announced | The card puts forward the one that comes first in the quiz's order. The others stay candidates and wait their turn at later boundaries |
| The trait becomes earned within the last questions, where pacing allows no card | No boundary is left for it. The taker meets the trait on the result screen |
| The taker goes back after the card and changes a tied answer | Nothing. The card is not taken back, and the trait is not announced a second time if it is earned again |
| The taker goes back before the card was ever shown and earns the trait again | It is a candidate again from the boundary where it becomes complete |
| The quiz is reset | A new run: every trait can be announced again |
| Checkpoints were turned off | Never shown |
| The quiz has no traits, or no question is tied to a trait | Never shown. The quiz runs without this card |

### Visual
| Case | Behaviour |
|---|---|
| Any trait | One pill in the middle of the visual slot: the trait's icon, then its name, on the trait's colour - the pill the traits module draws for a trait only the taker earned |
| A trait without an icon | The name alone |
| A trait without a colour | The neutral fallback colour |
| A trait with a light colour | Dark text, as in the traits module |
| The pill is pressed | Nothing happens |

There is never a second pill, an avatar or hatching: the card is about one trait and one person.

### Text
| Slot | Figma text, exactly | What varies |
|---|---|---|
| Pill | "Monarchizm" | The trait's name, as written |
| Lead-in | "A to niespodzianka!" | The line, drawn from the pool |
| Statement | "Zdobyłeś cechę “Monarchizm”... to dobrze, niedobrze?" | The line and the name in it |
| Buttons | "Dalej", "Wyłącz checkpointy" | Nothing. They belong to the frame |

"Zdobyłeś" is a masculine form, and the taker's gender is not known during the questions. The statement this card needs says the same without it:

| Statement | Slot |
|---|---|
| "Masz nową cechę: „{trait}”... to dobrze, niedobrze?" | The trait's name, as written, inside quotation marks |

Every line of the pool has to hold to the same rules: no verb form that depends on the taker's gender, the name whole and in the nominative, and no verdict on the trait - the frame's line asks "good, bad?" and does not answer. The statement above is the first line of this card's pool. Every line is held in the [checkpoint random copy](./checkpoints-random-copy.md) spec, and its wording is the one that stands.

## States and lifecycle
The card has one look.

| State of a trait | Condition | What is possible in it |
|---|---|---|
| Open | Tied questions are still unanswered and nothing has broken the agreement | Nothing yet |
| Lost | A tied answer fell short, or a tied question was skipped | Nothing in this run, unless the taker goes back |
| Earned for good | Complete and lined up, and not announced yet | The event model shows the card at this boundary or at a later one |
| Announced | The card was shown | Nothing more in this run |

## Rules and constraints
- **Never revoked by answering.** The card only speaks when no later answer can take the trait away.
- **One trait per card.** Two traits earned together do not share a card. The second stays a candidate and waits for a later slot.
- **A set, not a score.** The card shows no number, no bar and no "how close" for a trait that is not complete.
- **No judgement.** Neither the card nor any pool line says whether the trait is good.
- **Nothing here is configurable.** If the quiz has traits the card works; the author writes nothing for it.
- **Not supported: announcing on unlock.** A trait that looks earned halfway through its questions is not announced with a caveat.
- **Not supported: a description of the trait.** The card names it and does not explain it.

### Calls
| Call | Cost |
|---|---|
| The trait is announced only when it is complete - the doc's "announce when it is safe" | Most traits complete late, where pacing allows fewer cards, and some never get a card |
| "Line up" means the highest-scoring answer in every tied question, the rule the previous myPolitics used | "Rather agree" once is enough to lose a trait |
| A skipped tied question keeps the trait from being announced | The result can show a trait the taker never saw announced, if scoring ignores skipped questions |
| An earned trait stays a candidate at every boundary until it is announced, as the event model's standing trigger says | The card can appear several questions after the answer that earned the trait |
| Of several traits earned together the first in the quiz's order is taken first | The others wait for later slots, and in the last stretch of a quiz pacing may leave them none |
| The quiz's traits come from one list the API has to send; the card does not guess them from the orientation type or from which orientations sit on no axis | Until the API sends the list the card appears in no quiz |
| The statement is rewritten without the gendered verb, unlike the frame | "Masz nową cechę" loses the sense of having earned something that "Zdobyłeś" has |
| Going back after the card does not retract it | A taker who steps back and changes an answer has seen a trait the result will not show |

## Invalid and edge input
| Input | Behaviour |
|---|---|
| The list of traits is missing, empty or not a list | The quiz has no traits |
| A trait the quiz's orientations do not include | Ignored |
| The same trait listed twice | One trait |
| A hidden trait | Never announced. Hidden wins |
| A trait without a name | Never announced, as the traits module never draws it |
| A trait no question is tied to | Never earned |
| A trait whose most points possible is zero or absent | Never earned |
| A name longer than the card | The pill is as wide as the visual slot at most and truncates the name to one line, complete for assistive technology. In the statement the name wraps and is never cut |
| A name with line breaks or doubled spaces | Collapsed to one line |
| A name that contains quotation marks | Shown as written, inside the statement's own marks |
| A name with two forms | The form the universal orientation gives a taker who was not asked their gender yet |
| A pool line without the name slot | Shown as written |

Nothing here throws. A trait that cannot be read is skipped without the taker seeing anything.

## Privacy and data handling
- **A trait is a political label on a person.** The card shows it to that person only, inside their own session. It is not stored, not sent and not part of anything that can be shared from the questionnaire.
- **The answers behind it never leave the device for this card.** Whether a trait is earned is worked out in the questionnaire.

## Non-functional

### Rendering contexts
The questionnaire only, inside the card frame, at every width the questionnaire supports. The pill is the one the result screen and the generated result image use, at the same size.

### Accessibility
- The pill is a single item, not a list of one, and its name is text.
- The icon is decorative.
- The label stays readable on any trait colour, by the light-colour rule of the traits module.
- The lead-in and the statement are read after the pill, as one sentence. The statement carries the trait's name, so nothing depends on seeing the pill.
- Focus, the announcement when the card appears and the two buttons are the frame's.

## Dependencies
Needs the [checkpoints](./checkpoints.md) frame, the [event model](./event-model.md) with the running state it defines, one pool in [checkpoint random copy](./checkpoints-random-copy.md), and the built [traits](./traits.md) module and [universal orientation](./universal-orientation.md).

What it needs that is not there today:

- **The quiz's list of traits.** The API has no orientation type for a trait and no field that lists them, and none of the 14 quizzes it serves has an orientation used as one: every ideology of the identity quiz is a pole of an axis. It is asked of the back-end as a field of the quiz, by the rule of the universal orientation spec that a new property needs a new field. The result screen's traits module needs the same list.
- **The pill on its own.** In the app the pill is a part of the traits module and is written as a list item. It has to become usable outside the module without changing how it looks.
- **Scores during the quiz.** The running state brings the back-end's arithmetic to the questionnaire.

Relies on:

- [New trait doc](../../docs/modules/quiz/questionnaire/checkpoints/new-trait.md) - the idea this implements.
- [Traits](./traits.md) - the pill, its colour and icon rules.

Relied on by nothing. It can be built alongside the other cards.
