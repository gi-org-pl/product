# Stats chart

> Technical specification of the checkpoint card that shows how everyone answered the thesis the taker just answered, when the taker's side is a rare one.

Docs: [Stats chart](../../docs/modules/quiz/questionnaire/checkpoints/stats-chart.md). | Design: [Figma](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5515-67733)

![Stats chart checkpoint](../../assets/stats-chart-checkpoint.png)

## Kind
Front-end

## Scope
One checkpoint card: what it puts into the shared card frame (a pie of three slices with its legend in the visual slot, a lead-in and a statement quoting the thesis), which questions it can speak about, when an answer counts as rare, how often the card appears, and what it needs from a source of answer counts.

**No such source exists today.** The survey API serves quizzes and results and nothing that counts answers across takers. This spec therefore describes the counts as an interface the card consumes - their shape, the smallest sample and how old they may be - and the card is built so that its trigger never fires while no source is configured. The source itself, and the statistics module of the result screen that would share it, are not specified here: [module statistics](../../docs/modules/quiz/results/module-statistics.md) is still an empty doc.

Not covered here:

- **The card frame, the progress bar and the controls above it, the buttons "Dalej" and "Wyłącz checkpointy"** - the [checkpoints](./checkpoints.md) spec.
- **Which card wins a slot, the pacing numbers and the opt-out** - the [event model](./event-model.md) spec. This spec states the card's own trigger and gate.
- **Which answers are agreement and which are custom** - the [answer model](./answer-model.md) spec.
- **The pools of alternative lines** - the [checkpoint random copy](./checkpoints-random-copy.md) spec.
- **How answers are counted, stored and served** - a back-end functionality with no doc and no spec yet. It belongs with [module statistics](../../docs/modules/quiz/results/module-statistics.md) and the [data module](../../docs/modules/data/README.md).
- **The statistics shown on the result screen** - [module statistics](../../docs/modules/quiz/results/module-statistics.md). Its Figma frame draws a pie with a legend; this card draws the same kind of pie and nothing else of that frame.

## Data
| Input | Data | Meaning | Rules |
|---|---|---|---|
| Question just answered | Its text, its possible answers and the kind of each | The thesis | From the quiz and the answer model |
| The taker's answer | One possible answer, or a skip | Which side the taker is on | From the session |
| Counts | For the quiz: when they were computed. For each question: results counted, and for each possible answer how many results chose it | How everyone answered | From the aggregate source - see Interface. Optional as a whole and per question |
| Lead-in and statement | Text with two slots | The line drawn for this card and side | From the copy pool |

A question is **eligible** when every one of its possible answers is on the agreement scale, so that "for" and "against" mean something. A question with a custom answer is not.

The three **slices**, for one question:

| Slice | Count |
|---|---|
| For | Results that chose "strongly agree" or "agree" |
| Against | Results that chose "disagree" or "strongly disagree" |
| No answer | Results counted, minus the two above - results in which the question was skipped |

The **sample** is for plus against: the takers who actually answered.

The **taker's side** is for or against, by the answer just given. A taker who skipped has no side.

The **share** is the count of the taker's side divided by results counted - a share of everyone who was shown the question, so it is the size of that side's slice.

## Interface
| Direction | Name | Shape | Notes |
|---|---|---|---|
| In | Aggregate source | See the table below | Read once per page load, for one quiz. Not available today |
| In | Source address | One setting of the app | When it is not set, the card's trigger never fires and nothing is requested |
| In | Line | Lead-in, and a statement for the taker's side | Drawn by the copy pool |
| Out | Candidate | The question just answered, with its three counts and the share | Offered to the event model at that question boundary only |
| Out | Card content | The three counts for the pie, the lead-in, the statement | Handed to the card frame when the event model picks this card |

What the card needs the source to answer, for one quiz:

| Part | Shape | Meaning | Rules |
|---|---|---|---|
| Request | The quiz identifier | Which quiz's counts are wanted | It carries nothing about the taker: no session, no answer, no demographics |
| Computed at | A date and time | When the counts were taken | Required |
| Results counted, per question | A whole number | Finished results of this quiz in which the question was shown | A result is submitted only after the last question, so this is every result of the quiz |
| Chosen, per possible answer | A whole number | Results in which that answer was the one chosen | Skips are not sent with a result, so they are what is left over |

One quiz means one version of a quiz: question and answer identifiers belong to a version, and counts are never added up across versions by the card.

The counts are per possible answer and not "for" and "against", because the kind of an answer is worked out in the questionnaire.

## Behaviour

### When it may fire
| Property | Value |
|---|---|
| Trigger | The taker just answered an eligible question, usable counts exist for it, and the share of the taker's side is 10% or less |
| Gate | No confidence gate. The sample for the question is at least 100 |
| Class | Personal |
| How often | Once in a run of the quiz |

