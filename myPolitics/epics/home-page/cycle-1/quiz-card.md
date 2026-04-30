# Story
As a user browsing the home page, I want to see quiz cards that show me key information about each quiz so I can decide which one to start.

# Component properties

**Component:** `QuizCard`
**Location:** `src/components/quiz/QuizCard/`
**Shared:** no — domain component under `quiz`

```ts
export interface QuizCardProps {
  title?: string;                  // text logo fallback when no logoUrl
  logoUrl?: string;                // quiz logo image
  logoHeight?: 24 | 32;           // logo height in px, default: 32
  backgroundUrl?: string;          // optional hero image at the top of the card
  cta?: string;                    // optional badge label (e.g. "Nowy Quiz Tożsamościowy!")
  description: string | ReactNode; // main body text (may contain bold spans)
  tags: string[];                  // info chips, e.g. ["+1.5M osób", "15 min"]
  isHighlighted?: boolean;         // dark-background featured variant, default: false
  isAlwaysExpanded?: boolean;      // never collapses, no chevron, default: false
  isShowStartText?: boolean;       // show "Rozpocznij" label next to play icon, default: false
  isMainAction?: boolean;          // play button uses primary filled style, default: false
  isButtonLoading?: boolean;       // play button shows spinner instead of icon
  isButtonDisabled?: boolean;      // hides the play button entirely
  onButtonClick: () => void;       // play / start button handler
  onCardClick?: () => void;        // entire card click handler (optional)
}
```

# Use cases (from legacy + Figma)

### 1 — Standard card, collapsed (mobile default)
- Logo row only visible: logo image (or title text) on the left, chevron + play button on the right.
- Tapping the chevron expands to show description + tags.
- Props: `logoUrl`, `tags`, `description`, `onButtonClick`

### 2 — Standard card, expanded
- Full card: logo row + description paragraph + tag chips below.
- On desktop (≥ `md`) cards are always in this state — no chevron shown.
- Props: same as above, just wider viewport

### 3 — Card with background image
- Image fills the top portion of the card; content sits below it on a white/light background.
- No chevron (image cards are always expanded on mobile too — treat as `isAlwaysExpanded`).
- Props: `backgroundUrl`, `logoUrl` or `title`, `description`, `tags`

### 4 — Card with CTA badge + background image
- Small rounded badge ("Kiedyś to było... no właśnie, jak!") overlaid at the bottom of the background image.
- Props: `cta`, `backgroundUrl`, `title`, `description`, `tags`

### 5 — Highlighted / main action card (`isHighlighted + isMainAction + isShowStartText`)
- Dark teal background for the whole card.
- CTA badge visible at the top.
- Play button renders as a filled primary button with "Rozpocznij ▶" label.
- Always expanded, no chevron.
- Props: `isHighlighted=true`, `isMainAction=true`, `isShowStartText=true`, `cta`, `logoUrl`, `description`, `tags`

### 6 — Title-only logo (no `logoUrl`)
- When `logoUrl` is absent but `title` is provided, render the title string as styled text in the logo area.
- Example: "Polskie Lata 90.", "Generacja Innowacja"

### 7 — Loading state
- Play button shows a spinner instead of the play icon.
- Card is otherwise fully interactive.
- Props: `isButtonLoading=true`

### 8 — Disabled button
- Play button is hidden entirely.
- Props: `isButtonDisabled=true`

# Implementation notes

### Expand / collapse (mobile)
- Use `useState<boolean>` for the local expanded state.
- Expanded when any of these is true: `isAlwaysExpanded`, `isHighlighted`, desktop viewport, or `isExpandedValue === true`.
- Chevron is hidden when `isHighlighted || isAlwaysExpanded || desktop`.
- Animate height change on expand/collapse with a CSS transition (`overflow-hidden` + `max-h` transition or similar — no extra library needed).

