<img alt="Single axis puzzle: ask" src="https://raw.githubusercontent.com/gi-org-pl/product/main/mypolitics/assets/single-axis-puzzle-checkpoint-1.png" /> <img alt="Single axis puzzle: hit" src="https://raw.githubusercontent.com/gi-org-pl/product/main/mypolitics/assets/single-axis-puzzle-checkpoint-2.png" /> <img alt="Single axis puzzle: miss" src="https://raw.githubusercontent.com/gi-org-pl/product/main/mypolitics/assets/single-axis-puzzle-checkpoint-3.png" />

# Story

As a user taking a quiz, I want a card between two questions to hide one axis, ask me which of its two sides I think I am closer to, and show me the reading the moment I pick, so that I can test what I believe about myself against what my answers say so far.

# Component properties

This task builds four things, in one pull request:

1. **The masked state of `UniversalAxis`** - the whole track hatched, nothing on it that a value could be read from.
2. **`SurveyCheckpointOptions`** - the rows a puzzle offers for a guess. Its own survey component, built here and used by both puzzles: this one and `survey-checkpoint-position-puzzle`.
3. **`useCheckpointGuess`** - the three states of a puzzle (ask, hit, miss) and the one move between them. Built here and used by both puzzles.
4. **`SurveyCheckpointAxisPuzzle`** - the card, and its entry in the card registry.

Nothing is added to the engine. Which axis gets the card, when, the two values and the leading side are decided in `survey-checkpoint-engine`; the card draws its member of `CheckpointCard`.

## 1. The masked bar

**Component:** `UniversalAxis` (existing, `src/components/shared/UniversalAxis/`)

```ts
// src/types/axis.ts - one field added to the input, one to the layout
export interface AxisLayoutInput {
  start?: AxisEntry;
  end?: AxisEntry;
  comparison?: AxisEntry;
  marker?: number | false;
  showValues?: boolean; // added by survey-checkpoint-axis-closeness
  isMasked?: boolean;   // default false. true = the whole track is hatched and nothing else is drawn on it
}

export interface AxisLayout {
  // ...the fields already there
  isMasked: boolean;
}
```

`UniversalAxisProps` extends `AxisLayoutInput`, so the bar takes `isMasked` with no change to its own props type. `showValues` and `description` are the two props `survey-checkpoint-axis-closeness` added; this task uses them as they are and adds the mask on top.

## 2. The option rows

**Component:** `SurveyCheckpointOptions`
**Location:** `src/components/survey/SurveyCheckpointOptions/`
**Shared:** no - two parents, both in the `survey` domain, so it is a sibling component there

```ts
// src/components/survey/SurveyCheckpointOptions/SurveyCheckpointOptions.types.ts
import type { Orientation } from "@/types/orientation";

export interface SurveyCheckpointOptionsProps {
  label: string;                                // the name of the group: the statement the options answer, translated
  options: Orientation[];                       // one row each, in this order. Never reordered here
  onSelect: (orientation: Orientation) => void; // called for the first activation only
}
```

Presentational. It is what a puzzle passes to the `options` prop of `SurveyCheckpoint`. It knows nothing about cards, axes or which row is correct.

## 3. The guess

```ts
// src/utils/checkpoint/useCheckpointGuess.ts
export type CheckpointGuessState = "ask" | CheckpointOutcome; // "ask" | "hit" | "miss"

export interface CheckpointGuess {
  state: CheckpointGuessState;
  line: CheckpointLine;                        // the card's own line while asking, the reveal line after the guess
  guess: (outcome: CheckpointOutcome) => void; // acts once; every later call does nothing
}

export const useCheckpointGuess = (
  card: CheckpointCard,
  onReveal: CheckpointCardProps["onReveal"],
  onContinue: () => void,
): CheckpointGuess => ...
```

It is global from the start, in `src/utils/checkpoint/`, because the second puzzle is its second consumer and follows in the next cycle.

## 4. The card

**Component:** `SurveyCheckpointAxisPuzzle`
**Location:** `src/components/survey/SurveyCheckpointAxisPuzzle/`
**Shared:** no - domain component under `survey`

```ts
// src/components/survey/SurveyCheckpointAxisPuzzle/SurveyCheckpointAxisPuzzle.tsx
export const SurveyCheckpointAxisPuzzle = (props: CheckpointCardProps<"axis-puzzle">) => ...
// props.card is an AxisPuzzleCheckpointCard: axisId, start, end, leadingSide, line, boundary
```

```ts
// src/components/survey/SurveyQuestionnaire/SurveyQuestionnaire.constants.ts - one entry added
export const CHECKPOINT_CARDS: CheckpointCardRegistry = {
  // ...the entries already there
  "axis-puzzle": SurveyCheckpointAxisPuzzle,
};
```

