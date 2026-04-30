# Story
As a user, I want to see a navigation header at the top of the page so I can easily navigate between the main sections of myPolitics (Quizy, Sondaże, Debaty) regardless of the device I'm using.

# Component properties

**Component:** `Header`
**Location:** `src/components/shared/Header/`
**Shared:** yes — do not embed in any page yet; it will be wired up to a layout later.

```ts
// No external props required — all data comes from internal constants
// Component signature:
export const Header: React.FC = () => { ... }
```

Navigation items (derive from `constants/paths.ts` — see below):

| Label    | Path / URL                   | Active style          |
|----------|------------------------------|-----------------------|
| Quizy    | `/quizzes`                   | filled teal Button    |
| Sondaże  | `https://polls.mypolitics.pl` | ghost/outline Button  |
| Debaty   | `/debates`                   | ghost/outline Button  |

The currently active route should render its nav item with the filled (primary) variant; others use the outline/ghost variant.

# Implementation notes

### Paths constant
Add (or extend) `src/constants/paths.ts`:
```ts
export const PATHS = {
  home: '/',
  quizzes: '/quizzes',
  debates: '/debates',
  polls: 'https://polls.mypolitics.pl', // external
} as const;
```

### Desktop layout
- Logo (myPolitics SVG) on the left — clicking it navigates to `/` (use `PATHS.home`).
- Nav items on the right: **Debaty**, **Sondaże**, **Quizy** (order matches the Figma design).
- Use the `Button` component from the shared component library for nav items.
- Active route → `variant="primary"` (filled teal); inactive → `variant="ghost"` or `variant="outline"`.
- Each nav item includes a leading icon (match the icons from the Figma screenshot).

### Mobile layout (hamburger)
- Below a breakpoint (suggest `md` / 768 px), hide the right-side nav and show a **hamburger icon button** (≡).
- Clicking the hamburger toggles a dropdown/drawer below the header bar.
- Dropdown shows nav items stacked vertically in the same order: Quizy (filled), Sondaże, Debaty.
- Clicking any nav item closes the menu.
- Clicking outside the menu closes it.
- Toggle state managed with `useState` (no Zustand needed here).

### Routing
- Internal paths (`/quizzes`, `/debates`, `/`) → use React Router `<Link>` or `<NavLink>` so no full-page reload.
- External path (`polls.mypolitics.pl`) → plain `<a href="..." target="_blank" rel="noopener noreferrer">`.

### i18n
All user-visible strings must use Lingui macros:
```tsx
import { Trans } from '@lingui/react';
import { msg } from '@lingui/core';

// label example
<Trans>Quizy</Trans>
// aria-label example
const label = t`Otwórz menu nawigacji`;
```
Run `yarn i18n:extract` after adding strings.

# Remember about standards
- Use the standard colors palette, never add colors directly (check https://tailwindcss.com/docs/colors and our color palette in the `src/index.css` file and in [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css))
- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Create a Storybook story for the component with all possible props variants of the component
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)

## Files to create

```
src/
├── constants/
│   └── paths.ts                          # PATHS constant (create or extend)
└── components/
    └── shared/
        └── Header/
            ├── Header.tsx                # Main component
            ├── Header.test.tsx           # Unit tests
            ├── Header.types.ts           # (skip if no custom types needed)
            └── Header.stories.tsx        # Storybook stories
```

## Unit test cases (BDD)

```ts
describe('<Header />', () => {
  describe('on desktop', () => {
    it('renders the myPolitics logo linking to home', ...);
    it('renders all three nav items', ...);
    it('applies the active style to the current route', ...);
    it('does not show the hamburger button', ...);
  });

  describe('on mobile', () => {
    it('shows the hamburger button and hides nav items', ...);
    describe('when the hamburger is clicked', () => {
      it('opens the mobile navigation menu', ...);
      it('closes the menu when a nav item is clicked', ...);
      it('closes the menu when clicking outside', ...);
    });
  });
});
```

## Storybook stories

- `Default` — desktop, no active route
- `ActiveQuizy` — desktop, Quizy active
- `ActiveSondaze` — desktop, Sondaże active
- `ActiveDebaty` — desktop, Debaty active
- `MobileClosed` — mobile viewport, hamburger closed
- `MobileOpen` — mobile viewport, hamburger open

# Resources
- [Legacy repo link](https://github.com/gi-org-pl/mypolitics-app-legacy/tree/main/frontend) — check how the existing Header is implemented and how routes are structured
- [mypolitics.pl](https://mypolitics.pl) — see the live header in action across breakpoints
- [Figma project link](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=1190-9207&t=k6GtQ4k9HtLFKbnM-1)
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Storybook docs](https://storybook.js.org/docs/writing-stories)
- [Tailwind docs](https://tailwindcss.com/docs/)
- [Vitest docs](https://vitest.dev/guide/)

# Definition of Done
- [ ] Code follows folder structure (`docs/frontend/conventions/PROJECT_STRUCTURE.md`)
- [ ] Naming follows `docs/frontend/conventions/NAMING.md`
- [ ] Component layout follows `docs/frontend/conventions/COMPONENT_STRUCTURE.md`
- [ ] Unit tests added/updated, BDD style, coverage ≥95% on changed files
- [ ] Playwright happy-path e2e added/updated (Gherkin) — hamburger toggle + nav clicks
- [ ] Biome lint clean (no disabled rules without justification)
- [ ] TypeScript clean (no `any`, no `@ts-ignore` without comment)
- [ ] Storybook story added (all variants listed above)
- [ ] All user-visible strings wrapped in Lingui macros (`<Trans>`, `t`, `msg`) — no hardcoded literals
- [ ] `yarn i18n:extract` run after adding/changing strings; `.po` files committed
- [ ] `PATHS` constant used for all routes — no hardcoded path strings in the component
- [ ] Component **not** embedded in any page (layout wiring is a separate task)
- [ ] CI green: build, lint, test, e2e
