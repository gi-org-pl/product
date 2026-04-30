# Story
As a user on the home page, I want to see a promotional banner for the currently active campaign so I can learn about and join initiatives related to myPolitics.

# Component properties

**Component:** `PromotionBanner`
**Location:** `src/components/shared/PromotionBanner/`
**Shared:** yes

```ts
export interface Promotion {
  name: string;           // accessible label (aria-label on the link)
  url: string;            // external link — whole banner is clickable
  date: {
    start: Date;
    end: Date;
  };
  content: {
    leftTitle: string;       // white, bold — e.g. "Podoba Ci się myPolitics?"
    leftSubtitle: string;    // teal/cyan — e.g. "Twórz to z nami."
    rightTitle: string;      // white, bold — e.g. "Dołącz na Discord"
    rightSubtitle: string;   // red/orange — e.g. "Fundacji Generacja Innowacja"
  };
}

export interface PromotionBannerProps {
  promotions: Promotion[];
  fallback?: ReactNode;   // rendered when no promotion is currently active
}
```

# Use cases (from legacy + Figma)

### 1 — Active promotion, desktop layout (≥ `md`)
- Dark (near-black) background, rounded corners, full width.
- Horizontal two-column layout: left content and right content side by side, vertically centered.
- Left: `leftTitle` (white bold) above `leftSubtitle` (teal/cyan).
- Right: `rightTitle` (white bold) above `rightSubtitle` (red/orange). Right-aligned text on desktop.
- Entire banner is wrapped in `<a href={url} target="_blank" rel="noopener noreferrer">`.

### 2 — Active promotion, mobile layout (< `md`)
- Same dark background, same rounded corners, narrower width.
- Stacked vertically: left content block on top, horizontal divider, right content block below.
- Both blocks left-aligned on mobile.

### 3 — Multiple active promotions (overlapping date ranges)
- Only one is shown per session — selected randomly on first render (stable for the duration of the session via `useState` initializer, not re-rolled on re-render).

### 4 — No active promotion → fallback
- When no promotion's `date.start ≤ now ≤ date.end`, render `fallback` prop.
- If `fallback` is not provided, render `null`.

### 5 — No active promotion, no fallback
- Render nothing (`null`).

# Implementation notes

### Date filtering & selection (moved from internal constant to component logic)
```ts
// inside component, stable across renders
const [activePromotion] = useState<Promotion | null>(() => {
  const now = new Date();
  const active = promotions.filter(
    (p) => now >= p.date.start && now <= p.date.end
  );
  if (active.length === 0) return null;
  return active[Math.floor(Math.random() * active.length)];
});
```

### Layout
```tsx
<a href={activePromotion.url} target="_blank" rel="noopener noreferrer" aria-label={activePromotion.name}>
  <div className="flex flex-col md:flex-row md:items-center md:justify-between rounded-2xl bg-[--color-dark] px-6 py-5 gap-4 w-full">
    {/* Left */}
    <div>
      <p className="font-bold text-white">{activePromotion.content.leftTitle}</p>
      <p className="font-bold text-[--color-primary]">{activePromotion.content.leftSubtitle}</p>
    </div>
    {/* Divider — mobile only */}
    <hr className="border-white/20 md:hidden" />
    {/* Right */}
    <div className="md:text-right">
      <p className="font-bold text-white">{activePromotion.content.rightTitle}</p>
      <p className="font-bold text-[--color-accent-red]">{activePromotion.content.rightSubtitle}</p>
    </div>
  </div>
</a>
```

Use CSS variables / design tokens from `athena` — never hardcode hex colors. Match exact color tokens from `src/index.css` for: dark background, teal/cyan subtitle, red/orange subtitle.

### Responsive type (no JS breakpoint hook needed)
The legacy used `useBannerType` (a JS window-width hook) to switch between desktop/mobile image assets. The new version renders HTML — Tailwind responsive classes handle layout switching purely in CSS. **No `useWindowWidth` or JS breakpoint hook needed.**

### No image assets
Unlike the legacy (which rendered pre-composed image files per breakpoint), the new implementation renders the banner as HTML/CSS. No image assets required for this component.

