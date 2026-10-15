<img alt="The sign-in card, the account that exists with another provider, and the step that completes a new account" src="https://raw.githubusercontent.com/gi-org-pl/product/main/mypolitics/assets/sign-in.png" />

# Story

As a person signing in, I want the card to react to whatever the provider answers - sign me in, ask for the last details of a new account, tell me my address already has an account with another provider, or say what went wrong - so that every way in ends either in my account or in a clear next step.

# Component properties

**Name:** `SignInFlow`
**Location:** `src/components/account/SignInFlow/`
**Shared:** no - domain `account`. It is the one thing the sign-in page and the auth dialog both show

It composes [SignInPanel](https://github.com/gi-org-pl/mypolitics-app/issues/205) and [AccountSetupForm](https://github.com/gi-org-pl/mypolitics-app/issues/206), talks to the `AuthClient` of [AuthSession](https://github.com/gi-org-pl/mypolitics-app/issues/204), and tells its host when it is done. It is the same component on the page and in the dialog, so a change to the flow is a change to both.

```ts
// src/components/account/SignInFlow/SignInFlow.types.ts
export interface SignInFlowProps {
  heading: string;                // for the "choose" view: the page's or the dialog's
  description: string;
  returnTo?: string;              // passed to the client for a full-page provider sign-in
  resume?: boolean;               // on mount, ask the client how a sign-in that left the page ended
  onBusyChange?: (isBusy: boolean) => void; // true while "Gotowe" is saving: the host must not close
  headingId?: string;
  descriptionId?: string;
  onClose?: () => void;           // the dialog's close button, on every view
  onSignedIn: (account: AuthAccount) => void;
  onCancel: () => void;           // "Anuluj" on the step, after the pending sign-up is dropped
}
```

The state of the flow is a reducer in `utils/useSignInFlow.ts`, one state per row of the spec's "States and lifecycle - The card".

# Behaviour

The spec is the source of truth for every case: [Sign-in](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/platform/sign-in.md), sections "The sign-in card", "The 'Prawie gotowe' step" and "Failure modes".

| Case | Behaviour |
|---|---|
| `resume`, while the client is asked | The flow shows nothing, so no other sign-in can start |
| `resume` and the client has an outcome | The flow starts from that outcome, as if a provider window had just answered |
| `resume` and the client has none | The choose view |
| A provider is chosen | `client.signIn(provider, { returnTo, signal })`; the panel waits for that provider |
| `signed-in` | `setSignedIn(account)` on the session, then `onSignedIn(account)` |
| `new-account` | The step, with the provider and the suggested name |
| `account-exists` | The panel's account-exists view |
| "Zaloguj się przez {owner}" | `client.signIn(owner, { link: pendingId, ... })`, the owner's button waits; `signed-in` finishes as above |
| `link-failed` | The choose view with the `failed` error |
| "Wybierz inny sposób" | `client.cancelPending(pendingId)`, then the choose view without an error |
| `window-closed`, `provider-failed`, `failed` | The choose view with that error |
| `signIn` rejects | As `failed` |
| `failed` (or a rejection) | The flow asks for the session first: signed in, it finishes as `signed-in`; otherwise the choose view with the `failed` error |
| An outcome with a pending operation that arrives after unmount | Its pending sign-up or link is dropped with `cancelPending` |
| "Gotowe" | `client.completeSignUp(signUp.id, setup)`; the step is saving and `onBusyChange(true)`, then `onBusyChange(false)` when it settles |
| `completeSignUp` → `signed-in` | `setSignedIn`, `onSignedIn` |
| `completeSignUp` → `failed` or rejects | The flow repeats the completion of the same sign-up once: signed in, it finishes; otherwise the step with the save error. `onBusyChange(false)` only after the repeat has answered |
| `completeSignUp` → `expired` | The choose view with the `failed` error |
| "Anuluj" | `client.cancelPending(signUp.id)` (its failure ignored), then `onCancel` |
| The flow is unmounted while a provider is waited for | The sign-in is aborted through its `signal`: the client closes the window and undoes whatever the sign-in started. Nothing is called on the host |
| The flow is unmounted while the step or the account-exists view is shown | `client.cancelPending(pendingId)` |

# Athena components to use

None directly - the panel and the step use them.

# Out of scope

- The page around it: [SignInPage](https://github.com/gi-org-pl/mypolitics-app/issues/210). The modal and the sheet around it: [AuthDialog](https://github.com/gi-org-pl/mypolitics-app/issues/209).
- What happens after `onSignedIn`: the host decides.

# Files to create

```txt
src/components/account/SignInFlow/SignInFlow.tsx
src/components/account/SignInFlow/SignInFlow.types.ts
src/components/account/SignInFlow/SignInFlow.test.tsx
src/components/account/SignInFlow/SignInFlow.stories.tsx
src/components/account/SignInFlow/utils/useSignInFlow.ts
src/components/account/SignInFlow/utils/useSignInFlow.test.ts
```

# Unit test cases (BDD)

```ts
describe("SignInFlow", () => {
  it("Given a provider with an account, When it is chosen, Then the session is signed in and onSignedIn is called");
  it("Given a provider without an account, When it is chosen, Then the step opens with the suggested name");
  it("Given the step, When 'Gotowe' succeeds, Then the session is signed in and onSignedIn is called");
  it("Given the step, When saving fails, Then the save error shows and 'Gotowe' can be pressed again");
  it("Given the step, When the pending sign-up has expired, Then the card returns with the failed error");
  it("Given the step, When 'Anuluj' is pressed, Then the pending sign-up is dropped and onCancel is called");
  it("Given an address owned by Google, When Facebook is chosen, Then the account-exists view names Google");
  it("Given account-exists, When 'Zaloguj się przez Google' succeeds, Then the person is signed in and Facebook is linked");
  it("Given account-exists, When 'Wybierz inny sposób' is pressed, Then the pending link is dropped and three providers show");
  it("Given the provider window is closed, When the outcome arrives, Then 'Logowanie przerwane' shows");
  it("Given the provider fails, When the outcome arrives, Then '{provider} nie odpowiada' shows");
  it("Given signIn rejects, When it settles, Then 'Coś poszło nie tak' shows");
  it("Given account-exists, When the sign-in meant to link answers link-failed, Then the card returns with the failed error");
  it("Given the flow is unmounted while waiting, When it unmounts, Then the sign-in is aborted and nothing is called on the host");
  it("Given the step is shown, When the flow is unmounted, Then the pending sign-up is dropped");
  it("Given 'Gotowe' is saving, When it renders, Then onBusyChange is true until the save settles");
  it("Given resume and an outcome of a sign-in that left the page, When the flow mounts, Then it continues from that outcome");
  it("Given returnTo, When a provider is chosen, Then the client gets it");
});
```

# Storybook stories

Interactive stories on the stand-in client, one per path, so a reviewer can click through each:

1. `ExistingAccount` - signs straight in
2. `NewAccount` - opens the step
3. `AccountExists` - Facebook with an address owned by Google
4. `WindowClosed`
5. `ProviderFailed`
6. `SaveFails` - the step's save error

# Remember about standards
- Use the standard colors palette, never add colors directly (check https://tailwindcss.com/docs/colors and our color palette in the `src/index.css` file and in [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css))
- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Create a Storybook story for the component with all possible props variants of the component
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)
- Name the branch `feature/sign-in-flow-208`, following [Conventional Branch](https://conventional-branch.github.io/) - never keep a generated or default branch name

# Dependencies

- [AuthSession](https://github.com/gi-org-pl/mypolitics-app/issues/204), [SignInPanel](https://github.com/gi-org-pl/mypolitics-app/issues/205), [AccountSetupForm](https://github.com/gi-org-pl/mypolitics-app/issues/206).

# Resources
- [Spec: Sign-in](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/platform/sign-in.md)
- [Doc: Sign-in](https://github.com/gi-org-pl/product/blob/main/mypolitics/docs/platform/sign-in.md)
- [Figma: sign-in and sign-up, providers only](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=6014-52980)
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Storybook docs](https://storybook.js.org/docs/writing-stories)
- [Vitest docs](https://vitest.dev/guide/)

# Definition of Done
- [ ] Code follows folder structure, naming and component structure
- [ ] Unit tests added, BDD style, coverage ≥95% on changed files
- [ ] Biome lint clean, TypeScript clean
- [ ] Storybook story per path above
- [ ] Every outcome of the spec's "Outcomes of a provider sign-in" and of "Gotowe" has a test
- [ ] Unmounting at any point leaves nothing pending and nobody signed in by accident
- [ ] CI green: build, lint, test
