# Story

As a user taking a quiz, I want one cohesive screen that walks me through every survey phase (picking topics → answering questions → demographics → newsletter) with consistent chrome (progress bar + controls) and smooth transitions between questions and phases — so the whole experience feels like a single guided flow instead of disconnected steps.

# Component properties

**Component:** `SurveyQuestionnaire`
**Location:** `src/components/survey/SurveyQuestionnaire/`
**Shared:** no — domain component under `survey`
**Epic:** survey | **Cycle:** 2

This is the **orchestrator** for the survey flow. It composes every cycle-1 survey component plus the cycle-2 `SurveyCategorySelect`, owns the phase state machine, swaps the action button per phase, and wires the per-question/per-phase transition animations. It is **fully controlled** — all domain data and async work live in the parent (or a future page wrapping it).

```ts
import type { SurveyPhase } from '@/components/survey/SurveyControls/SurveyControls.types';
import type { Demographics } from '@/components/survey/SurveyDemographics/SurveyDemographics.types';
import type { SurveyCategory } from '@/components/survey/SurveyCategorySelect/SurveyCategorySelect.types';
import type { SurveyAnswerType } from '@/components/survey/SurveyAnswer/SurveyAnswer.types';

export type QuestionnairePhase =
  | 'CATEGORY_SELECT'
  | 'QUESTION_ANSWER'
  | 'DEMOGRAPHICS'
  | 'NEWSLETTER'; // FINISH is reached by the parent navigating away (e.g. to /results)

export interface QuestionnaireAnswerOption {
  id: string;
  title: string;            // pre-translated by the parent
  type: SurveyAnswerType;   // strongly-agree | agree | disagree | strongly-disagree | custom | custom-selectable
  isSelected?: boolean;     // only meaningful when type === 'custom-selectable'
}

export interface QuestionnaireQuestion {
  id: string;
  text: string;                // pre-translated
  description?: string;        // pre-translated
  categoryName: string;        // pre-translated
  answers: QuestionnaireAnswerOption[];
}

export interface SurveyQuestionnaireProps {
  // --- Chrome ---
  quizTitle: string;                // pre-translated; used in SurveyControls during CATEGORY_SELECT
  phase: QuestionnairePhase;        // current phase — controlled
  totalQuestions: number;           // for the progress bar (maxValue)
  answersCount: number;             // for the progress bar (value) and SurveyControls back-disable

  // --- CATEGORY_SELECT phase ---
  categories: SurveyCategory[];
  selectedCategoryIds: string[];
  maxCategorySelection?: number;    // default 3 (mirrors SurveyCategorySelect)
  onCategoriesChange: (ids: string[]) => void;
  onCategoriesSubmit: () => void;   // primary "Idziemy dalej"

  // --- QUESTION_ANSWER phase ---
  currentQuestion: QuestionnaireQuestion | null;       // null only when phase ≠ QUESTION_ANSWER
  questionsLeftInCategory: number;                     // forwarded to SurveyControls pill
  onAnswerSelect: (questionId: string, answerId: string) => void;

  // --- DEMOGRAPHICS phase ---
  isDemographicsLoading?: boolean;
  onDemographicsSubmit: (demographics: Demographics) => void;

  // --- NEWSLETTER phase ---
  newsletterEmail: string;
  onNewsletterEmailChange: (email: string) => void;
  newsletterConsent: boolean;
  onNewsletterConsentChange: (consent: boolean) => void;
  onNewsletterSubmit: () => void;            // primary "Zobacz wyniki" for newsletter phase

  // --- Shared controls callbacks ---
  onPrevious: () => void;
  onReset: () => void;
  onSkip: () => void;                        // secondary "Pomiń" — meaning depends on phase
}
```

> The prop surface is wide on purpose — the orchestrator is the seam between domain state (page/parent) and presentation. Keep this component dumb: **no** API calls, **no** routing, **no** context reads.

### Mapping `QuestionnairePhase` → `SurveyPhase` (for SurveyControls)

| Questionnaire phase | SurveyControls `phase` |
|---|---|
| `CATEGORY_SELECT` | `CATEGORY_SELECT` |
| `QUESTION_ANSWER` | `QUESTION_ANSWER` |
| `DEMOGRAPHICS`    | `FINISH` |
| `NEWSLETTER`      | `FINISH` |

