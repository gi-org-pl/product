> **Blocked by:**
> - [`AddMemberModal`](../cycle-1/AddMemberModal.md) — must be merged
> - [`AddMemberSuccessModal`](../cycle-1/AddMemberSuccessModal.md) — must be merged
> - [`OrganisationMembersFilters`](../../organisation/cycle-3/OrganisationMembersFilters.md) — must be merged (provides the "Dodaj" button + `onAddMember` callback we hook into)

## Story

As an organisation manager, when I click "Dodaj" on the members page, I want the add-member modal to open, and after I submit it I want to see a confirmation that smoothly lets me invite another person — so the whole "invite a new member" flow feels like one continuous task instead of a bunch of disconnected screens.

## Differences between design and final effect

- Please use Athena's components if possible — but this task **adds no new visual components**. It's pure orchestration of two existing modals already built in cycle-1.
- **Do not implement API connection** — UI only. The `availableUsers` list comes from a mock constant; submissions just log to console and feed the success modal.

---

## What this task is (and isn't)

**This task is glue code.** No new components, no new types, no Storybook stories of its own. You're:

1. Importing `AddMemberModal` + `AddMemberSuccessModal`
2. Adding a small state machine to `OrganisationMembersPage`
3. Wiring `MembersFilters`'s existing `onAddMember` callback so clicking "Dodaj" opens the form modal
4. Translating the form's submit payload into the success modal's props
5. Implementing the "Zaproś kolejną osobę" loop (success modal → form modal again)
6. Providing a mock `availableUsers` array so the autocomplete dropdown has data to filter

What this task **isn't**:
- No API integration (still UI-only — that lands in a later cycle when the backend exists)
- No new shared component (`AddMemberFlow` wrapper is **explicitly not** what we want here — the state lives on the page)
- No redesign of the modals themselves — if something looks off, that's a fix in the cycle-1 task, not here

---

## Screens covered

1. **Page default** — `OrganisationMembersPage` renders normally; both modals closed (rendered with `isOpen: false`).
2. **Form modal open** — user clicked "Dodaj"; `AddMemberModal` is visible.
3. **Form submitted (existing user)** — form modal closes, success modal opens with the `'added'` message.
4. **Form submitted (new invite)** — form modal closes, success modal opens with the `'invited'` message.
5. **"Zaproś kolejną osobę" clicked** — success modal closes, form modal reopens with a fresh empty state.
6. **Either modal closed via × / backdrop** — flow ends, page returns to default.

---

## Where the code lives

All changes happen inside `src/pages/OrganisationMembersPage/`:

| File | Change |
|---|---|
| `OrganisationMembersPage.tsx` | Add flow state + handlers; render both modals |
| `OrganisationMembersPage.constants.ts` | Add `MOCK_AVAILABLE_USERS` |
| `OrganisationMembersPage.test.tsx` | Add tests for the flow (click → open → submit → success → invite-another → reopen) |

No new files, no new folders. If the page file starts feeling too heavy after this task, **extract a `useAddMemberFlow` hook** into `src/pages/OrganisationMembersPage/utils/useAddMemberFlow.ts` — but only if it's actually messy. Don't pre-optimise.

---

## State machine

The whole flow is **three discrete states**. Use a single discriminated union — not three separate booleans. This is the cleanest pattern and the easiest to test.

```ts
// OrganisationMembersPage.tsx (or extracted into useAddMemberFlow.ts)

type AddMemberFlowState =
  | { step: 'closed' }
  | { step: 'form' }
  | { step: 'success'; mode: AddMemberSuccessMode; fullName: string };

const [flowState, setFlowState] = useState<AddMemberFlowState>({ step: 'closed' });
```

### Handlers

```ts
const handleOpenForm = () => setFlowState({ step: 'form' });

const handleFormSubmit = (data: AddMemberFormData) => {
  setFlowState({
    step: 'success',
    // translate the form's "kind" into the success modal's "mode"
    mode: data.kind === 'existing' ? 'added' : 'invited',
    fullName: data.fullName,
  });
};

const handleInviteAnother = () => setFlowState({ step: 'form' });

const handleCloseFlow = () => setFlowState({ step: 'closed' });
```

