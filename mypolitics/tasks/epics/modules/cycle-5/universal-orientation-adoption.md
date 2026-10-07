# Story

As a user reading a quiz result, I want every module to treat a party, a candidate, an identity and the friend I compare with as the same thing - an orientation - so that any module can draw any quiz, and a quiz about candidates looks and behaves exactly like a quiz about ideologies.

# Component properties

**Components:** every result module and what they are built from - `UniversalAxis`, `SingleAxisChart`, `DoubleAxisChart`, `MultiAxisChart`, `AxisRow`, `HorizontalBarChart`, `RankedRow`, `Archetype`, `Traits`, `NolanChart`, `ResultsHeader`, `OrientationChip`
**Location:** `src/components/results/`, `src/components/shared/UniversalAxis/`, `src/types/`, `src/utils/`
**Shared:** as today - nothing moves between domains

This task adds **no new behaviour to draw and no new component**. It makes the result domain use one type and one word:

- **One type.** `Orientation` from `src/types/orientation.ts` (created by the `UniversalOrientation` task) replaces `AxisOrientation` and every locally declared orientation shape.
- **One word.** Whatever is named, scored or compared is an `orientation`. The words `party` and `candidate` are no longer used for a variable, a prop, a type, a component, a file, a test title or a story.

```ts
// src/types/axis.ts - AxisOrientation is removed
export interface AxisEntry {
  orientation: Orientation; // from src/types/orientation.ts
  value?: number;
}

// src/types/results.ts
export interface ResultEntry {
  orientation: Orientation;
  value?: number;
}

export interface RankedComparison {
  orientation: Orientation;       // the other side. Was `party`
  values: Record<string, number>; // their value, by orientation id
}
```

`Orientation.name` is **optional** where `AxisOrientation.name` was a required string. Every module already has a rule for a missing name in its spec; keep that rule working when the name is `undefined` and not only when it is `""`.

# Behaviour

The [spec](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/universal-orientation.md) is the source of truth. Each module's own spec still decides how that module draws; this task changes what the modules are handed, not what they draw - except in the three places listed under "Properties that move onto the orientation" and "Hidden".

### One type

| Where | Now | Becomes |
|---|---|---|
| `src/types/axis.ts` | `AxisOrientation` | Removed. `Orientation` everywhere it was used |
| `ResultsHeader.types.ts` | `ResultsHeaderOrientation { name, imageUrl }` | Removed. `orientation?: Orientation` |
| `OrientationChip.types.ts` | `name`, `imageUrl`, `color` declared by hand | Taken from `Orientation` with `Pick` |
| `Traits.types.ts` | `TraitItem { id, name, imageUrl, color, holder }` | `{ orientation: Orientation; holder: TraitHolder }` |
| `Archetype.types.ts`, `RankedRow.types.ts`, `SingleAxisChart.types.ts`, `NolanChart.types.ts`, `MultiAxisChart.types.ts` | `AxisOrientation` | `Orientation` |

A module that needs less than the whole orientation takes what it needs from `Orientation` with `Pick`. No file declares an orientation-shaped interface of its own. The computed layout types in `src/types/axis.ts` (`AxisSideLayout`, `AxisComparisonLayout`) are results of a calculation, not definitions of an orientation, and stay as they are.

### One word

| Where | Now | Becomes |
|---|---|---|
| `RankedComparison`, `AxisComparison`, `NolanComparison`, `TraitsComparison` | `party` | `orientation` |
| `NolanMap`, `NolanRows`, `NolanRow` props | `otherParty` | `otherOrientation` |
| `NolanMap/PartyMarker/` - folder, component, props type, tests | `PartyMarker`, prop `party` | `OrientationMarker`, prop `orientation` |
| `TraitPill` prop | `party` | `otherOrientation` |
| `getPillHolder`, `getRowComparison` parameter | `party` | `otherOrientation` |
| `useTraitDescription` parameter | `partyName` | `otherName` |
| `getComparisonEntry`, `getAxisComparison` | read `comparison.party` | read `comparison.orientation` |
| `HorizontalBarChart.stories.tsx` | `createCandidate`, `candidates`, `candidateCategories`; stories `Candidates`, `CandidatesComparison`, `CandidatesOpen`, `CandidatesGrouped`, `CandidatesCategoryOpen` | A shared `createOrientation` test helper, `orientations`, `orientationCategories`; stories `Ranking`, `RankingComparison`, `RankingOpen`, `RankingGrouped`, `RankingCategoryOpen` |
| Test titles and comments | "the other party", "party", "candidate" | "the other side", "orientation" |

The naming rule after this task:

- **In a comparison, the other side is `orientation` on the comparison object and `otherOrientation` where it is passed next to the taker's own orientation.**
- **`party` survives in exactly one place:** as a member of `OrientationType`, because it is a type the API sends.
- **Fixture content is not naming.** A story may still show "Kandydaci" as a title or "Rafał Trzaskowski" as a name - that is what a quiz author writes. The variable holding it is an orientation.

The check: `git grep -n -i -w -E "[a-z]*(party|candidate)[a-z]*" -- src` returns only the `"party"` member of `OrientationType`, its tests, and fixture strings.

### Properties that move onto the orientation

The universal orientation carries properties that modules were given separately. They are now read from the orientation.

| Module | Now | Becomes |
|---|---|---|
| `ResultsHeader` | `slogan?: string` prop | Read from `orientation.slogan`. The prop is removed |
| `ResultsHeader` | `link?: { url, label }` prop | The address is `orientation.websiteUrl`. The prop becomes `linkLabel?: string` |
| `Archetype` | `ArchetypeEntry.shortDescription`, `ArchetypeEntry.fullDescription` | Read from `orientation.description` and `orientation.fullDescription`. Both fields are removed from `ArchetypeEntry` |

Every existing case of the two modules keeps its behaviour: no match still draws neither slogan nor link, a link with an empty label still shows the address, an address that is not a web address is still not drawn, a full description identical to the short one still has no control.

### Hidden

| Case | Behaviour |
|---|---|
| `HorizontalBarChart` ranks its entries, flat or inside a category | An entry whose orientation `isHidden` takes no part: it is not ranked, not counted against the fold, and never leads a category |
| `Archetype` picks its leader and builds its ranking | An archetype whose orientation `isHidden` takes no part in either |
| Every entry is hidden | The module draws the empty state it already has for no entries |
| A comparison value for a hidden orientation | Ignored, like a value for an orientation not in the list |

One shared helper decides it, so the two modules cannot drift.

# Athena components to use

None new. Every Athena component a module already uses stays.

# Out of scope

- **Reading the API** - done by the `UniversalOrientation` task. No module parses anything here.
- **An "official" badge.** `RankedRow` keeps drawing the badge it is given. Building a badge from `orientation.isOfficial` is the result screen's job, and the result screen does not exist yet.
- **Not drawing a hidden orientation an author pointed a single module at** - the result screen.
- **Choosing a form.** Modules receive an `Orientation` with one name and one image already chosen.
- **Any change to how a module looks.** If a story looks different after this task, something went wrong.
- **The product repository's task files**, which still say `party` - they are history.

# Files to change

```
src/types/axis.ts                                  # AxisOrientation removed
src/types/results.ts                               # RankedComparison.party -> orientation
src/utils/results/getComparisonEntry.ts
src/utils/results/hasOrientationTitle.ts           # name may be undefined
src/utils/results/isOrientationShown.ts            # new: false for a hidden orientation
src/utils/results/isOrientationShown.test.ts       # new
src/utils/vitest/createOrientation.ts              # new: one fixture builder for stories and tests
src/utils/vitest/createAxisPair.ts                 # builds on createOrientation
src/components/shared/UniversalAxis/               # types only
src/components/results/OrientationChip/
src/components/results/RankedRow/
src/components/results/SingleAxisChart/
src/components/results/DoubleAxisChart/
src/components/results/AxisRow/
src/components/results/MultiAxisChart/             # AxisComparison.party, getAxisComparison
src/components/results/HorizontalBarChart/         # sortRankedEntries skips hidden; stories renamed
src/components/results/Archetype/                  # descriptions from the orientation; ranking skips hidden
src/components/results/Traits/                     # TraitsComparison.party, TraitPill, TraitItem
src/components/results/NolanChart/                 # NolanComparison.party, otherParty, PartyMarker -> OrientationMarker
src/components/results/ResultsHeader/              # orientation, slogan, linkLabel
```

Rename `NolanMap/PartyMarker/` with `git mv`, so the history of the file follows it.

# Unit test cases (BDD)

Every existing test keeps its assertion and changes only its fixtures and its wording. On top of them:

