<img alt="The Checkpoints phase: a card between two questions" src="https://raw.githubusercontent.com/gi-org-pl/product/main/mypolitics/assets/checkpoints.png" />

# Story

As a user taking a quiz, I want a card to appear now and then between two questions, showing me one thing my answers already say, with one button to carry on and one to turn these cards off for good, so that a long quiz pays me back before the end and never holds me up.

# Component properties

This task builds three things:

1. **`SurveyCheckpoint`** - the frame every checkpoint card is drawn in.
2. **The card registry** - how a card component is tied to a `CheckpointType`.
3. **The Checkpoints phase** of the `SurveyQuestionnaire` screen that `survey-questionnaire` builds: timing a question, asking the engine after every done question, putting its card up, the two buttons, and what a reload restores.

No card is built here. The seven cards are the tasks that follow, and each registers its own component.

## 1. The frame

**Component:** `SurveyCheckpoint`
**Location:** `src/components/survey/SurveyCheckpoint/`
**Shared:** no - domain component under `survey`

Presentational. No store, no API calls, no knowledge of card types. It draws what it is given and reports which button was pressed.

```ts
// src/components/survey/SurveyCheckpoint/SurveyCheckpoint.types.ts
import type { ReactNode } from "react";

export interface SurveyCheckpointProps {
  visual: ReactNode;             // what the card shows: a chart, a pill, a number. Nothing to draw = the card is not drawn
  leadIn?: string;               // the opener, translated. Blank = no lead-in and no dash
  statement: string;             // the finding, translated, its slots filled. Blank = the card is not drawn
  quote?: string;                // a part of the statement to mark as a quotation - the stats card passes the thesis
  options?: ReactNode;           // the rows a puzzle offers. Nothing to draw = no options
  isContinueAvailable?: boolean; // default true. false = "Dalej" is not drawn at all. This is how a card withholds "Dalej"
  onContinue: () => void;        // "Dalej" was pressed. Also how a card that cannot be drawn leaves
  onOptOut: () => void;          // "Wyłącz checkpointy" was pressed
}
```

The opt-out is not a prop: it is drawn on every card in every state and a card cannot remove it.

## 2. The registry

```ts
// src/types/checkpoint.ts - added to the engine types of survey-checkpoint-engine
import type { ComponentType } from "react";

// What every card component receives.
export interface CheckpointCardProps<Type extends CheckpointType = CheckpointType> {
  card: Extract<CheckpointCard, { type: Type }>;                        // its own member of the union, frozen
  onReveal: (outcome: CheckpointOutcome) => CheckpointLine | undefined; // a puzzle calls it on the guess and gets its hit or miss line
  onContinue: () => void;                                               // pass to the frame unchanged
  onOptOut: () => void;                                                 // pass to the frame unchanged
}

export type CheckpointCardRegistry = {
  [Type in CheckpointType]?: ComponentType<CheckpointCardProps<Type>>;
};
```

```ts
// src/components/survey/SurveyQuestionnaire/SurveyQuestionnaire.constants.ts - a new file
export const CHECKPOINT_CARDS: CheckpointCardRegistry = {};
```

`CHECKPOINT_CARDS` is empty when this task lands. **A card task registers its card by adding one entry** - `halfway: SurveyCheckpointHalfway` - and from then on its type is passed to the engine in `enabledTypes` and can be selected. A type with no entry is never selected, so the questionnaire is safe at every step of the build.

The registry has a file of its own, and that file imports card components only. Do not put it into `SurveyQuestionnaireSession.constants.ts`: that file imports the phase components for `SURVEY_PHASE_CONTENT`, the questions phase reads the registry, and the two would import each other.

The contract every card component follows:

- It is a sibling component, `src/components/survey/SurveyCheckpoint{Name}/`, typed as `CheckpointCardProps<"its-type">`.
- It renders exactly one `SurveyCheckpoint` and fills it: the visual, the two texts from `getCheckpointText(i18n, card)`, and for a puzzle the options.
- It passes `onContinue` and `onOptOut` to the frame unchanged and adds no button of its own outside `options`.
- A puzzle keeps its own state (ask, hit, miss) while it is on screen. In a state where the guess is the only way forward it passes `isContinueAvailable={false}`. On the guess it calls `onReveal("hit")` or `onReveal("miss")` and shows `getCheckpointText(i18n, card, line)` for the line it gets back; with no line back it calls `onContinue`.
- It reads nothing but its props: no session, no running state. Everything it draws is in `card`.

## 3. The phase

**Location:** `src/components/survey/SurveyQuestionnaire/SurveyQuestionnaireSession/`, next to the phases `survey-questionnaire` built.

