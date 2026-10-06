<img alt="Horizontal bar chart - flat and grouped" src="https://raw.githubusercontent.com/gi-org-pl/product/main/mypolitics/assets/horizontal-bar-chart.png" />

# Story

As a user reading my quiz result, I want the orientations ranked by how well they match me, best first, with only the top few shown until I ask for more - and broken down by category when the quiz has categories - so that I can see who is closest to me without reading a table.

# Component properties

**Component:** `HorizontalBarChart`
**Location:** `src/components/results/modules/HorizontalBarChart/`
**Shared:** no - a result module, in the `results` domain

A `ModuleWrapper` around a ranked list of one-sided `UniversalAxis` bars. It sorts what it is given and remembers what the taker opened; **no scoring**. This task also creates **`RankedRow`** as its own component, because the `Archetype` module's ranking is a list of the same rows.

```ts
export interface RankedBadge {
  iconUrl?: string;
  text?: string;  // short visible text, e.g. "Oficjalne"
  label?: string; // text name for an icon-only badge
}

export interface RankedEntry {
  orientation: AxisOrientation; // from UniversalAxis.types
  value?: number;               // 0-100
  badge?: RankedBadge;
}

export interface RankedCategory {
  name?: string;
  entries: RankedEntry[];
}

export interface RankedComparison {
  party: AxisOrientation;         // the other party
  values: Record<string, number>; // their value, by orientation id
}

export interface HorizontalBarChartProps {
  title?: string;
  entries?: RankedEntry[];
  categories?: RankedCategory[];  // when present, the list is grouped and `entries` is ignored
  visibleRows?: number;           // rows before the fold in a flat list; default 3
  comparison?: RankedComparison;
  onStatsClick?: () => void;
  onInfoClick?: () => void;
}

// src/components/results/modules/RankedRow/
export interface RankedRowProps {
  entry: RankedEntry;
  comparison?: AxisEntry;
}
```

What is open is local state (`useState`). It is not saved anywhere and nothing outside is told about it.

# Behaviour

The [spec](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/horizontal-bar-chart.md) is the source of truth for every case below; the [Figma frame](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5500-1414) is the source of truth for sizes, spacing, type, icons and colours.

### Ranked row

| Case | Behaviour |
|---|---|
| A row | The orientation's name, then its badge if it has one, and under them a one-sided bar with the orientation's image on the cap |
| The bar | `marker={false}` and no labels |
| Value absent | An empty track with no cap |
| Comparison value for this orientation | Passed to the bar |
| No comparison value for this orientation | The row is drawn without an overlay |
| A row or a badge pressed | Nothing happens |

A badge is an icon alone, or an icon with a short text. It never changes a row's position, colour or bar.

### Order

| Case | Behaviour |
|---|---|
| Entries | Sorted by value, highest first |
| Equal values | Keep the order they were given in |
| Entries without a value | Last, in the order they were given |
| Comparison present | The order does not change |

### Flat list

| Case | Behaviour |
|---|---|
| More entries than `visibleRows` | The top rows are shown, with a control under them that opens the rest |
| Opened | Every row is shown, and the control at the foot of the card closes the list again |
| As many entries as `visibleRows`, or fewer | Every row is shown and there is no control |

### Grouped list

| Case | Behaviour |
|---|---|
| A category | A heading with the category's name and its leading orientation, the leader's badge, the leader's bar, and a control that opens the category |
| The leader | The first row of the category's own ranking |
| Category where no entry has a value above zero | The heading says there is no result ("Brak wyniku"), the bar is an empty track, and the control still opens the category |
| The list of categories | In the order given, never sorted and never cut |
| A category opened | **The card shows that category alone**: its heading and leader, then the rest of its ranking in full, and a control at the foot that returns to the list of categories |

One category is open at a time, and the fold does not apply inside one.

### States

| State | Figma label |
|---|---|
| Flat, folded | "no categories - default" |
| Flat, open | "no categories - expanded" |
| Grouped | "group by category" |
| Category open | "group by category - selected" |

The module starts folded, or grouped with nothing open.

### Invalid and edge input

