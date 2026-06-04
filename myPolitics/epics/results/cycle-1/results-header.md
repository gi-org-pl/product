# Story

As a user viewing my quiz results, I want a header that clearly shows the matched result — its name, slogan, image and how strongly I align with it — so I can immediately read the headline outcome.

> ⚠️ **Keep it non-political and universal.** Props are generic (`name`, `slogan`, …) — no party/candidate-specific fields, naming, or hardcoded content. The design shows political examples only as placeholders.

# Component properties

**Component:** `ResultsHeader`
**Location:** `src/components/results/ResultsHeader/`
**Shared:** no — domain component under `results`

```ts
export interface ResultsHeaderProps {
  id?: string;                 // optional DOM id / anchor target
  name: string;                // result name
  slogan: string;              // tagline shown in the bottom bar
  imageUrl: string;            // result avatar image
  agreementPercent: number;    // 0–100 match strength
  actionLabel?: string;        // optional button label, e.g. "Program wyborczy"
  actionShortLabel?: string;   // optional shorter label for narrow viewports, e.g. "Program"
  onActionClick?: () => void;  // button handler; button renders only when this + actionLabel are set
}
```

# Layout (single responsive component)

> The two looks in the design are **not** separate variants and **not** a prop — they're the **same component at different breakpoints**. Handle the difference with Tailwind responsive classes; do not add a `size`/`variant` prop.

The card is dark, rounded, split into a **top section** and a **bottom bar** (slightly different shade).

### Mobile (compact look — top three cards in the design)
- **Top section:** `name` (bold) with the color-coded percent label `"{n}% pewności"` directly below it, on the left. Avatar + progress ring on the **right**.
- **Bottom bar:** `slogan` on the left, decorative megaphone icon on the far right (dimmed).

### Desktop (wide look — bottom cards in the design)
- **Top section:** avatar + progress ring on the **left**, then `name` (bold) with the percent label below it.
- **Bottom bar:** megaphone icon + a small `"Hasło"` label, with `slogan` below it. When action props are provided, the action **Button** is right-aligned in the bottom bar.

### Action button (when `actionLabel` + `onActionClick` provided)
- Label is responsive: `actionLabel` on wider viewports, `actionShortLabel` (fallback to `actionLabel`) on narrow ones — see the two bottom cards in the design ("Program wyborczy" vs "Program").

# Color scale (ring + percent text)

The progress-ring stroke **and** the percent-label text share one color, derived from `agreementPercent` via three semantic tiers:

| Tier | Approx. range | Semantic color |
| --- | --- | --- |
| high | upper band | positive / green |
| mid  | middle band | warning / amber |
| low  | lower band  | danger / red |

Reference points from the design: `76%`/`75%` → green, `51%` → amber, `12%` → red.

- Put threshold boundaries in `ResultsHeader.constants.ts` (e.g. `AGREEMENT_HIGH_THRESHOLD`, `AGREEMENT_LOW_THRESHOLD`) — no magic numbers in the view.
- Pick actual colors from the palette (`src/index.css` / Athena) — never hardcode hex.
- Extract tier logic to a tested util `utils/getAgreementLevel.ts` returning `'high' | 'mid' | 'low'`; the view maps level → palette class.

# Behaviour & edge cases

- `agreementPercent` clamped to `0–100` before rendering ring and label.
- Percent label = `Math.round(agreementPercent)` (so `66.6` → `67`).
- Ring filled arc is proportional to the clamped percent (0% = empty, 100% = full).
- Button renders **only** when both `actionLabel` and `onActionClick` are present.
- `actionShortLabel` falls back to `actionLabel` when omitted.

# Athena components to use

- **`Avatar`** — circular result image (`imageUrl`, `alt={name}`).
- **`Button`** — the optional action button. Match the ghost/subtle pill style from the design via variant + palette; don't restyle from scratch.
- The **circular progress ring** has no Athena equivalent (`ProgressBar` is linear). Implement as an inline SVG `<circle>` with `stroke-dasharray` / `stroke-dashoffset` driven by the percent, wrapped around the `Avatar`. Do **not** add a new charting/progress library.

# Migration notes

- **Drop** `next/image` → Athena `Avatar`.
- **Drop** the styled-components (`ResultsIdentityHeaderStyle`, the shared `ResultsHeaderStyle` `Agreement`/`AgreementWrapper`/`Round`) → Tailwind + palette. Reuse legacy only to understand ring math and color thresholds.
- Rename legacy `ResultsIdentityHeader` → **`ResultsHeader`**.
- Legacy had no responsive layout or button concept — those are new, driven by the design.
- Don't prescribe exact Tailwind classes here — that's the developer's call against palette + Figma.

# Files to create