```ts
// SurveyQuestionnaireSession/SurveyQuestionnaireCheckpoints/SurveyQuestionnaireCheckpoints.tsx
// The content of the Checkpoints phase. It takes SurveyPhaseContentProps like every phase and is registered as
//   SURVEY_PHASE_CONTENT.checkpoints = SurveyQuestionnaireCheckpoints
// in SurveyQuestionnaireSession.constants.ts.

// SurveyQuestionnaireCheckpoints/utils/useCheckpointCard.ts
export interface CheckpointCardControls {
  card: CheckpointCard | null; // the card that is up: the last of the cards shown, when its type is registered
  reveal: (outcome: CheckpointOutcome) => CheckpointLine | undefined;
  close: () => void;           // session.closeCheckpoint()
  optOut: () => void;          // session.turnCheckpointsOff()
}

export const useCheckpointCard = (session: SurveySessionApi): CheckpointCardControls => ...

// SurveyQuestionnaireQuestions/utils/useQuestionTimer.ts
export const useQuestionTimer = (questionId?: string): (() => number | undefined) => ...
// Starts when a question appears. The returned function gives the seconds it has been on screen,
// or nothing for the question that was on screen when the page loaded onto a restored session.

// src/utils/checkpoint/getSessionCheckpoint.ts
export const getSessionCheckpoint = (
  survey: Survey,
  session: SurveySession,
  enabledTypes: readonly CheckpointType[],
  aggregates?: CheckpointAggregates,
): CheckpointCard | null => ...
// The card for the boundary the session stands at, or nothing. Runs getRunningState and getNextCheckpoint. Never throws.

// src/utils/checkpoint/getEnabledCheckpointTypes.ts
export const getEnabledCheckpointTypes = (cards: CheckpointCardRegistry): CheckpointType[] => ...
```

One action is added to the session of `survey-session`, because a puzzle's reveal line has to be kept with its card and nothing there can write it:

```ts
// src/types/survey.ts - one method added to SurveySessionApi
setCheckpointRecord: (record: SurveyCheckpointRecord) => void;

// src/utils/survey/setSessionCheckpointRecord.ts - a pure action like the others of survey-session
export const setSessionCheckpointRecord = (
  survey: Survey,
  session: SurveySession,
  record: SurveyCheckpointRecord,
): SurveySession => ...
// The session with its checkpoint record replaced. Stored at once, like every change.
```

### What this task uses from the tasks before it

No name of an earlier task is redefined here.

| From | Used |
|---|---|
| `SurveyPhaseContentProps` (`survey-questionnaire`) | `survey`, `session` (a `SurveySessionApi`), `lock`. The props of the phase content |
| `SURVEY_PHASE_CONTENT` in `SurveyQuestionnaireSession.constants.ts` | The plug point: this task adds the entry `checkpoints` |
| `useQuestionActions` in `SurveyQuestionnaireQuestions/utils/` | The one place a done question is handled. This task makes it pass the seconds to `answer` and `skip`, and ask for a card after each |
| `getSurveyFrame` | Already gives the Checkpoints row: the bar unchanged, the pill of the question that follows, back off, reset on. Not changed here |
| The transition between two contents, `usePhaseFocus`, the lock | Already there for every phase. Not changed here, except what focus needs - see "Accessibility" |
| `SurveySession` (`survey-session`) | `id` (the seed), `entries`, `topicIds`, `areCheckpointsOff`, `phase`, `checkpointRecord` |
| `SurveySessionApi` | `answer(answerId, seconds?)`, `skip(seconds?)`, `showCheckpoint(card)`, `closeCheckpoint()`, `turnCheckpointsOff()` - and `setCheckpointRecord`, added here |
| `getSurveySessionStore(survey)` | The session as it stands right after an action |
| `getRunningState` (`survey-running-state`) | As defined there |
| `getNextCheckpoint`, `readCheckpointRecord`, `drawRevealLine`, `getCheckpointText`, `CheckpointShownCard` (`survey-checkpoint-engine`) | As defined there |

`survey-session` already keeps what has to be kept: `showCheckpoint` appends to `checkpointRecord.cardsShown` and moves the phase to `checkpoints`, and drops the card after the last question or while checkpoints are off; `answer` and `skip` store the time sample they are given; `back` drops the sample with its entry; a reset empties the record and carries `areCheckpointsOff` over; a restored session in the phase `checkpoints` with no card on record is repaired before anything is drawn.

# Behaviour

The [checkpoints spec](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/checkpoints.md) is the source of truth for every case below, together with the Checkpoints rows of the [phases model spec](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/phases-model.md). The [Figma screen](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5582-98011) is the source of truth for sizes, spacing, type and colours: follow the frame.

### The frame

Top to bottom, in this order:

| Part | Behaviour |
|---|---|
| Visual | In the panel with the dashed outline, centred. The panel is as tall as the visual needs |
| Text | One centred paragraph: the lead-in in the quiet colour, a long dash (U+2014), then the statement in bold |
| Options | Only when the card supplies them. Between the text and the buttons |
| "Dalej" | The main button. Only when continue is available |
| "Wyłącz checkpointy" | The quiet button under it. Always |

| Case | Behaviour |
|---|---|
| The paragraph does not fit on one line | It wraps as text does. The dash stays at the end of the lead-in and never starts a line |
| No lead-in | The statement alone, with no dash |
| A statement with a long name or a long quoted thesis | It wraps onto as many lines as it needs and is never cut. The frame grows and the buttons move down with it |
| `quote` is a part of the statement | That part is marked up as a quotation and set apart as the frame draws the thesis. The quotation marks are the line's own; none are added |
| `quote` is blank, or is not found in the statement | Nothing is marked |
| `quote` occurs more than once | The first occurrence is marked |
| `isContinueAvailable` is false | "Dalej" is not drawn at all. It is not shown disabled |
| The visual, the text or the options change while the card is up - a puzzle revealing its answer | The frame redraws in place. It is still the same card |
| The frame's width | The width it is given. Its height follows its content |
| A press on the visual or on the text | Nothing. Only the two buttons and a card's own options act |

The two labels are fixed texts of the frame. The dash is drawn by the frame and is part of no line. The frame is not a dialog: it does not cover the screen, does not hold the focus inside itself and does not close on the Escape key. Nothing closes it automatically - there is no timer.

