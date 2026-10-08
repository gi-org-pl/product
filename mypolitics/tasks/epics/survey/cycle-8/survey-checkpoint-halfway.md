<img alt="Halfway through checkpoint" src="https://raw.githubusercontent.com/gi-org-pl/product/main/mypolitics/assets/halfway-through-checkpoint.png" />

# Story

As a user taking a quiz, I want to be told when I am past the middle and how many minutes the rest will take, so that I keep going at the point where it is easiest to give up.

# Component properties

**Component:** `SurveyCheckpointHalfway` - the halfway through card
**Location:** `src/components/survey/SurveyCheckpointHalfway/`
**Shared:** no - domain component under `survey`

A checkpoint card. It renders exactly one `SurveyCheckpoint` (the frame of `survey-checkpoint`) and fills it: a large percentage in the visual, and the lead-in and the statement of the line the engine drew. It is the first card to be registered, so it is also the pull request in which the Checkpoints phase becomes reachable on the route.

```ts
// src/components/survey/SurveyCheckpointHalfway/SurveyCheckpointHalfway.tsx
export const SurveyCheckpointHalfway = ({
  card,       // HalfwayCheckpointCard: { type: "halfway", boundary, line, percent, minutes } - frozen when it fired
  onContinue, // passed to the frame unchanged
  onOptOut,   // passed to the frame unchanged
}: CheckpointCardProps<"halfway">) => ...
```

The card has no props type of its own: `CheckpointCardProps<"halfway">` is the whole contract. It does not use `onReveal` - it is not a puzzle.

```ts
// src/components/survey/SurveyCheckpointHalfway/utils/getHalfwayPercent.ts
export const getHalfwayPercent = (card: HalfwayCheckpointCard): number | undefined => ...
// The number the card prints: whole, rounded down, 100 at most. Nothing when `percent` is not a number.
```

**The registration** - one line in the registry of `survey-checkpoint`:

```ts
// src/components/survey/SurveyQuestionnaire/SurveyQuestionnaire.constants.ts
export const CHECKPOINT_CARDS: CheckpointCardRegistry = {
  halfway: SurveyCheckpointHalfway,
};
```

From that line on `halfway` is among the enabled types, and the engine can select it.

### What this task uses from the tasks before it

No name of an earlier task is redefined here, and nothing is added to the engine or to the running state.

| From | Used |
|---|---|
| `SurveyCheckpoint`, `SurveyCheckpointProps` (`survey-checkpoint`) | The frame: `visual`, `leadIn`, `statement`, `onContinue`, `onOptOut`. `quote`, `options` and `isContinueAvailable` are not passed |
| `CheckpointCardProps`, `CHECKPOINT_CARDS` (`survey-checkpoint`) | The props of the card and the place it is registered |
| `HalfwayCheckpointCard` (`survey-checkpoint-engine`) | `percent`, `minutes`, `line` |
| `getCheckpointText(i18n, card)` (`survey-checkpoint-engine`) | The lead-in and the statement of `card.line` in the active language, the minutes filled in. Nothing when the text cannot be built |
| The pool `halfway` (`survey-checkpoint-engine`) | Its three lines. Not edited here |

### Where each part of the spec lands

The spec describes the whole card, from its trigger to its text. The trigger was built with the engine, so this task is the drawing and the proof on the route.

| Part of the spec | Built in | Tested by |
|---|---|---|
| The midpoint boundary; progress | `survey-running-state` (`progress.midpointBoundary`, `progress.share`) | `getRunningProgress()` |
| Time left: own pace, the 60-second cap, the quiz's average as fallback, no estimate | `survey-running-state` (`timing.minutesLeft`) | `getRunningTiming()` |
| When it may fire: at the midpoint only, once, generic, dropped under pacing, not above 99 minutes | `survey-checkpoint-engine` | `getHalfwayCandidate()`, `rankCheckpointCandidates()`, `isCheckpointSlotOpen()`, `getNextCheckpoint()` |
| The percentage rounded down | `survey-checkpoint-engine` (`percent`) | `getHalfwayCandidate()` |
| The three lines and the minutes slot | `survey-checkpoint-engine` | `CHECKPOINT_POOLS`, `getCheckpointText()` |
| The frame, the dash, the two buttons, wrapping of a long line | `survey-checkpoint` | `<SurveyCheckpoint />` |
| **What the card shows, its accessibility, the registration, the card on the route** | **This task** | The cases below |

