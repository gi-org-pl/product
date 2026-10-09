<img alt="Nolan chart path: two or three quadrants" src="https://raw.githubusercontent.com/gi-org-pl/product/main/mypolitics/assets/nolan-chart-path-checkpoint-2-3.png" /> <img alt="Nolan chart path: four quadrants" src="https://raw.githubusercontent.com/gi-org-pl/product/main/mypolitics/assets/nolan-chart-path-checkpoint-4.png" /> <img alt="Nolan chart path: four quadrants, second path" src="https://raw.githubusercontent.com/gi-org-pl/product/main/mypolitics/assets/nolan-chart-path-checkpoint-4-second-path.png" />

# Story

As a user taking a quiz that has a compass, I want a card between two questions to show me the route my position has travelled across the compass so far and how many of its quadrants I have been through, so that I see my answers moving me before the result does.

# Component properties

This task builds three things, in one pull request:

1. **`CompassMap`** - the square map of the result's Nolan chart (quadrants, the filled quadrant, the taker's dot, the other side of a comparison), promoted out of `NolanChart` so that a second parent can draw it.
2. **The trail** - the one thing the map cannot draw today: a dotted line through a list of positions.
3. **`SurveyCheckpointNolanPath`** - the card, and its entry in the card registry.

Nothing is added to the engine. When the card fires, which version it is and which part of the route it draws are decided in `survey-checkpoint-engine`; the card draws its member of `CheckpointCard` and nothing else.

## 1. The map

**Component:** `CompassMap`
**Location:** `src/components/shared/CompassMap/`
**Shared:** yes - `results` (inside `NolanChart`) and `survey` (this card) both draw it

Presentational. No state, no data access, no interaction.

```ts
// src/components/shared/CompassMap/CompassMap.types.ts
import type { Orientation } from "@/types/orientation";
import type { NolanPosition, NolanQuadrantKey } from "@/types/results";

// A place on the map. `NolanPosition` and `CompassPoint` both fit as they are, so neither is converted.
export type CompassMapPoint = Pick<NolanPosition, "x" | "y">;

// The taker's place. Its level and quadrant decide which quadrant is filled.
export type CompassMapPosition = Pick<NolanPosition, "x" | "y" | "level" | "quadrant">;

// Colours by corner. `NolanQuadrants` of `NolanChart` fits as it is.
export type CompassMapQuadrants = Partial<Record<NolanQuadrantKey, { color?: string }>>;

export interface CompassMapProps {
  quadrants?: CompassMapQuadrants;
  position: CompassMapPosition | null;    // the taker: the dot, its halo and the filled quadrant. null = none of the three
  trail?: CompassMapPoint[];              // new in this task: the route, oldest point first
  otherOrientation?: Orientation;         // the other side of a comparison, as `NolanMap` takes it today
  otherPosition?: CompassMapPoint | null;
  description?: string;                   // given: the map is one image with this description. Absent: the parent describes it
}
```

`NolanPosition`, `NolanQuadrantKey` and `NolanLevel` are in `src/types/results.ts` and `getNolanPosition` is in `src/utils/results/` once `survey-running-state` has landed: that task moved them. **Do not move them again, and do not compute a position in this task** - every point arrives ready.

## 2. The card

**Component:** `SurveyCheckpointNolanPath`
**Location:** `src/components/survey/SurveyCheckpointNolanPath/`
**Shared:** no - domain component under `survey`

```ts
// src/components/survey/SurveyCheckpointNolanPath/SurveyCheckpointNolanPath.tsx
export const SurveyCheckpointNolanPath = (props: CheckpointCardProps<"nolan-path">) => ...
// props.card is a NolanPathCheckpointCard: variant, count, trail, isSecondPath, line, boundary
```

It follows the card contract of `survey-checkpoint`: it renders exactly one `SurveyCheckpoint`, passes `onContinue` and `onOptOut` to it unchanged, reads nothing but its props, and holds no state. It never calls `onReveal`.

```ts
// src/constants/results.ts - added
export const DEFAULT_COMPASS_QUADRANTS: Record<NolanQuadrantKey, { color: string }> = ...
// The default set of the spec, by corner: red top left, blue top right, green bottom left, purple bottom right.
```

