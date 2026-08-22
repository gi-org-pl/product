## Story

As a developer, I want a reusable `OrganisationPanel` component that renders the organisation header (logo, name, member count) and the tab navigation so that every organisation sub-page (Ogłoszenia, Członkowie, Grupy, etc.) shares the same consistent shell without duplicating markup.

## Differences between design and final effect

- Please use Athena's components if possible.
- NGO Manager design isn't fully aligned with the Athena design. If an external component (like Button) is different than the one in the design, please keep it as it is in Athena. Do not adjust external components for the design.
- Colors may be different. Please use the closest one you can find until we adjust the NGO Manager design for our new color palette.
- **Do not implement API connection** — UI only.

---

## Component properties

### `OrganisationPanel`

Location: `src/components/organisations/OrganisationPanel/`

This component is the **shared layout shell** used by all organisation sub-pages. It renders everything *above and around* the tab content: the org header and the tab bar. Tab content is passed as `children`.

| Prop | Type | Required | Description |
|---|---|---|---|
| `name` | `string` | ✅ | Organisation name displayed in the header |
| `avatarUrl` | `string \| null` | ✅ | Org logo URL; `null` renders an initials fallback via `Avatar` |
| `membersCount` | `number` | ✅ | Displayed below the org name, e.g. `"80 członków"` |
| `activeTab` | `OrganisationTab` | ✅ | Currently active tab (controls `Tabs` highlight) |
| `onTabChange` | `(tab: OrganisationTab) => void` | ✅ | Called when user clicks a different tab |
| `tabCounts` | `Partial<Record<OrganisationTab, number>>` | ❌ | Optional count badge per tab; if provided, the value is shown in a `Badge` next to the tab label |
| `children` | `React.ReactNode` | ✅ | Content rendered below the tab bar (the active tab's page) |

#### `OrganisationTab` type

```ts
// OrganisationPanel.types.ts
export type OrganisationTab =
  | 'announcements'
  | 'members'
  | 'groups'
  | 'contributions'
  | 'organisation-data'
  | 'documents';
```

#### Tab label map (put in `OrganisationPanel.constants.ts`)

```ts
export const TAB_LABELS: Record<OrganisationTab, string> = {
  announcements: 'Ogłoszenia',
  members: 'Członkowie',
  groups: 'Grupy',
  contributions: 'Składki',
  'organisation-data': 'Dane organizacji',
  documents: 'Dokumenty',
};

export const ORGANISATION_TABS: OrganisationTab[] = [
  'announcements',
  'members',
  'groups',
  'contributions',
  'organisation-data',
  'documents',
];
```

#### Visual anatomy

```
┌────────────────────────────────────────────────────────────────┐
│  [Avatar]  Generacja Innowacja                                 │
│            80 członków                                         │
├────────────────────────────────────────────────────────────────┤
│  [Ogłoszenia 1]  Członkowie (0)  Grupy  Składki  Dane org.  Dokumenty  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│   {children}                                                   │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

- The active tab is highlighted via the `Tabs` component.
- If `tabCounts[tab]` is defined, render a `Badge` with that count next to the tab label.
- The component does **not** handle routing — the parent page is responsible for reading `:id` from the URL and mapping tab clicks to navigation.

---

## Athena components to use

| Athena component | Where |
|---|---|
| `Avatar` | Organisation logo in the panel header |
| `Tabs` | Tab navigation bar |
| `Badge` | Count badge next to tab labels (when `tabCounts` provides a value) |

---

## How to init the component?

1. Create the component at `src/components/organisations/OrganisationPanel/`.
2. This is a **shared** component (will be used by ≥2 pages) — add a Storybook story.
3. Adjust the component structure to [the standard](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md).
4. Add unit tests.

### Suggested file tree

```
src/components/organisations/OrganisationPanel/
├── OrganisationPanel.tsx
├── OrganisationPanel.test.tsx
├── OrganisationPanel.types.ts       # OrganisationTab type
├── OrganisationPanel.constants.ts   # TAB_LABELS, ORGANISATION_TABS
└── OrganisationPanel.stories.tsx
```

> Drop any file above that ends up being empty or unnecessary.

---

## Remember about standards

- Use the standard colors palette, never add colors directly (check https://tailwindcss.com/docs/colors and our color palette in the `src/index.css` file and in [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css))
- Create unit tests with **Vitest** for 100% of the code created if feasible ([testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md)).
- Use **BDD / Given–When–Then** structure for all tests.
- This is a shared component → **Storybook story is mandatory**. Cover at minimum:
  - Default state (announcements tab active, with badge count)
  - Different active tab (e.g. members)
  - No badge counts provided
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md).

---

## Definition of Done

- [ ] Code follows folder structure (`docs/frontend/conventions/PROJECT_STRUCTURE.md`)
- [ ] Naming follows `docs/frontend/conventions/NAMING.md`
- [ ] Component layout follows `docs/frontend/conventions/COMPONENT_STRUCTURE.md`
- [ ] `OrganisationTab` union type exported from `OrganisationPanel.types.ts`
- [ ] `TAB_LABELS` and `ORGANISATION_TABS` constants exported from `OrganisationPanel.constants.ts`
- [ ] Unit tests added, BDD style, coverage ≥95% on changed files
- [ ] Biome lint clean (no disabled rules without justification)
- [ ] TypeScript clean (no `any`, no `@ts-ignore` without comment)
- [ ] Storybook story added (all variants listed above)
- [ ] CI green: build, lint, test

---

## Resources

- [Figma design](https://www.figma.com/design/wtEn2r9S9s4rzq1teIXeE9/asystent-ngo?node-id=0-1&t=ZutmUh0Dly1Plmh2-1)
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Storybook docs](https://storybook.js.org/docs/writing-stories)
- [Tailwind docs](https://tailwindcss.com/docs/)
- [Vitest docs](https://vitest.dev/guide/)
