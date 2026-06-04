# Story

As a user viewing my quiz results, I want each result axis shown as a single horizontal bar with two opposing sides — each with its own name, icon, colour and percentage — so I can read at a glance which side I lean toward and tap a side to learn more.

# Component properties

**Component:** `ResultsAxis`
**Location:** `src/components/results/ResultsAxis/`
**Shared:** no — domain component under `results`

Universal, presentational component — **no API calls, no context, no data fetching, no `survey`**. Everything comes in through props. The component must be **non-political / generic**: it knows only about "an axis with two sides", never about specific orientations (no `Progresywizm`, `survey.axis`, etc.).

```ts
export interface AxisSide {
  name: string;      // side label, e.g. "Left" / "Right" (caller supplies real names)
  iconUrl: string;   // SVG/img URL for this side's icon
  value: number;     // 0–100 raw weight for this side
  color: string;     // this side's brand colour (a palette token, see notes)
}

export type AxisSideKey = "left" | "right";

export interface ResultsAxisProps {
  id?: string;                              // optional DOM id / anchor target
  left: AxisSide;
  right: AxisSide;
  isHighlighted?: boolean;                  // default true — colored vs muted/greyed
  onSideClick?: (side: AxisSideKey) => void; // fired when a side is clicked
}
```

> The legacy `ResultsAxis` opened `ResultsAxisModal` / `ResultsAxisMoreInformationModal` reading from `survey`. **That is out of scope here.** This component is purely presentational and only emits `onSideClick(side)`; the parent (results page) owns any modal/data wiring.

# Layout (from the design image + legacy `ResultsAxis`)

One axis = one row, two stacked parts:

### Titles row
- Left side `name` aligned left, right side `name` aligned right, above the bar.

### Bar row
A single horizontal track split into a left segment and a right segment whose widths are the **normalized** percentages (see Behaviour). Each segment contains, from its outer edge inward:

- A circular **icon badge** (`iconUrl`) tinted with that side's `color`. Left badge sits at the far left, right badge at the far right (right one mirrored).
- A **percentage label** inside the segment, shown conditionally (see Behaviour).
- A **divider circle / knob** marking the boundary between the two segments, positioned at the split point and coloured by the dominant side.

Each segment (left half and right half of the bar, including its icon) is **independently clickable** and calls `onSideClick("left" | "right")`.

# Behaviour & edge cases

- **Normalization:** raw `left.value` + `right.value` may not sum to 100. Normalize them to fill the bar: `factor = 100 / (left.value + right.value)`. If the total is `0`, fall back to `50 / 50`. Reuse the legacy helper (port `normalizePercentages` into a tested util — see Files).
- **Dominant side:** the side with the higher raw value. Its percentage label is always shown. On a tie (both `50`), treat it as the **equal** state — balanced bar, no single dominant side.
- **Percentage label rounding:** display whole numbers — `Math.round`/`toFixed(0)`, so `70.4%` → `70%`. Labels are rendered as `"{n}%"`.
- **Boundary knob** sits at the normalized split (e.g. 70/30 → 70% across) and takes the dominant side's colour; in the equal state it sits centered.
- **`isHighlighted` (colored vs muted):**
  - `true` (default): icons and bar segments use each side's `color`.
  - `false`: render in a muted/greyed palette (the "not colored" rows in the design). Drive this from palette tokens, **not** ad-hoc opacity hacks.
- **Bar segment colour:** the design shows segments that are the side colour mixed toward black / partially transparent rather than the raw icon colour. Derive the segment fill from the side `color` token via the palette (e.g. a lighter/translucent variant) — do **not** invent hex values; pick palette tokens. Exact shade is the dev's call against Figma + `src/index.css`.
- **Keyboard / a11y:** clickable sides must be reachable and operable by keyboard (button semantics or `role`/`tabIndex` + key handler) with an accessible label per side (the side `name`). Icons get `alt={name}`.
- `onSideClick` is optional — when omitted, the sides render as non-interactive (no pointer cursor, not focusable as buttons).

# Athena components to use

- **`Avatar`** or **`Badge`** for the circular icon badge if the API fits (circular, colour-tinted, holds an image/icon). If neither cleanly supports a colour-tinted icon chip, render a small styled element with an `<img>` — but reach for Athena first.
- There is **no Athena component for the split dual-segment bar** (Athena `ProgressBar` is a single linear fill). Build the track with Tailwind + the two segments; do **not** pull in a charting/progress library.
- Decision: do not force-fit Athena `ProgressBar` here — document in the PR why a custom track was used over `ProgressBar`.

# Migration notes

- **Drop** `next/image` → Vite/React project: use Athena `Avatar`/`Badge` or a plain `<img>`.
- **Drop** all styled-components (`ResultsAxisStyle` and its `ResultsAxis*` styled exports) → restyle with Tailwind utilities + palette tokens. Analyze the legacy styles **only** for the layout/positioning math (segment widths, knob position, label visibility thresholds).
- **Drop** `survey`, `useTheme`, `Modal`, and the two modal children — out of scope; replaced by `onSideClick`.
- **Drop** the `nested` / `leftAxisCategory` / `rightAxisCategory` "group of axes" concept entirely — per the design, this is a **single** axis, not a group.
- **Rename** the prop shape from `leftOrientation`/`rightOrientation` (political) to generic `left`/`right` of type `AxisSide`.
- Keep `normalizePercentages` logic; move it into the component's `utils/` with a unit test.
- Do not decide exact Tailwind classes here — dev's call against the palette and Figma.

