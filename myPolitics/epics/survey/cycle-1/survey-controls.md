# Story

As a user taking a survey, I want to see a controls bar at the top of the quiz that lets me navigate back to the previous question, see my current progress context (quiz title, category, remaining questions), and reset the quiz — with a confirmation modal before any data is lost.

# Component properties

**Component:** `SurveyControls`
**Location:** `src/components/survey/SurveyControls/`
**Shared:** no — domain component under `survey`

All data and callbacks are passed explicitly as props — no context coupling:

```ts
export type SurveyPhase = "CATEGORY_SELECT" | "QUESTION_ANSWER" | "FINISH";

export interface SurveyControlsProps {
  title: string;               // quiz title shown during CATEGORY_SELECT phase
  phase: SurveyPhase;          // current survey phase — drives center pill content
  categoryName: string;        // shown in pill during QUESTION_ANSWER (large screen only)
  questionsLeftnCategory: number; // animated count shown in pill during QUESTION_ANSWER
  answersCount: number;        // used to disable back button when 0
  onPrevious: () => void;      // called on back button click
  onReset: () => void;         // called when reset is confirmed in the modal
}
```

# Behaviour

### Layout

Three-part horizontal row (`flex`, `justify-between`, `items-center`, `gap-1.5`):

```
[ ← Back button ]  [ Center pill (TopBar) ]  [ ↺ Reset button ]
```

---

### Back button

- Uses Athena `Button` (icon-only, `grayBordered` variant, fixed 48×48 px).
- Icon: left-arrow SVG from `src/assets/icons/`.
- `aria-label` / `title`: i18n string for "Previous question" — use Lingui `t` macro.
- **Disabled** when: `phase` is `CATEGORY_SELECT` or `FINISH` (`isCurrentIsPrimitivePhase`), **or** `answersCount === 0`.
- `onClick`: calls `onPrevious()`.

---

### Center pill (TopBar)

A pill-shaped container (`rounded-full`, semi-transparent background, `px-3 py-3`, `flex items-center gap-3`).

Content is determined by the current `phase`:

| Phase | Content |
|---|---|
| `CATEGORY_SELECT` | Quiz `title` (truncated, `max-w-[8rem]`, `text-ellipsis overflow-hidden whitespace-nowrap`) |
| `QUESTION_ANSWER` | On **large screen (>400 px)**: category name + vertical divider + animated question count. On **small screen (≤400 px)**: animated question count only. |
| `FINISH` | `<Trans>Prawie koniec!</Trans>` |

For the `QUESTION_ANSWER` phase:
- **Category name** — rendered as styled text, same truncation rules as the title.
- **Vertical divider** — `w-px h-[1em] bg-current opacity-25`.
- **Question count** — an SVG icon (`card-question.svg`) followed by the animated count number (`questionsLeftnCategory`). The number change must be animated (see _Animated number_ below).
- Use `useBreakpoint(400)` (or equivalent) to detect small screen.

---

### Animated number

When `questionsLeftnCategory` changes, the displayed number should animate (CSS transition or a `useAnimatedNumber` hook). Extract the animation logic to `utils/useAnimatedNumber.ts` (or `utils/getAnimatedValue.ts` if pure).

A simple approach: briefly apply a CSS class (`opacity-0 scale-90`) on value change, then restore it after a short delay — giving a "tick" flash effect. The delay constant belongs in `SurveyControls.constants.ts`.

---

### Reset button

- Uses Athena `Button` (icon-only, `grayBordered` variant, fixed 48×48 px).
- Icon: undo/reset SVG from `src/assets/icons/`.
- `aria-label` / `title`: i18n string for "Reset" — use Lingui `t` macro.
- **Disabled** when: `phase` is `CATEGORY_SELECT` or `FINISH` (`isCurrentIsPrimitivePhase`).
- `onClick`: opens the **Reset Confirmation Modal** (local state: `isResetModalOpen = true`).

---

### Reset Confirmation Modal

Use Athena's `Modal` component. Opens when the reset button is clicked.

Content:
- **Title:** `<Trans>Rozpocząć od nowa?</Trans>`
- **Body:** `<Trans>Czy na pewno chcesz rozpocząć quiz (<strong>{title}</strong>) od nowa? Twoje odpowiedzi nie zostaną zapisane.</Trans>`
- **Primary action button:** `<Trans>Resetuj quiz</Trans>` — calls `onReset()`, then closes the modal.
- **Close/cancel:** standard modal dismiss — just closes without action.

State: `const [isResetModalOpen, setIsResetModalOpen] = useState(false)`.

> **Do not** replicate the legacy `confirmReset` + `setTimeout` pattern — use the Modal instead.

# Files to create

```
src/components/survey/SurveyControls/
├── SurveyControls.tsx
├── SurveyControls.test.tsx
├── SurveyControls.types.ts          # internal types if needed (e.g. BarContentByPhase)
├── SurveyControls.constants.ts      # NUMBER_ANIMATION_MS
├── SurveyControls.stories.tsx
└── utils/
    ├── useAnimatedNumber.ts
    └── useAnimatedNumber.test.ts
```