```ts
// src/components/survey/SurveyQuestionnaire/SurveyQuestionnaire.constants.ts - one entry added
export const CHECKPOINT_CARDS: CheckpointCardRegistry = {
  // ...the entries already there
  "nolan-path": SurveyCheckpointNolanPath,
};
```

### What this task uses from the tasks before it

No name of an earlier task is redefined here.

| From | Used |
|---|---|
| `CompassPoint` (`survey-running-state`) | `x`, `y`, `level`, `quadrant`. A point of `card.trail` |
| `NolanPosition`, `NolanQuadrantKey` in `src/types/results.ts` (moved there by `survey-running-state`) | The types the map is written against |
| `NolanPathCheckpointCard` (`survey-checkpoint-engine`) | `variant`, `count`, `trail`, `isSecondPath`, `line` |
| `getCheckpointText(i18n, card)` (`survey-checkpoint-engine`) | The lead-in and the statement, the count already in its slot |
| `SurveyCheckpoint`, `CheckpointCardProps`, `CHECKPOINT_CARDS` (`survey-checkpoint`) | The frame, the props of a card, the registry |

# Behaviour

The [Nolan chart path spec](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/nolan-chart-path.md) is the source of truth for every case of the card and the trail, and the [Nolan chart spec](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/nolan-chart.md) for the map. The Figma frames - [two or three quadrants](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5515-67219), [four quadrants](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5516-69231), [four quadrants, second path](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5581-97574) - are the source of truth for sizes, spacing, type and colours: follow the frame.

### Where each part of the spec lands

| Part of the spec | Built in | Tested by |
|---|---|---|
| Whether the quiz has a compass; a position per answered question; "no position is not the centre"; the quadrants visited, counted at the moderate and the extreme level only | `survey-running-state` (`compass`) | `getCompassAxes()`, `getRunningCompass()` |
| When it may fire: two quadrants, ten questions done, each version once, never the partial one after the full one; the four-quadrant version ranked as not yet seen; the trail of a second path starting where the earlier card ended | `survey-checkpoint-engine` | `getNolanPathCandidate()`, `rankCheckpointCandidates()`, `getNextCheckpoint()` |
| The lines and the count slot | `survey-checkpoint-engine` | `CHECKPOINT_POOLS`, `getCheckpointSlots()`, `getCheckpointText()` |
| The frame, the two buttons, wrapping of a long statement | `survey-checkpoint` | `<SurveyCheckpoint />` |
| **The map by itself, the trail, the three looks of the card, the description, the registration, the card on the route** | **This task** | The cases below |

### The three states

The card has no state of its own. Which look is drawn is in the card it is given.

| State | The card it is given | What is drawn |
|---|---|---|
| Two or three quadrants | `variant` `partial`, `count` 2 or 3 | The map with the whole of `card.trail`; a line of the two-or-three pool with the count in it |
| Four quadrants | `variant` `full`, `count` 4, `isSecondPath` false | The map with the whole of `card.trail`; a line of the four-quadrant pool |
| Four quadrants, second path | `variant` `full`, `count` 4, `isSecondPath` true | The same. `card.trail` already starts where the earlier card left off - the engine cut it |

The card draws `card.trail` as it is given. It never cuts, extends, reorders or rebuilds a trail, and it never counts quadrants from the line: on a second path the line can lie in one corner while the statement counts the whole run.

### What the card puts into the frame

| Slot of `SurveyCheckpoint` | Content |
|---|---|
| `visual` | `CompassMap` with `quadrants` = `DEFAULT_COMPASS_QUADRANTS`, `trail` = `card.trail`, `position` = the last point of `card.trail`, and the description below. No `otherOrientation`, no `otherPosition` |
| `leadIn`, `statement` | `getCheckpointText(i18n, card)` |
| `options`, `quote` | Not passed |
| `isContinueAvailable` | Not passed: "Dalej" is always there |
| `onContinue`, `onOptOut` | The card's own props, unchanged |