### Rendering both modals

Render both modals at the page level — let each one's `isOpen` decide if it shows.

```tsx
<MembersFilters
  /* ...existing props... */
  onAddMember={handleOpenForm}
/>

<AddMemberModal
  isOpen={flowState.step === 'form'}
  availableUsers={MOCK_AVAILABLE_USERS}
  onSubmit={handleFormSubmit}
  onClose={handleCloseFlow}
/>

<AddMemberSuccessModal
  isOpen={flowState.step === 'success'}
  mode={flowState.step === 'success' ? flowState.mode : null}
  fullName={flowState.step === 'success' ? flowState.fullName : ''}
  onInviteAnother={handleInviteAnother}
  onClose={handleCloseFlow}
/>
```

### Key translation

| `AddMemberFormData.kind` | → | `AddMemberSuccessMode` |
|---|---|---|
| `'existing'` | → | `'added'` |
| `'new'` | → | `'invited'` |

The form modal speaks in "what kind of submission was this", the success modal speaks in "what message to show". The page is the only place that knows about both — that translation lives **here** and nowhere else.

---

## Mock data — `MOCK_AVAILABLE_USERS`

Add to `OrganisationMembersPage.constants.ts`:

```ts
import type { ExistingUserSuggestion } from '@/components/shared/AddMemberModal/AddMemberModal.types';

export const MOCK_AVAILABLE_USERS: ExistingUserSuggestion[] = [
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
  {
    id: 'u5',
    email: 'iwona.makrela@gmail.com',
    fullName: 'Iwona Makrela',
    avatarUrl: 'https://i.pravatar.cc/64?img=5',
  },
];
```

