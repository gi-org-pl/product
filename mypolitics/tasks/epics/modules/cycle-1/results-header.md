<img alt="Results header - states" src="https://raw.githubusercontent.com/gi-org-pl/product/main/mypolitics/assets/header.png" />

# Story

As a user who has just finished a quiz, I want the top of my result to tell me in one line which orientation I came out as and how confident that result is - or to say plainly that there is no match - and to let me switch between my result and comparison.

# Component properties

**Component:** `ResultsHeader`
**Location:** `src/components/results/modules/ResultsHeader/`
**Shared:** no - in the `results` domain. Not to be confused with the site header in `src/components/shared/Header/`

It does **not** sit in a `ModuleWrapper` and has no statistics or info button. **No scoring**: it receives the leading orientation and its confidence. This task also creates the **match bands** as a shared util, because the `Archetype` module uses the same ones.

```ts
export type ResultsTab = 'results' | 'comparison';

export interface ResultsHeaderLink {
  url: string;
  label?: string;
}

export interface ResultsHeaderProps {
  orientation?: { name: string; imageUrl?: string }; // absent = no match
  confidence?: number;                               // 0-100
  slogan?: string;                                   // author-written
  link?: ResultsHeaderLink;                          // author-written
  activeTab: ResultsTab;
  onTabChange: (tab: ResultsTab) => void;
}

// src/constants/results.ts
export const PARTIAL_MATCH_FROM = 50;
export const MATCH_FROM = 80;

// src/utils/results/getMatchBand.ts
export type MatchBand = 'none' | 'partial' | 'match';
export const getMatchBand = (value?: number): MatchBand => ...
```

# Behaviour

The [spec](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/header.md) is the source of truth for every case below; the [Figma frame](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5500-3239) is the source of truth for sizes, spacing, type, icons and colours.

### Match bands

| Band | Range |
|---|---|
| No match | Below 50 |
| Partial match | From 50, below 80 |
| Match | 80 and above |

Decided on the exact value, not the rounded one. Each band has its own palette colour, never the orientation's.

**Figma draws "75%" in green. That is a slip in the drawing**: 75 is a partial match and takes the partial band's colour, as the band chart beside it shows.

### Result

| Case | Behaviour |
|---|---|
| Match or partial match | The orientation's image inside a ring, its name, and the confidence as a rounded percentage with its word, e.g. "75% pewności" |
| Ring | An arc as long as the confidence, in the band's colour |
| Confidence text | In the band's colour |
| No match | A question mark in place of the image, no ring, "Brak dopasowania" in place of the name, and no confidence |

Below 50 the orientation's name and image are not shown, even though they were passed. The header never names the least bad option.

### Extras

| Case | Behaviour |
|---|---|
| Slogan present | A labelled chip. Not interactive |
| Link present | A button showing the label, which opens the address in a new tab |
| Neither | The row they share is not drawn |
| No match | Neither is drawn, whatever was passed |

### Tabs

| Case | Behaviour |
|---|---|
| Always | Two tabs of equal width under the result: "Twoje wyniki", then "Tryb porównania" |
| Active tab | Marked as selected |
| A tab pressed | `onTabChange` is called. The header is controlled: it waits for the new `activeTab` |

### Layout

| Case | Behaviour |
|---|---|
| Narrow | Everything stacks: result, then extras, then tabs |
| Wide | The extras move to the end of the result's row, slogan above link. Tabs stay underneath, across the full width |

The content is the same in both. Which layout applies depends on the width the header is given, not on the viewport.

### Invalid and edge input

Nothing throws. The slogan and the link are someone else's words in the product's most trusted spot, so a malformed one is dropped rather than shown broken.