| Case | Behaviour |
|---|---|
| The current position | The last point of `card.trail`: the dot with its halo |
| It is at the moderate or the extreme level | Its quadrant is filled with its colour at full strength |
| It is at the centre level | No quadrant is filled |
| The count in the statement | A numeral, 2 or 3, placed by `getCheckpointText`. The card formats nothing |
| Colours | Always the default set: no quiz sends quadrant colours |
| The card stays open while answers would have changed | Nothing on it changes. The card is frozen when it fires |

What the card leaves out of the result's module, and must not bring back: the module wrapper with its two buttons, the title that names the quadrant and its level, the axis names and coordinates beside the map, the control that opens the two axes, and a comparison. **The card counts quadrants and names none** - no text, title or description on it says which quadrant the taker is in.

### The map - `CompassMap`

What the map does today inside `NolanChart` does not change by moving:

| Case | Behaviour |
|---|---|
| Always | A square of four quadrants, each in a pale tint of its colour. Square at every width |
| `position` at the moderate or the extreme level | Its quadrant is filled at full strength |
| `position` at the centre level, or `null` | No quadrant is filled |
| `position` given | The dot with its halo, placed as today, edges and corners included |
| `position` is `null` | No dot |
| A quadrant without a colour, or with a value that is not a colour | The neutral fallback for that quadrant, tint and fill |
| `otherPosition` given | The other side's image on its hatched disc, drawn as today, on top of everything |
| `description` given | The map is announced as one image with that description |
| `description` absent | The map has no role and no name of its own. `NolanChart` uses it this way: its own element around the map and the axis names stays the image |

Nothing on the map can be pressed, hovered or focused.

### The trail

| Case | Behaviour |
|---|---|
| `trail` with two or more distinct points | One continuous dotted line through the points in the order given |
| Shape | Smoothed into curves, and it passes through every point. A curve that only approaches its points is wrong |
| Neighbouring points that are the same to two decimals | One point. Of such a run the last one is kept, so the line ends under the dot |
| Points that are the same but not neighbours - the route came back | Both kept. The line is drawn as travelled |
| The line crosses itself, or leaves a quadrant and returns | Drawn as travelled |
| Layer | Above the quadrants, below the halo and the dot |
| A point on an edge or in a corner | The line runs to it. Whatever falls outside the map is cut off |
| Colour | One colour along its whole length: the dot's. It does not take the colours of the quadrants it crosses |
| On a filled quadrant of any colour | The line and the dot keep a light edge, as in the frames, so both stay visible |
| Motion | None. The line is complete when the map appears; a preference for reduced motion changes nothing |
| A trail of several hundred points | Drawn whole, as one path. Nothing is sampled or dropped beyond the two-decimal rule |
| `trail` absent, empty, or with fewer than two distinct points | No line |
| A point whose `x` or `y` is not a number | Left out of the line |
| The trail and the dot | Use one mapping from a coordinate to a place on the map, so the line and the dot can never disagree |

Draw the line as inline SVG, one `path`. No charting library, no canvas, no animation, no measuring of the element in JavaScript.

### Description of the map on the card

The map is one image. Its description says how many of the four quadrants the route has passed through, and whether the taker now stands in the highlighted quadrant or near the centre.

| Case | Description |
|---|---|
| The current position is moderate or extreme | The "highlighted quadrant" text of the Copy section, with `card.count` |
| The current position is at the centre level | The "near the centre" text, with `card.count` |
| A count above 4 or below 0 | Read as 4 or as 0 |
| Any case | No quadrant is named, and no coordinate is given |

### Card - invalid and edge input

Nothing here throws. A card that cannot be built leaves through the frame: `SurveyCheckpoint` draws nothing and calls `onContinue` once when it gets no visual or a blank statement.

| Input | Behaviour |
|---|---|
| `card.trail` is empty | No visual is passed. The frame leaves |
| The last point of `card.trail` has an `x` or a `y` that is not a number | No visual is passed. The frame leaves |
| `card.trail` has a single distinct point | The map with the dot and no line |
| `getCheckpointText` gives nothing | A blank statement is passed. The frame leaves |
| A pool line without the count slot | Shown as written |
| A line longer than the card | It wraps, in the frame |

### Accessibility

- The map exposes no focusable element. Focus, the announcement when the card appears and the two buttons are the frame's.
- The trail is a dotted line and the taker a dot with a halo: neither is told from the map by colour alone.
- The line is not announced by itself: the description of the image covers it.
- The count is read as a number inside the statement.

