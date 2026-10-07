# Story

As a user browsing the home page, I want each quiz shown as a card with its name, what it is about, how long it takes and how many people took it, so that I can decide which one to start.

# Status

**Continue pull request [#25](https://github.com/gi-org-pl/mypolitics-app/pull/25) on its branch `feat/quiz-card`.** The behaviour is right and well tested: what is left is structure, translations and assets. Do not start over.

Already right in #25 - keep it:

- The variants match the six cards in the frame, including the expand and collapse on a narrow screen.
- The expand animation is CSS, with no library and no measuring.
- The tests follow Given-When-Then and cover the variants.

# What changed in this task

The first version of this task was wrong in four places. The frame wins in each:

- **The highlighted card is not dark.** It has the same surface as every other card; what marks it is the badge at the top and the "Rozpocznij" button. #25 already draws it this way.
- **A background image does not make a card always expanded.** The frame has an image card that collapses (with a chevron) and one that does not. Only `isAlwaysExpanded`, `isHighlighted` and a wide screen keep a card open.
- **The Lingui example imported from the wrong packages.** Macros come from `@lingui/react/macro` and `@lingui/core/macro`. Hand-built message objects are not a substitute.
- **`isMainAction` is removed.** The frame draws the play button filled on every card, so the prop has nothing left to switch.

# Component properties

**Component:** `QuizCard`
**Location:** `src/components/quiz/QuizCard/`
**Shared:** no - domain component under `quiz`

```ts
export interface QuizCardProps {
  title?: string;                  // text shown in place of the logo when there is no logoUrl
  logoUrl?: string;                // quiz logo image
  logoHeight?: 24 | 32;            // default 32
  backgroundUrl?: string;          // optional image at the top of the card
  cta?: string;                    // optional badge text, e.g. "Nowy Quiz Tożsamościowy!"
  description: string | ReactNode; // body text; may contain bold spans
  tags: string[];                  // chips, e.g. ["+1.5M osób", "15 min"]
  isHighlighted?: boolean;         // featured card: always expanded, default false
  isAlwaysExpanded?: boolean;      // never collapses, no chevron, default false
  isShowStartText?: boolean;       // the play button carries the "Rozpocznij" label, default false
  isButtonLoading?: boolean;       // the play button shows a spinner
  isButtonDisabled?: boolean;      // the play button is not rendered
  onButtonClick: () => void;       // play button
  onCardClick?: () => void;        // the card as a whole
}
```

# Behaviour

The [Figma frame](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=4236-18487) is the source of truth for sizes, spacing, type, icons and colours. The cases below are the source of truth for what happens.

### Header row

| Case | Behaviour |
|---|---|
| `logoUrl` given | The logo image, at `logoHeight` |
| No `logoUrl`, `title` given | The title as text. It wraps; it is never cut |
| Neither | The row holds the buttons alone |
| `isButtonDisabled` | No play button |
| `isButtonLoading` | The play button shows a spinner and cannot be activated twice |
| `isShowStartText`, wide screen | The play button carries the "Rozpocznij" label |
| `isShowStartText`, narrow screen | The play button is the icon alone |
| Play button activated | `onButtonClick`. `onCardClick` is not called |

### Expanding

| Case | Behaviour |
|---|---|
| Narrow screen, plain card | Starts collapsed: the header row only, with a chevron |
| Chevron activated | The description and tags open; the chevron turns. Activated again, they close |
| Wide screen | Always open, no chevron |
| `isAlwaysExpanded` or `isHighlighted` | Always open, no chevron, on any screen |
| Collapsed | The description and tags are not reachable by keyboard or assistive technology |

Everything that depends on the screen width is CSS. Only the open/closed toggle is state. The component renders the same on the server and in the browser.

### Image and badge

| Case | Behaviour |
|---|---|
| `backgroundUrl` given | The image at the top of the card, above the content |
| Image on a collapsed card | The short image, as on the first card of the frame |
| Image on an open card | The tall image, as on the third card of the frame |
| `cta` with an image | The badge sits on the bottom edge of the image |
| `cta` without an image | The badge sits at the top of the card |

### Body

| Case | Behaviour |
|---|---|
| `description` as text | A paragraph |
| `description` as a node | Rendered as given, so a bold lead stays bold |
| `tags` empty | No chip row |
| Two tags with the same text | Both are shown |

### Card click

| Case | Behaviour |
|---|---|
| `onCardClick` given | Clicking the card anywhere outside its buttons calls it |
| `onCardClick` given, keyboard | The logo or title is a real button that calls it, so nothing is mouse-only |
| No `onCardClick` | The card is not interactive and does not look it |

### Invalid and edge input

| Input | Behaviour |
|---|---|
| `title` only whitespace | Treated as absent |
| `cta` empty | No badge |
| `logoUrl` that fails to load | The image's alternative text, which is the title |
| `description` empty | No paragraph; tags still show |

### Accessibility

- The play button and the chevron have accessible names; their icons are decorative.
- The chevron states whether the content is expanded.
- The background image is decorative. The logo's alternative text is the title.
- A decorative image is never both named and hidden.

# Copy

Polish is the source; every string goes through a Lingui macro and the English entry is filled in.

| Text | Polish (source) | English |
|---|---|---|
| Play button label | Rozpocznij | Start |
| Play button name | Rozpocznij quiz | Start the quiz |
| Chevron name, collapsed | Rozwiń | Expand |
| Chevron name, open | Zwiń | Collapse |

Title, badge, description and tags come from props, already translated.

# Athena components to use

- `Button` for the play button (primary, with `isLoading`) and for the chevron (icon button). Do not build a spinner.
- No Athena component fits the card, the badge or the chips.

# What is left to fix in #25

1. **Merge `main`.** Athena is now `@gi-org-pl/athena`; the old import no longer resolves.
2. **Split `QuizCard.tsx`.** It is 278 lines holding a hook, a helper, a second component, a render function and three blocks of JSX kept in variables. One component per file: the image, the badge, the header row, the body and the chevron become nested subcomponents, each with its own test.
3. **Remove the viewport hook.** It reports "narrow" on the server and flips after load. Do the width-dependent parts in CSS, as the Expanding table says.
4. **Move the chevron out of `shared/`.** `ChevronDown` has one consumer and no test. Make it a nested subcomponent of `QuizCard`, using the existing `src/assets/icons/chevron-down.svg`, and delete `src/components/shared/ChevronDown/`.
5. **Use Lingui macros.** Replace the hand-built message objects and `<Trans id=...>`, then run the extraction. #25 adds four strings and changes neither `.po` file, so none of them can be translated today.
6. **Tidy the assets.**
   - One play icon in `src/assets/icons/`, taking its colour from the text colour - not two copies in two colours named after an icon font.
   - The quiz logo used by the stories is an SVG, so it goes with the other SVGs in `src/assets/icons/`, in kebab-case - not in `images/` under a mixed-case name. If `mypoliticslogo.svg`, which is already there, is the same artwork, reuse it instead.
   - The story background moves to `src/assets/images/home/`, in kebab-case.
7. **Make the card usable without a mouse**, as in the Card click table, and fix the image alternative texts as in Accessibility.
8. **Remove `isMainAction`** and draw the play button filled on every card.
9. **Tie the image height to open or collapsed**, not to `isHighlighted`.
10. **Use the scale.** No arbitrary value where the Tailwind scale or the palette has it, and no inline `style` for sizes.
11. **Fix the stories.** No decorator with a maximum width: the story shows the card alone. Check each at 320, 360 and 800 px; `Collapsed` uses a narrow viewport parameter.
12. **Key the tags safely**, so two equal tags do not collide - `src/utils/array/withKeys` exists for this.
13. **Move the tests with the code.** Each subcomponent gets the cases that are about it; the parent keeps composition. Find elements by role and name instead of by class.

# Out of scope

- The list of cards and its layout - [HomePage](https://github.com/gi-org-pl/mypolitics-app/issues/16).
- Where a card leads.
- The featured banner - `FeaturedQuizBanner`, done.

# Files

```
src/components/quiz/QuizCard/
├── QuizCard.tsx
├── QuizCard.test.tsx
├── QuizCard.types.ts
├── QuizCard.stories.tsx
├── QuizCardImage/          # background image
├── QuizCardBadge/          # the cta
├── QuizCardHeader/         # logo or title, chevron, play button
│   ├── QuizCardToggle/     # the chevron
│   └── QuizCardPlayButton/
└── QuizCardBody/           # description and tags
```

Each folder holds the component and its test, and nothing that is not needed. `src/components/shared/ChevronDown/` is deleted.

# Unit test cases (BDD)

```ts
describe('<QuizCard />', () => {
  describe('given a logoUrl', () => {
    it('renders the logo image named after the title', ...);
  });
  describe('given no logoUrl but a title', () => {
    it('renders the title as text', ...);
  });
  describe('given a backgroundUrl', () => {
    it('renders the image as decorative', ...);
  });
  describe('given a cta', () => {
    it('renders the badge', ...);
  });
  describe('given tags', () => {
    it('renders every chip', ...);
    it('renders two equal tags', ...);
  });
  describe('given no tags', () => {
    it('renders no chip row', ...);
  });
  describe('expand / collapse', () => {
    describe('given a plain card', () => {
      it('renders the chevron collapsed', ...);
      it('hides the body from assistive technology', ...);
      describe('when the chevron is activated', () => {
        it('reports itself as expanded', ...);
        it('exposes the body', ...);
      });
      describe('when the chevron is activated twice', () => {
        it('collapses again', ...);
      });
    });
    describe('given isAlwaysExpanded', () => {
      it('renders no chevron', ...);
      it('exposes the body', ...);
    });
    describe('given isHighlighted', () => {
      it('renders no chevron', ...);
    });
  });
  describe('play button', () => {
    describe('given isButtonLoading', () => {
      it('shows the loading state', ...);
    });
    describe('given isButtonDisabled', () => {
      it('renders no play button', ...);
    });
    describe('given isShowStartText', () => {
      it('renders the "Rozpocznij" label', ...);
    });
    describe('when activated', () => {
      it('calls onButtonClick', ...);
      it('does not call onCardClick', ...);
    });
  });
  describe('card click', () => {
    describe('given onCardClick', () => {
      it('calls it when the card is clicked', ...);
      it('calls it when the title button is activated by keyboard', ...);
    });
    describe('given no onCardClick', () => {
      it('renders no card-level button', ...);
    });
  });
});
```

The subcomponents take the cases above that are about them, in their own test files.

# Storybook stories

**Figma, in the frame's order**
- `ImageAndBadgeCollapsed` - "Polskie Lata 90."
- `LogoExpanded` - logo, description, tags
- `ImageAlwaysExpanded` - tall image, logo, description, tags
- `Highlighted` - badge, logo, "Rozpocznij"
- `BadgeAndTitle` - "Generacja Innowacja"
- `LogoOnly`

**Edge**
- `Loading`, `DisabledButton`
- `LongTitle`, `ManyTags`, `NoTags`
- `Clickable` - with `onCardClick`

# Remember about standards

- Use the standard colors palette, never add colors directly (check https://tailwindcss.com/docs/colors and our color palette in the `src/index.css` file and in [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css))
- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Create a Storybook story for the component with all possible props variants of the component
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)
- Keep working on the branch `feat/quiz-card`, so the pull request and its history stay. If the work is ever restarted on a new branch, name it `feature/quiz-card-11`, following [Conventional Branch](https://conventional-branch.github.io/)
- Read `AGENTS.md` in the repository before continuing - it was extended after this pull request was opened, and items 2, 3, 4, 11 and 13 above come straight from it
- The component fills its parent's width and its height comes from its content
- Run `yarn i18n:extract`, translate the new English entries, commit both catalogs
- No styled-components, no Next.js `Image`, no icon font
- The PR description lists decisions, deviations and verification, with screenshots of the stories next to the Figma frame

# Dependencies

None.

# Resources

- [Pull request #25](https://github.com/gi-org-pl/mypolitics-app/pull/25) - the work so far
- [Figma - QuizCard frame](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=4236-18487) - [image and badge, collapsed](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=4236-18536) | [logo, expanded](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=4236-18555) | [image, always expanded](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=4236-18580) | [highlighted](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=4237-56686) | [badge and title](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=4237-56798) | [logo only](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=4237-56816)
- [Legacy QuizCard](https://github.com/gi-org-pl/mypolitics-app-legacy/tree/main/frontend/src/shared/QuizCard) - for use cases only
- [Lingui - macros](https://lingui.dev/ref/macro)
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Storybook docs](https://storybook.js.org/docs/writing-stories)
- [Tailwind docs](https://tailwindcss.com/docs/)
- [Vitest docs](https://vitest.dev/guide/)

# Definition of Done

- [ ] `main` merged into the branch; build, lint and tests pass on the merged result
- [ ] Code follows folder structure (`docs/frontend/conventions/PROJECT_STRUCTURE.md`); assets are where the fix list says
- [ ] Naming follows `docs/frontend/conventions/NAMING.md`, asset files included
- [ ] Component layout follows `docs/frontend/conventions/COMPONENT_STRUCTURE.md`: one component per file, no helper, hook or render function in a component file, every subcomponent with its own test
- [ ] `src/components/shared/ChevronDown/` no longer exists
- [ ] The six cards of the frame are reproduced, the highlighted one on the normal card surface
- [ ] Width-dependent behaviour is CSS; no viewport hook; server and browser render the same
- [ ] `isMainAction` is gone; the play button is filled on every card
- [ ] The image is short on a collapsed card and tall on an open one
- [ ] With `onCardClick`, the card can be activated by keyboard; the play button never triggers the card
- [ ] Decorative images are hidden from assistive technology; named controls have Polish names
- [ ] Every string from the Copy section goes through a Lingui macro; `yarn i18n:extract` run, English entries translated, `.po` files committed
- [ ] The component fills its parent's width; stories checked at 320 / 360 / 800 px with no horizontal scroll and the title wrapping
- [ ] Unit tests BDD style, coverage ≥95% on changed files
- [ ] Storybook stories for all variants listed above, showing the card alone
- [ ] Biome lint clean
- [ ] TypeScript clean (no `any`, no `@ts-ignore`)
- [ ] PR states "No e2e: not mounted on any route"
- [ ] CI green: build, lint, test
