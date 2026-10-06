<img alt="Module wrapper - the four configurations drawn in Figma" src="https://raw.githubusercontent.com/gi-org-pl/product/main/mypolitics/assets/module-wrapper.png" />

# Story

As a user reading my quiz result, I want every module to sit in the same card - a title, a button for statistics, a button for the explanation, and the result under them - so that a screen of different charts reads as one product and I always know where to look for what a number means.

# Component properties

**Component:** `ModuleWrapper`
**Location:** `src/components/shared/ModuleWrapper/`
**Shared:** yes - used by the result modules and by the quiz editor

Purely presentational: **no state, no data access, no knowledge of what the body is**. It does not open the statistics or the explanation itself; it only reports that a button was pressed.

```ts
export interface ModuleWrapperProps {
  title?: ReactNode;         // a string is a text title; any other node is a component title
  ariaLabel?: string;        // name of the card for assistive technology; needed with a component title
  onStatsClick?: () => void; // the statistics button is drawn only when this is passed
  onInfoClick?: () => void;  // the info button is drawn only when this is passed
  children?: ReactNode;      // the body
}
```

There is deliberately no `showStats` / `showInfo` flag: an action exists exactly when something is listening for it, so a button that does nothing cannot be drawn.

# Behaviour

The [spec](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/module-wrapper.md) is the source of truth for every case below; the [Figma frame](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5500-3483) is the source of truth for sizes, spacing, type, icons and colours.

Mind the Figma labels: there, "action" means the title is a component, not that the buttons are present. The variant labelled "without actions" has both buttons.

### Title

| Case | Behaviour |
|---|---|
| Text title | Drawn in the title pill, centred, on one line |
| Text title longer than the slot | Truncated visually, complete for assistive technology |
| Component title | Replaces the pill. The wrapper adds no border, background or text styling of its own |
| Component title larger than the slot | Clipped to the slot. It never grows the header or pushes a button out |
| Text title pressed | Nothing happens. A text title is not interactive |

### Actions

| Case | Behaviour |
|---|---|
| Both handlers passed | Statistics first, info last, at the end of the header |
| `onStatsClick` only | One button, at the end of the header |
| `onInfoClick` only | One button, at the end of the header |
| Neither | No buttons |
| Button pressed | Its handler is called once per press. Nothing else on the card changes |

A missing button leaves no gap: the title slot takes the room. There is no disabled, loading or badge state for either button.

### Layout

| Case | Behaviour |
|---|---|
| Header | Title slot first, actions after it, on one row of fixed height |
| Title slot width | Whatever the actions leave - widest with no actions, narrowest with two |
| Divider | Across the full card width, between header and body |
| Card width | The width the card is given |
| Card height | The header plus whatever the body needs. No minimum, no maximum |

There is **no compact variant**: the card keeps its padding and header height at every width.

### Configurations

The title kind and each button are independent, which gives eight configurations. Figma draws four; the other four follow the same layout rule and need no design of their own.

| Configuration | Figma label |
|---|---|
| Text title, no actions | "no actions nor stats/info" |
| Text title, statistics and info | "without actions" |
| Component title, statistics and info | "with action" |
| Component title, statistics only | "with action, w/o info" |
| Text title with one action, component title with info only, component title with no actions | not drawn |

### Invalid and edge input

Nothing here throws - titles are author-supplied and can be wrong, and a card with a bad title must still show its result.

| Input | Behaviour |
|---|---|
| Title missing, empty or only whitespace | Treated as no title |
| No title and no actions | The header and the divider are not drawn. The card is its body alone |
| No title, with actions | The header is drawn with the actions in their usual place and an empty title slot |
| Title text with line breaks | Collapsed to one line |
| Body missing or empty | Header and divider are drawn, nothing under them |
| No title, no actions and no body | An empty card |
| Body wider than the card | The body gets the card's inner width. The wrapper never scrolls sideways |

### Rules

- The two buttons are the only controls the wrapper adds - no menu, no close, no collapse, no link on the card itself.
- The wrapper never looks inside the body: it does not measure it, scroll it or clip it to a height.
- The wrapper never hides itself. Leaving a module out is the caller's decision.
- A caller cannot restyle the card, move the actions or remove the divider. The title slot is the only part it controls, so do not expose a `className` for the card.
- Nothing may depend on hover or on viewport size: where a result is drawn without interaction, the caller simply passes no handlers and gets the titled card.

### Accessibility

- The card is a labelled region, named by its text title, or by `ariaLabel` when the title is a component.
- A text title is a heading, so a screen reader user can move from module to module.
- Both buttons are icon-only, so each has a text name that includes the module's name, for example "Statystyki: {name}" and "Informacje: {name}". A screen with a dozen modules must not announce a dozen identical buttons. With no name available, the button name stands alone.
- Focus order follows reading order: the title component if it is interactive, statistics, info, then the body.
- Both buttons work from the keyboard and show a visible focus state.
- The pressable area of each button is at least 44x44 CSS px although the button is drawn smaller, and the two areas do not overlap.

# Athena components to use

- **`Button`** with `isIconButton` for the two actions, if it can match the round icon button in Figma. If it cannot, use a native `<button>` and say why in the PR.
- Do **not** use Athena's `Section`. It looks like the same thing - a title, actions and children - but its title is a fixed-style heading that cannot hold a component, it has no divider, its body has its own background and radius, and its actions label is hardcoded in English.
- The two icons (statistics, info) are not in the app yet. Export them from the Figma frame into `src/assets/icons/`.

# Out of scope

