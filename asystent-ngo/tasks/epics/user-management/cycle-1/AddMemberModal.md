## Story

As an organisation manager, I want to invite a new person to the organisation by entering their email — with autocomplete suggesting users that already have an Asystent.NGO account — so I can either pull in an existing account or invite a brand-new one without leaving the current view.

## Differences between design and final effect

- Please use Athena's components if possible.
- NGO Manager design isn't fully aligned with the Athena design. If an external component (like `Button` or `Input`) looks different than the one in Athena, keep the Athena version. Do not adjust Athena components for the design.
- Colours may differ. Use the closest match from our palette until the design catches up.
- **Do not implement API connection** — UI only. `onSubmit` logs the form values to console; `availableUsers` is passed in as a prop (mocked in Storybook).
- The email autocomplete dropdown design from the screen (custom radio-style list with avatars) is built as a sub-component on top of Athena `Input` — it is **not** Athena's `Select`, because we need free-text input + filtered suggestions, not a closed dropdown.

---

## Screens covered

1. **Modal open — empty state** — only the email field is visible, "Wyślij zaproszenie" button is hidden (or disabled).
2. **Email field focused, partial query** — autocomplete dropdown appears below the field with matching existing users (avatar + email, single-select radio on the right).
3. **Existing user selected** — autocomplete closes, email is filled with the selected user's email, the "Imię i nazwisko" field appears pre-filled and **read-only**, "Wyślij zaproszenie" becomes active.
4. **No match — manual entry** — user types an email that doesn't match anyone; once it looks like a valid email, the "Imię i nazwisko" field appears as an **editable** input for the manager to fill in manually. "Wyślij zaproszenie" becomes active once both fields are non-empty.
5. **Modal closed** — triggered by the × button or clicking the backdrop. `onClose` is called.

---

## Component properties

### Component: `AddMemberModal`

Location: `src/components/shared/AddMemberModal/`

> This is a **shared** component — it can be opened from the members list, an empty-state CTA, the admin panel, or anywhere else. It has **no dependency on any other feature component** and no API access; the parent provides the candidate list and handles the submit callback.

| Prop | Type | Required | Description |
|---|---|---|---|
| `isOpen` | `boolean` | ✅ | Controls modal visibility |
| `availableUsers` | `ExistingUserSuggestion[]` | ✅ | All existing accounts the manager can pick from in the autocomplete dropdown |
| `onSubmit` | `(data: AddMemberFormData) => void` | ✅ | Called with form values when "Wyślij zaproszenie" is clicked |
| `onClose` | `() => void` | ✅ | Called when × button or backdrop is clicked |

#### Types (defined in `AddMemberModal.types.ts`)

```ts
// AddMemberModal.types.ts

export interface ExistingUserSuggestion {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
}

export type AddMemberFormData =
  | {
      /** Existing account picked from the autocomplete dropdown */
      kind: 'existing';
      userId: string;
      email: string;
      fullName: string;
    }
  | {
      /** Brand-new invite — no matching account found */
      kind: 'new';
      email: string;
      fullName: string;
    };
```

> The discriminated union lets the parent distinguish "existing account added" vs "brand-new invite" without ambiguity. The parent page (built later) translates this payload into props for the follow-up [`AddMemberSuccessModal`](./AddMemberSuccessModal.md) — but **you don't need to look at that task to build this one**. Both modals are independent.

---

### Modal anatomy

```
┌─────────────────────────────────────────────────┐
│  Dodaj nowego użytkownika                   [×] │
├─────────────────────────────────────────────────┤
│  Osoba, którą zapraszasz dostanie wiadomość     │
│  z linkiem do rejestracji lub zostanie          │
│  automatycznie dodana, jeśli posiada już konto. │
│                                                 │
│  E-mail nowego członka                          │
│  ┌─────────────────────────────────────────┐   │
│  │ anna.kowal|                             │   │
│  └─────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────┐   │
│  │ 🖼  anna.kowalska@gmail.com         ◉  │   │ ← autocomplete
│  │ 🖼  anna.kowal@wp.pl                ○  │   │   dropdown
│  │ 🖼  anna.kowalska-kret@buziaczek.pl ○  │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  Imię i nazwisko                                │ ← appears only after
│  ┌─────────────────────────────────────────┐   │   email is selected /
│  │ Anna Kowalska                           │   │   typed as new
│  └─────────────────────────────────────────┘   │
│                                                 │
│                          [Wyślij zaproszenie]   │
└─────────────────────────────────────────────────┘
```