Extract this mapping to `utils/mapToControlsPhase.ts`.

# Behaviour

### Layout (top → bottom)

```
[ SurveySaturatedProgressBar ]                       ← always rendered
[ SurveyControls ]                                   ← always rendered
[ Phase content (one of the four below) ]
[ Action button row (varies per phase) ]
```

The phase content slot is a single animated container — see _Animations_ below.

---

### Phase content per phase

| Phase | Content rendered |
|---|---|
| `CATEGORY_SELECT` | `<SurveyCategorySelect categories={...} selectedIds={...} onChange={...} maxSelection={maxCategorySelection ?? 3} />` |
| `QUESTION_ANSWER` | `<SurveyQuestion question={currentQuestion.text} questionDescription={currentQuestion.description} />` followed by a vertical list of `<SurveyAnswer />` (one per `currentQuestion.answers[i]`) |
| `DEMOGRAPHICS` | `<SurveyDemographics isLoading={isDemographicsLoading} onSubmit={onDemographicsSubmit} onSkip={onSkip} />` |
| `NEWSLETTER` | `<SurveyNewsletter email={...} onEmailChange={...} consent={...} onConsentChange={...} />` |

Important wiring details:

- **Progress bar** receives `value={answersCount}` and `maxValue={totalQuestions}`.
- **SurveyControls** receives the mapped `phase`, `title={quizTitle}`, `categoryName={currentQuestion?.categoryName ?? ''}`, `questionsLeftnCategory={questionsLeftInCategory}`, `answersCount`, `onPrevious`, `onReset`.
- **Question answers** — for each `answer`, render `<SurveyAnswer title={answer.title} type={answer.type} isSelected={answer.isSelected} onClick={() => onAnswerSelect(currentQuestion!.id, answer.id)} />`.
- During phase `QUESTION_ANSWER`, if `currentQuestion` is `null`, render `null` for the phase content (the parent is mid-transition / loading).

> `SurveyDemographics` already owns its own primary/skip buttons, so for that phase the orchestrator **must not** render an extra action button row — see the matrix below.

---

### Action button row per phase

Use Athena `Button`. The row sits below the phase content, inside the same surface.

| Phase | Primary button | Secondary "Pomiń" link | Notes |
|---|---|---|---|
| `CATEGORY_SELECT` | `<Trans>Idziemy dalej</Trans>` — calls `onCategoriesSubmit`. Disabled when `selectedCategoryIds.length === 0`. | yes — calls `onSkip` | |
| `QUESTION_ANSWER` | _none_ | yes — calls `onSkip` | Answer click itself advances the survey; no primary button needed. |
| `DEMOGRAPHICS` | _none from orchestrator_ | _none from orchestrator_ | `SurveyDemographics` already renders its own "Zobacz wyniki" + skip. |
| `NEWSLETTER` | `<Trans>Zobacz wyniki</Trans>` — calls `onNewsletterSubmit` | yes — calls `onSkip` | Submit button is **not** disabled by email validity — parent decides (it may want to allow empty/invalid email + consent=false skip-equivalent). |

The action-row config lives in `SurveyQuestionnaire.constants.ts` as `ACTION_BUTTONS_BY_PHASE`, keyed by `QuestionnairePhase`, so adding/changing a phase is a one-line edit. Skip-button label is a single shared `<Trans>Pomiń</Trans>`.

---

### Animations

This task explicitly owns the animation pass — **verify all child animations work, and add the orchestrator-level ones**.

**Orchestrator-level animations:**

