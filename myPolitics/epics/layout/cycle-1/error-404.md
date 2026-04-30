# Story
As a user who lands on a non-existent page, I want to see a friendly 404 error page so I understand something went wrong and can easily get back to the home page.

# Component properties

**Component:** `Error404`
**Location:** `src/components/shared/Error404/`
**Shared:** yes — do not embed in any page yet; it will be wired up to a route later.

```ts
// No external props required
export const Error404: React.FC = () => { ... }
```

# Implementation notes

### Copy (exact strings from Figma)
- **Heading:** `To jest błąd 404 ` (dark/black) + `na miarę naszych możliwości` (teal/primary color) + `!` (dark/black)
- **Body:** `My tym błędem otwieramy oczy niedowiarkom! Mówimy: to jest nasz błąd, przez nas zrobiony, i to nie jest nasze ostatnie słowo!`
- **Button label:** `Strona główna`

The teal portion of the heading is a `<span>` styled with the primary brand color — not a separate component.

### Button
Use the `Button` component from the shared library `athena` with `variant="primary"`.
Clicking it navigates to `PATHS.home` (`/`) via React Router `<Link>` (no full-page reload).

`PATHS.home` may not exist yet in `constants/paths.ts` — add it if missing:
```ts
export const PATHS = {
  home: '/',
  // ... other entries
} as const;
```

### Illustration
- A teal teddy bear SVG inside a light circular background (see Figma).
- Save the SVG to `src/assets/icons/bear-404.svg` (or `images/` if it's a raster asset).
- Render it as an `<img>` with a descriptive `alt` attribute (use `t` macro for the alt text).

### Desktop layout (≥ `md` / 768 px)
- Content is horizontally centered on the page.
- **Left:** illustration (large, ~160 px diameter circle).
- **Right:** heading, body text, then the "Strona główna" button — all left-aligned within the right column.
- The two columns are vertically centered relative to each other.

### Mobile layout (< `md`)
- Stacked vertically: illustration on top, then heading, body, button below — all left-aligned.
- Illustration is smaller (~64 px).

### i18n
All user-visible strings go through Lingui macros:
```tsx
import { Trans } from '@lingui/react';
import { t } from '@lingui/core';

<h1>
  <Trans>To jest błąd 404 <span className="text-primary">na miarę naszych możliwości</span>!</Trans>
</h1>

<p>
  <Trans>
    My tym błędem otwieramy oczy niedowiarkom! Mówimy: to jest nasz błąd, przez nas zrobiony,
    i to nie jest nasze ostatnie słowo!
  </Trans>
</p>

<img src={bear404} alt={t`Ilustracja misia — błąd 404`} />
```

Run `yarn i18n:extract` after adding strings.

# Files to create

```
src/
├── assets/
│   └── icons/
│       └── bear-404.svg              # (or images/ — match Figma asset type)
├── constants/
│   └── paths.ts                      # add home: '/' if not yet present
└── components/
    └── shared/
        └── Error404/
            ├── Error404.tsx          # Main component
            ├── Error404.test.tsx     # Unit tests
            └── Error404.stories.tsx  # Storybook stories
```

> `Error404.types.ts` and `Error404.constants.ts` — skip unless needed; the component has no configurable props or repeated constants beyond what's inline.

# Unit test cases (BDD)

```ts
describe('<Error404 />', () => {
  describe('content', () => {
    it('renders the 404 heading', ...);
    it('renders the teal highlighted portion of the heading', ...);
    it('renders the body text', ...);
    it('renders the bear illustration with an alt attribute', ...);
  });

  describe('when "Strona główna" button is clicked', () => {
    it('navigates to the home path', ...);
  });
});
```

# Storybook stories

- `Default` — desktop viewport (default)
- `Mobile` — mobile viewport (375 px, use Storybook viewport addon)

# Remember about standards
- Use the standard colors palette, never add colors directly (check https://tailwindcss.com/docs/colors and our color palette in the `src/index.css` file and in [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css))
- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Create a Storybook story for the component with all possible props variants of the component
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)

# Resources
- [Legacy repo](https://github.com/gi-org-pl/mypolitics-app-legacy/tree/main/frontend) — see how the legacy 404 page is implemented
- [mypolitics.pl/404](https://mypolitics.pl/404) — see the live page
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
- [ ] Biome lint clean (no disabled rules without justification)
- [ ] TypeScript clean (no `any`, no `@ts-ignore` without comment)
- [ ] Storybook stories added (Desktop + Mobile)
- [ ] All user-visible strings wrapped in Lingui macros (`<Trans>`, `t`) — no hardcoded literals
- [ ] `yarn i18n:extract` run after adding/changing strings; `.po` files committed
- [ ] Bear illustration saved to `src/assets/` and rendered with a translated `alt` attribute
- [ ] "Strona główna" button uses `Button` component and navigates via React Router `<Link>` (no full-page reload)
- [ ] `PATHS.home` used — no hardcoded `/` string in the component
- [ ] Component **not** embedded in any page (route wiring is a separate task)
- [ ] CI green: build, lint, test, e2e
