<img alt="Double axis chart - states and examples" src="https://raw.githubusercontent.com/gi-org-pl/product/main/mypolitics/assets/double-axis-chart.png" />

# Story

As a user reading my quiz result, I want two opposing orientations shown on one bar, with both poles named and the title telling me which side I landed on, so that I read the result as a trade-off rather than as a score.

# Component properties

**Component:** `DoubleAxisChart`
**Location:** `src/components/results/modules/DoubleAxisChart/`
**Shared:** no - a result module, in the `results` domain

A `ModuleWrapper` whose title names the leading side and whose body is one double-sided `UniversalAxis` with labels. **No state and no scoring.** This task also creates the **lead rule** as a shared util, because `MultiAxisChart` uses the same one.

```ts
// src/types/results.ts
export interface ResultEntry {
  orientation: AxisOrientation; // from UniversalAxis.types
  value?: number;               // 0-100; absent = no answers behind it
}

export interface DoubleAxisChartProps {
  start: ResultEntry;        // the pole on the left cap
  end: ResultEntry;          // the pole on the right cap
  marker?: number | false;   // default 50
  comparison?: AxisEntry;    // the other party, passed to the bar unchanged
  onStatsClick?: () => void;
  onInfoClick?: () => void;
}

// src/utils/results/getAxisLead.ts
export type AxisLead = 'start' | 'end' | null;
export const getAxisLead = (start?: number, end?: number): AxisLead => ...
```

`ResultEntry` belongs in `src/types/results.ts`. Create the file if it does not exist yet - other module tasks of this epic use the same type - and reuse it if it does.

# Behaviour

The [spec](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/double-axis-chart.md) is the source of truth for every case below; the [Figma frame](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5500-2387) is the source of truth for sizes, spacing, type, icons and colours.

### Lead

Decided on the values as the taker sees them - rounded to whole numbers - so the title can never contradict the bar.

| Case | Lead |
|---|---|
| One displayed value is higher | That side |
| Both displayed values are equal, including both zero | None - a tie |
| One value absent | The side that has a value, if it is above zero |
| Both values absent | None |

Values are clamped to 0-100 before they are compared. When the two exceed 100 together the bar scales them, but the lead still uses the values as given.

### Title

| Case | Behaviour |
|---|---|
| There is a lead | A chip with the leading orientation's icon and name, filled with its colour |
| Tie | A neutral chip naming both poles, start first, with no icon and no colour |
| Leading orientation without an image | The chip shows the name alone |

The title names the side the taker landed on, not the axis. The chip is never interactive.

### Bar

| Case | Behaviour |
|---|---|
| Both values present | `UniversalAxis` with `start` and `end` |
| Values that do not reach 100 together | Drawn as given; the gap stays in the middle. **Do not normalise** |
| One value absent | That side has no fill and no number; its cap and label still show |
| Both values absent | An empty double-sided track with both caps and labels |
| Comparison present | Passed to the bar unchanged |

`showLabels` is always on. Do not re-implement anything the bar does.

### Invalid and edge input

| Input | Behaviour |
|---|---|
| Value not a number | Treated as absent |
| Orientation name missing | Its label row stays reserved and empty. If it leads, the chip shows the image alone |
| Names longer than the room | Labels truncated by the bar, the title by the wrapper; complete for assistive technology |
| Orientation without a colour | The neutral fallback, on the chip and on the bar |
| Both poles are the same orientation | Drawn as given |

### Accessibility

- Pass `ariaLabel` to `ModuleWrapper`: the leading orientation's name, or both names on a tie.
- The lead is never carried by colour alone: the title says it in words.

One side absent is **not** the bar's one-sided mode: both caps and both labels must still show. Pass the entry to the bar with its value left out. `UniversalAxis` keeps the cap and label of such an entry once the fix task this one is blocked by has landed; do not work around it by passing 0.

# Copy

Polish is the source language, and every string is translatable. Each one below goes through a Lingui macro - `<Trans>` for JSX text, `t` or `msg` for attributes and ARIA text - with no hardcoded literals. After adding them run `yarn i18n:extract`, fill in the English entries in `src/locales/en/messages.po`, and commit both `.po` files. The wording is a proposal: adjust it if needed, but keep the meaning.

| Where | Polish (source) | English |
|---|---|---|
| Tie title and card name | {start} / {end} | {start} / {end} |

# Athena components to use

