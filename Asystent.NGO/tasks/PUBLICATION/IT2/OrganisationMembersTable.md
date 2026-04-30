> **Depends on:** `OrganisationPanel` (UI-02-IT1)
> **Integrates with (optional, later iteration):** `EditMemberModal`

## Story

As an organisation manager, I want to see a paginated list of all organisation members inside the organisation panel so I can browse, identify, and manage each member quickly.

## Differences between design and final effect

- Please use Athena's components if possible.
- NGO Manager design isn't fully aligned with the Athena design. If an external component (like Button) is different than the one in the design, please keep it as it is in Athena. Do not adjust external components for the design.
- Colors may be different. Please use the closest one you can find until we adjust the NGO Manager design for our new color palette.
- **Do not implement API connection** — UI only. Use static mock data.

---

## Screens covered

1. **Filled state** — organisation has members; paginated table is visible.
2. **Context menu open** — three-dot button is clicked on a row, showing the action menu.

---

## Routing

- Register route `/organisations/:id/members` in the router config (React Router 7, Framework Mode).

---

## Component properties

### Page: `OrganisationMembersPage`

Route: `/organisations/:id/members`

The page wraps its content in `OrganisationPanel` (from UI-02-IT1) with `activeTab="members"` and renders the members tab content as `children`:

1. **Section header** — title `"Osoby w organizacji"`.
2. **`MembersFilters`** — search + filter bar (separate task, UI-04-IT4; render as a placeholder `<MembersFilters />` for now, will be replaced when that task is done).
3. **`MembersTable`** — the members table with column headers and rows.
4. **`Pagination`** — below the table.

#### Usage of `OrganisationPanel`

```tsx
<OrganisationPanel
  name={mockOrganisation.name}
  avatarUrl={mockOrganisation.avatarUrl}
  membersCount={mockOrganisation.membersCount}
  activeTab="members"
  onTabChange={(tab) => console.log('tab changed:', tab)}
  tabCounts={{ members: mockOrganisation.membersCount }}
>
  {/* members content here */}
</OrganisationPanel>
```

---

### Component: `MembersTable`

Location: `src/components/organisations/MembersTable/`

Renders a two-column table (`Nazwa`, `Grupa/Tag`) with a trailing actions column.

| Prop | Type | Required | Description |
|---|---|---|---|
| `members` | `Member[]` | ✅ | Array of member objects to render as rows |
| `currentPage` | `number` | ✅ | Currently active page (1-based), passed to `Pagination` |
| `totalPages` | `number` | ✅ | Total page count, passed to `Pagination` |
| `onPageChange` | `(page: number) => void` | ✅ | Called when pagination page changes |
| `onEditMember` | `(id: string) => void` | ❌ | Called when "Edytuj dane" is clicked |
| `onAddToGroup` | `(id: string) => void` | ❌ | Called when "Dodaj do grupy" is clicked |
| `onShareFiles` | `(id: string) => void` | ❌ | Called when "Udostępnij pliki" is clicked |
| `onRemoveMember` | `(id: string) => void` | ❌ | Called when "Usuń członka" is clicked |

#### Table anatomy

```
┌──────────────────────────────────────────┬──────────────────┬────┐
│ Nazwa                                    │ Grupa/Tag        │    │
├──────────────────────────────────────────┼──────────────────┼────┤
│ [Avatar] Anna Kowalska (ja) [ADMIN]      │ [Warszawa 🏔️]   │ ⋯  │
│          Przewodnicząca                  │                  │    │
├──────────────────────────────────────────┼──────────────────┼────┤
│ [Avatar] Paweł Muchomor-Wojciechowski    │ [Warszawa 🏔️]   │ ⋯  │
│          Prezes zarządu                  │ [Zarząd 💎]      │    │
└──────────────────────────────────────────┴──────────────────┴────┘
              [← Strona  1  2  3  4  …  10  →]
```

- Column **Nazwa**: `Avatar` (photo or initials fallback) + full name + optional `Badge` for role (`ADMIN` — blue/primary, `SUPERADMIN` — red/danger) + `"(ja)"` suffix if the member is the current user.
- Column **Grupa/Tag**: one or more `Badge` components, each showing the group name and a small icon.
- Column **actions** (no header): three-dot button (`⋯`) that opens `MemberContextMenu`.
- `Pagination` is rendered below the table, not inside it.