- What the two buttons open - the statistics view and the info modal are separate work. Here the handlers are just called.
- Anything in the body: the result modules themselves and the universal axis.
- Deciding whether a module is shown, and what replaces a module that fails to render - both belong to the screen that composes the cards.
- Checkpoint cards.

# Files to create

```
src/components/shared/ModuleWrapper/
├── ModuleWrapper.tsx
├── ModuleWrapper.test.tsx
├── ModuleWrapper.types.ts        # ModuleWrapperProps
└── ModuleWrapper.stories.tsx

src/assets/icons/                 # the statistics and info icons, kebab-case
```

Add a constants file or a subcomponent only if the view needs one - no empty files.

# Unit test cases (BDD)

```ts
describe('<ModuleWrapper />', () => {
  describe('given a text title', () => {
    it('renders the title as a heading', ...);
    it('names the card region after the title', ...);
    it('keeps the full title available when it is truncated', ...);
    it('collapses line breaks into one line', ...);
    it('does not make the title interactive', ...);
  });

  describe('given a component title', () => {
    it('renders the component in place of the title pill', ...);
    it('names the card region with ariaLabel', ...);
  });

  describe('given both handlers', () => {
    it('renders the statistics button before the info button', ...);
    it('names each button with the module name', ...);
    describe('when the statistics button is pressed', () => {
      it('calls onStatsClick once', ...);
    });
    describe('when the info button is pressed', () => {
      it('calls onInfoClick once', ...);
    });
    it('reaches both buttons with the keyboard, statistics first', ...);
  });

  describe('given only onStatsClick', () => {
    it('renders the statistics button and no info button', ...);
  });

  describe('given only onInfoClick', () => {
    it('renders the info button and no statistics button', ...);
  });

  describe('given no handlers', () => {
    it('renders no buttons', ...);
  });

  describe('given no title', () => {
    it('treats an empty or whitespace title as no title', ...);
    it('renders no header and no divider when there are no actions either', ...);
    it('renders the header with the actions when there are actions', ...);
    it('names the buttons without a module name', ...);
  });

  describe('given a body', () => {
    it('renders the children under the divider', ...);
  });

  describe('given no body', () => {
    it('still renders the header and the divider', ...);
  });

  describe('given nothing at all', () => {
    it('renders an empty card without throwing', ...);
  });
});
```

# Storybook stories

The four configurations from Figma first, in the frame's order, then the ones Figma does not draw, then the edge cases:

**Figma**
- `TitleOnly` - "no actions nor stats/info"
- `WithActions` - "without actions": text title, both buttons
- `ComponentTitle` - "with action": component title, both buttons
- `ComponentTitleStatsOnly` - "with action, w/o info"

**Not drawn**
- `StatsOnly`, `InfoOnly` - text title with one button
- `ComponentTitleInfoOnly`
- `ComponentTitleOnly`

**Edge**
- `LongTitle` - a title that does not fit, truncated
- `NoHeader` - no title and no actions, body alone
- `ActionsWithoutTitle`
- `EmptyBody`

# Remember about standards

- Use the standard colors palette, never add colors directly (check https://tailwindcss.com/docs/colors and our color palette in the `src/index.css` file and in [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css))
- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Create a Storybook story for the component with all possible props variants of the component
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)
- Name the branch `feature/module-wrapper-62`, following [Conventional Branch](https://conventional-branch.github.io/) - never keep a generated or default branch name
- The button names go through Lingui macros, with `pl` as the source locale; the title and `ariaLabel` come from props
- The PR follows the repository's pull request template, with screenshots of the four Figma stories next to the Figma frame

# Resources

- [Spec - Module wrapper](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/module-wrapper.md) - every case, in full
- [Docs - Module wrapper](https://github.com/gi-org-pl/product/blob/main/mypolitics/docs/modules/quiz/results/modules/module-wrapper.md) - why the frame exists
- [Figma - Module wrapper frame](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5500-3483) - [title only](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5500-3499) | [text title with both buttons](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5500-3506) | [component title with both buttons](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5500-3519) | [component title with statistics](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5500-3532)
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Storybook docs](https://storybook.js.org/docs/writing-stories)
- [Tailwind docs](https://tailwindcss.com/docs/)
- [Vitest docs](https://vitest.dev/guide/)

# Definition of Done

- [ ] Code follows folder structure (`docs/frontend/conventions/PROJECT_STRUCTURE.md`)
- [ ] Naming follows `docs/frontend/conventions/NAMING.md`
- [ ] Component layout follows `docs/frontend/conventions/COMPONENT_STRUCTURE.md`
- [ ] The four Figma configurations render as in Figma
- [ ] The four configurations Figma does not draw follow the same layout rule
- [ ] A text title is truncated to one line; a component title replaces the pill and is clipped to the slot
- [ ] A button is drawn only when its handler is passed; there is no disabled or loading state
- [ ] A missing button leaves no gap - the title slot takes the room
- [ ] Invalid input (empty title, no title, no body, nothing at all) degrades as in the table, without throwing
- [ ] The card is a labelled region, a text title is a heading, and each button's name includes the module name
- [ ] Both buttons are keyboard-operable with a visible focus state and a pressable area of at least 44x44 CSS px
- [ ] No hover- or viewport-dependent rendering; no compact variant
- [ ] Athena's `Section` is not used
- [ ] Unit tests added, BDD style, coverage ≥95% on all new files
- [ ] Storybook stories added for all variants listed above
- [ ] Biome lint clean
- [ ] TypeScript clean (no `any`, no `@ts-ignore`)
- [ ] Button names wrapped in Lingui macros; `yarn i18n:extract` run, `.po` files committed
- [ ] Branch named `feature/module-wrapper-62`
- [ ] CI green: build, lint, test