| Case | Behaviour |
|---|---|
| The share is 10% or less, the sample is 100 or more | The question is a candidate at the boundary after it, and only there |
| The share is exactly 10% | A candidate |
| The share is above 10% | Nothing |
| The sample is under 100 | Nothing, however small the share |
| Nobody chose the taker's side yet | A candidate. The statement reads "1%" |
| The taker agreed and agreement is rare, or disagreed and disagreement is rare | The same card, with the wording of that side |
| The taker skipped the question | Nothing |
| The question has a custom answer | Nothing |
| Another card wins the slot, or pacing allows none | Dropped. The question is not brought up later |
| The card was already shown in this run | Nothing, on any later question |
| The taker goes back and answers the question again, and no stats card was shown yet | It is a candidate again at that boundary |
| The quiz is reset | A new run |
| Checkpoints were turned off | Never shown |
| No source address is set | Never shown. Nothing is requested |
| The counts have not arrived when the answer is given | Nothing for that question. The questionnaire never waits for them |

The share is compared exactly, before any rounding.

### Visual
The visual slot holds a pie and a legend beside it.

| Case | Behaviour |
|---|---|
| Any question | Three slices sized by the three counts: for, against, no answer, in the colours of the frame |
| A count of zero | No slice. Its legend row stays |
| A count above zero that is a tiny share | Still a visible slice |
| Legend | Three rows, always, in the order for, against, no answer, each a colour dot and a name |
| The taker's slice | Not marked. The statement says which side it is |

The pie carries no numbers and the legend no percentages: the one number on the card is in the statement.

### Text
| Slot | Figma text, exactly | What varies |
|---|---|---|
| Legend | "Za", "Przeciw", "Brak odpowiedzi" | Nothing |
| Lead-in | "Rzadki okaz" | The line, drawn from the pool |
| Statement | "Należysz do 10% osób, które popierają tezę “Wielka Polska Katolicka w silnej chrześcijańskiej Europie.”." | The share, the thesis, and the wording of the side |
| Buttons | "Dalej", "Wyłącz checkpointy" | Nothing. They belong to the frame |

The frame draws only the "for" side. The card needs one statement per side:

| Taker's side | Statement |
|---|---|
| For | "Należysz do {percent}% osób, które popierają tezę „{thesis}”." |
| Against | "Należysz do {percent}% osób, które nie zgadzają się z tezą „{thesis}”." |

| Slot | Rule |
|---|---|
| Percent | A whole number: the share rounded up, and never below 1 |
| Thesis | The question's text as written, with one closing full stop removed, inside quotation marks, set apart from the rest of the statement as the frame does with italics |
| The full stop after the closing mark | The statement's own, and the only one. The thesis gives up its closing full stop, so the frame's two full stops around the closing mark are not repeated |

Neither statement has a verb form that depends on the taker's gender, and every line of the pools has to keep that. The lead-ins of the two sides keep the same tone: a rare agreement and a rare disagreement are the same event. The two statements above are the first lines of this card's two pools. Every line is held in the [checkpoint random copy](./checkpoints-random-copy.md) spec, and its wording is the one that stands.

## States and lifecycle
The card has one look, with the wording of one of two sides. What has states is the source.

| State | Condition | What is possible in it |
|---|---|---|
| Off | No source address is set | The card never fires. This is the state of the product today |
| Loading | Counts were requested and have not arrived | No candidate. Questions go on |
| Usable | Counts arrived, are well-formed and were computed no more than 24 hours before they were read | Questions are checked as they are answered |
| Unusable | The request failed, or the counts are malformed or older than that | The card never fires for the rest of this page load |
| Spent | The card was shown once in this run | Nothing more until a reset |

Counts are read once per page load and kept for it. The card on screen does not change while it is open.

## Rules and constraints
- **A share of everyone who saw the question.** The number in the statement is the size of a slice of the pie, so the two can never disagree.
- **The thesis is quoted, never paraphrased.** No shortening, no ellipsis, no change of case. Its one closing full stop is the only character left out.
- **No rarity on thin data.** Under 100 real answers the card says nothing.
- **The same tone both ways.** The card never treats one side as the normal one.
- **Counts only.** The card shows three totals and never anything about another taker.
- **The questionnaire never waits for the source.** Counts are fetched beside the quiz, not before it and not per question.
- **Nothing here is configurable by an author.**
- **Not supported: the four agreement steps as four slices,** a split by demographics, counts across quiz versions, and live updating.

