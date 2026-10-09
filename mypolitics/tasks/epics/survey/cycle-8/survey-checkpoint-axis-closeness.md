<img alt="Single axis checkpoint" src="https://raw.githubusercontent.com/gi-org-pl/product/main/mypolitics/assets/single-axis-checkpoint.png" />
<img alt="Double axis checkpoint" src="https://raw.githubusercontent.com/gi-org-pl/product/main/mypolitics/assets/double-axis-checkpoint.png" />

# Story

As a user taking a quiz, I want to be told, as soon as my answers make it clear, where I stand on one of the quiz's axes - that my score for one thing is high, or that I lean to one side of a pair - so that I learn something about myself before the end.

# Component properties

This task builds two things:

1. **`SurveyCheckpointAxisCloseness`** - the axis closeness card, in its single and its double variant.
2. **One option on the shared `UniversalAxis` bar** - drawing it with no numbers and describing it in words. The card needs it, and the single axis puzzle (`survey-checkpoint-axis-puzzle`) reuses it.

## 1. The card

**Component:** `SurveyCheckpointAxisCloseness`
**Location:** `src/components/survey/SurveyCheckpointAxisCloseness/`
**Shared:** no - domain component under `survey`

It renders exactly one `SurveyCheckpoint` (the frame of `survey-checkpoint`) and fills it: a title and one bar in the visual, and the lead-in and the statement of the line the engine drew. The card is passive: it shows a reading and takes no input.

```ts
// src/components/survey/SurveyCheckpointAxisCloseness/SurveyCheckpointAxisCloseness.tsx
export const SurveyCheckpointAxisCloseness = ({
  card,       // AxisClosenessCheckpointCard - frozen when it fired:
              //   variant "single": { axisId, entry }
              //   variant "double": { axisId, start, end, leadingSide }
  onContinue, // passed to the frame unchanged
  onOptOut,   // passed to the frame unchanged
}: CheckpointCardProps<"axis-closeness">) => ...
```

The card has no props type of its own: `CheckpointCardProps<"axis-closeness">` is the whole contract. It does not use `onReveal` - it is not a puzzle.

```ts
// src/components/survey/SurveyCheckpointAxisCloseness/SurveyCheckpointAxisCloseness.types.ts
// What the card draws in the visual, worked out from its card member.
export interface AxisClosenessBar {
  title: string;       // the name the title shows, on one line
  start: AxisEntry;    // the entry on the start cap
  end?: AxisEntry;     // the entry on the end cap. Present = the double variant
}

// utils/getAxisClosenessBar.ts
export const getAxisClosenessBar = (card: AxisClosenessCheckpointCard): AxisClosenessBar | undefined => ...
// Nothing when the name the title needs is missing.

// utils/useAxisClosenessDescription.ts
export const useAxisClosenessDescription = (card: AxisClosenessCheckpointCard): string => ...
// The description of the bar in words, translated. See "Copy".
```

**The registration** - one line in the registry of `survey-checkpoint`:

```ts
// src/components/survey/SurveyQuestionnaire/SurveyQuestionnaire.constants.ts
"axis-closeness": SurveyCheckpointAxisCloseness,
```

From that line on `axis-closeness` is among the enabled types, and the engine can select it.

## 2. The option on `UniversalAxis`

**Component:** `UniversalAxis` (existing, `src/components/shared/UniversalAxis/`)

```ts
// src/types/axis.ts - one field added to the input the layout is computed from
export interface AxisLayoutInput {
  start?: AxisEntry;
  end?: AxisEntry;
  comparison?: AxisEntry;
  marker?: number | false;
  showValues?: boolean; // default true. false = no number is drawn on or next to any fill
}

// src/components/shared/UniversalAxis/UniversalAxis.types.ts - one prop added
export interface UniversalAxisProps extends AxisLayoutInput {
  showLabels?: boolean;
  description?: string; // replaces the description the bar writes for itself. Passed translated. Blank = the bar's own
}
```

Both default to what the bar does today, so every result module keeps its numbers and its description without a change.

### What this task uses from the tasks before it

No name of an earlier task is redefined here, and nothing is added to the engine or to the running state.