# Copy

Polish is the source; every string goes through a Lingui macro and the English entry is filled in.

| Text | Polish (source) | English |
|---|---|---|
| Description, highlighted quadrant | Kompas: trasa przeszła przez {count} z 4 ćwiartek. Twoja pozycja jest teraz w podświetlonej ćwiartce. | Compass: the route has passed through {count} of 4 quadrants. Your position is now in the highlighted quadrant. |
| Description, near the centre | Kompas: trasa przeszła przez {count} z 4 ćwiartek. Twoja pozycja jest teraz blisko środka. | Compass: the route has passed through {count} of 4 quadrants. Your position is now near the centre. |

Each description is one whole message with the count as its only slot; it is never put together from parts. The lead-in and the statement are not this component's copy: they are the pools `nolan-path-partial` and `nolan-path-full` of `survey-checkpoint-engine`. The text in the Figma frames is not the text shown - the frames use a gendered verb, and the pools hold the neutral lines.

# Athena components to use

- None fits the map or the line.
- Do **not** render `NolanChart` on the card. It brings the module wrapper, a title that names the quadrant, the axis names with coordinates and the open control - everything the card leaves out.
- Do **not** use the app's `ModuleWrapper`: the card sits in `SurveyCheckpoint`.
- "Dalej" and "Wyłącz checkpointy" are the frame's. The card adds no button.

# Deviation from standards

`AGENTS.md` section 3.4 says a data mark at the minimum or the maximum value must not be cut by its container. The spec asks the opposite for the line: it runs to a point on the edge, and whatever falls outside the map is cut off. The halo is already cut this way today.

- [ ] Sub-task: obtain Technical Leader approval for cutting the trail at the edge of the map, and name the approval in the pull request.

The dot itself is drawn exactly as the map draws it today, edges and corners included. This task does not change it.

# Out of scope

- **When the card fires, which version, "once each", the rule that the second card draws only the new part, and the count** - `survey-checkpoint-engine`. Nothing is added to it here.
- **The position after every answer, the quadrants visited, the levels** - `survey-running-state`. `getNolanPosition`, its constants and its types were moved by that task and are not touched here.
- **The frame, the two buttons, focus, the Checkpoints phase** - `survey-checkpoint`.
- **The wording** - the pools of `survey-checkpoint-engine`.
- **How `NolanChart` looks and behaves** - unchanged. Only where its map lives changes.
- **Quadrant colours from the quiz** - the survey API sends none. When it does, the card gets them in its card member; until then it uses the default set.
- **Showing the trail on the result screen, replaying or sharing it** - not built. Nothing keeps the trail past the session.
- **Analytics** - no event is raised here.

# Files to create

```
src/constants/results.ts                             # existing: + DEFAULT_COMPASS_QUADRANTS
src/utils/style/
├── getNolanColorStyle.ts                            # moved from NolanChart/utils/getColorStyle.ts
└── getNolanColorStyle.test.ts                       # moved with it
src/components/shared/CompassMap/
├── CompassMap.tsx
├── CompassMap.test.tsx
├── CompassMap.types.ts
├── CompassMap.constants.ts                          # QUADRANT_KEYS, MAP_CLIP_CLASS_NAME, MAP_POINT_CLASS_NAME - moved from NolanChart.constants.ts
├── CompassMap.stories.tsx
├── QuadrantGrid/                                    # moved from NolanChart/NolanMap/, with its test
├── TakerDot/                                        # moved, with its test
├── OrientationMarker/                               # moved, with its test
├── CompassMapTrail/
│   ├── CompassMapTrail.tsx                          # the line
│   ├── CompassMapTrail.test.tsx
│   └── utils/
│       ├── getTrailPoints.ts                        # the points the line goes through: numbers only, equal neighbours merged
│       ├── getTrailPoints.test.ts
│       ├── getTrailPath.ts                          # the path through those points
│       └── getTrailPath.test.ts
└── utils/
    ├── getPositionStyle.ts                          # moved from NolanChart/utils/, with its test
    └── getPositionStyle.test.ts
src/components/results/NolanChart/
├── NolanChart.constants.ts                          # existing: the three moved constants leave
├── NolanMap/NolanMap.tsx                            # existing: renders CompassMap in place of its own grid, dot and marker
├── NolanMap/NolanMap.test.tsx                       # existing: what is left is composition
└── QuadrantTitle/QuadrantTitle.tsx                  # existing: imports getNolanColorStyle
src/components/survey/SurveyCheckpointNolanPath/
├── SurveyCheckpointNolanPath.tsx
├── SurveyCheckpointNolanPath.test.tsx
├── SurveyCheckpointNolanPath.stories.tsx
└── utils/
    ├── useNolanPathDescription.ts                   # the description of the map, from the card
    └── useNolanPathDescription.test.tsx
src/components/survey/SurveyQuestionnaire/
└── SurveyQuestionnaire.constants.ts                 # existing: + "nolan-path": SurveyCheckpointNolanPath
e2e/survey/
├── survey-compass.fixture.ts                        # the quiz of the scenario below
└── questionnaire.spec.ts                            # existing: + one scenario
```