### The two buttons

| Case | Behaviour |
|---|---|
| "Dalej" pressed | `onContinue`, once |
| "Wyłącz checkpointy" pressed | `onOptOut`, once. It acts on the first press: no confirmation, no undo |
| Either button pressed after one of the two was pressed | Nothing |
| A card that is waiting for a choice | "Wyłącz checkpointy" still works |

### Frame - invalid and edge input

Nothing here throws.

| Input | Behaviour |
|---|---|
| `leadIn` missing, empty or only whitespace | No lead-in and no dash |
| `statement` missing, empty or only whitespace | The frame draws nothing and calls `onContinue` once |
| `visual` with nothing to draw | The frame draws nothing and calls `onContinue` once |
| `statement` or `leadIn` with line breaks or doubled spaces | Collapsed to one paragraph |
| Text with markup or a link in it | Shown as written, never interpreted. Names and theses are author-supplied |
| A visual wider than the panel | The visual is given the panel's inner width. The frame never scrolls sideways |
| `options` with nothing to draw | Treated as no options |
| `isContinueAvailable` false and no options | Continue is treated as available, so the card can be left the ordinary way |
| A very narrow screen | The frame keeps its order. Text wraps, buttons stay full width, nothing is cut |

### After a question is done

In `useQuestionActions`, for an acknowledged answer and for "Pomiń" alike. It happens in the handler, never in an effect, so one boundary is asked once.

| Step | Behaviour |
|---|---|
| 1 | The seconds from `useQuestionTimer` are passed to `session.answer(answerId, seconds)` or `session.skip(seconds)` - see "Timing" |
| 2 | The session as it stands after that action is read from `getSurveySessionStore(survey).getState()`. The `session.session` of the render that handled the press is one entry behind |
| 3 | `getSessionCheckpoint(survey, session, getEnabledCheckpointTypes(CHECKPOINT_CARDS))` is asked |
| 4 | It returns nothing: nothing more is done, and the next question is shown exactly as when checkpoints do not exist |
| 5 | It returns a card: `session.showCheckpoint({ card })` - a `CheckpointShownCard`. The session records it and moves to the phase `checkpoints`, and the card is shown |

`getSessionCheckpoint`:

| Case | Behaviour |
|---|---|
| `session.areCheckpointsOff` | Nothing. Neither the running state nor the engine is run |
| `enabledTypes` is empty - the state of the app when this task lands | Nothing. Neither is run |
| No question is open - the last question was just done | Nothing, whatever the engine would say. Demographics follows |
| Otherwise | `getRunningState(survey, session)`, then `getNextCheckpoint` with the survey, `session.entries`, the state, `readCheckpointRecord(session.checkpointRecord)`, `session.id` as the seed, `session.areCheckpointsOff`, the enabled types and the aggregates |
| The running state or the engine fails or throws | Nothing. The next question comes; the taker is told nothing |
| The engine returns a card whose type is not enabled | Nothing. The card is dropped and is not recorded |

| Case | Behaviour |
|---|---|
| The taker steps back to a question | Nobody is asked. No card is shown on the way back |
| The registry is empty | No card at any boundary. One question follows another with no gap, no delay and no placeholder |

`aggregates` is not passed by the screen: no source exists. The stats task adds it.

### While a card is up

`SurveyQuestionnaireCheckpoints` takes the place of the question, its answers and "Pomiń". It draws the registered component for `card.type`, inside a boundary that catches a card that fails to draw. Everything above it stays, and is already right: `getSurveyFrame` of `survey-questionnaire` gives this phase its row.

| Part of the screen | While a card is up |
|---|---|
| Progress bar | Drawn, at the value after the question just done. It does not move when the card appears or closes |
| Controls bar, pill | What it shows for the question that follows the card - its category and the questions left in it. It does not change when the card closes |
| Controls bar, back | Disabled, and announced as disabled. A card is not a place to go back from |
| Controls bar, reset | Enabled. It opens the same confirmation as during questions |
| Question, answers, "Pomiń" | Not drawn |

| Case | Behaviour |
|---|---|
| A card appears | After the answer's own animation, with the transition a change of question uses |
| "Dalej" | `session.closeCheckpoint()`. The card closes and the next question appears with the same transition |
| "Wyłącz checkpointy" | `session.turnCheckpointsOff()`. Checkpoints are off for the session, the card closes and the next question appears. On a puzzle before a guess nothing is revealed |
| A second press while the card is closing | Nothing |
| A puzzle asks for its reveal line | `drawRevealLine(readCheckpointRecord(session.checkpointRecord), outcome, session.id)`; the record it returns is written with `session.setCheckpointRecord`, and the line is handed to the card. The card stays up |
| Reset confirmed while a card is up | The card closes and the session starts over, as from any question. The opt-out, if it was set earlier, stays |
| Reset cancelled | The card is still up, unchanged |
| The taker goes back after a card has closed | The previous question returns and its answer is removed, as always. The card does not come back, then or when that question is answered again |
| Any part of the card fails to draw | `session.closeCheckpoint()`: the whole card closes and the next question appears. Nothing of the failure is shown, and the card is not tried again |
| The taker has asked their device for reduced motion | The card appears and closes without movement |
| Two cards | Never. One card at a time, and never one straight after another |

A card appears no later than the next question would have. Drawing it never delays the answer's own animation.