1. **Phase transition** — when `phase` changes, cross-fade + slide the phase content slot (incoming slides in from the right, outgoing slides out to the left). Use Framer Motion `AnimatePresence` + `motion.div` keyed by `phase`.
2. **Question transition** — when, within `QUESTION_ANSWER`, `currentQuestion.id` changes, slide the question card + answers off to the left and the next one in from the right (see the strip of screenshots at the bottom of the design — that is exactly this animation). Use `AnimatePresence mode="wait"` keyed by `currentQuestion.id`.
3. **Progress bar** — already animated by `SurveySaturatedProgressBar` (flash on value change). Verify it still flashes on every answer; do not duplicate.
4. **Answer click feedback** — already handled inside `SurveyAnswer` via `useClickAnimation`. Verify it fires on click; do not duplicate.
5. **Selected → next-question handoff** — when an answer is clicked, the answer briefly stays in its "selected" state (~120 ms) before the question transition kicks in. The orchestrator does **not** need to manage this delay itself if the parent updates `currentQuestion` after a short timeout; but the transition animation in (2) must look continuous. Confirm during integration; if not smooth, expose an `ANSWER_HANDOFF_DELAY_MS` constant and add a local `useEffect` that defers rendering the new question by that many ms.

All durations and easings live in `SurveyQuestionnaire.constants.ts` (`PHASE_TRANSITION_MS`, `QUESTION_TRANSITION_MS`, `ANSWER_HANDOFF_DELAY_MS`).

Respect `prefers-reduced-motion` — when the media query matches, replace slide+fade with an instant swap. Framer Motion's `useReducedMotion` hook is the standard primitive.

**Child animation verification checklist (part of DoD):**

- [ ] `SurveySaturatedProgressBar` flashes when `answersCount` changes mid-quiz
- [ ] `SurveyControls` animated number ticks when `questionsLeftInCategory` changes
- [ ] `SurveyAnswer` scale-pulse fires on click
- [ ] `SurveyQuestion` explanation expand/collapse animates smoothly
- [ ] If any child animation is missing, file a follow-up task referencing the cycle-1 ticket — do **not** patch the child from this task

---

### i18n

- Only the orchestrator's own user-visible strings (`Idziemy dalej`, `Zobacz wyniki`, `Pomiń`) are wrapped in `<Trans>` here.
- Every other piece of text (`quizTitle`, `currentQuestion.text`, `answers[i].title`, `categoryName`, `categories[i].name`) arrives **pre-translated** from the parent. Do **not** double-wrap.
- Run `yarn i18n:extract` after adding strings.

---

### State management

Default to `useState` for any local UI state. There should be very little — the component is controlled. Likely candidates:

- Optional `useReducedMotion` from Framer Motion.
- Optional deferred-question state if you implement the handoff delay locally.

**Do not** introduce Zustand here — none of the triggers (perf, persistence, middleware) apply.

# Files to create

```
src/components/survey/SurveyQuestionnaire/
├── SurveyQuestionnaire.tsx
├── SurveyQuestionnaire.test.tsx
├── SurveyQuestionnaire.types.ts          # QuestionnairePhase, QuestionnaireQuestion, QuestionnaireAnswerOption, SurveyQuestionnaireProps
├── SurveyQuestionnaire.constants.ts      # ACTION_BUTTONS_BY_PHASE, PHASE_TRANSITION_MS, QUESTION_TRANSITION_MS, ANSWER_HANDOFF_DELAY_MS
├── SurveyQuestionnaire.stories.tsx
└── utils/
    ├── mapToControlsPhase.ts
    └── mapToControlsPhase.test.ts
```

# Unit test cases (BDD)

