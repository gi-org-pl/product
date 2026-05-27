## Story

As an organisation manager, I want to edit a member's position, system permissions, tags, and group assignments in a modal form so I can update their details without leaving the current view.

## Differences between design and final effect

- Please use Athena's components if possible.
- NGO Manager design isn't fully aligned with the Athena design. If an external component (like Button) is different than the one in the design, please keep it as it is in Athena. Do not adjust external components for the design.
- Colors may be different. Please use the closest one you can find until we adjust the NGO Manager design for our new color palette.
- **Do not implement API connection** — UI only. `onSave` logs the form values to console.

---

## Screens covered

1. **Modal open** — form pre-filled with the provided member data.
2. **Tag/Group search active** — user types in a `TagInput` field; a dropdown of matching options appears.
3. **Modal closed** — triggered by "Anuluj", the × button, or clicking the backdrop.

---

## Component properties

### Component: `EditMemberModal`

Location: `src/components/shared/EditMemberModal/`

> This is a **shared** component — it can be opened from the members list, a member profile page, an admin panel, or anywhere else that needs to edit member data. It has **no dependency on any other feature component**.

| Prop | Type | Required | Description |
|---|---|---|---|
| `isOpen` | `boolean` | ✅ | Controls modal visibility |
| `member` | `EditableMember \| null` | ✅ | Member to edit; `null` when modal is closed (renders nothing) |
| `availableTags` | `SelectableItem[]` | ✅ | All tags the user can pick from in the Tagi field |
| `availableGroups` | `SelectableItem[]` | ✅ | All groups the user can pick from in the Grupy field |
| `onSave` | `(data: EditMemberFormData) => void` | ✅ | Called with form values when "Zapisz" is clicked |
| `onClose` | `() => void` | ✅ | Called when "Anuluj", × button, or backdrop is clicked |

#### Types (defined in `EditMemberModal.types.ts`)

```ts
// EditMemberModal.types.ts

export type SystemPermission = 'none' | 'admin' | 'superadmin';

export interface SelectableItem {
  id: string;
  name: string;
}

/** Minimal member data the modal needs — agnostic of any feature's full Member type */
export interface EditableMember {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  role: string;
  systemPermission: SystemPermission;
  tags: SelectableItem[];
  groups: SelectableItem[];
}

export interface EditMemberFormData {
  role: string;
  systemPermission: SystemPermission;
  tagIds: string[];
  groupIds: string[];
}
```

---

### Modal anatomy

```
┌─────────────────────────────────────────────────┐
│  Edytuj dane użytkownika                    [×] │
├─────────────────────────────────────────────────┤
│  [Avatar]  Paweł Muchomor-Wojciechowski          │
│                                                 │
│  Stanowisko                                     │
│  ┌─────────────────────────────────────────┐   │
│  │ Prezes zarządu                          │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  Uprawnienia                                    │
│  ┌─────────────────────────────────────────┐   │
│  │ Administrator                        ▾  │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  Tagi 🏷️                                       │
│  ┌─────────────────────────────────────────┐   │
│  │ [Zarząd ×] [Projekt asystent ×]  |  🔍 │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  Grupy w organizacji 🏔️                        │
│  ┌─────────────────────────────────────────┐   │
│  │ [Warszawa ×] [Zarząd ×] [Projekt ×] 🔍 │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│                      [Anuluj]  [Zapisz]         │
└─────────────────────────────────────────────────┘
```

- **Header**: title `"Edytuj dane użytkownika"` + `×` close button (top right).
- **Member identity**: `Avatar` (photo or initials fallback) + `member.fullName` — read-only, not a form field.
- **Stanowisko**: Athena `Input`, pre-filled with `member.role`.
- **Uprawnienia**: Athena `Select`, single-select. Options:

  | Value | Label |
  |---|---|
  | `none` | Brak |
  | `admin` | Administrator |
  | `superadmin` | Superadmin |

- **Tagi** (with tag icon 🏷️ in label): `TagInput` sub-component, pre-filled with `member.tags`.
- **Grupy w organizacji** (with group icon 🏔️ in label): `TagInput` sub-component, pre-filled with `member.groups`.
- **Footer**: `Button` variant `secondary` "Anuluj" (calls `onClose`) + `Button` variant `primary` "Zapisz" (calls `onSave` with current form values).
- Clicking the backdrop calls `onClose`.

---

### Sub-component: `TagInput`

Location: `src/components/shared/EditMemberModal/TagInput/`

A controlled multi-select field rendered as a row of removable chips + an inline text input for searching available options.

| Prop | Type | Required | Description |
|---|---|---|---|
| `selected` | `SelectableItem[]` | ✅ | Currently selected items (shown as chips) |
| `options` | `SelectableItem[]` | ✅ | All available options to search/pick from |
| `onChange` | `(selected: SelectableItem[]) => void` | ✅ | Called when selection changes |
| `placeholder` | `string` | ❌ | Placeholder shown inside the input when empty |

