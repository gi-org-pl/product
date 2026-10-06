# Story

As a user reading my quiz result, I want every score drawn with the same bar - an orientation's icon on its cap, a fill, the value, a reference marker and, when I compare, a hatched band showing where the other side stands - so that once I can read one bar I can read every module, checkpoint card and shared image in the product.

# Component properties

**Component:** `UniversalAxis`
**Location:** `src/components/shared/UniversalAxis/`
**Shared:** yes - composed by the result modules, the mid-quiz checkpoint cards and the generated result image

Purely presentational: **no scoring, no data access, no interaction, no state**. It draws whatever it is given and never normalises the values on its own.

```ts
export interface AxisOrientation {
  id: string;
  name: string;      // display name, author-written, no length limit
  imageUrl?: string; // icon, avatar or party logo
  color?: string;    // comes from quiz config or a user profile - untrusted data, not a design token
}

export interface AxisEntry {
  orientation: AxisOrientation;
  value: number; // share of the track, 0-100
}

export interface UniversalAxisProps {
  start?: AxisEntry;       // anchored to the left cap
  end?: AxisEntry;         // anchored to the right cap; its presence makes the bar double-sided
  comparison?: AxisEntry;  // the other party on the same track - exactly one, never a list
  marker?: number | false; // reference line position 0-100; default 50, false disables it
  showLabels?: boolean;    // orientation names under the caps; default false
}
```

An orientation is anything with points: an ideology, a party, a candidate, an archetype, a trait, and a friend in comparison mode (their avatar is the image). The component never distinguishes a person from an ideology.

# Behaviour

The [spec](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/universal-axis.md) is the source of truth for every case below; the [Figma frame](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5514-39733) is the source of truth for sizes, spacing, type and the hatching pattern.

### Modes

| Mode | Condition |
|---|---|
| Empty | Neither `start` nor `end` |
| One-sided | Exactly one of them, anchored to its own cap (an `end` alone fills from the right) |
| Double-sided | Both |

### Fill geometry

- Each fill starts at its own cap and extends by its value as a share of the track width.
- The remainder stays unfilled; on a double-sided bar whose values do not reach 100, the gap sits in the middle.
- A cap is rendered only for an entry that is present, and a fill never overlaps the opposite cap.

### Value label

| Case | Rendering |
|---|---|
| One-sided, value at or above the fit threshold | Value inside the fill |
| One-sided, value below the fit threshold | Value right after the fill, in the orientation colour against the track |
| One-sided, value is zero | No value |
| Double-sided, side at or above its fit threshold | Value inside that side's fill |
| Double-sided, side below its fit threshold | No value for that side; the other side still shows its own |
| Entry absent | No value |

- The fit thresholds are **fixed percentages, one per mode** - never measured from rendered text. Keep them in `UniversalAxis.constants.ts`: **10** for one-sided, **20** for double-sided (the Figma notes say "under 5/10%" and "greater than 20%"; tune the one-sided number against the widest realistic label and say in the PR which one you kept).
- Values are displayed rounded to whole numbers as `{n}%`. Layout always uses the exact value, so rounding never moves a fill.

### Marker

| Case | Rendering |
|---|---|
| Default | Line at 50 |
| `marker={n}` | Line at `n` |
| `marker={false}` | Not drawn |
| At 0 or 100 | Drawn at the edge, fully inside the track |

Drawn whether or not any entry is present.

### Comparison

Hatching exists only for comparison. The hatched band is exactly the span between the taker's value and the other party's value, and the other party's image sits at their position.

| Case | Rendering |
|---|---|
| Other is ahead | Band from the taker's value to theirs, continuing past the fill |
| Other is behind | Band from their value to the taker's, drawn over the fill |
| Values are equal | No band; the image alone marks the shared position |
| Taker has no entry | The whole track is hatched and only the other party's image is positioned |
| Other is at 0 or 100 | The image is clamped so it stays fully inside the track |
| Double-sided bar | The band is measured against the `start` entry on the same shared track |

One hatching pattern serves both directions - direction is conveyed by where the band sits, never by colour.

**Draw order:** fills, then marker, then band, then the other party's image, which is always topmost.

### Labels

- A label sits under the cap of the entry it names, on one line, truncated when it does not fit.
- When `showLabels` is on, the label row is reserved whether or not a name is present, so enabling labels never shifts a neighbouring bar.

### Invalid and edge input

Nothing here throws - quiz configuration is author-supplied and can be wrong, so a broken bar must degrade rather than take a result screen down.

