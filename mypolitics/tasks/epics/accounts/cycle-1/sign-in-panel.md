<img alt="The sign-in card, the account that exists with another provider, and the step that completes a new account" src="https://raw.githubusercontent.com/gi-org-pl/product/main/mypolitics/assets/sign-in.png" />

# Story

As a person who wants to create a quiz, I want one card with "Kontynuuj z Google", "Kontynuuj z Facebookiem" and "Kontynuuj z X", which tells me what is happening while the provider's window is open and what went wrong when it fails, so that I can get into my account in one press and always know what to do next.

# Component properties

**Name:** `SignInPanel`, built on a card frame `AuthCard`
**Location:** `src/components/account/SignInPanel/`, `src/components/account/AuthCard/`
**Shared:** no - domain `account`. `AuthCard` is its own component because the "Prawie gotowe" step ([AccountSetupForm](https://github.com/gi-org-pl/mypolitics-app/issues/206)) is drawn in the same card

`SignInPanel` only draws. It makes no request and holds no state of the sign-in: what it shows comes in through `view`, and a press goes out through a callback. [SignInFlow](https://github.com/gi-org-pl/mypolitics-app/issues/208) drives it.

```ts
// src/components/account/AuthCard/AuthCard.types.ts
export interface AuthCardProps {
  heading: string;
  description: ReactNode;
  headingId?: string;             // for a dialog to be named by the heading
  descriptionId?: string;         // and described by the line
  onClose?: () => void;           // when given, a round close button stands in the header box
  className?: string;             // the dialog adjusts the corners and the width
  children: ReactNode;
}

// src/components/account/SignInPanel/SignInPanel.types.ts
export type SignInError =
  | { kind: "window-closed"; provider: IdentityProvider }
  | { kind: "provider-failed"; provider: IdentityProvider }
  | { kind: "failed" };

export type SignInPanelView =
  | { kind: "choose"; waitingFor?: IdentityProvider; error?: SignInError }
  | { kind: "account-exists"; provider: IdentityProvider; ownerProvider: IdentityProvider; email: string; isWaiting?: boolean };

export interface SignInPanelProps {
  heading: string;                // the page's or the action's heading, for the "choose" view
  description: string;            // the page's or the action's line, for the "choose" view
  view: SignInPanelView;
  termsHref: string;
  privacyHref: string;
  headingId?: string;
  descriptionId?: string;
  onClose?: () => void;
  onProviderSelect: (provider: IdentityProvider) => void;
  onChooseAnother: () => void;    // "Wybierz inny sposób"
}
```

The provider names, labels and marks are one constant list in `src/constants/auth.ts`, in the order Google, Facebook, X, so that a later provider is one more row.

# Behaviour

The spec is the source of truth for every case: [Sign-in](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/platform/sign-in.md), sections "Providers", "Texts", "The sign-in card" and "States and lifecycle". The Figma frames are the source of truth for sizes, spacing and type.

| Case | Behaviour |
|---|---|
| `choose`, nothing waiting | The header box with `heading` and `description`, three provider buttons, the "Regulamin" and "Polityka prywatności" links (new tab) |
| `choose`, `waitingFor` set | That button keeps its mark, reads "Czekamy na {provider}…" with a spinner at its right edge, and is marked busy; the other two are disabled and drawn at 40% |
| `choose`, `error` set | The red error box above the buttons, with the title and the line of the spec's "Texts" for that error and provider; announced when it appears |
| `account-exists` | Heading "To konto już istnieje", the line naming the e-mail, the owning provider and the new one; one button "Zaloguj się przez {owner}" and the quiet "Wybierz inny sposób"; no terms links |
| `account-exists`, `isWaiting` | The owner's button waits as above; "Wybierz inny sposób" is disabled |
| `onClose` given | The round white close button "Zamknij" at the top right of the header box |
| A button pressed while waiting | Nothing |

# Athena components to use

- `Button` for the provider buttons (`outlined`, made 48 px tall with the app's tall-button class like the other pills, white with the dark-ash hairline of the frame) and for "Wybierz inny sposób" (the quiet button, as in the e-mail card). Its `isLoading` draws its own spinner in place of the label; the frame keeps the label and puts the spinner at the right edge, so draw the spinner as an icon instead.
- Not `InfoMessage` for the error box: its look is not the frame's red outlined box with a bold title. Draw the box as the frame does.
- Look at `SurveyEmailCapture` before starting: its header box, its quiet button and its link styles are the same family, and the card should read as a sibling of it.

# Out of scope

- Opening provider windows, outcomes, state: [SignInFlow](https://github.com/gi-org-pl/mypolitics-app/issues/208) and [AuthSession](https://github.com/gi-org-pl/mypolitics-app/issues/204).
- The "Prawie gotowe" step: [AccountSetupForm](https://github.com/gi-org-pl/mypolitics-app/issues/206).
- The modal and the bottom sheet: [AuthDialog](https://github.com/gi-org-pl/mypolitics-app/issues/209).

# Files to create

```txt
src/constants/auth.ts
src/assets/icons/google-mark.svg
src/assets/icons/facebook-mark.svg
src/assets/icons/x-mark.svg
src/components/account/AuthCard/AuthCard.tsx
src/components/account/AuthCard/AuthCard.types.ts
src/components/account/AuthCard/AuthCard.test.tsx
src/components/account/SignInPanel/SignInPanel.tsx
src/components/account/SignInPanel/SignInPanel.types.ts
src/components/account/SignInPanel/SignInPanel.test.tsx
src/components/account/SignInPanel/SignInPanel.stories.tsx
src/components/account/SignInPanel/SignInProviderButton/SignInProviderButton.tsx
src/components/account/SignInPanel/SignInPanelError/SignInPanelError.tsx
```

# Unit test cases (BDD)

```ts
describe("SignInPanel", () => {
  it("Given the choose view, When it renders, Then it shows the heading, the line and the three providers in order");
  it("Given the choose view, When a provider is pressed, Then onProviderSelect gets that provider");
  it("Given Google is waited for, When it renders, Then its button reads 'Czekamy na Google…' and the other two are disabled");
  it("Given a provider is waited for, When any button is pressed, Then nothing is called");
  it("Given a window-closed error for Facebook, When it renders, Then the alert reads 'Logowanie przerwane' and names Facebook");
  it("Given a provider-failed error for X, When it renders, Then the alert reads 'X nie odpowiada'");
  it("Given a failed error, When it renders, Then the alert reads 'Coś poszło nie tak'");
  it("Given account-exists owned by Google for Facebook, When it renders, Then it names the e-mail and offers only 'Zaloguj się przez Google'");
  it("Given account-exists, When 'Wybierz inny sposób' is pressed, Then onChooseAnother is called");
  it("Given account-exists, When it renders, Then the terms links are not shown");
  it("Given the choose view, When it renders, Then the terms and privacy links open in a new tab");
});

describe("AuthCard", () => {
  it("Given onClose, When the close button is pressed, Then onClose is called");
  it("Given no onClose, When it renders, Then there is no close button");
  it("Given heading and line ids, When it renders, Then the heading and the line carry them");
});
```

# Storybook stories

In the order of the frames:

1. `Default` - [Login / Desktop / Default](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=6017-108837), [Mobile](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=6017-108981)
2. `WaitingForGoogle` - [Desktop](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=6017-109107), [Mobile](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=6017-109254)
3. `WindowClosed` - [Mobile](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=6017-109383)
4. `ProviderFailed` - [Desktop](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=6017-109641), [Mobile](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=6017-109512)
5. `Failed` - not drawn; the provider-failed box with the spec's text
6. `AccountExists` - [Desktop](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=6017-109788), [Mobile](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=6017-109916)
7. `WithCloseButton` - the dialog's header, [Utwórz quiz / Desktop](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=6017-110026)

# Remember about standards
- Use the standard colors palette, never add colors directly (check https://tailwindcss.com/docs/colors and our color palette in the `src/index.css` file and in [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css)). The provider marks keep the providers' own colours: they are pictures, not palette colours
- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Create a Storybook story for the component with all possible props variants of the component
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)
- All texts through Lingui; run `yarn i18n:extract` and commit the catalogues
- Name the branch `feature/sign-in-panel-205`, following [Conventional Branch](https://conventional-branch.github.io/) - never keep a generated or default branch name

# Dependencies

- [AuthSession](https://github.com/gi-org-pl/mypolitics-app/issues/204) - the `IdentityProvider` type.

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
- [ ] Every state matches its frame on a desktop and a 360 px phone, and reads as a sibling of the e-mail card
- [ ] The waiting, error and account-exists cases of the spec each have a test
- [ ] CI green: build, lint, test