It follows the card contract of `survey-checkpoint`: exactly one `SurveyCheckpoint`, `onContinue` and `onOptOut` passed to it unchanged, no button of its own outside `options`, nothing read but its props.

### What this task uses from the tasks before it

No name of an earlier task is redefined here.

| From | Used |
|---|---|
| `AxisPuzzleCheckpointCard` (`survey-checkpoint-engine`) | `start`, `end` (each an `AxisEntry`: orientation and value), `leadingSide`, `line` |
| `getCheckpointText(i18n, card, line)` (`survey-checkpoint-engine`) | The lead-in and the statement of the ask line, and of the reveal line once there is one |
| `CheckpointOutcome`, `CheckpointLine` (`survey-checkpoint-engine`) | The outcome of a guess, and the line it gets |
| `SurveyCheckpoint` (`survey-checkpoint`) | `visual`, `leadIn`, `statement`, `options`, `isContinueAvailable`, `onContinue`, `onOptOut` |
| `CheckpointCardProps` with `onReveal`, `CHECKPOINT_CARDS` (`survey-checkpoint`) | The props of a card and the registry |
| `UniversalAxis` with `showValues` and `description` (`survey-checkpoint-axis-closeness`) | The bar without numbers, described by the card in words |

### Where each part of the spec lands

| Part of the spec | Built in | Tested by |
|---|---|---|
| Which axes are eligible; both values; the lead; the answered questions behind an axis; the form of a name with two forms | `survey-running-state` (`axes`) | `getRunningAxes()` |
| When it may fire: a lead of 15 points, 5 answered questions, once per axis, one card per axis shared with axis closeness, which of several axes is put forward, no single axis | `survey-checkpoint-engine` | `getQualifyingAxes()`, `getAxisPuzzleCandidate()`, `rankCheckpointCandidates()`, `getNextCheckpoint()` |
| The three pools, their name slot, the reveal line drawn on the guess and kept for a reload | `survey-checkpoint-engine` | `CHECKPOINT_POOLS`, `drawRevealLine()`, `getCheckpointText()` |
| The frame, "Dalej" left out, focus moving to the new text, the two buttons | `survey-checkpoint` | `<SurveyCheckpoint />`, `useCheckpointCard()` |
| The bar without numbers and a description passed in | `survey-checkpoint-axis-closeness` | `<UniversalAxis />`, `getAxisLayout()` |
| **The masked bar, the option rows, the three states and the move between them, the descriptions, the registration, the card on the route** | **This task** | The cases below |

# Behaviour

The [single axis puzzle spec](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/single-axis-puzzle.md) is the source of truth for the card and the option rows, and the [universal axis spec](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/universal-axis.md) for the bar - the masked state is the exception named under its "Comparison cases". The Figma frames - [ask](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5515-67799), [hit](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5516-67925), [miss](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5516-68299) - are the source of truth for sizes, spacing, type and colours: follow the frames.

### The three states

| State | When | `visual` | Text | `options` | "Dalej" |
|---|---|---|---|---|---|
| Ask | The card was just shown | The bar, masked | The card's own line: `getCheckpointText(i18n, card)` | Two rows | Not offered: `isContinueAvailable={false}` |
| Hit | The taker picked the leading pole | The bar, uncovered | The hit line, which names the leading pole | None | Offered |
| Miss | The taker picked the other pole | The bar, uncovered - the same as on a hit | The miss line | None | Offered |

"Wyłącz checkpointy" is the frame's and is there in all three.

The card starts in ask and moves once. The state lives in the card for as long as it is on screen, and nowhere else: it is not written to the session, not sent and not logged. Put up again after a reload, the card starts in ask with the same axis and the same values, and the earlier guess is gone.

### The bar on the card

One `UniversalAxis` in every state: `start` = `card.start`, `end` = `card.end`, `showLabels`, `showValues={false}`, the default marker, the description below, and `isMasked` while the state is ask.

| Case | Behaviour |
|---|---|
| Ask | Both caps and both names under them; the whole track hatched; no fill, no marker, no number |
| Hit and miss | Each side filled from its own cap in its pole's colour; the marker at the midpoint; both names under the caps |
| Numbers | Never drawn on the bar, in any state of this card |
| Values that do not reach 100 together | The gap stays in the middle, as the bar draws it |
| Values that exceed 100 together | The bar scales the fills |
| A value outside 0-100 | Clamped by the bar |
| The mask lifts | In place, on the same card. Any transition on it is CSS only and has a reduced-motion path that removes it: the mask is then swapped for the fills at once |

The card never recomputes a value and never updates while it is open: hit or miss is decided against `card.leadingSide`, as read when the card fired.

