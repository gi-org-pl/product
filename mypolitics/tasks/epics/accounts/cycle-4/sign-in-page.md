<img alt="The sign-in card, the account that exists with another provider, and the step that completes a new account" src="https://raw.githubusercontent.com/gi-org-pl/product/main/mypolitics/assets/sign-in.png" />

# Story

As a person who presses "Zaloguj się" in the header, I want a page with the sign-in card that brings me back to where I was once I am in, so that signing in never loses my place.

# Component properties

**Name:** the `/login` route, `src/pages/login.tsx`
**Location:** `src/pages/login.tsx`, `src/constants/paths.ts`, `src/utils/url/`
**Shared:** not a component - a page

```ts
// src/constants/paths.ts - one entry added to PATHS
signIn: (next?: string) => (next ? `/login?next=${encodeURIComponent(next)}` : "/login"),

// src/utils/url/toSafeNextPath.ts
// The `next` parameter if it is a path inside the app, otherwise the home page.
export const toSafeNextPath: (next: string | null) => string;
```

# Behaviour

The spec is the source of truth for every case: [Sign-in](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/platform/sign-in.md), sections "The sign-in page" and "Invalid and edge input".

| Case | Behaviour |
|---|---|
| Opened signed out | `SignInFlow` with "Zaloguj się lub załóż konto" and its line, centred under the header, as the frames draw it. It is given `resume`, so a provider that needed the whole page and sent the person back here carries on where it ended, and `returnTo` = this page with the same `next` |
| Opened while signed in | Goes to `next` at once (replacing the history entry) |
| Opened while the session is not known | Shows nothing until it is |
| Signed in on the page | Goes to `next`, or home |
| "Anuluj" on the step | Back to the card with three providers |
| `next` missing | Home |
| `next` to another site, `//host`, a scheme, or not starting with `/` | Ignored: home |

# Athena components to use

None directly.

# Out of scope

- The "Zaloguj się" button in the header: [HeaderAccount](https://github.com/gi-org-pl/mypolitics-app/issues/211).
- The dialog: [AuthDialog](https://github.com/gi-org-pl/mypolitics-app/issues/209).

# Files to create

```txt
src/pages/login.tsx
src/pages/login.test.tsx
src/utils/url/toSafeNextPath.ts
src/utils/url/toSafeNextPath.test.ts
e2e/account/sign-in-page.spec.ts
```

# Unit test cases (BDD)

```ts
describe("SignInPage", () => {
  it("Given a signed-out visitor, When /login opens, Then the card says 'Zaloguj się lub załóż konto'");
  it("Given a signed-in person, When /login opens, Then they are sent to next");
  it("Given an unknown session, When /login opens, Then nothing is shown");
  it("Given next=/quizzes/mypolitics, When they sign in, Then they land on /quizzes/mypolitics");
  it("Given the step, When 'Anuluj' is pressed, Then the card with three providers returns");
  it("Given a provider sent the person back with a new account, When /login opens, Then 'Prawie gotowe' is shown");
});

describe("toSafeNextPath", () => {
  it("Given an app path with a query, When read, Then it is kept");
  it("Given nothing, When read, Then it is the home page");
  it("Given https://example.com, //example.com or javascript:, When read, Then it is the home page");
  it("Given a path to /login itself, When read, Then it is the home page");
});
```

E2E (`e2e/account/sign-in-page.spec.ts`), on the stand-in client:

```gherkin
Scenario: Signing in from the header brings the person back
  Given a signed-out visitor on a quiz page
  When they press "Zaloguj się" in the header
  And continue with Google and complete "Prawie gotowe"
  Then they are back on the quiz page, signed in
```

# Storybook stories

None - a page.

# Remember about standards
- Use the standard colors palette, never add colors directly (check https://tailwindcss.com/docs/colors and our color palette in the `src/index.css` file and in [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css))
- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)
- All texts through Lingui; run `yarn i18n:extract` and commit the catalogues
- Name the branch `feature/sign-in-page-210`, following [Conventional Branch](https://conventional-branch.github.io/) - never keep a generated or default branch name

# Dependencies

- [SignInFlow](https://github.com/gi-org-pl/mypolitics-app/issues/208).

# Resources
- [Spec: Sign-in](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/platform/sign-in.md)
- [Doc: Sign-in](https://github.com/gi-org-pl/product/blob/main/mypolitics/docs/platform/sign-in.md)
- [Figma: Login / Desktop / Default](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=6017-108837), [Login / Mobile / Default](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=6017-108981)
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Vitest docs](https://vitest.dev/guide/)

# Definition of Done
- [ ] Code follows folder structure and naming
- [ ] Unit tests added, BDD style, coverage ≥95% on changed files
- [ ] Playwright happy path added (Gherkin)
- [ ] Biome lint clean, TypeScript clean
- [ ] All texts in Lingui macros, `.po` files committed
- [ ] The page matches its frames at 1440 px and 360 px
- [ ] No value of `next` can send anyone outside the app
- [ ] CI green: build, lint, test, e2e
