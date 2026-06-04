# Story

As a user reading my quiz results, I want a small banner that reminds me the project is funded only by its community and lets me support it with one tap, so I can chip in (e.g. "buy a coffee") without leaving the page.

# Component properties

**Component:** `PatroniteBanner`
**Location:** `src/components/shared/PatroniteBanner/`
**Shared:** yes

```ts
export interface PatroniteBannerProps {
  href: string;              // Patronite (or any support) URL — opened in a new tab
  ctaLabel: string;          // button text, e.g. "5 zł na kawę"
  id?: string;               // optional DOM id / anchor target
}
```

Universal, presentational component — **no API calls, no context, no data fetching**. Everything comes in through props. The two title/subtitle lines are fixed brand copy rendered internally via Lingui macros; the support link and CTA text come from props so the banner can be reused for different campaigns.

# Layout (from the design)

A rounded, light-surface card containing a two-line text block and a dark pill button. The design shows the **same component at two breakpoints** — the difference is purely responsive, **not** a configurable variant. Handle it with Tailwind responsive utilities only; no `variant` prop, no JS breakpoint hook.

### Text block (always)
- **Line 1 (muted):** `Nikt nas nie finansuje… poza Wami!` — lighter / secondary text color.
- **Line 2 (bold):** `Wesprzyj naszą działalność:` — emphasized.

### Desktop (≥ `md`)
- Card is full-width.
- Text block on the left, CTA button on the right, vertically centered (`md:flex-row`, `md:justify-between`, `md:items-center`).

### Mobile (< `md`)
- Card is narrower / content-width.
- Text block on top, CTA button below it, left-aligned and stacked (`flex-col`, `items-start`).

### CTA button
- Dark, pill-shaped button rendered with the Athena **`Button`** component.
- Renders `ctaLabel`.
- The whole button links out: wrap in `<a href={href} target="_blank" rel="noopener noreferrer">` (or use the Button's `as`/link API if Athena exposes one — do **not** reimplement the button styling).

# Athena components to use

- **`Button`** — for the CTA pill (`ctaLabel`). Pick the dark/primary visual matching the design; do not hand-roll button styles.
- No other Athena component is required; the card surface and text are plain elements styled with Tailwind utilities + palette tokens.

# Behaviour & edge cases

- The link always opens in a new tab with `rel="noopener noreferrer"`.
- `ctaLabel` and `href` are rendered/used as-is (no validation, no formatting).
- `id`, when provided, is applied to the root element.
- No internal state, no effects, no responsive JS — the desktop/mobile layout difference is driven purely by Tailwind responsive utilities.

# Migration notes

- Legacy source: `frontend/src/shared/PatroniteInfo` (Next.js + styled-components). Analyze it for **layout and copy only**.
- **Drop** styled-components — restyle with Tailwind utilities + palette tokens.
- **Drop** `next/link` / `next/image` — use a plain `<a>` and the Athena `Button`.
- Rename from legacy `PatroniteInfo` to **`PatroniteBanner`**, and relocate from `shared/` to the `results` domain (it is **not** shared per the spec).
- If the legacy hardcoded the URL / amount in a constant, lift those out to **props** (`href`, `ctaLabel`) — that's what makes the new component universal.
- Do not decide exact Tailwind classes here — that's the developer's call against the palette and design.

# Files to create

```
src/components/shared/PatroniteBanner/
├── PatroniteBanner.tsx
├── PatroniteBanner.test.tsx
├── PatroniteBanner.types.ts      # PatroniteBannerProps
└── PatroniteBanner.stories.tsx
```

# Unit test cases (BDD)

```ts
describe('<PatroniteBanner />', () => {
  describe('given href and ctaLabel', () => {
    it('renders both brand copy lines', ...);
    it('renders the CTA button with ctaLabel', ...);
    it('links the CTA to href', ...);
    it('opens the link in a new tab with rel="noopener noreferrer"', ...);
  });

  describe('given an id', () => {
    it('applies the id to the root element', ...);
  });
});
```

# Storybook stories

- `Default` — desktop viewport, full-width card
- `Mobile` — 375 px viewport (verify it stacks)
- `LongCtaLabel` — long `ctaLabel` to check button wrapping/sizing

# Remember about standards

- Use the standard colors palette, never add colors directly (check `src/index.css` and [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css))
- Use Athena's `Button` for the CTA — don't reimplement what Athena already provides
- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Create a Storybook story for all variants listed above
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)
- The two brand-copy lines are user-visible → wrap them in Lingui `<Trans>` macros — no hardcoded literals. `ctaLabel` comes pre-translated from the caller.

# Resources

- [Legacy PatroniteInfo](https://github.com/gi-org-pl/mypolitics-app-legacy/tree/develop/frontend/src/shared/PatroniteInfo) — analyze for layout + copy only; do **not** copy styled-components, `next/link`, or `next/image`
- [Figma project link](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=1190-9207&t=k6GtQ4k9HtLFKbnM-1)
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Storybook docs](https://storybook.js.org/docs/writing-stories)
- [Tailwind docs](https://tailwindcss.com/docs/)
- [Vitest docs](https://vitest.dev/guide/)

# Definition of Done

- [ ] Code follows folder structure (`docs/frontend/conventions/PROJECT_STRUCTURE.md`)
- [ ] Naming follows `docs/frontend/conventions/NAMING.md`
- [ ] Component layout follows `docs/frontend/conventions/COMPONENT_STRUCTURE.md`
- [ ] Unit tests added, BDD style, coverage ≥95% on all new files
- [ ] Storybook stories added for all 3 variants
- [ ] Biome lint clean
- [ ] TypeScript clean (no `any`, no `@ts-ignore`)
- [ ] No styled-components, no `next/link`, no `next/image` — Tailwind + Athena `Button` only
- [ ] Desktop/mobile layout driven by Tailwind responsive utilities only — no `variant` prop, no JS breakpoint hook
- [ ] CTA link uses `<a target="_blank" rel="noopener noreferrer">`
- [ ] Colors from design tokens only — no hardcoded hex values
- [ ] Brand-copy lines wrapped in Lingui `<Trans>`; `yarn i18n:extract` run, `.po` files committed
- [ ] CI green: build, lint, test
