# Story

As a user taking a survey, I want to see a progress bar that visually represents how far I've progressed through the survey — with a saturation effect that makes early progress feel more impactful and a color flash that signals each step change.

# Component properties

**Component:** `SurveySaturatedProgressBar`
**Location:** `src/components/survey/SurveySaturatedProgressBar/`
**Shared:** no — domain component under `survey`

```ts
export interface SurveySaturatedProgressBarProps {
  value: number;    // current step/answer index
  maxValue: number; // total number of steps/questions
}
```

# Behaviour

### Saturation function

The raw percentage (`value / maxValue * 100`) is passed through `getSaturatedPercentValue` before being handed to Athena's `ProgressBar`. The function applies a curve that visually "pulls" low values upward, making early progress feel more rewarding, while leaving values above 50 % untouched:

```ts
const INTERMEDIATE_VALUE = 0.0003;
const MEDIAN_VALUE = 50;

export const getSaturatedPercentValue = (value: number): number => {
  if (value > MEDIAN_VALUE) return value;
  return value - INTERMEDIATE_VALUE * value * (100 - value) * (value - MEDIAN_VALUE);
};
```

Edge case: when `maxValue` is 0, `percentValue` defaults to `0` (avoid division by zero).

### Flash animation (color indicator)

Every time `saturatedPercentValue` changes, the bar briefly "flashes" — a visual cue that the value has updated. Mechanism:

1. `useLayoutEffect` fires on `saturatedPercentValue` change.
2. Sets `flash = true` immediately.
3. Clears `flash` back to `false` after `BAR_ANIMATION_MS` milliseconds (define this constant in `SurveySaturatedProgressBar.constants.ts`).
4. Effect cleanup cancels any in-flight timeout to prevent state updates on unmounted component.

When `flash` is `true`, apply a distinct Tailwind class (e.g. a different tint or opacity pulse) to the progress indicator so it's perceivable.

> Implementation note: use Athena's `ProgressBar` component and pass `value={saturatedPercentValue}`. Wrap it with a `div` that conditionally adds the flash class.

# Files to create

```
src/components/survey/SurveySaturatedProgressBar/
├── SurveySaturatedProgressBar.tsx
├── SurveySaturatedProgressBar.test.tsx
├── SurveySaturatedProgressBar.types.ts        # SurveySaturatedProgressBarProps
├── SurveySaturatedProgressBar.constants.ts    # BAR_ANIMATION_MS
├── SurveySaturatedProgressBar.stories.tsx
└── utils/
    ├── getSaturatedPercentValue.ts
    └── getSaturatedPercentValue.test.ts
```

# Unit test cases (BDD)

```ts
describe('<SurveySaturatedProgressBar />', () => {
  describe('given value and maxValue', () => {
    it('renders Athena ProgressBar with the saturated percent value', ...);
  });

  describe('given maxValue is 0', () => {
    it('renders ProgressBar with value 0 (no division by zero)', ...);
  });

  describe('when saturatedPercentValue changes', () => {
    it('sets flash to true immediately', ...);
    it('clears flash after BAR_ANIMATION_MS', ...);
    it('cancels the timeout on unmount', ...);
  });
});

describe('getSaturatedPercentValue()', () => {
  describe('given value > 50', () => {
    it('returns the value unchanged', ...);
  });
  describe('given value <= 50', () => {
    it('returns a value higher than the raw input (saturation boost)', ...);
  });
  describe('given value = 0', () => {
    it('returns 0', ...);
  });
  describe('given value = 50', () => {
    it('returns 50 (boundary — no boost)', ...);
  });
  describe('given value = 100', () => {
    it('returns 100', ...);
  });
});
```

# Storybook stories

- `Default` — mid-progress (value=5, maxValue=10)
- `Empty` — no progress (value=0, maxValue=10)
- `Full` — fully complete (value=10, maxValue=10)
- `LowValue` — early progress to showcase saturation boost (value=1, maxValue=10)
- `Flashing` — use `play()` to programmatically update `value` so the flash animation is visible in the story

# Remember about standards

- Use the standard colors palette, never add colors directly (check `src/index.css` and [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css))
- Use Athena's `ProgressBar` component — do **not** reimplement a raw `<div>` bar
- Create unit tests with Vitest for 100% of the code (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Create a Storybook story for all variants listed above
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)

# Resources

- [Legacy SurveyProgressBarView](https://github.com/gi-org-pl/mypolitics-app-legacy/tree/develop/frontend/src/components/Survey/SurveyProgressBar) — analyze for behaviour only; do **not** copy styled-components (`Bar`, `Wrapper`) — use Tailwind + Athena's `ProgressBar` instead
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
- [ ] Storybook stories added for all 5 variants listed above
- [ ] Biome lint clean
- [ ] TypeScript clean (no `any`, no `@ts-ignore`)
- [ ] No styled-components — Tailwind + Athena's `ProgressBar` only
- [ ] Flash timeout cleaned up on unmount (no memory leaks)
- [ ] `BAR_ANIMATION_MS` extracted to `SurveySaturatedProgressBar.constants.ts`
- [ ] No hardcoded user-visible strings (none expected in this component)
- [ ] CI green: build, lint, test
