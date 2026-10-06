<img alt="Multi axis chart - collapsed and open" src="https://raw.githubusercontent.com/gi-org-pl/product/main/mypolitics/assets/multi-axis-chart.png" />

# Story

As a user reading my quiz result, I want a whole model of axes shown in one card as a short list of groups, each telling me which side I came out on, and I want to open a group to see every axis inside it, so that dozens of axes stay readable instead of turning into a wall of charts.

# Component properties

**Component:** `MultiAxisChart`
**Location:** `src/components/results/modules/MultiAxisChart/`
**Shared:** no - a result module, in the `results` domain

A `ModuleWrapper` around a list of groups. Each group is drawn as one double-sided `UniversalAxis` and opens to show every axis it holds. It remembers which group is open; **no scoring**. This task also creates **`AxisRow`** as its own component, because the `NolanChart` module opens into the same rows.

```ts
export interface AxisPair {
  id: string;
  start: ResultEntry; // from src/types/results.ts
  end: ResultEntry;
}

export interface AxisGroup {
  name?: string;
  axes: AxisPair[]; // the first one is the headline axis
}

export interface AxisComparison {
  party: AxisOrientation;         // the other party
  values: Record<string, number>; // their value on each axis, by axis id
}

export interface MultiAxisChartProps {
  title?: string;
  groups: AxisGroup[];
  marker?: number | false;        // the same on every bar; default 50
  comparison?: AxisComparison;
  onStatsClick?: () => void;
  onInfoClick?: () => void;
}

// src/components/results/modules/AxisRow/
export interface AxisRowProps {
  name?: string;      // the axis or group name, drawn quiet
  leadName?: string;  // drawn strong after the name; absent on a tie
  start: ResultEntry;
  end: ResultEntry;
  marker?: number | false;
  showLabels?: boolean;
  comparison?: AxisEntry;
}
```

Which group is open is local state (`useState`). It is not saved anywhere.

# Behaviour

The [spec](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/multi-axis-chart.md) is the source of truth for every case below; the [Figma frame](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5500-2487) is the source of truth for sizes, spacing, type, icons and colours.

### Headline axis

The **first axis of a group is its headline axis**: the pair that summarises the group. It is the bar drawn while the group is closed, and its lead - from `getAxisLead` - gives the group its name. A narrower axis with a stronger result does **not** rename the group.

### Axis row

| Case | Behaviour |
|---|---|
| Heading, with a lead | The name, quiet, then the leading orientation's name, strong |
| Heading, on a tie | The name alone |
| Bar | Double-sided `UniversalAxis` with the marker, and with labels when `showLabels` is on |
| Comparison value for this axis | Passed to the bar |

### Closed group

| Case | Behaviour |
|---|---|
| A group | One axis row for its headline axis, with labels |
| Group with more than one axis | Under the bar, a preview of the orientations inside - icons of the start poles on one side, of the end poles on the other - and a control that opens the group |
| Group with one axis | No preview and no control |
| The list of groups | Every group, in the order given, never sorted |

### Open group

| Case | Behaviour |
|---|---|
| A group opened | **The card shows that group alone** |
| Its content | The group's heading and headline bar, then every other axis as a labelled bar with no heading of its own, in the order given |
| The marker | One line running through every bar of the group |
| Closing | A control at the foot of the card returns to the list of groups |

One group is open at a time. The continuous marker must sit exactly where each bar would draw its own, without measuring anything: no `getBoundingClientRect`, no `ResizeObserver`.

### Two slips in the Figma frame

- One "standard" row is headed "Orientation B" while A has 47 against 31. The heading follows the lead rule: it would name A.
- One open bar shows "0%". `UniversalAxis` hides a side too small to hold its number, and that rule wins.

### Invalid and edge input