### The masked bar - `UniversalAxis`

| Case | Behaviour |
|---|---|
| `isMasked` not passed, or `false` | The bar exactly as today |
| `isMasked`, double-sided | Both caps, with their images and colours, and the labels when they are on. The whole track is hatched |
| Fills | Not drawn, whatever the values. No element of a fill exists |
| Numbers | Not drawn, whatever `showValues` says |
| Marker | Not drawn, whatever `marker` says |
| Comparison | Not drawn, whatever `comparison` says: no band, no image |
| The same bar with values and without them | Draws the same. Nothing in what is rendered differs by a value |
| Other modes | The mode still follows which entries are passed. In every mode the track is hatched whole and nothing else is drawn on it |
| The hatch | The pattern of `src/constants/hatch.ts`, as in the frame. No new pattern |
| Description, `description` passed | That description, as given |
| Description, none passed | The bar's own description of a bar without values: the names alone, no number, nothing about a missing value, no comparison |

`getAxisLayout` decides it, as it decides `showValues`: with `isMasked` the layout has no marker, no comparison, no width and no shown value on either side, and `isMasked` true. The component draws what the layout says, plus the hatch over the track.

### The option rows - `SurveyCheckpointOptions`

| Case | Behaviour |
|---|---|
| Rows | One per item of `options`, in the order given |
| A row | The orientation's image on its colour, then its name |
| The group | Named by `label` |
| A row is activated | `onSelect` with its orientation, once |
| Any row is activated after that | Nothing. The first activation is the choice |
| Marking | No row is ever shown as chosen, correct or wrong. The component has no such look |
| An orientation without an image | The colour alone |
| An image that does not load | What a row without an image shows |
| An orientation without a colour | The neutral fallback |
| Neither image nor colour | The neutral fallback alone. Rows then differ by name only |
| A name with line breaks or doubled spaces | Collapsed to one line |
| A name longer than the row | It wraps onto further lines. It is never cut |
| `options` empty | Nothing is drawn |
| A colour that is not a colour | The neutral fallback, through `getSafeColor` |

On this card the rows are `[card.start.orientation, card.end.orientation]`: the start pole first, the end pole second - the order of the caps above them. The order is never shuffled, and nothing marks the leading pole before the tap.

### The guess

| Case | Behaviour |
|---|---|
| The taker picks the row of `card[card.leadingSide]` | `guess("hit")` |
| The taker picks the other row | `guess("miss")` |
| "Wyłącz checkpointy" while asking | The frame's `onOptOut`. `onReveal` is not called and nothing is revealed |

`useCheckpointGuess`:

| Case | Behaviour |
|---|---|
| Before a guess | `state` is `ask`, `line` is `card.line` |
| `guess(outcome)` | Calls `onReveal(outcome)` once |
| A line comes back | `state` becomes the outcome and `line` the line that came back |
| Nothing comes back | `onContinue` is called once. The state stays `ask` |
| `guess` called again, with either outcome | Nothing. `onReveal` is not called a second time |
| The component is mounted again with the same card | `ask` again |

After the guess the rows are gone and the guess cannot be changed. The row the taker picked is not marked, not coloured and not repeated, on a hit or on a miss. Hit and miss differ by their words and by nothing else: no state uses the words or the colours of an error or a success.

### Description of the bar

The bar is one image in every state. The card writes its description and passes it as `description`.

| State | Description |
|---|---|
| Ask | Names both poles and says the reading is hidden. No value, and nothing a value could be worked out from |
| Hit and miss | Names both poles and says which one the taker is closer to. No number |

### Card - invalid and edge input

Nothing here throws. A card that cannot be built leaves through the frame: `SurveyCheckpoint` draws nothing and calls `onContinue` once when it gets no visual or a blank statement.

| Input | Behaviour |
|---|---|
| A pole whose name is missing or only space | No visual is passed. The frame leaves. An option without a name cannot be guessed |
| `getCheckpointText` gives nothing for the ask line | A blank statement is passed. The frame leaves |
| `getCheckpointText` gives nothing for the reveal line | The same |
| A pole without an image | Its cap and its row show the colour alone |
| A pole without a colour | The neutral fallback, on the cap, the fill and the row |
| A pole name longer than the room under the bar | Truncated there by the bar; complete in the row and in the description |
| A pool line without the name slot | Shown as written |
| A line longer than the card | It wraps, in the frame |

### Accessibility

