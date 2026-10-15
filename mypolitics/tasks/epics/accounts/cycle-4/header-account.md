<img alt="The sign-in card, the account that exists with another provider, and the step that completes a new account" src="https://raw.githubusercontent.com/gi-org-pl/product/main/mypolitics/assets/sign-in.png" />

# Story

As a person on any page, I want the header to offer "Zaloguj się" when I am signed out and to show who I am, with a way to sign out, when I am signed in, so that I always know whether I am in my account.

# Component properties

**Name:** `HeaderAccount`, a subcomponent of `Header`
**Location:** `src/components/shared/Header/HeaderAccount/`
**Shared:** yes, as part of the shared `Header`

```ts
// src/components/shared/Header/HeaderAccount/HeaderAccount.types.ts
export interface HeaderAccountProps {
  variant: "bar" | "menu";        // the wide header, or the phone menu - as HeaderNav
  onNavigate?: () => void;        // closes the phone menu
}
```

It reads the session with `useAuthSession` and draws one of three things: nothing (session unknown), "Zaloguj się", or the account. The account pill and the menu use Athena's `Avatar` with the photo, falling back to the initials of `getInitials`.

# Behaviour

The spec is the source of truth for every case: [Sign-in](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/platform/sign-in.md), section "The header". The Figma frames are the source of truth for sizes, spacing and type.

| Case | Behaviour |
|---|---|
| Session unknown | Nothing in the account place |
| Signed out, bar | A thin divider after the navigation pills, then "Zaloguj się" as the filled pill, linking to `PATHS.signIn(current path)` |
| Signed out, phone menu | "Zaloguj się" as the last pill, drawn like the navigation pills |
| Signed in, bar | A pill with the avatar and the display name (cut with an ellipsis when long). It opens the account menu below it; it is a menu button (`aria-haspopup`, `aria-expanded`) |
| The account menu | Avatar, name, the provider mark with the e-mail (the mark alone without one), a divider, "Wyloguj się" |
| Menu closes | On "Wyloguj się", on Escape (focus back to the pill), on a press outside |
| Signed in, phone menu | A row with the avatar and the name, then "Wyloguj się" as a white pill with a hairline outline |
| "Wyloguj się" | `signOut()`; the header shows "Zaloguj się"; the page stays (a page under `RequireAuth` sends the person home by itself) |
| No photo, or the photo fails | The initials |

"Moje quizy" and "Konto i logowanie" are drawn in the frame but their pages do not exist yet, so they are not added here: the tasks of those pages add their entries to the menu.

# Athena components to use

- `Button` for "Zaloguj się", the account pill and "Wyloguj się", in the header's existing pill styles (`HeaderNavItem`).
- `Avatar` for the avatar, with `fallback="initials"`. If its initials differ from the spec's rule (first letters of the first two words), pass the initials it should show rather than the full name.
- Not `ActionList` for the menu: it has no place for the account summary at the top. A small menu with `role="menu"` items is enough.
- Look at `HeaderNav` and `useHeaderMenu` first: the account menu closes like the phone menu does, and the pills must read as the same family.

# Out of scope

- The `/login` page: [SignInPage](#).
- "Moje quizy", "Konto i logowanie".

# Files to create

```txt
src/components/shared/Header/HeaderAccount/HeaderAccount.tsx
src/components/shared/Header/HeaderAccount/HeaderAccount.types.ts
src/components/shared/Header/HeaderAccount/HeaderAccount.test.tsx
src/components/shared/Header/HeaderAccount/HeaderAccount.stories.tsx
src/components/shared/Header/HeaderAccount/HeaderAccountMenu/HeaderAccountMenu.tsx
src/components/shared/Header/HeaderAccount/utils/useAccountMenu.ts
```

`Header.tsx` places it after `HeaderNav` in the bar and at the end of the phone menu. `Header.stories.tsx` gains signed-out and signed-in stories.

# Unit test cases (BDD)

```ts
describe("HeaderAccount", () => {
  it("Given an unknown session, When it renders, Then nothing is shown");
  it("Given a signed-out session on /quizzes/mypolitics, When it renders, Then 'Zaloguj się' links to /login?next=%2Fquizzes%2Fmypolitics");
  it("Given a signed-in session, When it renders, Then the pill shows the initials and the name");
  it("Given a photo, When it renders, Then the avatar shows the photo");
  it("Given the pill, When it is pressed, Then the menu opens with the name, the provider and the e-mail");
  it("Given no e-mail, When the menu opens, Then only the provider mark is shown");
  it("Given the menu, When Escape is pressed, Then it closes and focus returns to the pill");
  it("Given the menu, When 'Wyloguj się' is pressed, Then the session is signed out and 'Zaloguj się' is shown");
  it("Given the phone menu signed in, When it renders, Then the name row and 'Wyloguj się' are shown");
});
```

# Storybook stories

In the order of the frames:

1. `BarSignedOut` - [Header / Desktop / Signed out](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=6014-54961)
2. `BarSignedInMenuOpen` - [Header / Desktop / Signed in - account menu open](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=6014-55479)
3. `MenuSignedOut` - [Header / Mobile / Signed out - menu open](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=6014-53962)
4. `MenuSignedIn` - [Header / Mobile / Signed in - menu open](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=6014-54009)
5. `LongName`, `WithPhoto`, `WithoutEmail` - not drawn

# Remember about standards
- Use the standard colors palette, never add colors directly (check https://tailwindcss.com/docs/colors and our color palette in the `src/index.css` file and in [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css))
- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Create a Storybook story for the component with all possible props variants of the component
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)
- All texts through Lingui; run `yarn i18n:extract` and commit the catalogues
- Name the branch `feature/header-account-{issue number}`, following [Conventional Branch](https://conventional-branch.github.io/) - never keep a generated or default branch name

# Dependencies

- [AuthSession](#), [AccountSetupForm](#) (`getInitials`), [SignInPage](#) (the `/login` address).

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
- [ ] Biome lint clean, TypeScript clean
- [ ] Storybook story per state above
- [ ] All texts in Lingui macros, `.po` files committed
- [ ] The four frames matched at 1440 px and 360 px; the pills read as one family with the navigation
- [ ] The existing layout e2e still passes
- [ ] CI green: build, lint, test, e2e
