> **Related task:** [`AddMemberModal`](./AddMemberModal.md) — same flow, but this task is **fully self-contained**. You don't need to read or import anything from the other task. Build this in isolation; the parent (a page) glues both modals together later.

## Story

As an organisation manager, after I submit the "Dodaj nowego użytkownika" form, I want to see a confirmation modal telling me whether the person was added straight to the organisation (existing account) or an invitation was sent to them (new email) — and let me jump straight into inviting the next person.

## Differences between design and final effect

- Please use Athena's components if possible.
- NGO Manager design isn't fully aligned with the Athena design. If an external component (like `Button`) looks different than the one in Athena, keep the Athena version. Do not adjust Athena components for the design.
- Colours may differ. Use the closest match from our palette until the design catches up.
- **Do not implement API connection** — UI only. Both buttons fire callbacks; the parent decides what happens next.

---

## Screens covered

Two render variants of the same component, driven by the `mode` prop:

1. **`mode: 'added'`** — message `"Użytkownik {fullName} został dodany do organizacji"` (existing account was matched and added).
2. **`mode: 'invited'`** — message `"Zaproszenie do {fullName} zostało wysłane!"` (invitation email was dispatched to a brand-new address).

Both variants share the same layout: × close button (top right), message body, single primary action button `"Zaproś kolejną osobę"`.

---

## Component properties

### Component: `AddMemberSuccessModal`

Location: `src/components/shared/AddMemberSuccessModal/`

> Shared component. **Self-contained** — defines its own props and types. The parent (e.g. members page) controls the flow: close the form modal → open this one with the right `mode` and `fullName`.

| Prop | Type | Required | Description |
|---|---|---|---|
| `isOpen` | `boolean` | ✅ | Controls modal visibility |
| `mode` | `'added' \| 'invited' \| null` | ✅ | `'added'` → existing user joined the org; `'invited'` → invitation email sent; `null` → modal renders nothing |
| `fullName` | `string` | ✅ | Name to interpolate into the message (e.g. `"Anna Kowalska"`) |
| `onInviteAnother` | `() => void` | ✅ | Called when "Zaproś kolejną osobę" is clicked |
| `onClose` | `() => void` | ✅ | Called when × button or backdrop is clicked |

#### Types (defined in `AddMemberSuccessModal.types.ts`)

```ts
// AddMemberSuccessModal.types.ts

export type AddMemberSuccessMode = 'added' | 'invited';

export interface AddMemberSuccessModalProps {
  isOpen: boolean;
  mode: AddMemberSuccessMode | null;
  fullName: string;
  onInviteAnother: () => void;
  onClose: () => void;
}
```

> **Why a simple `mode` string instead of importing a shared type?** Each task in this cycle is self-contained — don't import from sibling components. The parent page is the one place that knows about both modals and will translate the form submission into this prop.

---

### Modal anatomy

```
┌─────────────────────────────────────────────────┐
│                                            [×]  │
│                                                 │
│   Użytkownik Anna Kowalska został dodany        │
│   do organizacji                                │
│                                                 │
│                       [Zaproś kolejną osobę]    │
└─────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────┐
│                                            [×]  │
│                                                 │
│   Zaproszenie do Anna Kowalska zostało          │
│   wysłane!                                      │
│                                                 │
│                       [Zaproś kolejną osobę]    │
└─────────────────────────────────────────────────┘
```

- **Header**: only the × close button (top right). No title text.
- **Message body**: centred text, derived from `mode`:
  - `mode === 'added'` → `Użytkownik {fullName} został dodany do organizacji`
  - `mode === 'invited'` → `Zaproszenie do {fullName} zostało wysłane!`
- **Footer**: single Athena `Button` variant `primary` — `"Zaproś kolejną osobę"`, calls `onInviteAnother`.
- × button and backdrop both call `onClose`.
- When `isOpen` is `false` OR `mode` is `null`, render nothing.

#### Behaviour (Given–When–Then)

```
Given isOpen is true and mode is 'added'
When the modal renders
Then the body reads "Użytkownik {fullName} został dodany do organizacji"

Given isOpen is true and mode is 'invited'
When the modal renders
Then the body reads "Zaproszenie do {fullName} zostało wysłane!"

Given the modal is open
When the user clicks "Zaproś kolejną osobę"
Then onInviteAnother is called

Given the modal is open
When the user clicks × or the backdrop
Then onClose is called

Given isOpen is false OR mode is null
When the component renders
Then nothing is rendered
```

---

## Hints for implementation

This task is small and mostly **rendering logic** — no state machine, no side effects. Things to keep in mind:

- **Don't reach for `useState` here.** The component is **fully controlled** by props. `isOpen`, `mode`, `fullName` all come from the parent. There is no internal state.
- **Derive the message text** with a small helper or a `switch` on `mode`. Don't sprinkle conditional text in JSX — extract it into a named function or a constant map. Easier to test.
  ```ts
  // example skeleton — adapt to your style
  const buildMessage = (mode: AddMemberSuccessMode, fullName: string): string => {
    switch (mode) {
      case 'added':   return `Użytkownik ${fullName} został dodany do organizacji`;
      case 'invited': return `Zaproszenie do ${fullName} zostało wysłane!`;
    }
  };
  ```
