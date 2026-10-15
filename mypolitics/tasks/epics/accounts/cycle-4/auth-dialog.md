<img alt="The dialog as a bottom sheet over the editor start on a phone" src="https://raw.githubusercontent.com/gi-org-pl/product/main/mypolitics/assets/sign-in-dialog.png" width="280" />

# Story

As a person who presses something that needs an account - "Utwórz quiz" today, rating a quiz or saving a draft later - I want to sign in right there, in a dialog that says why an account is needed, and then have what I pressed carry on; and if I close the dialog, I want everything to stay as it was.

# Component properties

**Name:** `AuthDialogProvider` with `AuthDialog`, the `useRequireAuth` hook and the `RequireAuth` page guard
**Location:** `src/components/shared/AuthDialogProvider/`, `src/components/shared/RequireAuth/`, `src/utils/auth/`, `src/constants/auth.ts`, `src/root.tsx`
**Shared:** yes - any domain asks for an account through it

The dialog is universal: it is not part of the editor or of any page. One provider at the root of the app holds it; any component asks for an account with one call and an action key.

```ts
// src/constants/auth.ts
export interface AuthIntent {
  line: MessageDescriptor;        // why the account is needed, in the action's terms
}

export const AUTH_INTENTS = {
  "create-quiz": { line: msg`Quiz zapiszemy na Twoim koncie. Pierwsze logowanie je zakłada.` },
} satisfies Record<string, AuthIntent>;

export type AuthIntentKey = keyof typeof AUTH_INTENTS;

// src/utils/auth/useRequireAuth.ts
// Runs the action at once when signed in; otherwise opens the dialog for the
// intent and runs the action once, after a successful sign-in. Closing the
// dialog runs nothing.
export type RequireAuth = (intent: AuthIntentKey, action: () => void) => void;
export const useRequireAuth: () => RequireAuth;

// src/components/shared/RequireAuth/RequireAuth.types.ts
export interface RequireAuthProps {
  intent: AuthIntentKey;
  children: ReactNode;            // rendered only when signed in
}
```

How another feature uses it - the whole cost of a new action that needs an account:

```tsx
// 1. src/constants/auth.ts - one entry
"rate-quiz": { line: msg`Ocenę zapiszemy na Twoim koncie. Pierwsze logowanie je zakłada.` },

// 2. the component
const requireAuth = useRequireAuth();
<Button onClick={() => requireAuth("rate-quiz", () => rateQuiz(score))}>…</Button>

// or a whole page
<RequireAuth intent="create-quiz"><QuizEditor /></RequireAuth>
```

**The first consumer** is "Stwórz własny" on the home page (`src/pages/_index.tsx`): it asks with `create-quiz`. Its action is still empty until the editor exists, so after signing in the person stays on the home page, signed in; the editor task replaces the empty action with opening the editor start.

# Behaviour

The spec is the source of truth for every case: [Sign-in](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/platform/sign-in.md), sections "The auth dialog", "Actions that need an account", "Guarded pages" and "Non-functional". The Figma frames are the source of truth for sizes, spacing and type.

| Case | Behaviour |
|---|---|
| `requireAuth` while signed in | The action runs at once; no dialog |
| `requireAuth` while signed out | The dialog opens with "Najpierw zaloguj się" and the intent's line, showing `SignInFlow` |
| `requireAuth` while the session is not known yet | The dialog opens; if the session turns out signed in, the dialog closes and the action runs |
| 768 px wide or more | A modal in the middle over a dimmed page |
| Narrower | A bottom sheet: full width at the bottom, rounded top corners, the handle drawn at the top |
| Signed in through the dialog | The dialog closes, then the action runs once |
| Close button, Escape, a press on the dimmed page, "Anuluj" | The dialog closes; the action does not run; focus returns to the control that was focused when it opened |
| A second `requireAuth` while open | Ignored |
| Open | Focus moves into the dialog and stays there (Tab and Shift+Tab wrap, also after the content changes from the card to the step); the page behind does not scroll |
| `RequireAuth` signed in | Its children |
| `RequireAuth` signed out | Nothing of the page; the dialog with the intent's line. Signing in shows the children; closing goes back in history, or to the home page when there is no earlier page in the app |
| Reduced motion | No movement when the dialog appears |

# Athena components to use

- Not `Modal`, although it looks like the fit, for three reasons that would each break a case above: its overlay always centres the box, so it cannot be the phone's bottom sheet; its focus trap collects the focusable elements once when it opens, so after the card turns into the "Prawie gotowe" step Tab leaves the dialog; and its close button is named "Close modal" in English and cannot be renamed or moved into the header box where the frames draw it. Build the dialog on a portal into `document.body`, like `SurveyDialogPortal` does for the survey dialogs, with `role="dialog"`, `aria-modal`, the heading as its name and the line as its description, and a focus trap that looks up the focusable elements on every Tab.
- The close button is the one `AuthCard` draws when given `onClose`.

# Deviation from standards

None - no new library. The dialog is plain React and Tailwind.

# Out of scope

