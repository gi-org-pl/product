# Story

As a user who has just completed a survey, I want to see a newsletter sign-up section so that I can provide my email and consent for marketing communications.

# Component properties

```ts
interface SurveyNewsletterProps {
  email: string;
  onEmailChange: (email: string) => void;
  consent: boolean;
  onConsentChange: (consent: boolean) => void;
}
```

**Component:** `SurveyNewsletter`
**Domain:** `survey`
**Location:** `src/components/survey/SurveyNewsletter/`
**Shared:** false
**Epic:** survey | **Cycle:** 1

# Design

The component renders a compact promotional card containing:

1. **Heading** — `"Zobacz więcej niż wyniki."` (bold)
2. **Subtitle** — `"Poznaj poglądy innych, porównaj się, zdobądź wiedzę o zmianach w społeczeństwie i Twoim otoczeniu!"`
3. **Email input** — placeholder `twoj@mail.com`; use Athena `Input`; controlled via `email` / `onEmailChange`
4. **GDPR checkbox** — use Athena `Checkbox`; controlled via `consent` / `onConsentChange`; label text:
   > *"Wyrażam zgodę na przetwarzanie moich danych osobowych w celu przesyłania mi treści marketingowych przez Fundację Generacja Innowacja. Polityka prywatności."*
5. **Disclaimer caption** — `"Twoje dane osobowe nie będą w żaden sposób powiązane z wynikami."`

There is no submit button — the component is purely a controlled data-entry form. Submission is handled by the parent.

# File structure

```
src/components/survey/SurveyNewsletter/
├── SurveyNewsletter.tsx               # Main view — form layout
├── SurveyNewsletter.test.tsx          # Unit tests (Vitest + RTL, BDD style)
├── SurveyNewsletter.types.ts          # SurveyNewsletterProps type
└── SurveyNewsletter.stories.tsx       # Storybook story — default + variants
```

# Acceptance criteria

## Form structure

- [ ] Renders heading `"Zobacz więcej niż wyniki."` as a prominent text element
- [ ] Renders subtitle paragraph beneath the heading
- [ ] Renders an Athena `Input` for email (`type="email"`, placeholder `twoj@mail.com`)
- [ ] Renders an Athena `Checkbox` with the GDPR consent text and a "Polityka prywatności" link
- [ ] Renders the disclaimer caption below the checkbox
- [ ] Does **not** render any submit button

## Behaviour

- [ ] `email` prop controls the value of the `Input`; any change calls `onEmailChange` with the new value
- [ ] `consent` prop controls the checked state of the `Checkbox`; any change calls `onConsentChange` with the new value
- [ ] The component holds **no internal state** — it is fully controlled by the parent

## Internationalisation

- [ ] All user-visible strings go through Lingui macros — `<Trans>` for JSX text, `` t`…` `` for attributes / ARIA labels
- [ ] `yarn i18n:extract` run after adding strings; `.po` files committed

## Tests (Vitest, BDD, ≥ 95% coverage on changed files)

```
describe('<SurveyNewsletter />', () => {
  describe('given the component is rendered with initial values', () => {
    it('displays the provided email value in the input', ...)
    it('reflects the provided consent state in the checkbox', ...)
  })

  describe('when the user types in the email input', () => {
    it('calls onEmailChange with the new value', ...)
  })

  describe('when the user toggles the consent checkbox', () => {
    it('calls onConsentChange with the new value', ...)
  })
})
```

## Storybook

- [ ] Story: `Default` — empty email, consent unchecked
- [ ] Story: `Filled` — valid email entered, consent checked

# Remember about standards

- Use the standard colors palette, never add colors directly (check https://tailwindcss.com/docs/colors and our color palette in the `src/index.css` file and in [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css))
- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Create a Storybook story for the component with all possible props variants of the component
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)
- **Athena components to use:** `Input`, `Checkbox`

# Definition of Done

- [ ] Code follows folder structure (`docs/frontend/conventions/PROJECT_STRUCTURE.md`)
- [ ] Naming follows `docs/frontend/conventions/NAMING.md`)
- [ ] Component layout follows `docs/frontend/conventions/COMPONENT_STRUCTURE.md`
- [ ] Unit tests added/updated, BDD style, coverage ≥ 95% on changed files
- [ ] Biome lint clean (no disabled rules without justification)
- [ ] TypeScript clean (no `any`, no `@ts-ignore` without comment)
- [ ] Storybook story added
- [ ] All user-visible strings wrapped in Lingui macros (`<Trans>`, `t`, `msg`) — no hardcoded literals
- [ ] `yarn i18n:extract` run after adding/changing strings; `.po` files committed
- [ ] CI green: build, lint, test, e2e

# Resources

- [Figma project link](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=1190-9207&t=k6GtQ4k9HtLFKbnM-1)
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Athena components](https://github.com/gi-org-pl/athena)
- [Storybook docs](https://storybook.js.org/docs/writing-stories)
- [Tailwind docs](https://tailwindcss.com/docs/)
- [Vitest docs](https://vitest.dev/guide/)
