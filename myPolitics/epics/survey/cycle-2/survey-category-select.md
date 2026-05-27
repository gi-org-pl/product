# Story

As a user starting a survey, I want to pick the topics that matter most to me from a list so that the quiz focuses on what I care about — and I want to be told clearly how many topics I can choose at most.

# Component properties

**Component:** `SurveyCategorySelect`
**Location:** `src/components/survey/SurveyCategorySelect/`
**Shared:** no — domain component under `survey`
**Epic:** survey | **Cycle:** 2

Fully controlled, presentational component. No context, no API calls — the parent owns the data and the selection state.

```ts
export interface SurveyCategory {
  id: string;
  name: string; // already i18n-ed by the parent (Trans-ed earlier) — see "i18n" note below
}

export interface SurveyCategorySelectProps {
  categories: SurveyCategory[];        // full list of available categories
  selectedIds: string[];               // currently selected category IDs (controlled)
  onChange: (selectedIds: string[]) => void; // fired on every toggle with the new full selection
  maxSelection?: number;               // default 3 — hard upper bound for selection
  prompt?: ReactNode;                  // optional override; defaults to <Trans>Wybierz {maxSelection} najważniejsze dla Ciebie tematy.</Trans>
}
```

# Behaviour

### Layout

Vertical stack inside the survey card surface:

```
[ Prompt header (dark teal pill, same look as SurveyQuestion header) ]
[ Category list — one row per category ]
```

The action button row (e.g. "Idziemy dalej" / "Pomiń") is **not** part of this component — the wrapping `SurveyQuestionnaire` adds it below.

---

### Prompt header

Renders the `prompt` prop. Default content:

```tsx
<Trans>Wybierz {maxSelection} najważniejsze dla Ciebie tematy.</Trans>
```

Visually consistent with the dark-teal question header used by `SurveyQuestion` (same rounded shape, same color tokens) so that all three phases (category select, question, demographics/newsletter intro) share the same header look. Do **not** restyle — reuse the same Tailwind classes / shared styling primitives.

---

### Category list

One row per category. Use Athena `Checkbox` for each row:

- Label: `category.name`
- Checked: `selectedIds.includes(category.id)`
- `onChange`: toggle this `id` in the array, then call `props.onChange(newIds)`.

Toggling rules (these live in `utils/toggleSelection.ts` for testability):

| Current state | User action | Result |
|---|---|---|
| `id` already in `selectedIds` | toggles off | remove `id` from array |
| `id` not in `selectedIds` and length < `maxSelection` | toggles on | append `id` |
| `id` not in `selectedIds` and length === `maxSelection` | toggles on | **ignore** — do nothing, do not call `onChange` |

When the max is reached, unselected checkboxes appear visually disabled (`isDisabled` on Athena `Checkbox` if supported, otherwise wrap with the disabled visual state). The already-selected ones stay enabled so the user can swap a selection out.

---

### Animations

- Row appearance: subtle staggered fade-in on mount (every row 30–50 ms apart). Keep it tasteful — this is a stable list, not a marketing splash.
- Checkbox state change: rely on Athena `Checkbox`'s built-in transition. Do not reimplement.
- When a row becomes locked because `maxSelection` was reached: animate opacity to the disabled state over ~150 ms instead of snapping.

Animation durations live in `SurveyCategorySelect.constants.ts` (`ROW_STAGGER_MS`, `LOCK_TRANSITION_MS`).

---

### i18n

- The `prompt` default uses `<Trans>` with the `maxSelection` interpolation — must round-trip through `yarn i18n:extract`.
- `category.name` arrives **already translated** from the parent (the topic catalog will live in a constants file owned by the wrapper/page). Do **not** wrap it again.
- No other user-visible strings inside the component.

# Files to create

```
src/components/survey/SurveyCategorySelect/
├── SurveyCategorySelect.tsx
├── SurveyCategorySelect.test.tsx
├── SurveyCategorySelect.types.ts        # SurveyCategory, SurveyCategorySelectProps
├── SurveyCategorySelect.constants.ts    # DEFAULT_MAX_SELECTION, ROW_STAGGER_MS, LOCK_TRANSITION_MS
├── SurveyCategorySelect.stories.tsx
└── utils/
    ├── toggleSelection.ts
    └── toggleSelection.test.ts
```

# Unit test cases (BDD)

