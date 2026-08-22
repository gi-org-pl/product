> **Depends on:** `OrganisationAnnouncementsPage` (IT2) — must be completed first so the "Dodaj" button can navigate here

## Story

As an organisation manager, I want to create a new announcement inside the organisation panel so I can notify members or specific groups about important news.

## Differences between design and final effect

- Please use Athena's components if possible.
- NGO Manager design isn't fully aligned with the Athena design. If an external component (like Button) is different than the one in the design, please keep it as it is in Athena. Do not adjust external components for the design.
- Colors may be different. Please use the closest one you can find until we adjust the NGO Manager design for our new color palette.
- **Do not implement API connection** — UI only. `onPublish` should just log the form values to the console.

---

## Screens covered

Two states visible in the design:

1. **Default state** — audience set to "Wszyscy"; textarea empty; Publikuj button disabled (no content).
2. **Audience picker open — group step** — user clicked "Opublikuj: Wszyscy", then selected "Grupa"; the submenu lists available groups (Warszawa, Projekt) with a back arrow to return to the top-level step.

---

## Routing

- Register route `/organisations/:id/announcements/create` in the router config (React Router 7, Framework Mode).
- The "Anuluj" button navigates back to `/organisations/:id/announcements`.
- The "Dodaj" button on `OrganisationAnnouncementsPage` should link/navigate to this route.

---

## Component properties

### Page: `OrganisationAnnouncementCreatePage`

Route: `/organisations/:id/announcements/create`

The page wraps its content in `OrganisationPanel` with `activeTab="announcements"` (tab stays highlighted while creating). Content rendered as `children`:

```tsx
<OrganisationPanel
  name={mockOrganisation.name}
  avatarUrl={mockOrganisation.avatarUrl}
  membersCount={mockOrganisation.membersCount}
  activeTab="announcements"
  onTabChange={(tab) => navigate(`/organisations/${id}/${tab}`)}
>
  <AnnouncementForm
    onCancel={() => navigate(`/organisations/${id}/announcements`)}
    onPublish={(values) => console.log('publish:', values)}
    mockGroups={MOCK_GROUPS}
  />
</OrganisationPanel>
```

---

### Component: `AnnouncementForm`

Location: `src/components/organisations/AnnouncementForm/`

| Prop | Type | Required | Description |
|---|---|---|---|
| `onCancel` | `() => void` | ✅ | Called when "Anuluj" is clicked |
| `onPublish` | `(values: AnnouncementFormValues) => void` | ✅ | Called when "Publikuj" is clicked; receives form values |
| `mockGroups` | `Group[]` | ✅ | List of groups available in the audience picker (static mock, no API) |

#### `AnnouncementFormValues` type

```ts
// AnnouncementForm.types.ts
export type AnnouncementAudience =
  | { type: 'everyone' }
  | { type: 'group'; groupId: string; groupName: string };

export interface AnnouncementFormValues {
  content: string;
  audience: AnnouncementAudience;
}

export interface Group {
  id: string;
  name: string;
}
```

#### Visual anatomy

```
┌────────────────────────────────────────────────────────────┐
│  Stwórz ogłoszenie          [Opublikuj: Wszyscy ▼]         │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Treść ogłoszenia                                     │  │
│  │                                                      │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│                            [Anuluj]  [Publikuj]            │
└────────────────────────────────────────────────────────────┘
```

- "Stwórz ogłoszenie" is a section title (left), "Opublikuj: …" audience trigger is right-aligned on the same row.
- The `TextArea` fills the available width with placeholder "Treść ogłoszenia".
- "Publikuj" button is `primary` variant; disabled when `content` is empty.
- "Anuluj" button is `secondary`/outline variant.
- Buttons are right-aligned at the bottom of the form.

---

### Component: `AnnouncementAudienceSelect`

Location: `src/components/organisations/AnnouncementForm/AnnouncementAudienceSelect/`

A custom two-step dropdown that controls who can see the announcement.

| Prop | Type | Required | Description |
|---|---|---|---|
| `value` | `AnnouncementAudience` | ✅ | Currently selected audience |
| `groups` | `Group[]` | ✅ | Available groups for the "Grupa" step |
| `onChange` | `(value: AnnouncementAudience) => void` | ✅ | Called when selection changes |

#### Step 1 — top-level picker

Trigger button label:
- "Opublikuj: Wszyscy" when `value.type === 'everyone'`
- "Opublikuj: {groupName}" when `value.type === 'group'`

Dropdown panel header: **"Kto może zobaczyć ogłoszenie?"**

Options rendered with `RadioGroup`:

| Option value | Label |
|---|---|
| `everyone` | Wszyscy *(Każdy w Twojej organizacji)* |
| `group` | Grupa → *(shows arrow; clicking enters Step 2)* |

Selecting "Wszyscy" closes the dropdown immediately and calls `onChange({ type: 'everyone' })`.
Selecting "Grupa" transitions to Step 2 (does **not** close the dropdown).

#### Step 2 — group picker

Panel header: **"← Wybierz grupę:"** (clicking `←` returns to Step 1)

