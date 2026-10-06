<img alt="Nolan chart - the compass, its levels and the maths behind them" src="https://raw.githubusercontent.com/gi-org-pl/product/main/mypolitics/assets/nolan-chart.png" />

# Story

As a user reading my quiz result, I want to see where my two scores put me on a map of four quadrants, with the title telling me which quadrant I am in and how far out, and I want to open the card to check the map against the two axes it was built from.

# Component properties

**Component:** `NolanChart`
**Location:** `src/components/results/modules/NolanChart/`
**Shared:** no - a result module, in the `results` domain

A `ModuleWrapper` around a square map with a dot at the taker's position. It turns two pairs of values into a position and a level, and remembers whether it is open; **no scoring**.

```ts
export interface NolanLevelNames {
  moderate?: string; // a complete phrase, e.g. "Umiarkowana zielona"
  extreme?: string;  // a complete phrase, e.g. "Skrajna zielona"
}

export interface NolanPole {
  entry: ResultEntry;      // from src/types/results.ts; the orientation's imageUrl is the cap icon
  names?: NolanLevelNames; // what a lean toward this pole is called
}

export interface NolanAxis {
  name: string;
  start: NolanPole; // at -1: left on the horizontal axis, bottom on the vertical
  end: NolanPole;   // at 1: right on the horizontal axis, top on the vertical
}

export interface NolanQuadrant {
  color?: string;          // author-supplied
  names?: NolanLevelNames;
}

export interface NolanComparison {
  party: AxisOrientation;
  horizontal: { start?: number; end?: number };
  vertical: { start?: number; end?: number };
}

export interface NolanChartProps {
  horizontal: NolanAxis;
  vertical: NolanAxis;
  quadrants: {
    topLeft: NolanQuadrant;
    topRight: NolanQuadrant;
    bottomLeft: NolanQuadrant;
    bottomRight: NolanQuadrant;
  };
  centreName?: string;
  comparison?: NolanComparison;
  onStatsClick?: () => void;
  onInfoClick?: () => void;
}
```

**Never build a name out of a level and a noun.** Every name is a complete phrase from the author, because in Polish the two halves have to agree. Figma itself shows both "Umiarkowana zielona" and "Umiarkowany zielony".

Whether the card is open is local state (`useState`). It is not saved anywhere.

# Behaviour

The [spec](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/nolan-chart.md) is the source of truth for every case below; the [Figma frame](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5508-25681) is the source of truth for sizes, spacing, type, icons and colours.

### Position

Each axis becomes one coordinate between -1 and 1:

```
coordinate = (end value - start value) / 100
```

Values are clamped to 0-100 first. Coordinates are computed from the exact values and shown rounded to two decimals.

### Level

For the whole position, with `r = √(x² + y²)`:

| Level | Condition |
|---|---|
| Centre | `r` below `√2 / 3` (about 0.47) |
| Moderate | `r` from `√2 / 3`, below 1 |
| Extreme | `r` of 1 and above |

Along a single axis, on the coordinate alone:

| Level | Condition |
|---|---|
| Centre | Nearer to zero than 1/3 |
| Moderate | From 1/3, short of 1 |
| Extreme | Exactly at the pole, 1 or -1 |

The quadrant is given by the signs of the two coordinates. A coordinate of exactly zero counts toward the end pole. The thresholds are constants, the same for every quiz.

### Title

Passed to `ModuleWrapper` as a component title.

| Case | Behaviour |
|---|---|
| Centre | The centre name, in the plain title style, with no colour |
| Moderate | The quadrant's moderate name, as coloured text on a pale tint of the quadrant's colour |
| Extreme | The quadrant's extreme name, on the quadrant's colour at full strength |
| No position | The "no result" wording (see Copy), in the plain title style |

### Map

| Case | Behaviour |
|---|---|
| Always | A square of four quadrants, each in a pale tint of its colour |
| Moderate or extreme | The taker's quadrant is filled with its colour at full strength |
| Centre | No quadrant is filled |
| The taker | A dot with a halo at the position |
| Dot at an edge or a corner | Its centre is placed exactly; whatever falls outside the map is cut off |
| No position | No dot and no filled quadrant |