| Input | Behaviour |
|---|---|
| `visibleRows` below 1, or not a whole number | The default of 3 |
| Both `entries` and `categories` passed | The categories win |
| Category with no entries | Drawn as a category with no result, and with no control to open it |
| Category without a name | The heading shows the leader alone |
| Entry without an orientation name | The bar is drawn under an empty name |
| Name and badge longer than the row | The name is truncated first, complete for assistive technology; the badge keeps its text |
| Badge with a text but no icon, or an icon but no text | Drawn with what it has |
| The same orientation twice in one list | Drawn twice |
| Comparison value for an orientation not in the list | Ignored |
| No entries at all | An empty card under its title |

### Accessibility

- The rows are an ordered list, so the rank is announced and not only seen.
- A badge is announced with its row. An icon-only badge uses `label` as its text name.
- The open and close controls are buttons that say what they do and whether the list is open, and work from the keyboard.
- When a category opens or closes, focus moves to the control that replaces the one pressed. It is never lost.

# Copy

Polish is the source language, and every string is translatable. Each one below goes through a Lingui macro - `<Trans>` for JSX text, `t` or `msg` for attributes and ARIA text - with no hardcoded literals. After adding them run `yarn i18n:extract`, fill in the English entries in `src/locales/en/messages.po`, and commit both `.po` files. The wording is a proposal: adjust it if needed, but keep the meaning.

| Where | Polish (source) | English |
|---|---|---|
| Category heading, no result | Brak wyniku | No result |
| Control, open the flat list | Pokaż wszystkie | Show all |
| Control, close the flat list | Pokaż mniej | Show less |
| Control, open a category | Pokaż kategorię: {name} | Show category: {name} |
| Control, return to the categories | Wróć do kategorii | Back to categories |

# Athena components to use

- `ModuleWrapper` and `UniversalAxis` from `src/components/shared/` - do not rebuild either.
- **`Badge`** for the text badge, if it matches the small labelled badge in Figma. If it does not, say why in the PR.
- **`Button`** with `isIconButton` for the open and close controls, if it can match the chevron controls in Figma.
- No list, accordion or chart library.

# Out of scope

- Anything the bar draws - it is `UniversalAxis`.
- Deciding who gets a badge and what it says.
- Scoring, and choosing the categories.
- Saving what the taker opened.

# Files to create

```
src/components/results/modules/HorizontalBarChart/
├── HorizontalBarChart.tsx
├── HorizontalBarChart.test.tsx
├── HorizontalBarChart.types.ts
├── HorizontalBarChart.constants.ts   # DEFAULT_VISIBLE_ROWS
├── HorizontalBarChart.stories.tsx
└── utils/
    ├── sortRankedEntries.ts          # pure: stable sort, entries without a value last
    └── sortRankedEntries.test.ts

src/components/results/modules/RankedRow/
├── RankedRow.tsx
├── RankedRow.test.tsx
├── RankedRow.types.ts
└── RankedRow.stories.tsx
```

Split the grouped view into a subcomponent only if the main view gets hard to read. No empty files.

# Unit test cases (BDD)

```ts
describe('sortRankedEntries()', () => {
  it('sorts by value, highest first', ...);
  it('keeps the given order for equal values', ...);
  it('puts entries without a value last, in the given order', ...);
  it('treats a value that is not a number as absent', ...);
  it('does not mutate the input', ...);
});

describe('<RankedRow />', () => {
  it('renders the name and a one-sided bar with no marker and no labels', ...);
  it('renders an icon-only badge with its text name', ...);
  it('renders a badge with icon and text', ...);
  it('renders an empty track when the value is absent', ...);
  it('passes a comparison to the bar', ...);
  it('is not interactive', ...);
});

describe('<HorizontalBarChart />', () => {
  describe('given a flat list longer than visibleRows', () => {
    it('renders the top rows and an open control', ...);
    describe('when the control is pressed', () => {
      it('renders every row and a close control', ...);
    });
    describe('when the close control is pressed', () => {
      it('folds the list again', ...);
    });
  });
  describe('given a flat list no longer than visibleRows', () => {
    it('renders every row and no control', ...);
  });
  describe('given an invalid visibleRows', () => {
    it('falls back to 3', ...);
  });
  describe('given categories', () => {
    it('renders each category with its name, leader and the leader bar', ...);
    it('keeps the categories in the given order', ...);
    it('ignores entries when both are passed', ...);
    describe('when a category is opened', () => {
      it('renders that category alone, with its full ranking', ...);
      it('does not apply the fold inside it', ...);
      it('moves focus to the control that returns to the list', ...);
    });
    describe('when the return control is pressed', () => {
      it('renders the list of categories again', ...);
    });
  });
  describe('given a category with no value above zero', () => {
    it('says there is no result and renders an empty track', ...);
    it('can still be opened', ...);
  });
  describe('given a category with no entries', () => {
    it('renders it with no result and no control', ...);
  });
  describe('given a comparison', () => {
    it('passes each orientation value to its row', ...);
    it('renders rows without a comparison value with no overlay', ...);
    it('does not change the order', ...);
    it('ignores values for orientations not in the list', ...);
  });
  describe('given no entries', () => {
    it('renders an empty card under its title', ...);
  });
  describe('accessibility', () => {
    it('renders the rows as an ordered list', ...);
    it('says on each control whether the list is open', ...);
  });
});
```