Options rendered with `RadioGroup` — one entry per group in `groups` prop.

Selecting a group closes the dropdown and calls `onChange({ type: 'group', groupId: group.id, groupName: group.name })`.

> Note: `AnnouncementAudienceSelect` is a sub-component of `AnnouncementForm` — it lives inside `AnnouncementForm/AnnouncementAudienceSelect/` and is **not** promoted to `shared/` unless reused elsewhere.

---

## Athena components to use

| Athena component | Where |
|---|---|
| `OrganisationPanel` | Page shell — org header + tabs |
| `TextArea` | Announcement content field |
| `Button` | "Anuluj" (secondary) and "Publikuj" (primary) |
| `RadioGroup` | Audience options inside `AnnouncementAudienceSelect` (both steps) |

---

## How to init the component?

1. Create the page at `src/pages/OrganisationAnnouncementCreatePage/OrganisationAnnouncementCreatePage.tsx`.
2. Create the `AnnouncementForm` component at `src/components/organisations/AnnouncementForm/`.
3. Create `AnnouncementAudienceSelect` as a sub-component inside `AnnouncementForm/`.
4. Register the route `/organisations/:id/announcements/create` in the router config.
5. Update `OrganisationAnnouncementsPage` — wire the "Dodaj" button to navigate to the create route.
6. Adjust all component structures to [the standard](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md).
7. Add unit tests and Storybook stories.

### Suggested file tree

```
src/
├── pages/
│   └── OrganisationAnnouncementCreatePage/
│       ├── OrganisationAnnouncementCreatePage.tsx
│       ├── OrganisationAnnouncementCreatePage.test.tsx
│       └── OrganisationAnnouncementCreatePage.constants.ts   # MOCK_ORGANISATION, MOCK_GROUPS
└── components/
    └── organisations/
        └── AnnouncementForm/
            ├── AnnouncementForm.tsx
            ├── AnnouncementForm.test.tsx
            ├── AnnouncementForm.types.ts
            ├── AnnouncementForm.stories.tsx
            └── AnnouncementAudienceSelect/
                ├── AnnouncementAudienceSelect.tsx
                ├── AnnouncementAudienceSelect.test.tsx
                └── AnnouncementAudienceSelect.stories.tsx
```

> Drop any file above that ends up being empty or unnecessary.

---

## Mock data (for development only)

```ts
// OrganisationAnnouncementCreatePage.constants.ts — static mock, no API call
export const MOCK_ORGANISATION = {
  id: '1',
  name: 'Generacja Innowacja',
  avatarUrl: null,
  membersCount: 80,
};

export const MOCK_GROUPS = [
  { id: 'warszawa', name: 'Warszawa' },
  { id: 'projekt', name: 'Projekt' },
];
```

---

## Remember about standards

- Use the standard colors palette, never add colors directly (check https://tailwindcss.com/docs/colors and our color palette in the `src/index.css` file and in [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css))
- Create unit tests with **Vitest** for 100% of the code created if feasible ([testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md)).
- Use **BDD / Given–When–Then** structure for all tests.
- Create **Storybook stories** for `AnnouncementForm` and `AnnouncementAudienceSelect`, covering:
  - `AnnouncementForm`: default state, textarea filled (Publikuj enabled), audience set to group
  - `AnnouncementAudienceSelect`: closed, step-1 open, step-2 open (group selected)
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md).

---

## Definition of Done

- [ ] Code follows folder structure (`docs/frontend/conventions/PROJECT_STRUCTURE.md`)
- [ ] Naming follows `docs/frontend/conventions/NAMING.md`
- [ ] Component layout follows `docs/frontend/conventions/COMPONENT_STRUCTURE.md`
- [ ] Route `/organisations/:id/announcements/create` registered in router config
- [ ] "Dodaj" button on `OrganisationAnnouncementsPage` navigates to the create route
- [ ] "Anuluj" navigates back to `/organisations/:id/announcements`
- [ ] "Publikuj" is disabled when `content` is empty
- [ ] `AnnouncementAudienceSelect` renders step-1 and step-2 correctly; back arrow returns to step-1
- [ ] Selecting audience updates the trigger button label
- [ ] Unit tests added, BDD style, coverage ≥95% on changed files
- [ ] Playwright happy-path e2e added (`e2e/organisations/announcement-create.spec.ts`, Gherkin)
- [ ] Biome lint clean (no disabled rules without justification)
- [ ] TypeScript clean (no `any`, no `@ts-ignore` without comment)
- [ ] Storybook stories added for `AnnouncementForm` and `AnnouncementAudienceSelect`
- [ ] No API calls — `onPublish` logs to console only
- [ ] CI green: build, lint, test, e2e

---

## Resources

- [Figma design](https://www.figma.com/design/wtEn2r9S9s4rzq1teIXeE9/asystent-ngo?node-id=0-1&t=ZutmUh0Dly1Plmh2-1)
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Storybook docs](https://storybook.js.org/docs/writing-stories)
- [Tailwind docs](https://tailwindcss.com/docs/)
- [Vitest docs](https://vitest.dev/guide/)
- [React Router docs](https://reactrouter.com/en/main)