Each axis is named beside the map with its coordinate: the horizontal axis under the map, the vertical axis along its side. The map is always square.

### Opened

| Case | Behaviour |
|---|---|
| Closed | A control at the foot of the card opens it |
| Opened | Two `AxisRow`s appear under the map, horizontal axis first, and the control at the foot closes the card |
| A row's heading | The axis's name, then the pole name for the taker's level along that axis |
| A row's heading at the centre level | The axis's name alone |
| A row's bar | Double-sided, with the marker and no labels. The caps carry the poles' icons |
| A row's colours | The side the taker leans to takes the quadrant's colour; the other side is neutral |

### Comparison

| Case | Behaviour |
|---|---|
| Comparison present | The other party's image is drawn at their position, on a hatched disc |
| Their quadrant | Never filled |
| Their position at an edge or a corner | Moved inward so the image stays fully on the map |
| Both at the same position | The other party's image is drawn on top; the taker's halo stays visible around it |
| The other party has no position | No second marker |
| Opened | Both rows carry the comparison band |

The comparison value passed to each row's bar is the other party's value for the **start** pole, since the bar measures the band against its start entry.

### No position is not the centre

An axis with either value absent means the quiz could not place the taker: no dot, no filled quadrant, and "Brak wyniku". The centre is only for a taker who was placed there.

### Invalid and edge input

| Input | Behaviour |
|---|---|
| An axis with either value absent or not a number | No position |
| A pair that does not add up to 100 | The coordinate is still the difference over 100 |
| Quadrant name missing for the taker's level | The quadrant's other name, and failing that the centre name |
| Centre name missing | No title; the wrapper draws its header without one |
| Pole name missing | The row's heading shows the axis's name alone |
| Quadrant without a colour | The neutral fallback: tint, fill and title |
| Axis name or title longer than the room | Truncated; complete for assistive technology |
| Other party without an image | A neutral placeholder on the hatched disc |

### Accessibility

- The map is announced as a single image. Its description carries the quadrant name and level, both axis names with their coordinates, and the other party's quadrant when there is a comparison.
- The level is never carried by colour alone: the title says it in words.
- The open and close control is a button that says what it does and whether the card is open, and works from the keyboard.
- Pass the title text to `ModuleWrapper` as `ariaLabel`.

# Copy

Polish is the source language, and every string is translatable. Each one below goes through a Lingui macro - `<Trans>` for JSX text, `t` or `msg` for attributes and ARIA text - with no hardcoded literals. After adding them run `yarn i18n:extract`, fill in the English entries in `src/locales/en/messages.po`, and commit both `.po` files. The wording is a proposal: adjust it if needed, but keep the meaning.

| Where | Polish (source) | English |
|---|---|---|
| Title, no position | Brak wyniku | No result |
| Control, open | Pokaż osie | Show axes |
| Control, close | Ukryj osie | Hide axes |
| Map description | {title}. {xAxis}: {x}, {yAxis}: {y} | {title}. {xAxis}: {x}, {yAxis}: {y} |
| Map description, the other party | {name}: {quadrant} | {name}: {quadrant} |

# Athena components to use

