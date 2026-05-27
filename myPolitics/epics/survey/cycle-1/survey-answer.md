# Story

As a user taking a survey, I want to see clearly styled answer buttons that visually communicate each answer's sentiment (strongly agree, agree, disagree, strongly disagree, custom, or custom-selectable) — so I can immediately understand each option and confidently click my choice.

# Component properties

**Component:** `SurveyAnswer`
**Location:** `src/components/survey/SurveyAnswer/`
**Shared:** no — domain component under `survey`

```ts
export type SurveyAnswerType =
  | 'strongly-agree'
  | 'agree'
  | 'disagree'
  | 'strongly-disagree'
  | 'custom'
  | 'custom-selectable';

export interface SurveyAnswerProps {
  title: string;
  type: SurveyAnswerType;
  onClick: () => void;
  isDisabled?: boolean;
  isSelected?: boolean; // only meaningful when type === 'custom-selectable'
}
```

# Behaviour

### Layout

Full-width pill-shaped button. An icon sits on the left, the answer text fills the remaining space.

---

### Answer types & visual styles

| type | Background | Text color | Icon |
|---|---|---|---|
| `strongly-agree` | Green (filled) | White | Filled green circle + checkmark SVG |
| `agree` | White / surface | Default dark | Outlined/simple checkmark SVG (green tint) |
| `disagree` | White / surface | Default dark | Simple X SVG (red tint) |
| `strongly-disagree` | Red / dark red (filled) | White | Filled red circle + X SVG |
| `custom` | White / surface | Default dark | Dash / neutral icon SVG |
| `custom-selectable` | White / surface | Default dark | Checkbox-style circle: empty when `isSelected=false`, filled/checked when `isSelected=true` |

