## Story

As a user, I want to edit an existing organisation's data so that I can keep it up to date.

## Differences between design and final effect

- Please use Athena's components if possible.
- NGO Manager design isn't fully aligned with the Athena design. If an external component (like Button) is different than the one in the design, please keep it as it is in Athena. Do not adjust external components for the design.
- Colors may be different. Please use the closest one you can find until we adjust the NGO Manager design for our new color palette.
- **Do not implement API connection** — UI only. Pre-populate the form with hardcoded mock data and use a placeholder `onSubmit` handler.

---

## Context & dependency

This task builds on `OrganisationCreatePage`. Before starting:

1. `OrganisationCreatePage` must be merged / available on your branch.
2. The key goal of IT2 is to **extract the shared form** from `OrganisationCreatePage` into a reusable `OrganisationForm` component and wire it up in both the create and edit pages. Do **not** duplicate the form fields.

---

## Component properties

### Page: `OrganisationEditPage`

Route: `/organisations/:id/edit`

The page renders:
- A heading **"Edytuj organizację"** with a subtitle **"Zaktualizuj dane swojej organizacji."**
- The shared `OrganisationForm` component pre-populated with mock data (see below)
- A primary submit button **"Zapisz zmiany"**

---

### Shared form refactor: `OrganisationForm`

Extract the two-section form introduced in `OrganisationCreatePage` into a standalone component:

```
src/components/organisations/OrganisationForm/
├── OrganisationForm.tsx           # Form UI — sections + fields, no submit button
├── OrganisationForm.test.tsx      # Unit tests
├── OrganisationForm.types.ts      # OrganisationFormData type (re-export from shared schema)
└── OrganisationForm.stories.tsx   # Storybook stories
```

`OrganisationForm` accepts:
- `defaultValues?: Partial<OrganisationFormData>` — used by the edit page to pre-fill fields
- `onSubmit: (data: OrganisationFormData) => void` — called on valid submission
- `submitLabel: string` — label for the submit button (e.g. `"Utwórz organizację"` or `"Zapisz zmiany"`)
- `isSubmitting?: boolean` — disables the submit button while processing (future-proof for API integration)

> The Zod schema (`organisationSchema`) and `OrganisationFormData` type created in `OrganisationCreatePage` must be moved to `src/components/organisations/OrganisationForm/` (or a shared `src/services/organisations/schemas/` path if the team prefers) so both pages can import them. Agree with the team on the canonical location and update imports in `OrganisationCreatePage` accordingly.

---

### Section 1 — "Dane rejestracyjne" (same as `OrganisationCreatePage`)

Use the `Section` component with the label **"Dane rejestracyjne"**.

Laid out as a **2-column grid**:

| # | Label | Component | Required | Placeholder / Options |
|---|---|---|---|---|
| 1 | Nazwa organizacji | `Input` | ✅ | — |
| 2 | REGON | `Input` | ✅ | `525541471` |
| 3 | KRS | `Input` | ✅ | `0001041229` |
| 4 | NIP | `Input` | — | `5214023308` |
| 5 | Forma prawna | `Select` | ✅ | `Stowarzyszenie`, `Fundacja`, `Spółdzielnia socjalna`, `Inne` |
| 6 | Wielkość | `Select` | ✅ | `1-9 osób`, `10-50 osób`, `51-200 osób`, `200+ osób` |
| 7 | Branża | `Select` | ✅ | `Informatyka`, `Edukacja`, `Zdrowie`, `Kultura`, `Sport`, `Środowisko`, `Inne` |
| 8 | Rok powstania | `Input` | ✅ | `2025` |

---

### Section 2 — "Dane kontaktowe" (same as `OrganisationCreatePage`)

Use the `Section` component with the label **"Dane kontaktowe"**.

Laid out as a **2-column grid**:

| # | Label | Component | Required | Placeholder |
|---|---|---|---|---|
| 1 | Adres siedziby | `Input` | — | `ul. Asystencka 21, 02-600 Warszawa` |
| 2 | Numer telefonu | `Input` | ✅ | `+48 123 123 123` |
| 3 | Adres e-mail | `Input` (type `email`) | ✅ | `mail@asystent.ngo` |
| 4 | Strona WWW | `Input` (type `url`) | — | `asystent.ngo` |

