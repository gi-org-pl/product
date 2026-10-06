<img alt="Universal axis - one-sided and double-sided, with every state" src="https://raw.githubusercontent.com/gi-org-pl/product/main/mypolitics/assets/universal-axis.png" />

# Story

As a user reading my quiz result, I want an orientation the quiz knows about but has no answers for to still be shown on its bar - its icon on the cap and its name under it, with nothing filled - so that a missing score reads as an absence and not as a different chart.

# Component properties

**Component:** `UniversalAxis`
**Location:** `src/components/shared/UniversalAxis/` - it exists; this task changes it
**Shared:** yes

Today an entry whose value is missing is treated as if the entry were not passed at all: its cap disappears, and a double-sided bar with one unknown side collapses into a one-sided bar. The modules built on the bar need to tell two things apart:

- **No entry** - there is no orientation on that side.
- **An entry without a value** - the orientation is known, the score is not.

```ts
export interface AxisEntry {
  orientation: AxisOrientation;
  value?: number; // was required. Absent or not a number = the orientation is known, the score is not
}
```

Nothing else in the props changes, and every bar that passes a number renders exactly as before.

# Behaviour

The [spec](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/universal-axis.md) is the source of truth for every case below; the [Figma frame](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5514-39733) is the source of truth for sizes, spacing, type, icons and colours.

### Entry without a value

| Case | Behaviour |
|---|---|
| `start` or `end` passed with no value | The entry counts as present: its cap is drawn, and its label when labels are on. It has no fill and no number |
| The same, with a value that is not a number | The same |
| Double-sided bar, one entry without a value | Still double-sided: both caps and both labels. The other side is drawn as usual |
| Double-sided bar, both entries without a value | Both caps and both labels on an unfilled track |
| One-sided bar, its entry without a value | The cap on an unfilled track |
| No entry on a side | Unchanged: no cap for that side |
| Neither entry | Unchanged: the empty track |

An entry without a value draws exactly like an entry with a value of zero. The difference is only in what is announced.

### Mode

The mode follows which entries are **passed**, not which have values: no entries is empty, one is one-sided, two is double-sided.

### Comparison

| Case | Behaviour |
|---|---|
| The taker's entry has no value | As when the taker has no entry today: the whole track is hatched and only the other party's image is positioned |
| `comparison` passed with no value | Unchanged: no comparison is drawn |

### Accessibility

The image description names an entry without a value and says its value is missing, instead of leaving the orientation out or reading it as zero.

### What must not change

- Every existing story and test that passes numbers keeps its output.
- Clamping, scaling above 100, rounding, the fit thresholds, the marker and the draw order.
- No measuring, no animation, no new props.

# Copy

Polish is the source language, and every string is translatable. Each one below goes through a Lingui macro - `<Trans>` for JSX text, `t` or `msg` for attributes and ARIA text - with no hardcoded literals. After adding them run `yarn i18n:extract`, fill in the English entries in `src/locales/en/messages.po`, and commit both `.po` files. The wording is a proposal: adjust it if needed, but keep the meaning.

| Where | Polish (source) | English |
|---|---|---|
| Image description, an entry without a value | {name}: brak wyniku | {name}: no result |

# Athena components to use

- Nothing new. The change is inside `UniversalAxis` and its pure `utils/getAxisLayout.ts`.

# Out of scope

- The modules that will rely on this - they are separate tasks.
- Any other change to how the bar draws.

# Files to create

```
src/components/shared/UniversalAxis/
├── UniversalAxis.tsx               # changed only if the view needs it
├── UniversalAxis.test.tsx          # new cases
├── UniversalAxis.types.ts          # AxisEntry.value becomes optional
├── UniversalAxis.stories.tsx       # new stories
└── utils/
    ├── getAxisLayout.ts            # the change itself
    └── getAxisLayout.test.ts       # new cases
```

No new files. Keep the change in the pure util, where the existing cases already live.

# Unit test cases (BDD)