- **Early-return `null`** when `!isOpen || mode === null`. Cleaner than wrapping the whole JSX in a conditional.
- **Athena `Modal`** already gives you the × close button, backdrop click handling, and the overlay. Don't reinvent any of that — just pass `onClose` to the props Athena exposes. Read Athena's `Modal` docs/Storybook before starting.
- **Don't worry about animations / transitions** — Athena handles them.
- **Common pitfall:** forgetting to clear `mode` to `null` when the modal closes will cause the modal to flash old text on next open. That's the **parent's** problem, not yours — but call it out in your PR description so the parent dev knows.

---

## Athena components to use

| Athena component | Where |
|---|---|
| `Modal` | Outer modal shell (overlay + dialog container + × close button) |
| `Button` | "Zaproś kolejną osobę" (primary) in the footer |

---

## How to init the component?

Step-by-step — do them in this order:

1. **Create the folder** `src/components/shared/AddMemberSuccessModal/`.
2. **Create `AddMemberSuccessModal.types.ts`** with the `AddMemberSuccessMode` type and the `AddMemberSuccessModalProps` interface from the Types section above. Copy them exactly.
3. **Create `AddMemberSuccessModal.tsx`** — a single React functional component:
   - Destructure all 5 props.
   - Early-return `null` when `!isOpen || mode === null`.
   - Render Athena `Modal` with `onClose` wired up.
   - Inside the modal: the message text (use the `buildMessage` helper from the Hints) + Athena `Button` with `onClick={onInviteAnother}`.
4. **Create `AddMemberSuccessModal.test.tsx`** — translate each Given/When/Then block from the Behaviour section above directly into a `describe`/`describe`/`it` block.
5. **Create `AddMemberSuccessModal.stories.tsx`** — three stories listed in the "Storybook mock data" section.
6. **Run locally:** `yarn lint`, `yarn test`, `yarn storybook` — check all variants render correctly.
7. **Open the PR.**

> Compliance with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md) is required.

### Suggested file tree

```
src/components/shared/AddMemberSuccessModal/
├── AddMemberSuccessModal.tsx
├── AddMemberSuccessModal.test.tsx
├── AddMemberSuccessModal.types.ts
└── AddMemberSuccessModal.stories.tsx
```

---

## Storybook mock data

Stories to include (no external imports — everything inline):

- **Closed** — `isOpen: false`, `mode: null`, `fullName: ''` → renders nothing.
- **Added (existing user joined)** — `isOpen: true`, `mode: 'added'`, `fullName: 'Anna Kowalska'` → renders `"Użytkownik Anna Kowalska został dodany do organizacji"`.
- **Invited (new invitation sent)** — `isOpen: true`, `mode: 'invited'`, `fullName: 'Anna Kowalska'` → renders `"Zaproszenie do Anna Kowalska zostało wysłane!"`.

In all stories, wire `onInviteAnother` and `onClose` to `console.log` (or `action()` if you use Storybook's actions addon).

---

## Remember about standards

- Use the standard colors palette, never add colors directly (check https://tailwindcss.com/docs/colors and our color palette in the `src/index.css` file and in [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css))
- Create unit tests with **Vitest** for ≥95% of the code created ([testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md)).
- Use **BDD / Given–When–Then** structure for all tests.
- This is a **shared** component → **Storybook story is mandatory**. Cover all variants listed above.
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md).

---

## Definition of Done

- [ ] Code follows folder structure (`docs/frontend/conventions/PROJECT_STRUCTURE.md`)
- [ ] Naming follows `docs/frontend/conventions/NAMING.md`
- [ ] Component layout follows `docs/frontend/conventions/COMPONENT_STRUCTURE.md`
- [ ] Component lives in `src/components/shared/` — no imports from any other shared/feature component
- [ ] Types defined locally in `AddMemberSuccessModal.types.ts` — self-contained, nothing imported from siblings
- [ ] Modal renders × close button, message body, primary "Zaproś kolejną osobę" button
- [ ] Message text correctly switches between the `'added'` and `'invited'` copy based on `mode`
- [ ] "Zaproś kolejną osobę" calls `onInviteAnother`; × and backdrop call `onClose`
- [ ] Renders nothing when `isOpen` is false OR `mode` is null
- [ ] Unit tests added, BDD style, coverage ≥95% on changed files
- [ ] Biome lint clean (no disabled rules without justification)
- [ ] TypeScript clean (no `any`, no `@ts-ignore` without comment)
- [ ] Storybook story added (all variants listed above)
- [ ] No API calls — both callbacks log to console in the story
- [ ] CI green: build, lint, test

---

## Resources

- [Figma design](https://www.figma.com/design/wtEn2r9S9s4rzq1teIXeE9/asystent-ngo?node-id=0-1&t=ZutmUh0Dly1Plmh2-1)
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Storybook docs](https://storybook.js.org/docs/writing-stories)
- [Tailwind docs](https://tailwindcss.com/docs/)
- [Vitest docs](https://vitest.dev/guide/)
