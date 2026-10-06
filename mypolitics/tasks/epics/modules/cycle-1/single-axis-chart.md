<img alt="Single axis chart - states and examples" src="https://raw.githubusercontent.com/gi-org-pl/product/main/mypolitics/assets/single-axis-chart.png" />

# Story

As a user reading my quiz result, I want one orientation shown as one card - its name and icon in the title, and a single bar from zero to my score - so that I can read how strongly my answers lean that way without comparing it to anything else on the screen.

# Component properties

**Component:** `SingleAxisChart`
**Location:** `src/components/results/modules/SingleAxisChart/`
**Shared:** no - a result module, in the `results` domain

A `ModuleWrapper` whose title is the orientation and whose body is one one-sided `UniversalAxis`. **No state and no scoring**: it draws the value it is given.

```ts
export interface SingleAxisChartProps {
  orientation: AxisOrientation; // from UniversalAxis.types
  value?: number;               // 0-100; absent = the quiz has no answers behind this orientation
  marker?: number | false;      // default 50
  comparison?: AxisEntry;       // the other party, passed to the bar unchanged
  onStatsClick?: () => void;    // passed to ModuleWrapper
  onInfoClick?: () => void;     // passed to ModuleWrapper
}
```

# Behaviour

The [spec](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/single-axis-chart.md) is the source of truth for every case below; the [Figma frame](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5508-22154) is the source of truth for sizes, spacing, type, icons and colours.

### Title

The title is a chip with the orientation's icon and name, passed to `ModuleWrapper` as a component title.

| Case | Behaviour |
|---|---|
| Value at or above the marker position | Emphasised: the chip is filled with the orientation's colour |
| Value below the marker position | Quiet: the chip is outlined and its content muted |
| `marker={false}` | The emphasis line stays at 50 |
| Value absent | Quiet |
| Orientation without an image | The chip shows the name alone |

The chip is never interactive.

### Bar

| Case | Behaviour |
|---|---|
| Value present | `UniversalAxis` with a `start` entry only |
| Value is zero | The cap and an unfilled track, no number - `UniversalAxis` does this |
| Value absent | `UniversalAxis` with no entry: an empty track with no cap |
| Comparison present | Passed to the bar unchanged |

`showLabels` stays off: the title already names the orientation. Do not re-implement anything the bar does - value placement, rounding, clamping, the marker and the comparison band are all `UniversalAxis`.

### Invalid and edge input

| Input | Behaviour |
|---|---|
| Value outside 0-100 | Clamped by the bar. The title's emphasis uses the clamped value |
| Value not a number | Treated as absent |
| Name missing or empty | The chip shows the image alone. With neither, the wrapper gets no title |
| Name longer than the title slot | Truncated by the wrapper, complete for assistive technology |
| Orientation without a colour | The neutral fallback, on the chip and on the bar |
| Marker outside 0-100 | Clamped; the emphasis line moves with it |

### Accessibility

- Pass the orientation's name to `ModuleWrapper` as `ariaLabel`, since the title is a component.
- Emphasis is never the only signal: the number on the bar says the same thing.

# Copy

This task adds no literal copy of its own: every name and value it shows comes from props. If you do add a string, including an ARIA text, it follows the same rule as everywhere in the app - Polish source, through a Lingui macro, with the English entry filled in.

# Athena components to use