---

### Mock data (pre-populated on edit page)

Since there is no API, pass the following hardcoded object as `defaultValues` to `OrganisationForm`:

```ts
const MOCK_ORGANISATION: OrganisationFormData = {
  name: 'Fundacja Generacja Innowacja',
  regon: '525541471',
  krs: '0001041229',
  nip: '5214023308',
  legalForm: 'Fundacja',
  size: '10-50 osób',
  industry: 'Informatyka',
  foundingYear: '2024',
  address: 'ul. Woronicza 33/112, 02-640 Warszawa',
  phone: '+48 123 123 123',
  email: 'mail@asystent.ngo',
  website: 'asystent.ngo',
};
```

---

### Submit button

- Component: `Button` (variant `primary`)
- Label: **"Zapisz zmiany"** (passed via `submitLabel` prop of `OrganisationForm`)
- On submit: log form values to console (no API call).

---

## How to init the component?

1. **Refactor** `OrganisationCreatePage` — extract the form UI into `OrganisationForm` component (see above). Update existing tests and stories accordingly.
2. **Create** `OrganisationEditPage` at `src/pages/OrganisationEditPage/OrganisationEditPage.tsx`.
3. **Register** the route `/organisations/:id/edit` in the router config (React Router 7, Framework Mode). Read `:id` from `useParams` and pass it to the page (for now it's informational only — no API fetch).
4. **Adjust** component structure to [the standard](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md).
5. Add unit tests and Storybook story.

### Suggested file tree

```
src/
├── components/
│   └── organisations/
│       └── OrganisationForm/
│           ├── OrganisationForm.tsx
│           ├── OrganisationForm.test.tsx
│           ├── OrganisationForm.types.ts
│           ├── OrganisationForm.stories.tsx
│           └── utils/
│               ├── organisationSchema.ts
│               └── organisationSchema.test.ts
└── pages/
    ├── OrganisationCreatePage/
    │   ├── OrganisationCreatePage.tsx      # now thin: renders <OrganisationForm>
    │   ├── OrganisationCreatePage.test.tsx
    │   └── OrganisationCreatePage.constants.ts  # mock/stub data if needed
    └── OrganisationEditPage/
        ├── OrganisationEditPage.tsx        # reads :id, passes mock defaultValues
        ├── OrganisationEditPage.test.tsx
        └── OrganisationEditPage.constants.ts    # MOCK_ORGANISATION
```

---

## Assets

No custom assets required. All icons/visuals come from Athena components.

---

## Remember about standards

- Use the standard colours palette — never add colours directly. Check `src/index.css` and [Tailwind docs](https://tailwindcss.com/docs/colors).
- Create unit tests with **Vitest** for 100% of the code created if feasible ([testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md)).
- Create a **Storybook story** for `OrganisationForm` with: empty state, pre-filled state, validation errors state.
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md).

---

## Definition of Done

- [ ] Code follows folder structure (`docs/frontend/conventions/PROJECT_STRUCTURE.md`)
- [ ] Naming follows `docs/frontend/conventions/NAMING.md`
- [ ] Component layout follows `docs/frontend/conventions/COMPONENT_STRUCTURE.md`
- [ ] `OrganisationForm` extracted as a shared component under `components/organisations/`
- [ ] `OrganisationCreatePage` refactored to use `OrganisationForm` — existing tests still pass
- [ ] `OrganisationEditPage` renders `OrganisationForm` pre-filled with mock data
- [ ] Route `/organisations/:id/edit` registered in React Router config
- [ ] Unit tests added, BDD style, coverage ≥95% on changed files
- [ ] Playwright happy-path e2e added (`e2e/organisations/edit.spec.ts`, Gherkin)
- [ ] Biome lint clean (no disabled rules without justification)
- [ ] TypeScript clean (no `any`, no `@ts-ignore` without comment)
- [ ] Storybook story added for `OrganisationForm` (empty + pre-filled + validation error states)
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
