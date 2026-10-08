<img alt="The e-mail card empty, and with an address entered" src="https://raw.githubusercontent.com/gi-org-pl/product/main/mypolitics/assets/results-saving-and-marketing.png" />

# Story

As a user who has just finished a quiz, I want to be offered the link to my results by e-mail - with one field, one optional consent and one button that skips or sends - so that I can come back to my results later without being held back from them now.

# Replaces

This is the task promised when [#35](https://github.com/gi-org-pl/mypolitics-app/issues/35) (`SurveyNewsletter`) was closed. That card was the myPolitics 1.0 newsletter sign-up; this one offers the results link. Start from `main` and reuse nothing of #35 or of its pull request [#45](https://github.com/gi-org-pl/mypolitics-app/pull/45).

# Component properties

**Component:** `SurveyEmailCapture` - the e-mail card, with its one button
**Location:** `src/components/survey/SurveyEmailCapture/`
**Shared:** no - domain component under `survey`

The task delivers four things:

1. **The card** `SurveyEmailCapture` - presentational and controlled. It collects an address and a consent and makes no request.
2. **The phase** - `SurveyQuestionnaireEmailCapture`, the content of the `email-capture` phase, registered in `SURVEY_PHASE_CONTENT` of `survey-questionnaire`.
3. **The switch** - `SURVEY_SESSION_CONFIG.isEmailSendingSetUp` becomes true when the build has an `https` address in `VITE_RESULTS_EMAIL_URL`.
4. **The call** - `requestResultLink` in the API client. This task builds and tests it and **never calls it**: `survey-results-calculation` calls it, after the result exists.

```ts
// src/components/survey/SurveyEmailCapture/SurveyEmailCapture.types.ts
export interface SurveyEmailCaptureProps {
  address: string;                              // the text of the field, as typed
  hasConsent: boolean;
  privacyPolicyHref: string;                    // the app's privacy page
  onAddressChange: (address: string) => void;
  onConsentChange: (hasConsent: boolean) => void;
  onSubmit: (address: string) => void;          // a valid address was confirmed, by the button or by Enter - the address trimmed
  onSkip: () => void;                           // "Pomiń"
}
```

The only state the card owns is whether the hint under the field is shown.

```ts
// src/components/survey/SurveyQuestionnaire/SurveyQuestionnaireSession/SurveyQuestionnaireEmailCapture/SurveyQuestionnaireEmailCapture.tsx
// Takes SurveyPhaseContentProps like every phase, and is registered as
//   SURVEY_PHASE_CONTENT["email-capture"] = SurveyQuestionnaireEmailCapture
// in SurveyQuestionnaireSession.constants.ts.
```

```ts
// src/types/survey.ts - added
export type ResultLinkLanguage = "pl" | "en";

export interface ResultLinkInput {
  email: string;               // the address
  resultId: string;            // the session identifier - the result the link opens
  marketingConsent: boolean;   // SurveyEmail.hasConsent
  language: ResultLinkLanguage;
}

export type ResultLinkOutcome =
  | "accepted"     // 202
  | "invalid"      // 400
  | "limited"      // 429
  | "unavailable"; // 503, any other reply, no connection, no reply in time, no endpoint configured
```

```ts
// src/constants/survey.ts - added, and one constant of survey-session changed
export const RESULT_LINK_URL: string | undefined = getResultLinkUrl(import.meta.env.VITE_RESULTS_EMAIL_URL);
export const RESULT_LINK_TIMEOUT_MS = 10_000;
export const EMAIL_CONSENT_WORDING = "marketing-v1"; // names the consent text of the card; changes whenever that text changes
export const EMAIL_MAX_LENGTH = 254;

export const SURVEY_SESSION_CONFIG: SurveySessionConfig = {
  isEmailSendingSetUp: RESULT_LINK_URL !== undefined, // was `false`
};
```

```ts
// src/utils/survey/getResultLinkUrl.ts
export const getResultLinkUrl = (value?: string | null): string | undefined => ...

// src/utils/text/isEmailAddress.ts
export const isEmailAddress = (text: string): boolean => ...

// src/services/api/client/requestResultLink.ts
export const requestResultLink = (
  input: ResultLinkInput,
  options?: ApiRequestOptions, // timeoutMs defaults to RESULT_LINK_TIMEOUT_MS
): Promise<ResultLinkOutcome> => ...
```

`requestResultLink` never rejects, like the three calls of `survey-api`.

### Who builds what

The e-mail phase and the loader meet in one request. So that nothing is built twice:

| Piece | Built by |
|---|---|
| The card: field, consent, promise, button, hint, what counts as a valid address | This task |
| The content of the `email-capture` phase and its registration | This task |
| Reading `VITE_RESULTS_EMAIL_URL`, `RESULT_LINK_URL`, turning `isEmailSendingSetUp` on | This task |
| `requestResultLink`, `ResultLinkInput`, `ResultLinkOutcome`, the body of the request, its time limit, the consent wording | This task |
| Calling `requestResultLink`: when, with what, at most once, dropping the address afterwards, the "link not sent" notice | `survey-results-calculation` |
| Whether the phase is part of a session, the under-18 rule included (`isPhaseInSession`), dropping an address when the phase falls out, holding the address in memory only, back and reset | `survey-session` - built. This task only turns the switch |
| The bar, the pill "Prawie koniec!", the back control named "Wróć", reset (`getSurveyFrame`) | `survey-questionnaire` - built |

# Behaviour

The [spec](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/results-saving-and-marketing.md) is the source of truth for every case below; this task builds its front-end half. The [Figma frame](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5516-70263) is the source of truth for sizes, spacing, type and colours: follow it.

### The switch - `getResultLinkUrl`, `RESULT_LINK_URL`

| `VITE_RESULTS_EMAIL_URL` | `RESULT_LINK_URL` | The phase |
|---|---|---|
| Not set, empty or only space | `undefined` | Off |
| Not a web address | `undefined` | Off |
| A web address that is not `https` - `http://...` included | `undefined` | Off |
| An `https` address, with or without space around it | The address, trimmed | On |

| Case | Behaviour |
|---|---|
| When it is read | Once, when the app starts. It is a value of the build: nothing re-reads it during a session |
| Turning the phase on or off | Setting or removing the variable. No code change |
| Building on what exists | `toWebAddress` already tells a web address from other text; add the `https` condition on top of it |

Type the variable in `src/vite-env.d.ts`, next to `VITE_API_URL`.

**Do not set the variable in any deployed environment before `survey-results-calculation` is merged.** Until then nothing makes the request, and a card that promises a link nobody sends is exactly what the spec forbids ("never pretend"). The task itself is safe to merge: with the variable unset the questionnaire runs as before.

### Whether the phase is part of the session

Decided by `isPhaseInSession` of `survey-session`, which reads `SURVEY_SESSION_CONFIG`. Nothing is decided in this task; the rows are here because this task makes them reachable and proves them.

| Case | Behaviour |
|---|---|
| No endpoint address is configured | The phase does not exist. Demographics lead straight to results calculation, and nothing on screen hints that a card is missing |
| An endpoint address is configured | The phase is shown after demographics, whether demographics were given or skipped |
| The taker picked an age under 18 - any of the years 13 to 17; the list has no "under 18" entry | The phase is left out for this session, whichever button demographics was left with |
| The taker skipped demographics without picking an age | The phase is shown. Nobody is asked their age in order to leave an e-mail |
| The taker types an address, goes back, and picks an age under 18 | The phase is left out when they come forward again. What was typed and ticked is dropped, and no link is requested |
| A refresh on this card | The session restores on the card. The field is empty and the box unticked: the address was never stored |

### The phase - `SurveyQuestionnaireEmailCapture`

| Case | Behaviour |
|---|---|
| The phase opens | The card shows what the session holds: the address and the consent of `session.session.email`, or an empty field and an unticked box when it is `null` |
| The field or the box changes | `session.setEmail({ address, hasConsent })` with the text as typed. The session keeps it in memory only |
| `onSubmit(address)` | `session.setEmail({ address, hasConsent })` with the trimmed address, then `session.leaveEmailCapture(true)`. Results calculation follows |
| `onSkip()` | `session.leaveEmailCapture(false)`. The session drops what was typed and ticked. Results calculation follows |
| Either is called twice quickly | The phase finishes once: the actions of the session apply only in this phase |
| Back | Demographics. The taker comes forward again to the same text and the same tick |
| Reset, confirmed | A new session in the first phase, with nothing typed or ticked |
| `privacyPolicyHref` | `PATHS.privacy` |
| A request | None. Nothing in this phase calls `requestResultLink` or any other request |

### The button

One button in every state.

| Case | Behaviour |
|---|---|
| The field is empty, or holds only space | "Pomiń", drawn as the quiet text button of the frame |
| The field holds text that is not a valid address | "Pomiń" |
| The field holds a valid address | "Wyślij i zobacz wyniki", drawn as the filled button. "Pomiń" is not drawn |
| The address stops being valid while typing | The button turns back into "Pomiń" at once |
| The box is ticked or unticked | The button does not change. Consent never enables, disables or renames it |
| "Pomiń" pressed | `onSkip()` |
| "Wyślij i zobacz wyniki" pressed | `onSubmit` with the trimmed address |
| The taker wants to skip with a valid address in the field | They clear the field, and "Pomiń" returns |
| The change of the label | It is the same button with another name, so assistive technology reads the new one and focus is not lost. Do not swap two buttons |

The card never says that a link was sent, and it has no waiting state and no failed state: it makes no request.

### The field

| Case | Behaviour |
|---|---|
| The card opens | The field shows the placeholder and is not focused by the card - no `autoFocus` - so a phone keyboard does not cover the promise and the button |
| The taker types or pastes, or the browser fills the field in | `onAddressChange` after every change; the button follows the validity of the text |
| The field loses focus holding text that is not a valid address | The hint appears under the field |
| Enter with a valid address | The same as pressing "Wyślij i zobacz wyniki" |
| Enter with text that is not a valid address | Nothing is handed over and nothing is skipped. The hint appears |
| Enter in an empty field | Nothing happens |
| The text becomes valid, or the field is emptied | The hint disappears |
| A typed address | Drawn in bold, as the frame ["e-mail entered"](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5518-95254) shows, so a slip is easier to see |
| What the browser knows about it | It is an e-mail field: the browser offers the taker's saved address and a phone shows the e-mail keyboard. The browser's own validation message is not used - the hint is the only one |

### A valid address - `isEmailAddress`

Space around the text is removed first. A filter against obvious slips, not a proof: the back-end is the final judge.

| Text | Valid |
|---|---|
| Exactly one `@`, at least one character before it, a domain after it with a dot, at least one character on each side of every dot, no whitespace, at most `EMAIL_MAX_LENGTH` characters | Yes |
| Empty, or only whitespace | No - it is an empty field |
| Space before or after an address | Yes - removed before checking |
| A space inside, as in a pasted `Jan Kowalski <jan@poczta.pl>` | No |
| Two addresses, or two `@` | No |
| No dot in the domain, a dot at its start or end, or two dots in a row | No |
| More than 254 characters | No |
| Capital letters | Yes. Handed over as typed |
| Letters outside ASCII | Yes, when the shape fits |
| A well-formed address with a typo in the domain | Yes. Nothing here can tell |

### Consent and the promise

| Case | Behaviour |
|---|---|
| The card opens in a new session | The box is unticked. The app never ticks it |
| The box or its text is pressed | The box toggles: `onConsentChange` |
| "Polityka prywatności." is pressed | The privacy page opens in a new tab. The box does not toggle and the card keeps what was typed |
| The box is ticked and the taker skips | `onSkip()`. No consent is recorded: consent without an address is nothing |
| The promise is pressed | Nothing happens. The promise is not part of the checkbox |
| The promise, for assistive technology | Read out as the description of the e-mail field, not as part of the consent |

### The request - `requestResultLink`

Built and tested here, called by `survey-results-calculation`. The contract is the spec's section "The request".

| Case | Behaviour |
|---|---|
| Called | One `POST` with a JSON body to `RESULT_LINK_URL`, through `apiClient` - an absolute address replaces the base address of the client. Do not create a second Axios instance |
| The address it is sent to | `RESULT_LINK_URL` as it is. Nothing is added to it: no query string, no path segment, no identifier |
| `email` | `input.email`, trimmed |
| `resultId` | `input.resultId` |
| `marketingConsent` | `input.marketingConsent` |
| `consentWording` | `EMAIL_CONSENT_WORDING` when `marketingConsent` is true. The key is left out otherwise |
| `language` | `input.language` |
| Anything else | Never in the body: no quiz, no answer, no demographics, no text for the message |
| `RESULT_LINK_URL` is `undefined` | No request. `unavailable` |
| The same input is sent again | A second request, and a second message. This call never repeats itself; whether to call it is the caller's decision |

| Reply | Outcome |
|---|---|
| 202 | `accepted` |
| 400 | `invalid` |
| 429 | `limited` |
| 503 | `unavailable` |
| Any other status - 200, 204 and 500 included | `unavailable` |
| No connection, no reply within `RESULT_LINK_TIMEOUT_MS`, a cancelled request | `unavailable` |

The body of a reply is never read - the status decides - so there is no Zod schema for this endpoint.

### Privacy

- The address and the tick live in the session's memory and nowhere else: not in `sessionStorage` or any other storage, not in a cookie, not in the address bar. `survey-session` already keeps them out of the stored record; add no second place.
- Nothing of the address - the text, a part of it, its domain, its length - is written to the console, to a log, to an analytics event or to an error report, by the card, the phase or the call.
- The body of the request and the address it carries are never logged by the call, on success or on failure.

### Accessibility

- The field has the accessible name "Adres e-mail" and no visible label, as in the frame.
- The hint is announced when it appears.
- The checkbox is a real checkbox named by the consent text. The privacy link is reachable on its own from the keyboard.
- Focus order follows reading order: back, reset, field, checkbox, privacy link, button.
- The phase opens with focus on the top of its content, the heading "Zapisz swoje wyniki!" - the screen does that for every phase. The heading is not a stop for the Tab key.

# Copy

Polish is the source; every string goes through a Lingui macro and the English entry is filled in. "Pomiń", "Prawie koniec!" and "Wróć" are in the catalogue already.

| Text | Polish (source) | English |
|---|---|---|
| Heading | Zapisz swoje wyniki! | Save your results! |
| Body | Wyślemy na Twój e-mail link do wyników, dzięki czemu łatwo do nich wrócisz. | We will e-mail you a link to your results, so you can easily come back to them. |
| Field placeholder | twoj@mail.com | your@mail.com |
| Field name, for assistive technology | Adres e-mail | E-mail address |
| Hint under the field | Wpisz pełny adres e-mail, na przykład twoj@mail.com. | Enter a full e-mail address, for example your@mail.com. |
| Consent | Wyrażam zgodę na przetwarzanie moich danych osobowych w celu przesyłania mi treści marketingowych przez Fundację Generacja Innowacja. | I agree to the processing of my personal data for the purpose of sending me marketing content by the Generacja Innowacja Foundation. |
| Privacy link | Polityka prywatności. | Privacy policy. |
| Promise | Dbamy o Twoją prywatność, Twoje dane osobowe (w tym adres e-mail) nigdy nie będą powiązane z danymi o Twoich poglądach. | We care about your privacy: your personal data (including your e-mail address) will never be linked to data about your views. |
| Button, no valid address | Pomiń | Skip |
| Button, valid address | Wyślij i zobacz wyniki | Send and see results |

The body is not the text of the frame. The frame reads "... dzięki czemu będziesz mógł do nich łatwo wrócić."; "będziesz mógł" addresses a man, so the source string says the same without a gendered form. List it in the PR as a deviation from the frame.

`EMAIL_CONSENT_WORDING` names the Polish consent sentence above. Whoever changes that sentence changes the identifier in the same commit.

# Athena components to use

- `Input` for the field: `type="email"`, the placeholder, the accessible name, and the hint through `helper`. Not through `errorText` and `isError` - the spec calls it a hint, and the field is not drawn in the error state.
- `Checkbox` for the consent, with the consent sentence as `label`.
- `Button` for the one button - the quiet text variant for "Pomiń", the filled one for "Wyślij i zobacz wyniki", as the two frames show. Do not build a custom button.
- Not `SurveyPhaseActions`: it always draws a main button and "Pomiń" side by side, and this phase has one button that is either.
- Not `InfoMessage` for the promise or the hint: it is a boxed message with an icon, and the frame draws both as plain text.
- No Athena component fits the box with the heading and the body.

**Two limits of Athena to work within.** Do not rebuild either component to get around them.

| Limit | What to do |
|---|---|
| `Checkbox` takes its `label` as a plain string, so the privacy link cannot sit inside the label as the frame draws it | Pass the consent sentence as `label` and draw "Polityka prywatności." as a link right after it, outside the label. That also keeps the two apart as the spec wants: pressing the link never toggles the box. List the difference from the frame in the PR; a link inside the sentence needs `label` to take a node in Athena |
| `Input` sets `aria-describedby` itself, to its own `helper`, and overrides one passed to it. Its helper text is not announced when it appears | Pass the hint through `helper` as an element that announces itself. Give the promise to the field as a description from outside - a group around the field, described by the promise - and check with a screen reader that it is read when the field takes focus. If it is not, say so in the PR and raise the change in Athena |

# Out of scope

- **Making the request, and everything after it** - when the link is requested, the "link not sent" notice, dropping the address once the endpoint has answered: `survey-results-calculation`. This task leaves the address in the session for it.
- **The back-end** - the endpoint, the message, the marketing list, rate limiting, what is logged. The spec is the contract; there is no back-end task convention in the product repo. Nothing here needs the endpoint to exist.
- **Whether the phase is part of a session** - `isPhaseInSession` in `survey-session`. Do not re-implement the age rule or the switch check in a component.
- **The bar, the pill, the name of the back control, reset and its dialog** - `survey-questionnaire` and `SurveyControls`.
- **The privacy page itself** - the card links to `PATHS.privacy`.
- **Confirming the address, sending again, an account** - not supported.
- **Analytics** - no event is sent.

# Files to create

```
src/components/survey/SurveyEmailCapture/
├── SurveyEmailCapture.tsx
├── SurveyEmailCapture.test.tsx
├── SurveyEmailCapture.types.ts
├── SurveyEmailCapture.stories.tsx
├── SurveyEmailCaptureField/                 # the field and its hint
│   ├── SurveyEmailCaptureField.tsx
│   └── SurveyEmailCaptureField.test.tsx
├── SurveyEmailCaptureConsent/               # the checkbox, the privacy link, the promise
│   ├── SurveyEmailCaptureConsent.tsx
│   └── SurveyEmailCaptureConsent.test.tsx
└── utils/
    ├── useEmailHint.ts                      # when the hint is shown
    └── useEmailHint.test.ts
src/components/survey/SurveyQuestionnaire/SurveyQuestionnaireSession/
├── SurveyQuestionnaireSession.constants.ts  # + "email-capture" in SURVEY_PHASE_CONTENT (existing file)
└── SurveyQuestionnaireEmailCapture/
    ├── SurveyQuestionnaireEmailCapture.tsx
    └── SurveyQuestionnaireEmailCapture.test.tsx
src/components/survey/SurveyQuestionnaire/SurveyQuestionnaire.stories.tsx   # + EmailCapture (existing file)
src/services/api/client/
├── requestResultLink.ts
└── requestResultLink.test.ts
src/utils/survey/
├── getResultLinkUrl.ts
└── getResultLinkUrl.test.ts
src/utils/text/
├── isEmailAddress.ts
└── isEmailAddress.test.ts
src/types/survey.ts                          # + ResultLinkLanguage, ResultLinkInput, ResultLinkOutcome (existing file)
src/constants/survey.ts                      # + the four constants, SURVEY_SESSION_CONFIG changed (existing file)
src/vite-env.d.ts                            # + VITE_RESULTS_EMAIL_URL (existing file)
playwright.config.ts                         # + the variable for the build the e2e runs against (existing file)
e2e/survey/questionnaire.spec.ts             # extended (existing file)
```

Every component folder holds its `.tsx` and `.test.tsx`; every util and hook has a test next to it. Split further where a file passes the limits of `AGENTS.md` section 3.2, and drop a file that turns out empty. `isEmailAddress` is global because it is general-purpose: text in, yes or no out, nothing of the card in it.

# Unit test cases (BDD)

```ts
describe('getResultLinkUrl()', () => {
  it('returns undefined for a missing, empty or blank value', ...);
  it('returns undefined for text that is not a web address', ...);
  it('returns undefined for an http address', ...);
  it('returns an https address, trimmed', ...);
});

describe('isEmailAddress()', () => {
  it('accepts an address with one @, a local part and a domain with a dot', ...);
  it('ignores space around the address', ...);
  it('rejects an empty text and a text of only space', ...);
  it('rejects a space inside, as in a pasted name with an address', ...);
  it('rejects two @ and two addresses', ...);
  it('rejects a domain with no dot, a dot at its start or end, and two dots in a row', ...);
  it('rejects more than 254 characters and accepts exactly 254', ...);
  it('accepts capital letters and letters outside ASCII', ...);
});

describe('requestResultLink()', () => {
  it('posts to the configured address, with nothing added to it', ...);
  it('sends email, resultId, marketingConsent and language', ...);
  it('trims the address', ...);
  it('adds the consent wording with consent, and leaves the key out without it', ...);
  it('sends nothing else', ...);
  it('resolves accepted on 202', ...);
  it('resolves invalid on 400 and limited on 429', ...);
  it('resolves unavailable on 503 and on any other status, 200 and 204 included', ...);
  it('resolves unavailable with no connection and when cancelled, without throwing', ...);
  it('gives up after RESULT_LINK_TIMEOUT_MS, and honours a time limit passed by the caller', ...);
  it('makes no request and resolves unavailable when no endpoint is configured', ...);
  it('never sends a second request by itself', ...);
  it('writes nothing to the console', ...);
});

describe('EMAIL_CONSENT_WORDING', () => {
  it('is pinned to the consent sentence of the card, so changing one without the other fails', ...);
});

describe('<SurveyEmailCapture />', () => {
  describe('given an empty field', () => {
    it('shows the heading, the body, the placeholder, the consent, the promise and "Pomiń"', ...);
    it('does not focus the field', ...);
    it('calls onSkip when "Pomiń" is pressed', ...);
  });
  describe('given text that is not a valid address', () => {
    it('keeps the button "Pomiń"', ...);
  });
  describe('given a valid address', () => {
    it('names the button "Wyślij i zobacz wyniki" and draws no "Pomiń"', ...);
    it('calls onSubmit with the trimmed address when the button is pressed', ...);
  });
  describe('when the address stops being valid', () => {
    it('turns the button back into "Pomiń", in the same element', ...);
  });
  describe('given a ticked box', () => {
    it('does not change the button, with a valid address or without one', ...);
  });
  describe('when the taker types', () => {
    it('calls onAddressChange with the text as typed', ...);
  });
  describe('accessibility', () => {
    it('names the field "Adres e-mail" and marks it as an e-mail field', ...);
    it('gives the promise to the field as its description', ...);
    it('reaches the field, the checkbox, the privacy link and the button in that order', ...);
  });
});

describe('<SurveyEmailCaptureField />', () => {
  describe('when Enter is pressed', () => {
    it('submits a valid address', ...);
    it('shows the hint and submits nothing for text that is not valid', ...);
    it('does nothing in an empty field', ...);
  });
  describe('given a shown hint', () => {
    it('announces it', ...);
  });
});

describe('useEmailHint()', () => {
  it('shows no hint at first', ...);
  it('shows the hint when the field loses focus with text that is not valid', ...);
  it('shows no hint when the field loses focus empty or valid', ...);
  it('hides the hint when the text becomes valid, and when the field is emptied', ...);
});

describe('<SurveyEmailCaptureConsent />', () => {
  it('shows an unticked box named by the consent text', ...);
  it('calls onConsentChange when the box or its text is pressed', ...);
  it('opens the privacy page in a new tab without toggling the box', ...);
  it('does nothing when the promise is pressed', ...);
});

describe('<SurveyQuestionnaireEmailCapture />', () => {
  describe('given a session with no e-mail', () => {
    it('shows an empty field and an unticked box', ...);
  });
  describe('given a session that holds an e-mail', () => {
    it('shows its address and its consent', ...);
  });
  describe('when the field or the box changes', () => {
    it('sets the e-mail of the session to what was typed and ticked', ...);
  });
  describe('when a valid address is submitted', () => {
    it('sets the trimmed address and leaves the phase as given', ...);
    it('leaves once when submitted twice', ...);
  });
  describe('when "Pomiń" is pressed', () => {
    it('leaves the phase as skipped, and the session holds no e-mail', ...);
  });
  describe('when the taker goes back and comes forward again', () => {
    it('shows the same text and the same tick', ...);
  });
  it('links the privacy page of the app', ...);
  it('makes no request', ...);
});

describe('<SurveyQuestionnaireSession />', () => {
  describe('given sending set up', () => {
    it('shows the e-mail card after demographics, given or skipped', ...);
    it('shows results calculation after demographics for a taker who picked an age under 18', ...);
    it('shows the card for a taker who skipped demographics with no age picked', ...);
    it('drops a typed address when the taker goes back and picks an age under 18', ...);
    it('draws a full bar, "Prawie koniec!" and a back control named "Wróć" on the card', ...);
  });
  describe('given sending not set up', () => {
    it('shows results calculation right after demographics', ...);
  });
});
```

Find elements by role and accessible name. Give the phase a session through `useSurveySession` on a small quiz from `createSurvey`, as the tests of `survey-questionnaire` do. A test that needs the switch on mocks `@/constants/survey` or stubs the variable before the module loads; do not add an export or a parameter that exists only for tests. Test the call with a stub adapter on `apiClient`; never call a live address.

# Storybook stories

`SurveyEmailCapture.stories.tsx` - the card alone, in the frame's order:

- `Empty` - frame ["e-mail"](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5516-70395): nothing typed, "Pomiń"
- `AddressEntered` - frame ["e-mail entered"](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5518-95254): "biuro@mypolitics.pl", "Wyślij i zobacz wyniki"

Edge:

- `NotValidYet` - "biuro@mypolitics", the field left in a `play` function: the hint shows, the button is "Pomiń"
- `ConsentTicked` - a valid address and a ticked box
- `LongAddress` - an address longer than the field is wide

`SurveyQuestionnaire.stories.tsx` - add `EmailCapture` after `DemographicsComplete`, seeded into the phase like the other stories: the full bar, "Prawie koniec!" and the card, as on the [phase strip](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5582-98197). No story makes a request.

Stories show the component alone, with no decorator, background or fixed width; check them at 320, 360 and 800 px. The consent and the promise wrap; nothing scrolls sideways.

# End-to-end test

The phase is reachable only in a build that has the variable, and Vite fixes the variable when the app is built. So **the build the e2e runs against gets one**: set `VITE_RESULTS_EMAIL_URL` to an `https` address under the reserved `.test` domain in `webServer.env` of `playwright.config.ts`, which is where that build is made (`yarn build && yarn preview`). If the CI e2e job turns out to serve a build made in another job, set the same variable on that job's build step. No test-only switch in the app.

From this task on, every scenario of `e2e/survey/questionnaire.spec.ts` runs with the phase on. The questionnaire without an endpoint - the state of production today - is then covered by unit tests only (`isPhaseInSession`, `getResultLinkUrl`, the screen test above); say so in the PR.

The API stays mocked as `survey-questionnaire` set it up. Add a route for the link endpoint and count the requests it gets.

Changed scenarios - both now pass the card:

```gherkin
  Scenario: A taker starts a quiz from the home page and reaches the result
    ...
    When they skip demographics
    Then they see the e-mail card under "Prawie koniec!", with a full progress bar and the button "Pomiń"
    When they type a valid address
    Then the button reads "Wyślij i zobacz wyniki"
    When they clear the field
    Then the button reads "Pomiń" again
    When they press "Pomiń"
    Then one result is created with the picked topic, the two answers and no demographics
    And they land on the results address that ends with the identifier that was sent

  Scenario: A taker gives demographics
    Given a user opened the quiz, skipped the topics and answered every question
    When they pick all four fields, with an age of 18 or more
    And they press "Zobacz wyniki"
    Then they see the e-mail card
    When they type a valid address and press "Wyślij i zobacz wyniki"
    Then the result is created with the four values, the age as a number, and without the address
    And no request reached the link endpoint while the card was on screen
```

New scenarios:

```gherkin
  Scenario: A taker under 18 is not asked for an address
    Given a user opened the quiz, skipped the topics and answered every question
    When they pick all four fields, with an age under 18
    And they press "Zobacz wyniki"
    Then they do not see the e-mail card
    And the result is created with the four values

  Scenario: Going back keeps what was typed
    Given a user is on the e-mail card with an address typed and the consent ticked
    When they press back
    Then they see the demographics card
    When they go forward again
    Then the field holds the same address and the box is ticked
```

Whether a link request follows the result is asserted by `survey-results-calculation`, which makes it. Until that task lands the stand-in hand-in of `survey-questionnaire` creates the result and leaves, and no link is requested. Edge cases stay in unit tests.

# Remember about standards

- Use the standard colors palette, never add colors directly (check https://tailwindcss.com/docs/colors and our color palette in the `src/index.css` file and in [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css))
- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Create a Storybook story for the component with all possible props variants of the component
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)
- Name the branch `feature/survey-email-capture-{issue number}`, following [Conventional Branch](https://conventional-branch.github.io/) - never keep a generated or default branch name
- Read `AGENTS.md` in the repository before starting: one component per file, no `renderX()` functions, helpers and hooks in `utils/` with their own tests, no import from another component's `utils/`, constants or subcomponents
- The card fills its parent's width and its height comes from its content. Layout that depends on width is CSS; do not measure the element or the window in JavaScript
- No request outside `src/services/api/client/`, and no second Axios instance. No new dependency - no form library, no validation library
- Copy is Polish by default, accessible names included. Run `yarn i18n:extract`, translate every new English entry, commit both catalogs
- Commit only files that belong to the task; commits follow Conventional Commits
- The PR follows the repository's pull request template, with screenshots of the stories next to the two frames, and lists the deviations from the frame: the body text, the place of the privacy link, the hint

# Dependencies

- `survey-questionnaire` - the screen, `SURVEY_PHASE_CONTENT`, `SurveyPhaseContentProps`, the frame of the phase, the e2e spec this task extends.
- Through it, `survey-session` (`SurveyEmail`, `setEmail`, `leaveEmailCapture`, `SURVEY_SESSION_CONFIG`, `isPhaseInSession`) and `survey-api` (`apiClient`, `ApiRequestOptions`, `src/vite-env.d.ts`).

It blocks `survey-results-calculation`, which calls `requestResultLink` and reads `session.session.email`.

No back-end work blocks it: the endpoint does not exist yet, and the phase stays off until its address is configured.

# Resources

- [Figma - E-mail](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5516-70263) - [e-mail](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5516-70395) | [e-mail entered](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5518-95254) | [the phase on the strip](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5582-98197)
- [Spec - Results saving and marketing](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/results-saving-and-marketing.md) - the front-end half: "What the card holds", "Texts", "The request", "Whether the phase is part of the session", "The button", "The field", "Consent and the promise", "Controls while the card is on screen", "The card", "Invalid and edge input", "Privacy and data handling - In the browser"
- [Spec - Phases model](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/phases-model.md) - the place of the phase and its row of the frame
- [Spec - Session and data](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/session-and-data.md) - the e-mail is never stored
- [Spec - Engaging loader](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/engaging-loader.md) - "Requesting the link": what the caller of `requestResultLink` does with it
- [Docs - Results saving and marketing](https://github.com/gi-org-pl/product/blob/main/mypolitics/docs/modules/quiz/questionnaire/results-saving-and-marketing.md), [Privacy and legal](https://github.com/gi-org-pl/product/blob/main/mypolitics/docs/platform/privacy-and-legal.md)
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Storybook docs](https://storybook.js.org/docs/writing-stories)
- [Tailwind docs](https://tailwindcss.com/docs/)
- [Vitest docs](https://vitest.dev/guide/)
- [Playwright - web server](https://playwright.dev/docs/test-webserver)

# Definition of Done

- [ ] Code follows folder structure (`docs/frontend/conventions/PROJECT_STRUCTURE.md`) and the paths of "Files to create"; components sit directly in `src/components/survey/`
- [ ] Naming follows `docs/frontend/conventions/NAMING.md`
- [ ] Component layout follows `docs/frontend/conventions/COMPONENT_STRUCTURE.md`: one component per file, no `renderX()` functions, helpers and hooks in `utils/`, each with its own test; nothing imported from another component's `utils/`, constants or subcomponents
- [ ] The phase is on only with an `https` address in `VITE_RESULTS_EMAIL_URL`; unset, empty, not a web address or `http` leaves it off, and the questionnaire then runs exactly as before
- [ ] With the phase on, the card comes after demographics given or skipped, and never for a taker who picked an age under 18
- [ ] One button: "Pomiń" until the address is valid, "Wyślij i zobacz wyniki" after, the same element in both; consent never changes it
- [ ] `isEmailAddress` follows every row of its table
- [ ] The hint shows on leaving the field or pressing Enter with text that is not valid, hides when the text is valid or empty, and is announced
- [ ] Enter submits a valid address, shows the hint for other text, and does nothing in an empty field
- [ ] The box starts unticked and toggles on the box and on its text; the privacy link opens in a new tab and toggles nothing
- [ ] Submitting hands the trimmed address and the consent to the session and leaves as given; skipping leaves with no e-mail held; each acts once
- [ ] Back and forward keep the text and the tick; a refresh and a reset empty them
- [ ] The card and the phase make no request; `requestResultLink` is not called anywhere in this task
- [ ] `requestResultLink` sends exactly the body of the table to `RESULT_LINK_URL`, reads the four replies and everything else as the table says, never rejects and never repeats itself
- [ ] Nothing of the address is stored, logged, put in the address bar or sent anywhere by this task
- [ ] `EMAIL_CONSENT_WORDING` is pinned to the consent sentence by a test
- [ ] Athena `Input`, `Checkbox` and `Button` are used; the two limits are worked within as described and listed in the PR
- [ ] The card fills its parent's width; stories checked at 320 / 360 / 800 px with no horizontal scroll
- [ ] Unit tests added, BDD style, coverage ≥95% on changed files; every subcomponent, util and hook has its own test file; elements found by role and name
- [ ] Storybook stories added for the states listed above, showing the component alone; none makes a request
- [ ] The e2e build has the variable; `e2e/survey/questionnaire.spec.ts` covers the two changed and the two new scenarios with the API, the results page and the link endpoint mocked
- [ ] Biome lint clean
- [ ] TypeScript clean (no `any`, no `@ts-ignore`)
- [ ] Every string of the Copy section goes through a Lingui macro, with Polish as the source; `yarn i18n:extract` run, English entries translated, `.po` files committed
- [ ] PR description lists decisions and deviations, says that the questionnaire without an endpoint is covered by unit tests only, and repeats that the variable must not be set in a deployed environment before `survey-results-calculation` is merged
- [ ] Branch named `feature/survey-email-capture-{issue number}`
- [ ] CI green: build, lint, test, e2e