```ts
describe('isOrientationShown()', () => {
  it('returns true for an orientation that is not hidden', ...);
  it('returns true when isHidden is absent', ...);
  it('returns false for a hidden orientation', ...);
});

describe('sortRankedEntries()', () => {
  describe('given a hidden orientation', () => {
    it('leaves it out of the ranking', ...);
    it('keeps the order of the others', ...);
  });
});

describe('<HorizontalBarChart />', () => {
  describe('given a hidden orientation in a flat list', () => {
    it('does not draw its row and does not count it against the fold', ...);
  });
  describe('given a category whose best entry is hidden', () => {
    it('leads the category with the best entry that is shown', ...);
  });
  describe('given only hidden orientations', () => {
    it('draws the empty state', ...);
  });
  describe('given a comparison value for a hidden orientation', () => {
    it('ignores it', ...);
  });
});

describe('<Archetype />', () => {
  describe('given the orientation has a description and a full description', () => {
    it('shows the description in the summary', ...);
    it('opens the full description from the description control', ...);
  });
  describe('given a hidden archetype with the highest match', () => {
    it('leads with the best archetype that is shown', ...);
    it('leaves the hidden one out of the ranking', ...);
  });
});

describe('<ResultsHeader />', () => {
  describe('given the orientation has a slogan', () => {
    it('draws the slogan chip', ...);
  });
  describe('given the orientation has a website', () => {
    it('draws the link with linkLabel as its label', ...);
    it('shows the address when linkLabel is empty', ...);
    it('does not draw the link when the website is not a web address', ...);
  });
  describe('given no match', () => {
    it('draws neither the slogan nor the link, whatever the orientation carries', ...);
  });
});

describe('given an orientation without a name', () => {
  it('<OrientationChip /> shows the image alone', ...);
  it('<RankedRow /> draws the bar under an empty name', ...);
  it('<Traits /> does not draw the trait', ...);
  it('<UniversalAxis /> keeps the label row reserved', ...);
});
```

# Storybook stories

No new story. Every existing story keeps its content and its picture; the five `Candidates*` stories of `HorizontalBarChart` are renamed as in the table above. Check each module's stories side by side with `main` - they must look the same.

# Remember about standards

- Use the standard colors palette, never add colors directly (check https://tailwindcss.com/docs/colors and our color palette in the `src/index.css` file and in [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css))
- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Keep every Storybook story working, with all props variants of each component still covered
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)
- No user-visible wording changes. If a Lingui message id changes, run `yarn i18n:extract` and commit the `.po` files
- Name the branch `feature/universal-orientation-adoption-86`, following [Conventional Branch](https://conventional-branch.github.io/) - never keep a generated or default branch name
- The PR follows the repository's pull request template: Changes, How to test, Visual Preview (one story per module next to the same story on `main`), Checklist
- Keep the rename and the three behaviour changes in separate commits, so the mechanical part can be reviewed quickly

# Dependencies

- **Blocked by `UniversalOrientation`** (#85) - it creates `src/types/orientation.ts`, which every change here imports.

# Resources

- [Spec - Universal orientation](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/universal-orientation.md) - the definition, the words, and the hidden cases
- [Spec - Header](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/header.md), [Archetype](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/archetype.md), [Horizontal bar chart](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/horizontal-bar-chart.md) - the modules whose inputs change
- [Docs - Result modules](https://github.com/gi-org-pl/product/blob/main/mypolitics/docs/modules/quiz/results/modules/README.md) - why every entity with points is an orientation
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Storybook docs](https://storybook.js.org/docs/writing-stories)
- [Vitest docs](https://vitest.dev/guide/)

# Definition of Done

- [ ] Code follows folder structure (`docs/frontend/conventions/PROJECT_STRUCTURE.md`)
- [ ] Naming follows `docs/frontend/conventions/NAMING.md`
- [ ] Component layout follows `docs/frontend/conventions/COMPONENT_STRUCTURE.md`
- [ ] `AxisOrientation` and `ResultsHeaderOrientation` no longer exist; no file declares an orientation shape of its own
- [ ] Every comparison object carries the other side as `orientation`; props passing it are `otherOrientation`
- [ ] `PartyMarker` is `OrientationMarker`, renamed with its history
- [ ] `git grep -n -i -w -E "[a-z]*(party|candidate)[a-z]*" -- src` returns only the `OrientationType` member, its tests and fixture strings
- [ ] `ResultsHeader` reads the slogan and the link address from the orientation; `Archetype` reads both descriptions from the orientation
- [ ] `HorizontalBarChart` and `Archetype` leave hidden orientations out of ranking and leading, through one shared helper
- [ ] Every module handles an orientation whose name is `undefined` as its spec says
- [ ] Every story looks the same as on `main`; the five renamed stories are the only story changes
- [ ] Unit tests updated and added, BDD style, coverage ≥95% on changed files
- [ ] Biome lint clean
- [ ] TypeScript clean (no `any`, no `@ts-ignore`)
- [ ] No user-visible string changed; `.po` files committed if any message id moved
- [ ] CI green: build, lint, test
