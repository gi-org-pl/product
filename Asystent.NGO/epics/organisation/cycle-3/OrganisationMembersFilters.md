> **Depends on:** `OrganisationMembersPage` + `MembersTable`

## Story

As an organisation manager, I want to search for members by name and filter/sort the list by group or join date so I can quickly find the right person without scrolling through the entire list.

## Differences between design and final effect

- Please use Athena's components if possible.
- NGO Manager design isn't fully aligned with the Athena design. If an external component (like Button) is different than the one in the design, please keep it as it is in Athena. Do not adjust external components for the design.
- Colors may be different. Please use the closest one you can find until we adjust the NGO Manager design for our new color palette.
- **Do not implement API connection** — UI only. Callbacks log state to console.

---

## Screens covered

1. **Desktop — default state**: search input + group Select + sort button + "Dodaj" button laid out in a single row.
2. **Desktop — Group dropdown open**: Select shows a list of groups with checkboxes; multiple groups can be selected.
3. **Desktop — Sort dropdown open**: Sort button opens a small dropdown with 4 radio-style options.
4. **Mobile — collapsed**: a single "Filtry" button (with filter icon) replaces the full filter row.
5. **Mobile — filter panel open**: full-screen (or bottom-sheet) panel showing Sortowanie and Grupa as expandable sections.
6. **Mobile — Sortowanie expanded**: list of 4 sort options with the active one checked.
7. **Mobile — Grupa expanded**: list of group options with checkboxes; a "Zapisz" button confirms selection.

---

## Component properties

### Component: `MembersFilters`

Location: `src/components/organisations/MembersFilters/`

| Prop | Type | Required | Description |
|---|---|---|---|
| `searchValue` | `string` | ✅ | Controlled value of the search input |
| `onSearchChange` | `(value: string) => void` | ✅ | Called on every keystroke in the search input |
| `selectedGroups` | `string[]` | ✅ | Array of selected group IDs |
| `onGroupsChange` | `(groupIds: string[]) => void` | ✅ | Called when group selection changes |
| `sortOption` | `MemberSortOption` | ✅ | Currently active sort option |
| `onSortChange` | `(option: MemberSortOption) => void` | ✅ | Called when sort option changes |
| `groups` | `FilterGroup[]` | ✅ | List of available groups to filter by |
| `onAddMember` | `() => void` | ✅ | Called when "Dodaj" button is clicked |

#### Types

```ts
// MembersFilters.types.ts
export type MemberSortOption =
  | 'az'
  | 'za'
  | 'recently-added'
  | 'longest-present';

export interface FilterGroup {
  id: string;
  name: string;
}
```

#### Sort option label map (put in `MembersFilters.constants.ts`)

```ts
export const SORT_OPTION_LABELS: Record<MemberSortOption, string> = {
  az: 'Od A do Z',
  za: 'Od Z do A',
  'recently-added': 'Ostatnio dodani',
  'longest-present': 'Najdłużej obecni',
};
```

---

### Desktop layout anatomy

```
┌───────────────────────────────┐ ┌──────────────┐ ┌──────────────────────┐ ┌──────────────┐
│ 🔍  Imię i nazwisko           │ │ Grupa    ▾   │ │ Sortowanie: Od A do Z│ │  Dodaj  ＋   │
└───────────────────────────────┘ └──────────────┘ └──────────────────────┘ └──────────────┘
```

- **Search input** — full-width flexible; search icon on the left; placeholder `"Imię i nazwisko"`. Use the Athena `Input` component.
- **Grupa Select** — fixed-width Select; dropdown shows a list of `FilterGroup` items, each with a `Checkbox`. Multiple selections allowed. Use the Athena `Select` component. Selected groups show as a count in the trigger label or as a comma-separated list if space allows.
- **Sort button** — label is `"Sortowanie: <active label>"` (e.g. `"Sortowanie: Od A do Z"`) with a sort/arrow icon on the right. On click, opens a small dropdown with the 4 `MemberSortOption` items; the active one has a checkmark. This is a custom sub-component (`SortDropdown`) — use Athena `Select` or a custom button + popover pattern, whichever fits best.
- **"Dodaj" button** — Athena `Button` variant `primary`, with a `+` icon, calls `onAddMember`.

---

### Sub-component: `SortDropdown`

Location: `src/components/organisations/MembersFilters/SortDropdown/`

A button that shows the current sort label + icon. On click, opens a dropdown list of sort options (radio-style: only one selected at a time). Selecting an option calls `onSortChange` and closes the dropdown.

| Prop | Type | Required | Description |
|---|---|---|---|
| `value` | `MemberSortOption` | ✅ | Currently selected option |
| `onChange` | `(option: MemberSortOption) => void` | ✅ | Called when an option is selected |

---

### Mobile layout

On mobile (below `md` breakpoint):

- The full filter row is replaced by a single **"Filtry"** button with a filter/sliders icon.
- Clicking "Filtry" opens a full-screen filter panel (`MobileFilterPanel` sub-component).
- The panel has a back arrow (`←`) to close it.
- Inside the panel there are two expandable rows:
  - **Sortowanie** — shows the current active label; expands to show the 4 sort options as a radio list with "Zapisz" button to confirm.
  - **Grupa** — expands to show group checkboxes with "Zapisz" button to confirm.
- The search input remains always visible above the "Filtry" button on mobile.

#### `MobileFilterPanel` sub-component

Location: `src/components/organisations/MembersFilters/MobileFilterPanel/`