| From | Used |
|---|---|
| `SurveyCheckpoint`, `SurveyCheckpointProps` (`survey-checkpoint`) | The frame: `visual`, `leadIn`, `statement`, `onContinue`, `onOptOut`. `quote`, `options` and `isContinueAvailable` are not passed |
| `CheckpointCardProps`, `CHECKPOINT_CARDS` (`survey-checkpoint`) | The props of the card and the place it is registered |
| `AxisClosenessCheckpointCard` and its two members (`survey-checkpoint-engine`) | `variant`, `entry`, `start`, `end`, `leadingSide`, `line` |
| `getCheckpointText(i18n, card)` (`survey-checkpoint-engine`) | The lead-in and the statement of `card.line`, the names filled in. Nothing when a name is missing |
| The pools `axis-closeness-single` and `axis-closeness-double` (`survey-checkpoint-engine`) | Their lines. Not edited here |
| `UniversalAxis`, `AxisEntry`, `getAxisLayout` (in the app) | The bar, as built, plus the option above |

### Where each part of the spec lands

| Part of the spec | Built in | Tested by |
|---|---|---|
| Which axes are eligible, one-sided or two-sided; the value of each side; the lean; the answered questions behind an axis | `survey-running-state` (`axes`) | `getRunningAxes()` |
| When it may fire: 70 for a single axis, 15 points for a pair, 5 answered questions, once per axis, shared with the puzzle; which of several axes is put forward | `survey-checkpoint-engine` | `getQualifyingAxes()`, `getAxisClosenessCandidate()`, `rankCheckpointCandidates()`, `getNextCheckpoint()` |
| The lines and their name slots | `survey-checkpoint-engine` | `CHECKPOINT_POOLS`, `getCheckpointSlots()`, `getCheckpointText()` |
| The frame, the two buttons, wrapping of a long statement | `survey-checkpoint` | `<SurveyCheckpoint />` |
| **The title and the bar, the bar without numbers, the description in words, the registration, the card on the route** | **This task** | The cases below |

Among several clear axes the engine puts forward the one with the largest lean, then the one with more answered questions behind it, then the earlier one in the quiz's order. That is already built; the card draws the axis it is given.

# Behaviour

The [axis closeness spec](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/axis-closeness.md) is the source of truth for the card, and the "Value label cases" and "Accessibility" sections of the [universal axis spec](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/universal-axis.md) for the option on the bar. The Figma frames - [single](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5515-67082) and [double](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5515-67161) - are the source of truth for sizes, spacing, type and colours: follow the frames.

### What the card puts into the frame

| Slot of the frame | Content |
|---|---|
| `visual` | A title, and under it one `UniversalAxis` with `showValues={false}` and the description of `useAxisClosenessDescription` |
| `leadIn`, `statement` | The two texts of `getCheckpointText(i18n, card)` |
| `onContinue`, `onOptOut` | The card's own, unchanged |
| `quote`, `options`, `isContinueAvailable` | Not passed |

### Visual

| Case | Behaviour |
|---|---|
| Single variant | The title is the name of `card.entry.orientation`. The bar is one-sided: `card.entry` as the start entry, so the orientation's image sits on the start cap and the fill grows from it. No names under the bar |
| Double variant | The title is the name of the leading orientation - `card.start` or `card.end`, by `card.leadingSide`. The bar is double-sided: `card.start` on the start cap, `card.end` on the end cap, each filled from its own cap, each named under its cap (`showLabels`) |
| Either variant | The marker is at the middle - the bar's default. No number is drawn on or next to a fill |
| Double variant, values that do not reach 100 together | The gap stays in the middle, as the bar draws it |
| Double variant, values that exceed 100 together | Scaled by the bar. The title still names the side the card says is leading |
| The leading side is the end side | The bar keeps its sides. Only the title and the statement name the leader. The card never swaps `start` and `end` |
| An orientation without an image, or without a colour | As the bar draws it: a cap in the colour alone, or the neutral fallback |
| The bar | Fills the width of the visual slot and keeps its proportions. There is no smaller variant |
| The card stays open | Nothing on it changes. It shows the reading of the boundary it fired at |

The title is plain text. It is not the chip of the result modules, and it has no emphasised or quiet look. The card shows no percentage anywhere, has no info button and does not show the axis's description.

### Text

The first line of each pool. The frames write the name into the sentence in lower case and bend the sentence to it; the spec's wording keeps each name whole, in quotation marks, and stands.

