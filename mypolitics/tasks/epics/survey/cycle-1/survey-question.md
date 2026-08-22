# Story

As a user taking a survey, I want to see the current question clearly displayed with an answer selector and an optional explanation, so I can understand what I'm answering and make an informed choice.

# Component properties

```ts
interface SurveyQuestionProps {
  question: string;           // Question text to display
  questionDescription?: string; // Optional explanation text (shown on demand)
}
```

# Implementation notes

## File structure

```
src/components/survey/SurveyQuestion/
├── SurveyQuestion.tsx
├── SurveyQuestion.test.tsx
├── SurveyQuestion.types.ts
├── SurveyQuestion.constants.ts   ← underscored phrases + explanation trigger phrases
└── SurveyQuestion.stories.tsx
```

## Underscore rendering

Define a constant `UNDERSCORED_PHRASES` in `SurveyQuestion.constants.ts` — a list of translatable strings that should be visually underscored inside the question text when they appear. Wrap matched substrings in a `<span>` with `text-decoration: underline`.

Example phrases (Polish): `"nie"`, `"nie powinien"`, `"powinien"` — the list must be kept in the constants file and translated via Lingui `msg` macro so it works across locales.

## Explanation trigger phrases

Define a constant `EXPLANATION_TRIGGER_PHRASES` in `SurveyQuestion.constants.ts` — a list of translatable strings that signal where the explanation preview text begins (e.g. the first sentence). Include a fallback (first N chars) for when no trigger phrase is found.

The "Sprawdź wyjaśnienie" (Check explanation) button is only rendered when `questionDescription` is provided.

## Explanation animation

Use a CSS height transition (or Framer Motion `AnimatePresence` + `motion.div`) to animate the explanation expanding and collapsing when the user clicks "Sprawdź wyjaśnienie". The explanation is collapsed by default.

## Athena components

- `ButtonSelect` — answer choice dropdown (label should reflect the first part of the question text as a translatable fallback)
- `Button` — "Sprawdź wyjaśnienie" toggle button (variant: secondary or ghost, icon: eye)

All user-visible strings must use Lingui macros (`<Trans>` / `t`).

# Acceptance criteria

- [ ] Question text is rendered inside a dark-teal card
- [ ] Phrases defined in `UNDERSCORED_PHRASES` are underlined when they appear in the question text
- [ ] `ButtonSelect` (Athena) is rendered below the question text for answer selection
- [ ] "Sprawdź wyjaśnienie" button is rendered only when `questionDescription` is provided
- [ ] Clicking "Sprawdź wyjaśnienie" animates the explanation into view; clicking again collapses it
- [ ] `UNDERSCORED_PHRASES` and `EXPLANATION_TRIGGER_PHRASES` are defined as Lingui-translatable constants
- [ ] Component is purely presentational — no direct API calls or context reads inside it
- [ ] All user-visible strings go through `<Trans>` / `t` macros; no hardcoded literals

# Remember about standards

- Use the standard colors palette, never add colors directly (check `src/index.css` and [Athena palette](https://github.com/gi-org-pl/athena/blob/main/src/index.css))
- Create unit tests with Vitest (BDD / Given–When–Then) for 100% coverage of the component logic
- Create a Storybook story covering: default (no explanation), with explanation collapsed, with explanation expanded
- Comply with [component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)
- Run `yarn i18n:extract` after adding new strings; commit updated `.po` files

# Definition of Done

- [ ] Code follows folder structure (`docs/frontend/conventions/PROJECT_STRUCTURE.md`)
- [ ] Naming follows `docs/frontend/conventions/NAMING.md`
- [ ] Component layout follows `docs/frontend/conventions/COMPONENT_STRUCTURE.md`
- [ ] Unit tests added, BDD style, coverage ≥95% on changed files
- [ ] Biome lint clean (no disabled rules without justification)
- [ ] TypeScript clean (no `any`, no `@ts-ignore` without comment)
- [ ] Storybook story added (default / with explanation / explanation expanded)
- [ ] All user-visible strings wrapped in Lingui macros — no hardcoded literals
- [ ] `yarn i18n:extract` run; `.po` files committed
- [ ] CI green: build, lint, test

# Resources

- [Legacy component (Question.tsx)](https://github.com/gi-org-pl/mypolitics-app-legacy/tree/develop/frontend/src/components/Survey/v3/SingleSurveyPage/SurveyContent/QuestionAnswer/Question)
- [Legacy SurveyQuestion](https://github.com/gi-org-pl/mypolitics-app-legacy/tree/develop/frontend/src/components/Survey/SurveyQuestion)
- [Athena components](https://github.com/gi-org-pl/athena)
- [Figma project](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=1190-9207&t=k6GtQ4k9HtLFKbnM-1)
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Storybook docs](https://storybook.js.org/docs/writing-stories)
- [Tailwind docs](https://tailwindcss.com/docs/)
- [Vitest docs](https://vitest.dev/guide/)
- [Lingui docs](https://lingui.dev/)