### Turning checkpoints off

| Case | Behaviour |
|---|---|
| Checkpoints are off | Nobody is asked and the phase never comes. One question follows another exactly as when no card fires |
| The rest of the screen | Unchanged. The bar, the pill and the buttons behave as they do with checkpoints on |
| The quiz is reset | Checkpoints stay off |
| The page is reloaded | Checkpoints stay off |
| The taker wants them back | No control offers it in this session. A session started any other way - another quiz, or the same quiz after the taker was sent to the results - has checkpoints on |
| The session cannot be saved | The opt-out holds until the page is reloaded |

No message confirms that checkpoints were turned off.

### Reload

| Case | Behaviour |
|---|---|
| The page is reloaded while a card is up | The same card is up again: the last of `cardsShown`, with the same values and the same wording |
| The card was a puzzle | It starts from its first state. A guess made before the reload is forgotten; guessing again shows the reveal line recorded earlier for that outcome |
| The card cannot be put up again - `readCheckpointRecord` dropped it, or its type has no entry in the registry | `session.closeCheckpoint()`: the next question is shown |
| The page is reloaded during questions | The record comes back with the session: cards shown stay shown |

### Timing

The session keeps the time samples; this task measures them. They feed the minutes of the halfway card and nothing else.

| Case | Behaviour |
|---|---|
| A question appears | Its timer starts |
| It is answered or skipped | The seconds between its appearance and the answer or skip are passed to `answer` or `skip` |
| A card is on screen | That time belongs to no question. The timer of the next question starts when that question appears |
| The taker steps back | Nothing to do here: the session drops the sample with the entry. The question that returns is timed from the moment it reappears |
| The page is reloaded while a question is open | That question gets no sample: nothing is passed for it. Earlier samples come back with the session |

Read the time with `performance.now()`. Capping a sample at 60 seconds is the running state's job, not this task's. A question is timed only when it appeared during this page's life. If nothing tells the screen that the session it starts with was restored from storage, expose that from `getSurveySessionStore` in this pull request and say so in the description.

### Accessibility

- The card is a labelled region, named "Checkpoint".
- Focus moves to the text when a card appears. The screen's `usePhaseFocus` puts the focus on the top of a phase's content; for this phase that element is the text of the card, not its visual. The lead-in and the statement are read as one sentence, lead-in first. The text takes focus only this way and is not a stop for the Tab key.
- It is announced once: the move of focus is the announcement, and the text is not also sent to a live region.
- Reading and Tab order follow the frame: visual, text, options, "Dalej", "Wyłącz checkpointy". The controls bar comes before the card, as it does before a question.
- When the statement changes in place the content of the screen has not changed, so the frame moves the focus to the new text itself. A revealed answer is announced like a new card, and focus is never left on an option that is gone.
- When a card closes, focus goes where a change of question puts it.
- Both buttons are buttons, work with Enter and Space, show a visible focus state and have a pressable area of at least the minimum touch target - the quiet one included.
- The quiet colour of the lead-in still meets the contrast minimum. Quiet and bold are style, not meaning.
- The text alternative of the visual is each card's own; the frame adds none.

# Copy

Polish is the source; every string goes through a Lingui macro and the English entry is filled in.

| Text | Polish (source) | English |
|---|---|---|
| Main button | Dalej | Continue |
| Quiet button | Wyłącz checkpointy | Turn off checkpoints |
| Name of the region | Checkpoint | Checkpoint |

The lead-in and the statement are not this component's copy: the card passes them in, already translated.

# Athena components to use

- `Button` for "Dalej" and for "Wyłącz checkpointy", in the variants the frame shows. Do not build a custom button.
- Do **not** use `SurveyPhaseActions` for the two buttons. It is the pair "main button and Pomiń" of the other phases; here the second button is not a skip, and the first one can be absent.
- Do **not** use `Modal`. The card is part of the page: no overlay, no focus trap, no Escape. `Modal` would bring all three.
- Do **not** use the app's `ModuleWrapper`. It is the card frame of the result screen, with a title chip and the statistics and info buttons; a checkpoint borrows a module's visual, never that frame.
- No Athena component fits the dashed panel or the paragraph.

# Deviation from standards

`AGENTS.md` section 3.4 says a multi-part label breaks at the part boundary, with the separator moving to the next line together with the part it introduces. The spec asks the opposite for this paragraph: the dash stays at the end of the lead-in and never starts a line. The paragraph is a sentence of running text, not a "Name - Value" label, and that is the reason for the difference.

- [ ] Sub-task: obtain Technical Leader approval for keeping the dash with the lead-in, and name the approval in the pull request.

# Out of scope

- **Every card** - what goes into the visual and the options, the text alternative of the visual, and what a guess does: `survey-checkpoint-halfway`, `survey-checkpoint-axis-closeness`, `survey-checkpoint-new-trait`, `survey-checkpoint-nolan-path`, `survey-checkpoint-stats`, `survey-checkpoint-axis-puzzle`, `survey-checkpoint-position-puzzle`.
- **When a card appears, and which** - `survey-checkpoint-engine`. This task calls it and obeys it.
- **The wording** - the pools are in `survey-checkpoint-engine`. The frame only draws two strings.
- **The scores** - `survey-running-state`.
- **Keeping the record, the samples and the opt-out** - `survey-session`. This task adds one action to it, `setCheckpointRecord`, and nothing else.
- **Answer aggregates** - loaded and passed to `getSessionCheckpoint` by `survey-checkpoint-stats`.
- **The progress bar, the controls bar, the reset dialog, the row of the frame for this phase, the transition between two contents** - built by `survey-questionnaire`.
- **Analytics** - the opt-out rate is specified with analytics and is not sent from here.
- **A third button, a link out of the quiz, a way to share a card, a control that turns checkpoints back on** - not supported.

