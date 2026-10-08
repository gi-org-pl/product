<img alt="Stats chart checkpoint" src="https://raw.githubusercontent.com/gi-org-pl/product/main/mypolitics/assets/stats-chart-checkpoint.png" />

# Story

As a user taking a quiz, I want to be shown how everyone answered the thesis I just answered when my side is a rare one, so that I see where I stand among other people and not only on a scale.

# Component properties

This task builds two things:

1. **`SurveyCheckpointStats`** - the stats chart card: a pie of three slices with its legend, and a statement that quotes the thesis.
2. **The reading side of the answer counts** - the one setting that holds the address of a source, the request, the checks on what comes back, and the place where the counts are handed to the engine.

**The card cannot appear today.** Nothing in the survey API counts answers across takers, so no source exists and no address is set. With no address nothing is requested, the engine gets no counts, and its trigger never fires. Part 2 is built against a contract, written out below, that a back-end has still to deliver.

The two parts do not depend on each other's code - the card draws a card member, the source fills an input of the engine - so they read well as two commits.

## 1. The card

**Component:** `SurveyCheckpointStats`
**Location:** `src/components/survey/SurveyCheckpointStats/`
**Shared:** no - domain component under `survey`

It renders exactly one `SurveyCheckpoint` (the frame of `survey-checkpoint`) and fills it. The card is passive.

```ts
// src/components/survey/SurveyCheckpointStats/SurveyCheckpointStats.tsx
export const SurveyCheckpointStats = ({
  card,       // StatsCheckpointCard - frozen when it fired:
              //   { type: "stats", boundary, line, questionId, thesis, side, counts: { for, against, noAnswer }, percent }
  onContinue, // passed to the frame unchanged
  onOptOut,   // passed to the frame unchanged
}: CheckpointCardProps<"stats">) => ...
```

The card has no props type of its own: `CheckpointCardProps<"stats">` is the whole contract. It does not use `onReveal` - it is not a puzzle.

```ts
// src/components/survey/SurveyCheckpointStats/SurveyCheckpointStats.types.ts
export type StatsSliceId = "for" | "against" | "noAnswer"; // the keys of `card.counts`, in the order they are drawn

export interface StatsSlice {
  id: StatsSliceId;
  from: number; // where the slice starts, as a share of the circle, 0-1
  to: number;   // where it ends
}

// SurveyCheckpointStatsChart/SurveyCheckpointStatsPie/utils/getPieSlices.ts
export const getPieSlices = (counts: StatsCheckpointCard["counts"]): StatsSlice[] => ...
// One slice per count above zero, in the order for, against, no answer. [] when the counts cannot be drawn.

// utils/getStatsShares.ts
export const getStatsShares = (card: StatsCheckpointCard): Record<StatsSliceId, number> | undefined => ...
// The three shares as whole percents, for the description of the pie. Nothing when the counts cannot be drawn.

// utils/useStatsDescription.ts
export const useStatsDescription = (card: StatsCheckpointCard): string | undefined => ...
// "Za: 13%, Przeciw: 57%, Brak odpowiedzi: 30%", translated.
```

**The registration** - one line in the registry of `survey-checkpoint`:

```ts
// src/components/survey/SurveyQuestionnaire/SurveyQuestionnaire.constants.ts
stats: SurveyCheckpointStats,
```

## 2. The source of counts

What the engine takes is already defined by `survey-checkpoint-engine` and is not changed here:

```ts
// src/types/checkpoint.ts - as defined by survey-checkpoint-engine
export interface CheckpointAnswerCounts {
  resultsCounted: number;         // results in which the question was shown
  chosen: Record<string, number>; // by possible answer identifier: results that chose it
}
export type CheckpointAggregates = Record<string, CheckpointAnswerCounts>; // by question identifier
```

This task fills it:

```ts
// The setting. Typed in src/vite-env.d.ts.
VITE_ANSWER_COUNTS_URL // the full address of the source. Unset or blank = no source: nothing is requested

// src/services/api/client/getAnswerCounts.ts
export const getAnswerCounts = (
  surveyId: string,
  options?: ApiRequestOptions,
): Promise<CheckpointAggregates | undefined> => ...
// The usable counts of one quiz, or nothing. Never rejects, and never requests anything when no address is set.

// src/services/api/utils/answer-counts/readAnswerCounts.ts
export const readAnswerCounts = (response: unknown, now: Date): CheckpointAggregates | undefined => ...
// The only place that knows a field name of the response. Nothing when the counts are malformed or too old.

// src/utils/survey/loadCheckpointAggregates.ts
export const loadCheckpointAggregates = (surveyId: string): Promise<CheckpointAggregates | undefined> => ...
// The counts of one quiz for this page load: the first call asks, every later call gets the same answer.

// SurveyQuestionnaireQuestions/utils/useCheckpointAggregates.ts
export const useCheckpointAggregates = (surveyId: string): (() => CheckpointAggregates | undefined) => ...
// Starts the load when the questions are first drawn. The returned function gives the counts if they have arrived.

// src/constants/checkpoint.ts - added
export const ANSWER_COUNTS_MAX_AGE_HOURS = 24;
```

