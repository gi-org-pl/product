> **Depends on:** `OrganisationPanel` (must be completed first)

## Story

As an organisation member or manager, I want to see a list of announcements for my organisation inside the organisation panel so I can stay up to date with the latest news.

## Differences between design and final effect

- Please use Athena's components if possible.
- NGO Manager design isn't fully aligned with the Athena design. If an external component (like Button) is different than the one in the design, please keep it as it is in Athena. Do not adjust external components for the design.
- Colors may be different. Please use the closest one you can find until we adjust the NGO Manager design for our new color palette.
- **Do not implement API connection** — UI only. Use static mock data.

---

## Screens covered

One state visible in the design:

1. **Filled state** — organisation has announcements; paginated list is visible.

---

## Routing

- Register route `/organisations/:id/announcements` in the router config (React Router 7, Framework Mode).
- Add a redirect: `/organisations/:id` → `/organisations/:id/announcements` (use React Router `<Navigate>` or a loader redirect).

---

## Component properties

### Page: `OrganisationAnnouncementsPage`

Route: `/organisations/:id/announcements`

The page wraps its content in `OrganisationPanel` (from UI-02-IT1) with `activeTab="announcements"` and renders the announcements tab content as `children`:

1. **Section header** — title "Najnowsze ogłoszenia" with a `Button` "Dodaj" (variant `primary`, with `+` icon) right-aligned.
2. **Announcement list** — vertical list of `AnnouncementCard` components.
3. **Pagination** — below the list, using the `Pagination` component.

#### Usage of `OrganisationPanel`

```tsx
<OrganisationPanel
  name={mockOrganisation.name}
  avatarUrl={mockOrganisation.avatarUrl}
  membersCount={mockOrganisation.membersCount}
  activeTab="announcements"
  onTabChange={(tab) => console.log('tab changed:', tab)}
  tabCounts={{ announcements: mockAnnouncements.length }}
>
  {/* announcements content here */}
</OrganisationPanel>
```

---

### Component: `AnnouncementCard`

Location: `src/components/organisations/AnnouncementCard/`

| Prop | Type | Required | Description |
|---|---|---|---|
| `organisationName` | `string` | ✅ | Displayed in the card header |
| `organisationAvatarUrl` | `string \| null` | ✅ | Passed to `Avatar`; `null` renders initials fallback |
| `date` | `string` | ✅ | Human-readable date string, e.g. `"24 sierpnia, 14:33"` |
| `title` | `string` | ✅ | Bold announcement heading |
| `content` | `string` | ✅ | Body text of the announcement |
| `onEdit` | `() => void` | ❌ | Called when "Edytuj" is clicked in the context menu |
| `onDelete` | `() => void` | ❌ | Called when "Usuń" is clicked in the context menu |

#### AnnouncementCard anatomy

```
┌────────────────────────────────────────────────────────────┐
│ [Avatar]  Generacja Innowacja     24 sierpnia, 14:33  [⋯] │
│                                                            │
│  Uwaga! Zmiana daty spotkania                              │
│                                                            │
│  Uprzejmie informujemy, że z przyczyn organizacyjnych...   │
└────────────────────────────────────────────────────────────┘
```

- The three-dot button (`⋯`) opens a small context dropdown with two actions:
  - **Edytuj** (with edit/pencil icon) — calls `onEdit`
  - **Usuń** (with trash icon) — calls `onDelete`
- The dropdown is a sub-component: `AnnouncementContextMenu`.
- The card has a visible border and a subtle hover/focus state.

---

## Athena components to use

| Athena component | Where |
|---|---|
| `OrganisationPanel` *(UI-02-IT1)* | Page shell — org header + tabs |
| `Avatar` | Organisation logo inside each `AnnouncementCard` |
| `Button` | "Dodaj" CTA in the section header |
| `Pagination` | Below the announcements list |

---

## How to init the component?

1. Create the page component at `src/pages/OrganisationAnnouncementsPage/OrganisationAnnouncementsPage.tsx`.
2. Create the `AnnouncementCard` component at `src/components/organisations/AnnouncementCard/`.
3. Register the route `/organisations/:id/announcements` and the redirect from `/organisations/:id` in the router config.
4. Adjust all component structures to [the standard](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md).
5. Add unit tests and Storybook stories.

### Suggested file tree

