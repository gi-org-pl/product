<img alt="Double axis puzzle: ask" src="https://raw.githubusercontent.com/gi-org-pl/product/main/mypolitics/assets/double-axis-puzzle-checkpoint-1.png" /> <img alt="Double axis puzzle: hit" src="https://raw.githubusercontent.com/gi-org-pl/product/main/mypolitics/assets/double-axis-puzzle-checkpoint-2.png" /> <img alt="Double axis puzzle: miss" src="https://raw.githubusercontent.com/gi-org-pl/product/main/mypolitics/assets/double-axis-puzzle-checkpoint-3.png" />

# Story

As a user taking a quiz, I want a card between two questions to show me how close I am to one character without telling me which, and let me pick it out of three, so that I can test my guess about where I stand - and, if I miss, still find out only at the end.

# Component properties

**Component:** `SurveyCheckpointPositionPuzzle`
**Location:** `src/components/survey/SurveyCheckpointPositionPuzzle/`
**Shared:** no - domain component under `survey`

The card of the [double axis puzzle](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/double-axis-puzzle.md). The name of the spec is the doc's; the card is about archetypes - named positions - and its type in the engine is `position-puzzle`.

```ts
// src/components/survey/SurveyCheckpointPositionPuzzle/SurveyCheckpointPositionPuzzle.tsx
export const SurveyCheckpointPositionPuzzle = (props: CheckpointCardProps<"position-puzzle">) => ...
// props.card is a PositionPuzzleCheckpointCard: leader, closeness, options, line, boundary
```

```ts
// src/components/survey/SurveyQuestionnaire/SurveyQuestionnaire.constants.ts - one entry added
export const CHECKPOINT_CARDS: CheckpointCardRegistry = {
  // ...the entries already there
  "position-puzzle": SurveyCheckpointPositionPuzzle,
};
```

It follows the card contract of `survey-checkpoint`: exactly one `SurveyCheckpoint`, `onContinue` and `onOptOut` passed to it unchanged, no button of its own outside `options`, nothing read but its props.

**Nothing is added to the engine, and nothing shared is built here.** The three rows, their order and the draw of the two distractors come ready in the card (`survey-checkpoint-engine`). The option rows and the three states of a guess were built by `survey-checkpoint-axis-puzzle` for both puzzles, and the bar without numbers by `survey-checkpoint-axis-closeness`. This task composes them.

### What this task uses from the tasks before it

No name of an earlier task is redefined here.

| From | Used |
|---|---|
| `PositionPuzzleCheckpointCard` (`survey-checkpoint-engine`) | `leader` (an `Orientation`), `closeness` (50 to 100), `options` (three orientations in display order, the leader among them), `line` |
| `getCheckpointText(i18n, card, line)` (`survey-checkpoint-engine`) | The lead-in and the statement of the ask line, and of the reveal line once there is one |
| `SurveyCheckpoint` (`survey-checkpoint`) | `visual`, `leadIn`, `statement`, `options`, `onContinue`, `onOptOut`. `isContinueAvailable` is not passed: "Dalej" is there in every state |
| `CheckpointCardProps` with `onReveal`, `CHECKPOINT_CARDS` (`survey-checkpoint`) | The props of a card and the registry |
| `SurveyCheckpointOptions` (`survey-checkpoint-axis-puzzle`) | The rows: `label`, `options`, `onSelect` |
| `useCheckpointGuess(card, onReveal, onContinue)` (`survey-checkpoint-axis-puzzle`) | `state` (`ask`, `hit` or `miss`), `line`, `guess` |
| `UniversalAxis` with `showValues` and `description` (`survey-checkpoint-axis-closeness`) | The bar without numbers, described by the card in words |
| `MATCH_BAND_COLORS`, `PARTIAL_MATCH_FROM` in `src/constants/results.ts`, `getMatchBand` in `src/utils/results/` (in the app) | The colour of the uncovered bar, and the floor of 50 |

### Where each part of the spec lands