Why each piece moves where it does:

- `QuadrantGrid`, `TakerDot` and `OrientationMarker` are the map. They move together with what only they use: `getPositionStyle` and the three constants. They keep their names; this is a move, not a rewrite, and their tests move with them.
- `getColorStyle` is used by the map, which moves, and by `QuadrantTitle`, which stays. A helper with two consumers is global: it goes to `src/utils/style/`, next to `getIconMaskStyle`, under a name that says which variable it sets. No copy stays behind in `NolanChart`.
- `AxisPill` and the element that makes `NolanChart`'s map one image stay in `NolanChart/NolanMap/`: the card has no axis names.
- `getQuadrantColor`, `useMapDescription` and everything else in `NolanChart/utils/` stay.
- `DEFAULT_COMPASS_QUADRANTS` is global because the spec asks the result to use the same four colours. Write each as the literal value of the palette token the frames use, with the token named beside it, the way `MATCH_BAND_COLORS` is written: the map's colour check accepts no CSS variable.

No functions in a component file, no `renderX()`. Search `src/utils/` before writing a helper: `isNumber` and `clamp` are in `src/utils/number/`. If the files of the earlier tasks ended up named differently from the tree above, follow what is in the repository and say so in the pull request.

# Unit test cases (BDD)

```ts
describe('getTrailPoints()', () => {
  it('keeps the points in the order given', ...);
  it('merges neighbouring points that are the same to two decimals', ...);
  it('keeps the last point of a merged run', ...);
  it('keeps two equal points that are not neighbours', ...);
  it('leaves out a point whose x or y is not a number', ...);
  it('returns no points for a missing or an empty trail', ...);
  it('does not change the list it was given', ...);
});

describe('getTrailPath()', () => {
  it('returns no path for fewer than two points', ...);
  it('starts at the first point and ends at the last', ...);
  it('passes through every point in between', ...);
  it('is a curve, not straight segments, for three points that are not in line', ...);
  it('places a point with the mapping the dot uses', ...);
  it('returns one path for three hundred points', ...);
});

describe('<CompassMapTrail />', () => {
  describe('given two or more distinct points', () => {
    it('renders one path', ...);
    it('is hidden from assistive technology', ...);
  });
  describe('given fewer than two distinct points', () => {
    it('renders nothing', ...);
  });
});

describe('<CompassMap />', () => {
  describe('given a position at the moderate or the extreme level', () => {
    it('fills the quadrant of the position', ...);
    it('renders the dot and its halo', ...);
  });
  describe('given a position at the centre level', () => {
    it('fills no quadrant', ...);
    it('renders the dot', ...);
  });
  describe('given no position', () => {
    it('renders no dot and fills no quadrant', ...);
  });
  describe('given a trail', () => {
    it('renders the line after the quadrants and before the halo and the dot', ...);
  });
  describe('given no trail', () => {
    it('renders no line', ...);
  });
  describe('given the other side of a comparison', () => {
    it('renders its image on the hatched disc', ...);
    it('still fills only the quadrant of the position', ...);
  });
  describe('given a description', () => {
    it('is one image named by the description', ...);
  });
  describe('given no description', () => {
    it('has no role and no name of its own', ...);
  });
  describe('given a quadrant without a colour or with a value that is not a colour', () => {
    it('uses the neutral fallback for that quadrant', ...);
  });
  it('exposes no focusable element', ...);
});

describe('<NolanMap /> - after the move', () => {
  it('renders CompassMap with the quadrants, the position and the other side', ...);
  it('passes no trail and no description to it', ...);
  it('is still one image named by its own description, with both axis names beside the map', ...);
});

describe('useNolanPathDescription()', () => {
  describe('given a current position at the moderate or the extreme level', () => {
    it('says how many of the four quadrants and that the position is in the highlighted quadrant', ...);
  });
  describe('given a current position at the centre level', () => {
    it('says how many of the four quadrants and that the position is near the centre', ...);
  });
  describe('given a second path card', () => {
    it('uses the count of the card, not the quadrants the line lies in', ...);
  });
  it('reads a count above 4 as 4 and below 0 as 0', ...);
  it('names no quadrant and gives no coordinate', ...);
});

describe('<SurveyCheckpointNolanPath />', () => {
  describe('given a partial card with a count of 2', () => {
    it('renders one checkpoint frame with the map, the lead-in and the statement of the card\'s line', ...);
    it('shows the count 2 in the statement', ...);
    it('renders "Dalej" and "Wyłącz checkpointy"', ...);
  });
  describe('given a partial card with a count of 3', () => {
    it('shows the count 3 in the statement', ...);
  });
  describe('given a full card', () => {
    it('shows a line of the four-quadrant pool', ...);
  });
  describe('given a full card that is a second path', () => {
    it('passes the trail of the card to the map unchanged', ...);
    it('says 4 of 4 in the description of the map', ...);
  });
  describe('the map', () => {
    it('gets the default quadrant colours', ...);
    it('gets the last point of the trail as the position', ...);
    it('gets no other side of a comparison', ...);
    it('is one image, with no title, no axis name and no coordinate around it', ...);
  });
  describe('given a trail whose last point is at the centre level', () => {
    it('fills no quadrant', ...);
  });
  describe('given an empty trail', () => {
    it('renders nothing and calls onContinue once', ...);
  });
  describe('given a trail whose last point is not a number', () => {
    it('renders nothing and calls onContinue once', ...);
  });
  describe('given a line that does not exist in the pools', () => {
    it('renders nothing and calls onContinue once', ...);
  });
  describe('when "Dalej" is activated', () => {
    it('calls onContinue once', ...);
  });
  describe('when "Wyłącz checkpointy" is activated', () => {
    it('calls onOptOut once', ...);
  });
  it('never calls onReveal', ...);
  it('names no quadrant anywhere on the card', ...);
});

describe('CHECKPOINT_CARDS', () => {
  it('maps "nolan-path" to SurveyCheckpointNolanPath', ...);
});
```