- `ModuleWrapper` and `UniversalAxis` from `src/components/shared/` - do not rebuild either.
- No Athena component fits the title chip. Build `OrientationChip` in `src/components/results/modules/OrientationChip/` with three looks: emphasised, quiet and neutral. **The `DoubleAxisChart` task needs the same chip**: create it if it does not exist yet, reuse and extend it if it does.
- Orientation colours are author-supplied data, not design tokens. Apply them at runtime through a CSS custom property, exactly as `UniversalAxis` does (approved in [mypolitics-app#61](https://github.com/gi-org-pl/mypolitics-app/pull/61#issuecomment-6007060837)), and accept only values that pass `SAFE_COLOR_PATTERN`. That check lives in `UniversalAxis.constants.ts` today: promote it to a shared place instead of copying it. Every other colour comes from the palette.

# Out of scope

- Anything the bar draws - it is `UniversalAxis`.
- The card frame and its two buttons - `ModuleWrapper`.
- Deciding which orientation the module shows, and hiding the module.

# Files to create

```
src/components/results/modules/SingleAxisChart/
├── SingleAxisChart.tsx
├── SingleAxisChart.test.tsx
├── SingleAxisChart.types.ts
└── SingleAxisChart.stories.tsx

src/components/results/modules/OrientationChip/        # only if it does not exist yet
├── OrientationChip.tsx
├── OrientationChip.test.tsx
├── OrientationChip.types.ts
└── OrientationChip.stories.tsx
```

No empty files - add a constants file or a subcomponent only if the view needs one.

# Unit test cases (BDD)

```ts
describe('<SingleAxisChart />', () => {
  describe('given a value at or above the marker', () => {
    it('renders the title chip emphasised', ...);
  });
  describe('given a value below the marker', () => {
    it('renders the title chip quiet', ...);
  });
  describe('given marker is false', () => {
    it('keeps the emphasis line at 50', ...);
    it('renders the bar without a marker', ...);
  });
  describe('given a custom marker', () => {
    it('moves the emphasis line with it', ...);
  });
  describe('given a value', () => {
    it('renders a one-sided bar from the start cap', ...);
    it('renders the bar without labels', ...);
  });
  describe('given no value', () => {
    it('renders an empty track and a quiet title', ...);
  });
  describe('given a value that is not a number', () => {
    it('treats it as absent', ...);
  });
  describe('given a value outside 0-100', () => {
    it('uses the clamped value for the title emphasis', ...);
  });
  describe('given a comparison', () => {
    it('passes it to the bar', ...);
  });
  describe('given an orientation without an image', () => {
    it('renders the chip with the name alone', ...);
  });
  describe('given an orientation without a name', () => {
    it('renders the chip with the image alone', ...);
    it('passes no title when there is no image either', ...);
  });
  describe('given handlers', () => {
    it('passes onStatsClick and onInfoClick to the wrapper', ...);
  });
  describe('accessibility', () => {
    it('names the card after the orientation', ...);
  });
});
```

# Storybook stories

**Figma, in the frame's order**
- `Standard` - placeholder orientation at 40, quiet title
- `ExampleQuiet` - 40, below the marker
- `ExampleEmphasised` - 69, above the marker
- `Comparison`

**Edge**
- `ZeroValue`, `NoValue`
- `NoMarker`, `CustomMarker`
- `NoImage`, `NoColor`, `LongName`

# Remember about standards

- Use the standard colors palette, never add colors directly (check https://tailwindcss.com/docs/colors and our color palette in the `src/index.css` file and in [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css))
- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Create a Storybook story for the component with all possible props variants of the component
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)
- Name the branch `feature/single-axis-chart-65`, following [Conventional Branch](https://conventional-branch.github.io/) - never keep a generated or default branch name
- Copy is Polish by default and fully translatable: every literal string and every ARIA text goes through Lingui macros, and the English entries are filled in (see Copy). Names and values come from props
- The PR follows the repository's pull request template, with screenshots of the Figma stories next to the Figma frame

# Dependencies

- `UniversalAxis` - done ([#60](https://github.com/gi-org-pl/mypolitics-app/issues/60))
- `ModuleWrapper` - done ([#62](https://github.com/gi-org-pl/mypolitics-app/issues/62))

# Resources

- [Spec - Single axis chart](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/single-axis-chart.md) - every case, in full
- [Docs - Single axis chart](https://github.com/gi-org-pl/product/blob/main/mypolitics/docs/modules/quiz/results/modules/single-axis-chart.md) - why the module exists
- [Figma - Single axis chart frame](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5508-22154) - [standard](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5508-22299) | [example, below the marker](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5508-22161) | [example, above the marker](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5508-22269) | [comparison](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5514-39163)
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Storybook docs](https://storybook.js.org/docs/writing-stories)
- [Tailwind docs](https://tailwindcss.com/docs/)
- [Vitest docs](https://vitest.dev/guide/)

# Definition of Done

- [ ] Code follows folder structure (`docs/frontend/conventions/PROJECT_STRUCTURE.md`)
- [ ] Naming follows `docs/frontend/conventions/NAMING.md`
- [ ] Component layout follows `docs/frontend/conventions/COMPONENT_STRUCTURE.md`
- [ ] The title chip is emphasised at or above the marker position and quiet below it
- [ ] The body is one one-sided `UniversalAxis`; nothing of the bar is re-implemented
- [ ] No value renders an empty track, not an error and not a missing card
- [ ] The author-supplied colour is applied only through a CSS custom property and validated
- [ ] `OrientationChip` exists once and is shared with `DoubleAxisChart`
- [ ] Invalid input degrades as in the table, without throwing
- [ ] Unit tests added, BDD style, coverage ≥95% on all new files
- [ ] Storybook stories added for all variants listed above
- [ ] Biome lint clean
- [ ] TypeScript clean (no `any`, no `@ts-ignore`)
- [ ] Every string from the Copy section goes through a Lingui macro, with Polish as the source; `yarn i18n:extract` run, English entries translated, `.po` files committed
- [ ] Branch named `feature/single-axis-chart-65`
- [ ] CI green: build, lint, test