> Re-use the same shape as the Storybook mock in `AddMemberModal.stories.tsx` (good — that's intentional consistency). The list lives in the page because the page is what owns the "data source" until the API exists.

---

## Behaviour (Given–When–Then)

```
Given the page is rendered with no flow active
When the user clicks "Dodaj" in MembersFilters
Then AddMemberModal opens (isOpen: true) and AddMemberSuccessModal stays closed

Given AddMemberModal is open
When the user submits with kind: 'existing'
Then AddMemberModal closes and AddMemberSuccessModal opens with mode: 'added' and the picked user's fullName

Given AddMemberModal is open
When the user submits with kind: 'new'
Then AddMemberModal closes and AddMemberSuccessModal opens with mode: 'invited' and the typed fullName

Given AddMemberSuccessModal is open
When the user clicks "Zaproś kolejną osobę"
Then AddMemberSuccessModal closes and AddMemberModal reopens with empty form state

Given AddMemberModal or AddMemberSuccessModal is open
When the user clicks × or the backdrop
Then both modals close and the page returns to the default state
```

---

## Hints for implementation

### Don't use two `useState`s

❌ Don't do this:
```ts
const [isFormOpen, setIsFormOpen] = useState(false);
const [isSuccessOpen, setIsSuccessOpen] = useState(false);
const [successResult, setSuccessResult] = useState<...>(null);
```

You'll end up with bugs where both are open at once, or success is open but the result is `null`. Use the discriminated union state above — TypeScript will literally prevent the bad combinations from compiling.

### "Invite another" must reset the form modal

When `AddMemberModal` closes (via `step: 'success'`), its internal state should already be cleared if you implemented the cycle-1 task correctly (the "Resetting on close" hint). Re-opening it on `handleInviteAnother` should show an empty form. **Verify this in your tests** — don't just trust it.

### Make sure both modals can't render simultaneously

When `flowState.step === 'success'`, `AddMemberModal`'s `isOpen` is `false`, so it returns `null` and doesn't render. Same the other way. If you ever see both visible at once, your conditions are wrong.

### Modal mount/unmount

Athena `Modal` likely uses a portal — that means **don't** wrap both modals in something that conditionally renders the wrapper. Render them both always; let each `isOpen` decide.

### Common pitfall — stale `fullName` in success modal

The success modal needs `fullName` and `mode` to come from the same submission. The discriminated union state above already enforces this (they're stored together inside the `'success'` variant). If you split them into separate `useState`s you can get into a race where one updates before the other.

### Where the translation lives — only here

Don't add `mode` to `AddMemberModal` and don't add `kind` to `AddMemberSuccessModal`. Both modals stay generic; only this integration knows that `kind: 'existing'` means "show 'added' message". That's the whole point of keeping them decoupled.

---

## How to init this task?

Step-by-step:

1. **Pull main** — make sure all three blocking tasks are merged. If any of them aren't, **stop and wait**. Don't try to build this against unmerged branches.
2. **Open `OrganisationMembersPage.tsx`** and read the current state of the file. Locate where `MembersFilters` is rendered.
3. **Add `MOCK_AVAILABLE_USERS`** to `OrganisationMembersPage.constants.ts`.
4. **Add the `AddMemberFlowState` type and `useState`** to `OrganisationMembersPage.tsx`. Use the discriminated union from the State machine section.
5. **Replace the existing `onAddMember={() => console.log('add member')}`** placeholder on `MembersFilters` with the new `handleOpenForm` handler.
6. **Add the `<AddMemberModal />` and `<AddMemberSuccessModal />`** at the bottom of the page's JSX (siblings of the existing content).
7. **Add tests in `OrganisationMembersPage.test.tsx`** — one `describe` block per Given/When/Then scenario above.
8. **Run locally:** `yarn lint`, `yarn test`, `yarn dev`. Open the page in the browser, click "Dodaj", run through all flow paths manually.
9. **Open the PR.** In the description, list the manual test steps you ran.

> If the page file gets ugly (more than ~50 lines of flow code), **extract `useAddMemberFlow` into `src/pages/OrganisationMembersPage/utils/useAddMemberFlow.ts`** with its own unit tests. Returning shape: `{ flowState, openForm, submitForm, inviteAnother, close }`.

---

## Athena components to use

None directly in this task — both modals are already built. You're just rendering them.

---

## Remember about standards

- No new colours, no new tokens — you're not styling anything here.
- Tests should be **integration-flavoured** — render the page with `render(<OrganisationMembersPage />)`, then simulate clicks. Don't unit-test the handlers in isolation.
- BDD structure for tests — one `describe` per scenario above.
- No new Storybook stories — both modals already have their own; the page itself doesn't need one.
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md).

---

## Definition of Done

- [ ] All three blocking tasks merged before starting
- [ ] `MOCK_AVAILABLE_USERS` added to `OrganisationMembersPage.constants.ts`
- [ ] `AddMemberFlowState` discriminated union used (no separate booleans for "form open" / "success open")
- [ ] Clicking "Dodaj" in `MembersFilters` opens `AddMemberModal`
- [ ] Submitting `AddMemberModal` with `kind: 'existing'` closes it and opens `AddMemberSuccessModal` with `mode: 'added'`
- [ ] Submitting `AddMemberModal` with `kind: 'new'` closes it and opens `AddMemberSuccessModal` with `mode: 'invited'`
- [ ] `fullName` passed to success modal matches the submitted name
- [ ] "Zaproś kolejną osobę" closes success modal and reopens form modal with a clean empty state
- [ ] × / backdrop on either modal returns the page to default state
- [ ] Both modals never visible simultaneously
- [ ] Integration tests added in `OrganisationMembersPage.test.tsx` covering each Given/When/Then scenario above
- [ ] No new shared components or types created
- [ ] Biome lint clean
- [ ] TypeScript clean (no `any`, no `@ts-ignore`)
- [ ] Manual smoke test passes (steps listed in PR description)
- [ ] No API calls — fully UI-only
- [ ] CI green: build, lint, test

---

## Resources

- [Figma design](https://www.figma.com/design/wtEn2r9S9s4rzq1teIXeE9/asystent-ngo?node-id=0-1&t=ZutmUh0Dly1Plmh2-1)
- [`AddMemberModal` task](../cycle-1/AddMemberModal.md)
- [`AddMemberSuccessModal` task](../cycle-1/AddMemberSuccessModal.md)
- [`OrganisationMembersFilters` task](../../organisation/cycle-3/OrganisationMembersFilters.md)
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Vitest docs](https://vitest.dev/guide/)
- [React Testing Library — userEvent](https://testing-library.com/docs/user-event/intro)