### Calls
| Call | Cost |
|---|---|
| Rare means a share of 10% or less with a sample of at least 100. The doc gives no numbers | A small community quiz never shows the card |
| The share counts skips in the total, as the doc asks | On a question most takers skip, both sides can be rare and the card flatters everyone who answers |
| Only questions answered on the agreement scale qualify. The doc says "any question in any quiz" | Quizzes built from custom answers never show the card |
| Once in a run | A taker with several rare answers hears about the first one that wins a slot |
| The card is offered only right after the answer | A rare answer given while another card had the slot is never mentioned |
| Counts are read once per page load and may be up to 24 hours old | The same answers always give the same cards only for the same counts; two takers a day apart can get different cards |
| The source returns counts per possible answer | The questionnaire does the adding up, and a bigger payload travels than three numbers per question |
| The share is rounded up and never reads below 1 | "1%" is printed for a side nobody chose yet |
| A wording for the "against" side is added; the frame has only "for" | One more line per pool entry to write and review |
| The card draws its own pie, since no statistics module is built. The doc says it reuses that module | When the statistics module is specified, the two have to be brought onto one pie and one source |
| The thesis is quoted without its closing full stop, and the statement ends with its own. The frame draws both | One character of the author's text is dropped |
| The card is built before any source exists | It ships as dead weight until a back-end counts answers |

## Invalid and edge input
| Input | Behaviour |
|---|---|
| No "computed at", or one that is not a date, or one in the future | The counts are unusable |
| No entry for the question just answered | Nothing for that question |
| A count that is negative or not a whole number | Nothing for that question |
| The answers of a question add up to more than its results counted | Nothing for that question |
| Results counted is zero | Nothing for that question |
| Counts for a question or an answer the quiz does not have | Ignored |
| An answer of the question has no count | Read as zero |
| A possible answer with a text the agreement scale does not know | The question is not eligible |
| A thesis longer than the card | It wraps onto further lines in full. The card grows; nothing is cut |
| A thesis with line breaks or doubled spaces | Collapsed to one paragraph |
| A thesis that contains quotation marks | Shown as written, inside the statement's own marks |
| An empty thesis | Nothing. There is no question to show either |
| A pool line without a slot | Shown as written |

Nothing here throws, and bad counts for one question never cost the others.

## Privacy and data handling
- **Political opinions are special-category data.** The card only ever receives totals, and shows none under a sample of 100, so a single taker cannot be read out of a slice.
- **The request says nothing about the taker.** It names the quiz. It never carries the session, the answer just given, demographics or an e-mail address.
- **The taker's own answer is not added by the card.** It reaches the counts, if at all, with the result at the end, like every other answer.
- **Nothing is kept.** The counts live for the page load and are not written to the session.

## Failure modes
| Failure | Behaviour |
|---|---|
| The source cannot be reached or answers with an error | No stats card for this page load. No message, no retry while the taker is answering |
| The counts arrive late | They are used from the next answered question on |
| The counts are malformed | The same as unreachable |
| The counts are older than 24 hours | The same as unreachable |
| The source fails while a stats card is on screen | Nothing. The card already holds its numbers |

The quiz, its questions and every other card are unaffected by any of these.

## Non-functional

### Rendering contexts
The questionnaire only, inside the card frame, at every width the questionnaire supports. At the narrowest width the legend may move under the pie; the three names are never cut.

### Accessibility
- The pie is one image with a description in words: the three slices with their shares as whole percents, for example "Za: 13%, Przeciw: 57%, Brak odpowiedzi: 30%".
- The legend is text. The colour dots are decorative; the names carry the meaning.
- Which slice is the taker's is said by the statement, never by colour.
- The thesis is marked as a quotation, so it is not read as the product's own words.
- The lead-in and the statement are read after the pie, as one sentence.
- Focus, the announcement when the card appears and the two buttons are the frame's.

### Performance
One request per page load. For a quiz of a hundred questions with four answers each it is a few hundred numbers. It never delays the first question.

## Dependencies
Needs the [checkpoints](./checkpoints.md) frame, the [event model](./event-model.md), the [answer model](./answer-model.md) for the kind of each answer, and two pools in [checkpoint random copy](./checkpoints-random-copy.md).

What it needs that is not there today:

- **A source of answer counts.** Nothing in the survey API counts answers across results. Until one is specified, built and its address set, the card is built and never shown.
- **A pie.** The app has no pie chart and no statistics module. The card draws its own, following its frame and the pie of the statistics module's frame.

Relies on:

- [Stats chart doc](../../docs/modules/quiz/questionnaire/checkpoints/stats-chart.md) - the idea this implements.
- [Module statistics](../../docs/modules/quiz/results/module-statistics.md) - the result-screen functionality that should own the counts and the pie. It is an empty doc; when it is written, this spec's Interface is the part of its contract the questionnaire needs.

Relied on by nothing. It is the last card to become useful, because it waits for a back-end.
