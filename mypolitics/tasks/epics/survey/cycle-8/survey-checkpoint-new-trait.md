<img alt="Trait checkpoint" src="https://raw.githubusercontent.com/gi-org-pl/product/main/mypolitics/assets/trait-checkpoint.png" />

# Story

As a user taking a quiz, I want to be told the moment my answers have earned me a trait for good - by its name, on the same pill my result will show - so that the quiz hands me something of my own before the end.

# Component properties

This task builds two things:

1. **`SurveyCheckpointNewTrait`** - the new trait card.
2. **`TraitPill` as a component of its own** - today it is nested inside the `Traits` result module and written as a list item. It is moved out so that the card can draw one pill, without changing how a pill looks.

**The card cannot appear in any quiz today.** No quiz carries a list of its traits, so the running state never holds an unlocked trait and the engine's trigger never fires. This task builds the card, its stories and its tests, and registers it; "What switches the card on" below says what data is missing.

## 1. The card

**Component:** `SurveyCheckpointNewTrait`
**Location:** `src/components/survey/SurveyCheckpointNewTrait/`
**Shared:** no - domain component under `survey`

It renders exactly one `SurveyCheckpoint` (the frame of `survey-checkpoint`) and fills it: one trait pill in the visual, and the lead-in and the statement of the line the engine drew. The card is passive: it announces and takes no input.

```ts
// src/components/survey/SurveyCheckpointNewTrait/SurveyCheckpointNewTrait.tsx
export const SurveyCheckpointNewTrait = ({
  card,       // NewTraitCheckpointCard: { type: "new-trait", boundary, line, trait } - frozen when it fired
  onContinue, // passed to the frame unchanged
  onOptOut,   // passed to the frame unchanged
}: CheckpointCardProps<"new-trait">) => ...
```

The card has no props type of its own: `CheckpointCardProps<"new-trait">` is the whole contract. It does not use `onReveal` - it is not a puzzle.

**The registration** - one line in the registry of `survey-checkpoint`:

```ts
// src/components/survey/SurveyQuestionnaire/SurveyQuestionnaire.constants.ts
"new-trait": SurveyCheckpointNewTrait,
```

## 2. The pill

**Component:** `TraitPill`
**Moves from:** `src/components/results/Traits/TraitPill/`
**To:** `src/components/shared/TraitPill/` - shared, because two domains draw it now: `results` and `survey`

```ts
// src/components/shared/TraitPill/TraitPill.types.ts
import type { Orientation } from "@/types/orientation";

export type TraitHolder = "taker" | "both" | "other"; // moved here from Traits.types.ts

export interface TraitPillProps {
  orientation: Orientation;       // the trait: name, icon (imageUrl), colour
  holder?: TraitHolder;           // default "taker". Who holds the trait, in a comparison
  otherOrientation?: Orientation; // the other party of a comparison; its imageUrl is the avatar
}
```

Today the pill takes `item: TraitItem` - a type of `Traits` - and its root is a list item. Two changes, and no other:

| Today | After this task |
|---|---|
| `item: TraitItem` (`{ orientation, holder }`) | `orientation` and `holder` as two props. A shared component must not take its props from the types of one parent |
| The root is a list item | The root is not a list item. `Traits` wraps each pill in the item of its own list |

`TraitItem` stays in `Traits.types.ts`, with `holder` typed by the `TraitHolder` it now imports from the pill.

### What this task uses from the tasks before it

No name of an earlier task is redefined here, and nothing is added to the engine or to the running state.

| From | Used |
|---|---|
| `SurveyCheckpoint`, `SurveyCheckpointProps` (`survey-checkpoint`) | The frame: `visual`, `leadIn`, `statement`, `onContinue`, `onOptOut`. `quote`, `options` and `isContinueAvailable` are not passed |
| `CheckpointCardProps`, `CHECKPOINT_CARDS` (`survey-checkpoint`) | The props of the card and the place it is registered |
| `NewTraitCheckpointCard` (`survey-checkpoint-engine`) | `trait` (an `Orientation`), `line` |
| `getCheckpointText(i18n, card)` (`survey-checkpoint-engine`) | The lead-in and the statement of `card.line`, the trait's name filled in. Nothing when the name is missing |
| The pool `new-trait` (`survey-checkpoint-engine`) | Its three lines. Not edited here |
| `Traits`, `TraitPill` (in the app) | The pill, as built |

