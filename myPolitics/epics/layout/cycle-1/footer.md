# Story
As a user, I want to see a footer at the bottom of the page with copyright info, social media links, and legal navigation links so I can access myPolitics' social channels and important pages.

# Component properties

**Component:** `Footer`
**Location:** `src/components/shared/Footer/`
**Shared:** yes — do not embed in any page yet; it will be wired up to a layout later.

```ts
// No external props required — all data comes from internal constants
export const Footer: React.FC = () => { ... }
```

# Implementation notes

### Paths constant
Extend `src/constants/paths.ts` with the new entries (do **not** duplicate existing ones):

```ts
export const PATHS = {
  // ... existing paths from header task ...
  generacjaInnowacja: 'https://gi.org.pl',       // external — GI logo link
  terms: '/terms',                                 // Regulamin
  privacy: '/privacy',                             // Prywatność
  about: '/about',                                 // O nas
} as const;
```

### Social links
Source of truth: `getBaseSocialLinks` + `pathsConfig` with `Theme.Default` in the legacy repo at
`frontend/src/shared/Footer/FooterUtils.ts` — **check the legacy repo first** to copy the exact URLs.

Based on the Figma design, the expected social platforms (in order) are:

| Platform  | Icon        |
|-----------|-------------|
| Facebook  | `facebook`  |
| X/Twitter | `x`         |
| Instagram | `instagram` |
| LinkedIn  | `linkedin`  |
| Telegram  | `telegram`  |
| GitHub    | `github`    |
| YouTube   | `youtube`   |

Define these as a typed constant in `Footer.constants.ts`:

```ts
// Footer.constants.ts
import { PATHS } from '@/constants/paths';

export interface SocialLink {
  platform: string;
  href: string;
  ariaLabel: string; // for accessibility — use msg`` macro
}

export const SOCIAL_LINKS: SocialLink[] = [
  { platform: 'facebook',  href: '...', ariaLabel: 'Facebook' },
  { platform: 'x',         href: '...', ariaLabel: 'X (Twitter)' },
  { platform: 'instagram', href: '...', ariaLabel: 'Instagram' },
  { platform: 'linkedin',  href: '...', ariaLabel: 'LinkedIn' },
  { platform: 'telegram',  href: '...', ariaLabel: 'Telegram' },
  { platform: 'github',    href: '...', ariaLabel: 'GitHub' },
  { platform: 'youtube',   href: '...', ariaLabel: 'YouTube' },
];
```

Fill in the `href` values from the legacy `FooterUtils.ts` — all are external URLs → `target="_blank" rel="noopener noreferrer"`.

Each social icon is rendered as a circular ghost icon button. Use icon assets from `src/assets/icons/` (SVG). All social links open in a new tab.

### Legal navigation links
```ts
// inside Footer.tsx or Footer.constants.ts
export const LEGAL_LINKS = [
  { label: msg`Regulamin`,   href: PATHS.terms   },
  { label: msg`Prywatność`, href: PATHS.privacy  },
  { label: msg`O nas`,       href: PATHS.about    },
] as const;
```
Internal links → React Router `<Link>`. No `target="_blank"`.

### Desktop layout (≥ `md` / 768 px)
- **Left side:** `© {currentYear}` text, then myPolitics logo (non-clickable), then Generacja Innowacja logo (links to `PATHS.generacjaInnowacja`, `target="_blank"`), separated by a vertical divider.
- **Right side, top row:** social icon buttons in a horizontal row.
- **Right side, bottom row:** legal links (Regulamin · Prywatność · O nas) as plain text links.

`{currentYear}` is derived at runtime: `new Date().getFullYear()`.

### Mobile layout (< `md`)
- **Top row:** `© {currentYear}`, myPolitics logo (non-clickable), Generacja Innowacja logo.
- **Second row:** legal links inline (Regulamin · Prywatność · O nas).
- **Third + fourth rows:** social icons in a 4-column grid (first 4, then remaining 3).

### Logos
- **myPolitics logo** — static SVG from `src/assets/images/` (or `icons/`), **not wrapped in a link**.
- **Generacja Innowacja logo** — static SVG wrapped in `<a href={PATHS.generacjaInnowacja} target="_blank" rel="noopener noreferrer">`.

### i18n
All visible strings must use Lingui macros:
```tsx
import { Trans } from '@lingui/react';
import { msg, t } from '@lingui/core';

// copyright
<Trans>© {currentYear}</Trans>

// aria-label for social icons
const ariaLabel = t`Odwiedź nasz profil na Facebooku`;
```
Run `yarn i18n:extract` after adding strings.

# Files to create

```
src/
├── constants/
│   └── paths.ts                              # extend with GI, terms, privacy, about
└── components/
    └── shared/
        └── Footer/
            ├── Footer.tsx                    # Main component
            ├── Footer.test.tsx               # Unit tests
            ├── Footer.constants.ts           # SOCIAL_LINKS, LEGAL_LINKS
            ├── Footer.types.ts               # (skip if SocialLink interface stays in constants)
            └── Footer.stories.tsx            # Storybook stories
```

# Unit test cases (BDD)

```ts
describe('<Footer />', () => {
  describe('copyright', () => {
    it('renders the current year', ...);
  });

  describe('logos', () => {
    it('renders the myPolitics logo without a link', ...);
    it('renders the Generacja Innowacja logo linking to gi.org.pl', ...);
    it('opens the GI link in a new tab', ...);
  });

  describe('social links', () => {
    it('renders all 7 social icon buttons', ...);
    it('each social link opens in a new tab', ...);
    it('each social link has an accessible aria-label', ...);
  });

  describe('legal links', () => {
    it('renders Regulamin, Prywatność, O nas links', ...);
    it('legal links are internal React Router links', ...);
  });

  describe('on mobile', () => {
    it('renders social icons in a grid layout', ...);
  });
});
```

# Storybook stories

- `Desktop` — default desktop layout
- `Mobile` — mobile viewport (use Storybook viewport addon to set to 375 px)

# Remember about standards
- Use the standard colors palette, never add colors directly (check https://tailwindcss.com/docs/colors and our color palette in the `src/index.css` file and in [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css))
- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Create a Storybook story for the component with all possible props variants of the component
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)

# Resources
- **Legacy `FooterUtils.ts`** — `frontend/src/shared/Footer/FooterUtils.ts` in the legacy repo — copy exact URLs for `getBaseSocialLinks` with `Theme.Default` from there
- [Legacy repo](https://github.com/gi-org-pl/mypolitics-app-legacy/tree/main/frontend)
- [mypolitics.pl](https://mypolitics.pl) — see the live footer
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
- [ ] All user-visible strings wrapped in Lingui macros (`<Trans>`, `t`, `msg`) — no hardcoded literals
- [ ] `yarn i18n:extract` run after adding/changing strings; `.po` files committed
- [ ] `PATHS` constant extended with `generacjaInnowacja`, `terms`, `privacy`, `about`
- [ ] Social links sourced from legacy `FooterUtils.ts` (`getBaseSocialLinks` + `Theme.Default`)
- [ ] myPolitics logo is **not** wrapped in any link
- [ ] GI logo links to `gi.org.pl` in a new tab
- [ ] All external links have `target="_blank" rel="noopener noreferrer"`
- [ ] Legal links use React Router `<Link>` (no full-page reload)
- [ ] Component **not** embedded in any page (layout wiring is a separate task)
- [ ] CI green: build, lint, test, e2e