```ts
describe('getAxisLayout()', () => {
  describe('given a start entry without a value', () => {
    it('returns one-sided mode with the start side present', ...);
    it('gives that side no fill and a hidden value', ...);
  });
  describe('given both entries, one without a value', () => {
    it('returns double-sided mode', ...);
    it('keeps the side without a value, with no fill and a hidden value', ...);
    it('lays the other side out as usual', ...);
  });
  describe('given both entries without a value', () => {
    it('returns double-sided mode with both sides present and unfilled', ...);
  });
  describe('given a value that is not a number', () => {
    it('treats the entry as present and without a value', ...);
  });
  describe('given a comparison and a taker entry without a value', () => {
    it('hatches the whole track and positions only the other party image', ...);
  });
  describe('given a comparison without a value', () => {
    it('returns no comparison', ...);
  });
  describe('given entries with numbers', () => {
    it('returns the same layout as before for every existing case', ...);
  });
});

describe('<UniversalAxis />', () => {
  describe('given an entry without a value', () => {
    it('renders its cap', ...);
    it('renders its label when labels are on', ...);
    it('renders no fill and no number for it', ...);
    it('says in the description that its value is missing', ...);
  });
  describe('given a double-sided bar with one entry without a value', () => {
    it('renders both caps', ...);
  });
});
```

# Storybook stories

Add to the existing stories, next to the states they belong with:

- `OneSidedNoValue` - one entry, known orientation, no value
- `DoubleSidedOneNoValue` - one side without a value
- `DoubleSidedBothNoValue`
- `DoubleSidedOneNoValueWithLabels`
- `ComparisonTakerNoValue`

Every existing story stays as it is.

# Remember about standards

- Use the standard colors palette, never add colors directly (check https://tailwindcss.com/docs/colors and our color palette in the `src/index.css` file and in [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css))
- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Create a Storybook story for the component with all possible props variants of the component
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)
- Name the branch `bugfix/universal-axis-absent-value-73`, following [Conventional Branch](https://conventional-branch.github.io/) - never keep a generated or default branch name
- Copy is Polish by default and fully translatable: every literal string and every ARIA text goes through Lingui macros, and the English entries are filled in (see Copy). Names and values come from props
- The PR follows the repository's pull request template, with screenshots of the Figma stories next to the Figma frame

# Dependencies

- None. This task can start straight away.

# Resources

- [Spec - Universal axis](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/universal-axis.md) - every case, in full
- [Docs - Universal axis](https://github.com/gi-org-pl/product/blob/main/mypolitics/docs/modules/quiz/results/modules/universal-axis.md) - why the module exists
- [Figma - Universal axis frame](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5514-39733) - [one-sided states](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5514-39736) | [double-sided states](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5514-40582)
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Storybook docs](https://storybook.js.org/docs/writing-stories)
- [Tailwind docs](https://tailwindcss.com/docs/)
- [Vitest docs](https://vitest.dev/guide/)

# Definition of Done

- [ ] Code follows folder structure (`docs/frontend/conventions/PROJECT_STRUCTURE.md`)
- [ ] Naming follows `docs/frontend/conventions/NAMING.md`
- [ ] Component layout follows `docs/frontend/conventions/COMPONENT_STRUCTURE.md`
- [ ] `AxisEntry.value` is optional; an entry without a value keeps its cap and label and has no fill and no number
- [ ] The mode follows which entries are passed, not which have values
- [ ] Every existing test passes unchanged; no existing story changes its output
- [ ] The image description says an entry's value is missing
- [ ] The change lives in `getAxisLayout`; nothing is measured and no prop is added
- [ ] Invalid input degrades as in the table, without throwing
- [ ] Unit tests added, BDD style, coverage ≥95% on all new files
- [ ] Storybook stories added for all variants listed above
- [ ] Biome lint clean
- [ ] TypeScript clean (no `any`, no `@ts-ignore`)
- [ ] Every string from the Copy section goes through a Lingui macro, with Polish as the source; `yarn i18n:extract` run, English entries translated, `.po` files committed
- [ ] Branch named `bugfix/universal-axis-absent-value-73`
- [ ] CI green: build, lint, test