- The rows are buttons in a group named by the statement. Each is named by its pole; the image adds nothing to the name.
- Keyboard: the rows are reached in their order, before the frame's buttons, and each is activated with Enter or Space. Each shows a visible focus state. No other key is bound.
- The pressable area of a row is at least the minimum touch target.
- When the card moves to hit or miss the frame moves the focus to the new text, as it does for every card that changes in place, so the new lead-in and statement are announced. "Dalej" is the next stop. Focus is never left on a row that is gone. The card does nothing for this beyond changing what it passes.
- The mask hides the reading from every way of reading the card: nothing in the markup, in a description or in a style carries a value while the state is ask.

# Copy

Polish is the source; every string goes through a Lingui macro and the English entry is filled in. Names are placed as written - never declined, never re-cased.

| Text | Polish (source) | English |
|---|---|---|
| Description of the bar, ask | „{start}” i „{end}”: wynik ukryty | “{start}” and “{end}”: the reading is hidden |
| Description of the bar, hit and miss | „{start}” i „{end}”: bliżej Ci do strony „{leading}” | “{start}” and “{end}”: you are closer to the “{leading}” side |

The lead-ins and the statements are the pools `axis-puzzle-ask`, `axis-puzzle-hit` and `axis-puzzle-miss` of `survey-checkpoint-engine`. This task adds no line and changes none. The text in the Figma frames is not the text shown: two of the frames' lines use a gendered verb or bend an adjective to a name, and the pools hold the lines that replace them.

# Athena components to use