| Input | Behaviour |
|---|---|
| Group with no axes | Not drawn |
| Group without a name | The heading shows the lead alone; on a tie there is no heading |
| Axis with one value absent | That side unfilled; the other side leads if it is above zero |
| Axis with both values absent | An empty double-sided track, and a tie |
| Orientation without an icon | Left out of the preview |
| More preview icons than fit | The row is cut at what fits |
| Names longer than the room | Truncated; complete for assistive technology |
| Comparison value for an axis not in the module | Ignored |
| No groups | An empty card under its title |

### Accessibility

- The groups are a list, and each group's heading is a heading.
- The preview icons are decorative.
- The open and close controls are buttons that name the group, say whether it is open, and work from the keyboard.
- When a group opens or closes, focus moves to the control that replaces the one pressed. It is never lost.
- The lead is never carried by colour alone: the heading says it in words.

# Copy

Polish is the source language, and every string is translatable. Each one below goes through a Lingui macro - `<Trans>` for JSX text, `t` or `msg` for attributes and ARIA text - with no hardcoded literals. After adding them run `yarn i18n:extract`, fill in the English entries in `src/locales/en/messages.po`, and commit both `.po` files. The wording is a proposal: adjust it if needed, but keep the meaning.

| Where | Polish (source) | English |
|---|---|---|
| Control, open a group | Pokaż grupę: {name} | Show group: {name} |
| Control, return to the groups | Wróć do grup | Back to groups |

# Athena components to use

- `ModuleWrapper` and `UniversalAxis` from `src/components/shared/` - do not rebuild either.
- `getAxisLead` and `ResultEntry` from the `DoubleAxisChart` task - do not write a second lead rule.
- **`Button`** with `isIconButton` for the open and close controls, if it can match the chevron controls in Figma.
- **`Avatar`** is not needed here: the preview icons are small plain images.
- No accordion or chart library.

# Out of scope

- Anything the bar draws - it is `UniversalAxis`.
- The lead rule - it is `getAxisLead`.
- Defining the groups and what belongs in each.
- Saving which group the taker opened.

# Files to create

```
src/components/results/modules/MultiAxisChart/
├── MultiAxisChart.tsx
├── MultiAxisChart.test.tsx
├── MultiAxisChart.types.ts
└── MultiAxisChart.stories.tsx

src/components/results/modules/AxisRow/
├── AxisRow.tsx
├── AxisRow.test.tsx
├── AxisRow.types.ts
└── AxisRow.stories.tsx
```

Split the closed group or the preview into a subcomponent only if the main view gets hard to read. No empty files.

# Unit test cases (BDD)

```ts
describe('<AxisRow />', () => {
  it('renders the name quiet and the lead name strong', ...);
  it('renders the name alone when there is no lead name', ...);
  it('renders no heading when there is neither', ...);
  it('renders a double-sided bar with the marker', ...);
  it('renders labels only when showLabels is on', ...);
  it('passes a comparison to the bar', ...);
});

describe('<MultiAxisChart />', () => {
  describe('given groups', () => {
    it('renders one row per group, in the given order', ...);
    it('draws the first axis of each group as its bar', ...);
    it('heads each group with its name and the headline axis lead', ...);
    it('does not rename a group after a stronger axis inside it', ...);
  });
  describe('given a group whose headline axis is a tie', () => {
    it('heads it with the group name alone', ...);
  });
  describe('given a group with more than one axis', () => {
    it('renders the preview icons, start poles on one side and end poles on the other', ...);
    it('renders a control that opens the group', ...);
    it('leaves an orientation without an icon out of the preview', ...);
  });
  describe('given a group with one axis', () => {
    it('renders no preview and no control', ...);
  });
  describe('when a group is opened', () => {
    it('renders that group alone', ...);
    it('renders every other axis as a labelled bar with no heading', ...);
    it('renders one marker line through the group', ...);
    it('moves focus to the control that returns to the list', ...);
  });
  describe('when the return control is pressed', () => {
    it('renders the list of groups again', ...);
  });
  describe('given a comparison', () => {
    it('passes each axis value to its bar, closed and open', ...);
    it('ignores values for axes not in the module', ...);
  });
  describe('given marker is false', () => {
    it('renders no marker on any bar and no line through an open group', ...);
  });
  describe('given a group with no axes', () => {
    it('does not render it', ...);
  });
  describe('given a group without a name', () => {
    it('heads it with the lead alone', ...);
  });
  describe('given no groups', () => {
    it('renders an empty card under its title', ...);
  });
  describe('accessibility', () => {
    it('renders the groups as a list with headings', ...);
    it('names the group on each control and says whether it is open', ...);
  });
});
```