### Where each part of the spec lands

| Part of the spec | Built in | Tested by |
|---|---|---|
| When a trait is earned for good: every tied question answered, each with the answer that scores the trait highest; a skip or a lower answer loses it; hidden, nameless and untied traits never | `survey-running-state` (`unlockedTraits`) | `getUnlockedTraits()` |
| When it may fire: a standing trigger, once per trait, the first in the quiz's order first, the others waiting their turn | `survey-checkpoint-engine` | `getNewTraitCandidate()`, `rankCheckpointCandidates()`, `getNextCheckpoint()` |
| The lines and the name slot | `survey-checkpoint-engine` | `CHECKPOINT_POOLS`, `getCheckpointSlots()`, `getCheckpointText()` |
| The frame, the two buttons, wrapping of a long statement | `survey-checkpoint` | `<SurveyCheckpoint />` |
| **The pill on the card, the pill as a component of its own, the registration** | **This task** | The cases below |

### What switches the card on

Nothing in this task. Three things are missing, in this order, and none is built here:

| Missing | What it is | Where it would go |
|---|---|---|
| A list of traits in the quiz | A field of the survey response that lists the identifiers of the orientations the quiz uses as traits. The API has no orientation type for a trait and no such field; it is asked of the back-end as a field of the quiz. The `Traits` module of the result screen needs the same list | The survey API |
| The list in the quiz as read | `readSurvey` of `survey-api` reads the field into `Survey` | `src/services/api/utils/survey/` |
| The list in the running state | `getSessionCheckpoint` of `survey-checkpoint` calls `getRunningState(survey, session)` with no sources today. It has to pass the list as `sources.traitIds` - the input `survey-running-state` already takes | `src/utils/checkpoint/getSessionCheckpoint.ts` |

From then on `state.unlockedTraits` fills, the engine's trigger fires, and this card appears with no change to it.

# Behaviour

The [new trait spec](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/new-trait.md) is the source of truth for the card, and the [traits spec](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/traits.md) for the pill. The [Figma frame](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5515-67457) is the source of truth for sizes, spacing, type and colours: follow the frame.

### What the card puts into the frame

| Slot of the frame | Content |
|---|---|
| `visual` | One `TraitPill` with `orientation={card.trait}` and nothing else |
| `leadIn`, `statement` | The two texts of `getCheckpointText(i18n, card)` |
| `onContinue`, `onOptOut` | The card's own, unchanged |
| `quote`, `options`, `isContinueAvailable` | Not passed |

### Visual

| Case | Behaviour |
|---|---|
| Any trait | One pill in the middle of the visual slot: the trait's icon, then its name, on the trait's colour - the pill `Traits` draws for a trait only the taker earned |
| A trait without an icon | The name alone |
| A trait without a colour | The neutral fallback colour |
| A trait with a light colour | Dark text and a dark icon, as in `Traits` |
| The pill is pressed | Nothing happens |
| The card stays open | Nothing on it changes |

There is never a second pill, an avatar or hatching: the card passes neither `holder` nor `otherOrientation`. The card shows no number, no bar, no description of the trait and no verdict on it.

### Text

The first line of the pool. The frame writes "Zdobyłeś cechę", a masculine form; the taker's gender is not known during the questions, so the spec's wording stands.

| Slot | Text |
|---|---|
| Lead-in | "A to niespodzianka!" |
| Statement | "Masz nową cechę: „{trait}”... to dobrze, niedobrze?" |

| Case | Behaviour |
|---|---|
| Any of the three lines of the pool | Shown as drawn. The card never picks a line itself and never edits one |
| The trait's name, on the pill and in the statement | As the quiz wrote it: same case, never declined |
| A name that contains quotation marks | Shown as written, inside the statement's own marks |
| The app's language changes while the card is up | The same line in the other language |