- `UniversalAxis` (the app's shared bar, not Athena) for the bar.
- No Athena component fits a row. It is a plain `button`, as `SurveyAnswer` is, drawn as the frame shows; use the focus outline of `src/constants/focus.ts`.
- Do **not** use `SurveyAnswer` for a row. It has a fixed icon per answer kind and no image, it delays its click behind an animation in the colours of agreeing and disagreeing, and a guess is neither.
- Do **not** use Athena `RadioGroup` or `ButtonSelect`. They hold a selection that stays and can be changed; here the first tap ends the choice and the rows disappear.
- Do **not** use Athena `Avatar` for the image of a row. When an image fails it draws a person icon; a row falls back to the colour alone.
- Do **not** use `DoubleAxisChart` for the uncovered bar. It is a `ModuleWrapper` with a title chip, numbers, the statistics and info buttons and a comparison; the card has none of them.
- Do **not** add a button. "Dalej" and "Wyłącz checkpointy" are the frame's; the rows are the card's only controls.

# Out of scope

- **When the card fires, for which axis, the lead and the gate, one card per axis** - `survey-checkpoint-engine` and `survey-running-state`. Nothing is added to either here.
- **The reveal lines: drawing one on the guess, keeping it with the card, giving the same one after a reload** - `survey-checkpoint-engine` (`drawRevealLine`) and `survey-checkpoint` (`onReveal`). The card only calls `onReveal`.
- **The frame, leaving "Dalej" out, moving the focus to the new text** - `survey-checkpoint`. The card passes `isContinueAvailable={false}` and changes its text.
- **The bar without numbers and with a description passed in** - `survey-checkpoint-axis-closeness`.
- **The puzzle about archetypes** - `survey-checkpoint-position-puzzle`. It reuses `SurveyCheckpointOptions`, `useCheckpointGuess` and the bar without numbers; do not build anything for it here beyond keeping the two free of this card's terms.
- **Restructuring `UniversalAxis`.** The file still holds `renderFill` and its siblings from before the one-component-per-file rule. Keep the diff to the mask, and do not add another `renderX()`: the hatched track is a subcomponent with its own test.
- **Keeping the guess** - nothing stores it; the result the API takes has no field for it.
- **A reveal a few questions later, a correction card, a puzzle for a single axis** - not built.
- **Analytics** - no event is raised here.

# Files to create

```
src/types/axis.ts                                    # existing: + isMasked in AxisLayoutInput and in AxisLayout
src/utils/axis/
├── getAxisLayout.ts                                 # existing: the masked layout
└── getAxisLayout.test.ts                            # + the cases below
src/components/shared/UniversalAxis/                 # existing
├── UniversalAxis.tsx                                # + the mask
├── UniversalAxis.test.tsx                           # + the cases below
├── UniversalAxis.stories.tsx                        # + the stories below
└── UniversalAxisMask/                               # the hatched track
    ├── UniversalAxisMask.tsx
    └── UniversalAxisMask.test.tsx
src/utils/checkpoint/
├── useCheckpointGuess.ts
└── useCheckpointGuess.test.ts
src/components/survey/SurveyCheckpointOptions/
├── SurveyCheckpointOptions.tsx                      # the group; lets the first activation through
├── SurveyCheckpointOptions.test.tsx
├── SurveyCheckpointOptions.types.ts
├── SurveyCheckpointOptions.stories.tsx
└── SurveyCheckpointOptionsRow/                      # one row: image on colour, name
    ├── SurveyCheckpointOptionsRow.tsx
    └── SurveyCheckpointOptionsRow.test.tsx
src/components/survey/SurveyCheckpointAxisPuzzle/
├── SurveyCheckpointAxisPuzzle.tsx
├── SurveyCheckpointAxisPuzzle.test.tsx
├── SurveyCheckpointAxisPuzzle.stories.tsx
└── utils/
    ├── getAxisPuzzleOutcome.ts                      # the picked orientation -> hit or miss
    ├── getAxisPuzzleOutcome.test.ts
    ├── useAxisPuzzleDescription.ts                  # the description of the bar for a state
    └── useAxisPuzzleDescription.test.tsx
src/components/survey/SurveyQuestionnaire/
└── SurveyQuestionnaire.constants.ts                 # existing: + "axis-puzzle": SurveyCheckpointAxisPuzzle
e2e/survey/
├── survey-axis-puzzle.fixture.ts                    # the quiz of the scenario below
└── questionnaire.spec.ts                            # existing: + one scenario
```

- Reuse `toSingleLine` from `src/utils/text/` and `getSafeColor` from `src/utils/color/`. Search `src/utils/` before writing a helper.
- No functions in a component file, no `renderX()`. Add local files only where the row or the group needs them, each with its own test.
- If the files of the earlier tasks ended up named differently from the tree above, follow what is in the repository and say so in the pull request.

# Unit test cases (BDD)

```ts
describe('getAxisLayout() - isMasked', () => {
  describe('given isMasked and two entries with values', () => {
    it('keeps the double-sided mode and both sides with their names, images and colours', ...);
    it('gives both sides no width and no shown value', ...);
    it('has no marker, also when one is configured', ...);
    it('has no comparison, also when one is passed', ...);
    it('is marked as masked', ...);
  });
  describe('given isMasked and the same entries without values', () => {
    it('returns the same layout', ...);
  });
  describe('given isMasked is false or absent', () => {
    it('returns the layout it returned before', ...);
  });
});

describe('<UniversalAxisMask />', () => {
  it('covers the whole track with the hatch', ...);
});

describe('<UniversalAxis /> - isMasked', () => {
  describe('given isMasked and two entries', () => {
    it('renders both caps and, with labels on, both names', ...);
    it('renders the mask over the track', ...);
    it('renders no fill, no number and no marker', ...);
    it('renders the same markup with values and without them', ...);
  });
  describe('given isMasked and a comparison', () => {
    it('renders no band and no image of the other party', ...);
  });
  describe('given isMasked and a description', () => {
    it('is one image named by that description', ...);
  });
  describe('given isMasked and no description', () => {
    it('is named by the names alone, with no number and nothing about a missing value', ...);
  });
  describe('given isMasked is false', () => {
    it('renders the bar as before', ...);
  });
});

describe('<SurveyCheckpointOptionsRow />', () => {
  describe('given an orientation with an image, a colour and a name', () => {
    it('is a button named by the name alone', ...);
    it('shows the image on the colour', ...);
  });
  describe('given no image', () => {
    it('shows the colour alone', ...);
  });
  describe('given an image that fails to load', () => {
    it('shows what a row without an image shows', ...);
  });
  describe('given no colour, or a value that is not a colour', () => {
    it('shows the neutral fallback', ...);
  });
  describe('given a name with line breaks or doubled spaces', () => {
    it('shows it on one line of text', ...);
  });
  describe('given a long name', () => {
    it('does not truncate it', ...);
  });
  describe('when activated with a click, Enter or Space', () => {
    it('calls onSelect', ...);
  });
});

describe('<SurveyCheckpointOptions />', () => {
  describe('given two options', () => {
    it('renders a group named by the label', ...);
    it('renders one button per option, in the order given', ...);
  });
  describe('given three options', () => {
    it('renders three buttons in the order given', ...);
  });
  describe('given no options', () => {
    it('renders nothing', ...);
  });
  describe('when a row is activated', () => {
    it('calls onSelect once with the orientation of that row', ...);
  });
  describe('when a row is activated after one already was', () => {
    it('calls nothing', ...);
  });
  it('marks no row as chosen, correct or wrong', ...);
});

describe('useCheckpointGuess()', () => {
  describe('before a guess', () => {
    it('is in ask with the line of the card', ...);
  });
  describe('when a hit is guessed and a line comes back', () => {
    it('calls onReveal once with "hit"', ...);
    it('is in hit with the line that came back', ...);
  });
  describe('when a miss is guessed and a line comes back', () => {
    it('calls onReveal once with "miss"', ...);
    it('is in miss with the line that came back', ...);
  });
  describe('when nothing comes back', () => {
    it('calls onContinue once and stays in ask', ...);
  });
  describe('when a second guess is made', () => {
    it('does not call onReveal again and keeps the first outcome', ...);
  });
  describe('when mounted again with the same card', () => {
    it('is in ask again', ...);
  });
});

describe('getAxisPuzzleOutcome()', () => {
  it('is a hit for the start pole when the start side leads', ...);
  it('is a hit for the end pole when the end side leads', ...);
  it('is a miss for the other pole', ...);
});

describe('useAxisPuzzleDescription()', () => {
  describe('given the ask state', () => {
    it('names both poles and says the reading is hidden', ...);
    it('carries no number and does not name the leading pole apart', ...);
  });
  describe('given the hit or the miss state', () => {
    it('names both poles and says which one the taker is closer to', ...);
    it('carries no number', ...);
  });
  it('collapses line breaks and doubled spaces in a name', ...);
});

describe('<SurveyCheckpointAxisPuzzle />', () => {
  describe('given a card, before a guess', () => {
    it('renders one checkpoint frame with the masked bar and the ask line', ...);
    it('shows both pole names under the bar', ...);
    it('offers two options: the start pole first, the end pole second', ...);
    it('names the group of options by the statement', ...);
    it('does not render "Dalej"', ...);
    it('renders "Wyłącz checkpointy"', ...);
    it('has no number, no fill and no marker anywhere in the document', ...);
    it('describes the bar as hidden', ...);
    it('reaches the options before "Wyłącz checkpointy" with the Tab key', ...);
  });
  describe('when the leading pole is picked', () => {
    it('calls onReveal once with "hit"', ...);
    it('shows the hit line with the name of the leading pole', ...);
    it('uncovers the bar: two fills, the marker, both names, no number', ...);
    it('describes the bar by the pole the taker is closer to', ...);
    it('removes the options', ...);
    it('renders "Dalej"', ...);
    it('has the focus on the text of the card', ...);
  });
  describe('when the other pole is picked', () => {
    it('calls onReveal once with "miss"', ...);
    it('shows the miss line', ...);
    it('uncovers the bar exactly as on a hit', ...);
    it('does not mark or repeat the picked option', ...);
    it('renders "Dalej"', ...);
  });
  describe('given a card whose start side leads', () => {
    it('is a hit when the first option is picked', ...);
  });
  describe('when an option is picked twice in a row', () => {
    it('calls onReveal once', ...);
  });
  describe('when onReveal gives no line', () => {
    it('calls onContinue once', ...);
  });
  describe('when "Wyłącz checkpointy" is activated before a guess', () => {
    it('calls onOptOut once and never calls onReveal', ...);
  });
  describe('when "Dalej" is activated after the reveal', () => {
    it('calls onContinue once', ...);
  });
  describe('when the card is mounted again', () => {
    it('asks again, with the same poles', ...);
  });
  describe('given values that do not reach 100 together', () => {
    it('leaves the gap in the middle of the uncovered bar', ...);
  });
  describe('given a pole without an image or without a colour', () => {
    it('shows the colour alone, or the neutral fallback, on the cap and on the option', ...);
  });
  describe('given a pole without a name', () => {
    it('renders nothing and calls onContinue once', ...);
  });
  describe('given a line that does not exist in the pools', () => {
    it('renders nothing and calls onContinue once', ...);
  });
});

describe('CHECKPOINT_CARDS', () => {
  it('maps "axis-puzzle" to SurveyCheckpointAxisPuzzle', ...);
});
```

Find elements by role and accessible name. Build a card by hand, with entries from `createAxisPair`, and render it with `renderWithI18n`. In the card's tests `onReveal` is a mock that returns a line of the hit or the miss pool by its index. The existing tests of `UniversalAxis` and `getAxisLayout`, and the ones `survey-checkpoint-axis-closeness` added, pass unchanged.

# e2e

The card is reachable on the route once it is registered, in a quiz that sends two-sided axes. It is the one card that takes "Dalej" away, so a taker who could not guess would be stuck: it earns one scenario. Add it to `e2e/survey/questionnaire.spec.ts`, on a quiz mocked for it through Playwright routes - never the live API.

The fixture, `e2e/survey/survey-axis-puzzle.fixture.ts`, in the shape the API sends:

- sixteen questions in one category, four agreement answers each;
- four orientations, none of type identity; no compass axes;
- two axes of type `axis`: the first with its own two orientations; the second with "Interwencjonizm" on its negative side and "Wolny rynek" on its positive side;
- in every question "Zdecydowanie za" has weight 2 and "Częściowo za" weight 1, both for the positive side of the question's axis; "Częściowo przeciw" has weight 1 and "Zdecydowanie przeciw" weight 2, both for its negative side;
- questions 1 to 5 and 12 to 16 belong to the first axis, questions 6 to 11 to the second.

Why this quiz: after five answers only the first axis has five answered questions behind it, and the axis closeness card - registered before this one, and ahead of it in priority - takes that axis. The next card can come no sooner than six questions later. At the boundary after the eleventh question only the second axis is left, and a puzzle beats a second closeness card, because its type was not seen yet. So the puzzle is about the second axis, and "Wolny rynek" leads.

```gherkin
Scenario: A taker guesses an axis and sees the reading
  Given a user opened the sixteen-question quiz with two axes
  When they answer the first five questions "Zdecydowanie za"
  Then a region named "Checkpoint" is shown
  When they press "Dalej"
  And they answer the next six questions "Zdecydowanie za"
  Then a region named "Checkpoint" is shown with the buttons "Interwencjonizm" and "Wolny rynek"
  And it has no "Dalej" button
  When they press "Wolny rynek"
  Then the two buttons are gone
  And the text of the card names "Wolny rynek"
  When they press "Dalej"
  Then they see the twelfth question
```

The lines are drawn with the session's seed: match the text on the name, not on a whole sentence. A miss, a second tap and the opt-out stay in unit tests.

# Storybook stories

`SurveyCheckpointAxisPuzzle` - each story passes a card built in the story file, `fn()` for the callbacks, and an `onReveal` that returns a fixed line.

**Figma, in the order of the frames**
- `Ask`
- `Hit` - a `play` function picks the leading pole
- `Miss` - a `play` function picks the other pole

**Edge**
- `LongNames` - in the rows, under the bar and in the statement
- `NoImages`, `NoColours`
- `ValuesShortOfHundred` - revealed, with the gap in the middle
- `ValuesOverHundred` - revealed

`SurveyCheckpointOptions`
- `TwoOptions`, `ThreeOptions`
- `LongNames`, `NoImages`, `NoColours`, `BrokenImage`

`UniversalAxis.stories.tsx` - added: `Masked`, `MaskedWithLabels`. The existing stories are not changed.

Stories show the component alone, with no decorator, background or fixed width; check them at 320, 360 and 800 px.

# Remember about standards

- Use the standard colors palette, never add colors directly (check https://tailwindcss.com/docs/colors and our color palette in the `src/index.css` file and in [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css))
- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Create a Storybook story for the component with all possible props variants of the component
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)
- Name the branch `feature/survey-checkpoint-axis-puzzle-113`, following [Conventional Branch](https://conventional-branch.github.io/) - never keep a generated or default branch name
- Read `AGENTS.md` in the repository before starting; where it differs from this task on a standard, it wins
- The mask is one bar with a switch, not a second bar. Its default is today's behaviour, and every result module stays as it is
- `SurveyCheckpointOptions` and `useCheckpointGuess` are written in general terms - orientations, outcomes - with nothing of this card in their names or bodies: the next puzzle uses both
- The guess is kept in the component only. Nothing from this card is stored, sent or logged
- No animation library. A transition on the reveal is CSS and has a reduced-motion path
- Layout that depends on width is CSS. Do not measure an element in JavaScript
- Copy is Polish by default, accessible descriptions included. Run `yarn i18n:extract`, translate every new English entry, commit both catalogs
- Commit only files that belong to the task; commits follow Conventional Commits
- The PR follows the repository's pull request template, with screenshots of the stories next to the Figma frames

# Dependencies

- `survey-checkpoint` (#107) - the frame with `options` and `isContinueAvailable`, `CheckpointCardProps` with `onReveal`, `CHECKPOINT_CARDS`.
- `survey-checkpoint-engine` (#106) - `AxisPuzzleCheckpointCard`, `getCheckpointText`, the three pools, and the trigger that makes the card appear.
- `survey-checkpoint-axis-closeness` (#109) - `showValues` and `description` on `UniversalAxis`. The e2e scenario also relies on its card being registered.

It blocks `survey-checkpoint-position-puzzle` (#114), which is written against `SurveyCheckpointOptionsProps`, `useCheckpointGuess` and the bar without numbers: do not rename them without updating that task.

# Resources

- [Spec - Single axis puzzle](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/single-axis-puzzle.md) - the card, the options, the three states, the guess, the reveal
- [Spec - Universal axis](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/universal-axis.md) - the bar, and the masked state as the one exception to "hatching is for comparison"
- [Spec - Checkpoints](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/checkpoints.md) - the frame the card fills, and a card that waits for a choice
- [Spec - Random copy](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/checkpoints-random-copy.md) - the three pools
- [Spec - Axis closeness](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/axis-closeness.md) - the passive card about the same axes
- [Docs - Single axis puzzle](https://github.com/gi-org-pl/product/blob/main/mypolitics/docs/modules/quiz/questionnaire/checkpoints/single-axis-puzzle.md) - the idea
- Figma - the card: [ask](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5515-67799) | [hit](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5516-67925) | [miss](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5516-68299)
- [Figma - the universal axis](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5514-39733)
- [Figma - the Checkpoints phase screen](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5582-98011)
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Storybook docs](https://storybook.js.org/docs/writing-stories)
- [Tailwind docs](https://tailwindcss.com/docs/)
- [Vitest docs](https://vitest.dev/guide/)

# Definition of Done

- [ ] Code follows folder structure (`docs/frontend/conventions/PROJECT_STRUCTURE.md`)
- [ ] Naming follows `docs/frontend/conventions/NAMING.md`
- [ ] Components sit directly in `src/components/survey/` and `src/components/shared/` - no extra folder layer
- [ ] Component layout follows `docs/frontend/conventions/COMPONENT_STRUCTURE.md`: one component per file, helpers and hooks in `utils/`, each with its own test
- [ ] `UniversalAxis` takes `isMasked` (through `AxisLayoutInput`): the whole track is hatched, with the caps and labels kept and no fill, number, marker or comparison; the markup is the same with values and without
- [ ] A masked bar's description carries no value: the one passed in, or the names alone
- [ ] Without `isMasked` the bar draws and describes itself exactly as before; the existing tests and stories of `UniversalAxis` and `getAxisLayout` pass unchanged
- [ ] `SurveyCheckpointOptions` is a group named by its label, with one button per orientation in the order given: image on colour, then the name; the colour alone, the neutral fallback and a failed image degrade as in the table; a long name wraps
- [ ] `SurveyCheckpointOptions` lets the first activation through and no other, and has no look for chosen, correct or wrong
- [ ] `useCheckpointGuess` is in `src/utils/checkpoint/`: ask, then hit or miss with the line `onReveal` gave; `onContinue` when no line came; one guess only; ask again after a remount
- [ ] `SurveyCheckpointAxisPuzzle` renders exactly one `SurveyCheckpoint`, passes `onContinue` and `onOptOut` unchanged and reads nothing but its props
- [ ] Ask: the masked bar with both names, the ask line, the two poles as options in the order of the bar, no "Dalej", "Wyłącz checkpointy" present
- [ ] Hit and miss: the same uncovered bar - two fills, the marker, both names, no number - with the hit or the miss line, no options, and "Dalej"
- [ ] Hit or miss is decided against `card.leadingSide`; the picked option is never marked or repeated; no state uses the words or colours of an error or a success
- [ ] The bar is one image whose description says "hidden" while asking and names the closer pole after the guess, with no number in either
- [ ] Nothing in the document carries a value while the card asks
- [ ] After the guess the focus is on the new text and "Dalej" is the next stop; the options are reached before the frame's buttons and work with Enter and Space; each meets the minimum touch target and shows a visible focus state
- [ ] Opting out before a guess reveals nothing and never calls `onReveal`
- [ ] A pole without a name and a missing line each make the card leave without the taker seeing anything
- [ ] The guess is not stored, sent or logged
- [ ] `CHECKPOINT_CARDS` has the entry `"axis-puzzle": SurveyCheckpointAxisPuzzle`
- [ ] No `SurveyAnswer`, no Athena `RadioGroup`, `ButtonSelect` or `Avatar` in a row; no `DoubleAxisChart` on the card
- [ ] Nothing imported from another component's `utils/`, constants or subcomponents
- [ ] Components fill their parent's width; stories checked at 320 / 360 / 800 px with no horizontal scroll and no cut name in a row
- [ ] Unit tests added, BDD style, coverage ≥95% on all new and changed files; every subcomponent, util and hook has its own test file; elements found by role and name
- [ ] Storybook stories added for `SurveyCheckpointAxisPuzzle`, `SurveyCheckpointOptions` and the masked `UniversalAxis`, all listed above, showing the component alone
- [ ] `e2e/survey/questionnaire.spec.ts` has the guess scenario, on the mocked quiz with two axes; no test reaches a live address
- [ ] Both descriptions go through a Lingui macro, with Polish as the source; `yarn i18n:extract` run, English entries translated, `.po` files committed
- [ ] The reveal has no transition under reduced motion; no animation library added
- [ ] Biome lint clean
- [ ] TypeScript clean (no `any`, no `@ts-ignore`)
- [ ] Branch named `feature/survey-checkpoint-axis-puzzle-113`
- [ ] CI green: build, lint, test, e2e
- [ ] PR description lists decisions and deviations from the ticket/spec; only files belonging to the task are committed