- The card and the step themselves: [SignInFlow](https://github.com/gi-org-pl/mypolitics-app/issues/208).
- The editor and its start screen: the editor epic. This task only wires "Stwórz własny".
- The `/login` page: [SignInPage](https://github.com/gi-org-pl/mypolitics-app/issues/210).

# Files to create

```txt
src/constants/auth.ts                          (the intents are added to it)
src/utils/auth/authDialogContext.ts
src/utils/auth/useRequireAuth.ts
src/utils/auth/useRequireAuth.test.tsx
src/components/shared/AuthDialogProvider/AuthDialogProvider.tsx
src/components/shared/AuthDialogProvider/AuthDialogProvider.types.ts
src/components/shared/AuthDialogProvider/AuthDialogProvider.test.tsx
src/components/shared/AuthDialogProvider/AuthDialogProvider.stories.tsx
src/components/shared/AuthDialogProvider/AuthDialog/AuthDialog.tsx
src/components/shared/AuthDialogProvider/AuthDialog/AuthDialog.types.ts
src/components/shared/AuthDialogProvider/AuthDialog/utils/useDialogFocus.ts
src/components/shared/RequireAuth/RequireAuth.tsx
src/components/shared/RequireAuth/RequireAuth.types.ts
src/components/shared/RequireAuth/RequireAuth.test.tsx
e2e/account/create-quiz-sign-in.spec.ts
```

`src/root.tsx` puts `AuthDialogProvider` inside `AuthSessionProvider`, around the header, the page and the footer. `src/pages/_index.tsx` wires "Stwórz własny".

# Unit test cases (BDD)

```ts
describe("useRequireAuth", () => {
  it("Given a signed-in session, When requireAuth is called, Then the action runs at once and no dialog opens");
  it("Given a signed-out session, When requireAuth is called, Then the dialog opens with the intent's line");
  it("Given an unknown session, When it turns out signed in, Then the dialog closes and the action runs once");
  it("Given the dialog is open, When the person signs in, Then the dialog closes and the action runs once");
  it("Given the dialog is open, When it is closed, Then the action never runs");
  it("Given the dialog is open, When requireAuth is called again, Then it is ignored");
  it("Given no provider, When the hook is used, Then it throws");
});

describe("AuthDialog", () => {
  it("Given it opens, When it renders, Then it is a modal dialog named by its heading and described by the line");
  it("Given it is open, When Escape is pressed, Then it closes");
  it("Given it is open, When the dimmed page is pressed, Then it closes");
  it("Given it is open, When the close button is pressed, Then it closes and focus returns to the opener");
  it("Given the step is shown, When Tab is pressed on the last control, Then focus wraps to the first");
  it("Given it is open, When it renders, Then the page behind does not scroll");
  it("Given a narrow screen, When it opens, Then it is drawn as a bottom sheet with a handle");
});

describe("RequireAuth", () => {
  it("Given a signed-in session, When it renders, Then the children show");
  it("Given a signed-out session, When it renders, Then the children do not show and the dialog opens");
  it("Given a signed-out session, When the person signs in, Then the children show");
  it("Given a signed-out session, When the dialog is closed, Then the person goes back or home");
});

describe("HomePage", () => {
  it("Given a signed-out visitor, When 'Stwórz własny' is pressed, Then the dialog asks to sign in to save the quiz");
});
```

E2E (`e2e/account/create-quiz-sign-in.spec.ts`), on the stand-in client:

```gherkin
Scenario: A visitor signs up from "Stwórz własny"
  Given a signed-out visitor on the home page
  When they press "Stwórz własny"
  Then a dialog says "Najpierw zaloguj się"
  When they continue with Google and complete "Prawie gotowe"
  Then the dialog closes and the header shows their name

Scenario: A visitor closes the dialog
  Given the dialog opened from "Stwórz własny"
  When they press Escape
  Then the dialog closes and the home page is as before
```

# Storybook stories

1. `Modal` - [Utwórz quiz / Desktop / Modal logowania](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=6017-110026)
2. `BottomSheet` - [Utwórz quiz / Mobile / Modal logowania](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=6017-110127), at a phone viewport
3. `SetupStep` - the dialog after a new account, not drawn
4. `GuardedPage` - `RequireAuth` over a placeholder page

# Remember about standards
- Use the standard colors palette, never add colors directly (check https://tailwindcss.com/docs/colors and our color palette in the `src/index.css` file and in [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css))
- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Create a Storybook story for the component with all possible props variants of the component
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)
- All texts through Lingui; run `yarn i18n:extract` and commit the catalogues
- Name the branch `feature/auth-dialog-209`, following [Conventional Branch](https://conventional-branch.github.io/) - never keep a generated or default branch name

# Dependencies

- [SignInFlow](https://github.com/gi-org-pl/mypolitics-app/issues/208).

# Resources
- [Spec: Sign-in](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/platform/sign-in.md)
- [Doc: Sign-in](https://github.com/gi-org-pl/product/blob/main/mypolitics/docs/platform/sign-in.md)
- [Figma: sign-in and sign-up, providers only](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=6014-52980)
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Storybook docs](https://storybook.js.org/docs/writing-stories)
- [Tailwind docs](https://tailwindcss.com/docs/)
- [Vitest docs](https://vitest.dev/guide/)

# Definition of Done
- [ ] Code follows folder structure, naming and component structure
- [ ] Unit tests added, BDD style, coverage ≥95% on changed files
- [ ] Playwright happy path added (Gherkin)
- [ ] Biome lint clean, TypeScript clean
- [ ] Storybook story per state above
- [ ] All texts in Lingui macros, `.po` files committed
- [ ] The modal and the bottom sheet match their frames at 1440 px and 360 px
- [ ] Adding an action that needs an account is one entry in `AUTH_INTENTS` and one call - nothing in the dialog changes
- [ ] Keyboard only: open, sign in, close, focus returns - checked by hand
- [ ] CI green: build, lint, test, e2e
