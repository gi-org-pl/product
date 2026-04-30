# Story
As a user visiting the home page, I want to see an eye-catching animated banner showcasing the myPolitics quiz results UI so I get a visual preview of what the app looks like.

# Component properties

**Component:** `FeaturedQuizBanner`
**Location:** `src/components/quiz/FeaturedQuizBanner/`
**Shared:** no — domain component under `quiz`

```ts
// No external props — static asset, self-contained animation
export const FeaturedQuizBanner: React.FC = () => { ... }
```

# Use cases (from legacy + Figma)

### 1 — Default (light context)
- Composite mockup image of the myPolitics quiz results screen displayed at a slight rotation/tilt.
- Image floats with a gentle continuous animation: subtle oscillation on both X and Y axes simultaneously, looping indefinitely with a spring-like feel.
- Used on a light/white background section of the home page.

### 2 — Dark context
- Same image and animation, but the surrounding section has a dark background.
- The component itself doesn't control the background — the parent page/section sets it.
- Component renders identically in both contexts (no internal variant prop needed).

# Implementation notes

### Image asset
- Source: `src/assets/images/home/quiz-banner-content.png` (port from legacy repo — check `@assets/images/home/quiz-banner-content.png`).
- Render with a standard `<img>` tag.
- `alt="mypolitics banner content"` (wrap in `t` macro for i18n).
- The image is a pre-composed mockup — no dynamic content.

### Floating animation
The legacy uses framer-motion with these parameters (for reference only — **do not install framer-motion**):
```
y: [-IMAGE_HOVER_MARGIN, IMAGE_HOVER_MARGIN]
x: [-IMAGE_HOVER_MARGIN, IMAGE_HOVER_MARGIN]
duration: 4s, repeat: Infinity, repeatType: "mirror", type: "spring"
```

Implement using a **CSS keyframe animation** instead — no JS animation library needed:

```css
/* in src/index.css or as a Tailwind @layer */
@keyframes quiz-banner-float {
  0%, 100% { transform: translate(0px, 0px); }
  25%       { transform: translate(6px, -6px); }
  50%       { transform: translate(0px, -10px); }
  75%       { transform: translate(-6px, -6px); }
}
```

Apply via a Tailwind arbitrary value or a custom utility class:
```tsx
<img
  src={quizBannerContent}
  alt={t`mypolitics banner content`}
  className="animate-[quiz-banner-float_4s_ease-in-out_infinite]"
/>
```

Adjust margin values (`IMAGE_HOVER_MARGIN`) to match the Figma visual — check the legacy `QuizBannerStyle` for the exact pixel value.

### Wrapper
Wrap the image in a `<div>` that clips overflow (so the floating image doesn't cause scrollbars):
```tsx
<div className="overflow-hidden relative">
  <img ... />
</div>
```

### i18n
```tsx
import { t } from '@lingui/core';
<img alt={t`mypolitics banner content`} ... />
```

### `prefers-reduced-motion`
Respect the user's accessibility preference — disable the animation when reduced motion is set:
```css
@media (prefers-reduced-motion: reduce) {
  .animate-quiz-banner-float { animation: none; }
}
```

# Files to create

```
src/
├── assets/
│   └── images/
│       └── home/
│           └── quiz-banner-content.png   # port from legacy repo
└── components/
    └── quiz/
        └── FeaturedQuizBanner/
            ├── FeaturedQuizBanner.tsx
            └── FeaturedQuizBanner.test.tsx
            └── FeaturedQuizBanner.stories.tsx
```

> No `types.ts` or `constants.ts` needed — component has no props or reusable constants.

# Unit test cases (BDD)

```ts
describe('<FeaturedQuizBanner />', () => {
  describe('content', () => {
    it('renders the banner image', ...);
    it('image has an alt attribute', ...);
  });

  describe('animation', () => {
    it('applies the float animation class to the image', ...);
  });
});
```

# Storybook stories

- `Default` — on a light background (default)
- `DarkBackground` — same component wrapped in a dark container to verify it looks correct in the dark section context

# Remember about standards
- Use the standard colors palette, never add colors directly (check https://tailwindcss.com/docs/colors and our color palette in the `src/index.css` file and in [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css))
- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Create a Storybook story for the component with all possible variants
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)

# Resources
- [Legacy QuizBannerView](https://github.com/gi-org-pl/mypolitics-app-legacy/tree/main/frontend/src/shared/QuizBanner) — for use case reference and image asset path only; **do not** use framer-motion or styled-components
- [mypolitics.pl](https://mypolitics.pl) — observe the live banner animation on the home page
- [Figma project link](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=1190-9207&t=k6GtQ4k9HtLFKbnM-1)
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Tailwind CSS animation docs](https://tailwindcss.com/docs/animation)
- [Vitest docs](https://vitest.dev/guide/)

# Definition of Done
- [ ] Code follows folder structure (`docs/frontend/conventions/PROJECT_STRUCTURE.md`)
- [ ] Naming follows `docs/frontend/conventions/NAMING.md`)
- [ ] Component layout follows `docs/frontend/conventions/COMPONENT_STRUCTURE.md`)
- [ ] Unit tests added, BDD style, coverage ≥95%
- [ ] Storybook stories added (Default + DarkBackground)
- [ ] Biome lint clean
- [ ] TypeScript clean (no `any`, no `@ts-ignore`)
- [ ] `alt` attribute on image wrapped in Lingui `t` macro
- [ ] `yarn i18n:extract` run; `.po` files committed
- [ ] Animation implemented with CSS keyframes — **no framer-motion**, no JS animation library
- [ ] `prefers-reduced-motion` respected — animation disabled for users who prefer it
- [ ] `overflow-hidden` on wrapper — no layout shift from floating image
- [ ] Image asset ported from legacy repo to `src/assets/images/home/`
- [ ] CI green: build, lint, test, e2e