- **Header**: title `"Dodaj nowego użytkownika"` + `×` close button (top right).
- **Helper text**: `"Osoba, którą zapraszasz dostanie wiadomość z linkiem do rejestracji lub zostanie automatycznie dodana, jeśli posiada już konto."` — static description below the header.
- **E-mail nowego członka**: Athena `Input` (type `email`) with the `EmailAutocomplete` dropdown rendered below.
- **Imię i nazwisko**: Athena `Input`, **conditionally rendered**:
  - Hidden in the empty state.
  - Shown **pre-filled and read-only** when an existing user is selected from the dropdown.
  - Shown **empty and editable** when the typed email matches no one and looks like a valid email.
- **Footer**: single Athena `Button` variant `primary` — `"Wyślij zaproszenie"`. Disabled until both fields are valid.
  - In the empty state the button is hidden (per screen 1). Either hide or disable — dev's call, but keep the behaviour consistent with the screens.
- Clicking the × button or the backdrop calls `onClose`. **The form is reset on close** so a re-open starts clean.

#### Email-to-state logic (Given–When–Then)

```
Given the modal is open and the email input is empty
When the user has not typed anything
Then the "Imię i nazwisko" field is hidden and the submit button is hidden/disabled

Given the user types into the email input
When the input is a non-empty substring (length ≥ 2)
Then matching `availableUsers` (case-insensitive substring on `email` OR `fullName`) appear in the autocomplete dropdown

Given the autocomplete dropdown is open
When the user picks one option
Then the email is replaced with that user's email, the dropdown closes, the "Imię i nazwisko" field appears pre-filled and read-only, and the submit button becomes active

Given the autocomplete dropdown is open
When the user keeps typing past any match
Then the dropdown shows "no results" (or simply collapses) and — once the email matches a valid email regex — the "Imię i nazwisko" field appears empty and editable

Given a "new" flow is active (no existing user selected) and email is valid
When the user enters a non-empty name and clicks "Wyślij zaproszenie"
Then `onSubmit({ kind: 'new', email, fullName })` is called

Given an "existing" flow is active
When the user clicks "Wyślij zaproszenie"
Then `onSubmit({ kind: 'existing', userId, email, fullName })` is called
```

---

### Sub-component: `EmailAutocomplete`

Location: `src/components/shared/AddMemberModal/EmailAutocomplete/`

A controlled email field with a dropdown of matching existing users.

| Prop | Type | Required | Description |
|---|---|---|---|
| `value` | `string` | ✅ | Current email input value |
| `options` | `ExistingUserSuggestion[]` | ✅ | All candidate users to filter against |
| `onChange` | `(value: string) => void` | ✅ | Called on every keystroke |
| `onPick` | `(user: ExistingUserSuggestion) => void` | ✅ | Called when the user picks an option from the dropdown |
| `placeholder` | `string` | ❌ | Placeholder shown inside the input when empty |

Behaviour:
- Built on top of Athena `Input` for the text field.
- Filters `options` by case-insensitive substring match on `email` OR `fullName`.
- Dropdown opens when the input has focus AND `value.length >= 2` AND there is at least one match.
- Each dropdown row: Athena `Avatar` (photo or initials fallback) + email text + radio indicator on the right (`RadioGroup`-style visual, single-select).
- Clicking a row calls `onPick` with that user.
- Pressing `Escape` closes the dropdown without picking.
- Clicking outside the field closes the dropdown.

---

## Athena components to use

| Athena component | Where |
|---|---|
| `Modal` | Outer modal shell (overlay + dialog container + × close button) |
| `Input` | Email field + name field |
| `Avatar` | Each row in the autocomplete dropdown |
| `RadioGroup` | Visual radio indicator on the right of each dropdown row (single-select pattern) |
| `Button` | "Wyślij zaproszenie" (primary) in the footer |

---

## Hints for implementation

This task has more moving parts than `AddMemberSuccessModal`. Read these before writing code — they'll save you a few hours.

### State management

Three pieces of internal state for the form:

```ts
// inside AddMemberModal.tsx
const [email, setEmail] = useState('');
const [name, setName] = useState('');
const [pickedUser, setPickedUser] = useState<ExistingUserSuggestion | null>(null);
```