**Where the counts are plugged in.** `getSessionCheckpoint` of `survey-checkpoint` already takes them as its fourth argument and hands them to the engine as `aggregates`; the screen passes nothing there today. This task passes them, in `useQuestionActions`:

```ts
getSessionCheckpoint(survey, session, getEnabledCheckpointTypes(CHECKPOINT_CARDS), getAggregates())
```

**What the source must deliver.** No endpoint exists, so this is the contract the questionnaire asks of the back-end. If the endpoint ships with other names, only the schema and `readAnswerCounts` change.

| Part | Shape |
|---|---|
| Request | `GET {VITE_ANSWER_COUNTS_URL}` with the query parameter `surveyId`. Nothing else: no session, no answer, no demographics, no e-mail address |
| `computedAt` | A date and time in ISO 8601: when the counts were taken. Required |
| `questions` | A list, one item per question of that quiz |
| `questions[].questionId` | The identifier of the question, as the survey API sends it |
| `questions[].resultsCounted` | A whole number: finished results of this quiz in which the question was shown |
| `questions[].answers` | A list, one item per possible answer |
| `questions[].answers[].answerId` | The identifier of the possible answer |
| `questions[].answers[].count` | A whole number: results in which that answer was the one chosen. Skips are not counted; they are what is left over |

```json
{
  "computedAt": "2026-10-08T06:00:00.000Z",
  "questions": [
    {
      "questionId": "question-1",
      "resultsCounted": 1240,
      "answers": [
        { "answerId": "answer-1", "count": 31 },
        { "answerId": "answer-2", "count": 62 },
        { "answerId": "answer-3", "count": 410 },
        { "answerId": "answer-4", "count": 365 }
      ]
    }
  ]
}
```

One quiz means one version of a quiz: the identifiers belong to a version, and counts are never added up across versions here. The counts are per possible answer and not "for" and "against", because the kind of an answer is worked out in the questionnaire.

### What this task uses from the tasks before it

No name of an earlier task is redefined here, and nothing is added to the engine.

| From | Used |
|---|---|
| `SurveyCheckpoint`, `SurveyCheckpointProps` (`survey-checkpoint`) | The frame: `visual`, `leadIn`, `statement`, `quote`, `onContinue`, `onOptOut`. `options` and `isContinueAvailable` are not passed |
| `CheckpointCardProps`, `CHECKPOINT_CARDS`, `getSessionCheckpoint`, `getEnabledCheckpointTypes` (`survey-checkpoint`) | The props of the card, the place it is registered, and the function that takes the counts |
| `useQuestionActions` (`survey-questionnaire`, extended by `survey-checkpoint`) | The one place a done question is handled. This task makes it pass the counts |
| `StatsCheckpointCard`, `CheckpointAggregates`, `CheckpointAnswerCounts` (`survey-checkpoint-engine`) | The card member and the input of the engine |
| `getCheckpointText(i18n, card)`, `getCheckpointSlots(card, pool)` (`survey-checkpoint-engine`) | The two texts of `card.line`; and the thesis exactly as the statement holds it, for `quote` |
| The pools `stats-for` and `stats-against` (`survey-checkpoint-engine`) | Their lines. Not edited here |
| `apiClient`, `ApiRequestOptions`, `ApiFailure` (`survey-api`) | The only Axios instance, and how a failed request is told |

### Where each part of the spec lands

| Part of the spec | Built in | Tested by |
|---|---|---|
| Which questions are eligible; the three slices; the sample; the taker's side; the share | `survey-checkpoint-engine` | `getQuestionCounts()` |
| When it may fire: a share of 10% or less, a sample of 100 or more, right after the answer only, once in a run; the percent rounded up and never below 1 | `survey-checkpoint-engine` | `getStatsCandidate()`, `getNextCheckpoint()` |
| Counts of one question that cannot be used: negative, not whole, adding up to more than the results counted, zero results | `survey-checkpoint-engine` | `getQuestionCounts()` |
| The lines of both sides; the thesis without its one closing full stop | `survey-checkpoint-engine` | `CHECKPOINT_POOLS`, `getCheckpointSlots()`, `getCheckpointText()` |
| The thesis marked up as a quotation; a long thesis wrapping | `survey-checkpoint` | `<SurveyCheckpointText />`, `splitByQuote()` |
| **The pie, the legend and their description; the source: its address, the request, "computed at", 24 hours, every failure; handing the counts to the engine; the registration** | **This task** | The cases below |