| Input | Behaviour |
|---|---|
| Value below 0 or above 100 | Clamped into range |
| `start` + `end` values exceed 100 | Both fills scaled proportionally so they meet without overlapping |
| Value missing or not a number | Treated as an absent entry |
| Orientation without an image | Cap renders with colour only |
| Orientation without a colour | Falls back to a neutral palette colour |
| Name longer than the track | Truncated visually, preserved for assistive technology |

### Rendering contexts

The same component renders in the app, on checkpoint cards and inside the generated result image, at one size in all of them. There is **no compact variant**: the bar fills the width it is given and keeps its proportions. So nothing may depend on hover, viewport size, animation state, measured text or fonts that are not embedded.

### Accessibility

- Not interactive, no focusable elements.
- Announced as a **single image** whose description carries the orientation names, their values and the comparison value when present.
- Colour is never the only carrier of meaning: values are written, comparison uses a pattern, the marker is a shape.
- Value text must meet contrast against whatever it sits on - which is why a small value moves out of the fill instead of shrinking. The type size is the same everywhere.

### Performance

- A single screen can hold dozens of bars. No per-instance measurement work (`getBoundingClientRect`, `ResizeObserver`, text measuring) - layout is pure CSS driven by the values.
- The entry animation runs on first paint only and is disabled under `prefers-reduced-motion`.

# Athena components to use

- **`Avatar`** for the cap image and the comparison image if its API fits a small, colour-ringed circle holding an image. If it does not, render a plain `<img>` and say why in the PR.
- Do **not** use Athena's `ProgressBar` - it is a single linear fill and cannot carry two sides, caps, a marker or the comparison band. Build the track with Tailwind.
- No charting or progress library.

# Deviation from standards - needs Technical Leader approval

`orientation.color` is **data**, not a design token: it is written by quiz authors and arrives at runtime, so it cannot come from the palette. Apply it as a runtime value (inline style or CSS custom property) for the fill, the cap and the out-of-fill value text **only**. Everything else - track, marker, hatching, neutral fallback, label text - uses palette tokens as usual.

- [ ] Sub-task: obtain Technical Leader approval for applying author-supplied colours at runtime, and link it in the PR.

# Out of scope

- The modules that compose the bar (single axis, double axis, multi axis, horizontal bar chart, Nolan chart, archetype), the checkpoint cards and the result image.
- Scoring and normalisation - the caller passes final proportions.
- Group comparison - a screen comparing several people composes several bars.
- Click, hover and tooltip behaviour.

# Files to create

```
src/components/shared/UniversalAxis/
├── UniversalAxis.tsx
├── UniversalAxis.test.tsx
├── UniversalAxis.types.ts        # AxisOrientation, AxisEntry, UniversalAxisProps
├── UniversalAxis.constants.ts    # fit thresholds, default marker position
├── UniversalAxis.stories.tsx
└── utils/
    ├── getAxisLayout.ts          # pure: props in, clamped/scaled fills, label placement, band span out
    └── getAxisLayout.test.ts
```

Keep all the geometry in the pure util so the cases above are tested without rendering. Split out subcomponents (cap, band) only if the view gets hard to read - no empty files.

# Unit test cases (BDD)

```ts
describe('<UniversalAxis />', () => {
  describe('given no entries', () => {
    it('renders an empty track with no caps and no values', ...);
    it('still renders the marker', ...);
  });
  describe('given only a start entry', () => {
    it('renders one cap on the left and a fill from the left', ...);
  });
  describe('given only an end entry', () => {
    it('renders one cap on the right and a fill from the right', ...);
  });
  describe('given both entries', () => {
    it('renders both caps and both fills', ...);
  });
  describe('given showLabels', () => {
    it('renders each orientation name under its own cap', ...);
    it('reserves the label row when a name is missing', ...);
  });
  describe('given marker is false', () => {
    it('does not render the marker', ...);
  });
  describe('given a comparison', () => {
    it('renders the hatched band and the other party image', ...);
    it('renders no band when the values are equal', ...);
    it('hatches the whole track when the taker has no entry', ...);
  });
  describe('given an orientation without an image', () => {
    it('renders the cap with colour only', ...);
  });
  describe('given an orientation without a colour', () => {
    it('falls back to the neutral colour', ...);
  });
  describe('accessibility', () => {
    it('is exposed as a single image', ...);
    it('describes orientation names, values and the comparison value', ...);
    it('exposes no focusable elements', ...);
  });
});

describe('getAxisLayout()', () => {
  describe('one-sided', () => {
    it('places the value inside the fill at or above the threshold', ...);
    it('places the value after the fill below the threshold', ...);
    it('shows no value at zero', ...);
  });
  describe('double-sided', () => {
    it('shows a side value at or above its threshold', ...);
    it('hides only the side below its threshold', ...);
    it('leaves the gap in the middle when values do not reach 100', ...);
    it('scales both fills proportionally when values exceed 100', ...);
  });
  describe('values', () => {
    it('clamps values below 0 and above 100', ...);
    it('treats a missing or NaN value as an absent entry', ...);
    it('rounds the displayed value without moving the fill', ...);
  });
  describe('marker', () => {
    it('defaults to 50', ...);
    it('stays inside the track at 0 and 100', ...);
  });
  describe('comparison', () => {
    it('spans from the taker value to the other value when the other is ahead', ...);
    it('spans from the other value to the taker value when the other is behind', ...);
    it('clamps the image position at 0 and 100', ...);
    it('measures against the start entry on a double-sided bar', ...);
  });
});
```