That's it. **Don't add more.** Everything else (which field to show, whether the button is enabled, whether the name field is read-only) is **derived** from those three values.

Derived helpers — put them in `utils/` inside the component folder, with unit tests:

```ts
// utils/isValidEmail.ts — very loose regex, this is just to gate the "show name field" UI
export const isValidEmail = (value: string): boolean => /^\S+@\S+\.\S+$/.test(value);

// utils/getFlowMode.ts
export type FlowMode = 'empty' | 'autocomplete' | 'existing' | 'new';

export const getFlowMode = (
  email: string,
  pickedUser: ExistingUserSuggestion | null,
): FlowMode => {
  if (pickedUser) return 'existing';
  if (email.length === 0) return 'empty';
  if (isValidEmail(email)) return 'new';
  return 'autocomplete';
};
```

Then in JSX you just branch on `getFlowMode(email, pickedUser)`.

### When the user picks from the dropdown

`onPick(user)` should do **three** things together:

```ts
const handlePick = (user: ExistingUserSuggestion) => {
  setPickedUser(user);
  setEmail(user.email);
  setName(user.fullName);
};
```

### When the user types again after picking

If `pickedUser !== null` and the user edits the email field, you must **reset** `pickedUser` to `null` — otherwise the flow stays stuck in "existing" mode. Easy pitfall:

```ts
const handleEmailChange = (value: string) => {
  setEmail(value);
  if (pickedUser !== null) {
    setPickedUser(null);
    setName('');
  }
};
```

### Submit

```ts
const handleSubmit = () => {
  if (pickedUser) {
    onSubmit({
      kind: 'existing',
      userId: pickedUser.id,
      email: pickedUser.email,
      fullName: pickedUser.fullName,
    });
  } else {
    onSubmit({ kind: 'new', email, fullName: name });
  }
};
```

### Resetting on close

When the user closes the modal, clear `email`, `name`, `pickedUser` so the next open starts clean. Use a `useEffect` that watches `isOpen`, or reset inside the wrapper that calls `onClose`.

### EmailAutocomplete — keep it dumb

The sub-component is **fully controlled**. It does not manage `pickedUser`. It only:
- shows the `Input` with the `value` passed in
- shows the dropdown when focused AND `value.length >= 2` AND there's ≥1 match
- calls `onPick` when a row is clicked

The parent (`AddMemberModal`) owns all decisions.

### Common pitfalls

- **Forgetting to close the dropdown on outside click** — use a `useRef` + `useEffect` listener on `document.mousedown`, or check if Athena's `Input` has a built-in `onBlur` you can hook.
- **Hiding already-picked users from the dropdown** — once `pickedUser !== null`, the dropdown shouldn't be open anyway, so you don't need extra filtering. Keep it simple.
- **`useState` instead of derived values** — every time you reach for `useState` to track "is the button enabled", stop. It's derived.

---

## How to init the component?

Step-by-step — do them in this order:

1. **Create the folder** `src/components/shared/AddMemberModal/`.
2. **Create `AddMemberModal.types.ts`** with `ExistingUserSuggestion` and `AddMemberFormData` from the Types section above. Copy them exactly.
3. **Create the `EmailAutocomplete/` sub-folder** and inside it `EmailAutocomplete.tsx`. Build it first — it's the smaller piece, easier to test in isolation.
4. **Add `EmailAutocomplete.test.tsx`** covering: empty input (no dropdown), typed input with matches (dropdown shown), click a row (`onPick` fired), Escape pressed (dropdown closed).
5. **Create `AddMemberModal.tsx`** — wire `EmailAutocomplete`, the conditional name field, and the submit button per the Hints section.
6. **Create the `utils/` subfolder** with `isValidEmail.ts`, `getFlowMode.ts`, and their `.test.ts` files.
7. **Create `AddMemberModal.test.tsx`** — translate each Given/When/Then block from the "Email-to-state logic" section into tests.
8. **Create `AddMemberModal.stories.tsx`** — all five variants from the Storybook section.
9. **Run locally:** `yarn lint`, `yarn test`, `yarn storybook` — click through all stories.
10. **Open the PR.**

> Compliance with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md) is required.

### Suggested file tree