```
src/components/results/ResultsHeader/
├── ResultsHeader.tsx
├── ResultsHeader.test.tsx
├── ResultsHeader.types.ts        # ResultsHeaderProps
├── ResultsHeader.constants.ts    # agreement thresholds, ring geometry
├── ResultsHeader.stories.tsx
└── utils/
    ├── getAgreementLevel.ts      # percent → 'high' | 'mid' | 'low'
    └── getAgreementLevel.test.ts
src/assets/icons/
└── megaphone.svg                 # ported from legacy icon.svg (kebab-case)
```

# Unit test cases (BDD)

```ts
describe('<ResultsHeader />', () => {
  describe('given name, slogan and imageUrl', () => {
    it('renders the name', ...);
    it('renders the slogan', ...);
    it('renders the avatar with alt set to name', ...);
  });
  describe('given agreementPercent', () => {
    it('renders the rounded percent label "{n}% pewności"', ...);
    it('rounds fractional percents', ...);
    it('clamps values below 0 to 0', ...);
    it('clamps values above 100 to 100', ...);
  });
  describe('color tier', () => {
    it('uses the high (green) tier for a high percent', ...);
    it('uses the mid (amber) tier for a mid percent', ...);
    it('uses the low (red) tier for a low percent', ...);
  });
  describe('action button', () => {
    describe('when actionLabel + onActionClick are provided', () => {
      it('renders the action button', ...);
      it('calls onActionClick when clicked', ...);
      it('uses actionShortLabel as a fallback to actionLabel when omitted', ...);
    });
    describe('when action props are missing', () => {
      it('does not render an action button', ...);
    });
  });
  describe('given an id', () => {
    it('applies the id to the root element', ...);
  });
});

describe('getAgreementLevel()', () => {
  it('returns "high" above the high threshold', ...);
  it('returns "mid" between the thresholds', ...);
  it('returns "low" below the low threshold', ...);
  it('handles the boundary values', ...);
});
```

> Responsive layout (avatar left vs right, "Hasło" label, short vs long button label) is driven by CSS breakpoints, so it's verified visually in Storybook rather than in unit tests.

# Storybook stories

- `HighMatch` — green (e.g. 76%)
- `MidMatch` — amber (e.g. 51%)
- `LowMatch` — red (e.g. 12%)
- `WithButton` — `actionLabel="Program wyborczy"`, `actionShortLabel="Program"`
- `WithoutButton` — no action props
- `FractionalPercent` — e.g. 66.6% to show rounding
- `LongName` — long `name` + `slogan` to check wrapping

> Check each story at both mobile and desktop viewports (Storybook viewport addon) to confirm the responsive layout flip.

# Remember about standards

- Use the standard colors palette, never add colors directly (check `src/index.css` and [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css))
- Use Athena's `Avatar` and `Button` — don't reimplement what Athena provides
- Create unit tests with Vitest for 100% of the code (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Create a Storybook story for all variants listed above
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)
- All user-visible strings via Lingui macros (`<Trans>`, `` t`…` ``) — `"% pewności"` and `"Hasło"` must not be hardcoded

# Resources

- [Legacy ResultsIdentityHeader](https://github.com/gi-org-pl/mypolitics-app-legacy/tree/develop/frontend/src/components/Results/ResultsIdentityHeader) — analyze for layout + ring math/thresholds only; do **not** copy styled-components or `next/image`
- [Figma project link](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=1190-9207&t=k6GtQ4k9HtLFKbnM-1)
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Storybook docs](https://storybook.js.org/docs/writing-stories)
- [Tailwind docs](https://tailwindcss.com/docs/)
- [Vitest docs](https://vitest.dev/guide/)

# Definition of Done

- [ ] Code follows folder structure (`docs/frontend/conventions/PROJECT_STRUCTURE.md`)
- [ ] Naming follows `docs/frontend/conventions/NAMING.md`
- [ ] Component layout follows `docs/frontend/conventions/COMPONENT_STRUCTURE.md`
- [ ] Single responsive component — no `size`/`variant` prop; layout flips via Tailwind breakpoints
- [ ] Unit tests added, BDD style, coverage ≥95% on all new files
- [ ] Storybook stories added for all 7 variants, checked at mobile + desktop viewports
- [ ] Biome lint clean
- [ ] TypeScript clean (no `any`, no `@ts-ignore`)
- [ ] No styled-components, no `next/image` — Tailwind + Athena `Avatar`/`Button` + inline SVG only
- [ ] Component is generic/non-political — no party- or candidate-specific props or content
- [ ] `agreementPercent` clamped to 0–100 and rounded for the label
- [ ] Color tiers + thresholds extracted to constants/util; colors from palette only
- [ ] `"% pewności"` and `"Hasło"` wrapped in Lingui macros; `yarn i18n:extract` run, `.po` files committed
- [ ] CI green: build, lint, test
```