### The pill as a component of its own

| Case | Behaviour |
|---|---|
| The pill in `Traits`, alone and in a comparison | Looks and reads exactly as before: the icon, the name, the colour, the light-colour rule, the hatching, the avatar, the words that say whose a trait is |
| The pills in `Traits` | Still a list, each item named by its trait. The item is now `Traits`' own element around the pill |
| The pill outside a list - on the card | A single item, not a list of one |
| `holder` not passed | The pill of a trait the taker holds: solid, no avatar |
| `otherOrientation` not passed | The pill of a trait the taker holds, whatever `holder` says - as today |

### Invalid and edge input

Nothing here throws. A card that cannot be drawn is never seen: the frame leaves by itself, calling `onContinue` once.

| Input | Behaviour |
|---|---|
| A trait without a name | `getCheckpointText` returns nothing, so a blank statement is passed and nothing as the visual. The frame draws nothing and leaves |
| `getCheckpointText` returns nothing for any other reason - a line that does not exist | The same |
| A name longer than the card | The pill is as wide as the visual slot at most and truncates the name to one line; the name stays complete for assistive technology. In the statement the name wraps and is never cut |
| A name with line breaks or doubled spaces | Collapsed to one line |

### Accessibility

- The pill is a single item, not a list of one, and its name is text.
- The icon is decorative.
- The label stays readable on any trait colour, by the light-colour rule the pill already has.
- The lead-in and the statement are read after the pill, as one sentence. The statement carries the trait's name, so nothing depends on seeing the pill.
- The pill is not interactive and not focusable.
- Focus, the announcement when the card appears and the two buttons are the frame's. The card adds no focusable element.

# Copy

This task adds no string. The lead-ins and the statements are the pool's, added by `survey-checkpoint-engine`; the words the pill says in a comparison move with it, unchanged.

# Athena components to use