# Files to create

```
src/types/checkpoint.ts                              # + CheckpointCardProps, CheckpointCardRegistry (existing file)
src/types/survey.ts                                  # + setCheckpointRecord in SurveySessionApi (existing file)
src/utils/survey/
├── setSessionCheckpointRecord.ts                    # the one action added to the session
├── setSessionCheckpointRecord.test.ts
└── useSurveySession.ts                              # existing: binds the new action
src/utils/checkpoint/
├── getSessionCheckpoint.ts                          # session -> the card for this boundary, or nothing
├── getSessionCheckpoint.test.ts
├── getEnabledCheckpointTypes.ts                     # the types that have an entry in a registry
└── getEnabledCheckpointTypes.test.ts
src/components/survey/SurveyCheckpoint/
├── SurveyCheckpoint.tsx
├── SurveyCheckpoint.test.tsx
├── SurveyCheckpoint.types.ts
├── SurveyCheckpoint.stories.tsx
├── SurveyCheckpointText/                            # the paragraph: lead-in, dash, statement, quotation; the element that takes focus
│   ├── SurveyCheckpointText.tsx
│   ├── SurveyCheckpointText.test.tsx
│   └── utils/
│       ├── splitByQuote.ts                          # the statement as the parts before, inside and after the quotation
│       └── splitByQuote.test.ts
└── utils/
    ├── hasContent.ts                                # whether a ReactNode has anything to draw
    ├── hasContent.test.ts
    ├── useCheckpointActions.ts                      # each request at most once; the way out of a card that cannot be drawn
    ├── useCheckpointActions.test.ts
    ├── useTextFocus.ts                              # focus when the statement changes in place
    └── useTextFocus.test.ts
src/components/survey/SurveyQuestionnaire/
├── SurveyQuestionnaire.constants.ts                 # new: CHECKPOINT_CARDS = {}
└── SurveyQuestionnaireSession/
    ├── SurveyQuestionnaireSession.constants.ts      # existing: + checkpoints: SurveyQuestionnaireCheckpoints
    ├── SurveyQuestionnaireCheckpoints/              # the content of the phase
    │   ├── SurveyQuestionnaireCheckpoints.tsx       # the registered component for the card that is up
    │   ├── SurveyQuestionnaireCheckpoints.test.tsx
    │   ├── SurveyQuestionnaireCheckpointsBoundary/  # catches a card that fails to draw and closes it
    │   │   ├── SurveyQuestionnaireCheckpointsBoundary.tsx
    │   │   └── SurveyQuestionnaireCheckpointsBoundary.test.tsx
    │   └── utils/
    │       ├── useCheckpointCard.ts
    │       └── useCheckpointCard.test.ts
    └── SurveyQuestionnaireQuestions/
        └── utils/
            ├── useQuestionActions.ts                # existing: + the seconds, + asking for a card
            ├── useQuestionTimer.ts
            └── useQuestionTimer.test.ts
```

- The boundary is a class component: React has no other way to catch a rendering error. Keep it to that one job; no new dependency.
- Reuse `toSingleLine` and `toTrimmedText` from `src/utils/text/`. Search `src/utils/` before writing a helper.
- No functions in a component file, no `renderX()`.
- If the files of `survey-questionnaire` ended up named differently from the tree above, follow what is in the repository and say so in the pull request.

# Unit test cases (BDD)