```ts
describe('<SurveyCategorySelect />', () => {

  describe('given no categories are selected', () => {
    it('renders the default prompt with the maxSelection number', ...);
    it('renders a Checkbox for every category', ...);
    it('renders every Checkbox unchecked', ...);
  });

  describe('given some categories are selected (below max)', () => {
    it('renders the matching Checkboxes as checked', ...);
    it('keeps the unselected Checkboxes enabled', ...);
  });

  describe('given the selection has reached maxSelection', () => {
    it('keeps already-selected Checkboxes enabled', ...);
    it('renders the unselected Checkboxes as visually disabled', ...);
  });

  describe('when a user toggles an already-selected category off', () => {
    it('calls onChange with the id removed', ...);
  });

  describe('when a user toggles an unselected category on (under the limit)', () => {
    it('calls onChange with the id appended', ...);
  });

  describe('when a user toggles an unselected category on (at the limit)', () => {
    it('does not call onChange', ...);
  });

  describe('given a custom prompt prop', () => {
    it('renders the custom prompt instead of the default', ...);
  });
});

describe('toggleSelection()', () => {
  describe('when id is already in the list', () => {
    it('returns the list with the id removed', ...);
  });
  describe('when id is not in the list and length < max', () => {
    it('returns the list with the id appended', ...);
  });
  describe('when id is not in the list and length === max', () => {
    it('returns the original list unchanged', ...);
  });
});
```

# Storybook stories

- `Default` — 5 categories, none selected
- `PartiallySelected` — 2 of 5 selected, `maxSelection=3`
- `AtMaxSelection` — 3 of 5 selected, unselected rows visibly locked
- `CustomMaxSelection` — `maxSelection=2`, 1 selected
- `CustomPrompt` — uses the `prompt` prop with a custom translatable node
- `LongCategoryName` — one category with a very long name to verify wrapping/truncation

Mock categories used across stories (these strings are translated by the parent/page in real usage):

```ts
const MOCK_CATEGORIES: SurveyCategory[] = [
  { id: 'worldview', name: 'Światopogląd' },
  { id: 'system',    name: 'Ustrój' },
  { id: 'economy',   name: 'Gospodarka' },
  { id: 'foreign',   name: 'Polityka zagraniczna' },
  { id: 'ecology',   name: 'Ekologia' },
];
```

# Remember about standards

- Use the standard color palette — never raw hex/rgb; check `src/index.css` and [athena index.css](https://github.com/gi-org-pl/athena/blob/main/src/index.css)
- Use Athena `Checkbox` for every row — do **not** roll a custom checkbox
- No styled-components — Tailwind utility classes only
- `toggleSelection` is a pure function — keep it free of React; test it in isolation
- All user-visible strings (default prompt) wrapped in Lingui macros — no hardcoded literals
- `category.name` is **not** wrapped in `<Trans>` inside the component — it arrives pre-translated from the parent
- Run `yarn i18n:extract` after adding strings; commit the updated `.po` files
- Create unit tests with Vitest, BDD style, ≥95% coverage on all new files
- Create Storybook stories for all variants listed above
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)

# Resources

- [Legacy SurveyStart / category picker](https://github.com/gi-org-pl/mypolitics-app-legacy/tree/develop/frontend/src/components/Survey/v3/SingleSurveyPage) — analyze for category-list behaviour only; do **not** copy styled-components
- [Figma project link](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=1190-9207&t=k6GtQ4k9HtLFKbnM-1)
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Storybook docs](https://storybook.js.org/docs/writing-stories)
- [Tailwind docs](https://tailwindcss.com/docs/)
- [Vitest docs](https://vitest.dev/guide/)

# Definition of Done

- [ ] Code follows folder structure (`docs/frontend/conventions/PROJECT_STRUCTURE.md`)
- [ ] Naming follows `docs/frontend/conventions/NAMING.md`
- [ ] Component layout follows `docs/frontend/conventions/COMPONENT_STRUCTURE.md`
- [ ] Unit tests added, BDD style, coverage ≥95% on all new files
- [ ] Storybook stories added for all 6 variants listed above
- [ ] Biome lint clean
- [ ] TypeScript clean (no `any`, no `@ts-ignore`)
- [ ] No styled-components — Tailwind + Athena `Checkbox` only
- [ ] `maxSelection` default is `3` (extracted to constants)
- [ ] At max selection: unselected checkboxes visually disabled; already-selected stay enabled
- [ ] Toggling an unselected row at max does **not** call `onChange`
- [ ] `toggleSelection` extracted as a pure util with its own unit tests
- [ ] `category.name` is **not** double-translated inside the component
- [ ] Default prompt wrapped in `<Trans>` and `yarn i18n:extract` run
- [ ] CI green: build, lint, test