| Variant | Lead-in | Statement |
|---|---|---|
| Single | "To już wiemy" | "Twój wynik na skali „{orientation}” jest wysoki!" |
| Double | "Tego już jesteśmy pewni" | "Twój wynik po stronie „{leading}” jest wyższy niż po stronie „{other}”!" |

| Case | Behaviour |
|---|---|
| Any line of the two pools | Shown as drawn. The card never picks a line itself and never edits one |
| A name, in the title, under the bar and in the statement | As the quiz wrote it: same case, never declined, never shortened by the card |
| A name that contains quotation marks | Shown as written, inside the statement's own marks |
| The app's language changes while the card is up | The same line, and the description of the bar, in the other language |

### The bar without numbers - `UniversalAxis`

| Case | Behaviour |
|---|---|
| `showValues` not passed, or `true` | The bar exactly as today: a number inside a fill that fits it, after a small one-sided fill, and in the description |
| `showValues={false}`, one-sided | No number inside the fill and none after it, whatever the value |
| `showValues={false}`, double-sided | No number on either side |
| `showValues={false}`, with a comparison | No number, as today with a comparison. The band and the other party's image are unchanged |
| `showValues={false}`, anything else on the bar | Unchanged: the fills and their lengths, the caps, the marker, the labels, the scaling of values that exceed the track |
| `showValues={false}`, no `description` | The bar's own description lists the names of the entries, and of the comparison, with no number and nothing about a missing value. With no name to list it is the text of an empty bar |
| `description` passed | It is the description of the image, as given. The bar adds nothing to it |
| `description` blank or only whitespace | The bar's own description |
| `description` passed while `showValues` is `true` | The numbers are still drawn. Only the description is replaced |

`getAxisLayout` decides today where each number goes (`valuePlacement`). With `showValues` false every side's placement is `hidden`; decide it there, so the component only draws what the layout says.

### Invalid and edge input

Nothing here throws. A card that cannot be drawn is never seen: the frame leaves by itself, calling `onContinue` once.

| Input | Behaviour |
|---|---|
| The name the title needs is missing or blank | `getAxisClosenessBar` returns nothing; nothing is passed as the visual. The frame draws nothing and leaves |
| `getCheckpointText` returns nothing - a name of the statement is missing, a line that does not exist | A blank statement is passed. The frame draws nothing and leaves |
| A value outside 0-100 | Clamped by the bar |
| A value that is missing or not a number | The bar draws the cap with no fill, as it does today. The engine never sends such a card |
| A name with line breaks or doubled spaces | Collapsed to one line, in the title and in the description |
| A name longer than the card | It wraps in the title and in the statement and is never cut there. Under the bar it is truncated by the bar, and it is complete in the description |

### Accessibility

- The bar is one image, not interactive and not focusable - as it is today.
- Its description is in words and carries what a sighted taker sees: the orientation names and where the reading lies - high for the single variant, which side is ahead for the double one. It carries no percentage and no digit, because the card shows none.
- The title is text and is read before the bar; the lead-in and the statement are read after it, as one sentence.
- The lean is never carried by colour or by the length of a fill alone: the statement and the description say it.
- Under the bar a truncated name stays complete for assistive technology, through the description.
- Focus, the announcement when the card appears and the two buttons are the frame's. The card adds no focusable element.

# Copy

Polish is the source; every string goes through a Lingui macro and the English entry is filled in. The names are placed as written - never declined, never re-cased - and nothing in a text agrees with a name's gender.

| Text | Polish (source) | English |
|---|---|---|
| Description of the bar, single | Skala „{orientation}”: wysoki wynik | The “{orientation}” scale: a high score |
| Description of the bar, double | „{start}” i „{end}”: wyższy wynik po stronie „{leading}” | “{start}” and “{end}”: the higher score is on the “{leading}” side |
| The bar's own description of a comparison, without a number | porównanie z {name} | compared with {name} |

In the double description `{start}` and `{end}` are the two sides in the bar's order, and `{leading}` is the one that is ahead. The lead-ins and the statements are the pools', added by `survey-checkpoint-engine`. This task adds no line and changes none.

# Athena components to use

