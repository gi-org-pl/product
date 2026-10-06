<img alt="Traits - alone and in comparison" src="https://raw.githubusercontent.com/gi-org-pl/product/main/mypolitics/assets/traits.png" />

# Story

As a user reading my quiz result, I want the traits I earned shown as a set of badges, and in comparison I want to see which of them my friend shares and which only they have, so that I can tell at a glance what we have in common.

# Component properties

**Component:** `Traits`
**Location:** `src/components/results/modules/Traits/`
**Shared:** no - a result module, in the `results` domain

A `ModuleWrapper` around a set of pills, one per earned trait. The only result module with no bar: a trait is held or not held. **No state, and it does not decide who earned what.**

```ts
export interface TraitsComparison {
  party: AxisOrientation; // the other party; imageUrl is their avatar
  earnedIds: string[];    // ids of the traits they earned
}

export interface TraitsProps {
  title?: string;
  traits: AxisOrientation[];     // every trait the quiz defines, in the quiz's order; imageUrl is the trait's icon
  earnedIds: string[];           // ids of the traits the taker earned
  comparison?: TraitsComparison; // its presence turns comparison on
  onStatsClick?: () => void;
  onInfoClick?: () => void;
}
```

**Why this shape.** The quiz's traits are configuration and who earned what is a result, so they arrive separately: the definitions once, in the quiz's order, and each party's result as a list of ids. That keeps the order in one place, makes the taker and the other party symmetrical, and means adding a comparison is adding one object rather than rewriting the list. Two lists of earned traits would not work - they cannot be merged back into the quiz's order - and one list with per-trait flags mixes configuration with results.

A trait nobody earned is not drawn.

# Behaviour

The [spec](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/traits.md) is the source of truth for every case below; the [Figma frame](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5513-26739) is the source of truth for sizes, spacing, type, icons and colours.

### Pills

| Case | Behaviour |
|---|---|
| A trait | One pill: the trait's icon, then its name, on the trait's colour |
| Several traits | Pills flow in a row and wrap onto further rows, in the order given |
| A trait without an icon | The pill shows the name alone |
| A pill pressed | Nothing happens. Pills are not interactive |

The order means nothing. Never sort, number or emphasise one pill over another, and never resize pills to fit.

### Comparison

With `comparison`, the set drawn is every trait either party earned, in the order of `traits`.

| Case | Behaviour |
|---|---|
| Both earned it | A solid pill carrying the other party's avatar on its corner |
| Only the taker earned it | A solid pill with no avatar |
| Only the other party earned it | A hatched pill carrying the other party's avatar |
| The other party earned nothing | The taker's pills, all without an avatar |

The hatching is the same pattern `UniversalAxis` uses for comparison. If that pattern is not reusable as it stands, extract it to a shared place; do not draw a second one.

### Empty

| Case | Behaviour |
|---|---|
| No traits, no comparison | The card is drawn with one line of text saying no traits were earned |
| No traits for either party | The same line |
| The taker earned none, the other party did | The other party's pills, all hatched |

Figma does not draw the empty state. Use ordinary body text; the wording is in Copy.

### Invalid and edge input

| Input | Behaviour |
|---|---|
| Name longer than the card | The pill is as wide as the card at most; the name is truncated to one line, complete for assistive technology |
| Trait without a name | Not drawn |
| Trait without a colour | The neutral fallback colour |
| Trait with a light colour | The label stays readable: dark text on a light pill, light text on a dark one |
| The same trait listed twice | Drawn once |
| Other party without an avatar | A neutral avatar placeholder in the same place |
| `comparison` with an empty or missing `earnedIds` | Treated as the other party having earned nothing |
| An id in either `earnedIds` that no trait has | Ignored |
| Trait neither party earned | Not drawn |

### Accessibility

- The pills are a list, and each item is its trait's name.
- In comparison each item also says whose it is in words - shared with the other party, or only theirs. Hatching and the avatar are never the only carriers.
- The trait icon is decorative.

# Copy

Polish is the source language, and every string is translatable. Each one below goes through a Lingui macro - `<Trans>` for JSX text, `t` or `msg` for attributes and ARIA text - with no hardcoded literals. After adding them run `yarn i18n:extract`, fill in the English entries in `src/locales/en/messages.po`, and commit both `.po` files. The wording is a proposal: adjust it if needed, but keep the meaning.

| Where | Polish (source) | English |
|---|---|---|
| The empty line | Brak zdobytych cech | No traits earned |
| Item name for assistive technology, shared | {trait} - wspólna z: {name} | {trait} - shared with {name} |
| Item name for assistive technology, only theirs | {trait} - tylko {name} | {trait} - only {name} |

# Athena components to use

