> **Depends on:** `OrganisationAnnouncementCreatePage` (IT2) — reuses `AnnouncementForm`; must be completed first

## Story

As an organisation manager, I want to edit an existing announcement inside the organisation panel so I can correct or update its content and audience.

## Differences between design and final effect

- Please use Athena's components if possible.
- NGO Manager design isn't fully aligned with the Athena design. If an external component (like Button) is different than the one in the design, please keep it as it is in Athena. Do not adjust external components for the design.
- Colors may be different. Please use the closest one you can find until we adjust the NGO Manager design for our new color palette.
- **Do not implement API connection** — UI only. `onUpdate` should just log the form values to the console.
- The edit view is visually identical to the create view — the only differences are the route, the pre-filled form values, and "Aktualizuj" instead of "Publikuj".

---

## Screens covered

Same visual states as `OrganisationAnnouncementCreatePage`, with pre-filled data:

1. **Default state** — form pre-filled with the mock announcement's content and audience; "Aktualizuj" button enabled (content is not empty).
2. **Audience picker open** — identical behaviour to the create view.

---

## Routing

- Register route `/organisations/:id/announcements/:announcementId/edit` in the router config (React Router 7, Framework Mode).
- The "Anuluj" button navigates back to `/organisations/:id/announcements`.
- The "Edytuj" option in `AnnouncementContextMenu` (on `AnnouncementCard`) should navigate to this route.

---

## Component properties

### Page: `OrganisationAnnouncementEditPage`

Route: `/organisations/:id/announcements/:announcementId/edit`

Reads `:announcementId` from the URL, finds the matching mock announcement, and passes it as initial values to `AnnouncementForm`.

```tsx
<OrganisationPanel
  name={mockOrganisation.name}
  avatarUrl={mockOrganisation.avatarUrl}
  membersCount={mockOrganisation.membersCount}
  activeTab="announcements"
  onTabChange={(tab) => navigate(`/organisations/${id}/${tab}`)}
>
  <AnnouncementForm
    initialValues={mockInitialValues}
    submitLabel="Aktualizuj"
    onCancel={() => navigate(`/organisations/${id}/announcements`)}
    onPublish={(values) => console.log('update:', values)}
    mockGroups={MOCK_GROUPS}
  />
</OrganisationPanel>
```

---

### Changes to `AnnouncementForm`

`AnnouncementForm` (created in `OrganisationAnnouncementCreatePage`) needs two new **optional** props:

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `initialValues` | `AnnouncementFormValues` | ❌ | `{ content: '', audience: { type: 'everyone' } }` | Pre-fills the form; used by the edit page |
| `submitLabel` | `string` | ❌ | `'Publikuj'` | Label for the submit button; pass `'Aktualizuj'` from the edit page |

> No other changes to `AnnouncementForm` are needed. The disabled-when-empty logic for the submit button still applies — if the manager clears the textarea, "Aktualizuj" becomes disabled too.

---

## How to init the component?

1. Create the page at `src/pages/OrganisationAnnouncementEditPage/OrganisationAnnouncementEditPage.tsx`.
2. Extend `AnnouncementForm` with the two new optional props (`initialValues`, `submitLabel`).
3. Register the route `/organisations/:id/announcements/:announcementId/edit` in the router config.
4. Update `AnnouncementContextMenu` — wire the "Edytuj" option to navigate to the edit route (pass `announcementId` from `AnnouncementCard`).
5. Adjust component structures to [the standard](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md).
6. Add unit tests; update Storybook stories for `AnnouncementForm` with the new props.

### Suggested file tree

```
src/
└── pages/
    └── OrganisationAnnouncementEditPage/
        ├── OrganisationAnnouncementEditPage.tsx
        ├── OrganisationAnnouncementEditPage.test.tsx
        └── OrganisationAnnouncementEditPage.constants.ts   # reuses MOCK_ORGANISATION, MOCK_GROUPS, MOCK_ANNOUNCEMENTS
```

> `AnnouncementForm` lives in its existing location — only modified, not moved.

---

## Mock data (for development only)

Reuse constants from `OrganisationAnnouncementsPage.constants.ts` (`MOCK_ORGANISATION`, `MOCK_ANNOUNCEMENTS`) and from `OrganisationAnnouncementCreatePage.constants.ts` (`MOCK_GROUPS`). Do not duplicate them.

```ts
// OrganisationAnnouncementEditPage.constants.ts
export { MOCK_ORGANISATION, MOCK_GROUPS } from '../OrganisationAnnouncementCreatePage/OrganisationAnnouncementCreatePage.constants';
export { MOCK_ANNOUNCEMENTS } from '../OrganisationAnnouncementsPage/OrganisationAnnouncementsPage.constants';
```

Derive `mockInitialValues` in the page component by finding the announcement matching `:announcementId` in `MOCK_ANNOUNCEMENTS`. If not found, redirect to `/organisations/:id/announcements`.

---

## Remember about standards

- Use the standard colors palette, never add colors directly (check https://tailwindcss.com/docs/colors and our color palette in the `src/index.css` file and in [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css))
- Create unit tests with **Vitest** for 100% of the code created if feasible ([testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md)).
- Use **BDD / Given–When–Then** structure for all tests.
- Update the `AnnouncementForm` Storybook story to include variants with `initialValues` and `submitLabel="Aktualizuj"`.
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md).

---

## Definition of Done

- [ ] Code follows folder structure (`docs/frontend/conventions/PROJECT_STRUCTURE.md`)
- [ ] Naming follows `docs/frontend/conventions/NAMING.md`
- [ ] Component layout follows `docs/frontend/conventions/COMPONENT_STRUCTURE.md`
- [ ] Route `/organisations/:id/announcements/:announcementId/edit` registered in router config
- [ ] "Edytuj" in `AnnouncementContextMenu` navigates to the edit route
- [ ] "Anuluj" navigates back to `/organisations/:id/announcements`
- [ ] Form is pre-filled with the matching mock announcement's data
- [ ] Submit button label is "Aktualizuj"; disabled when `content` is empty
- [ ] Unknown `:announcementId` redirects to `/organisations/:id/announcements`
- [ ] `AnnouncementForm` extended with `initialValues` and `submitLabel` props (both optional, backward-compatible)
- [ ] Unit tests added/updated, BDD style, coverage ≥95% on changed files
- [ ] Playwright happy-path e2e added (`e2e/organisations/announcement-edit.spec.ts`, Gherkin)
- [ ] Biome lint clean (no disabled rules without justification)
- [ ] TypeScript clean (no `any`, no `@ts-ignore` without comment)
- [ ] Storybook story for `AnnouncementForm` updated with edit variants
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
