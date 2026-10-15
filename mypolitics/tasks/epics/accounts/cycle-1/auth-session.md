<img alt="The sign-in card, the account that exists with another provider, and the step that completes a new account" src="https://raw.githubusercontent.com/gi-org-pl/product/main/mypolitics/assets/sign-in.png" />

# Story

As a person using myPolitics, I want the app to know whether I am signed in - from the moment it starts, on every page - so that the header, the editor and every action that needs an account can tell, and so that the sign-in screens can be built and tried before the API supports accounts.

# Component properties

**Module:** the session layer - the auth types, the `AuthClient` interface every sign-in screen talks to, a stand-in client that behaves as the spec says the API will, and the provider that holds the session at the root of the app
**Location:** `src/types/auth.ts`, `src/services/auth/client/`, `src/components/shared/AuthSessionProvider/`, `src/utils/auth/`, `src/root.tsx`
**Shared:** yes - the header, the sign-in screens and any feature read the session through it

There is **no visible component in this task**. Nothing renders except the provider around the app.

The API has no accounts yet. Everything that talks to it goes through one interface, `AuthClient`, and the app gets its client from one file. This task puts a stand-in behind that file; the [AuthApi](https://github.com/gi-org-pl/mypolitics-app/issues/207) task replaces it with the real adapter and touches nothing else.

### Types

```ts
// src/types/auth.ts
export type IdentityProvider = "google" | "facebook" | "x";

export interface AuthAccount {
  id: string;
  displayName: string;
  avatarUrl?: string;             // the provider's photo; absent: the initials are drawn
  email?: string;                 // only a verified address; absent for many X accounts
  provider: IdentityProvider;     // the provider of the current sign-in
}

export type AuthSession =
  | { status: "unknown" }         // the app has not heard from the client yet
  | { status: "signed-out" }
  | { status: "signed-in"; account: AuthAccount };

export interface PendingSignUp {
  provider: IdentityProvider;
  suggestedName?: string;
  avatarUrl?: string;
  email?: string;
}

export type SignInOutcome =
  | { kind: "signed-in"; account: AuthAccount }
  | { kind: "new-account"; signUp: PendingSignUp }
  | { kind: "account-exists"; provider: IdentityProvider; ownerProvider: IdentityProvider; email: string }
  | { kind: "link-failed" }       // a sign-in meant to link found nothing to link to; no session
  | { kind: "window-closed"; provider: IdentityProvider }
  | { kind: "provider-failed"; provider: IdentityProvider }
  | { kind: "failed" };

export interface AccountSetup {
  displayName: string;            // already trimmed and valid
  isAgeDeclared: true;
  hasAcceptedTerms: true;
}

export type CompleteSignUpOutcome =
  | { kind: "signed-in"; account: AuthAccount }
  | { kind: "expired" }           // the pending sign-up is gone
  | { kind: "failed" };

export interface SignInOptions {
  returnTo?: string;              // where a full-page provider sign-in comes back to: the sign-in page
  link?: boolean;                 // the owner's sign-in after account-exists: links, or fails as a whole
  signal?: AbortSignal;           // aborting closes the provider window, settles with window-closed
                                  // and undoes whatever the sign-in started in the API
}

export interface AuthClient {
  getSession(): Promise<AuthAccount | null>;
  signIn(provider: IdentityProvider, options?: SignInOptions): Promise<SignInOutcome>;
  resumeSignIn(): Promise<SignInOutcome | null>; // how a sign-in that left the page ended; null when none
  completeSignUp(setup: AccountSetup): Promise<CompleteSignUpOutcome>;
  cancelPending(): Promise<void>; // drops a pending sign-up or a pending link
  signOut(): Promise<void>;       // rejects when the API could not end the session
}
```

### The stand-in client

```ts
// src/services/auth/client/createMockAuthClient.ts
export interface MockAuthClientOptions {
  storage?: Storage;              // default: the tab's session storage (safe when missing)
  delayMs?: number;               // how long a "provider window" stays open; default 600
  outcomes?: Partial<Record<IdentityProvider, MockSignInBehaviour>>;
  failCompleteSignUp?: boolean;
}

export type MockSignInBehaviour =
  | "auto"                        // signed in when the provider has an account, otherwise a new account
  | "window-closed"
  | "provider-failed"
  | "failed"
  | { accountExists: IdentityProvider }; // the address belongs to an account of that provider

export const createMockAuthClient: (options?: MockAuthClientOptions) => AuthClient;

// src/services/auth/client/authClient.ts
export const authClient: AuthClient = createMockAuthClient();
```

The stand-in keeps its pretend accounts and session in session storage, so a refresh keeps the person signed in for the tab. It contacts no provider and no API. Its suggested name and e-mail are fixed fictional values per provider (the frames use "Ala Nowak").

### The provider and the hook

```ts
// src/components/shared/AuthSessionProvider/AuthSessionProvider.types.ts
export interface AuthSessionProviderProps {
  client?: AuthClient;            // default: authClient
  children: ReactNode;
}

// src/utils/auth/useAuthSession.ts
export interface AuthSessionValue {
  session: AuthSession;
  client: AuthClient;
  setSignedIn: (account: AuthAccount) => void; // called by the sign-in screens when they finish
  signOut: () => Promise<boolean>; // true when the session ended; false leaves the person signed in
  refresh: () => Promise<void>;   // asks the client again
}
export const useAuthSession: () => AuthSessionValue;
```

# Behaviour

The spec is the source of truth for every case: [Sign-in](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/platform/sign-in.md), sections "The session", "Outcomes of a provider sign-in" and "Failure modes".

| Case | Behaviour |
|---|---|
| The app starts | `session` is `unknown`, then the client's answer: `signed-in` with the account, or `signed-out` |
| `getSession` rejects | `signed-out` - the API being unreachable is treated as signed out |
| `setSignedIn(account)` | `signed-in` with that account at once, without asking the client |
| `signOut()` | The client's `signOut`, then `signed-out`; answers `true` |
| `signOut()` and the client rejects | Still `signed-in`; answers `false`. The page never shows a person signed out while the API may still hold their session |
| An answer of `getSession` asked for before a later `setSignedIn` or `signOut` | Dropped, so a slow first check cannot overwrite a sign-in that finished in the meantime |
| `useAuthSession` outside the provider | Throws a clear error naming the provider |
| Stand-in: sign-in with a provider that has an account | `signed-in` after `delayMs` |
| Stand-in: sign-in with a provider that has none | `new-account` with the suggested name, e-mail and no photo; a pending sign-up is kept |
| Stand-in: `completeSignUp` with a pending sign-up | Saves the account under the provider and returns `signed-in`; with `failCompleteSignUp` returns `failed`; with none pending returns `expired` |
| Stand-in: `accountExists` behaviour | `account-exists` naming the owning provider and the e-mail; a pending link to the owner's account is kept. Signing in with the owning provider and `link: true` then returns `signed-in` and links the pending provider, so the next sign-in with it is `signed-in` too |
| Stand-in: `link: true` with no pending link, or by another provider than the owner | `link-failed`; no session, nothing linked |
| Stand-in: `cancelPending` | Drops a pending sign-up and a pending link |
| Stand-in: `signIn` aborted through `signal` | Settles with `window-closed` and changes nothing |
| Stand-in: `resumeSignIn` | `null` - the stand-in never leaves the page |
| Stand-in: storage missing or throwing | Works in memory |

# Athena components to use

None - nothing is drawn.

# Out of scope

- Any screen: the card, the step, the dialog, the page and the header have their own tasks.
- Talking to the API, opening provider windows, cookies: [AuthApi](https://github.com/gi-org-pl/mypolitics-app/issues/207).

# Files to create

```txt
src/types/auth.ts
src/services/auth/client/authClient.ts
src/services/auth/client/createMockAuthClient.ts
src/services/auth/client/createMockAuthClient.test.ts
src/components/shared/AuthSessionProvider/AuthSessionProvider.tsx
src/components/shared/AuthSessionProvider/AuthSessionProvider.types.ts
src/components/shared/AuthSessionProvider/AuthSessionProvider.test.tsx
src/utils/auth/authSessionContext.ts
src/utils/auth/useAuthSession.ts
src/utils/auth/useAuthSession.test.tsx
```

`src/root.tsx` wraps the app in the provider.

# Unit test cases (BDD)

```ts
describe("AuthSessionProvider", () => {
  it("Given the app starts, When the client has not answered, Then the session is unknown");
  it("Given the client returns an account, When it answers, Then the session is signed in with it");
  it("Given the client returns nothing, When it answers, Then the session is signed out");
  it("Given getSession rejects, When it answers, Then the session is signed out");
  it("Given a signed-in session, When signOut is called, Then the client signs out and the session is signed out");
  it("Given signOut rejects, When it is called, Then the session stays signed in and the call answers false");
  it("Given the first getSession is slow, When a sign-in finishes before it, Then its late answer is dropped");
  it("Given any session, When setSignedIn is called, Then the session is signed in with that account");
});

describe("useAuthSession", () => {
  it("Given no provider, When the hook is used, Then it throws");
});

describe("createMockAuthClient", () => {
  it("Given no account for the provider, When signing in, Then the outcome is a new account with a suggested name");
  it("Given a pending sign-up, When completeSignUp is called, Then the account is saved and returned");
  it("Given no pending sign-up, When completeSignUp is called, Then the outcome is expired");
  it("Given failCompleteSignUp, When completeSignUp is called, Then the outcome is failed");
  it("Given a saved account, When signing in again with its provider, Then the outcome is signed in");
  it("Given accountExists, When signing in, Then the outcome names the owning provider and the e-mail");
  it("Given a pending link, When signing in with the owning provider, Then the other provider is linked");
  it("Given a pending sign-up, When cancelPending is called, Then completeSignUp is expired");
  it("Given window-closed, provider-failed or failed behaviour, When signing in, Then that outcome is returned");
  it("Given session storage throws, When the client is used, Then it works in memory");
  it("Given a saved session, When getSession is called, Then the account is returned, and after signOut nothing");
  it("Given a sign-in is aborted, When the signal fires, Then the outcome is window-closed and nothing is pending");
  it("Given any state, When resumeSignIn is called, Then it answers null");
});
```

# Storybook stories

None - nothing is drawn. The stand-in client is what the stories of the later tasks use.

# Remember about standards
- Use the standard colors palette, never add colors directly (check https://tailwindcss.com/docs/colors and our color palette in the `src/index.css` file and in [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css))
- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)
- React Context + `useState` is enough here; Zustand is not needed
- Name the branch `feature/auth-session-204`, following [Conventional Branch](https://conventional-branch.github.io/) - never keep a generated or default branch name

# Dependencies

None.

# Resources
- [Spec: Sign-in](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/platform/sign-in.md)
- [Doc: Sign-in](https://github.com/gi-org-pl/product/blob/main/mypolitics/docs/platform/sign-in.md)
- [Figma: sign-in and sign-up, providers only](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=6014-52980)
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Vitest docs](https://vitest.dev/guide/)

# Definition of Done
- [ ] Code follows folder structure (docs/frontend/conventions/PROJECT_STRUCTURE.md)
- [ ] Naming follows docs/frontend/conventions/NAMING.md
- [ ] Unit tests added, BDD style, coverage ≥95% on changed files
- [ ] Biome lint clean, TypeScript clean
- [ ] The app starts with the provider at its root; the home page and the questionnaire behave as before
- [ ] Every outcome of the spec's "Outcomes of a provider sign-in" can be produced by the stand-in
- [ ] Swapping the client means changing `authClient.ts` only
- [ ] CI green: build, lint, test