- `ModuleWrapper` and `UniversalAxis` from `src/components/shared/` - do not rebuild either.
- The title chip is `OrientationChip` in `src/components/results/modules/OrientationChip/`. **The `SingleAxisChart` task needs the same chip**: create it if it does not exist yet, reuse and extend it if it does. The tie title is its neutral look.
- Orientation colours are author-supplied data, not design tokens. Apply them at runtime through a CSS custom property, exactly as `UniversalAxis` does (approved in [mypolitics-app#61](https://github.com/gi-org-pl/mypolitics-app/pull/61#issuecomment-6007060837)), and accept only values that pass `SAFE_COLOR_PATTERN`. That check lives in `UniversalAxis.constants.ts` today: promote it to a shared place instead of copying it. Every other colour comes from the palette.

# Out of scope

- Anything the bar draws - it is `UniversalAxis`.
- The card frame and its two buttons - `ModuleWrapper`.
- Which orientations are paired, and checking that a pairing makes sense.
- Making a pair add up to a hundred.

# Files to create

```
src/components/results/modules/DoubleAxisChart/
├── DoubleAxisChart.tsx
├── DoubleAxisChart.test.tsx
├── DoubleAxisChart.types.ts
└── DoubleAxisChart.stories.tsx

src/components/results/modules/OrientationChip/        # only if it does not exist yet

src/utils/results/
├── getAxisLead.ts
└── getAxisLead.test.ts

src/types/results.ts          # ResultEntry - only if it does not exist yet
```

No empty files - add a constants file or a subcomponent only if the view needs one.

# Unit test cases (BDD)

```ts
describe('getAxisLead()', () => {
  describe('given one higher value', () => {
    it('returns that side', ...);
  });
  describe('given values that round to the same number', () => {
    it('returns null', ...);
  });
  describe('given both values at zero', () => {
    it('returns null', ...);
  });
  describe('given one absent value', () => {
    it('returns the other side when it is above zero', ...);
    it('returns null when the other side is zero', ...);
  });
  describe('given both values absent', () => {
    it('returns null', ...);
  });
  describe('given values outside 0-100', () => {
    it('compares the clamped values', ...);
  });
  describe('given a value that is not a number', () => {
    it('treats it as absent', ...);
  });
});

describe('<DoubleAxisChart />', () => {
  describe('given a lead', () => {
    it('renders a chip with the leading orientation, in its colour', ...);
    it('names the card after the leading orientation', ...);
  });
  describe('given a tie', () => {
    it('renders a neutral chip naming both poles, start first', ...);
    it('names the card after both poles', ...);
  });
  describe('given both values', () => {
    it('renders a double-sided bar with labels', ...);
    it('does not normalise values that do not reach 100', ...);
  });
  describe('given one absent value', () => {
    it('keeps that side cap and label, with no fill and no number', ...);
  });
  describe('given both values absent', () => {
    it('renders an empty double-sided track with both caps and labels', ...);
  });
  describe('given a comparison', () => {
    it('passes it to the bar', ...);
  });
  describe('given a leading orientation without an image', () => {
    it('renders the chip with the name alone', ...);
  });
  describe('given marker is false', () => {
    it('renders the bar without a marker', ...);
  });
  describe('given handlers', () => {
    it('passes onStatsClick and onInfoClick to the wrapper', ...);
  });
});
```

# Storybook stories

**Figma, in the frame's order**
- `Standard` - placeholder orientations, 69 / 31
- `Example` - 69 / 31
- `Comparison`

**Edge**
- `Tie` - 50 / 50, neutral title
- `NarrowLead` - 51 / 49
- `GapInTheMiddle` - 47 / 31
- `OneValueMissing`, `BothValuesMissing`
- `SmallSide` - one side too small to hold its number
- `CustomMarker`, `NoMarker`
- `LongNames`, `NoColor`, `NoImage`

# Remember about standards

- Use the standard colors palette, never add colors directly (check https://tailwindcss.com/docs/colors and our color palette in the `src/index.css` file and in [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css))
- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Create a Storybook story for the component with all possible props variants of the component
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)
- Name the branch `feature/double-axis-chart-66`, following [Conventional Branch](https://conventional-branch.github.io/) - never keep a generated or default branch name
- Copy is Polish by default and fully translatable: every literal string and every ARIA text goes through Lingui macros, and the English entries are filled in (see Copy). Names and values come from props
- The PR follows the repository's pull request template, with screenshots of the Figma stories next to the Figma frame

# Dependencies

- `UniversalAxis` - done ([#60](https://github.com/gi-org-pl/mypolitics-app/issues/60))
- `ModuleWrapper` - done ([#62](https://github.com/gi-org-pl/mypolitics-app/issues/62))
- **Blocked by `UniversalAxis: entry without a value`** (#73) - a side with no value must keep its cap and label, which the bar cannot draw before that fix

# Resources

- [Spec - Double axis chart](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/double-axis-chart.md) - every case, in full
- [Docs - Double axis chart](https://github.com/gi-org-pl/product/blob/main/mypolitics/docs/modules/quiz/results/modules/double-axis-chart.md) - why the module exists
- [Figma - Double axis chart frame](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5500-2387) - [standard](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5500-2400) | [example](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5507-12032) | [comparison](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5514-39086)
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Storybook docs](https://storybook.js.org/docs/writing-stories)
- [Tailwind docs](https://tailwindcss.com/docs/)
- [Vitest docs](https://vitest.dev/guide/)

# Definition of Done

- [ ] Code follows folder structure (`docs/frontend/conventions/PROJECT_STRUCTURE.md`)
- [ ] Naming follows `docs/frontend/conventions/NAMING.md`
- [ ] Component layout follows `docs/frontend/conventions/COMPONENT_STRUCTURE.md`
- [ ] The lead is decided on rounded values by `getAxisLead`, a pure util with its own tests
- [ ] A tie renders a neutral chip naming both poles
- [ ] The body is one double-sided `UniversalAxis` with labels; nothing of the bar is re-implemented
- [ ] Values are never normalised
- [ ] The author-supplied colour is applied only through a CSS custom property and validated
- [ ] `OrientationChip` exists once and is shared with `SingleAxisChart`
- [ ] Invalid input degrades as in the table, without throwing
- [ ] Unit tests added, BDD style, coverage ≥95% on all new files
- [ ] Storybook stories added for all variants listed above
- [ ] Biome lint clean
- [ ] TypeScript clean (no `any`, no `@ts-ignore`)
- [ ] Every string from the Copy section goes through a Lingui macro, with Polish as the source; `yarn i18n:extract` run, English entries translated, `.po` files committed
- [ ] Branch named `feature/double-axis-chart-66`
- [ ] CI green: build, lint, test