# Behaviour

The [halfway through spec](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/halfway-through.md) is the source of truth for every case below. The [Figma frame](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5515-67631) is the source of truth for sizes, spacing, type and colours: follow the frame.

### What the card puts into the frame

| Slot of the frame | Content |
|---|---|
| `visual` | The percentage, as text: the number of `getHalfwayPercent(card)` with the percent sign - "50%", "55%" |
| `leadIn` | The lead-in of `getCheckpointText(i18n, card)` |
| `statement` | Its statement, the minutes already in it |
| `onContinue`, `onOptOut` | The card's own, unchanged |
| `quote`, `options`, `isContinueAvailable` | Not passed. The card has no quotation and no options, and "Dalej" is always there |

### Percentage

| Case | Behaviour |
|---|---|
| `percent` is 50 | "50%" |
| `percent` is 55 - five of nine questions | "55%". The number is progress at the boundary, not a fixed "50%" |
| Any card | The number and the progress bar above the card say the same thing: both come from the questions done |
| The card stays open | Nothing on it changes. The percentage and the minutes are those of the boundary the card fired at |

### Text

The first line of the pool, exactly as the frame writes it; the blank of the frame is the minutes slot.

| Slot | Text |
|---|---|
| Lead-in | "Jesteś na półmetku" |
| Statement | "To już prawie koniec, pozostałe pytania zajmą ok. {minutes} min." |

| Case | Behaviour |
|---|---|
| Any of the three lines of the pool | Shown as drawn, with the minutes in it. The card never picks a line itself and never edits one |
| The minutes | A whole number, as given: "ok. 7 min.", "ok. 1 min." |
| The app's language changes while the card is up | The same line in the other language |
| A count of questions | Never shown. The card speaks of time; the controls bar above it carries the count |

### Invalid and edge input

Nothing here throws. A card that cannot be drawn is never seen: the frame leaves by itself, calling `onContinue` once.

| Input | Behaviour |
|---|---|
| `percent` is not a whole number | Shown rounded down |
| `percent` above 100 | "100%" |
| `percent` is not a number | Nothing is passed as the visual. The frame draws nothing and leaves |
| `getCheckpointText` returns nothing - minutes below 1, a line that does not exist | A blank statement is passed. The frame draws nothing and leaves |
| A line longer than the card | It wraps in the frame and is never cut |

### Accessibility

- The percentage is text, not a picture. It is read once, before the lead-in and the statement: it gets no accessible name that repeats it and is not announced separately.
- The lead-in and the statement are read as one sentence, in that order - the frame does this.
- The minutes are read as a number with its unit, "ok. 7 min.": the slot is filled in the text itself, never drawn as a blank next to it.
- Muted and strong are a visual distinction only.
- Focus, the announcement when the card appears and the two buttons are the frame's. The card adds no focusable element.

# Copy

Polish is the source; every string goes through a Lingui macro and the English entry is filled in.

| Text | Polish (source) | English |
|---|---|---|
| The percentage | {percent}% | {percent}% |

The lead-ins and the statements are the pool's, added by `survey-checkpoint-engine`. This task adds no line and changes none.

# Athena components to use

- No Athena component is used by the card itself: the visual is one number as text, and the buttons come with `SurveyCheckpoint`.
- Do **not** use Athena `ProgressBar` or the app's `SurveySaturatedProgressBar` for the percentage. The frame draws a number, and the screen's own bar is right above the card.
- Do **not** use `Badge` for the number. It is not a label on something else; it is the visual.
- Do **not** add buttons. "Dalej" and "Wyłącz checkpointy" are the frame's.