The tests of `QuadrantGrid`, `TakerDot`, `OrientationMarker`, `getPositionStyle` and `getColorStyle` move with their files and keep passing. Every test and story of `NolanChart` keeps passing without a change to what it expects. Build cards by hand in the test file - a card is plain data - and render with `renderWithI18n`. Find elements by role and accessible name.

# e2e

The card is reachable on the route once it is registered, in a quiz that has a compass. Add one scenario to `e2e/survey/questionnaire.spec.ts`, on a quiz mocked for it through Playwright routes like the others - never the live API.

The fixture, `e2e/survey/survey-compass.fixture.ts`, in the shape the API sends:

- twenty questions in one category, an average finish time of 20;
- four orientations, none of type identity: left, right, down, up;
- two axes and no other: one of type `compass_x_axis` with left on its negative side and right on its positive side, one of type `compass_y_axis` with down on its negative side and up on its positive side;
- every question has the four agreement answers: "Zdecydowanie za" with weight 2 and "Częściowo za" with weight 1, both for right and up; "Częściowo przeciw" with weight 1 and "Zdecydowanie przeciw" with weight 2, both for left and down.

Why this quiz: after the first answer the position is in the top right corner at the extreme level; from the fourth answer on it is in the bottom left quadrant at the moderate level or further. At the boundary after the tenth question two quadrants were visited and ten questions are done, so the path card is a candidate. No other personal card can fire in this quiz, no card can fire before that boundary, and the halfway card, due at the same boundary, loses to it.