```ts
describe('<SurveyCheckpoint />', () => {
  describe('given a visual, a lead-in and a statement', () => {
    it('shows the visual, then the text, then "Dalej", then "Wyłącz checkpointy"', ...);
    it('shows the lead-in, the dash and the statement as one paragraph', ...);
    it('is a region named "Checkpoint"', ...);
  });
  describe('given no lead-in, or a blank one', () => {
    it('shows the statement alone, with no dash', ...);
  });
  describe('given options', () => {
    it('shows them between the text and the buttons', ...);
  });
  describe('given isContinueAvailable is false and options', () => {
    it('does not render "Dalej"', ...);
    it('still renders "Wyłącz checkpointy"', ...);
  });
  describe('given isContinueAvailable is false and no options', () => {
    it('renders "Dalej"', ...);
  });
  describe('given options with nothing to draw', () => {
    it('treats them as no options', ...);
  });
  describe('given a blank statement', () => {
    it('renders nothing', ...);
    it('calls onContinue once', ...);
  });
  describe('given a visual with nothing to draw', () => {
    it('renders nothing', ...);
    it('calls onContinue once', ...);
  });
  describe('when "Dalej" is activated', () => {
    it('calls onContinue once', ...);
  });
  describe('when "Wyłącz checkpointy" is activated', () => {
    it('calls onOptOut once, with no confirmation', ...);
  });
  describe('when a button is activated after one of the two was', () => {
    it('calls nothing', ...);
  });
  describe('when the visual or the text is pressed', () => {
    it('calls nothing', ...);
  });
  describe('when the Escape key is pressed', () => {
    it('calls nothing', ...);
  });
  describe('focus', () => {
    it('moves to the text when the statement changes', ...);
    it('does not make the text a stop for the Tab key', ...);
    it('follows the order options, "Dalej", "Wyłącz checkpointy"', ...);
  });
});

describe('<SurveyCheckpointText />', () => {
  describe('given text with line breaks or doubled spaces', () => {
    it('collapses it to one paragraph', ...);
  });
  describe('given text with markup in it', () => {
    it('shows it as written', ...);
  });
  describe('given a quote that is part of the statement', () => {
    it('marks that part as a quotation', ...);
    it('adds no quotation marks of its own', ...);
  });
  describe('given a quote that is blank or not in the statement', () => {
    it('marks nothing', ...);
  });
  it('keeps the dash with the lead-in so it cannot start a line', ...);
  it('is read as one sentence, lead-in first', ...);
});

describe('splitByQuote()', () => {
  it('returns the parts before, inside and after the quotation', ...);
  it('takes the first occurrence when the quote is there twice', ...);
  it('returns the statement as one part when the quote is blank or missing', ...);
});

describe('hasContent()', () => {
  it('is false for null, undefined, false, an empty string and an empty list', ...);
  it('is true for an element, a number and a non-empty string', ...);
});

describe('useCheckpointActions()', () => {
  it('lets the first request through and ignores every later one', ...);
  it('asks to continue once when the card cannot be drawn', ...);
});

describe('getEnabledCheckpointTypes()', () => {
  it('returns no type for an empty registry', ...);
  it('returns the types that have a component', ...);
});

describe('setSessionCheckpointRecord()', () => {
  it('replaces the checkpoint record and nothing else', ...);
  it('does not change the session it was given', ...);
});

describe('getSessionCheckpoint()', () => {
  describe('given checkpoints are off', () => {
    it('returns nothing and runs neither the running state nor the engine', ...);
  });
  describe('given no enabled type', () => {
    it('returns nothing and runs neither', ...);
  });
  describe('given no question is open', () => {
    it('returns nothing, whatever the engine would return', ...);
  });
  describe('given a boundary where the engine has a card', () => {
    it('returns that card', ...);
    it('asks the engine with the entries, the read record, the session id as the seed and the enabled types', ...);
  });
  describe('given a boundary where the engine has nothing', () => {
    it('returns nothing', ...);
  });
  describe('given the running state or the engine throws', () => {
    it('returns nothing and does not throw', ...);
  });
  describe('given the engine returns a card of a type that is not enabled', () => {
    it('returns nothing', ...);
  });
});

describe('useQuestionTimer()', () => {
  it('gives the seconds since the question appeared', ...);
  it('starts again when the question changes', ...);
  it('gives nothing for the question on screen when the page loads onto a restored session', ...);
  it('times the first question of a session created on this page', ...);
});

describe('useQuestionActions() - checkpoints', () => {
  describe('when a question is answered', () => {
    it('passes the seconds of the timer to answer', ...);
    it('asks for a card with the session as it stands after the answer', ...);
  });
  describe('when a question is skipped', () => {
    it('passes the seconds of the timer to skip', ...);
    it('asks for a card', ...);
  });
  describe('when a card comes back', () => {
    it('calls showCheckpoint with the card wrapped as a shown card', ...);
  });
  describe('when nothing comes back', () => {
    it('does not call showCheckpoint', ...);
  });
});

describe('useCheckpointCard()', () => {
  describe('given a record whose last card has a registered type', () => {
    it('gives that card', ...);
  });
  describe('given no readable card on record, or a type that is not registered', () => {
    it('gives no card and closes the checkpoint', ...);
  });
  describe('when closed', () => {
    it('calls closeCheckpoint once', ...);
  });
  describe('when the taker opts out', () => {
    it('calls turnCheckpointsOff once', ...);
  });
  describe('when a puzzle asks for a reveal line', () => {
    it('returns the line and writes the record that holds it with setCheckpointRecord', ...);
    it('returns the recorded line when that outcome was revealed before', ...);
  });
});

describe('<SurveyQuestionnaireCheckpoints />', () => {
  describe('given a card whose type is registered', () => {
    it('renders the registered component with the card and the three callbacks', ...);
  });
  describe('given the card component throws while rendering', () => {
    it('shows nothing of the failure and closes the checkpoint once', ...);
  });
});

describe('<SurveyQuestionnaireSession /> - Checkpoints phase', () => {
  // A quiz of nine questions and a stub card registered for "halfway": the engine is the real one.
  describe('given an empty registry', () => {
    it('shows one question after another with no card', ...);
  });
  describe('when the fifth question is answered', () => {
    it('shows the card in place of the question, the answers and "Pomiń"', ...);
    it('puts the focus on the text of the card', ...);
    it('keeps the progress bar at five of nine', ...);
    it('shows in the pill the category and the count of the sixth question', ...);
    it('disables back and keeps reset enabled', ...);
  });
  describe('when "Dalej" is activated', () => {
    it('shows the sixth question', ...);
  });
  describe('when the taker goes back from the sixth question and answers the fifth again', () => {
    it('does not show the card again', ...);
  });
  describe('when "Wyłącz checkpointy" is activated', () => {
    it('shows the sixth question', ...);
    it('shows no card for the rest of the quiz', ...);
    it('shows no card after a reset', ...);
  });
  describe('when reset is confirmed while the card is up', () => {
    it('closes the card and starts the session over', ...);
  });
  describe('when reset is cancelled while the card is up', () => {
    it('keeps the card up, unchanged', ...);
  });
  describe('when the screen is mounted again with the stored session while the card is up', () => {
    it('shows the same card with the same text', ...);
  });
  describe('given the last question is answered', () => {
    it('goes to demographics without a card', ...);
  });
});
```