# Behaviour

The [stats chart spec](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/stats-chart.md) is the source of truth for every case below. The [Figma frame](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5515-67733) is the source of truth for sizes, spacing, type and colours: follow the frame.

### What the card puts into the frame

| Slot of the frame | Content |
|---|---|
| `visual` | The pie and, beside it, the legend |
| `leadIn`, `statement` | The two texts of `getCheckpointText(i18n, card)` |
| `quote` | The thesis exactly as the statement holds it: the `thesis` slot of `getCheckpointSlots(card, card.line.pool)`, on one line. The frame marks that part as a quotation |
| `onContinue`, `onOptOut` | The card's own, unchanged |
| `options`, `isContinueAvailable` | Not passed |

### Visual

| Case | Behaviour |
|---|---|
| Any card | Three slices sized by `card.counts`: for, against, no answer, in that order and in the colours of the frame |
| A count of zero | No slice. Its legend row stays |
| A count above zero that is a tiny share | Still a visible slice. The smallest share a slice is drawn at is a named constant |
| One count holds everything | A full circle in that slice's colour |
| Legend | Three rows, always, in the order for, against, no answer, each a colour dot and a name. The dot has the colour of its slice |
| The taker's slice | Not marked, in the pie or in the legend. The statement says which side it is |
| Numbers | None on the pie and no percentages in the legend. The one number on the card is in the statement |
| The narrowest width | The legend may move under the pie. The three names are never cut |
| The card stays open | Nothing on it changes. It holds its own numbers and reads no source |

### Text

The frame draws only the "for" side; the card has a wording for each side, and the engine has already drawn the line from the pool of the taker's side.

| Slot | Text |
|---|---|
| Lead-in | "Rzadki okaz" |
| Statement, for | "Należysz do {percent}% osób, które popierają tezę „{thesis}”." |
| Statement, against | "Należysz do {percent}% osób, które nie zgadzają się z tezą „{thesis}”." |

| Case | Behaviour |
|---|---|
| Any line of the two pools | Shown as drawn. The card never picks a line itself and never edits one |
| The percent | The card's own number, as given: a whole number, 1 to 10 |
| The thesis | Quoted as written - no shortening, no ellipsis, no change of case. Its one closing full stop is the only character left out, and the full stop after the closing mark is the statement's own |
| A thesis that contains quotation marks | Shown as written, inside the statement's own marks |
| A thesis longer than the card | It wraps onto further lines in full. The card grows; nothing is cut |
| The app's language changes while the card is up | The same line, the legend and the description in the other language. The thesis stays as the quiz wrote it |

### The description of the pie

| Case | Behaviour |
|---|---|
| Any card | The three slices with their shares as whole percents, in the order of the legend: "Za: 10%, Przeciw: 60%, Brak odpowiedzi: 30%" |
| The share of a slice | Its count divided by the three counts together |
| The taker's side | Reads the card's `percent`, so the description and the statement give the same number |
| The other two | Rounded to the nearest whole percent. The three need not add up to a hundred |
| A count of zero | "0%" - or, for the taker's side, the "1%" of the statement |

### The source of counts

| State | Condition | What happens |
|---|---|---|
| Off | `VITE_ANSWER_COUNTS_URL` is not set, or blank. The state of the product today | Nothing is requested. No counts reach the engine, and the card never fires |
| Loading | Counts were requested and have not arrived | No counts reach the engine. Questions go on |
| Usable | Counts arrived, are well-formed, and were computed no more than 24 hours before they were read | They are handed to the engine at every done question |
| Unusable | The request failed, or the counts are malformed or older than that | No counts for the rest of this page load. No message, no second request |

| Case | Behaviour |
|---|---|
| The questions are first drawn | The counts of this quiz are requested once. The first question never waits for them |
| A question is answered or skipped before the counts arrived | Nothing for that question. `useQuestionActions` passes what is there at that moment and never waits |
| The counts arrive late | They are used from the next done question on |
| The questions are drawn again - after a card, after a step back, after a reset | No second request: the same counts, or the same nothing |
| The page is reloaded | One new request |
| The source fails while a stats card is on screen | Nothing. The card already holds its numbers |
| Where the counts are kept | In the memory of the page. They are not written to the session or to storage, and they are not sent anywhere. A stats card that was shown keeps its own three totals in the session's record of cards, as every card keeps its values; the counts as loaded never go there |

`readAnswerCounts`:

| Response | Result |
|---|---|
| Well-formed | One entry per question: `resultsCounted`, and `chosen` by answer identifier |
| No `computedAt`, one that is not a date, or one later than `now` | Nothing. The counts are unusable |
| `computedAt` more than 24 hours before `now` | Nothing |
| `computedAt` exactly 24 hours before `now` | Usable |
| Not an object, or `questions` is not a list | Nothing |
| A question item that is not an object, has no identifier, or whose `resultsCounted` or any `count` is not a number | That question is left out. The others are kept |
| An answer item without an identifier | Left out |
| An answer item without a `count` | Left out. The engine reads a missing count as zero |
| A number that is negative or not whole | Passed as sent. The engine refuses that question, as it does for counts that add up to more than the results counted |
| Counts for a question or an answer the quiz does not have | Passed as sent. The engine never looks at them |

Bad counts for one question never cost the others, and no failure of the source touches the quiz, its questions or any other card.

### Invalid and edge input of the card

Nothing here throws. A card that cannot be drawn is never seen: the frame leaves by itself, calling `onContinue` once.

| Input | Behaviour |
|---|---|
| A count that is negative or not a number, or three counts of zero | `getPieSlices` returns no slice and `getStatsShares` nothing; nothing is passed as the visual. The frame draws nothing and leaves |
| `getCheckpointText` returns nothing - an empty thesis, a percent outside 1 to 10, a line that does not exist | A blank statement is passed. The frame draws nothing and leaves |
| A thesis with line breaks or doubled spaces | One paragraph, in the statement and in `quote` |

### Accessibility

- The pie is one image with a description in words: the three slices with their shares as whole percents. It is not interactive and not focusable.
- The legend is text. The colour dots are decorative; the names carry the meaning.
- Which slice is the taker's is said by the statement, never by colour.
- The thesis is marked as a quotation - through the frame's `quote` - so it is not read as the product's own words.
- The lead-in and the statement are read after the pie and the legend, as one sentence.
- Focus, the announcement when the card appears and the two buttons are the frame's. The card adds no focusable element.

# Copy

Polish is the source; every string goes through a Lingui macro and the English entry is filled in.

| Text | Polish (source) | English |
|---|---|---|
| Legend, for | Za | For |
| Legend, against | Przeciw | Against |
| Legend, no answer | Brak odpowiedzi | No answer |
| One part of the description | {name}: {percent}% | {name}: {percent}% |

The parts of the description are joined with a comma and a space. The lead-ins and the statements are the pools', added by `survey-checkpoint-engine`. This task adds no line and changes none.

# Athena components to use

- No Athena component fits the pie or the legend, and the app has no pie chart: the card draws its own, as an inline SVG.
- Do **not** add a charting library. Three slices do not need one, and a new dependency needs Technical Leader approval.
- Do **not** use Athena `ProgressBar` to show the shares. The frame draws a pie.
- Do **not** use `Badge` for the legend rows. A row is a decorative dot and a plain name.
- Do **not** use the app's `ModuleWrapper`. The card borrows the kind of pie the statistics module's frame draws, never a module frame.
- Do **not** add buttons. "Dalej" and "Wyłącz checkpointy" are the frame's.

# Out of scope