| Input | Behaviour |
|---|---|
| Orientation absent | No match |
| Confidence absent or not a number | No match |
| Confidence outside 0-100 | Clamped |
| Orientation without an image | A neutral placeholder inside the ring |
| Name longer than the room | Wraps onto a second line, then is truncated; complete for assistive technology |
| Slogan or link label longer than the room | Truncated to one line; complete for assistive technology |
| Link with an empty label | The address is shown as the label |
| Link whose address is not `http:` or `https:` | The link is not drawn |
| Slogan with line breaks | Collapsed to one line |

### Accessibility

- The name is the main heading of the result screen.
- The ring is decorative. The confidence is carried by its text.
- A band is never carried by colour alone: no match changes the wording, and a partial match differs from a match by its number.
- The tabs are a tab list, operable from the keyboard, with the selected tab announced.
- The link says that it opens in a new tab, and is opened with `rel="noopener noreferrer"`.

# Copy

Polish is the source language, and every string is translatable. Each one below goes through a Lingui macro - `<Trans>` for JSX text, `t` or `msg` for attributes and ARIA text - with no hardcoded literals. After adding them run `yarn i18n:extract`, fill in the English entries in `src/locales/en/messages.po`, and commit both `.po` files. The wording is a proposal: adjust it if needed, but keep the meaning.

| Where | Polish (source) | English |
|---|---|---|
| Name, no match | Brak dopasowania | No match |
| Confidence | {value}% pewności | {value}% confidence |
| First tab | Twoje wyniki | Your results |
| Second tab | Tryb porównania | Comparison mode |
| Link, for assistive technology | {label} (otwiera się w nowej karcie) | {label} (opens in a new tab) |

# Athena components to use

- **`Tabs`** for the two tabs, if it can render two equal-width tabs as in Figma. If it cannot, say why in the PR.
- **`Avatar`** for the orientation's image inside the ring.
- **`Button`** for the link, rendered as an anchor.
- The confidence ring has no Athena equivalent. Draw it with SVG and Tailwind; no charting library.

# Out of scope

- Deciding which orientation leads and how confident the result is.
- What each tab shows - the header only reports the choice.
- The identity block of the generated result image.
- Moderating the slogan and the link.
- Wiring the header into a page.

# Files to create

```
src/components/results/modules/ResultsHeader/
├── ResultsHeader.tsx
├── ResultsHeader.test.tsx
├── ResultsHeader.types.ts
└── ResultsHeader.stories.tsx

src/utils/results/
├── getMatchBand.ts
└── getMatchBand.test.ts

src/constants/results.ts       # PARTIAL_MATCH_FROM, MATCH_FROM
```

No empty files - add a constants file or a subcomponent only if the view needs one.

# Unit test cases (BDD)

```ts
describe('getMatchBand()', () => {
  describe('given a value below 50', () => {
    it('returns none', ...);
  });
  describe('given 50', () => {
    it('returns partial', ...);
  });
  describe('given 79.9', () => {
    it('returns partial, on the exact value', ...);
  });
  describe('given 80', () => {
    it('returns match', ...);
  });
  describe('given a value outside 0-100', () => {
    it('clamps it first', ...);
  });
  describe('given no value or a value that is not a number', () => {
    it('returns none', ...);
  });
});

describe('<ResultsHeader />', () => {
  describe('given a match', () => {
    it('renders the image, the name and the rounded confidence with its word', ...);
    it('renders the name as the main heading', ...);
    it('renders the ring and the confidence in the match colour', ...);
  });
  describe('given a partial match', () => {
    it('renders the ring and the confidence in the partial colour', ...);
  });
  describe('given no match', () => {
    it('renders the question mark and the no match wording', ...);
    it('renders no ring and no confidence', ...);
    it('does not render the orientation name or image', ...);
    it('renders neither the slogan nor the link', ...);
  });
  describe('given no orientation or no confidence', () => {
    it('renders no match', ...);
  });
  describe('given a slogan', () => {
    it('renders it as a non-interactive chip', ...);
    it('collapses line breaks into one line', ...);
  });
  describe('given a link', () => {
    it('renders a link that opens in a new tab and says so', ...);
    it('shows the address when the label is empty', ...);
    it('renders nothing when the address is not http or https', ...);
  });
  describe('given neither slogan nor link', () => {
    it('does not render the extras row', ...);
  });
  describe('given an orientation without an image', () => {
    it('renders a placeholder inside the ring', ...);
  });
  describe('tabs', () => {
    it('renders both tabs, results first', ...);
    it('marks the active tab as selected', ...);
    describe('when the other tab is pressed', () => {
      it('calls onTabChange with that tab', ...);
      it('does not switch until activeTab changes', ...);
    });
    it('is operable from the keyboard', ...);
  });
});
```