Behaviour:
- Renders selected items as chips with a `×` button; clicking `×` removes the item.
- Clicking anywhere in the field focuses the text input.
- Typing filters `options` by name (case-insensitive substring match); matching results appear in a dropdown below.
- Clicking a dropdown option adds it to `selected` and clears the input.
- Already-selected options are hidden from the dropdown.
- Pressing `Escape` closes the dropdown without selecting.
- A search icon (🔍) is shown on the right edge of the field (decorative).

---

## Athena components to use

| Athena component | Where |
|---|---|
| `Modal` | Outer modal shell (overlay + dialog container) |
| `Avatar` | Member photo / initials in the modal header |
| `Input` | Stanowisko field |
| `Select` | Uprawnienia dropdown |
| `Button` | "Anuluj" (secondary) and "Zapisz" (primary) in the footer |

---

## How to init the component?

1. Create `EditMemberModal` at `src/components/shared/EditMemberModal/`.
2. Define all types in `EditMemberModal.types.ts` — no imports from other feature components needed.
3. Adjust the component structure to [the standard](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md).
4. Add unit tests and a Storybook story.

### Suggested file tree

```
src/components/shared/EditMemberModal/
├── EditMemberModal.tsx
├── EditMemberModal.test.tsx
├── EditMemberModal.types.ts
├── EditMemberModal.stories.tsx
└── TagInput/
    ├── TagInput.tsx
    └── TagInput.test.tsx
```

> Drop any file above that ends up being empty or unnecessary.

---

## Storybook mock data

```ts
// inside EditMemberModal.stories.tsx
const mockMember: EditableMember = {
  id: '1',
  fullName: 'Paweł Muchomor-Wojciechowski',
  avatarUrl: null,
  role: 'Prezes zarządu',
  systemPermission: 'admin',
  tags: [
    { id: 't1', name: 'Zarząd' },
    { id: 't2', name: 'Projekt asystent' },
  ],
  groups: [
    { id: 'g1', name: 'Warszawa' },
    { id: 'g2', name: 'Zarząd' },
    { id: 'g3', name: 'Projekt asystent' },
  ],
};

const availableTags: SelectableItem[] = [
  { id: 't1', name: 'Zarząd' },
  { id: 't2', name: 'Projekt asystent' },
  { id: 't3', name: 'Wolontariat' },
];

const availableGroups: SelectableItem[] = [
  { id: 'g1', name: 'Warszawa' },
  { id: 'g2', name: 'Zarząd' },
  { id: 'g3', name: 'Projekt asystent' },
  { id: 'g4', name: 'Gdańsk' },
];
```

---

## Remember about standards

- Use the standard colour palette — never add colours directly. Check `src/index.css` and [Tailwind docs](https://tailwindcss.com/docs/colors).
- Create unit tests with **Vitest** for 100% of the code created if feasible ([testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md)).
- Use **BDD / Given–When–Then** structure for all tests.
- This is a **shared** component → **Storybook story is mandatory**. Cover at minimum:
  - Modal open — member with tags and groups pre-filled
  - Modal open — member with no tags / no groups (empty TagInput state)
  - TagInput dropdown open (search active, results filtered)
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md).

---

## Definition of Done

- [ ] Code follows folder structure (`docs/frontend/conventions/PROJECT_STRUCTURE.md`)
- [ ] Naming follows `docs/frontend/conventions/NAMING.md`
- [ ] Component layout follows `docs/frontend/conventions/COMPONENT_STRUCTURE.md`
- [ ] Component lives in `src/components/shared/` — no imports from feature components
- [ ] All types defined in `EditMemberModal.types.ts` (no dependency on external feature types)
- [ ] Modal renders: Avatar + name header, Stanowisko Input, Uprawnienia Select, Tagi TagInput, Grupy TagInput, Anuluj/Zapisz buttons
- [ ] All form fields pre-filled from the `member` prop
- [ ] `TagInput` supports multi-select with chip removal and filtered dropdown search
- [ ] Uprawnienia Select has 3 options: Brak, Administrator, Superadmin
- [ ] "Zapisz" calls `onSave` with current form values; "Anuluj" / × / backdrop calls `onClose`
- [ ] Unit tests added, BDD style, coverage ≥95% on changed files
- [ ] Biome lint clean (no disabled rules without justification)
- [ ] TypeScript clean (no `any`, no `@ts-ignore` without comment)
- [ ] Storybook story added (all variants listed above)
- [ ] No API calls — `onSave` logs to console
- [ ] CI green: build, lint, test

---

## Resources

- [Figma design](https://www.figma.com/design/wtEn2r9S9s4rzq1teIXeE9/asystent-ngo?node-id=0-1&t=ZutmUh0Dly1Plmh2-1)
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Storybook docs](https://storybook.js.org/docs/writing-stories)
- [Tailwind docs](https://tailwindcss.com/docs/)
- [Vitest docs](https://vitest.dev/guide/)