- **Counting answers, storing the counts and serving them** - a back-end functionality with no doc and no spec yet. It belongs with [module statistics](https://github.com/gi-org-pl/product/blob/main/mypolitics/docs/modules/quiz/results/module-statistics.md), which is an empty doc. This task only reads.
- **When the card fires, the three counts and the percent** - `survey-checkpoint-engine`. Nothing is added to it here: no trigger, no gate, no arithmetic.
- **The lines of the two pools** - `survey-checkpoint-engine`.
- **The frame, the quotation markup and the Checkpoints phase** - `survey-checkpoint`.
- **The statistics of the result screen.** When that module is specified, its pie and this one have to be brought onto one component and one source. Until then the pie is this card's own and is not placed in `shared/`.
- **The four agreement steps as four slices, a split by demographics, counts across quiz versions, live updating, a retry while the taker is answering** - not supported.

# Files to create

```
src/components/survey/SurveyCheckpointStats/
├── SurveyCheckpointStats.tsx
├── SurveyCheckpointStats.test.tsx
├── SurveyCheckpointStats.types.ts                   # StatsSliceId, StatsSlice
├── SurveyCheckpointStats.constants.ts               # the order of the three slices; the smallest share a slice is drawn at
├── SurveyCheckpointStats.stories.tsx
├── SurveyCheckpointStatsChart/                      # the visual: the pie and the legend
│   ├── SurveyCheckpointStatsChart.tsx
│   ├── SurveyCheckpointStatsChart.test.tsx
│   ├── SurveyCheckpointStatsPie/                    # the SVG: one image with its description
│   │   ├── SurveyCheckpointStatsPie.tsx
│   │   ├── SurveyCheckpointStatsPie.test.tsx
│   │   └── utils/
│   │       ├── getPieSlices.ts                      # counts -> slices as shares of the circle
│   │       ├── getPieSlices.test.ts
│   │       ├── getSlicePath.ts                      # one slice -> the path of its shape
│   │       └── getSlicePath.test.ts
│   └── SurveyCheckpointStatsLegend/                 # the three rows
│       ├── SurveyCheckpointStatsLegend.tsx
│       └── SurveyCheckpointStatsLegend.test.tsx
└── utils/
    ├── getStatsShares.ts                            # the three whole percents of the description
    ├── getStatsShares.test.ts
    ├── useStatsDescription.ts
    ├── useStatsDescription.test.tsx
    ├── useStatsSliceNames.ts                        # the three names, translated: the legend and the description use them
    └── useStatsSliceNames.test.tsx
src/vite-env.d.ts                                    # existing: + VITE_ANSWER_COUNTS_URL
src/constants/checkpoint.ts                          # existing: + ANSWER_COUNTS_MAX_AGE_HOURS
src/services/api/client/
├── getAnswerCounts.ts
└── getAnswerCounts.test.ts
src/services/api/schemas/
├── answerCounts.ts                                  # the response, as the contract above
└── answerCounts.test.ts
src/services/api/utils/answer-counts/
├── readAnswerCounts.ts                              # response -> CheckpointAggregates, or nothing
└── readAnswerCounts.test.ts
src/utils/survey/
├── loadCheckpointAggregates.ts                      # once per quiz and page load
└── loadCheckpointAggregates.test.ts
src/components/survey/SurveyQuestionnaire/
├── SurveyQuestionnaire.constants.ts                 # existing: + stats: SurveyCheckpointStats
└── SurveyQuestionnaireSession/
    ├── SurveyQuestionnaireSession.test.tsx          # existing: + the cases of the real card
    └── SurveyQuestionnaireQuestions/
        └── utils/
            ├── useQuestionActions.ts                # existing: passes the counts to getSessionCheckpoint
            ├── useCheckpointAggregates.ts
            └── useCheckpointAggregates.test.ts
```

- The pie and the legend are given what they draw as props - the slices, the description, the names. They import nothing from the card's `utils/`, and the card decides whether there is a visual at all: with no shares it passes nothing as the visual.
- The clock is read in `getAnswerCounts`, which hands `now` to `readAnswerCounts`. Nothing in `src/utils/checkpoint/` reads it, and nothing of this task is placed there.
- The schema is not all-or-nothing: the envelope is checked as a whole and every question item on its own, as `readSurvey` reads a quiz.
- The request goes through `apiClient`. No `fetch`, no second Axios instance.
- Document `VITE_ANSWER_COUNTS_URL` wherever the repository documents `VITE_API_URL`.
- Reuse `isNumber` and `clamp` from `src/utils/number/` and `toSingleLine` from `src/utils/text/`. Search `src/utils/` before writing a helper.
- No functions in a component file, no `renderX()`.
- If the files of `survey-checkpoint` ended up named differently from the tree above, follow what is in the repository and say so in the pull request.

# Unit test cases (BDD)

```ts
describe('<SurveyCheckpointStats />', () => {
  describe('given a card on the "for" side', () => {
    it('renders exactly one region named "Checkpoint"', ...);
    it('shows the pie and the legend in the visual, before the lead-in and the statement', ...);
    it('shows the statement of the "for" pool with the percent and the thesis in it', ...);
    it('marks the thesis as a quotation', ...);
    it('shows "Dalej" and "Wyłącz checkpointy", and no options', ...);
  });
  describe('given a card on the "against" side', () => {
    it('shows the statement of the "against" pool', ...);
    it('draws the same pie and the same legend', ...);
  });
  describe('given each line of the two pools', () => {
    it('shows that line with the percent and the thesis in it', ...);
  });
  describe('given a thesis that ends with a full stop', () => {
    it('quotes it without that full stop and ends the statement with one full stop', ...);
  });
  describe('given a thesis with quotation marks, and a long thesis', () => {
    it('shows it as written, in full', ...);
  });
  describe('given a thesis with line breaks or doubled spaces', () => {
    it('still marks it as a quotation', ...);
  });
  describe('given the app is in English', () => {
    it('shows the line, the legend and the description in English, and the thesis unchanged', ...);
  });
  describe('given counts that cannot be drawn', () => {
    it('renders nothing and calls onContinue once', ...);
  });
  describe('given a card whose text cannot be built', () => {
    it('renders nothing and calls onContinue once', ...);
  });
  describe('when "Dalej" is activated', () => {
    it('calls onContinue once', ...);
  });
  describe('when "Wyłącz checkpointy" is activated', () => {
    it('calls onOptOut once', ...);
  });
  it('shows no number in the visual', ...);
  it('never calls onReveal', ...);
  it('adds no focusable element of its own', ...);
});

describe('<SurveyCheckpointStatsChart />', () => {
  it('renders the pie, then the legend', ...);
  it('renders nothing when there is no slice to draw', ...);
});

describe('<SurveyCheckpointStatsPie />', () => {
  it('is exposed as a single image with the description it is given', ...);
  it('draws one shape per slice, in the order for, against, no answer', ...);
  it('draws no shape for a count of zero', ...);
  it('draws a full circle when one count holds everything', ...);
  it('marks no slice as the taker\'s', ...);
  it('writes no number', ...);
});

describe('<SurveyCheckpointStatsLegend />', () => {
  it('renders three rows in the order "Za", "Przeciw", "Brak odpowiedzi"', ...);
  it('keeps the row of a count of zero', ...);
  it('hides the colour dots from assistive technology', ...);
  it('shows no percentage', ...);
});

describe('getPieSlices()', () => {
  it('sizes the three slices by the three counts, in the order for, against, no answer', ...);
  it('makes the slices fill the circle exactly', ...);
  it('leaves out a count of zero', ...);
  it('gives a tiny count at least the smallest share and takes it from the others', ...);
  it('returns one slice from 0 to 1 when one count holds everything', ...);
  it('returns no slice for three counts of zero', ...);
  it('returns no slice when a count is negative or not a number', ...);
});

describe('getSlicePath()', () => {
  it('returns the path of a slice between two shares of the circle', ...);
  it('returns a full circle for a slice from 0 to 1', ...);
});

describe('getStatsShares()', () => {
  it('gives each count as a whole percent of the three together', ...);
  it('gives the taker\'s side the percent of the card', ...);
  it('rounds the other two to the nearest whole percent', ...);
  it('gives 0 for a count of zero that is not the taker\'s side', ...);
  it('returns nothing when the counts cannot be drawn', ...);
});

describe('useStatsDescription()', () => {
  it('lists the three slices with their percents, in the order of the legend', ...);
  it('returns nothing when there are no shares', ...);
});

describe('readAnswerCounts()', () => {
  describe('given a well-formed response', () => {
    it('returns one entry per question with its results counted', ...);
    it('returns the counts of a question by answer identifier', ...);
  });
  describe('given no computedAt, one that is not a date, or one in the future', () => {
    it('returns nothing', ...);
  });
  describe('given counts computed more than 24 hours ago', () => {
    it('returns nothing', ...);
  });
  describe('given counts computed exactly 24 hours ago', () => {
    it('returns them', ...);
  });
  describe('given a response that is not an object, or questions that are not a list', () => {
    it('returns nothing', ...);
  });
  describe('given one malformed question among good ones', () => {
    it('leaves that question out and keeps the others', ...);
  });
  describe('given a question with a count that is not a number', () => {
    it('leaves that question out', ...);
  });
  describe('given an answer without an identifier, or without a count', () => {
    it('leaves that answer out and keeps the question', ...);
  });
  describe('given a negative or fractional number', () => {
    it('passes it as sent', ...);
  });
  it('never throws', ...);
});

describe('getAnswerCounts()', () => {
  describe('given no VITE_ANSWER_COUNTS_URL, or a blank one', () => {
    it('resolves with nothing', ...);
    it('makes no request', ...);
  });
  describe('given an address', () => {
    it('asks that address once, with the quiz identifier as surveyId', ...);
    it('sends nothing else: no body, no other parameter', ...);
    it('resolves with the counts read by readAnswerCounts at the current time', ...);
  });
  describe('given the source answers with an error, does not answer, or answers too late', () => {
    it('resolves with nothing and does not reject', ...);
  });
  describe('given a response that cannot be read', () => {
    it('resolves with nothing', ...);
  });
});

describe('loadCheckpointAggregates()', () => {
  it('asks the source once for a quiz, however often it is called', ...);
  it('gives every caller the same counts', ...);
  it('asks again for another quiz', ...);
  it('does not ask again after a failure', ...);
});

describe('useCheckpointAggregates()', () => {
  it('starts the load when it is first used', ...);
  it('gives nothing until the counts have arrived', ...);
  it('gives the counts once they have arrived, without a re-render being needed', ...);
  it('gives the counts already loaded when it is mounted again, with no new request', ...);
  it('ignores counts that arrive after it was unmounted', ...);
});

describe('useQuestionActions() - answer counts', () => {
  describe('when a question is answered and the counts have arrived', () => {
    it('passes them to getSessionCheckpoint', ...);
  });
  describe('when a question is answered before the counts arrived', () => {
    it('passes nothing and does not wait', ...);
  });
});

describe('CHECKPOINT_CARDS', () => {
  it('holds SurveyCheckpointStats under "stats"', ...);
});

describe('<SurveyQuestionnaireSession /> - the stats card', () => {
  // Nine questions on the agreement scale, the real registry and engine. Only getAnswerCounts is mocked.
  describe('given counts in which agreeing with the fifth question is rare, when the taker agrees with it', () => {
    it('shows the card with the pie, the "for" statement and the percent', ...);
  });
  describe('given the same counts, when the taker skips the fifth question', () => {
    it('shows no stats card', ...);
  });
  describe('given the source gives nothing - no address, a failure, unusable counts', () => {
    it('never shows the card and shows no message', ...);
    it('lets every question be answered as usual', ...);
  });
  describe('given the counts arrive after the fifth question was answered', () => {
    it('shows no card for that question', ...);
  });
});
```

Find elements by role and accessible name. Build a card for a test by hand - `{ type: "stats", boundary: 5, line: { pool: "stats-for", index: 0 }, questionId: "q5", thesis: "Wielka Polska Katolicka w silnej chrześcijańskiej Europie.", side: "for", counts: { for: 100, against: 600, noAnswer: 300 }, percent: 10 }` - and render it with `renderWithI18n`. Test the call with a stub adapter on `apiClient` or by spying on it, as the calls of `survey-api` are tested; set the address with `vi.stubEnv`. `loadCheckpointAggregates` keeps its answers in the module: load a fresh module in each test (`vi.resetModules`). Never call a live address from a test.

# End-to-end test

**No e2e in this pull request.** The card is registered, and it still cannot appear on the route: the app is built with no `VITE_ANSWER_COUNTS_URL`, so nothing is requested and the engine gets no counts. The pull request says: "No e2e: the stats card cannot appear on the route until an address of answer counts is set". Do not set the address for the e2e build only - that would test an app nobody is served. The task that sets the address for real adds the scenario, with the source mocked by a Playwright route.

# Storybook stories

`SurveyCheckpointStats.stories.tsx`. Each story passes a card built in the story file and `fn()` for the three callbacks; the line is fixed by its index. No story makes a request.

**Figma, the one state of the frame**
- `For` - the thesis of the frame, 100 for, 600 against, 300 without an answer, 10%

**The second side**
- `Against` - the taker disagreed and disagreement is rare

**Edge**
- `NobodyOnTheTakersSide` - a count of zero for the taker's side: no slice, the legend row stays, the statement reads 1%
- `TinySlice` - one result in a few thousand: the slice is still seen
- `NoSkips` - nobody skipped the question: two slices
- `LongThesis`
- `ThesisWithQuotationMarks`
- `ThesisWithQuestionMark` - the closing mark is kept
- `SecondLine`, `ThirdLine` - the other lines of each pool

Check widths by resizing the viewport, not by wrapping the story: at 320 px the legend may sit under the pie, with its three names in full.

# Remember about standards

- Use the standard colors palette, never add colors directly (check https://tailwindcss.com/docs/colors and our color palette in the `src/index.css` file and in [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css))
- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Create a Storybook story for the component with all possible props variants of the component
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)
- Name the branch `feature/survey-checkpoint-stats-112`, following [Conventional Branch](https://conventional-branch.github.io/) - never keep a generated or default branch name
- Read `AGENTS.md` in the repository before starting; where it differs from this task on a standard, it wins
- The card reads nothing but its props: no session, no running state, no source. Everything it draws is in `card`
- The request names the quiz and nothing about the taker. The counts are kept in the memory of the page only; they are not stored, not logged and not sent on
- The questionnaire never waits for the counts: nothing they do or fail to do delays a question or shows a message
- No new dependency: the pie is an inline SVG
- The card renders one `SurveyCheckpoint` and nothing around it. Stories show it alone, with no decorator, background or fixed width; check them at 320, 360 and 800 px
- Copy is Polish by default, the description of the pie included. Run `yarn i18n:extract`, translate every new English entry, commit both catalogs
- Commit only files that belong to the task; commits follow Conventional Commits
- The PR follows the repository's pull request template, with a screenshot of the `For` story next to the Figma frame

# Dependencies

- `survey-checkpoint` (#107) - the frame `SurveyCheckpoint` with its `quote`, `CheckpointCardProps`, the registry `CHECKPOINT_CARDS`, `getSessionCheckpoint`, the Checkpoints phase.
- Through it: `survey-checkpoint-engine` (#106) (the trigger, `StatsCheckpointCard`, `CheckpointAggregates`, `getCheckpointText`, `getCheckpointSlots`, the two pools), `survey-questionnaire` (#102) (`useQuestionActions`) and `survey-api` (#100) (`apiClient`).
- **A source of answer counts** - not a task of this epic and not built anywhere. The card ships switched off and stays so until a back-end delivers the contract above and the address is set.

It blocks nothing. The other cards can be built alongside it.

# Resources

- [Spec - Stats chart](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/stats-chart.md) - every case, in full; its Interface is the contract of the source
- [Docs - Stats chart](https://github.com/gi-org-pl/product/blob/main/mypolitics/docs/modules/quiz/questionnaire/checkpoints/stats-chart.md) - the idea
- [Spec - Checkpoints](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/checkpoints.md) - the frame the card fills, and how it marks a quotation
- [Spec - Event model](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/event-model.md) - the trigger and where the counts enter the engine
- [Spec - Answer model](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/answer-model.md) - which answers are agreement and which are custom
- [Spec - Random copy](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/checkpoints-random-copy.md) - the lines of both sides
- [Docs - Module statistics](https://github.com/gi-org-pl/product/blob/main/mypolitics/docs/modules/quiz/results/module-statistics.md) - the result-screen functionality that should own the counts and the pie; an empty doc today
- [Figma - the stats chart card](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5515-67733). The frame draws only the "for" side, a pie that does not match its "10%", two full stops around the closing mark and the back button enabled; the spec adds the "against" wording, sizes the slices by the counts, keeps one full stop and disables back, and the spec stands
- [Figma - the statistics module](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5514-41535) - the same kind of pie on the result screen; nothing else of that frame is built here
- [Survey API docs](https://api.mypolitics.pl/api) - the endpoints that exist; none counts answers
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Storybook docs](https://storybook.js.org/docs/writing-stories)
- [Tailwind docs](https://tailwindcss.com/docs/)
- [Vitest docs](https://vitest.dev/guide/)

# Definition of Done

- [ ] Code follows folder structure (`docs/frontend/conventions/PROJECT_STRUCTURE.md`)
- [ ] Naming follows `docs/frontend/conventions/NAMING.md`
- [ ] `SurveyCheckpointStats` sits directly in `src/components/survey/` - no extra folder layer
- [ ] Component layout follows `docs/frontend/conventions/COMPONENT_STRUCTURE.md`: one component per file, helpers and hooks in `utils/`, each with its own test
- [ ] The card is typed `CheckpointCardProps<"stats">`, renders exactly one `SurveyCheckpoint`, and passes `onContinue` and `onOptOut` unchanged
- [ ] The pie has one slice per count above zero, sized by the counts, in the order for, against, no answer; a tiny count is still seen; one count holding everything is a full circle
- [ ] The legend always has its three rows in that order; the taker's slice is not marked; the visual carries no number
- [ ] The lead-in and the statement come from `getCheckpointText(i18n, card)`, in the wording of the taker's side; no line was added or changed
- [ ] The thesis is quoted as written, without its one closing full stop, and is marked as a quotation through the frame's `quote`
- [ ] The pie is one image whose description gives the three shares as whole percents, the taker's side with the number of the statement; the colour dots are decorative
- [ ] The card draws only from `card` and does not change while it is open
- [ ] A card whose counts cannot be drawn or whose text cannot be built is not drawn and leaves by itself, with `onContinue` called once
- [ ] With no `VITE_ANSWER_COUNTS_URL` nothing is requested and the card never fires
- [ ] With an address the counts of the quiz are requested once per page load, by quiz identifier only, through `apiClient`
- [ ] The response is validated with Zod, item by item; `readAnswerCounts` is the only place that knows its field names
- [ ] Counts with no valid `computedAt`, with one in the future, or older than 24 hours are not used; a malformed question never costs the others
- [ ] Any failure of the source means no stats card for the page load: no message, no retry, and no question delayed
- [ ] `useQuestionActions` passes the counts that have arrived to `getSessionCheckpoint` and never waits for them; counts that arrive late are used from the next done question on
- [ ] The counts are kept in the memory of the page only: not in the session, not in storage, not logged
- [ ] `CHECKPOINT_CARDS` holds `stats: SurveyCheckpointStats`; nothing was added to the engine or to the pools
- [ ] No charting library, no `ProgressBar`, no `Badge`, no `ModuleWrapper`, and no button of the card's own
- [ ] Nothing imported from another component's `utils/`, constants or subcomponents
- [ ] The card fills its parent's width; stories checked at 320 / 360 / 800 px with no horizontal scroll, no cut legend name and no cut thesis
- [ ] Unit tests added, BDD style, coverage ≥95% on all new and changed files; every subcomponent, util and hook has its own test file; elements found by role and name
- [ ] Storybook stories added, all listed above, showing the component alone
- [ ] PR states "No e2e: the stats card cannot appear on the route until an address of answer counts is set"
- [ ] Every string from the Copy section goes through a Lingui macro, with Polish as the source; `yarn i18n:extract` run, English entries translated, `.po` files committed
- [ ] Biome lint clean
- [ ] TypeScript clean (no `any`, no `@ts-ignore`)
- [ ] Branch named `feature/survey-checkpoint-stats-112`
- [ ] CI green: build, lint, test, e2e
- [ ] PR description lists decisions and deviations from the ticket/spec; only files belonging to the task are committed
