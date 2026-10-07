# Story

As a user starting a quiz, I want to pick the topics that matter most to me from a list, and to be told clearly how many I can choose, so that the quiz focuses on what I care about.

# Status

**Continue pull request [#56](https://github.com/gi-org-pl/mypolitics-app/pull/56) on its branch `feature/survey-category-select`.** The structure is sound: this task lists what is left. Do not start over.

Already right in #56 - keep it:

- The props, exactly as below.
- `toggleSelection` as a pure function in `utils/`, with its own tests.
- The test file's Given-When-Then structure and the six stories.

# What changed in this task

- **Rows are `SurveyAnswer`, not Athena `Checkbox`.** The frame draws each category as the custom-selectable answer - the same row, the same check mark, the same border when selected. `SurveyAnswer` is on `main` and already has that type. The review comment on #56 that the rows do not match Figma was right.
- **The default prompt is pluralised.** `maxSelection` is a prop, and "Wybierz 5 najważniejsze tematy" is not Polish.
- **The lock transition is dropped.** The first version asked for a 150 ms fade when a row becomes locked. The row's disabled look now comes from `SurveyAnswer`; it is not re-animated here. `LOCK_TRANSITION_MS` goes away.

# Component properties

**Component:** `SurveyCategorySelect`
**Location:** `src/components/survey/SurveyCategorySelect/`
**Shared:** no - domain component under `survey`

Fully controlled and presentational. No context, no API calls - the parent owns the list and the selection.

```ts
export interface SurveyCategory {
  id: string;
  name: string; // already in the taker's language
}

export interface SurveyCategorySelectProps {
  categories: SurveyCategory[];              // every available category
  selectedIds: string[];                     // chosen ids (controlled)
  onChange: (selectedIds: string[]) => void; // fired on every toggle with the full new selection
  maxSelection?: number;                     // default 3
  prompt?: ReactNode;                        // replaces the default prompt
}
```

# Behaviour

The [Category select phase frame](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=4272-11143) is the source of truth for sizes, spacing, type and colours. The cases below are the source of truth for what happens.

### Layout

The prompt card, then one row per category, in the order given. The buttons under the list ("Idziemy dalej", "Pomiń") and the bar above it are not part of this component.

### Prompt

| Case | Behaviour |
|---|---|
| No `prompt` | The default sentence with `maxSelection` in it, in the right grammatical form for that number |
| `prompt` given | Rendered instead of the default |

### Rows

| Case | Behaviour |
|---|---|
| A category whose id is in `selectedIds` | Its row is drawn selected |
| A category whose id is not | Its row is drawn unselected |
| A selected row is activated | `onChange` with that id removed |
| An unselected row is activated, selection below the limit | `onChange` with that id appended |
| The selection has reached the limit | Unselected rows are disabled. Selected rows stay active, so one can be swapped out |
| A disabled row is activated | Nothing. `onChange` is not called |
| A name longer than the row | It wraps and the row grows. It is never cut |

The rules for the new selection stay in `toggleSelection`.

### Appearance on mount

Rows fade in one after another, a few tens of milliseconds apart.

- CSS only: the delay comes from the row's position. No timers and no per-row state.
- A row is visible without JavaScript and before hydration. The animation is an enhancement, not the thing that makes the row appear.
- With `prefers-reduced-motion` the rows are simply there.
- The step between rows and the length of one fade are two separate constants.

### Invalid and edge input

| Input | Behaviour |
|---|---|
| `selectedIds` longer than `maxSelection` | Treated as at the limit: unselected rows are disabled, selected ones can be removed |
| An id in `selectedIds` that matches no category | Ignored for display, and kept out of the limit count |
| The same id twice in `selectedIds` | Counted once |
| `maxSelection` not a whole number of at least 1 | The default, 3 |
| `categories` empty | The prompt alone |
| Two categories with the same id | The first one is rendered |

### Accessibility

- Each row is a button named after its category and tells assistive technology whether it is selected. `SurveyAnswer` does not expose that yet: add it there for the custom-selectable type, with a test.
- A locked row is disabled, not only dimmed.

# Copy

Polish is the source; the string goes through a Lingui macro with plural forms, and the English entry is filled in.

| Text | Polish (source) | English |
|---|---|---|
| Prompt, 1 | Wybierz {count} najważniejszy dla Ciebie temat. | Choose the {count} topic that matters most to you. |
| Prompt, 2-4 | Wybierz {count} najważniejsze dla Ciebie tematy. | Choose the {count} topics that matter most to you. |
| Prompt, 5 and more | Wybierz {count} najważniejszych dla Ciebie tematów. | Choose the {count} topics that matter most to you. |

Category names come from props, already translated. Do not wrap them again.

# Athena components to use

None. The first version named Athena `Checkbox`; the row is `SurveyAnswer` from `src/components/survey/SurveyAnswer/` with `type="custom-selectable"`. Do not rebuild its row, border, icon or disabled look.

# What is left to fix in #56

1. **Merge `main`.** Athena is now `@gi-org-pl/athena`; the old import no longer resolves.
2. **Replace the row markup with `SurveyAnswer`** and delete the hand-built row, its fixed height and its inline styles.
3. **Make the mount animation CSS** as described above. Today it runs one timer per row and keeps an array in state, the rows are invisible until JavaScript runs, and the fade uses the stagger step as its duration.
4. **Pluralise the default prompt** and commit the catalogs. #56 adds a string and changes neither `.po` file.
5. **Handle the invalid input in the table.** Today the limit check is an exact equality, so a selection longer than the limit unlocks everything.
6. **Fix the tests.** Render through `renderWithI18n` from `src/utils/vitest/` and remove the mocks of `@lingui/core/macro` and `@lingui/react`. Find rows by role and name, and assert their selected and disabled state.
7. **Fix the stories.** No wrapper with a fixed width and no centred layout: the story shows the component alone. Check each at 320, 360 and 800 px.
8. **Check the long name at 320 px.** If `SurveyAnswer` cannot grow with its text, fix that in `SurveyAnswer`, in its own commit with its own test - not by cutting the name here.
9. **Clean up.** Remove the unused `useLingui()` call, end every file with a newline, and build class lists with `tailwind-merge` as the rest of the code does.

# Out of scope

- The buttons under the list and the bar above it - the questionnaire.
- The list of categories and their translation.
- A shared prompt card with `SurveyQuestion`. Build the card here; sharing it is a later clean-up once both exist.

# Files

```
src/components/survey/SurveyCategorySelect/
├── SurveyCategorySelect.tsx
├── SurveyCategorySelect.test.tsx
├── SurveyCategorySelect.types.ts
├── SurveyCategorySelect.constants.ts    # DEFAULT_MAX_SELECTION, ROW_STAGGER_MS, ROW_FADE_MS
├── SurveyCategorySelect.stories.tsx
└── utils/
    ├── toggleSelection.ts
    ├── toggleSelection.test.ts
    ├── getValidSelection.ts              # selectedIds + categories -> known ids, each once
    └── getValidSelection.test.ts

src/components/survey/SurveyAnswer/       # modify: expose the selected state; grow with long text if needed
```

# Unit test cases (BDD)

```ts
describe('<SurveyCategorySelect />', () => {
  describe('given no categories are selected', () => {
    it('renders the default prompt with the maxSelection number', ...);
    it('renders a row for every category, in order', ...);
    it('renders every row unselected', ...);
  });
  describe('given maxSelection of 1, 3 and 5', () => {
    it('uses the matching plural form in the prompt', ...);
  });
  describe('given some categories are selected (below max)', () => {
    it('renders the matching rows as selected', ...);
    it('keeps the unselected rows enabled', ...);
  });
  describe('given the selection has reached maxSelection', () => {
    it('keeps the selected rows enabled', ...);
    it('disables the unselected rows', ...);
  });
  describe('given a selection longer than maxSelection', () => {
    it('disables the unselected rows', ...);
  });
  describe('when a user activates a selected row', () => {
    it('calls onChange with the id removed', ...);
  });
  describe('when a user activates an unselected row under the limit', () => {
    it('calls onChange with the id appended', ...);
  });
  describe('when a user activates a disabled row', () => {
    it('does not call onChange', ...);
  });
  describe('given a custom prompt', () => {
    it('renders it instead of the default', ...);
  });
  describe('given an invalid maxSelection', () => {
    it('falls back to 3', ...);
  });
  describe('given no categories', () => {
    it('renders the prompt alone', ...);
  });
  describe('accessibility', () => {
    it('names each row after its category', ...);
    it('exposes the selected state of each row', ...);
  });
});

describe('toggleSelection()', () => {
  describe('when id is already in the list', () => {
    it('returns the list with the id removed', ...);
  });
  describe('when id is not in the list and length < max', () => {
    it('returns the list with the id appended', ...);
  });
  describe('when id is not in the list and length >= max', () => {
    it('returns the original list unchanged', ...);
  });
});

describe('getValidSelection()', () => {
  describe('given an id that matches no category', () => {
    it('leaves it out', ...);
  });
  describe('given the same id twice', () => {
    it('keeps it once', ...);
  });
});
```

# Storybook stories

- `Default` - 5 categories, none selected
- `PartiallySelected` - 2 of 5, `maxSelection=3`
- `AtMaxSelection` - 3 of 5, unselected rows locked
- `CustomMaxSelection` - `maxSelection=2`, 1 selected
- `SingleSelection` - `maxSelection=1`, the singular prompt
- `CustomPrompt`
- `LongCategoryName` - a name that needs more than one line at 320 px
- `NoCategories`

# Remember about standards

- Use the standard colors palette, never add colors directly (check https://tailwindcss.com/docs/colors and our color palette in the `src/index.css` file and in [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css))
- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Create a Storybook story for the component with all possible props variants of the component
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)
- Keep working on the branch `feature/survey-category-select`, so the pull request and its history stay. If the work is ever restarted on a new branch, name it `feature/survey-category-select-37`, following [Conventional Branch](https://conventional-branch.github.io/)
- Read `AGENTS.md` in the repository before continuing - it was extended after this pull request was opened
- The component fills its parent's width and its height comes from its content
- Import another component's view and types only - nothing from `SurveyAnswer`'s `utils/` or constants
- Run `yarn i18n:extract`, translate the new English entries, commit both catalogs
- The PR description lists decisions, deviations and verification, with screenshots of the stories next to the Figma frame

# Dependencies

- `SurveyAnswer` - done ([#33](https://github.com/gi-org-pl/mypolitics-app/issues/33)); this task extends it slightly

# Resources

- [Pull request #56](https://github.com/gi-org-pl/mypolitics-app/pull/56) - the work so far
- [Figma - Category select phase](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=4272-11143) - the prompt and the rows; its bar and buttons are not part of this task
- [Figma - SurveyAnswer, custom-selectable](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=4275-1851) - the row, selected and not
- [Docs - Phases model](https://github.com/gi-org-pl/product/blob/main/mypolitics/docs/modules/quiz/questionnaire/phases-model.md) - what the phase is for
- [Lingui - plurals](https://lingui.dev/guides/plurals)
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Storybook docs](https://storybook.js.org/docs/writing-stories)
- [Tailwind docs](https://tailwindcss.com/docs/)
- [Vitest docs](https://vitest.dev/guide/)

# Definition of Done

- [ ] `main` merged into the branch; build, lint and tests pass on the merged result
- [ ] Code follows folder structure (`docs/frontend/conventions/PROJECT_STRUCTURE.md`)
- [ ] Naming follows `docs/frontend/conventions/NAMING.md`
- [ ] Component layout follows `docs/frontend/conventions/COMPONENT_STRUCTURE.md`
- [ ] Every row is a `SurveyAnswer` of the custom-selectable type; no Athena `Checkbox`, no hand-built row
- [ ] At the limit, unselected rows are disabled and selected rows stay active; a disabled row never calls `onChange`
- [ ] The default prompt uses the right plural form for 1, 2-4 and 5+
- [ ] Rows are visible without JavaScript; the mount animation is CSS and is skipped under `prefers-reduced-motion`
- [ ] Invalid input degrades as in the table, without throwing
- [ ] Each row exposes its name and selected state to assistive technology
- [ ] A long category name wraps at 320 px
- [ ] The component fills its parent's width; stories checked at 320 / 360 / 800 px with no horizontal scroll
- [ ] Unit tests BDD style through `renderWithI18n`, no Lingui mocks, coverage ≥95% on changed files
- [ ] Storybook stories for all variants listed above, showing the component alone
- [ ] Biome lint clean
- [ ] TypeScript clean (no `any`, no `@ts-ignore`)
- [ ] `yarn i18n:extract` run, English entries translated, `.po` files committed
- [ ] PR states "No e2e: not mounted on any route"
- [ ] CI green: build, lint, test