Find elements by role and accessible name. Do not add `data-testid` attributes to find things a user can find by name. Where a test needs a registered card, mock the module that holds `CHECKPOINT_CARDS`; do not add a prop to a component for it. Build quizzes and sessions with `createSurvey` and `createSession` of `survey-session`.

# e2e

**No e2e in this pull request.** `CHECKPOINT_CARDS` is empty when this task lands, so no card can appear on the route and nothing a user can do there changes. The pull request says: "No e2e: the Checkpoints phase cannot be reached on the route until a card is registered". The phase is proven here by the screen tests above, which run the real engine with a stub card.

The phase becomes reachable with the first registered card. `survey-checkpoint-halfway` therefore adds the two scenarios below to `e2e/survey/questionnaire.spec.ts`, on a quiz mocked for them. They are written here because they test this task's frame and phase, not the halfway card.

The mocked quiz is a second fixture in `e2e/survey/`, served through Playwright routes like the first one - never the live API: nine questions in one category, four agreement answers each, an average finish time of 9, no axes and no identity orientations. In such a quiz the only card that can fire is the halfway card, at the boundary after the fifth question.

```gherkin
Scenario: A checkpoint appears and is dismissed
  Given a user opened the nine-question quiz
  When they answer the first five questions
  Then a region named "Checkpoint" is shown in place of the question
  And back is off and reset is on
  When they press "Dalej"
  Then they see the sixth question

Scenario: Turning checkpoints off holds for the session and after a reset
  Given a user opened the nine-question quiz and answered the first five questions
  When they press "Wyłącz checkpointy"
  Then they see the sixth question
  When they press reset and confirm
  And they answer the first five questions again
  Then they see the sixth question and no region named "Checkpoint" appears
```

# Storybook stories

For `SurveyCheckpoint`. The visual and the options in these stories are plain stand-ins written in the story file - a number, three plain buttons - not real cards: every card task adds the stories of its own card.

**Figma, in the order of the frame's states**
- `Passive` - visual, lead-in, statement, "Dalej", "Wyłącz checkpointy"
- `WaitingForChoice` - options, `isContinueAvailable` false: no "Dalej"
- `OptionsWithContinue` - options and "Dalej"

**Edge**
- `NoLeadIn`
- `LongStatement` - a long name and a long thesis in the statement
- `Quote` - a statement with its thesis marked as a quotation
- `ChangedInPlace` - visual, text and options swapped in a `play` function, as a puzzle does on a guess
- `ContinueWithheldWithoutOptions` - "Dalej" is drawn all the same

Check widths by resizing the viewport, not by wrapping the story. No story for the phase: it is a part of the screen, and it is covered by the screen tests.

# Remember about standards

