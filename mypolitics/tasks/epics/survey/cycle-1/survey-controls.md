# Story

As a user taking a quiz, I want a bar above the question that lets me step back, tells me where I am - the quiz, the category and how many questions are left in it - and lets me start over only after I confirm, so that I never lose my answers by accident.

# Replaces

This task replaces [#31](https://github.com/gi-org-pl/mypolitics-app/issues/31) and its pull request [#51](https://github.com/gi-org-pl/mypolitics-app/pull/51). Start from a fresh branch off `main`; do not continue that branch. What was wrong in the old task, so it is not repeated:

- It described the number change as a fade-and-shrink "tick". The frame and myPolitics 1.0 roll the number; the review of #51 rejected the tick.
- It drove everything from a three-value `phase`. A session now has [seven phases](https://github.com/gi-org-pl/product/blob/main/mypolitics/docs/modules/quiz/questionnaire/phases-model.md), and which buttons are enabled differs between them, so the parent decides and passes plain props - the frame's own note is "Pass props as simple as possible".
- It hid the category name below 400 px by measuring the width in JavaScript. The frame shows the name at 340 px, shortened with an ellipsis.
- It misspelt a prop (`questionsLeftnCategory`).

# Component properties

**Component:** `SurveyControls`
**Location:** `src/components/survey/SurveyControls/`
**Shared:** no - domain component under `survey`

Presentational. No context, no API calls. The only state it owns is whether the reset dialog is open.

```ts
export interface SurveyControlsProps {
  quizName: string;             // shown in the pill when nothing else is, and named in the reset dialog
  label?: string;               // pill text for phases with no category, e.g. "Prawie koniec!" - passed translated
  categoryName?: string;        // current category - passed translated
  questionsLeft?: number;       // questions left in the category; optional
  isPreviousDisabled?: boolean; // default false
  isResetDisabled?: boolean;    // default false
  onPrevious: () => void;       // back button
  onReset: () => void;          // called only after the dialog is confirmed
}
```

# Behaviour

The [Figma frame](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=4260-1738) is the source of truth for sizes, spacing, type, icons and colours. The cases below are the source of truth for what happens.

### Layout

One row: the back button at the start, the pill in the middle, the reset button at the end. The two buttons keep their size and their place whatever the pill holds. The row is exactly as wide as its parent and never overflows it.

### Pill

The first row that applies wins.

| Props | The pill shows |
|---|---|
| `label` | The label alone |
| `categoryName` and `questionsLeft` | The category name, a divider, then the card icon with the number |
| `categoryName` only | The category name alone, no divider |
| `questionsLeft` only | The card icon with the number, no divider |
| None of them | The quiz name |

| Case | Behaviour |
|---|---|
| The text is longer than the room between the buttons | Cut with an ellipsis on one line, as in "Polityka zagr..." and "Really Looong Quiz Na...". The full text stays available to assistive technology |
| The category name is cut | The icon and the number are never cut and never wrap |
| The pill is shorter than the room | It hugs its content and stays centred |

### Number change

When `questionsLeft` changes while the number is shown, the old value leaves and the new one enters in a short vertical roll, with the motion blur drawn in the animation frame. This is the animation myPolitics 1.0 has; the recording is in the [review of #51](https://github.com/gi-org-pl/mypolitics-app/pull/51#pullrequestreview-4528738053).

- 300 ms. The duration is a constant.
- The first render does not animate.
- If the value changes again mid-animation, the pill ends on the latest value. No timers are left running after unmount.
- With `prefers-reduced-motion` the number is replaced without animating.
- Tailwind class names are static. A duration cannot be built into a class name from a constant at runtime - #51 did this and the duration was never applied.

### Back button

| Case | Behaviour |
|---|---|
| Activated | Calls `onPrevious` |
| `isPreviousDisabled` | Drawn disabled as in the frame; does nothing |

### Reset button and dialog

| Case | Behaviour |
|---|---|
| Reset activated | Opens the dialog. `onReset` is not called yet |
| The dialog's "Resetuj quiz" activated | Calls `onReset` once, then closes the dialog |
| The dialog dismissed (close button, overlay, Escape) | Closes. `onReset` is not called |
| `isResetDisabled` | Drawn disabled as in the frame; no dialog |

The dialog names the quiz in its text. Do not rebuild the 1.0 pattern of a second click within two seconds.

### Invalid and edge input

| Input | Behaviour |
|---|---|
| `questionsLeft` not a finite number | Treated as absent |
| `questionsLeft` negative | Shown as 0 |
| `questionsLeft` fractional | Rounded down |
| `label` or `categoryName` empty or only whitespace | Treated as absent |
| `quizName` empty and nothing else to show | No pill; both buttons stay at their ends |
| `quizName` empty when the dialog opens | The dialog text leaves the name out and still reads as a sentence |

### Accessibility

- Both buttons have an accessible name; their icons are decorative.
- The number is announced with its meaning, not as a bare figure (see Copy).
- The dialog moves focus in, traps it, and returns it to the reset button on close - Athena `Modal` does this; do not work around it.

# Copy

Polish is the source; every string goes through a Lingui macro and the English entry is filled in.

| Text | Polish (source) | English |
|---|---|---|
| Back button name | Poprzednie pytanie | Previous question |
| Reset button name | Zacznij od nowa | Start over |
| Number, for assistive technology | Pozostałe pytania w kategorii: {count} | Questions left in the category: {count} |
| Dialog title | Rozpocząć od nowa? | Start over? |
| Dialog text | Czy na pewno chcesz rozpocząć quiz {quizName} od nowa? Twoje odpowiedzi nie zostaną zapisane. | Are you sure you want to start the quiz {quizName} over? Your answers will not be saved. |
| Dialog text, no quiz name | Czy na pewno chcesz rozpocząć quiz od nowa? Twoje odpowiedzi nie zostaną zapisane. | Are you sure you want to start the quiz over? Your answers will not be saved. |
| Dialog action | Resetuj quiz | Reset quiz |

"Prawie koniec!" and the other phase labels are not this component's copy: the parent passes them through `label`.

# Athena components to use

- `Button` for the back and reset buttons (outlined, icon button) and for the dialog action (primary, danger, with the reset icon). Do not build a custom button.
- `Modal` for the dialog: `title`, `description` and the action through `actions`. Render it with `isOpen`; do not also mount it conditionally.
- No Athena component fits the pill.
- Icons are SVG files in `src/assets/icons/`, imported. The three from #51 (`left-arrow`, `reset`, `card-question`) can be reused.

# Out of scope

- Deciding which phase the session is in, what the label says, and when a button is disabled - the questionnaire.
- The progress bar above the row - `SurveySaturatedProgressBar`.
- What reset and previous actually do to the answers.

# Files to create

```
src/components/survey/SurveyControls/
├── SurveyControls.tsx
├── SurveyControls.test.tsx
├── SurveyControls.types.ts
├── SurveyControls.constants.ts        # NUMBER_ANIMATION_MS
├── SurveyControls.stories.tsx
├── SurveyControlsPill/                # what the pill shows, and its truncation
│   ├── SurveyControlsPill.tsx
│   ├── SurveyControlsPill.test.tsx
│   ├── SurveyControlsCount/           # the icon and the rolling number
│   │   ├── SurveyControlsCount.tsx
│   │   └── SurveyControlsCount.test.tsx
│   └── utils/
│       ├── getQuestionsLeft.ts        # raw value -> a whole number >= 0, or nothing
│       └── getQuestionsLeft.test.ts
└── SurveyControlsResetModal/          # the dialog
    ├── SurveyControlsResetModal.tsx
    └── SurveyControlsResetModal.test.tsx
```

Add a local hook under `utils/` if the roll needs one, with its own test. No functions in a component file, no `renderX()`.

# Unit test cases (BDD)

```ts
describe('<SurveyControls />', () => {
  describe('given only a quiz name', () => {
    it('shows the quiz name in the pill', ...);
  });
  describe('given a label', () => {
    it('shows the label alone', ...);
  });
  describe('given a category name and questions left', () => {
    it('shows the name, the divider and the number', ...);
  });
  describe('given a category name only', () => {
    it('shows the name without a divider', ...);
  });
  describe('given questions left only', () => {
    it('shows the number without a divider', ...);
  });
  describe('given an empty quiz name and nothing else', () => {
    it('renders no pill and both buttons', ...);
  });
  describe('when the back button is activated', () => {
    it('calls onPrevious', ...);
  });
  describe('given isPreviousDisabled', () => {
    it('disables the back button', ...);
  });
  describe('given isResetDisabled', () => {
    it('disables the reset button', ...);
  });
  describe('when the reset button is activated', () => {
    it('opens the dialog', ...);
    it('does not call onReset', ...);
  });
  describe('when the dialog is confirmed', () => {
    it('calls onReset once', ...);
    it('closes the dialog', ...);
  });
  describe('when the dialog is dismissed', () => {
    it('does not call onReset', ...);
    it('closes the dialog', ...);
  });
  describe('accessibility', () => {
    it('names both buttons', ...);
    it('announces the number with its meaning', ...);
  });
});

describe('<SurveyControlsPill />', () => {
  describe('given a text longer than the pill', () => {
    it('keeps the full text available to assistive technology', ...);
  });
  describe('given a label together with a category', () => {
    it('shows the label', ...);
  });
});

describe('<SurveyControlsCount />', () => {
  describe('on first render', () => {
    it('shows the value without animating', ...);
  });
  describe('when the value changes', () => {
    it('animates from the old value to the new one', ...);
    it('shows only the new value once the animation ends', ...);
  });
  describe('when the value changes again mid-animation', () => {
    it('ends on the latest value', ...);
  });
  describe('when unmounted mid-animation', () => {
    it('leaves no timer running', ...);
  });
});

describe('getQuestionsLeft()', () => {
  describe('given a whole number', () => {
    it('returns it', ...);
  });
  describe('given a negative number', () => {
    it('returns 0', ...);
  });
  describe('given a fraction', () => {
    it('rounds it down', ...);
  });
  describe('given a value that is not a finite number', () => {
    it('returns nothing', ...);
  });
});

describe('<SurveyControlsResetModal />', () => {
  describe('given a quiz name', () => {
    it('names the quiz in the text', ...);
  });
  describe('given an empty quiz name', () => {
    it('uses the text without a name', ...);
  });
});
```

Find elements by role and accessible name. Do not add `data-testid` attributes to find things a user can find by name.

# Storybook stories

**Figma, in the frame's order**
- `CategoryAndCount` - "Światopogląd", 11
- `LongCategoryName` - "Polityka zagraniczna", 11
- `QuizName` - quiz name only
- `LongQuizName` - "Really Looong Quiz Name That Does Not Fit"
- `Label` - "Prawie koniec!"
- `NumberChange` - the value drops by one in a `play` function
- `ResetDialogOpen` - opened in a `play` function

**Edge**
- `CountOnly`, `CategoryOnly`
- `PreviousDisabled`, `ResetDisabled`, `BothDisabled`
- `ZeroLeft`

Check widths by resizing the viewport, not by wrapping the story.

# Remember about standards

- Use the standard colors palette, never add colors directly (check https://tailwindcss.com/docs/colors and our color palette in the `src/index.css` file and in [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css))
- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Create a Storybook story for the component with all possible props variants of the component
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)
- Name the branch `feature/survey-controls-88`, following [Conventional Branch](https://conventional-branch.github.io/) - never keep a generated or default branch name
- Read `AGENTS.md` in the repository before starting. It holds the lessons from earlier reviews, and most of what blocked #51 is in it
- The component fills its parent's width and its height comes from its content. Stories show it alone, with no decorator, background or fixed width; check them at 320, 360 and 800 px
- Layout that depends on width is CSS. Do not measure the element or the window in JavaScript
- Copy is Polish by default: accessible names included. Run `yarn i18n:extract`, translate every new English entry, commit both catalogs
- Commit only files that belong to the task; commits follow Conventional Commits
- The PR follows the repository's pull request template, with screenshots of the stories next to the Figma frame

# Dependencies

None.

# Resources

- [Figma - SurveyControls frame](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=4260-1738) - [category and count](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=4260-1900) | [long category name](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=4260-1878) | [quiz name](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=4260-10840) | [long quiz name](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=4260-10855) | [label](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=4260-10868) | [number change animation](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=4260-3515) | [reset dialog](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=4274-9160)
- [Docs - Phases model](https://github.com/gi-org-pl/product/blob/main/mypolitics/docs/modules/quiz/questionnaire/phases-model.md) - the phases the bar is shown in
- [Docs - Progress and pacing](https://github.com/gi-org-pl/product/blob/main/mypolitics/docs/modules/quiz/questionnaire/progress-and-pacing.md) - why the pill and the counter exist
- [Legacy SurveyHeader](https://github.com/gi-org-pl/mypolitics-app-legacy/blob/develop/frontend/src/components/Survey/v3/SingleSurveyPage/SurveyHeader/SurveyHeaderView.tsx) and its [AnimatedPrimitive](https://github.com/gi-org-pl/mypolitics-app-legacy/tree/develop/frontend/src/shared/AnimatedPrimitive) - for the number animation only; do not copy styled-components, the context hook or the two-click reset
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Storybook docs](https://storybook.js.org/docs/writing-stories)
- [Tailwind docs](https://tailwindcss.com/docs/)
- [Vitest docs](https://vitest.dev/guide/)

# Definition of Done

- [ ] Code follows folder structure (`docs/frontend/conventions/PROJECT_STRUCTURE.md`)
- [ ] Naming follows `docs/frontend/conventions/NAMING.md`
- [ ] Component layout follows `docs/frontend/conventions/COMPONENT_STRUCTURE.md`: one component per file, helpers and hooks in `utils/`, each with its own test
- [ ] The pill shows the right content for each combination of props, in the order of the table
- [ ] Long text is cut with an ellipsis; the buttons keep their place and the row never overflows its parent
- [ ] The number rolls on change as in the frame, in 300 ms, and not on first render or under `prefers-reduced-motion`
- [ ] No width is measured in JavaScript; no class name is built at runtime
- [ ] Reset opens the dialog; `onReset` is called only on confirmation, once
- [ ] Disabled buttons do nothing and look as in the frame
- [ ] Invalid input degrades as in the table, without throwing
- [ ] Both buttons and the number have accessible names in Polish
- [ ] Athena `Button` and `Modal` are used; no custom button, no two-click reset
- [ ] The component fills its parent's width; stories checked at 320 / 360 / 800 px with no horizontal scroll
- [ ] Unit tests added, BDD style, coverage ≥95% on all new files; elements found by role and name
- [ ] Storybook stories added for all variants listed above, showing the component alone
- [ ] Biome lint clean
- [ ] TypeScript clean (no `any`, no `@ts-ignore`)
- [ ] Every string from the Copy section goes through a Lingui macro, with Polish as the source; `yarn i18n:extract` run, English entries translated, `.po` files committed
- [ ] PR states "No e2e: not mounted on any route"
- [ ] Branch named `feature/survey-controls-88`
- [ ] CI green: build, lint, test