### i18n
All visible strings come from the `promotions` prop — the caller is responsible for passing translated content. No Lingui macros inside `PromotionBanner`. Document this on the interface:

```ts
/**
 * All string values in Promotion.content must be translated at the call site.
 * PromotionBanner does not apply any Lingui macros internally.
 */
```

# Files to create

```
src/components/shared/PromotionBanner/
├── PromotionBanner.tsx
├── PromotionBanner.test.tsx
├── PromotionBanner.types.ts      # Promotion, PromotionBannerProps
└── PromotionBanner.stories.tsx
```

# Unit test cases (BDD)

```ts
describe('<PromotionBanner />', () => {
  describe('given a currently active promotion', () => {
    it('renders the left title', ...);
    it('renders the left subtitle in teal', ...);
    it('renders the right title', ...);
    it('renders the right subtitle in red', ...);
    it('wraps the banner in an external link with the promotion URL', ...);
    it('sets target="_blank" and rel="noopener noreferrer" on the link', ...);
    it('sets aria-label from promotion.name', ...);
  });

  describe('given multiple active promotions', () => {
    it('renders exactly one promotion', ...);
    it('does not change the selected promotion on re-render', ...);
  });

  describe('given no active promotion', () => {
    describe('when a fallback is provided', () => {
      it('renders the fallback', ...);
    });
    describe('when no fallback is provided', () => {
      it('renders nothing', ...);
    });
  });

  describe('given a future promotion (not yet active)', () => {
    it('does not render it', ...);
  });

  describe('given an expired promotion', () => {
    it('does not render it', ...);
  });
});
```

# Storybook stories

- `Active` — one active promotion, desktop viewport
- `ActiveMobile` — one active promotion, 375 px viewport
- `MultipleActive` — two overlapping promotions (verify one is shown)
- `NoActiveWithFallback` — all promotions in the past, fallback prop provided
- `NoActiveNoFallback` — all promotions in the past, no fallback (renders nothing)

# Remember about standards
- Use the standard colors palette, never add colors directly (check https://tailwindcss.com/docs/colors and our color palette in the `src/index.css` file and in [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css))
- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Create a Storybook story for the component with all possible variants
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)

# Resources
- [Legacy PromoBanner](https://github.com/gi-org-pl/mypolitics-app-legacy/tree/main/frontend/src/shared/PromoBanner) — analyze `useBannerType`, `getCurrentPromotion`, `PromoBannerTypes` for use cases and the `PROMOTIONS` constant shape only; **do not** use Next.js Image/Link, styled-components, `useWindowWidth`, or image-based rendering
- [mypolitics.pl](https://mypolitics.pl) — observe the live promotion banner (if an active promotion is running)
- [Figma project link](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=1190-9207&t=k6GtQ4k9HtLFKbnM-1)
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Storybook docs](https://storybook.js.org/docs/writing-stories)
- [Tailwind docs](https://tailwindcss.com/docs/)
- [Vitest docs](https://vitest.dev/guide/)

# Definition of Done
- [ ] Code follows folder structure (`docs/frontend/conventions/PROJECT_STRUCTURE.md`)
- [ ] Naming follows `docs/frontend/conventions/NAMING.md`
- [ ] Component layout follows `docs/frontend/conventions/COMPONENT_STRUCTURE.md`)
- [ ] Unit tests added, BDD style, coverage ≥95%
- [ ] Storybook stories added for all 5 variants
- [ ] Biome lint clean
- [ ] TypeScript clean (no `any`, no `@ts-ignore`)
- [ ] Active promotion selected via `useState` initializer — stable per session, not re-rolled on re-render
- [ ] Date filtering correct: `start ≤ now ≤ end`
- [ ] No active promotion + fallback → renders fallback
- [ ] No active promotion + no fallback → renders `null`
- [ ] Banner link uses `<a target="_blank" rel="noopener noreferrer">` with `aria-label`
- [ ] Layout responsive via Tailwind only — no JS breakpoint hook
- [ ] No image assets — rendered as HTML/CSS
- [ ] Colors from design tokens only — no hardcoded hex values
- [ ] JSDoc on `Promotion` interface noting caller handles i18n
- [ ] CI green: build, lint, test, e2e