- `ModuleWrapper` and `UniversalAxis` from `src/components/shared/`, and `AxisRow` from the `MultiAxisChart` task - do not rebuild any of them.
- **`Avatar`** for the other party's image on the map.
- **`Button`** with `isIconButton` for the open and close control, if it can match the chevron control in Figma.
- The map has no Athena equivalent. Build it with plain elements or SVG and Tailwind; **no charting library**.
- The hatched disc uses the same hatching as `UniversalAxis`. Reuse it; do not draw a second pattern.
- Orientation colours are author-supplied data, not design tokens. Apply them at runtime through a CSS custom property, exactly as `UniversalAxis` does (approved in [mypolitics-app#61](https://github.com/gi-org-pl/mypolitics-app/pull/61#issuecomment-6007060837)), and accept only values that pass `SAFE_COLOR_PATTERN`. That check lives in `UniversalAxis.constants.ts` today: promote it to a shared place instead of copying it. Every other colour comes from the palette. The quadrant colours are the author-supplied colours here.

# Out of scope

- Anything the bar draws - it is `UniversalAxis`.
- Scoring, and choosing which two axes are crossed.
- Naming the quadrants and poles - the names arrive as props.
- More than one other party on the map.
- Saving whether the card is open.

# Files to create

```
src/components/results/modules/NolanChart/
├── NolanChart.tsx
├── NolanChart.test.tsx
├── NolanChart.types.ts
├── NolanChart.constants.ts       # the level thresholds
├── NolanChart.stories.tsx
└── utils/
    ├── getNolanPosition.ts       # pure: two pairs in; coordinates, r, level and quadrant out, or null
    ├── getNolanPosition.test.ts
    ├── getAxisLevel.ts           # pure: one coordinate in, its level and the pole it leans to out
    └── getAxisLevel.test.ts
```

Keep all the maths in the pure utils so every threshold is tested without rendering. Split the map into a subcomponent if the view gets hard to read. No empty files.

# Unit test cases (BDD)

```ts
describe('getNolanPosition()', () => {
  describe('coordinates', () => {
    it('returns (end - start) / 100 for each axis', ...);
    it('clamps values to 0-100 first', ...);
    it('uses the difference even when a pair does not add up to 100', ...);
    it('returns null when either value of an axis is absent or not a number', ...);
  });
  describe('level', () => {
    it('returns centre below √2/3', ...);
    it('returns moderate at √2/3', ...);
    it('returns moderate just below 1', ...);
    it('returns extreme at 1', ...);
    it('returns extreme at a corner', ...);
  });
  describe('quadrant', () => {
    it('returns each of the four quadrants from the signs', ...);
    it('counts a coordinate of zero toward the end pole', ...);
  });
});

describe('getAxisLevel()', () => {
  it('returns centre nearer to zero than 1/3', ...);
  it('returns moderate at 1/3', ...);
  it('returns moderate just short of 1', ...);
  it('returns extreme at 1 and at -1', ...);
  it('returns the pole the coordinate leans to', ...);
});

describe('<NolanChart />', () => {
  describe('given a centre position', () => {
    it('renders the centre name in the plain title style', ...);
    it('fills no quadrant', ...);
  });
  describe('given a moderate position', () => {
    it('renders the quadrant moderate name on a pale tint', ...);
    it('fills the taker quadrant', ...);
  });
  describe('given an extreme position', () => {
    it('renders the quadrant extreme name on the full colour', ...);
  });
  describe('given no position', () => {
    it('renders the no result wording, no dot and no filled quadrant', ...);
  });
  describe('map', () => {
    it('renders the dot at the position', ...);
    it('names both axes with their coordinates rounded to two decimals', ...);
    it('is announced as a single described image', ...);
  });
  describe('when the card is opened', () => {
    it('renders two axis rows, horizontal first', ...);
    it('heads each row with the axis name and the pole name for its level', ...);
    it('heads a row at the centre level with the axis name alone', ...);
    it('colours the side the taker leans to with the quadrant colour', ...);
    it('renders the rows without labels', ...);
  });
  describe('when the card is closed again', () => {
    it('renders no axis rows', ...);
  });
  describe('given a comparison', () => {
    it('renders the other party at their position, on a hatched disc', ...);
    it('never fills the other party quadrant', ...);
    it('moves the other party inward at a corner', ...);
    it('renders no second marker when the other party has no position', ...);
    it('passes the comparison to both rows when opened', ...);
    it('includes the other party quadrant in the map description', ...);
  });
  describe('given missing names', () => {
    it('falls back to the quadrant other name, then to the centre name', ...);
    it('heads a row with the axis name alone when the pole name is missing', ...);
  });
  describe('given a quadrant without a colour', () => {
    it('uses the neutral fallback', ...);
  });
  describe('accessibility', () => {
    it('says on the control whether the card is open', ...);
  });
});
```

# Storybook stories

**Figma, in the frame's order** - use `play()` to open the card where the state needs it
- `Standard` - placeholders
- `Centre`
- `Moderate`
- `ModerateOpen`
- `ExtremeOpen`
- `Comparison`

**Edge**
- `NoPosition`
- `OnAnAxis` - one coordinate at zero
- `Corner` - the dot cut off by the map's edge
- `ComparisonAtCorner`, `ComparisonSamePosition`, `ComparisonWithoutPosition`
- `MissingNames`, `NoQuadrantColor`, `LongNames`

# Remember about standards

- Use the standard colors palette, never add colors directly (check https://tailwindcss.com/docs/colors and our color palette in the `src/index.css` file and in [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css))
- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Create a Storybook story for the component with all possible props variants of the component
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)
- Name the branch `feature/nolan-chart-72`, following [Conventional Branch](https://conventional-branch.github.io/) - never keep a generated or default branch name
- Copy is Polish by default and fully translatable: every literal string and every ARIA text goes through Lingui macros, and the English entries are filled in (see Copy). Names and values come from props
- The PR follows the repository's pull request template, with screenshots of the Figma stories next to the Figma frame

# Dependencies

- `UniversalAxis` - done ([#60](https://github.com/gi-org-pl/mypolitics-app/issues/60))
- `ModuleWrapper` - done ([#62](https://github.com/gi-org-pl/mypolitics-app/issues/62))
- **Blocked by `MultiAxisChart`** (#70) - it creates `AxisRow`, which this module opens into

# Resources

- [Spec - Nolan chart](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/nolan-chart.md) - every case, in full
- [Docs - Nolan chart](https://github.com/gi-org-pl/product/blob/main/mypolitics/docs/modules/quiz/results/modules/nolan-chart.md) - why the module exists
- [Figma - Nolan chart frame](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5508-25681) - [standard](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5513-28142) | [centre](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5513-26955) | [moderate](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5508-25999) | [moderate, open](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5509-26520) | [extreme, open](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5509-26202) | [comparison](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5514-40357) | [the maths](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5513-27284)
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Storybook docs](https://storybook.js.org/docs/writing-stories)
- [Tailwind docs](https://tailwindcss.com/docs/)
- [Vitest docs](https://vitest.dev/guide/)

# Definition of Done

- [ ] Code follows folder structure (`docs/frontend/conventions/PROJECT_STRUCTURE.md`)
- [ ] Naming follows `docs/frontend/conventions/NAMING.md`
- [ ] Component layout follows `docs/frontend/conventions/COMPONENT_STRUCTURE.md`
- [ ] All the maths lives in `getNolanPosition` and `getAxisLevel`, with every threshold tested at its boundary
- [ ] The thresholds are constants in `NolanChart.constants.ts`
- [ ] Names are never composed from a level and a noun
- [ ] No position renders "Brak wyniku" and no dot - it is never drawn as the centre
- [ ] The taker's dot is placed exactly and cut by the map's edge; the other party's image is kept fully on the map
- [ ] The card opens into two `AxisRow`s; there is no second row component
- [ ] The map is one described image; no charting library
- [ ] The author-supplied quadrant colour is applied only through a CSS custom property and validated
- [ ] Open state is local `useState`, starts closed and is not saved
- [ ] Invalid input degrades as in the table, without throwing
- [ ] Unit tests added, BDD style, coverage ≥95% on all new files
- [ ] Storybook stories added for all variants listed above
- [ ] Biome lint clean
- [ ] TypeScript clean (no `any`, no `@ts-ignore`)
- [ ] Every string from the Copy section goes through a Lingui macro, with Polish as the source; `yarn i18n:extract` run, English entries translated, `.po` files committed
- [ ] Branch named `feature/nolan-chart-72`
- [ ] CI green: build, lint, test