---

### Sub-component: `MemberRow`

Location: `src/components/organisations/MembersTable/MemberRow/`

Renders a single `<tr>` (or equivalent row element) for one member.

| Prop | Type | Required | Description |
|---|---|---|---|
| `member` | `Member` | ✅ | Member data for this row |
| `onEdit` | `() => void` | ❌ | Forwarded from `MembersTable` |
| `onAddToGroup` | `() => void` | ❌ | Forwarded from `MembersTable` |
| `onShareFiles` | `() => void` | ❌ | Forwarded from `MembersTable` |
| `onRemove` | `() => void` | ❌ | Forwarded from `MembersTable` |

---

### Sub-component: `MemberContextMenu`

Location: `src/components/organisations/MembersTable/MemberRow/MemberContextMenu/`

A small dropdown attached to the three-dot button (⋯). Opens on click, closes on outside click or `Escape`.

Actions (in order):

| Label | Icon | Variant | Callback |
|---|---|---|---|
| Edytuj dane | pencil/edit | default | `onEdit` |
| Dodaj do grupy | plus/add-circle | default | `onAddToGroup` |
| Udostępnij pliki | share/upload | default | `onShareFiles` |
| Usuń członka | trash | **destructive / red** | `onRemove` |

---

### `Member` type

```ts
// MembersTable.types.ts
export type MemberRole = 'admin' | 'superadmin' | null;

export interface MemberGroup {
  id: string;
  name: string;
  icon?: string; // emoji or icon key, e.g. '🏔️'
}

export interface Member {
  id: string;
  fullName: string;
  role: string;           // e.g. 'Przewodnicząca', 'Prezes zarządu'
  systemRole: MemberRole; // drives the ADMIN / SUPERADMIN badge
  isCurrentUser: boolean; // appends '(ja)' to the name
  avatarUrl: string | null;
  groups: MemberGroup[];
  tags: { id: string; name: string }[]; // pre-fills Tagi in EditMemberModal (IT4)
}
```

> **Integration note (IT4):** `onEditMember` should be wired to `EditMemberModal` if possible. If not, it logs `id` to console. The page will manage `editingMember: Member | null` state and pass it to the modal. See `EditMemberModal` task (IT4) for the full integration pattern.

---

## Athena components to use

| Athena component | Where |
|---|---|
| `Avatar` | Member photo / initials in each row |
| `Badge` | `ADMIN` / `SUPERADMIN` system role badge; group/tag badges in the Grupa/Tag column |
| `Pagination` | Below the table |

---

## How to init the component?

1. Create the page at `src/pages/OrganisationMembersPage/OrganisationMembersPage.tsx`.
2. Create `MembersTable` at `src/components/organisations/MembersTable/`.
3. Register route `/organisations/:id/members` in the router config.
4. Adjust all component structures to [the standard](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md).
5. Add unit tests and Storybook stories.

### Suggested file tree

```
src/
├── pages/
│   └── OrganisationMembersPage/
│       ├── OrganisationMembersPage.tsx
│       ├── OrganisationMembersPage.test.tsx
│       └── OrganisationMembersPage.constants.ts   # mock data
└── components/
    └── organisations/
        └── MembersTable/
            ├── MembersTable.tsx
            ├── MembersTable.test.tsx
            ├── MembersTable.types.ts
            ├── MembersTable.stories.tsx
            └── MemberRow/
                ├── MemberRow.tsx
                ├── MemberRow.test.tsx
                └── MemberContextMenu/
                    ├── MemberContextMenu.tsx
                    └── MemberContextMenu.test.tsx
```

> Drop any file above that ends up being empty or unnecessary.

---

## Mock data (for development only)