| Part of the spec | Built in | Tested by |
|---|---|---|
| Which orientations are archetypes and which are eligible; closeness; the ranking and its tie rule; the masculine form of a name and an image | `survey-running-state` (`archetypes`) | `getRunningArchetypes()` |
| When it may fire: half the questions done, a separation of 5, a closeness of 50, three archetypes, once per run whatever the taker does on it | `survey-checkpoint-engine` | `getPositionPuzzleCandidate()`, `getNextCheckpoint()` |
| The three options: where distractors come from, same-name archetypes, the seeded pick and the seeded order, the same rows after a reload, a draw that other cards do not shift | `survey-checkpoint-engine` | `getPositionPuzzleOptions()` |
| The three pools, the name slot of the hit pool, the reveal line drawn on the guess and kept for a reload | `survey-checkpoint-engine` | `CHECKPOINT_POOLS`, `drawRevealLine()`, `getCheckpointText()` |
| The frame, the focus moving to the new text, the two buttons | `survey-checkpoint` | `<SurveyCheckpoint />` |
| A row, the group, "the first tap is the guess", the move from ask to hit or miss | `survey-checkpoint-axis-puzzle` | `<SurveyCheckpointOptions />`, `useCheckpointGuess()` |
| The bar without numbers and a description passed in | `survey-checkpoint-axis-closeness` | `<UniversalAxis />` |
| **The visual in its three states, what a miss withholds, the descriptions, the registration, the card on the route** | **This task** | The cases below |

# Behaviour

The [double axis puzzle spec](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/double-axis-puzzle.md) is the source of truth for every case below; the [archetype spec](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/archetype.md) for the row a hit uncovers and its band colour. The Figma frames - [ask](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5516-68069), [hit](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5516-68119), [miss](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5516-68344) - are the source of truth for sizes, spacing, type and colours: follow the frames.

### The three states

| State | When | `visual` | Text | `options` | "Dalej" |
|---|---|---|---|---|---|
| Ask | The card was just shown | A blank placeholder where the name will be; under it the bar, masked | The card's own line: `getCheckpointText(i18n, card)` | Three rows | Offered |
| Hit | The taker picked the leader | The leader's name; under it the bar, uncovered | The hit line, which names the leader | None | Offered |
| Miss | The taker picked another row | Unchanged from ask | The miss line, which names nobody | None | Offered |

"Wyłącz checkpointy" is the frame's and is there in all three.

The card starts in ask and moves at most once. "Dalej" in ask continues without a guess: the frame's `onContinue`, nothing is revealed, `onReveal` is not called. The state lives in the card for as long as it is on screen, and nowhere else. Put up again after a reload, the card starts in ask with the same leader, the same bar and the same three rows, and the earlier guess is gone.

### The visual

A name or its placeholder, and under it one `UniversalAxis`: one-sided, `marker={false}`, no labels, `showValues={false}`, the description below.

| Case | Ask and miss | Hit |
|---|---|---|
| Over the bar | A blank shape of the name's height. Decoration: not announced | The leader's name, as text |
| The bar's length | `card.closeness` | The same. It was true while it was masked |
| The bar's colour | The neutral colour of the ask frame. Not the leader's colour, not the colour of its band | The colour of the band the closeness falls into: `MATCH_BAND_COLORS[getMatchBand(card.closeness)]` - match from 80, partial match from 50. Never the leader's own colour |
| The cap | The neutral colour alone | The leader's image |
| Number, marker | Not drawn | Not drawn |
| The orientation given to the bar | A blank one that carries only the neutral colour: no name, no image, and not the leader's identifier | The leader, with the band's colour in place of its own |

| Case | Behaviour |
|---|---|
| The mask lifts on a hit | In place, on the same card. Any transition on it is CSS only and has a reduced-motion path that removes it: the name and the image then replace the mask at once |
| A name longer than the room over the bar | It wraps onto further lines. It is never cut |
| A closeness above 100 | Clamped by the bar |
| The neutral colour | A literal of the palette token the ask frame uses, with the token named beside it, the way `MATCH_BAND_COLORS` is written: the bar's colour check accepts no CSS variable |

**Do not pass `isMasked` to the bar.** That state, built for the single axis puzzle, hides the fill. Here the fill is the one thing shown: the bar is true in every state, and only the name, the image and the colour are held back.

### The options

`SurveyCheckpointOptions` with `label` = the statement of the ask line, and `card.options` in the order given - the engine already shuffled them. The card never reorders, filters or adds a row.

| Case | Behaviour |
|---|---|
| A row | The archetype's image, then its name |
| The colour of a row | None: each orientation is passed without its colour, so the image sits on the neutral fallback and a row without an image is the neutral placeholder. The card shows no archetype's own colour anywhere |
| An image that does not load | The neutral placeholder, as the row does by itself |
| A name longer than its row | It wraps, as the row does by itself |