- `UniversalAxis` (the app's shared bar, not Athena) for the bar. It already uses Athena `Avatar` for a cap with an image.
- Do **not** use `SingleAxisChart` or `DoubleAxisChart`. Each is a `ModuleWrapper` with a title chip and the statistics and info buttons; a checkpoint borrows a module's bar, never its frame.
- Do **not** use `OrientationChip` for the title. The title is plain text with no emphasised or quiet look.
- Do **not** use Athena `ProgressBar`. It has no caps, no marker and no second side.
- Do **not** add buttons. "Dalej" and "Wyłącz checkpointy" are the frame's.

# Out of scope

- **When the card fires, for which axis, and with what values** - `survey-checkpoint-engine` and `survey-running-state`. Nothing is added to either here.
- **The lines of the two pools** - `survey-checkpoint-engine`.
- **The frame and the Checkpoints phase** - `survey-checkpoint`.
- **The masked bar** - the whole track hatched with no fill, for a puzzle that is still asking: `survey-checkpoint-axis-puzzle` adds it on top of `showValues`.
- **Restructuring `UniversalAxis`.** The file predates the one-component-per-file rule and still holds `renderFill` and its siblings. Keep the diff to the option. If the reviewer asks for the split, do it as a commit of its own and say so in the pull request.
- **Any change to how a result module looks.** `SingleAxisChart`, `DoubleAxisChart`, `AxisRow`, `RankedRow` and `ArchetypeLeader` pass neither new prop and stay as they are.
- **A correction card** when later answers overturn the reading, **a low reading**, **an explanation of the axis** - not supported.

# Files to create

```
src/components/survey/SurveyCheckpointAxisCloseness/
├── SurveyCheckpointAxisCloseness.tsx
├── SurveyCheckpointAxisCloseness.test.tsx
├── SurveyCheckpointAxisCloseness.types.ts           # AxisClosenessBar
├── SurveyCheckpointAxisCloseness.stories.tsx
├── SurveyCheckpointAxisClosenessVisual/             # the title and the bar
│   ├── SurveyCheckpointAxisClosenessVisual.tsx
│   └── SurveyCheckpointAxisClosenessVisual.test.tsx
└── utils/
    ├── getAxisClosenessBar.ts                       # card -> title and entries
    ├── getAxisClosenessBar.test.ts
    ├── useAxisClosenessDescription.ts               # the description in words
    └── useAxisClosenessDescription.test.tsx
src/components/shared/UniversalAxis/                 # existing
├── UniversalAxis.tsx                                # + showValues, description
├── UniversalAxis.types.ts
├── UniversalAxis.test.tsx                           # + the cases below
└── UniversalAxis.stories.tsx                        # + the stories below
src/types/axis.ts                                    # existing: + showValues in AxisLayoutInput
src/utils/axis/
├── getAxisLayout.ts                                 # existing: every placement hidden when showValues is false
└── getAxisLayout.test.ts                            # + the cases below
src/components/survey/SurveyQuestionnaire/
├── SurveyQuestionnaire.constants.ts                 # existing: + "axis-closeness": SurveyCheckpointAxisCloseness
└── SurveyQuestionnaireSession/
    └── SurveyQuestionnaireSession.test.tsx          # existing: + the cases of the real card
e2e/survey/
├── questionnaire.spec.ts                            # existing: + the scenario below
└── survey-axis.fixture.ts                           # a nine-question quiz with one axis
```

- Reuse `toSingleLine` from `src/utils/text/`. Search `src/utils/` before writing a helper.
- No functions in a component file, no `renderX()`.
- If `survey-checkpoint-halfway` has landed, its registration test and its e2e helpers are there to extend; this task does not depend on it.

# Unit test cases (BDD)

```ts
describe('<SurveyCheckpointAxisCloseness />', () => {
  describe('given the single variant', () => {
    it('renders exactly one region named "Checkpoint"', ...);
    it('shows the name of the orientation as the title, before the bar', ...);
    it('draws a one-sided bar from the start cap, with no names under it', ...);
    it('draws no number on or next to the fill', ...);
    it('describes the bar in words: the name and that the score is high, with no digit', ...);
    it('shows the lead-in and the statement of the card\'s line, with the name in it', ...);
    it('shows "Dalej" and "Wyłącz checkpointy", and no options', ...);
  });
  describe('given the double variant with the start side leading', () => {
    it('shows the name of the start side as the title', ...);
    it('draws a double-sided bar with each side named under its cap', ...);
    it('draws no number on either side', ...);
    it('describes the bar in words: both names and which side is ahead, with no digit', ...);
    it('shows the statement with the leading name first and the other one second', ...);
  });
  describe('given the double variant with the end side leading', () => {
    it('shows the name of the end side as the title', ...);
    it('keeps the start side on the start cap and the end side on the end cap', ...);
  });
  describe('given values that do not reach 100 together, and values that exceed it', () => {
    it('draws the bar and names the leading side the card gives', ...);
  });
  describe('given each line of the two pools', () => {
    it('shows that line with the names in it', ...);
  });
  describe('given a name with line breaks, a long name, and a name with quotation marks', () => {
    it('shows the title on one piece of text, in full, as written', ...);
    it('keeps the full name in the description of the bar', ...);
  });
  describe('given the app is in English', () => {
    it('shows the line and the description in English, with the names unchanged', ...);
  });
  describe('given a card whose title name is missing', () => {
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
  describe('accessibility', () => {
    it('exposes the bar as a single image and adds no focusable element', ...);
    it('shows no percentage anywhere on the card', ...);
  });
  it('never calls onReveal', ...);
});

describe('<SurveyCheckpointAxisClosenessVisual />', () => {
  it('renders the title as plain text, not as a chip', ...);
  it('passes the entries, showValues false and the description to the bar', ...);
  it('turns the labels on only when there is an end entry', ...);
});

describe('getAxisClosenessBar()', () => {
  it('returns the entry as the start entry and its name as the title for the single variant', ...);
  it('returns both entries and the name of the leading side as the title for the double variant', ...);
  it('never swaps the sides', ...);
  it('collapses a name to one line', ...);
  it('returns nothing when the name the title needs is missing or blank', ...);
});

describe('useAxisClosenessDescription()', () => {
  it('names the orientation and says its score is high for the single variant', ...);
  it('names both sides in the bar\'s order and the side that is ahead for the double variant', ...);
  it('contains no digit and no percent sign', ...);
  it('places a name as written', ...);
});

describe('<UniversalAxis /> - showValues and description', () => {
  describe('given showValues is false on a one-sided bar', () => {
    it('writes no number inside a fill that would fit one', ...);
    it('writes no number after a small fill', ...);
  });
  describe('given showValues is false on a double-sided bar', () => {
    it('writes no number on either side', ...);
  });
  describe('given showValues is false', () => {
    it('keeps the fills, the caps, the marker and the labels as they are', ...);
    it('describes the bar by its names, with no number', ...);
    it('describes a comparison by its name, with no number', ...);
    it('falls back to the text of an empty bar when there is no name', ...);
  });
  describe('given a description', () => {
    it('uses it as the description of the image', ...);
    it('still draws the numbers when showValues is not false', ...);
  });
  describe('given a blank description', () => {
    it('uses the bar\'s own description', ...);
  });
  describe('given neither prop', () => {
    it('draws and describes the bar exactly as before', ...);
  });
});

describe('getAxisLayout() - showValues', () => {
  it('hides the value of every side when showValues is false', ...);
  it('leaves widths, marker and comparison unchanged', ...);
  it('places values as before when showValues is true or absent', ...);
});

describe('CHECKPOINT_CARDS', () => {
  it('holds SurveyCheckpointAxisCloseness under "axis-closeness"', ...);
});

describe('<SurveyQuestionnaireSession /> - the axis closeness card', () => {
  // Nine questions and the real registry and engine. Nothing is mocked.
  describe('given a quiz with one two-sided axis, when five answers that all score its start side are given', () => {
    it('shows the card titled with the name of the start side, with a bar without numbers', ...);
  });
  describe('given the same quiz, when the five answers all score its end side', () => {
    it('shows the card titled with the name of the end side', ...);
  });
  describe('given a quiz with an axis whose second pole no question scores, when five answers bring it to 70 or more', () => {
    it('shows the single variant', ...);
  });
  describe('given a quiz without axes', () => {
    it('never shows this card', ...);
  });
});
```

Find elements by role and accessible name. Build a card for a test by hand, with orientations from `createOrientation` and entries from `createAxisPair`, and render it with `renderWithI18n`. Build quizzes and sessions with `createSurvey` and `createSession` of `survey-session`, adding the orientations and the axis the case needs. The existing tests of `UniversalAxis` and `getAxisLayout` must pass unchanged.

# End-to-end test

**One scenario is added** to `e2e/survey/questionnaire.spec.ts`. The card is reachable on the route only in a quiz that sends axes - three of the fourteen the API lists - and what a taker can do on it, continue or turn checkpoints off, is already covered by the two scenarios of the frame. It still earns one scenario of its own: it is the first card that depends on the whole chain - the axes as the API sends them, the scores counted during the quiz, the engine, the registry and a result component - and no unit test runs that chain on the built app.

**The mocked quiz** is a fixture of its own, `e2e/survey/survey-axis.fixture.ts`, served through Playwright routes - never the live API: nine questions in one category, four agreement answers each, two orientations, and one axis of type `axis` with the first orientation on its negative side and the second on its positive side. In every question the two agreeing answers score the first orientation and the two disagreeing answers score the second. No identity orientations and no compass axes, so no other personal card can fire in it.

```gherkin
Scenario: A quiz with axes tells the taker where they stand
  Given a user opened the nine-question quiz with one axis
  When they answer the first five questions with "Zdecydowanie za"
  Then a region named "Checkpoint" shows the name of the first orientation as its title
  And a bar described in words, with no percentage on it or in its description
  And a statement that names both orientations
  When they press "Dalej"
  Then they see the sixth question
```

The line is drawn with the session's seed, so match the statement on the two names, not on a whole sentence. Edge cases stay in unit tests.

# Storybook stories

`SurveyCheckpointAxisCloseness.stories.tsx`. Each story passes a card built in the story file and `fn()` for the three callbacks; the line is fixed by its index.

**Figma, in the order of the frames**
- `Single` - "Radykalizm", the first line of the single pool
- `Double` - "Eurosceptycyzm" leading "Federacjonizm", the first line of the double pool

**Edge**
- `DoubleEndLeading` - the end side is ahead; the bar keeps its sides
- `DoubleWithGap` - values that do not reach 100 together
- `DoubleOverTrack` - values that exceed 100 together
- `SingleFull`, `DoubleOneSided` - a value of 100, and 100 against 0: nothing is cut at the edge of the track
- `NoImage`, `NoColor`
- `LongNames` - the title and the statement wrap; the names under the bar are truncated
- `NameWithQuotationMarks`
- `SecondLine`, `ThirdLine` - the other lines of each pool

`UniversalAxis.stories.tsx` - added: `OneSidedWithoutValues`, `OneSidedSmallValueWithoutValues`, `DoubleSidedWithoutValues`, `WithDescription`. The existing stories are not changed.

Check widths by resizing the viewport, not by wrapping the story.

# Remember about standards

- Use the standard colors palette, never add colors directly (check https://tailwindcss.com/docs/colors and our color palette in the `src/index.css` file and in [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css))
- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Create a Storybook story for the component with all possible props variants of the component
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)
- Name the branch `feature/survey-checkpoint-axis-closeness-109`, following [Conventional Branch](https://conventional-branch.github.io/) - never keep a generated or default branch name
- Read `AGENTS.md` in the repository before starting; where it differs from this task on a standard, it wins
- The card reads nothing but its props: no session, no running state. Everything it draws is in `card`
- The option on `UniversalAxis` is one bar with a switch, not a second bar. Its defaults are today's behaviour
- The card renders one `SurveyCheckpoint` and nothing around it. Stories show it alone, with no decorator, background or fixed width; check them at 320, 360 and 800 px
- No test and no e2e scenario reaches the live API
- Copy is Polish by default, descriptions included. Run `yarn i18n:extract`, translate every new English entry, commit both catalogs
- Commit only files that belong to the task; commits follow Conventional Commits
- The PR follows the repository's pull request template, with screenshots of `Single` and `Double` next to the Figma frames

# Dependencies

- `survey-checkpoint` (#107) - the frame `SurveyCheckpoint`, `CheckpointCardProps`, the registry `CHECKPOINT_CARDS`, the Checkpoints phase.
- Through it: `survey-checkpoint-engine` (#106) (the trigger, `AxisClosenessCheckpointCard`, `getCheckpointText`, the two pools) and `survey-running-state` (#105) (the axes and their values).
- `UniversalAxis` and `getAxisLayout` - built, on `main` of the app.

It blocks `survey-checkpoint-axis-puzzle` (#113), which draws the same bar without numbers and adds its mask to it, and through it `survey-checkpoint-position-puzzle` (#114). Both are written against `showValues` and `description`: do not rename them without updating those tasks.

# Resources

- [Spec - Axis closeness](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/axis-closeness.md) - every case of the card, in full
- [Spec - Universal axis](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/universal-axis.md) - the bar; "Value labels switched off" is the option built here
- [Docs - Axis closeness](https://github.com/gi-org-pl/product/blob/main/mypolitics/docs/modules/quiz/questionnaire/checkpoints/axis-closeness.md) - the idea
- [Spec - Checkpoints](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/checkpoints.md) - the frame the card fills
- [Spec - Event model](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/event-model.md) - the trigger, the gate and the order among several axes
- [Spec - Random copy](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/checkpoints-random-copy.md) - the lines of the two pools
- [Spec - Single axis puzzle](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/single-axis-puzzle.md) - the next user of the bar without numbers
- [Figma - single axis](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5515-67082) | [Figma - double axis](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5515-67161). The frames write "Twój radykalizm jest wysoki!" and "Twój eurosceptycyzm wynosi więcej niż federacjonizm!" and draw the back button enabled; the spec rewrites both statements and disables back, and the spec stands
- [Figma - the universal axis](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5514-39733)
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Storybook docs](https://storybook.js.org/docs/writing-stories)
- [Tailwind docs](https://tailwindcss.com/docs/)
- [Vitest docs](https://vitest.dev/guide/)

# Definition of Done

- [ ] Code follows folder structure (`docs/frontend/conventions/PROJECT_STRUCTURE.md`)
- [ ] Naming follows `docs/frontend/conventions/NAMING.md`
- [ ] `SurveyCheckpointAxisCloseness` sits directly in `src/components/survey/` - no extra folder layer
- [ ] Component layout follows `docs/frontend/conventions/COMPONENT_STRUCTURE.md`: one component per file, helpers and hooks in `utils/`, each with its own test
- [ ] The card is typed `CheckpointCardProps<"axis-closeness">`, renders exactly one `SurveyCheckpoint`, and passes `onContinue` and `onOptOut` unchanged
- [ ] Single variant: the orientation's name as the title, a one-sided bar from the start cap, no names under it
- [ ] Double variant: the leading name as the title, both sides on their own caps with their names under them; the sides are never swapped
- [ ] The marker is at the middle; no number is drawn on the card, and none is in the description of the bar
- [ ] The title is plain text read before the bar; names are shown as written, wrap in the title and are never cut there
- [ ] The description of the bar is in words: the name and "high" for the single variant, both names and the side ahead for the double one
- [ ] The lead-in and the statement come from `getCheckpointText(i18n, card)`; no line was added or changed
- [ ] The card draws only from `card` and does not change while it is open
- [ ] A card without a title name or without text is not drawn and leaves by itself, with `onContinue` called once
- [ ] `UniversalAxis` takes `showValues` (through `AxisLayoutInput`) and `description`; with `showValues={false}` it draws no number in any mode and writes none into its own description; `description` replaces the description
- [ ] With neither prop the bar draws and describes itself exactly as before; the existing tests and stories of `UniversalAxis` and `getAxisLayout` pass unchanged, and the new cases and stories are added to them
- [ ] No result module changed
- [ ] `CHECKPOINT_CARDS` holds `"axis-closeness": SurveyCheckpointAxisCloseness`; nothing was added to the engine, the running state or the pools
- [ ] `e2e/survey/questionnaire.spec.ts` covers the scenario on the fixture with one axis, with the API mocked; no test reaches a live address
- [ ] No `SingleAxisChart`, `DoubleAxisChart`, `ModuleWrapper`, `OrientationChip` or `ProgressBar` on the card, and no button of the card's own
- [ ] Nothing imported from another component's `utils/`, constants or subcomponents
- [ ] The card fills its parent's width; stories checked at 320 / 360 / 800 px with no horizontal scroll, no cut title and no fill cut at the edge of the track
- [ ] Unit tests added, BDD style, coverage ≥95% on all new and changed files; every subcomponent, util and hook has its own test file; elements found by role and name
- [ ] Storybook stories added, all listed above, showing the component alone
- [ ] Every string from the Copy section goes through a Lingui macro, with Polish as the source; `yarn i18n:extract` run, English entries translated, `.po` files committed
- [ ] Biome lint clean
- [ ] TypeScript clean (no `any`, no `@ts-ignore`)
- [ ] Branch named `feature/survey-checkpoint-axis-closeness-109`
- [ ] CI green: build, lint, test, e2e
- [ ] PR description lists decisions and deviations from the ticket/spec; only files belonging to the task are committed
