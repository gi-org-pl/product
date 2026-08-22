# Story

As a logged-in user, I want to see my organisations on the `/organisations` page so I can quickly navigate to manage or browse each one.

## Differences between design and final effect

- Please use Athena's components if possible
- NGO Manager design isn't fully aligned with the Athena design. If an external component (like Button) is different than the one in the design, please keep it as it in Athena. Do not adjust external components for the design.
- Colors may be different. Please use the closest one you can find until we adjust the NGO Manager design for our new color palette
- Do **not** implement API connection — UI only, use mock/static data

## Screens covered

Two states visible in the design:

1. **Empty state** — user has no organisations yet
2. **Filled state** — user belongs to one or more organisations (with two role variants per card)

## Component properties

### `OrganisationCard`

| Prop | Type | Required | Description |
|---|---|---|---|
| `name` | `string` | ✅ | Organisation name |
| `membersCount` | `number \| null` | ✅ | Member count; `null` renders "Brak członków" |
| `role` | `'manager' \| 'member'` | ✅ | Determines CTA button label and action |
| `paidUntil` | `string \| null` | ✅ | ISO date string; `null` hides the status badge |
| `onManage` | `() => void` | ❌ | Called when "Zarządzaj" is clicked (role=manager) |
| `onBrowse` | `() => void` | ❌ | Called when "Przeglądaj" is clicked (role=member) |

## Athena components to use

| Athena component | Where |
|---|---|
| `Button` | "Zarządzaj", "Przeglądaj", "Utwórz organizację" CTAs |
| `Badge` | Payment status label — "Opłacona do DD.MM.YYYY r." (shown only when `paidUntil` is set) |
| `Section` | "Twoje organizacje (N)" wrapper section |

## How to init the component?

1. Create the `OrganisationCard` component in the `organisations` domain:
   `src/components/organisations/OrganisationCard/`
2. Create the `OrganisationsPage` page component in:
   `src/pages/OrganisationsPage/`
3. Adjust component structure to [the standard](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)
4. Add unit tests and Storybook stories

### Suggested file tree

```
src/
├── components/
│   └── organisations/
│       └── OrganisationCard/
│           ├── OrganisationCard.tsx
│           ├── OrganisationCard.test.tsx
│           ├── OrganisationCard.types.ts
│           └── OrganisationCard.stories.tsx
└── pages/
    └── OrganisationsPage/
        ├── OrganisationsPage.tsx
        └── OrganisationsPage.test.tsx
```

> Drop any file above that ends up being empty or unnecessary.

## Layout notes

### Desktop

- Page heading: `Cześć, <UserName>!`
- `Section` titled `Twoje organizacje (N)` — N = total org count
- **Empty state** (N = 0): `InfoMessage` with title "Witamy na pokładzie!" and body text "Utwórz swoją pierwszą organizację lub poproś o zaproszenie do istniejącej." + `Button` "Utwórz organizację" inside the section
- **Filled state** (N > 0): responsive grid of `OrganisationCard`s + `Button` "Utwórz organizację" below the grid

### Mobile

- Same structure, single-column layout
- Top nav replaced by hamburger icon

### `OrganisationCard` anatomy

```
┌──────────────────────────────────────────────┐
│  [Badge: "✓ Opłacona do DD.MM.YYYY r."]      │  ← only if paidUntil set
│  Organisation Name                            │
│  80 członków  /  Brak członków               │
│                              [Button: CTA]   │
└──────────────────────────────────────────────┘
```

- `role === 'manager'` → Button label **"Zarządzaj"** (primary variant)
- `role === 'member'` → Button label **"Przeglądaj"** (secondary/outline variant)

## Mock data (for development only)

```ts
// OrganisationsPage.tsx — static mock, no API call
const mockOrganisations = [
  {
    id: '1',
    name: 'Generacja Innowacja',
    membersCount: 80,
    role: 'manager' as const,
    paidUntil: '2025-06-10',
  },
  {
    id: '2',
    name: 'Stowarzyszenie Przyjaciół',
    membersCount: null,
    role: 'member' as const,
    paidUntil: null,
  },
];
```

## Remember about standards

- Use the standard color palette — never add colors directly (check [Tailwind colors](https://tailwindcss.com/docs/colors) and `src/index.css`)
- Create unit tests with Vitest for 100% of created code where feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Use **BDD / Given–When–Then** structure for all tests
- Create a Storybook story for `OrganisationCard` covering all prop variants: empty state, manager role with badge, member role without badge
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)

## Definition of Done

- [ ] Code follows folder structure (`docs/frontend/conventions/PROJECT_STRUCTURE.md`)
- [ ] Naming follows `docs/frontend/conventions/NAMING.md`
- [ ] Component layout follows `docs/frontend/conventions/COMPONENT_STRUCTURE.md`
- [ ] Unit tests added/updated, BDD style, coverage ≥95% on changed files
- [ ] If user-facing: Playwright happy-path e2e added/updated (Gherkin)
- [ ] Biome lint clean (no disabled rules without justification)
- [ ] TypeScript clean (no `any`, no `@ts-ignore` without comment)
- [ ] API responses validated with Zod
- [ ] Shared component? → Storybook story added
- [ ] State escalation to Zustand justified in PR description (if applicable)
- [ ] CI green: build, lint, test, e2e

## Resources

- [Figma project link](https://www.figma.com/design/wtEn2r9S9s4rzq1teIXeE9/asystent-ngo?node-id=0-1&t=ZutmUh0Dly1Plmh2-1)
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Storybook docs](https://storybook.js.org/docs/writing-stories)
- [Tailwind docs](https://tailwindcss.com/docs/)
- [Vitest docs](https://vitest.dev/guide/)