# Out of scope

- **When the card fires, and with what numbers** - `survey-checkpoint-engine` and `survey-running-state`. Nothing is added to either here: no trigger, no gate, no arithmetic.
- **The lines of the pool** - `survey-checkpoint-engine`.
- **The frame, the Checkpoints phase, the time samples** - `survey-checkpoint`.
- **A second card at the midpoint** - the "halfway split" the doc once named is not defined and is not built.
- **Sending the time per question anywhere** - it stays on the device.
- **An author setting for the card or its wording** - there is none.

# Files to create

```
src/components/survey/SurveyCheckpointHalfway/
├── SurveyCheckpointHalfway.tsx
├── SurveyCheckpointHalfway.test.tsx
├── SurveyCheckpointHalfway.stories.tsx
└── utils/
    ├── getHalfwayPercent.ts                         # the number the card prints
    └── getHalfwayPercent.test.ts
src/components/survey/SurveyQuestionnaire/
├── SurveyQuestionnaire.constants.ts                 # existing: + halfway: SurveyCheckpointHalfway
├── SurveyQuestionnaire.constants.test.ts            # the registration
└── SurveyQuestionnaireSession/
    └── SurveyQuestionnaireSession.test.tsx          # existing: + the cases of the real card
e2e/survey/
├── questionnaire.spec.ts                            # existing: + the two scenarios below
└── survey-checkpoint.fixture.ts                     # the nine-question quiz
```

- No `.types.ts` and no `.constants.ts`: the card has neither a type nor a constant of its own.
- Reuse `clamp` and `isNumber` from `src/utils/number/`. Search `src/utils/` before writing a helper.
- No functions in the component file, no `renderX()`.
- If the files of `survey-checkpoint` ended up named differently from the tree above, follow what is in the repository and say so in the pull request.

# Unit test cases (BDD)

```ts
describe('<SurveyCheckpointHalfway />', () => {
  describe('given a card with a percent of 50 and 7 minutes', () => {
    it('renders exactly one region named "Checkpoint"', ...);
    it('shows "50%" in the visual, before the lead-in and the statement', ...);
    it('shows the lead-in and the statement of the card\'s line, with "ok. 7 min." in it', ...);
    it('shows "Dalej" and "Wyłącz checkpointy", and no options', ...);
  });
  describe('given a percent of 55', () => {
    it('shows "55%"', ...);
  });
  describe('given each of the three lines of the halfway pool', () => {
    it('shows that line with the minutes in it', ...);
  });
  describe('given 1 minute, and 99 minutes', () => {
    it('shows the number as given', ...);
  });
  describe('given the app is in English', () => {
    it('shows the same line in English', ...);
  });
  describe('given a percent that is not a number', () => {
    it('renders nothing', ...);
    it('calls onContinue once', ...);
  });
  describe('given a card whose text cannot be built', () => {
    it('renders nothing and calls onContinue once', ...);
  });
  describe('when rendered again with the same card', () => {
    it('shows the same percentage and the same minutes', ...);
  });
  describe('when "Dalej" is activated', () => {
    it('calls onContinue once', ...);
  });
  describe('when "Wyłącz checkpointy" is activated', () => {
    it('calls onOptOut once', ...);
  });
  describe('accessibility', () => {
    it('exposes the percentage as text, not as an image', ...);
    it('does not repeat the percentage in an accessible name', ...);
    it('adds no focusable element of its own', ...);
  });
  it('never calls onReveal', ...);
  it('shows no count of questions', ...);
});

describe('getHalfwayPercent()', () => {
  it('returns a whole percent as it is', ...);
  it('rounds a percent that is not whole down', ...);
  it('returns 100 for a percent above 100', ...);
  it('returns nothing for a percent that is not a number', ...);
});

describe('CHECKPOINT_CARDS', () => {
  it('holds SurveyCheckpointHalfway under "halfway"', ...);
  it('makes "halfway" one of the enabled types', ...);
});

describe('<SurveyQuestionnaireSession /> - the halfway card', () => {
  // A quiz of nine questions with an average finish time, the real registry and the real engine. Nothing is mocked.
  describe('when the fifth question is answered', () => {
    it('shows the card with "55%" and a statement that gives the minutes', ...);
  });
  describe('when the fifth question is skipped', () => {
    it('shows the same card', ...);
  });
  describe('when the card is closed, the taker steps back and answers the fifth question again', () => {
    it('does not show the card again', ...);
  });
  describe('when the screen is mounted again with the stored session after the card was closed', () => {
    it('shows the sixth question and no card', ...);
  });
  describe('when the quiz is reset after the card and five questions are answered again', () => {
    it('shows the card again', ...);
  });
  describe('given a quiz of eight questions', () => {
    it('never shows the card', ...);
  });
});
```