Use CSS variables from `src/index.css` / [athena index.css](https://github.com/gi-org-pl/athena/blob/main/src/index.css) — **no raw hex values**. Map types to Tailwind color classes defined by those variables.

Derive the per-type config (icon, bg class, text class) inside a `ANSWER_TYPE_CONFIG` constant in `SurveyAnswer.constants.ts` so the main component stays clean.

---

### Disabled state (`isDisabled`)

When `isDisabled` is `true`:
- Apply adequate styling and `cursor-not-allowed` on the button wrapper.
- The `onClick` handler must **not** be called.
- Works for all types, including `custom-selectable`.

---

### Custom-selectable state (`isSelected`)

Only relevant when `type === 'custom-selectable'`:
- `isSelected=false` → empty circle icon (unselected state).
- `isSelected=true` → filled/checked icon + distinct selected background tint.

For all other types `isSelected` is ignored.

---

### Click animation

On click (when not disabled), briefly apply a scale-down pulse (`scale-95` → back to `scale-100`) via a short CSS transition or a `useClickAnimation` hook extracted to `utils/useClickAnimation.ts`. The animation duration constant (`CLICK_ANIMATION_MS`) belongs in `SurveyAnswer.constants.ts`.

The animation is purely cosmetic — `onClick` fires immediately regardless.

---

### Icons

Place SVG icons in `src/assets/icons/`. Suggested names:
- `checkmark-strong.svg` — for `strongly-agree`
- `checkmark.svg` — for `agree`
- `x-strong.svg` — for `strongly-disagree`
- `x.svg` — for `disagree`
- `dash.svg` — for `custom`
- `circle-empty.svg` / `circle-checked.svg` — for `custom-selectable`

Import SVGs as React components to keep them inline and styleable.

---

### i18n

The `title` prop is already a translated string passed from the parent — **do not** wrap it again. There are no other user-visible strings in this component, so no Lingui macro calls are needed here.

# Files to create

```
src/components/survey/SurveyAnswer/
├── SurveyAnswer.tsx
├── SurveyAnswer.test.tsx
├── SurveyAnswer.types.ts          # SurveyAnswerType, SurveyAnswerProps
├── SurveyAnswer.constants.ts      # ANSWER_TYPE_CONFIG, CLICK_ANIMATION_MS
├── SurveyAnswer.stories.tsx
└── utils/
    ├── useClickAnimation.ts
    └── useClickAnimation.test.ts
```

# Unit test cases (BDD)

```ts
describe('<SurveyAnswer />', () => {

  describe('given type is strongly-agree', () => {
    it('renders with the filled green background class', ...);
    it('renders the strong checkmark icon', ...);
    it('renders the title text', ...);
  });

  describe('given type is agree', () => {
    it('renders with the surface background class', ...);
    it('renders the simple checkmark icon', ...);
  });

  describe('given type is disagree', () => {
    it('renders the X icon', ...);
  });

  describe('given type is strongly-disagree', () => {
    it('renders with the filled red background class', ...);
    it('renders the strong X icon', ...);
  });

  describe('given type is custom', () => {
    it('renders the dash icon', ...);
  });

  describe('given type is custom-selectable and isSelected is false', () => {
    it('renders the empty circle icon', ...);
  });

  describe('given type is custom-selectable and isSelected is true', () => {
    it('renders the checked circle icon', ...);
    it('applies the selected background tint class', ...);
  });

  describe('when the button is clicked and isDisabled is false', () => {
    it('calls onClick', ...);
  });

  describe('when the button is clicked and isDisabled is true', () => {
    it('does not call onClick', ...);
    it('renders with opacity-50 and cursor-not-allowed classes', ...);
  });
});

describe('useClickAnimation()', () => {
  describe('when triggerAnimation is called', () => {
    it('sets isAnimating to true immediately', ...);
    it('sets isAnimating back to false after CLICK_ANIMATION_MS', ...);
    it('cancels the timeout on unmount (no state update after unmount)', ...);
  });

  describe('when triggerAnimation is not called', () => {
    it('isAnimating is false by default', ...);
  });
});
```

# Storybook stories

- `StronglyAgree` — type = `strongly-agree`, title = "Zdecydowanie się zgadzam"
- `Agree` — type = `agree`, title = "Zgadzam się"
- `Disagree` — type = `disagree`, title = "Nie zgadzam się"
- `StronglyDisagree` — type = `strongly-disagree`, title = "Zdecydowanie się nie zgadzam"
- `Custom` — type = `custom`, title = "Odpowiedź niestandardowa"
- `CustomSelectableUnselected` — type = `custom-selectable`, `isSelected=false`, title = "Odpowiedź możliwa do wybrania"
- `CustomSelectableSelected` — type = `custom-selectable`, `isSelected=true`, title = "Odpowiedź możliwa do wybrania"
- `DisabledStronglyAgree` — type = `strongly-agree`, `isDisabled=true`, title = "Zdecydowanie się zgadzam"
- `DisabledCustomSelectable` — type = `custom-selectable`, `isDisabled=true`, `isSelected=false`, title = "Odpowiedź możliwa do wybrania"
- `ClickAnimation` — use Storybook `play()` to programmatically click the button so the animation is visible

# Remember about standards

- Use the standard colors palette — never add raw hex/rgb values; check `src/index.css` and [athena index.css](https://github.com/gi-org-pl/athena/blob/main/src/index.css)
- Do **not** use Athena's `Button` here — `SurveyAnswer` has bespoke visuals per type that go beyond a generic button variant; implement with a plain `<button>` element styled with Tailwind
- No styled-components — Tailwind utility classes only
- All user-visible strings in this component come from the `title` prop (already i18n-ed by the parent) — no Lingui macros needed inside the component itself
- Create unit tests with Vitest, BDD style, ≥95% coverage on all new files
- Create Storybook stories for all 10 variants listed above
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)

# Resources

- [Legacy Answer folder](https://github.com/gi-org-pl/mypolitics-app-legacy/tree/develop/frontend/src/components/Survey/v3/SingleSurveyPage/SurveyContent/QuestionAnswer/Answer) — analyze for behaviour only; do **not** copy styled-components, Ramda, polished, or the graphql-generated `SurveyAnswerType` enum
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
- [ ] Storybook stories added for all 10 variants listed above
- [ ] Biome lint clean
- [ ] TypeScript clean (no `any`, no `@ts-ignore`)
- [ ] No styled-components — Tailwind only
- [ ] No raw hex/rgb color values — Tailwind classes from the design token palette only
- [ ] `ANSWER_TYPE_CONFIG` and `CLICK_ANIMATION_MS` extracted to `SurveyAnswer.constants.ts`
- [ ] `useClickAnimation` timeout cleaned up on unmount (no memory leaks)
- [ ] `isDisabled=true` prevents `onClick` from firing and renders correct visual state
- [ ] `isSelected` only affects rendering when `type === 'custom-selectable'`
- [ ] SVG icons placed in `src/assets/icons/` and imported as React components
- [ ] No hardcoded user-visible strings inside the component (title comes pre-translated from parent)
- [ ] CI green: build, lint, test
