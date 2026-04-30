## Story

As a user, I want to fill in a form to create a new organisation so that it can be registered in the system.

## Differences between design and final effect

- Please use Athena's components if possible.
- NGO Manager design isn't fully aligned with the Athena design. If an external component (like Button) is different than the one in the design, please keep it as it is in Athena. Do not adjust external components for the design.
- Colors may be different. Please use the closest one you can find until we adjust the NGO Manager design for our new color palette.
- **Do not implement API connection** — UI only. Use local state and a placeholder `onSubmit` handler.

---

## Component properties

### Page: `OrganisationCreatePage`

Route: `/organisations/create`

The page renders:
- A heading **"Nowa organizacja"** with a subtitle **"Podaj dane swojej organizacji."**
- A single form divided into two labelled sections (see below)
- A primary submit button **"Utwórz organizację"**

---

### Section 1 — "Dane rejestracyjne"

Use the `Section` component with the label **"Dane rejestracyjne"**.

Laid out as a **2-column grid**. Fields (in order, left → right, top → bottom):

| # | Label | Component | Required | Placeholder / Options |
|---|---|---|---|---|
| 1 | Nazwa organizacji | `Input` | ✅ | — |
| 2 | REGON | `Input` | ✅ | `525541471` |
| 3 | KRS | `Input` | ✅ | `0001041229` |
| 4 | NIP | `Input` | ✅ | `5214023308` |
| 5 | Forma prawna | `Select` | ✅ | Options: `Stowarzyszenie`, `Fundacja`, `Spółdzielnia socjalna`, `Inne` |
| 6 | Wielkość | `Select` | ✅ | Options: `1-9 osób`, `10-50 osób`, `51-200 osób`, `200+ osób` |
| 7 | Branża | `Select` | ✅ | Options: `Informatyka`, `Edukacja`, `Zdrowie`, `Kultura`, `Sport`, `Środowisko`, `Inne` |
| 8 | Rok powstania | `Input` | ✅ | `2025` |

---

### Section 2 — "Dane kontaktowe"

Use the `Section` component with the label **"Dane kontaktowe"**.

Laid out as a **2-column grid**. Fields (in order):

| # | Label | Component | Required | Placeholder |
|---|---|---|---|---|
| 1 | Adres siedziby | `Input` | ✅ | `ul. Asystencka 21, 02-600 Warszawa` |
| 2 | Numer telefonu | `Input` | ✅ | `+48 123 123 123` |
| 3 | Adres e-mail | `Input` (type `email`) | ✅ | `mail@asystent.ngo` |
| 4 | Strona WWW | `Input` (type `url`) | — | `asystent.ngo` |

---

### Submit button

- Component: `Button` (variant `primary`)
- Label: **"Utwórz organizację"**
- Positioned below Section 2, left-aligned.
- On submit: log form values to console (no API call).

---

## Form validation

Use **Zod** for schema definition and derive TypeScript types via `z.infer`. Wire it up with **React Hook Form** (`useForm` + `zodResolver`).

Required fields must show an inline error message (use the `Input`/`Select` built-in error prop if available, otherwise render below the field) when the user attempts to submit with an empty value.

Minimal Zod schema outline:

```ts
const organisationSchema = z.object({
  name: z.string().min(1, 'Pole wymagane'),
  regon: z.string().min(1, 'Pole wymagane'),
  krs: z.string().min(1, 'Pole wymagane'),
  nip: z.string().optional(),
  legalForm: z.string().min(1, 'Pole wymagane'),
  size: z.string().min(1, 'Pole wymagane'),
  industry: z.string().min(1, 'Pole wymagane'),
  foundingYear: z.string().min(1, 'Pole wymagane'),
  address: z.string().optional(),
  phone: z.string().min(1, 'Pole wymagane'),
  email: z.string().email('Nieprawidłowy adres e-mail'),
  website: z.string().optional(),
});
```

> ⚠️ Do **not** install react-hook-form or zod if they are already in the project — check `package.json` first.

---

## How to init the component?

1. Create the page component at `src/pages/OrganisationCreatePage/OrganisationCreatePage.tsx`
2. Register the route `/organisations/create` in the router config (React Router 7, Framework Mode)
3. Adjust the component structure to [the standard](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)
4. Add unit tests and a Storybook story

### Suggested file tree

```
src/pages/OrganisationCreatePage/
├── OrganisationCreatePage.tsx          # Page / view
├── OrganisationCreatePage.test.tsx     # Unit tests
├── OrganisationCreatePage.types.ts     # Types (form data, props)
├── OrganisationCreatePage.constants.ts # Select options (legalForms, sizes, industries, years)
└── utils/
    └── organisationSchema.ts           # Zod validation schema
    └── organisationSchema.test.ts      # Unit tests for schema
```

---

## Assets

No custom assets required. All icons/visuals come from Athena components.

---

## Remember about standards

- Use the standard colours palette — never add colours directly. Check `src/index.css` and [Tailwind docs](https://tailwindcss.com/docs/colors).
- Create unit tests with **Vitest** for 100% of the code created if feasible ([testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md)).
- Create a **Storybook story** with at least two states: empty form and form with validation errors visible.
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md).

---

## Definition of Done

- [ ] Code follows folder structure (`docs/frontend/conventions/PROJECT_STRUCTURE.md`)
- [ ] Naming follows `docs/frontend/conventions/NAMING.md`
- [ ] Component layout follows `docs/frontend/conventions/COMPONENT_STRUCTURE.md`
- [ ] Unit tests added, BDD style, coverage ≥95% on changed files
- [ ] Playwright happy-path e2e added (`e2e/organisations/create.spec.ts`, Gherkin)
- [ ] Biome lint clean (no disabled rules without justification)
- [ ] TypeScript clean (no `any`, no `@ts-ignore` without comment)
- [ ] Zod schema covers all form fields with correct constraints
- [ ] Storybook story added for the page (empty + validation error states)
- [ ] No API calls — UI only; `onSubmit` logs to console
- [ ] CI green: build, lint, test, e2e

---

## Resources

- [Figma design](https://www.figma.com/design/wtEn2r9S9s4rzq1teIXeE9/asystent-ngo?node-id=0-1&t=ZutmUh0Dly1Plmh2-1)
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Storybook docs](https://storybook.js.org/docs/writing-stories)
- [Tailwind docs](https://tailwindcss.com/docs/)
- [Vitest docs](https://vitest.dev/guide/)
- [React Hook Form docs](https://react-hook-form.com/)
- [Zod docs](https://zod.dev/)