# Storybook stories

**Figma, in the frame's order** - use `play()` to open a group where the state needs it
- `Standard`
- `GroupOpen`
- `Example`
- `ExampleGroupOpen`

**Edge**
- `SingleAxisGroup` - nothing to open
- `Tie` - a group with no winner
- `Comparison`, `ComparisonGroupOpen`
- `ManyPreviewIcons`, `LongNames`
- `MissingValues`, `NoMarker`, `NoGroups`

# Remember about standards

- Use the standard colors palette, never add colors directly (check https://tailwindcss.com/docs/colors and our color palette in the `src/index.css` file and in [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css))
- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Create a Storybook story for the component with all possible props variants of the component
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)
- Name the branch `feature/multi-axis-chart-70`, following [Conventional Branch](https://conventional-branch.github.io/) - never keep a generated or default branch name
- Copy is Polish by default and fully translatable: every literal string and every ARIA text goes through Lingui macros, and the English entries are filled in (see Copy). Names and values come from props
- The PR follows the repository's pull request template, with screenshots of the Figma stories next to the Figma frame

# Dependencies

- `UniversalAxis` - done ([#60](https://github.com/gi-org-pl/mypolitics-app/issues/60))
- `ModuleWrapper` - done ([#62](https://github.com/gi-org-pl/mypolitics-app/issues/62))
- **Blocked by `DoubleAxisChart`** (#66) - it creates `getAxisLead` and `ResultEntry`, which this module uses for every group

# Resources

- [Spec - Multi axis chart](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/multi-axis-chart.md) - every case, in full
- [Docs - Multi axis chart](https://github.com/gi-org-pl/product/blob/main/mypolitics/docs/modules/quiz/results/modules/multi-axis-chart.md) - why the module exists
- [Figma - Multi axis chart frame](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5500-2487) - [standard](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5507-11167) | [group open](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5507-11482) | [example](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5507-11683) | [example, group open](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5507-11900)
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Storybook docs](https://storybook.js.org/docs/writing-stories)
- [Tailwind docs](https://tailwindcss.com/docs/)
- [Vitest docs](https://vitest.dev/guide/)

# Definition of Done

- [ ] Code follows folder structure (`docs/frontend/conventions/PROJECT_STRUCTURE.md`)
- [ ] Naming follows `docs/frontend/conventions/NAMING.md`
- [ ] Component layout follows `docs/frontend/conventions/COMPONENT_STRUCTURE.md`
- [ ] `AxisRow` is its own component, usable without `MultiAxisChart`
- [ ] A group is named by its first axis's lead, through `getAxisLead`; there is no second lead rule
- [ ] A group with one axis has no preview and no control
- [ ] A group opens to show that group alone, with one marker line through its bars, and returns to the list
- [ ] Nothing is measured to place the continuous marker
- [ ] Open state is local `useState`, starts closed and is not saved
- [ ] Controls are keyboard-operable, name their group and say whether it is open; focus is never lost
- [ ] Invalid input degrades as in the table, without throwing
- [ ] Unit tests added, BDD style, coverage ≥95% on all new files
- [ ] Storybook stories added for all variants listed above
- [ ] Biome lint clean
- [ ] TypeScript clean (no `any`, no `@ts-ignore`)
- [ ] Every string from the Copy section goes through a Lingui macro, with Polish as the source; `yarn i18n:extract` run, English entries translated, `.po` files committed
- [ ] Branch named `feature/multi-axis-chart-70`
- [ ] CI green: build, lint, test