# Storybook stories

Mirror the states in the Figma frame, in the same order:

**One-sided**
- `Empty` - no orientation
- `OneSidedSmallValue` - value under the threshold, written after the fill
- `OneSided` - 25, default marker
- `OneSidedWithLabel` - marker + label
- `OneSidedFromEnd` - an `end` entry alone
- `ComparisonAhead` - the other party is ahead
- `ComparisonBehind` - the other party is behind
- `ComparisonOnly` - the taker has no entry, whole track hatched

**Double-sided**
- `DoubleSidedEmpty` - zero on both sides
- `DoubleSided` - 69 / 31
- `DoubleSidedSmallSide` - one side under the threshold, its value hidden
- `DoubleSidedWithLabels` - marker + labels
- `DoubleSidedComparison`

**Edge**
- `CustomMarker`, `NoMarker`, `LongNames`, `NoImage`, `NoColor`, `OutOfRangeValues`

# Remember about standards

- Use the standard colors palette, never add colors directly (check https://tailwindcss.com/docs/colors and our color palette in the `src/index.css` file and in [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css)) - the only exception is the author-supplied orientation colour described above
- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Create a Storybook story for the component with all possible props variants of the component
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)
- The image description and any other literal copy go through Lingui macros; orientation names and values come from props
- The PR follows the repository's pull request template: Changes, How to test, Visual Preview (screenshots of the one-sided and double-sided stories next to the Figma frame), Checklist

# Resources

- [Spec - Universal axis](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/universal-axis.md) - every case, in full
- [Docs - Universal axis](https://github.com/gi-org-pl/product/blob/main/mypolitics/docs/modules/quiz/results/modules/universal-axis.md) - why the bar exists and what composes it
- [Figma - Universal Axis frame](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5514-39733) - [one-sided states](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5514-39736) | [double-sided states](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5514-40582)
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Storybook docs](https://storybook.js.org/docs/writing-stories)
- [Tailwind docs](https://tailwindcss.com/docs/)
- [Vitest docs](https://vitest.dev/guide/)

# Definition of Done

- [ ] Code follows folder structure (`docs/frontend/conventions/PROJECT_STRUCTURE.md`)
- [ ] Naming follows `docs/frontend/conventions/NAMING.md`
- [ ] Component layout follows `docs/frontend/conventions/COMPONENT_STRUCTURE.md`
- [ ] Empty, one-sided (from either cap) and double-sided modes render as in Figma
- [ ] Value label follows the fixed thresholds from `UniversalAxis.constants.ts`; nothing is measured from rendered text
- [ ] Marker defaults to 50, is configurable and can be disabled
- [ ] Comparison band, image position and draw order match the spec in all six cases
- [ ] Invalid input (out of range, over 100 in total, missing value, no image, no colour, long name) degrades without throwing
- [ ] Announced as a single described image; no focusable elements
- [ ] Entry animation runs once and is disabled under `prefers-reduced-motion`
- [ ] No hover-, viewport- or measurement-dependent rendering
- [ ] Technical Leader approval for runtime orientation colours linked in the PR; every other colour comes from the palette
- [ ] Unit tests added, BDD style, coverage ≥95% on all new files (incl. `getAxisLayout`)
- [ ] Storybook stories added for all variants listed above
- [ ] Biome lint clean
- [ ] TypeScript clean (no `any`, no `@ts-ignore`)
- [ ] Literal copy and ARIA text wrapped in Lingui macros; `yarn i18n:extract` run, `.po` files committed
- [ ] CI green: build, lint, test