```ts
describe('<SurveyQuestionnaire />', () => {

  describe('chrome (rendered in every phase)', () => {
    it('renders SurveySaturatedProgressBar with answersCount/totalQuestions', ...);
    it('renders SurveyControls with the mapped SurveyPhase', ...);
  });

  describe('given phase is CATEGORY_SELECT', () => {
    it('renders SurveyCategorySelect with the provided categories and selection', ...);
    it('renders the "Idziemy dalej" primary button', ...);
    it('disables the primary button when no categories are selected', ...);
    it('enables the primary button when at least one category is selected', ...);
    it('renders the "Pomiń" secondary link', ...);

    describe('when "Idziemy dalej" is clicked', () => {
      it('calls onCategoriesSubmit', ...);
    });

    describe('when "Pomiń" is clicked', () => {
      it('calls onSkip', ...);
    });

    describe('when a category checkbox is toggled', () => {
      it('calls onCategoriesChange with the new selection', ...);
    });
  });

  describe('given phase is QUESTION_ANSWER', () => {
    it('renders SurveyQuestion with the current question text and description', ...);
    it('renders one SurveyAnswer per answer in the current question', ...);
    it('does not render a primary action button', ...);
    it('renders the "Pomiń" secondary link', ...);

    describe('when an answer is clicked', () => {
      it('calls onAnswerSelect with the question id and answer id', ...);
    });

    describe('given currentQuestion is null', () => {
      it('renders no question card (parent is mid-transition)', ...);
    });
  });

  describe('given phase is DEMOGRAPHICS', () => {
    it('renders SurveyDemographics with isLoading and the submit/skip callbacks', ...);
    it('does not render an orchestrator-level action button row', ...);
    it('maps SurveyControls phase to FINISH', ...);
  });

  describe('given phase is NEWSLETTER', () => {
    it('renders SurveyNewsletter with the controlled email/consent props', ...);
    it('renders the "Zobacz wyniki" primary button', ...);
    it('renders the "Pomiń" secondary link', ...);
    it('maps SurveyControls phase to FINISH', ...);

    describe('when "Zobacz wyniki" is clicked', () => {
      it('calls onNewsletterSubmit', ...);
    });

    describe('when the email input changes', () => {
      it('calls onNewsletterEmailChange with the new value', ...);
    });

    describe('when the consent checkbox toggles', () => {
      it('calls onNewsletterConsentChange with the new value', ...);
    });
  });

  describe('SurveyControls wiring', () => {
    it('forwards quizTitle as the controls title', ...);
    it('forwards questionsLeftInCategory and categoryName during QUESTION_ANSWER', ...);
    it('forwards onPrevious and onReset', ...);
  });

  describe('reduced motion', () => {
    it('swaps phases instantly when prefers-reduced-motion is set', ...);
    it('swaps questions instantly when prefers-reduced-motion is set', ...);
  });
});

describe('mapToControlsPhase()', () => {
  describe.each([
    ['CATEGORY_SELECT', 'CATEGORY_SELECT'],
    ['QUESTION_ANSWER', 'QUESTION_ANSWER'],
    ['DEMOGRAPHICS',    'FINISH'],
    ['NEWSLETTER',      'FINISH'],
  ])('given questionnaire phase is %s', (input, expected) => {
    it(`returns ${expected}`, ...);
  });
});
```

# Storybook stories

Pass a stateful wrapper (`useState`) per story so the controlled props update on interaction. Each story should render the full orchestrator chrome so reviewers can see the phase swap in context.

- `PhaseCategorySelect` — `phase='CATEGORY_SELECT'`, 5 mock categories, none selected
- `PhaseCategorySelectPartiallyChosen` — 2 of 3 chosen
- `PhaseQuestionAnswer` — `phase='QUESTION_ANSWER'`, mock question with 4 standard answers (strongly-agree → strongly-disagree)
- `PhaseQuestionAnswerWithExplanation` — same as above but `currentQuestion.description` provided
- `PhaseQuestionAnswerLongText` — long question text + long answer titles (mirrors the long-question screen in the design)
- `PhaseDemographics` — `phase='DEMOGRAPHICS'`, default state
- `PhaseDemographicsLoading` — `isDemographicsLoading=true`
- `PhaseNewsletter` — `phase='NEWSLETTER'`, empty email, consent unchecked
- `PhaseNewsletterFilled` — valid email + consent checked
- `PhaseTransition` — use `play()` to programmatically advance from `QUESTION_ANSWER` to `DEMOGRAPHICS` so the transition animation is visible
- `QuestionTransition` — use `play()` to swap `currentQuestion` so the per-question slide animation is visible
- `ReducedMotion` — use Storybook's `prefers-reduced-motion: reduce` parameter

# Remember about standards