- `TraitPill` (the app's own, shared after this task - not Athena) for the visual. It already uses Athena `Avatar` for the other party of a comparison.
- Do **not** use Athena `Badge`. It looks close, and it is not the pill: it has no trait colour from the quiz, no icon, no light-colour rule and no hatching, and the card must show the very pill the result will show.
- Do **not** use `Traits`. It is a `ModuleWrapper` with a title and two buttons around a list; the card borrows one pill, never the module.
- Do **not** add buttons. "Dalej" and "Wyłącz checkpointy" are the frame's.

# Out of scope

- **When a trait is earned and when the card fires** - `survey-running-state` and `survey-checkpoint-engine`. Nothing is added to either here.
- **The list of traits** - the three rows of "What switches the card on". No field is added to `Survey`, and `getSessionCheckpoint` is not changed.
- **The lines of the pool** - `survey-checkpoint-engine`.
- **The frame and the Checkpoints phase** - `survey-checkpoint`.
- **Any change to how a pill or the `Traits` module looks.** The move is a move.
- **Announcing a trait before it is complete, taking a card back, a description of the trait** - not supported.

# Files to create

```
src/components/shared/TraitPill/                     # moved from src/components/results/Traits/TraitPill/
├── TraitPill.tsx                                    # orientation and holder as props; the root is not a list item
├── TraitPill.test.tsx                               # moved, updated
├── TraitPill.types.ts                               # TraitPillProps, TraitHolder
├── TraitPill.stories.tsx                            # new: a shared component has stories
└── utils/                                           # moved with their tests, unchanged but for the import of TraitHolder
    ├── getPillHolder.ts
    ├── getPillHolder.test.ts
    ├── isLightColor.ts
    ├── isLightColor.test.ts
    ├── useTraitDescription.ts
    └── useTraitDescription.test.tsx
src/components/results/Traits/                       # existing
├── Traits.tsx                                       # imports the shared pill; its own list item around each
├── Traits.types.ts                                  # TraitHolder imported from the pill
├── Traits.test.tsx                                  # updated
└── utils/getTraitItems.ts                           # unchanged
src/components/survey/SurveyCheckpointNewTrait/
├── SurveyCheckpointNewTrait.tsx
├── SurveyCheckpointNewTrait.test.tsx
└── SurveyCheckpointNewTrait.stories.tsx
src/components/survey/SurveyQuestionnaire/
├── SurveyQuestionnaire.constants.ts                 # existing: + "new-trait": SurveyCheckpointNewTrait
└── SurveyQuestionnaireSession/
    └── SurveyQuestionnaireCheckpoints/
        └── SurveyQuestionnaireCheckpoints.test.tsx  # existing: + the case of the real card
```

- Nothing is left behind in `src/components/results/Traits/TraitPill/`: no copy, no file that only re-exports.
- No `.types.ts`, no `.constants.ts` and no `utils/` for the card: it has no type, constant or helper of its own.
- No functions in a component file, no `renderX()`.
- `Traits.stories.tsx` is not changed. Every story of it must look as it did before the move.

# Unit test cases (BDD)

```ts
describe('<SurveyCheckpointNewTrait />', () => {
  describe('given a card with a trait', () => {
    it('renders exactly one region named "Checkpoint"', ...);
    it('shows one pill with the trait\'s name, before the lead-in and the statement', ...);
    it('shows the pill as a single item, not inside a list', ...);
    it('shows no avatar and no hatching', ...);
    it('shows the lead-in and the statement of the card\'s line, with the name in quotation marks', ...);
    it('shows "Dalej" and "Wyłącz checkpointy", and no options', ...);
  });
  describe('given a trait without an icon', () => {
    it('shows the name alone', ...);
  });
  describe('given a trait without a colour, and one with a light colour', () => {
    it('shows the pill as the traits module does', ...);
  });
  describe('given each of the three lines of the new trait pool', () => {
    it('shows that line with the name in it', ...);
  });
  describe('given a long name', () => {
    it('keeps the full name on the pill for assistive technology', ...);
    it('shows the full name in the statement', ...);
  });
  describe('given a name with quotation marks', () => {
    it('shows it as written', ...);
  });
  describe('given the app is in English', () => {
    it('shows the same line in English, with the name unchanged', ...);
  });
  describe('given a trait without a name', () => {
    it('renders nothing and calls onContinue once', ...);
  });
  describe('given a card whose text cannot be built', () => {
    it('renders nothing and calls onContinue once', ...);
  });
  describe('when the pill is pressed', () => {
    it('calls nothing', ...);
  });
  describe('when "Dalej" is activated', () => {
    it('calls onContinue once', ...);
  });
  describe('when "Wyłącz checkpointy" is activated', () => {
    it('calls onOptOut once', ...);
  });
  it('never calls onReveal', ...);
  it('adds no focusable element of its own', ...);
});

describe('<TraitPill />', () => {
  // The existing cases, with the trait and the holder passed as two props.
  describe('given a trait the taker holds', () => {
    it('renders one item named by the trait', ...);
    it('is not a list item', ...);
    it('fills the pill with the trait colour through a custom property', ...);
    it('renders the icon as decoration, before the name', ...);
    it('renders no avatar, even when the other side is passed', ...);
  });
  describe('given no holder', () => {
    it('renders the pill of a trait the taker holds', ...);
  });
  describe('given a trait without an icon', () => {
    it('renders the name alone', ...);
  });
  describe('given a trait both hold', () => {
    it('renders a solid pill with the other side avatar', ...);
    it('says in words that it is shared', ...);
  });
  describe('given a trait only the other side holds', () => {
    it('renders a hatched pill with their avatar', ...);
    it('says in words that it is only theirs', ...);
  });
  describe('given the other side has no avatar', () => {
    it('renders a placeholder in the same place', ...);
  });
  describe('given no other side', () => {
    it('renders a trait marked as theirs like the taker\'s own', ...);
  });
  describe('given a trait without a colour', () => {
    it('uses the neutral colour', ...);
  });
  describe('given a trait with a light colour', () => {
    it('renders the label and the icon in a dark tone', ...);
  });
  describe('given a long name', () => {
    it('truncates it to one line and keeps the full text', ...);
  });
  describe('interaction', () => {
    it('is never interactive', ...);
  });
});

describe('<Traits />', () => {
  // Every existing case stays and passes. These are the ones the move touches.
  it('renders the pills as a list, each item named by its trait', ...);
  it('passes the trait and its holder to each pill', ...);
  it('passes the other side to each pill only in a comparison', ...);
});

describe('CHECKPOINT_CARDS', () => {
  it('holds SurveyCheckpointNewTrait under "new-trait"', ...);
});

describe('<SurveyQuestionnaireCheckpoints /> - the new trait card', () => {
  // The real registry. The session is seeded in the phase "checkpoints" with a new trait card as the last card shown.
  it('draws the pill and the statement of that card', ...);
  it('closes the checkpoint when "Dalej" is activated', ...);
});
```

Find elements by role and accessible name. Build a card for a test by hand - `{ type: "new-trait", boundary: 12, line: { pool: "new-trait", index: 0 }, trait: createOrientation("monarchism", "Monarchizm", { color: "#9b51e0" }) }` - and render it with `renderWithI18n`. The tests of `getPillHolder`, `isLightColor`, `useTraitDescription` and `getTraitItems` move or stay with their files and pass unchanged.

# End-to-end test

**No e2e in this pull request.** The card is registered, and it still cannot appear on the route: no quiz carries a list of traits, so the engine's trigger never fires. The pull request says: "No e2e: the new trait card cannot appear on the route until a quiz carries a list of traits". The move of `TraitPill` changes nothing a user can do on a route either. The task that brings the list - the last row of "What switches the card on" - adds the scenario.

# Storybook stories

`SurveyCheckpointNewTrait.stories.tsx`. Each story passes a card built in the story file and `fn()` for the three callbacks; the line is fixed by its index.

**Figma, the one state of the frame**
- `Default` - "Monarchizm" with its icon, the first line of the pool

**Edge**
- `NoIcon`
- `NoColor`
- `LightColor`
- `LongName` - the pill truncates, the statement wraps
- `NameWithQuotationMarks`
- `SecondLine`, `ThirdLine` - the other two lines of the pool

`TraitPill.stories.tsx` - new, in the order of the [traits frame](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5513-26739): `Default` (a trait the taker holds), `Shared`, `OnlyTheirs`; then `NoIcon`, `NoColor`, `LightColor`, `LongName`, `OtherWithoutAvatar`.

Check widths by resizing the viewport, not by wrapping the story.

# Remember about standards

- Use the standard colors palette, never add colors directly (check https://tailwindcss.com/docs/colors and our color palette in the `src/index.css` file and in [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css))
- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Create a Storybook story for the component with all possible props variants of the component
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)
- Name the branch `feature/survey-checkpoint-new-trait-{issue number}`, following [Conventional Branch](https://conventional-branch.github.io/) - never keep a generated or default branch name
- Read `AGENTS.md` in the repository before starting; where it differs from this task on a standard, it wins
- The card reads nothing but its props: no session, no running state. Everything it draws is in `card`
- Moving `TraitPill` is a move: its tests and utils move with it, and no copy stays in `Traits`
- The card renders one `SurveyCheckpoint` and nothing around it. Stories show it alone, with no decorator, background or fixed width; check them at 320, 360 and 800 px
- Run `yarn i18n:extract` after the move: the messages of the pill change their file reference, not their text. Commit both catalogs
- Commit only files that belong to the task; commits follow Conventional Commits
- The PR follows the repository's pull request template, with a screenshot of the `Default` story next to the Figma frame and of one `Traits` story before and after the move

# Dependencies

- `survey-checkpoint` - the frame `SurveyCheckpoint`, `CheckpointCardProps`, the registry `CHECKPOINT_CARDS`, the Checkpoints phase.
- Through it: `survey-checkpoint-engine` (the trigger, `NewTraitCheckpointCard`, `getCheckpointText`, the pool) and `survey-running-state` (`unlockedTraits`).
- `Traits` with its `TraitPill` - built, on `main` of the app.

It blocks nothing. The other cards can be built alongside it.

# Resources

- [Spec - New trait](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/new-trait.md) - every case of the card, in full
- [Spec - Traits](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/traits.md) - the pill: its colour, icon and comparison rules
- [Docs - New trait](https://github.com/gi-org-pl/product/blob/main/mypolitics/docs/modules/quiz/questionnaire/checkpoints/new-trait.md) - the idea
- [Spec - Checkpoints](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/checkpoints.md) - the frame the card fills
- [Spec - Event model](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/event-model.md) - when a trait is unlocked and when the card may fire
- [Spec - Random copy](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/checkpoints-random-copy.md) - the three lines
- [Spec - Universal orientation](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/universal-orientation.md) - a trait is an orientation; a new property of the quiz needs a new field
- [Figma - the new trait card](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5515-67457). The frame writes "Zdobyłeś cechę" and draws the back button enabled; the spec rewrites the statement and disables back, and the spec stands
- [Figma - Traits](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5513-26739) - the pill in the result module
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Storybook docs](https://storybook.js.org/docs/writing-stories)
- [Tailwind docs](https://tailwindcss.com/docs/)
- [Vitest docs](https://vitest.dev/guide/)

# Definition of Done

- [ ] Code follows folder structure (`docs/frontend/conventions/PROJECT_STRUCTURE.md`)
- [ ] Naming follows `docs/frontend/conventions/NAMING.md`
- [ ] `SurveyCheckpointNewTrait` sits directly in `src/components/survey/`, `TraitPill` directly in `src/components/shared/` - no extra folder layer
- [ ] Component layout follows `docs/frontend/conventions/COMPONENT_STRUCTURE.md`: one component per file, helpers and hooks in `utils/`, each with its own test
- [ ] The card is typed `CheckpointCardProps<"new-trait">`, renders exactly one `SurveyCheckpoint`, and passes `onContinue` and `onOptOut` unchanged
- [ ] The visual is one `TraitPill` for `card.trait`: icon, name, the trait's colour; no second pill, no avatar, no hatching
- [ ] The lead-in and the statement come from `getCheckpointText(i18n, card)`; the name is shown as written; no line was added or changed
- [ ] The card shows no number, no bar and no verdict on the trait, and does not change while it is open
- [ ] A card whose trait has no name, or whose text cannot be built, is not drawn and leaves by itself, with `onContinue` called once
- [ ] On the card the pill is a single item, not a list of one; its icon is decorative; it is not interactive
- [ ] `TraitPill` lives in `src/components/shared/TraitPill/` with its tests and utils; it takes `orientation`, `holder` and `otherOrientation`; `TraitHolder` is its type; its root is not a list item
- [ ] `Traits` draws the shared pill inside its own list items and looks and reads as before; its tests are updated and pass, its stories are unchanged
- [ ] Nothing is left in `src/components/results/Traits/TraitPill/`
- [ ] `CHECKPOINT_CARDS` holds `"new-trait": SurveyCheckpointNewTrait`; nothing was added to the engine, the running state, the pools, `Survey` or `getSessionCheckpoint`
- [ ] No `Badge`, no `Traits`, no `ModuleWrapper` on the card, and no button of the card's own
- [ ] Nothing imported from another component's `utils/`, constants or subcomponents
- [ ] The card fills its parent's width; stories checked at 320 / 360 / 800 px with no horizontal scroll; the long name is truncated on the pill only and wraps in the statement
- [ ] Unit tests added, BDD style, coverage ≥95% on all new and changed files; every util and hook has its own test file; elements found by role and name
- [ ] Storybook stories added for the card and for `TraitPill`, all listed above, showing the component alone
- [ ] PR states "No e2e: the new trait card cannot appear on the route until a quiz carries a list of traits"
- [ ] `yarn i18n:extract` run; no text changed; `.po` files committed
- [ ] Biome lint clean
- [ ] TypeScript clean (no `any`, no `@ts-ignore`)
- [ ] Branch named `feature/survey-checkpoint-new-trait-{issue number}`
- [ ] CI green: build, lint, test, e2e
- [ ] PR description lists decisions and deviations from the ticket/spec; only files belonging to the task are committed