```
src/
├── pages/
│   └── OrganisationAnnouncementsPage/
│       ├── OrganisationAnnouncementsPage.tsx
│       ├── OrganisationAnnouncementsPage.test.tsx
│       └── OrganisationAnnouncementsPage.constants.ts   # mock data
└── components/
    └── organisations/
        └── AnnouncementCard/
            ├── AnnouncementCard.tsx
            ├── AnnouncementCard.test.tsx
            ├── AnnouncementCard.types.ts
            ├── AnnouncementCard.stories.tsx
            └── AnnouncementContextMenu/
                ├── AnnouncementContextMenu.tsx
                └── AnnouncementContextMenu.test.tsx
```

> Drop any file above that ends up being empty or unnecessary.

---

## Mock data (for development only)

```ts
// OrganisationAnnouncementsPage.constants.ts — static mock, no API call
export const MOCK_ORGANISATION = {
  id: '1',
  name: 'Generacja Innowacja',
  avatarUrl: null,
  membersCount: 80,
};

export const MOCK_ANNOUNCEMENTS = [
  {
    id: '1',
    title: 'Uwaga! Zmiana daty spotkania',
    content:
      'Uprzejmie informujemy, że z przyczyn organizacyjnych najbliższe spotkanie Fundacji (30.08.2025) odbędzie się w innej lokalizacji niż pierwotnie planowano. Wyjątkowo spotkanie odbędzie się w Barze Studio na placu Defilad. Proszę o potwierdzenie przybycia do godziny 18.00',
    date: '24 sierpnia, 14:33',
  },
  {
    id: '2',
    title: 'Uwaga! Zmiana daty spotkania',
    content:
      'Uprzejmie informujemy, że z przyczyn organizacyjnych najbliższe spotkanie Fundacji (30.08.2025) odbędzie się w innej lokalizacji niż pierwotnie planowano. Wyjątkowo spotkanie odbędzie się w Barze Studio na placu Defilad. Proszę o potwierdzenie przybycia do godziny 18.00',
    date: '24 sierpnia, 14:33',
  },
  {
    id: '3',
    title: 'Uwaga! Zmiana daty spotkania',
    content:
      'Uprzejmie informujemy, że z przyczyn organizacyjnych najbliższe spotkanie Fundacji (30.08.2025) odbędzie się w innej lokalizacji niż pierwotnie planowano. Wyjątkowo spotkanie odbędzie się w Barze Studio na placu Defilad. Proszę o potwierdzenie przybycia do godziny 18.00',
    date: '24 sierpnia, 14:33',
  },
];

export const MOCK_TOTAL_PAGES = 10;
```

---

## Remember about standards

- Use the standard colors palette, never add colors directly (check https://tailwindcss.com/docs/colors and our color palette in the `src/index.css` file and in [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css))
- Create unit tests with **Vitest** for 100% of the code created if feasible ([testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md)).
- Use **BDD / Given–When–Then** structure for all tests.
- Create a **Storybook story** for `AnnouncementCard` covering variants: default state, context menu open.
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md).

---

## Definition of Done

- [ ] Code follows folder structure (`docs/frontend/conventions/PROJECT_STRUCTURE.md`)
- [ ] Naming follows `docs/frontend/conventions/NAMING.md`
- [ ] Component layout follows `docs/frontend/conventions/COMPONENT_STRUCTURE.md`
- [ ] Route `/organisations/:id/announcements` registered in router config
- [ ] Redirect `/organisations/:id` → `/organisations/:id/announcements` implemented
- [ ] Page uses `OrganisationPanel` from UI-02-IT1 as the wrapping shell
- [ ] Unit tests added, BDD style, coverage ≥95% on changed files
- [ ] Playwright happy-path e2e added (`e2e/organisations/announcements.spec.ts`, Gherkin)
- [ ] Biome lint clean (no disabled rules without justification)
- [ ] TypeScript clean (no `any`, no `@ts-ignore` without comment)
- [ ] Storybook story added for `AnnouncementCard`
- [ ] No API calls — UI only; `onEdit`/`onDelete` log to console
- [ ] CI green: build, lint, test, e2e

---

## Resources

- [Figma design](https://www.figma.com/design/wtEn2r9S9s4rzq1teIXeE9/asystent-ngo?node-id=0-1&t=ZutmUh0Dly1Plmh2-1)
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Storybook docs](https://storybook.js.org/docs/writing-stories)
- [Tailwind docs](https://tailwindcss.com/docs/)
- [Vitest docs](https://vitest.dev/guide/)
- [React Router docs](https://reactrouter.com/en/main)