```ts
// OrganisationMembersPage.constants.ts — static mock, no API call
export const MOCK_ORGANISATION = {
  id: '1',
  name: 'Generacja Innowacja',
  avatarUrl: null,
  membersCount: 80,
};

export const MOCK_MEMBERS: Member[] = [
  {
    id: '1',
    fullName: 'Anna Kowalska',
    role: 'Przewodnicząca',
    systemRole: 'admin',
    isCurrentUser: true,
    avatarUrl: null,
    groups: [{ id: 'g1', name: 'Warszawa', icon: '🏔️' }],
    tags: [{ id: 't1', name: 'Zarząd' }],
  },
  {
    id: '2',
    fullName: 'Paweł Muchomor-Wojciechowski',
    role: 'Prezes zarządu',
    systemRole: null,
    isCurrentUser: false,
    avatarUrl: null,
    groups: [
      { id: 'g1', name: 'Warszawa', icon: '🏔️' },
      { id: 'g2', name: 'Zarząd', icon: '💎' },
    ],
    tags: [{ id: 't1', name: 'Zarząd' }, { id: 't2', name: 'Projekt asystent' }],
  },
  {
    id: '3',
    fullName: 'Iwona Makrela',
    role: 'Wiceprezes',
    systemRole: 'superadmin',
    isCurrentUser: false,
    avatarUrl: null,
    groups: [
      { id: 'g1', name: 'Warszawa', icon: '🏔️' },
      { id: 'g2', name: 'Zarząd', icon: '💎' },
    ],
    tags: [{ id: 't2', name: 'Projekt asystent' }],
  },
  {
    id: '4',
    fullName: 'Dorota Nowak',
    role: 'Wolontariuszka',
    systemRole: null,
    isCurrentUser: false,
    avatarUrl: null,
    groups: [
      { id: 'g1', name: 'Warszawa', icon: '🏔️' },
      { id: 'g2', name: 'Zarząd', icon: '💎' },
    ],
    tags: [],
  },
  {
    id: '5',
    fullName: 'Monika Nowakowska',
    role: 'Członek',
    systemRole: 'admin',
    isCurrentUser: false,
    avatarUrl: null,
    groups: [{ id: 'g1', name: 'Warszawa', icon: '🏔️' }],
    tags: [{ id: 't3', name: 'Wolontariat' }],
  },
];

export const MOCK_TOTAL_PAGES = 10;
```

---

## Remember about standards

- Use the standard colour palette — never add colours directly. Check `src/index.css` and [Tailwind docs](https://tailwindcss.com/docs/colors).
- Create unit tests with **Vitest** for 100% of the code created if feasible ([testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md)).
- Use **BDD / Given–When–Then** structure for all tests.
- `MembersTable` is a shared-domain component → **Storybook story is mandatory**. Cover at minimum:
  - Default state (multiple members, mixed roles and groups)
  - Context menu open on a row
  - Single member (edge case)
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md).

---

## Definition of Done

- [ ] Code follows folder structure (`docs/frontend/conventions/PROJECT_STRUCTURE.md`)
- [ ] Naming follows `docs/frontend/conventions/NAMING.md`
- [ ] Component layout follows `docs/frontend/conventions/COMPONENT_STRUCTURE.md`
- [ ] Route `/organisations/:id/members` registered in router config
- [ ] Page uses `OrganisationPanel` from UI-02-IT1 as the wrapping shell with `activeTab="members"`
- [ ] `MembersTable` renders all columns: Nazwa (Avatar + name + role + system badge), Grupa/Tag (Badge list), actions (⋯)
- [ ] `MemberContextMenu` has all 4 actions; "Usuń członka" is visually destructive (red)
- [ ] `(ja)` suffix rendered for the current user's row
- [ ] `Pagination` renders below the table and calls `onPageChange`
- [ ] Unit tests added, BDD style, coverage ≥95% on changed files
- [ ] Playwright happy-path e2e added (`e2e/organisations/members.spec.ts`, Gherkin)
- [ ] Biome lint clean (no disabled rules without justification)
- [ ] TypeScript clean (no `any`, no `@ts-ignore` without comment)
- [ ] Storybook story added for `MembersTable` (variants listed above)
- [ ] No API calls — UI only; all action callbacks log to console
- [ ] CI green: build, lint, test, e2e

---

## Resources

- [Figma design](https://www.figma.com/design/wtEn2r9S9s4rzq1teIXeE9/asystent-ngo?node-id=0-1&t=ZutmUh0Dly1Plmh2-1)
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Storybook docs](https://storybook.js.org/docs/writing-stories)
- [Tailwind docs](https://tailwindcss.com/docs/)
- [Vitest docs](https://vitest.dev/guide/)
- [React Router docs](https://reactrouter.com/en/main)