```gherkin
Scenario: The compass path card appears in a quiz with a compass
  Given a user opened the twenty-question compass quiz
  When they answer the first question "Zdecydowanie za"
  And they answer the next nine questions "Zdecydowanie przeciw"
  Then a region named "Checkpoint" is shown in place of the question
  And it holds an image whose description says the route passed through 2 of 4 quadrants
  And its text says "2 ćwiartki kompasu"
  When they press "Dalej"
  Then they see the eleventh question
```

The four-quadrant version and the second path are not worth a scenario: they need a long scripted run and prove nothing the unit tests and the engine's own tests do not.

# Storybook stories

`SurveyCheckpointNolanPath` - **Figma, in the order of the frames**
- `TwoOrThreeQuadrants` - a partial card, the dot in a filled quadrant
- `FourQuadrants` - a full card with the whole route
- `FourQuadrantsSecondPath` - a full card whose trail lies in one corner

**Edge**
- `NearTheCentre` - the last point at the centre level: a trail and no filled quadrant
- `DotInACorner` - the last point in a corner of the map
- `LongTrail` - three hundred points
- `TrailCrossingItself`

`CompassMap` (shared, so it needs its own)
- `Moderate`, `Extreme`, `Centre`, `NoPosition`
- `WithTrail`, `TrailToACorner`, `TrailOnAMatchingColour` - the filled quadrant in the colour of the line
- `WithComparison`
- `NoQuadrantColours`

The stories of `NolanChart` are not changed; compare them before and after the move - they must look the same. Stories show the component alone, with no decorator, background or fixed width; check them at 320, 360 and 800 px.

# Remember about standards