# Unit test cases (BDD)

```ts
describe('<SurveyControls />', () => {

  describe('given phase is CATEGORY_SELECT', () => {
    it('renders the quiz title in the center pill', ...);
    it('disables the back button', ...);
    it('disables the reset button', ...);
  });

  describe('given phase is QUESTION_ANSWER and answersCount > 0', () => {
    it('enables the back button', ...);
    it('enables the reset button', ...);

    describe('on a large screen (>400px)', () => {
      it('renders category name, divider, and question count in the pill', ...);
    });

    describe('on a small screen (≤400px)', () => {
      it('renders only the question count (no category name or divider)', ...);
    });
  });

  describe('given phase is QUESTION_ANSWER but answersCount is 0', () => {
    it('disables the back button', ...);
  });

  describe('given phase is FINISH', () => {
    it('renders "Prawie koniec!" in the center pill', ...);
    it('disables the back button', ...);
    it('disables the reset button', ...);
  });

  describe('when the back button is clicked', () => {
    it('calls onPrevious', ...);
  });

  describe('when the reset button is clicked', () => {
    it('opens the reset confirmation modal', ...);
  });

  describe('when the reset modal primary action is confirmed', () => {
    it('calls onReset', ...);
    it('closes the modal', ...);
  });

  describe('when the reset modal is dismissed', () => {
    it('does not call onReset', ...);
    it('closes the modal', ...);
  });
});

describe('useAnimatedNumber()', () => {
  describe('when value changes', () => {
    it('triggers the animation flag for NUMBER_ANIMATION_MS milliseconds', ...);
    it('clears the animation flag after the timeout', ...);
    it('cancels the timeout on unmount (no state update after unmount)', ...);
  });

  describe('when value does not change', () => {
    it('does not trigger the animation flag', ...);
  });
});
```

# Storybook stories

- `CategorySelect` — `phase="CATEGORY_SELECT"`, `title="Światopogląd"`, `answersCount=0`
- `QuestionAnswerLargeScreen` — `phase="QUESTION_ANSWER"`, `categoryName="Polityka zagraniczna"`, `questionsLeftnCategory=11`, `answersCount=5`
- `QuestionAnswerSmallScreen` — same props, viewport ≤ 400 px (use Storybook viewport parameter)
- `QuestionAnswerLongName` — `phase="QUESTION_ANSWER"`, `categoryName="Really Looong Quiz Name..."`, `questionsLeftnCategory=11`, `answersCount=3`
- `Finish` — `phase="FINISH"`, `answersCount=11`
- `ResetModalOpen` — `phase="QUESTION_ANSWER"`, `answersCount=5` — use a wrapper story that sets `isResetModalOpen` to `true` via `play()`
- `BackButtonDisabledNoAnswers` — `phase="QUESTION_ANSWER"`, `answersCount=0`

# Remember about standards

- Use the standard color palette — never add raw hex/rgb values; check `src/index.css` and [athena index.css](https://github.com/gi-org-pl/athena/blob/main/src/index.css)
- Use Athena `Button` for both action buttons — do **not** roll a custom button
- Use Athena `Modal` for the reset confirmation — do **not** replicate the legacy `confirmReset` + `setTimeout` approach
- All user-visible strings must use Lingui macros (`<Trans>` in JSX, `` t`…` `` for attributes/ARIA labels) — no hardcoded literals
- Run `yarn i18n:extract` after adding strings; commit the updated `.po` files
- No styled-components — Tailwind utility classes only
- Create unit tests with Vitest, BDD style, ≥95% coverage
- Create Storybook stories for all variants listed above
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)

# Resources

- [Legacy SurveyHeader](https://github.com/gi-org-pl/mypolitics-app-legacy/tree/develop/frontend/src/components/Survey/v3/SingleSurveyPage/SurveyHeader) — analyze for behaviour only; do **not** copy styled-components or the `confirmReset`/`setTimeout` reset pattern
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
- [ ] Storybook stories added for all 7 variants listed above
- [ ] Biome lint clean
- [ ] TypeScript clean (no `any`, no `@ts-ignore`)
- [ ] No styled-components — Tailwind only
- [ ] Athena `Button` used for back and reset buttons
- [ ] Athena `Modal` used for reset confirmation — no legacy `confirmReset` + `setTimeout`
- [ ] All user-visible strings wrapped in Lingui macros — no hardcoded literals
- [ ] `yarn i18n:extract` run after adding strings; `.po` files committed
- [ ] `NUMBER_ANIMATION_MS` extracted to `SurveyControls.constants.ts`
- [ ] `useAnimatedNumber` timeout cleaned up on unmount (no memory leaks)
- [ ] Small-screen breakpoint (≤400 px) hides category name and divider correctly
- [ ] CI green: build, lint, test