Find elements by role and accessible name. Build the card for a test by hand - `{ type: "halfway", boundary: 5, line: { pool: "halfway", index: 0 }, percent: 55, minutes: 7 }` - and render it with `renderWithI18n`. Build quizzes and sessions with `createSurvey` and `createSession` of `survey-session`.

# End-to-end test

The Checkpoints phase becomes reachable on the route with this pull request, so it extends `e2e/survey/questionnaire.spec.ts`. The two scenarios are the ones `survey-checkpoint` wrote for its frame and phase and handed to this task; they are copied from there. The last line of the first scenario is this card's own.

**The mocked quiz** is a second fixture, `e2e/survey/survey-checkpoint.fixture.ts`, served through Playwright routes like the first one - never the live API: nine questions in one category, four agreement answers each, an average finish time of 9, no axes and no identity orientations. With one category the category select is skipped, and in such a quiz the only card that can fire is this one, at the boundary after the fifth question.

```gherkin
Scenario: A checkpoint appears and is dismissed
  Given a user opened the nine-question quiz
  When they answer the first five questions
  Then a region named "Checkpoint" is shown in place of the question
  And back is off and reset is on
  And the card reads "55%" and says how many minutes the rest will take
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

The minutes depend on how fast the test answers, so match the statement on its shape ("ok.", a number, "min."), not on a fixed number. Edge cases stay in unit tests.

# Storybook stories

`SurveyCheckpointHalfway.stories.tsx`. Each story passes a card built in the story file and `fn()` for the three callbacks; the line is fixed by its index, so a story always shows the same words.

**Figma, the one state of the frame**
- `Default` - percent 50, the first line of the pool, 7 minutes

**Edge**
- `OddQuiz` - percent 55
- `OneMinute` - 1 minute
- `NinetyNineMinutes` - 99 minutes
- `SecondLine`, `ThirdLine` - the other two lines of the pool

Check widths by resizing the viewport, not by wrapping the story.

# Remember about standards

- Use the standard colors palette, never add colors directly (check https://tailwindcss.com/docs/colors and our color palette in the `src/index.css` file and in [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css))
- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Create a Storybook story for the component with all possible props variants of the component
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)
- Name the branch `feature/survey-checkpoint-halfway-108`, following [Conventional Branch](https://conventional-branch.github.io/) - never keep a generated or default branch name
- Read `AGENTS.md` in the repository before starting; where it differs from this task on a standard, it wins
- The card reads nothing but its props: no session, no running state, no clock. Everything it draws is in `card`
- The card renders one `SurveyCheckpoint` and nothing around it. Stories show it alone, with no decorator, background or fixed width; check them at 320, 360 and 800 px
- No test and no e2e scenario reaches the live API
- Copy is Polish by default. Run `yarn i18n:extract`, translate every new English entry, commit both catalogs
- Commit only files that belong to the task; commits follow Conventional Commits
- The PR follows the repository's pull request template, with a screenshot of the `Default` story next to the Figma frame

# Dependencies

- `survey-checkpoint` (#107) - the frame `SurveyCheckpoint`, `CheckpointCardProps`, the registry `CHECKPOINT_CARDS`, the Checkpoints phase, and the two e2e scenarios with their fixture.
- Through it: `survey-checkpoint-engine` (#106) (the trigger, `HalfwayCheckpointCard`, `getCheckpointText`, the pool) and `survey-running-state` (#105) (progress and time left).

It blocks nothing. The other cards can be built alongside it.

# Resources

- [Spec - Halfway through](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/halfway-through.md) - every case, in full
- [Docs - Halfway through](https://github.com/gi-org-pl/product/blob/main/mypolitics/docs/modules/quiz/questionnaire/checkpoints/halfway-through.md) - the idea
- [Spec - Checkpoints](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/checkpoints.md) - the frame the card fills
- [Spec - Event model](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/event-model.md) - the trigger, the pacing and the time samples
- [Spec - Random copy](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/checkpoints-random-copy.md) - the three lines
- [Spec - Progress and pacing](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/progress-and-pacing.md) - the bar the number has to agree with
- [Figma - the halfway through card](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5515-67631). Figma draws "50%", a blank for the minutes and the back button enabled; the spec prints the true percentage, fills the minutes and disables back, and the spec stands
- [Figma - the Checkpoints phase screen](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5582-98011)
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Storybook docs](https://storybook.js.org/docs/writing-stories)
- [Tailwind docs](https://tailwindcss.com/docs/)
- [Vitest docs](https://vitest.dev/guide/)

# Definition of Done

- [ ] Code follows folder structure (`docs/frontend/conventions/PROJECT_STRUCTURE.md`)
- [ ] Naming follows `docs/frontend/conventions/NAMING.md`
- [ ] `SurveyCheckpointHalfway` sits directly in `src/components/survey/` - no extra folder layer
- [ ] Component layout follows `docs/frontend/conventions/COMPONENT_STRUCTURE.md`: one component per file, the helper in `utils/` with its own test
- [ ] The card is typed `CheckpointCardProps<"halfway">`, renders exactly one `SurveyCheckpoint`, and passes `onContinue` and `onOptOut` unchanged
- [ ] The visual is the percentage as text with the percent sign: the card's number, whole, rounded down
- [ ] The lead-in and the statement come from `getCheckpointText(i18n, card)`; the minutes are in the statement; no count of questions is shown
- [ ] The card draws only from `card` and does not change while it is open
- [ ] A card without a usable percent or without text is not drawn and leaves by itself, with `onContinue` called once
- [ ] The percentage is read once, as text, before the lead-in and the statement; the card adds no focusable element
- [ ] `CHECKPOINT_CARDS` holds `halfway: SurveyCheckpointHalfway`; nothing was added to the engine, the running state or the pools
- [ ] On a nine-question quiz the card appears after the fifth done question, answered or skipped, once per run, and again after a reset; on an eight-question quiz it never appears
- [ ] `e2e/survey/questionnaire.spec.ts` covers the two scenarios on the nine-question fixture, with the API mocked; no test reaches a live address
- [ ] No `ProgressBar`, no `Badge`, no button of the card's own
- [ ] Nothing imported from another component's `utils/`, constants or subcomponents
- [ ] The card fills its parent's width; stories checked at 320 / 360 / 800 px with no horizontal scroll and no cut text
- [ ] Unit tests added, BDD style, coverage ≥95% on all new and changed files; the util has its own test file; elements found by role and name
- [ ] Storybook stories added, all listed above, showing the component alone
- [ ] Every string goes through a Lingui macro, with Polish as the source; `yarn i18n:extract` run, English entries translated, `.po` files committed
- [ ] Biome lint clean
- [ ] TypeScript clean (no `any`, no `@ts-ignore`)
- [ ] Branch named `feature/survey-checkpoint-halfway-108`
- [ ] CI green: build, lint, test, e2e
- [ ] PR description lists decisions and deviations from the ticket/spec; only files belonging to the task are committed