| Prop | Type | Required | Description |
|---|---|---|---|
| `isOpen` | `boolean` | ✅ | Controls panel visibility |
| `onClose` | `() => void` | ✅ | Called when the back arrow is clicked |
| `sortOption` | `MemberSortOption` | ✅ | Currently active sort option |
| `onSortChange` | `(option: MemberSortOption) => void` | ✅ | Called when sort option changes |
| `selectedGroups` | `string[]` | ✅ | Array of selected group IDs |
| `onGroupsChange` | `(groupIds: string[]) => void` | ✅ | Called when group selection is saved |
| `groups` | `FilterGroup[]` | ✅ | Available groups to filter by |

Athena `Checkbox` component is used for group items inside the panel.

---

## Athena components to use

| Athena component | Where |
|---|---|
| `Input` | Search field ("Imię i nazwisko") |
| `Select` | Group filter dropdown on desktop |
| `Checkbox` | Group items inside the Group dropdown and mobile filter panel |
| `Button` | "Dodaj" CTA (primary); "Filtry" mobile trigger; "Zapisz" inside mobile panel sections |

---

## Integration with `OrganisationMembersPage`

Replace the `<MembersFilters />` placeholder added in UI-03-IT4 with the real component:

```tsx
const [search, setSearch] = useState('');
const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
const [sortOption, setSortOption] = useState<MemberSortOption>('az');

<MembersFilters
  searchValue={search}
  onSearchChange={setSearch}
  selectedGroups={selectedGroups}
  onGroupsChange={setSelectedGroups}
  sortOption={sortOption}
  onSortChange={setSortOption}
  groups={MOCK_FILTER_GROUPS}
  onAddMember={() => console.log('add member')}
/>
```

The filtered/sorted members list is derived from `MOCK_MEMBERS` using the filter state — no API call, just local array filtering for UI demonstration.

### Mock filter groups (add to `OrganisationMembersPage.constants.ts`)

```ts
export const MOCK_FILTER_GROUPS: FilterGroup[] = [
  { id: 'projekt-asystent-ngo', name: 'Projekt "Asystent NGO"' },
  { id: 'warszawa', name: 'Warszawa' },
  { id: 'gdansk', name: 'Gdańsk' },
  { id: 'krakow', name: 'Kraków' },
];
```

---

## How to init the component?

1. Create `MembersFilters` at `src/components/organisations/MembersFilters/`.
2. Adjust the component structure to [the standard](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md).
3. Wire it into `OrganisationMembersPage` (replace the placeholder).
4. Add unit tests and a Storybook story.

### Suggested file tree

```
src/components/organisations/MembersFilters/
├── MembersFilters.tsx
├── MembersFilters.test.tsx
├── MembersFilters.types.ts
├── MembersFilters.constants.ts
├── MembersFilters.stories.tsx
├── SortDropdown/
│   ├── SortDropdown.tsx
│   └── SortDropdown.test.tsx
└── MobileFilterPanel/
    ├── MobileFilterPanel.tsx
    └── MobileFilterPanel.test.tsx
```

> Drop any file above that ends up being empty or unnecessary.

---

## Remember about standards

- Use the standard colour palette — never add colours directly. Check `src/index.css` and [Tailwind docs](https://tailwindcss.com/docs/colors).
- Create unit tests with **Vitest** for 100% of the code created if feasible ([testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md)).
- Use **BDD / Given–When–Then** structure for all tests.
- `MembersFilters` is used by the members page → **Storybook story is mandatory**. Cover at minimum:
  - Default state (no filters active)
  - Group dropdown open with some groups selected
  - Sort dropdown open
  - Mobile: "Filtry" button visible; panel open
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md).

---

## Definition of Done

- [ ] Code follows folder structure (`docs/frontend/conventions/PROJECT_STRUCTURE.md`)
- [ ] Naming follows `docs/frontend/conventions/NAMING.md`
- [ ] Component layout follows `docs/frontend/conventions/COMPONENT_STRUCTURE.md`
- [ ] Search input uses Athena `Input` component, calls `onSearchChange` on every keystroke
- [ ] Group filter uses Athena `Select` + `Checkbox`; multiple selection supported
- [ ] Sort dropdown shows current sort label and 4 options; selecting one calls `onSortChange`
- [ ] "Dodaj" button uses Athena `Button` (primary variant) and calls `onAddMember`
- [ ] Mobile breakpoint (`< md`): full filter row hidden, "Filtry" button shown
- [ ] Mobile filter panel opens/closes correctly; Sortowanie and Grupa sections are expandable
- [ ] "Zapisz" button in mobile panel sections applies the selection
- [ ] `MembersFilters` wired into `OrganisationMembersPage`; local filtering of `MOCK_MEMBERS` works
- [ ] Unit tests added, BDD style, coverage ≥95% on changed files
- [ ] Biome lint clean (no disabled rules without justification)
- [ ] TypeScript clean (no `any`, no `@ts-ignore` without comment)
- [ ] Storybook story added for `MembersFilters` (variants listed above)
- [ ] No API calls — UI only
- [ ] CI green: build, lint, test

---

## Resources

- [Figma design](https://www.figma.com/design/wtEn2r9S9s4rzq1teIXeE9/asystent-ngo?node-id=0-1&t=ZutmUh0Dly1Plmh2-1)
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Storybook docs](https://storybook.js.org/docs/writing-stories)
- [Tailwind docs](https://tailwindcss.com/docs/)
- [Vitest docs](https://vitest.dev/guide/)