### The guess

| Case | Behaviour |
|---|---|
| The taker picks the row of `card.leader` | `guess("hit")` |
| The taker picks either other row | `guess("miss")` |
| A second tap while the card is changing | Nothing: the rows and `useCheckpointGuess` both let one through |
| `onReveal` gives no line | `useCheckpointGuess` calls `onContinue` |
| After the guess | The rows are gone and the guess cannot be changed |

Hit or miss is decided against `card.leader`, as read when the card fired. The row the taker picked is not marked and not repeated.

### What a miss withholds

A miss reveals nothing, on purpose: the closest archetype is the headline of the result.

| Case | Behaviour |
|---|---|
| The leader's name | Nowhere on the card after a miss: not over the bar, not in the text, not in a description |
| The leader's image | Not drawn, and not present in the document |
| The band colour | Not shown. The bar stays neutral |
| The description of the bar | The masked one |
| The orientation given to the bar | Still the blank one |

While the card asks, the leader is one of three rows like the other two, and nothing marks it.

### Description of the bar

The bar is one image in every state. The card writes its description and passes it as `description`.

| State | Description |
|---|---|
| Ask and miss | Says a hidden archetype is close to the taker. No name, no number |
| Hit | Names the leader. No number |

### Invalid and edge input

Nothing here throws. A card that cannot be built leaves through the frame: `SurveyCheckpoint` draws nothing and calls `onContinue` once when it gets no visual or a blank statement.

| Input | Behaviour |
|---|---|
| `card.options` does not hold exactly three rows, or the leader is not one of them | No visual is passed. The frame leaves. The card has no form with two rows or with four |
| A row, the leader included, whose name is missing or only space | No visual is passed. The frame leaves |
| `card.closeness` is not a number, or is under `PARTIAL_MATCH_FROM` | No visual is passed. The frame leaves. Under 50 the card does not exist |
| `getCheckpointText` gives nothing, for the ask line or for the reveal line | A blank statement is passed. The frame leaves |
| An archetype without an image | Its row shows the neutral placeholder. On a hit its cap shows the bar's colour alone, as the bar draws every cap without an image |
| The leader's image does not load on the cap | The bar falls back as it does today. The card stays usable |
| A pool line without the name slot | Shown as written |
| A line longer than the card | It wraps, in the frame |

### Accessibility

- The three rows are buttons in a group named by the statement, each named by its archetype - all of it from `SurveyCheckpointOptions`.
- Keyboard: the rows in their order, then "Dalej", then "Wyłącz checkpointy"; each is activated with Enter or Space. No other key is bound.
- The placeholder is hidden from assistive technology.
- On a hit the name over the bar is text, read before the bar.
- When the card moves to hit or miss the frame moves the focus to the new text. "Dalej" is the next stop. Focus is never left on a row that is gone. The card does nothing for this beyond changing what it passes.
- Hit and miss differ by their words, never by colour alone.

# Copy

Polish is the source; every string goes through a Lingui macro and the English entry is filled in. The name is placed as written - never declined, never re-cased.

| Text | Polish (source) | English |
|---|---|---|
| Description of the bar, ask and miss | Ukryta postać jest blisko Ciebie | A hidden character is close to you |
| Description of the bar, hit | {name} jest blisko Ciebie | {name} is close to you |

The lead-ins and the statements are the pools `position-puzzle-ask`, `position-puzzle-hit` and `position-puzzle-miss` of `survey-checkpoint-engine`. This task adds no line and changes none.

# Athena components to use