# Storybook stories

**Figma, in the frame's order** - use `play()` to open a list where the state needs it
- `FlatFolded` - "no categories - default"
- `FlatOpen` - "no categories - expanded"
- `Grouped` - "group by category"
- `CategoryOpen` - "group by category - selected"

**Examples**
- `Candidates`, `CandidatesComparison`, `CandidatesOpen`, `CandidatesGrouped`, `CandidatesCategoryOpen`

**Edge**
- `NothingBehindTheFold`, `CustomVisibleRows`
- `CategoryWithoutResult`, `EmptyCategory`
- `EqualValues`, `MissingValues`
- `LongNames`, `Empty`

# Remember about standards

- Use the standard colors palette, never add colors directly (check https://tailwindcss.com/docs/colors and our color palette in the `src/index.css` file and in [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css))
- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Create a Storybook story for the component with all possible props variants of the component
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)
- Name the branch `feature/horizontal-bar-chart-69`, following [Conventional Branch](https://conventional-branch.github.io/) - never keep a generated or default branch name
- Copy is Polish by default and fully translatable: every literal string and every ARIA text goes through Lingui macros, and the English entries are filled in (see Copy). Names and values come from props
- The PR follows the repository's pull request template, with screenshots of the Figma stories next to the Figma frame

# Dependencies

- `UniversalAxis` - done ([#60](https://github.com/gi-org-pl/mypolitics-app/issues/60))
- `ModuleWrapper` - done ([#62](https://github.com/gi-org-pl/mypolitics-app/issues/62))

# Resources

- [Spec - Horizontal bar chart](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/horizontal-bar-chart.md) - every case, in full
- [Docs - Horizontal bar chart](https://github.com/gi-org-pl/product/blob/main/mypolitics/docs/modules/quiz/results/modules/horizontal-bar-chart.md) - why the module exists
- [Figma - Horizontal bar chart frame](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5500-1414) - [flat, folded](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5508-23690) | [flat, open](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5500-1273) | [grouped](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5500-1355) | [category open](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5500-1661) | [examples](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5508-23836)
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Storybook docs](https://storybook.js.org/docs/writing-stories)
- [Tailwind docs](https://tailwindcss.com/docs/)
- [Vitest docs](https://vitest.dev/guide/)

# Definition of Done

- [ ] Code follows folder structure (`docs/frontend/conventions/PROJECT_STRUCTURE.md`)
- [ ] Naming follows `docs/frontend/conventions/NAMING.md`
- [ ] Component layout follows `docs/frontend/conventions/COMPONENT_STRUCTURE.md`
- [ ] `RankedRow` is its own component, usable without `HorizontalBarChart`
- [ ] Sorting is a pure, stable util with its own tests; a badge and a comparison never move a row
- [ ] The flat list folds at `visibleRows` and opens to every row
- [ ] A category opens to show that category alone, in full, and returns to the list
- [ ] Open state is local `useState`, starts closed and is not saved
- [ ] Rows are an ordered list; controls are keyboard-operable and say whether the list is open; focus is never lost
- [ ] The body is made of `UniversalAxis` bars; nothing of the bar is re-implemented
- [ ] Invalid input degrades as in the table, without throwing
- [ ] Unit tests added, BDD style, coverage ≥95% on all new files
- [ ] Storybook stories added for all variants listed above
- [ ] Biome lint clean
- [ ] TypeScript clean (no `any`, no `@ts-ignore`)
- [ ] Every string from the Copy section goes through a Lingui macro, with Polish as the source; `yarn i18n:extract` run, English entries translated, `.po` files committed
- [ ] Branch named `feature/horizontal-bar-chart-69`
- [ ] CI green: build, lint, test