### Viewport detection
- Use Tailwind responsive classes (`md:`) wherever possible instead of a JS breakpoint hook.
- If JS-side breakpoint is unavoidable (e.g. for conditional rendering that can't be done with CSS alone), use a minimal custom `useBreakpoint` hook — **do not** install a new library.

### Icons
- Play icon, chevron-up, chevron-down → SVG assets from `src/assets/icons/`.
- Spinner → use the existing shared `Spinner` component if available; otherwise a simple Tailwind CSS spinner.

### Button component
- Use the shared `Button` component for the play/start button.
- `isMainAction=true` → `variant="primary"` (filled teal).
- Default → `variant="ghost"` or icon-only circular style (match Figma).

### Logo image
- Render with a standard `<img>` tag (not Next.js `Image`).
- `height` set to `logoHeight` prop value; `width: auto`.
- `alt` = `title` prop (or empty string if both are absent).

### Background image
- Render as a relative-positioned container with the `<img>` filling it (`object-cover`).
- Content section sits below the image (not overlaid), except for the CTA badge which overlays the bottom edge of the image.

### i18n
```tsx
import { Trans } from '@lingui/react';
import { t } from '@lingui/core';

// "Rozpocznij" label
<Trans>Rozpocznij</Trans>

// play button aria-label
aria-label={t`Rozpocznij quiz`}

// chevron aria-label
aria-label={isExpanded ? t`Zwiń` : t`Rozwiń`}
```

# Files to create

```
src/components/quiz/QuizCard/
├── QuizCard.tsx
├── QuizCard.test.tsx
├── QuizCard.types.ts       # QuizCardProps interface
└── QuizCard.stories.tsx
```

# Unit test cases (BDD)

```ts
describe('<QuizCard />', () => {
  describe('given a logoUrl', () => {
    it('renders the logo image', ...);
  });
  describe('given no logoUrl but a title', () => {
    it('renders the title as text logo', ...);
  });
  describe('given a backgroundUrl', () => {
    it('renders the background image', ...);
  });
  describe('given a cta', () => {
    it('renders the CTA badge', ...);
  });
  describe('given tags', () => {
    it('renders all tag chips', ...);
  });

  describe('expand / collapse (mobile)', () => {
    describe('when the card is not highlighted and not alwaysExpanded', () => {
      it('starts collapsed on mobile', ...);
      it('shows the chevron button', ...);
      describe('when the chevron is clicked', () => {
        it('expands to show description and tags', ...);
        it('changes the chevron direction', ...);
      });
    });
    describe('when isAlwaysExpanded is true', () => {
      it('does not show the chevron', ...);
      it('always shows description and tags', ...);
    });
    describe('when isHighlighted is true', () => {
      it('does not show the chevron', ...);
    });
  });

  describe('play button', () => {
    describe('when isButtonLoading is true', () => {
      it('shows a spinner instead of the play icon', ...);
    });
    describe('when isButtonDisabled is true', () => {
      it('hides the play button', ...);
    });
    describe('when isMainAction is true', () => {
      it('renders the button with primary variant', ...);
    });
    describe('when isShowStartText is true', () => {
      it('shows "Rozpocznij" label on desktop', ...);
    });
    describe('when clicked', () => {
      it('calls onButtonClick', ...);
    });
  });

  describe('card click', () => {
    describe('when onCardClick is provided', () => {
      it('calls onCardClick when the card is clicked', ...);
    });
  });
});
```

# Storybook stories

- `Default` — standard card, expanded (desktop)
- `Collapsed` — mobile viewport, collapsed state
- `WithBackground` — backgroundUrl provided
- `WithCTA` — cta badge + backgroundUrl
- `Highlighted` — isHighlighted + isMainAction + isShowStartText
- `TitleLogo` — no logoUrl, title as text logo
- `Loading` — isButtonLoading=true
- `DisabledButton` — isButtonDisabled=true

# Remember about standards
- Use the standard colors palette, never add colors directly (check https://tailwindcss.com/docs/colors and our color palette in the `src/index.css` file and in [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css))
- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Create a Storybook story for the component with all possible props variants
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)

# Resources
- [Legacy QuizCard](https://github.com/gi-org-pl/mypolitics-app-legacy/tree/main/frontend/src/shared/QuizCard) — analyze for use cases only; **do not** copy styled-components, Next.js Image, or FontAwesome — use Tailwind + SVG icons instead
- [mypolitics.pl](https://mypolitics.pl) — see the live quiz cards on the home page
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
- [ ] Storybook stories added for all 8 variants listed above
- [ ] Biome lint clean
- [ ] TypeScript clean (no `any`, no `@ts-ignore`)
- [ ] All user-visible strings wrapped in Lingui macros
- [ ] `yarn i18n:extract` run; `.po` files committed
- [ ] No styled-components, no Next.js Image, no FontAwesome — Tailwind + SVG only
- [ ] Expand/collapse animated with CSS transition (no extra library)
- [ ] `Button` component from shared library used for play button
- [ ] CI green: build, lint, test, e2e