- `ModuleWrapper` from `src/components/shared/`.
- **`Avatar`** for the other party's image on a pill.
- Do **not** use Athena's `Badge` for the pill unless it can take a runtime colour, an icon and the hatched look; if it cannot, build the pill with Tailwind and say so in the PR.
- Orientation colours are author-supplied data, not design tokens. Apply them at runtime through a CSS custom property, exactly as `UniversalAxis` does (approved in [mypolitics-app#61](https://github.com/gi-org-pl/mypolitics-app/pull/61#issuecomment-6007060837)), and accept only values that pass `SAFE_COLOR_PATTERN`. That check lives in `UniversalAxis.constants.ts` today: promote it to a shared place instead of copying it. Every other colour comes from the palette.

# Out of scope

- Deciding whether a trait is earned.
- The mid-quiz card that announces a trait.
- Moderating trait names.
- Hiding the module for a quiz with no traits configured.

# Files to create

```
src/components/results/modules/Traits/
├── Traits.tsx
├── Traits.test.tsx
├── Traits.types.ts
├── Traits.stories.tsx
├── TraitPill/                 # the pill, with its solid and hatched looks
│   ├── TraitPill.tsx
│   └── TraitPill.test.tsx
└── utils/
    ├── getTraitItems.ts       # pure: definitions and both id lists in; the drawn set with who holds each out
    └── getTraitItems.test.ts
```

Keep the merging in the pure util so the comparison cases are tested without rendering. No empty files.

# Unit test cases (BDD)

```ts
describe('getTraitItems()', () => {
  describe('given no comparison', () => {
    it('returns the traits the taker earned, in the order of the definitions', ...);
    it('ignores an earned id that no trait has', ...);
    it('drops a trait without a name', ...);
    it('returns a trait defined twice once', ...);
  });
  describe('given a comparison', () => {
    it('marks a trait both earned as shared', ...);
    it('marks a trait only the taker earned as the taker own', ...);
    it('marks a trait only the other party earned as theirs', ...);
    it('drops a trait neither earned', ...);
    it('keeps the order of the definitions', ...);
    it('returns only theirs when the taker earned none', ...);
    it('treats missing earnedIds as nothing earned', ...);
  });
});

describe('<Traits />', () => {
  describe('given traits', () => {
    it('renders one pill per trait, with its icon and name', ...);
    it('renders the pills as a list', ...);
    it('renders a pill without an icon with the name alone', ...);
    it('does not make the pills interactive', ...);
  });
  describe('given a comparison', () => {
    it('renders a shared trait solid, with the other party avatar', ...);
    it('renders a trait only the other party earned hatched, with their avatar', ...);
    it('renders a trait only the taker earned solid, with no avatar', ...);
    it('says in words whose each trait is', ...);
    it('renders a placeholder when the other party has no avatar', ...);
  });
  describe('given no traits', () => {
    it('renders the empty line', ...);
    it('renders the other party pills hatched when only they earned traits', ...);
  });
  describe('given a trait without a colour', () => {
    it('uses the neutral colour', ...);
  });
  describe('given a trait with a light colour', () => {
    it('renders the label in a dark tone', ...);
  });
  describe('given handlers', () => {
    it('passes onStatsClick and onInfoClick to the wrapper', ...);
  });
});
```

# Storybook stories

**Figma, in the frame's order**
- `Standard` - placeholder traits
- `Example`
- `Comparison` - shared, the taker's own and only-theirs together

**Edge**
- `Empty`, `EmptyForBoth`, `OnlyTheirs`
- `ManyTraits` - wrapping onto several rows
- `LongName`, `NoIcon`, `NoColor`, `LightColor`
- `ComparisonWithoutAvatar`

# Remember about standards

- Use the standard colors palette, never add colors directly (check https://tailwindcss.com/docs/colors and our color palette in the `src/index.css` file and in [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css))
- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Create a Storybook story for the component with all possible props variants of the component
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)
- Name the branch `feature/traits-67`, following [Conventional Branch](https://conventional-branch.github.io/) - never keep a generated or default branch name
- Copy is Polish by default and fully translatable: every literal string and every ARIA text goes through Lingui macros, and the English entries are filled in (see Copy). Names and values come from props
- The PR follows the repository's pull request template, with screenshots of the Figma stories next to the Figma frame

# Dependencies

- `ModuleWrapper` - done ([#62](https://github.com/gi-org-pl/mypolitics-app/issues/62))

# Resources

- [Spec - Traits](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/traits.md) - every case, in full
- [Docs - Traits](https://github.com/gi-org-pl/product/blob/main/mypolitics/docs/modules/quiz/results/modules/traits.md) - why the module exists
- [Figma - Traits frame](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5513-26739) - [standard](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5513-28051) | [example](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5513-27851) | [comparison](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5514-40488)
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Storybook docs](https://storybook.js.org/docs/writing-stories)
- [Tailwind docs](https://tailwindcss.com/docs/)
- [Vitest docs](https://vitest.dev/guide/)

# Definition of Done

- [ ] Code follows folder structure (`docs/frontend/conventions/PROJECT_STRUCTURE.md`)
- [ ] Naming follows `docs/frontend/conventions/NAMING.md`
- [ ] Component layout follows `docs/frontend/conventions/COMPONENT_STRUCTURE.md`
- [ ] Pills render in the order given, wrap, and are never sorted or resized
- [ ] Comparison renders the three kinds: shared, the taker's own, only theirs
- [ ] The hatching is the same pattern `UniversalAxis` uses, not a second one
- [ ] An empty set renders the empty line instead of a blank body
- [ ] Labels stay readable on any author colour
- [ ] The author-supplied colour is applied only through a CSS custom property and validated
- [ ] Each item says in words whose it is in comparison
- [ ] Props are the quiz's trait definitions plus each party's earned ids; the order comes from the definitions only
- [ ] Invalid input degrades as in the table, without throwing
- [ ] Unit tests added, BDD style, coverage ≥95% on all new files
- [ ] Storybook stories added for all variants listed above
- [ ] Biome lint clean
- [ ] TypeScript clean (no `any`, no `@ts-ignore`)
- [ ] Every string from the Copy section goes through a Lingui macro, with Polish as the source; `yarn i18n:extract` run, English entries translated, `.po` files committed
- [ ] Branch named `feature/traits-67`
- [ ] CI green: build, lint, test