- Use the standard color palette — never raw hex/rgb; check `src/index.css` and [athena index.css](https://github.com/gi-org-pl/athena/blob/main/src/index.css)
- Use Athena `Button` for both action buttons in every phase — no custom buttons
- No styled-components — Tailwind utility classes only
- All orchestrator-owned strings (`Idziemy dalej`, `Zobacz wyniki`, `Pomiń`) wrapped in Lingui macros — no hardcoded literals
- Child-provided strings (`quizTitle`, question text, answer titles, category names) arrive pre-translated — do **not** double-wrap
- Run `yarn i18n:extract` after adding strings; commit the updated `.po` files
- Default to `useState` for local state — Zustand is not justified here
- No context hooks, no API calls, no routing inside the component — it is fully controlled
- Animations honor `prefers-reduced-motion` via Framer Motion's `useReducedMotion`
- Animation durations and the action-button config live in `SurveyQuestionnaire.constants.ts`
- Create unit tests with Vitest, BDD style, ≥95% coverage on all new files
- Create Storybook stories for all variants listed above
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)

# Resources

- [Legacy SingleSurveyPage](https://github.com/gi-org-pl/mypolitics-app-legacy/tree/develop/frontend/src/components/Survey/v3/SingleSurveyPage) — analyze the phase/step orchestration only; do **not** copy styled-components, redux usage, or Apollo wiring
- [Figma project link](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=1190-9207&t=k6GtQ4k9HtLFKbnM-1)
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Framer Motion — AnimatePresence](https://www.framer.com/motion/animate-presence/)
- [Framer Motion — useReducedMotion](https://www.framer.com/motion/use-reduced-motion/)
- [Storybook docs](https://storybook.js.org/docs/writing-stories)
- [Tailwind docs](https://tailwindcss.com/docs/)
- [Vitest docs](https://vitest.dev/guide/)

# Dependencies — must be done first

- `SurveySaturatedProgressBar` (`epics/survey/cycle-1/survey-saturated-progress-bar.md`)
- `SurveyControls` (`epics/survey/cycle-1/survey-controls.md`)
- `SurveyQuestion` (`epics/survey/cycle-1/survey-question.md`)
- `SurveyAnswer` (`epics/survey/cycle-1/survey-answer.md`)
- `SurveyDemographics` (`epics/survey/cycle-1/survey-demographics.md`)
- `SurveyNewsletter` (`epics/survey/cycle-1/survey-newsletter.md`)
- `SurveyCategorySelect` (`epics/survey/cycle-2/survey-category-select.md`)

If Framer Motion isn't yet in `package.json`, adding it requires Technical Leader approval per `CLAUDE.md` §1. Add a sub-task: "obtain TL approval for `framer-motion` dependency".

# Definition of Done

- [ ] Code follows folder structure (`docs/frontend/conventions/PROJECT_STRUCTURE.md`)
- [ ] Naming follows `docs/frontend/conventions/NAMING.md`
- [ ] Component layout follows `docs/frontend/conventions/COMPONENT_STRUCTURE.md`
- [ ] Unit tests added, BDD style, coverage ≥95% on all new files
- [ ] Storybook stories added for all variants listed above
- [ ] Biome lint clean
- [ ] TypeScript clean (no `any`, no `@ts-ignore`)
- [ ] No styled-components — Tailwind + Athena components only
- [ ] Athena `Button` used for "Idziemy dalej", "Zobacz wyniki" and "Pomiń"
- [ ] `SurveyCategorySelect`, `SurveyQuestion`+`SurveyAnswer` list, `SurveyDemographics`, `SurveyNewsletter` correctly rendered per `phase`
- [ ] Action button row matches the per-phase matrix (no extra row during `DEMOGRAPHICS`)
- [ ] `SurveyControls` phase mapping via `mapToControlsPhase` util with its own tests
- [ ] Phase transition animated via `AnimatePresence`, keyed by `phase`
- [ ] Per-question transition animated via `AnimatePresence`, keyed by `currentQuestion.id`
- [ ] `useReducedMotion` honored — instant swap when user prefers reduced motion
- [ ] Child-component animations verified (progress bar flash, animated number, answer click pulse, explanation expand)
- [ ] All orchestrator-owned strings wrapped in Lingui macros — no hardcoded literals
- [ ] No double-translation of `quizTitle`, question text, answer titles, category names
- [ ] `yarn i18n:extract` run after adding strings; `.po` files committed
- [ ] No Zustand introduced — `useState` only
- [ ] No context hooks, no API calls, no routing inside the component
- [ ] Framer Motion dependency tracked (sub-task for TL approval if it's new)
- [ ] CI green: build, lint, test