- Use the standard colors palette, never add colors directly (check https://tailwindcss.com/docs/colors and our color palette in the `src/index.css` file and in [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css))
- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Create a Storybook story for the component with all possible props variants of the component
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)
- Name the branch `feature/survey-checkpoint-107`, following [Conventional Branch](https://conventional-branch.github.io/) - never keep a generated or default branch name
- Read `AGENTS.md` in the repository before starting; where it differs from this task on a standard, it wins - except for the deviation named above, once it is approved
- The frame fills its parent's width and its height comes from its content. Stories show it alone, with no decorator, background or fixed width; check them at 320, 360 and 800 px
- Layout that depends on width is CSS. Do not measure the element or the window in JavaScript
- No animation library. The card appears and closes with the transition the screen already has, and that transition has a reduced-motion path
- No new state library and no new store: the phase reads and writes the session of `survey-session`
- Nothing from this task is sent anywhere: not the record, not the samples, not the opt-out
- Copy is Polish by default, accessible names included. Run `yarn i18n:extract`, translate every new English entry, commit both catalogs
- Commit only files that belong to the task; commits follow Conventional Commits
- The PR follows the repository's pull request template, with screenshots of the stories next to the Figma frames

# Dependencies

- `survey-questionnaire` (#102) - the screen, `SURVEY_PHASE_CONTENT`, `SurveyPhaseContentProps`, `useQuestionActions`.
- `survey-session` (#101) - the session and its checkpoint actions; this task adds `setCheckpointRecord` to it.
- `survey-checkpoint-engine` (#106) - `getNextCheckpoint`, `readCheckpointRecord`, the reveal lines and the wording, and through it `survey-running-state` (#105).

It blocks every card task: `survey-checkpoint-halfway` (#108), `survey-checkpoint-axis-closeness` (#109), `survey-checkpoint-new-trait` (#110), `survey-checkpoint-nolan-path` (#111), `survey-checkpoint-stats` (#112), `survey-checkpoint-axis-puzzle` (#113) and `survey-checkpoint-position-puzzle` (#114). They are written against `SurveyCheckpointProps`, `CheckpointCardProps` and `CHECKPOINT_CARDS`: do not rename them without updating those tasks.

# Resources

- [Spec - Checkpoints](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/checkpoints.md) - the frame, the two buttons, the card in the screen, turning checkpoints off, degrade to nothing
- [Spec - Phases model](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/phases-model.md) - the Checkpoints phase, its row of the frame table and its moves
- [Spec - Event model](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/event-model.md) - what the engine is asked and what it remembers; the time samples
- [Spec - Session and data](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/session-and-data.md) - the checkpoint record, what is stored, what a reload restores
- [Spec - Random copy](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/checkpoints-random-copy.md) - the lead-in, the statement and the reveal lines the frame is handed
- [Docs - Checkpoints](https://github.com/gi-org-pl/product/blob/main/mypolitics/docs/modules/quiz/questionnaire/checkpoints/README.md) - the idea
- [Figma - the Checkpoints phase screen](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5582-98011), in the [strip of the seven phases](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5582-97895)
- Figma - the states of the frame, on the cards that show them: [passive](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5515-67631) | [passive, with a quoted thesis](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5515-67733) | [waiting for a choice](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5515-67799) | [options with continue](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5516-68069) | [changed in place](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5516-67925). Figma draws the back button enabled on these frames; the spec disables it, and the spec stands
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Storybook docs](https://storybook.js.org/docs/writing-stories)
- [Tailwind docs](https://tailwindcss.com/docs/)
- [Vitest docs](https://vitest.dev/guide/)

# Definition of Done

- [ ] Code follows folder structure (`docs/frontend/conventions/PROJECT_STRUCTURE.md`)
- [ ] Naming follows `docs/frontend/conventions/NAMING.md`
- [ ] Components sit directly in `src/components/survey/` - no extra folder layer
- [ ] Component layout follows `docs/frontend/conventions/COMPONENT_STRUCTURE.md`: one component per file, helpers and hooks in `utils/`, each with its own test
- [ ] `SurveyCheckpoint` draws visual, text, options, "Dalej" and "Wyłącz checkpointy" in that order, as in the frame
- [ ] The lead-in, the dash and the statement are one paragraph that wraps and is never cut; the dash never starts a line; without a lead-in there is no dash
- [ ] `quote` marks a part of the statement as a quotation; text is never interpreted as markup
- [ ] `isContinueAvailable={false}` removes "Dalej" when there are options, and is ignored when there are none; "Wyłącz checkpointy" is on every card in every state
- [ ] Each button acts once; nothing acts after the first press; the visual, the text and the Escape key do nothing
- [ ] A card without a statement or without a visual is not drawn and leaves by itself
- [ ] `CheckpointCardProps`, `CheckpointCardRegistry` and an empty `CHECKPOINT_CARDS` exist; `CHECKPOINT_CARDS` is in a file that imports no phase component; a type without an entry is never passed to the engine and never shown
- [ ] `SurveyQuestionnaireCheckpoints` is registered in `SURVEY_PHASE_CONTENT` under `checkpoints` and takes `SurveyPhaseContentProps`
- [ ] After every done question `useQuestionActions` asks once - not on the way back, not after the last question, not while checkpoints are off - with the session as it stands after the entry, and records the card with `session.showCheckpoint({ card })`
- [ ] With an empty registry, with checkpoints off, and whenever the state, the engine or a card fails, the next question appears with no gap, no delay, no placeholder and no message
- [ ] While a card is up: the bar does not move, the pill shows the question that follows, back is disabled and announced so, reset works and keeps the opt-out
- [ ] "Dalej" calls `closeCheckpoint` and "Wyłącz checkpointy" calls `turnCheckpointsOff`; both lead to the next question, and the second holds past a reload and past a reset
- [ ] A card that closed never comes back, also after stepping back and answering again
- [ ] A reload brings the same card back with the same values and wording; a puzzle starts from its first state and gets its recorded reveal line again
- [ ] `setCheckpointRecord` is the only thing added to the session; reveal lines are written through it and nothing is kept outside the session
- [ ] The seconds of every question that appeared on this page are passed to `answer` and `skip`; card time belongs to no question; a question restored by a reload gets none; nothing is sent
- [ ] The card is a region named "Checkpoint"; focus moves to the text on appearing and when the statement changes; the text is not a Tab stop; order is options, "Dalej", "Wyłącz checkpointy"
- [ ] Both buttons work with Enter and Space, show a visible focus state and meet the minimum touch target; the lead-in meets the contrast minimum
- [ ] A card appears after the answer's own animation and no later than the next question would have, with the transition a change of question uses
- [ ] The card appears and closes without movement under reduced motion; no animation library added
- [ ] Athena `Button` is used; no `Modal`, no `ModuleWrapper`, no `SurveyPhaseActions`
- [ ] The deviation on the dash is approved by the Technical Leader and named in the PR
- [ ] Nothing imported from another component's `utils/`, constants or subcomponents
- [ ] The frame fills its parent's width; stories checked at 320 / 360 / 800 px with no horizontal scroll and no cut text
- [ ] Unit tests added, BDD style, coverage ≥95% on all new and changed files; every subcomponent, util and hook has its own test file; elements found by role and name
- [ ] Storybook stories added for `SurveyCheckpoint`, all listed above, showing the component alone
- [ ] PR states "No e2e: the Checkpoints phase cannot be reached on the route until a card is registered"
- [ ] Every string from the Copy section goes through a Lingui macro, with Polish as the source; `yarn i18n:extract` run, English entries translated, `.po` files committed
- [ ] Biome lint clean
- [ ] TypeScript clean (no `any`, no `@ts-ignore`)
- [ ] Branch named `feature/survey-checkpoint-107`
- [ ] CI green: build, lint, test, e2e
- [ ] PR description lists decisions and deviations from the ticket/spec; only files belonging to the task are committed