# Storybook stories

**Figma, in the frame's order**
- `Standard`
- `WithExtras` - slogan and link
- `NoMatch`
- `Desktop` - the wide layout

**Bands**
- `PartialMatch` - 75
- `Match` - 80
- `JustBelowPartial` - 49

**Edge**
- `SloganOnly`, `LinkOnly`, `InvalidLink`, `LinkWithoutLabel`
- `LongName`, `LongSlogan`, `NoImage`
- `ComparisonTabActive`

# Remember about standards

- Use the standard colors palette, never add colors directly (check https://tailwindcss.com/docs/colors and our color palette in the `src/index.css` file and in [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css))
- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Create a Storybook story for the component with all possible props variants of the component
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)
- Name the branch `feature/results-header-68`, following [Conventional Branch](https://conventional-branch.github.io/) - never keep a generated or default branch name
- Copy is Polish by default and fully translatable: every literal string and every ARIA text goes through Lingui macros, and the English entries are filled in (see Copy). Names and values come from props
- The PR follows the repository's pull request template, with screenshots of the Figma stories next to the Figma frame

# Dependencies

- None. This task can start straight away.

# Resources

- [Spec - Header](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/header.md) - every case, in full
- [Docs - Header](https://github.com/gi-org-pl/product/blob/main/mypolitics/docs/modules/quiz/results/modules/header.md) - why the module exists
- [Figma - Header frame](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5500-3239) - [standard](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5514-56202) | [with slogan and link](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5514-56229) | [no match](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5514-56288) | [desktop](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5514-56171) | [the match bands](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5514-35810)
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Storybook docs](https://storybook.js.org/docs/writing-stories)
- [Tailwind docs](https://tailwindcss.com/docs/)
- [Vitest docs](https://vitest.dev/guide/)

# Definition of Done

- [ ] Code follows folder structure (`docs/frontend/conventions/PROJECT_STRUCTURE.md`)
- [ ] Naming follows `docs/frontend/conventions/NAMING.md`
- [ ] Component layout follows `docs/frontend/conventions/COMPONENT_STRUCTURE.md`
- [ ] Bands come from `getMatchBand` and the constants in `src/constants/results.ts`, on the exact value
- [ ] 75 renders in the partial band's colour, not as Figma draws it
- [ ] No match shows the question mark and the wording, and hides the name, image, ring, confidence, slogan and link
- [ ] The link opens only `http:` and `https:` addresses, in a new tab, with `rel="noopener noreferrer"`
- [ ] The tabs are controlled through `activeTab` and `onTabChange`
- [ ] The layout follows the header's own width
- [ ] The name is the main heading; the tabs are a keyboard-operable tab list
- [ ] Invalid input degrades as in the table, without throwing
- [ ] Unit tests added, BDD style, coverage ≥95% on all new files
- [ ] Storybook stories added for all variants listed above
- [ ] Biome lint clean
- [ ] TypeScript clean (no `any`, no `@ts-ignore`)
- [ ] Every string from the Copy section goes through a Lingui macro, with Polish as the source; `yarn i18n:extract` run, English entries translated, `.po` files committed
- [ ] Branch named `feature/results-header-68`
- [ ] CI green: build, lint, test