- Use the standard colors palette, never add colors directly (check https://tailwindcss.com/docs/colors and our color palette in the `src/index.css` file and in [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css))
- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Create a Storybook story for the component with all possible props variants of the component
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)
- Name the branch `feature/survey-checkpoint-nolan-path-111`, following [Conventional Branch](https://conventional-branch.github.io/) - never keep a generated or default branch name
- Read `AGENTS.md` in the repository before starting; where it differs from this task on a standard, it wins - except for the deviation named above, once it is approved
- Make the move its own commit, before the trail and the card, so the reviewer can see that `NolanChart` did not change
- Nothing is imported from another component's `utils/`, constants or subcomponents: that is why the map and its helpers are promoted, not reached into
- The map fills its parent's width and stays square; layout that depends on width is CSS
- No new dependency: no charting library, no animation library
- Nothing from this card is sent, stored or logged: the trail is a record of the taker's position over time
- Copy is Polish by default, accessible descriptions included. Run `yarn i18n:extract`, translate every new English entry, commit both catalogs
- Commit only files that belong to the task; commits follow Conventional Commits
- The PR follows the repository's pull request template, with screenshots of the stories next to the Figma frames

# Dependencies

- `survey-checkpoint` (#107) - the frame `SurveyCheckpoint`, `CheckpointCardProps`, `CHECKPOINT_CARDS`.
- `survey-checkpoint-engine` (#106) - `NolanPathCheckpointCard`, `getCheckpointText`, and the trigger that makes the card appear.
- `survey-running-state` (#105) - `CompassPoint`, and the move of `getNolanPosition` with its types and constants that this task builds on.

It blocks nothing. It can be built alongside the other cards of this cycle; the only file it shares with them is `SurveyQuestionnaire.constants.ts`, where each adds one line.

# Resources

- [Spec - Nolan chart path](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/nolan-chart-path.md) - the card, the trail, the three states, the description
- [Spec - Nolan chart](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/nolan-chart.md) - the map, the position, the levels
- [Spec - Checkpoints](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/checkpoints.md) - the frame the card fills
- [Spec - Event model](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/event-model.md) - the trail, the quadrants visited and the record of cards shown
- [Spec - Random copy](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/checkpoints-random-copy.md) - the two pools
- [Docs - Nolan chart path](https://github.com/gi-org-pl/product/blob/main/mypolitics/docs/modules/quiz/questionnaire/checkpoints/nolan-chart-path.md) - the idea
- Figma - the card: [two or three quadrants](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5515-67219) | [four quadrants](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5516-69231) | [four quadrants, second path](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5581-97574). The frames draw the line from the middle of the map; the card draws the trail it is given, which starts at the first position the taker held
- [Figma - the Nolan chart module](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5508-25681) - the map as the result draws it
- [Figma - the Checkpoints phase screen](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5582-98011)
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Storybook docs](https://storybook.js.org/docs/writing-stories)
- [Tailwind docs](https://tailwindcss.com/docs/)
- [Vitest docs](https://vitest.dev/guide/)

# Definition of Done

- [ ] Code follows folder structure (`docs/frontend/conventions/PROJECT_STRUCTURE.md`)
- [ ] Naming follows `docs/frontend/conventions/NAMING.md`
- [ ] Components sit directly in `src/components/shared/` and `src/components/survey/` - no extra folder layer
- [ ] Component layout follows `docs/frontend/conventions/COMPONENT_STRUCTURE.md`: one component per file, helpers and hooks in `utils/`, each with its own test
- [ ] `CompassMap` exists in `src/components/shared/` with the props of this task; `QuadrantGrid`, `TakerDot`, `OrientationMarker`, `getPositionStyle` and the three constants moved into it with their tests; `getColorStyle` moved to `src/utils/style/`; no copy is left in `NolanChart`
- [ ] `getNolanPosition`, its constants and its types are where `survey-running-state` put them and were not moved or copied again
- [ ] `NolanChart` renders `CompassMap` and looks and behaves as before: its tests and stories pass with nothing changed in what they expect
- [ ] The trail is one dotted line through every point in order, smoothed, above the quadrants and below the halo and the dot, in the dot's colour, with a light edge, cut at the edge of the map, not animated
- [ ] Neighbouring points equal to two decimals are one point; points that are not numbers are left out; fewer than two distinct points draw no line; three hundred points are one path
- [ ] `SurveyCheckpointNolanPath` renders exactly one `SurveyCheckpoint`, passes `onContinue` and `onOptOut` unchanged, holds no state, reads nothing but its props and never calls `onReveal`
- [ ] The card draws `card.trail` as given in all three states and takes the count from the card, never from the line
- [ ] The dot is the last point of the trail; its quadrant is filled at the moderate and the extreme level and not at the centre level
- [ ] The map on the card is one image whose description gives the count of four and "highlighted quadrant" or "near the centre"; no quadrant is named anywhere on the card
- [ ] No module wrapper, no title, no axis names, no coordinates, no open control and no comparison on the card
- [ ] An empty trail, a last point that is not a number and a missing line each make the card leave without the taker seeing anything
- [ ] `DEFAULT_COMPASS_QUADRANTS` holds the default set by corner, as literals of palette tokens
- [ ] `CHECKPOINT_CARDS` has the entry `"nolan-path": SurveyCheckpointNolanPath`
- [ ] The deviation on cutting the trail at the edge is approved by the Technical Leader and named in the PR
- [ ] Nothing imported from another component's `utils/`, constants or subcomponents
- [ ] The map fills its parent's width and stays square; stories checked at 320 / 360 / 800 px with no horizontal scroll
- [ ] Unit tests added and moved, BDD style, coverage ≥95% on all new and changed files; every subcomponent, util and hook has its own test file; elements found by role and name
- [ ] Storybook stories added for `SurveyCheckpointNolanPath` and `CompassMap`, all listed above, showing the component alone
- [ ] `e2e/survey/questionnaire.spec.ts` has the compass scenario, on the mocked compass quiz; no test reaches a live address
- [ ] Both descriptions go through a Lingui macro, with Polish as the source; `yarn i18n:extract` run, English entries translated, `.po` files committed
- [ ] No new dependency
- [ ] Biome lint clean
- [ ] TypeScript clean (no `any`, no `@ts-ignore`)
- [ ] Branch named `feature/survey-checkpoint-nolan-path-111`
- [ ] CI green: build, lint, test, e2e
- [ ] PR description lists decisions and deviations from the ticket/spec; only files belonging to the task are committed
