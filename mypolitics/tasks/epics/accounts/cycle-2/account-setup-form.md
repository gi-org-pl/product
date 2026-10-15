<img alt="The sign-in card, the account that exists with another provider, and the step that completes a new account" src="https://raw.githubusercontent.com/gi-org-pl/product/main/mypolitics/assets/sign-in.png" />

# Story

As a person signing in to myPolitics for the first time, I want to confirm the name my quizzes will be signed with, declare that I am 16 or older and accept the terms, so that my account is created only when I say so - and to be able to walk away with nothing saved.

# Component properties

**Name:** `AccountSetupForm` - the "Prawie gotowe" step
**Location:** `src/components/account/AccountSetupForm/`
**Shared:** no - domain `account`

It only draws and checks. It makes no request: "Gotowe" hands a valid `AccountSetup` out, and [SignInFlow](https://github.com/gi-org-pl/mypolitics-app/issues/208) saves it.

```ts
// src/components/account/AccountSetupForm/AccountSetupForm.types.ts
export interface AccountSetupFormProps {
  provider: IdentityProvider;       // named in the privacy promise
  suggestedName?: string;           // the field starts with it, cut to 50 characters
  isSaving?: boolean;               // "Gotowe" waits, nothing can be changed
  hasSaveFailed?: boolean;          // "Nie udało się zapisać konta. Spróbuj jeszcze raz."
  termsHref: string;
  privacyHref: string;
  headingId?: string;
  descriptionId?: string;
  onClose?: () => void;             // the dialog's close button
  onSubmit: (setup: AccountSetup) => void;
  onCancel: () => void;             // "Anuluj"
}
```

The name rules are one util, `src/utils/auth/toDisplayName.ts`, which the step uses to clean what is typed and the header uses for the initials (`src/utils/auth/getInitials.ts`).

# Behaviour

The spec is the source of truth for every case: [Sign-in](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/platform/sign-in.md), sections "Texts", "The 'Prawie gotowe' step" and "Invalid and edge input". The Figma frames are the source of truth for sizes, spacing and type.

| Case | Behaviour |
|---|---|
| The step opens | Heading "Prawie gotowe", its line, the "Nazwa" field with the suggested name, two unticked boxes, the promise naming the provider, "Gotowe" (filled) and "Anuluj" (quiet). Nothing is focused, so a phone keyboard does not cover the step |
| No suggested name | The field is empty |
| "Gotowe" with a valid name and both boxes | `onSubmit` with the cleaned name and both declarations |
| "Gotowe" with something missing | `onSubmit` is not called; each missing item shows its message from the spec in red under it; focus moves to the first one |
| A message's item is fixed | That message disappears at once |
| Name of spaces only / one character | The spec's two messages |
| Over 50 characters typed or pasted | The field holds 50 |
| Line breaks, tabs, control characters pasted | Removed; runs of spaces inside become one on submit |
| Enter in the name field | Same as "Gotowe" |
| `isSaving` | "Gotowe" shows a spinner and is busy; the field, the boxes and "Anuluj" are disabled |
| `hasSaveFailed` | The error line above the buttons, announced |
| "Anuluj" | `onCancel` |
| The links in the terms sentence | Open in a new tab and never tick the box |

"Gotowe" is always the filled button, as both frames draw it: the step says what is missing instead of greying it out.

# Athena components to use

- `Input` for the name, styled like the e-mail field of `SurveyEmailCapture` (white, 16 px corner, hairline border, bold text).
- `Checkbox` for the two declarations, laid out like the consent of `SurveyEmailCapture` - the box at the start of the first line and links inside the sentence that do not toggle it. Reuse its class constants rather than copying them, promoting them to `src/constants/` if two components now use them.
- `Button` for "Gotowe" (primary, the app's tall pill) and "Anuluj" (the quiet button).

# Out of scope

- Saving the account and what happens after: [SignInFlow](https://github.com/gi-org-pl/mypolitics-app/issues/208).
- Changing the name later: the "Konto i logowanie" page, not designed yet.

# Files to create

```txt
src/components/account/AccountSetupForm/AccountSetupForm.tsx
src/components/account/AccountSetupForm/AccountSetupForm.types.ts
src/components/account/AccountSetupForm/AccountSetupForm.test.tsx
src/components/account/AccountSetupForm/AccountSetupForm.stories.tsx
src/components/account/AccountSetupForm/AccountSetupFormConsents/AccountSetupFormConsents.tsx
src/components/account/AccountSetupForm/utils/useAccountSetup.ts
src/utils/auth/toDisplayName.ts
src/utils/auth/toDisplayName.test.ts
src/utils/auth/getInitials.ts
src/utils/auth/getInitials.test.ts
```

# Unit test cases (BDD)

```ts
describe("AccountSetupForm", () => {
  it("Given a suggested name, When the step opens, Then the field holds it and both boxes are unticked");
  it("Given no suggested name, When the step opens, Then the field is empty");
  it("Given a valid name and both boxes, When 'Gotowe' is pressed, Then onSubmit gets the cleaned name");
  it("Given an empty name, When 'Gotowe' is pressed, Then the missing-name message shows and the field is focused");
  it("Given a one-character name, When 'Gotowe' is pressed, Then the too-short message shows");
  it("Given the age box unticked, When 'Gotowe' is pressed, Then the age message shows and onSubmit is not called");
  it("Given the terms box unticked, When 'Gotowe' is pressed, Then the terms message shows");
  it("Given a message is shown, When its item is fixed, Then the message disappears");
  it("Given the name field, When Enter is pressed, Then it acts as 'Gotowe'");
  it("Given isSaving, When it renders, Then 'Gotowe' is busy and the controls are disabled");
  it("Given hasSaveFailed, When it renders, Then the save error is announced");
  it("Given the step, When 'Anuluj' is pressed, Then onCancel is called");
  it("Given each provider, When it renders, Then the promise names that provider");
  it("Given the terms sentence, When a link is pressed, Then the box stays unticked");
});

describe("toDisplayName", () => {
  it("Given spaces around and inside, When cleaned, Then it is trimmed with single spaces");
  it("Given control characters and line breaks, When cleaned, Then they are removed");
  it("Given more than 50 characters, When cleaned, Then it is cut to 50");
});

describe("getInitials", () => {
  it("Given 'Ala Nowak', When the initials are taken, Then they are 'AN'");
  it("Given one word, When the initials are taken, Then it is its first letter in capitals");
  it("Given three words, When the initials are taken, Then only the first two count");
});
```

# Storybook stories

In the order of the frames:

1. `Default` - [First run / Mobile / Default](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=6014-53726), [Desktop](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=6014-55346)
2. `Filled` - [First run / Mobile / Filled](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=6014-53844)
3. `Missing` - not drawn; all three messages after "Gotowe" on an empty step
4. `Saving` - not drawn
5. `SaveFailed` - not drawn
6. `Facebook` and `X` - the promise for the other providers

# Remember about standards
- Use the standard colors palette, never add colors directly (check https://tailwindcss.com/docs/colors and our color palette in the `src/index.css` file and in [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css))
- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Create a Storybook story for the component with all possible props variants of the component
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)
- All texts through Lingui; run `yarn i18n:extract` and commit the catalogues
- Name the branch `feature/account-setup-form-206`, following [Conventional Branch](https://conventional-branch.github.io/) - never keep a generated or default branch name

# Dependencies

- [SignInPanel](https://github.com/gi-org-pl/mypolitics-app/issues/205) - `AuthCard`, the provider list.

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
- [ ] Both frames matched on a desktop and a 360 px phone, and the field and the consents read as siblings of the e-mail card
- [ ] Every row of the spec's "Invalid and edge input" about the name has a test
- [ ] CI green: build, lint, test