```
src/components/shared/AddMemberModal/
├── AddMemberModal.tsx
├── AddMemberModal.test.tsx
├── AddMemberModal.types.ts
├── AddMemberModal.stories.tsx
├── utils/
│   ├── isValidEmail.ts
│   ├── isValidEmail.test.ts
│   ├── getFlowMode.ts
│   └── getFlowMode.test.ts
└── EmailAutocomplete/
    ├── EmailAutocomplete.tsx
    └── EmailAutocomplete.test.tsx
```

> Drop any file above that ends up being empty or unnecessary.

---

## Storybook mock data

```ts
// inside AddMemberModal.stories.tsx
const mockAvailableUsers: ExistingUserSuggestion[] = [
  {
    id: 'u1',
    email: 'anna.kowalska@gmail.com',
    fullName: 'Anna Kowalska',
    avatarUrl: 'https://i.pravatar.cc/64?img=1',
  },
  {
    id: 'u2',
    email: 'anna.kowal@wp.pl',
    fullName: 'Anna Kowal',
    avatarUrl: null,
  },
  {
    id: 'u3',
    email: 'anna.kowalska-kret@buziaczek.pl',
    fullName: 'Anna Kowalska-Kret',
    avatarUrl: 'https://i.pravatar.cc/64?img=3',
  },
  {
    id: 'u4',
    email: 'pawel.muchomor@gmail.com',
    fullName: 'Paweł Muchomor-Wojciechowski',
    avatarUrl: 'https://i.pravatar.cc/64?img=12',
  },
];
```

Stories to include:
- **Closed** — `isOpen: false` (renders nothing).
- **Empty** — modal open, email field empty, name field hidden, submit hidden/disabled.
- **Autocomplete open** — email typed `"anna.kowal"`, dropdown showing 3 matches.
- **Existing user picked** — email + read-only name pre-filled after picking from dropdown, submit active.
- **New invite** — email typed `nowy.uzytkownik@example.com` (no match), editable name field shown, submit active once name is non-empty.

---

## Remember about standards

- Use the standard colors palette, never add colors directly (check https://tailwindcss.com/docs/colors and our color palette in the `src/index.css` file and in [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css))
- Create unit tests with **Vitest** for ≥95% of the code created ([testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md)).
- Use **BDD / Given–When–Then** structure for all tests — see the email-to-state logic block above for the exact cases to translate 1:1.
- This is a **shared** component → **Storybook story is mandatory**. Cover all variants listed above.
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md).

---

## Definition of Done

- [ ] Code follows folder structure (`docs/frontend/conventions/PROJECT_STRUCTURE.md`)
- [ ] Naming follows `docs/frontend/conventions/NAMING.md`
- [ ] Component layout follows `docs/frontend/conventions/COMPONENT_STRUCTURE.md`
- [ ] Component lives in `src/components/shared/` — no imports from feature components
- [ ] All types defined in `AddMemberModal.types.ts` (no dependency on external feature types)
- [ ] Modal renders: header + helper text, email Input with `EmailAutocomplete` dropdown, conditional name Input, primary "Wyślij zaproszenie" button
- [ ] Autocomplete filters case-insensitively on `email` OR `fullName`, opens at `value.length >= 2`, closes on pick / Escape / outside click
- [ ] Picking an existing user → name field becomes read-only and pre-filled; submit dispatches `{ kind: 'existing', ... }`
- [ ] Typing an unmatched valid email → name field becomes editable and empty; submit dispatches `{ kind: 'new', ... }` after the manager fills the name
- [ ] Submit button disabled/hidden until the form is valid for the current flow
- [ ] × button and backdrop both call `onClose`; form state resets on close
- [ ] Unit tests added, BDD style, coverage ≥95% on changed files
- [ ] Biome lint clean (no disabled rules without justification)
- [ ] TypeScript clean (no `any`, no `@ts-ignore` without comment)
- [ ] Storybook story added (all variants listed above)
- [ ] No API calls — `onSubmit` logs to console, `availableUsers` comes from mock data in the story
- [ ] CI green: build, lint, test

---

## Resources

- [Figma design](https://www.figma.com/design/wtEn2r9S9s4rzq1teIXeE9/asystent-ngo?node-id=0-1&t=ZutmUh0Dly1Plmh2-1)
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Storybook docs](https://storybook.js.org/docs/writing-stories)
- [Tailwind docs](https://tailwindcss.com/docs/)
- [Vitest docs](https://vitest.dev/guide/)