- `UniversalAxis` (the app's shared bar, not Athena) for the bar, and `SurveyCheckpointOptions` for the rows.
- Do **not** use `RankedRow` for the uncovered row, although the spec calls it "the ranked row". It lives in the `results` domain, always draws the number, truncates the name where this card wraps it, and has no place for the placeholder. The card draws the name and the bar itself, which is all a ranked row is.
- Do **not** use `Archetype`, and do not reach into it for `ArchetypeLeader` or `toRankedEntry`: the first is a `ModuleWrapper` with a description and a ranking, the other two are private to it. The band colour comes from `MATCH_BAND_COLORS` and `getMatchBand`, which are global.
- Do **not** use `SurveyAnswer` for a row or build a second row component.
- Do **not** add a button. "Dalej" and "Wyłącz checkpointy" are the frame's.

# Out of scope

- **When the card fires, the separation, the floor of 50, the midpoint, "once per run"** - `survey-checkpoint-engine`. Nothing is added to it here.
- **Choosing and ordering the three rows** - `survey-checkpoint-engine` (`getPositionPuzzleOptions`). The card shows `card.options` as given.
- **The option rows and the guess** - `survey-checkpoint-axis-puzzle`. If a case of this card needs a change in `SurveyCheckpointOptions` or `useCheckpointGuess`, make it there in general terms, with its test, and say so in the pull request.
- **The bar** - no change to `UniversalAxis` in this task.
- **The archetype's description and the ranking of the others** - the result's `Archetype` module. The card shows neither.
- **Which orientations are archetypes, and the feminine form of a name** - `survey-running-state` already passes each archetype through `toDisplayOrientation` with no gender.
- **Keeping the guess** - nothing stores it; the result the API takes has no field for it.
- **A reveal a few questions later** - not built. A hit is revealed on the card and a miss is never revealed.
- **Analytics** - no event is raised here.

# Files to create

```
src/components/survey/SurveyCheckpointPositionPuzzle/
├── SurveyCheckpointPositionPuzzle.tsx
├── SurveyCheckpointPositionPuzzle.test.tsx
├── SurveyCheckpointPositionPuzzle.constants.ts      # the neutral colour of the masked bar
├── SurveyCheckpointPositionPuzzle.stories.tsx
├── SurveyCheckpointPositionPuzzleVisual/            # the name or its placeholder, and the bar
│   ├── SurveyCheckpointPositionPuzzleVisual.tsx
│   └── SurveyCheckpointPositionPuzzleVisual.test.tsx
└── utils/
    ├── canDrawPositionPuzzle.ts                     # three named rows with the leader among them, a closeness of 50 or more
    ├── canDrawPositionPuzzle.test.ts
    ├── getPositionPuzzleEntry.ts                    # the entry of the bar for a state: blank and neutral, or the leader in its band's colour
    ├── getPositionPuzzleEntry.test.ts
    ├── getPositionPuzzleRows.ts                     # card.options without their colours
    ├── getPositionPuzzleRows.test.ts
    ├── getPositionPuzzleOutcome.ts                  # the picked orientation -> hit or miss
    ├── getPositionPuzzleOutcome.test.ts
    ├── usePositionPuzzleDescription.ts              # the description of the bar for a state
    └── usePositionPuzzleDescription.test.tsx
src/components/survey/SurveyQuestionnaire/
└── SurveyQuestionnaire.constants.ts                 # existing: + "position-puzzle": SurveyCheckpointPositionPuzzle
e2e/survey/
├── survey-archetypes.fixture.ts                     # the quiz of the scenario below
└── questionnaire.spec.ts                            # existing: + one scenario
```

- Reuse `toSingleLine` from `src/utils/text/`, `isNumber` from `src/utils/number/`, `getMatchBand` from `src/utils/results/`. Search `src/utils/` before writing a helper. `getPositionPuzzleOptions` is the engine's name for the draw; do not reuse it for a local file.
- No functions in a component file, no `renderX()`.
- If the files of the earlier tasks ended up named differently from the tree above, follow what is in the repository and say so in the pull request.

# Unit test cases (BDD)

```ts
describe('canDrawPositionPuzzle()', () => {
  it('is true for three named options that include the leader and a closeness of 50 or more', ...);
  it('is true at a closeness of exactly 50', ...);
  it('is false for two options and for four', ...);
  it('is false when the leader is not among the options', ...);
  it('is false when an option has no name or a name of only space', ...);
  it('is false for a closeness under 50 or one that is not a number', ...);
});

describe('getPositionPuzzleEntry()', () => {
  describe('given the ask or the miss state', () => {
    it('returns the closeness of the card as the value', ...);
    it('returns an orientation with the neutral colour and no name, no image and not the leader\'s identifier', ...);
  });
  describe('given the hit state', () => {
    it('returns the same value', ...);
    it('returns the leader with its name and image', ...);
    it('gives it the match colour at 80 and above', ...);
    it('gives it the partial match colour from 50 up to 80', ...);
    it('never keeps the leader\'s own colour', ...);
  });
});

describe('getPositionPuzzleRows()', () => {
  it('returns the options of the card in their order', ...);
  it('removes the colour of each and keeps its name and image', ...);
  it('does not change the card it was given', ...);
});

describe('getPositionPuzzleOutcome()', () => {
  it('is a hit for the leader', ...);
  it('is a miss for either other option', ...);
});

describe('usePositionPuzzleDescription()', () => {
  describe('given the ask or the miss state', () => {
    it('says a hidden character is close, with no name and no number', ...);
  });
  describe('given the hit state', () => {
    it('names the leader, with no number', ...);
  });
});

describe('<SurveyCheckpointPositionPuzzleVisual />', () => {
  describe('given no name', () => {
    it('renders the placeholder, hidden from assistive technology', ...);
  });
  describe('given a name', () => {
    it('renders the name as text and no placeholder', ...);
    it('does not truncate a long name', ...);
  });
  it('renders one one-sided bar with no marker and no number', ...);
  it('names the bar by the description it is given', ...);
});

describe('<SurveyCheckpointPositionPuzzle />', () => {
  describe('given a card, before a guess', () => {
    it('renders one checkpoint frame with the placeholder, the masked bar and the ask line', ...);
    it('fills the bar to the closeness of the card, with no number', ...);
    it('draws no image on the cap', ...);
    it('offers the three options in the order of the card', ...);
    it('names the group of options by the statement', ...);
    it('renders "Dalej" and "Wyłącz checkpointy"', ...);
    it('describes the bar as a hidden character', ...);
    it('reaches the options, then "Dalej", then "Wyłącz checkpointy" with the Tab key', ...);
  });
  describe('when the leader is picked', () => {
    it('calls onReveal once with "hit"', ...);
    it('shows the leader\'s name over the bar in place of the placeholder', ...);
    it('draws the leader\'s image on the cap', ...);
    it('keeps the length of the bar', ...);
    it('colours the bar by its band and not by the leader\'s own colour', ...);
    it('shows the hit line with the name of the leader', ...);
    it('describes the bar by the leader\'s name, with no number', ...);
    it('removes the options', ...);
    it('has the focus on the text of the card', ...);
  });
  describe('when another option is picked', () => {
    it('calls onReveal once with "miss"', ...);
    it('shows the miss line', ...);
    it('keeps the placeholder, the neutral bar and the cap without an image', ...);
    it('has the leader\'s name and image nowhere in the document', ...);
    it('still describes the bar as a hidden character', ...);
    it('removes the options and does not mark or repeat the picked one', ...);
  });
  describe('when "Dalej" is activated before a guess', () => {
    it('calls onContinue once and never calls onReveal', ...);
  });
  describe('when "Wyłącz checkpointy" is activated before a guess', () => {
    it('calls onOptOut once and never calls onReveal', ...);
  });
  describe('when an option is picked twice in a row', () => {
    it('calls onReveal once', ...);
  });
  describe('when onReveal gives no line', () => {
    it('calls onContinue once', ...);
  });
  describe('when the card is mounted again', () => {
    it('asks again, with the same bar and the same three options', ...);
  });
  describe('given a leader with a closeness of 80 or more', () => {
    it('uses the match colour on a hit', ...);
  });
  describe('given a leader with a closeness from 50 up to 80', () => {
    it('uses the partial match colour on a hit', ...);
  });
  describe('given archetypes without images', () => {
    it('shows the neutral placeholder in each row', ...);
    it('shows the bar\'s colour alone on the cap after a hit', ...);
  });
  describe('given options that have colours', () => {
    it('shows no archetype\'s own colour in a row', ...);
  });
  describe('given two options, four options, or a leader that is not among them', () => {
    it('renders nothing and calls onContinue once', ...);
  });
  describe('given a closeness under 50', () => {
    it('renders nothing and calls onContinue once', ...);
  });
  describe('given a line that does not exist in the pools', () => {
    it('renders nothing and calls onContinue once', ...);
  });
});

describe('CHECKPOINT_CARDS', () => {
  it('maps "position-puzzle" to SurveyCheckpointPositionPuzzle', ...);
});
```

Find elements by role and accessible name. Build a card by hand with orientations from `createOrientation`, and render it with `renderWithI18n`. In the card's tests `onReveal` is a mock that returns a line of the hit or the miss pool by its index. The tests of `SurveyCheckpointOptions`, `useCheckpointGuess` and `UniversalAxis` are not repeated here and pass unchanged.

# e2e

The card is reachable on the route once it is registered, in a quiz with at least three identity orientations. It is the one card on which a tap names a political identity, so it earns one scenario. Add it to `e2e/survey/questionnaire.spec.ts`, on a quiz mocked for it through Playwright routes - never the live API.

The fixture, `e2e/survey/survey-archetypes.fixture.ts`, in the shape the API sends:

- ten questions in one category, four agreement answers each;
- three orientations of type identity, none hidden, none with an image: "Zielony postępowiec", "Narodowy konserwatysta", "Suwerenny patriota";
- no axes at all;
- in every question "Zdecydowanie za" has weight 2 and "Częściowo za" weight 1, both for "Zielony postępowiec"; "Częściowo przeciw" has weight 1 for "Narodowy konserwatysta"; "Zdecydowanie przeciw" has weight 2 for "Suwerenny patriota".

Why this quiz: after five answers of "Zdecydowanie za" the first archetype stands at 100 and the other two at 0, and half the questions are done, so the puzzle is a candidate at that boundary. With no axes no other personal card can fire, and the halfway card, due at the same boundary, loses to it. With three archetypes the rows are exactly these three; their order follows the session's seed, so find them by name.

```gherkin
Scenario: A taker picks the closest character out of three
  Given a user opened the ten-question quiz with three archetypes
  When they answer the first five questions "Zdecydowanie za"
  Then a region named "Checkpoint" is shown with the buttons "Zielony postępowiec", "Narodowy konserwatysta" and "Suwerenny patriota"
  And it has a "Dalej" button
  When they press "Zielony postępowiec"
  Then the three buttons are gone
  And the card shows "Zielony postępowiec" over its bar and names it in its text
  When they press "Dalej"
  Then they see the sixth question
```

A miss, continuing without a guess and the opt-out stay in unit tests.

# Storybook stories

Each story passes a card built in the story file, `fn()` for the callbacks, and an `onReveal` that returns a fixed line.

**Figma, in the order of the frames**
- `Ask`
- `Hit` - a `play` function picks the leader
- `Miss` - a `play` function picks another row

**Edge**
- `HitPartialMatch` - a closeness between 50 and 80
- `HitMatch` - a closeness of 80 or more
- `FullBar` - a closeness of 100, asking
- `LongNames` - in the rows and, after a hit, over the bar
- `NoImages` - asking, and after a hit

Stories show the component alone, with no decorator, background or fixed width; check them at 320, 360 and 800 px.

# Remember about standards

- Use the standard colors palette, never add colors directly (check https://tailwindcss.com/docs/colors and our color palette in the `src/index.css` file and in [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css))
- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Create a Storybook story for the component with all possible props variants of the component
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)
- Name the branch `feature/survey-checkpoint-position-puzzle-{issue number}`, following [Conventional Branch](https://conventional-branch.github.io/) - never keep a generated or default branch name
- Read `AGENTS.md` in the repository before starting; where it differs from this task on a standard, it wins
- The guess is kept in the component only. Nothing from this card is stored, sent or logged: the rows and a hit name political identities
- Nothing is imported from another component's `utils/`, constants or subcomponents - `Archetype` and `RankedRow` included
- No animation library. A transition on the reveal is CSS and has a reduced-motion path
- Layout that depends on width is CSS. Do not measure an element in JavaScript
- Copy is Polish by default, accessible descriptions included. Run `yarn i18n:extract`, translate every new English entry, commit both catalogs
- Commit only files that belong to the task; commits follow Conventional Commits
- The PR follows the repository's pull request template, with screenshots of the stories next to the Figma frames

# Dependencies

- `survey-checkpoint` - the frame with `options`, `CheckpointCardProps` with `onReveal`, `CHECKPOINT_CARDS`.
- `survey-checkpoint-engine` - `PositionPuzzleCheckpointCard` with its three options, `getCheckpointText`, the three pools, and the trigger that makes the card appear.
- `survey-checkpoint-axis-puzzle` - `SurveyCheckpointOptions` and `useCheckpointGuess`, and through it `survey-checkpoint-axis-closeness` for `showValues` and `description` on `UniversalAxis`.

It blocks nothing. It is the last of the two puzzles to be built.

# Resources

- [Spec - Double axis puzzle](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/double-axis-puzzle.md) - the card, the three states, what a miss withholds
- [Spec - Archetype](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/archetype.md) - the leader, the band colour of its bar
- [Spec - Single axis puzzle](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/single-axis-puzzle.md) - the option row and the guess this card reuses
- [Spec - Universal axis](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/universal-axis.md) - the bar, and value labels switched off
- [Spec - Header](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/header.md) - the match bands
- [Spec - Checkpoints](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/checkpoints.md) - the frame the card fills
- [Spec - Random copy](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/checkpoints-random-copy.md) - the three pools
- [Docs - Double axis puzzle](https://github.com/gi-org-pl/product/blob/main/mypolitics/docs/modules/quiz/questionnaire/checkpoints/double-axis-puzzle.md) - the idea
- Figma - the card: [ask](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5516-68069) | [hit](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5516-68119) | [miss](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5516-68344)
- [Figma - the archetype module](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5513-28187) - the row a hit uncovers
- [Figma - the Checkpoints phase screen](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5582-98011)
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Storybook docs](https://storybook.js.org/docs/writing-stories)
- [Tailwind docs](https://tailwindcss.com/docs/)
- [Vitest docs](https://vitest.dev/guide/)

# Definition of Done

- [ ] Code follows folder structure (`docs/frontend/conventions/PROJECT_STRUCTURE.md`)
- [ ] Naming follows `docs/frontend/conventions/NAMING.md`
- [ ] The component sits directly in `src/components/survey/` - no extra folder layer
- [ ] Component layout follows `docs/frontend/conventions/COMPONENT_STRUCTURE.md`: one component per file, helpers and hooks in `utils/`, each with its own test
- [ ] `SurveyCheckpointPositionPuzzle` renders exactly one `SurveyCheckpoint`, passes `onContinue` and `onOptOut` unchanged and reads nothing but its props
- [ ] It composes `SurveyCheckpointOptions`, `useCheckpointGuess` and `UniversalAxis` as built; no second row component, no second guess hook, no change to the bar, nothing added to the engine
- [ ] Ask: the placeholder, the neutral bar filled to `card.closeness` with a neutral cap and no image, the ask line, the three rows of `card.options` in their order, "Dalej" and "Wyłącz checkpointy"
- [ ] Hit: the leader's name over the bar, its image on the cap, the bar in its band's colour and at the same length, the hit line, no rows
- [ ] Miss: the visual unchanged from ask, the miss line, no rows; the leader's name, image and band colour are nowhere on the card or in the document
- [ ] No number and no marker on the bar in any state; `isMasked` is not used
- [ ] No archetype's own colour is shown anywhere: not in a row, not on the bar
- [ ] Hit or miss is decided against `card.leader`; the picked row is never marked or repeated; one guess only
- [ ] "Dalej" before a guess continues without calling `onReveal`; opting out before a guess reveals nothing
- [ ] The bar is one image described as a hidden character while asking and after a miss, and by the leader's name after a hit, with no number
- [ ] After the guess the focus is on the new text and "Dalej" is the next stop; Tab order is rows, "Dalej", "Wyłącz checkpointy"
- [ ] A card without exactly three named rows that include the leader, with a closeness under 50, or with a missing line leaves without the taker seeing anything
- [ ] The guess is not stored, sent or logged
- [ ] `CHECKPOINT_CARDS` has the entry `"position-puzzle": SurveyCheckpointPositionPuzzle`
- [ ] No `RankedRow`, no `Archetype`, nothing imported from another component's `utils/`, constants or subcomponents
- [ ] The card fills its parent's width; stories checked at 320 / 360 / 800 px with no horizontal scroll and no cut name
- [ ] Unit tests added, BDD style, coverage ≥95% on all new and changed files; every subcomponent, util and hook has its own test file; elements found by role and name
- [ ] Storybook stories added, all listed above, showing the component alone
- [ ] `e2e/survey/questionnaire.spec.ts` has the scenario, on the mocked quiz with three archetypes; no test reaches a live address
- [ ] Both descriptions go through a Lingui macro, with Polish as the source; `yarn i18n:extract` run, English entries translated, `.po` files committed
- [ ] The reveal has no transition under reduced motion; no animation library added
- [ ] Biome lint clean
- [ ] TypeScript clean (no `any`, no `@ts-ignore`)
- [ ] Branch named `feature/survey-checkpoint-position-puzzle-{issue number}`
- [ ] CI green: build, lint, test, e2e
- [ ] PR description lists decisions and deviations from the ticket/spec; only files belonging to the task are committed
