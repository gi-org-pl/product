> **Blocked - do not start.** The myPolitics API has no accounts, sessions or provider sign-in yet. This task waits for those API changes; until then the app runs on the stand-in client of [AuthSession](https://github.com/gi-org-pl/mypolitics-app/issues/204).

# Story

As a person signing in to myPolitics, I want the sign-in buttons to really sign me in with Google, Facebook or X and the account to really be saved, so that my quizzes belong to me.

# Component properties

**Module:** the API adapter of `AuthClient` - the calls, the Zod schemas of what the API sends, the provider window, and the switch from the stand-in to it
**Location:** `src/services/api/client/auth/`, `src/services/api/schemas/auth.ts`, `src/services/api/utils/auth/`, `src/services/auth/client/authClient.ts`
**Shared:** yes

Nothing visible changes. Every screen talks to `AuthClient` ([AuthSession](https://github.com/gi-org-pl/mypolitics-app/issues/204)); this task writes an `AuthClient` over the API and makes `authClient.ts` export it instead of the stand-in. If anything outside these folders has to change, the interface was wrong: fix the interface in its own commit and say so in the pull request.

```ts
// src/services/api/client/auth/createApiAuthClient.ts
export const createApiAuthClient: (options?: { baseUrl?: string; timeoutMs?: number }) => AuthClient;

// src/services/auth/client/authClient.ts
export const authClient: AuthClient = createApiAuthClient();
```

# What the API has to provide

The spec's back-end half is the contract: [Sign-in](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/platform/sign-in.md), sections "The account", "Outcomes of a provider sign-in", "Rules and constraints", "Privacy and data handling" and "Failure modes". In short:

| Need | Rule |
|---|---|
| Identity | Provider + the provider's user identifier, unique. E-mail optional, verified only - X often gives none |
| Session | A cookie the page cannot read (`HttpOnly`, `Secure`, `SameSite=Lax`), 30 days, extended on use; it records when it started |
| Cross-origin cookies | The app (`https://mypolitics.pl`) and the API (`https://api.mypolitics.pl`) are two origins of one site, so the browser sends and stores the cookies only on credentialed requests. The auth endpoints answer with CORS for the app's own origins by name and `Access-Control-Allow-Credentials: true`, never `*` |
| Read the session | The account or none |
| Provider sign-in | Through a provider window (OAuth with PKCE), answering with one of the outcomes of the spec; falls back to a full-page redirect that returns to `returnTo` (the sign-in page) when the window is blocked |
| Resume | After a full-page redirect, the outcome of that sign-in can be asked for once |
| Stop | A sign-in that the app abandons (the dialog was closed) is undone: a session it started is ended, a pending sign-up or link is dropped |
| Pending sign-up | Created when the provider identity has no account and its e-mail belongs to none; 15 minutes; holds the suggested name, the photo address, the e-mail - **only in the person's browser**, in an encrypted cookie the page cannot read. The API writes nothing about the person (table, log, cache) before "Gotowe" |
| Complete sign-up | Display name (2-50 characters), the age declaration and the acceptance of the terms with their versions; saves the account and starts the session; answers expired when the pending sign-up is gone |
| Account exists | When the verified e-mail belongs to an account of another provider: never merged; a pending link of 15 minutes that names that account; a sign-in with `link` whose identity belongs to that account links the new provider; any other answers `link-failed` and starts no session |
| Pending identifiers | Every pending sign-up and pending link has its own identifier, returned with the outcome; completion, cancellation and the owner's sign-in name it, so flows in two tabs never mix |
| Idempotent completion | Completing a sign-up already completed answers with the account it made |
| Cancel | Drops the named pending sign-up or pending link |
| Sign out | Ends the session in the API; the call fails when it could not |
| Never | Joins the account to answers, results, demographics or the respondent code |

The exact endpoints, request and answer shapes are the API's to define; this task follows them. When the API work starts, link its issue or pull request here.

# Behaviour

| Case | Behaviour |
|---|---|
| Every answer of the API | Validated with Zod; anything that does not parse is the `failed` outcome, never a crash |
| Every auth request | Sent with credentials (`withCredentials: true` on that request, not on the shared `apiClient`), so the session and pending cookies go out and come back. The survey and result requests stay without them, so the API cannot join an account to answers |
| `getSession` with no session | `null` |
| `getSession` unreachable or timing out | Rejects; the session provider treats it as signed out |
| The provider window is closed by the person | `window-closed` |
| The window is blocked | The full-page redirect with `returnTo` |
| `resumeSignIn` after the redirect | The outcome of that sign-in; `null` when there is none |
| `signIn` aborted through `signal` | The window is closed, the outcome is `window-closed`, and the API is asked to undo whatever the sign-in started |
| `signOut` cannot reach the API | Rejects |
| The provider refuses, times out, permissions denied | `provider-failed` |
| Network failure, 5xx, unknown answer | `failed` |
| `completeSignUp` after 15 minutes | `expired` |

# Out of scope

- Any screen.
- The API itself (another repository).

# Files to create

```txt
src/services/api/client/auth/createApiAuthClient.ts
src/services/api/client/auth/createApiAuthClient.test.ts
src/services/api/client/auth/openProviderWindow.ts
src/services/api/schemas/auth.ts
src/services/api/utils/auth/toAuthAccount.ts
src/services/api/utils/auth/toSignInOutcome.ts
```

`src/services/auth/client/authClient.ts` switches to the API client. The stand-in stays for the stories and the tests.

# Unit test cases (BDD)

```ts
describe("createApiAuthClient", () => {
  it("Given a session cookie, When getSession is called, Then the account is returned");
  it("Given any auth request, When it is sent, Then it carries credentials, and a survey request of apiClient does not");
  it("Given no session, When getSession is called, Then null is returned");
  it("Given the API is unreachable, When getSession is called, Then it rejects");
  it("Given each answer of a provider sign-in, When it arrives, Then it maps to its outcome");
  it("Given an answer that does not parse, When it arrives, Then the outcome is failed");
  it("Given the window is closed, When the sign-in settles, Then the outcome is window-closed");
  it("Given the window is blocked, When the sign-in starts, Then the page goes to the provider with returnTo");
  it("Given an expired pending sign-up, When completeSignUp is called, Then the outcome is expired");
  it("Given a session, When signOut is called, Then the API ends it");
  it("Given the API cannot be reached, When signOut is called, Then it rejects");
  it("Given a redirect came back, When resumeSignIn is called, Then the outcome of that sign-in is returned");
  it("Given a sign-in is aborted, When the signal fires, Then the window closes and the API undoes the sign-in");
});
```

# Remember about standards
- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Every API answer validated with Zod; the Axios instance of `src/services/api/client/apiClient.ts`, never a new one
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)
- Name the branch `feature/auth-api-207`, following [Conventional Branch](https://conventional-branch.github.io/) - never keep a generated or default branch name

# Dependencies

- [AuthSession](https://github.com/gi-org-pl/mypolitics-app/issues/204) - the interface.
- **The API changes** for accounts, sessions and provider sign-in - not started.

# Resources
- [Spec: Sign-in](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/platform/sign-in.md)
- [Doc: Sign-in](https://github.com/gi-org-pl/product/blob/main/mypolitics/docs/platform/sign-in.md)
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Vitest docs](https://vitest.dev/guide/)

# Definition of Done
- [ ] Unit tests added, BDD style, coverage ≥95% on changed files
- [ ] API responses validated with Zod
- [ ] Biome lint clean, TypeScript clean
- [ ] Only the adapter, its schemas and `authClient.ts` changed
- [ ] The e2e of the sign-in page and the dialog still pass against a mocked API
- [ ] Signing in, signing up, account exists and signing out checked by hand against the API with each provider, from the app's own origin (the cookies cross from `api.mypolitics.pl`)
- [ ] CI green: build, lint, test, e2e