# Files to create

```
src/components/results/ResultsAxis/
├── ResultsAxis.tsx
├── ResultsAxis.test.tsx
├── ResultsAxis.types.ts          # AxisSide, AxisSideKey, ResultsAxisProps
├── ResultsAxis.stories.tsx
└── utils/
    ├── normalizePercentages.ts    # ported from legacy helpers.ts
    └── normalizePercentages.test.ts
```

> Keep component-scoped types/utils inside the folder per the component-structure convention. Only add a `constants` file if real shared constants emerge (e.g. the `25%` / `50%` label thresholds) — otherwise inline them.

# Unit test cases (BDD)

```ts
describe('<ResultsAxis />', () => {
  describe('given a left and right side', () => {
    it('renders both side names', ...);
    it('renders both side icons with alt set to each name', ...);
  });
  describe('given values that do not sum to 100', () => {
    it('normalizes segment widths to fill the bar', ...);
  });
  describe('given both values are 0', () => {
    it('falls back to a 50/50 split', ...);
  });
  describe('given a dominant side', () => {
    it('shows the dominant side rounded percentage label', ...);
    it('rounds fractional percentages to whole numbers', ...);
  });
  describe('given an equal 50/50 split', () => {
    it('renders the balanced/equal state', ...);
  });
  describe('given isHighlighted is false', () => {
    it('renders the muted (non-colored) variant', ...);
  });
  describe('given onSideClick', () => {
    it('calls onSideClick("left") when the left side is clicked', ...);
    it('calls onSideClick("right") when the right side is clicked', ...);
    it('is operable via keyboard', ...);
  });
  describe('given no onSideClick', () => {
    it('renders sides as non-interactive', ...);
  });
  describe('given an id', () => {
    it('applies the id to the root element', ...);
  });
});

describe('normalizePercentages', () => {
  describe('when the total is greater than 0', () => {
    it('scales both values so they sum to 100', ...);
  });
  describe('when the total is 0', () => {
    it('returns { left: 50, right: 50 }', ...);
  });
});
```

# Storybook stories

Mirror the states in the design image:

- `Default` — `left: 70`, `right: 20`, highlighted
- `StrongLean` — `left: 70`, `right: 10`, highlighted
- `Equal` — `left: 50`, `right: 50`, highlighted
- `FullOneSide` — `left: 0`, `right: 100`, highlighted
- `Muted` — `left: 70`, `right: 15`, `isHighlighted={false}`
- `FractionalPercent` — values that round (e.g. `left: 66.6`)
- `Clickable` — wires `onSideClick` (action logger) to show side clicks

# Remember about standards

- Use the standard colours palette, never add colours directly (check `src/index.css` and [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css)) — the "mixed with black / half-transparent" segment look must come from palette tokens, not raw hex/opacity
- Reach for Athena components (`Avatar`/`Badge`) before hand-rolling the icon chip
- Create unit tests with Vitest for 100% of the code (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Create Storybook stories for all variants listed above
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)
- All user-visible strings via Lingui macros (`<Trans>`, `` t`…` ``) — note: side `name`s and `"{n}%"` come from props/data, but any literal copy and ARIA labels must use macros
- Keep the component non-political: no `survey`, no orientation-specific names baked in

# Resources

- [Legacy ResultsAxis](https://github.com/gi-org-pl/mypolitics-app-legacy/tree/develop/frontend/src/components/Results/ResultsAxis) — analyze for layout/positioning math only; do **not** copy styled-components, `next/image`, or the modal/survey wiring
- [Figma project link](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=1190-9207&t=k6GtQ4k9HtLFKbnM-1)
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Storybook docs](https://storybook.js.org/docs/writing-stories)
- [Tailwind docs](https://tailwindcss.com/docs/)
- [Vitest docs](https://vitest.dev/guide/)

# Definition of Done

- [ ] Code follows folder structure (`docs/frontend/conventions/PROJECT_STRUCTURE.md`)
- [ ] Naming follows `docs/frontend/conventions/NAMING.md`
- [ ] Component layout follows `docs/frontend/conventions/COMPONENT_STRUCTURE.md`
- [ ] Single, generic, non-political axis — no `survey`, no orientation-specific names, no `nested`/group concept
- [ ] `left`/`right` sides independently clickable via `onSideClick`, keyboard-operable, with accessible labels
- [ ] Percentages normalized to fill the bar; `0/0` falls back to `50/50`; labels rounded to whole numbers
- [ ] `isHighlighted` toggles colored vs muted variant from palette tokens
- [ ] Unit tests added, BDD style, coverage ≥95% on all new files (incl. `normalizePercentages`)
- [ ] Storybook stories added for all variants listed above
- [ ] Biome lint clean
- [ ] TypeScript clean (no `any`, no `@ts-ignore`)
- [ ] No styled-components, no `next/image` — Tailwind + Athena + inline elements only; colours from palette tokens only
- [ ] Any literal copy / ARIA labels wrapped in Lingui macros; `yarn i18n:extract` run, `.po` files committed
- [ ] CI green: build, lint, test
