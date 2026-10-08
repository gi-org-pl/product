<img alt="The loader and its text pool" src="https://raw.githubusercontent.com/gi-org-pl/product/main/mypolitics/assets/engaging-loader.png" />

# Story

As a user who has just left the last card of a quiz, I want to see that my results are being counted - a few short lines arriving one by one while my answers are saved - to be told plainly if something went wrong and be able to try again, and then to land on my results, so that the wait feels like part of the quiz and I never end up stuck.

# Component properties

**Component:** `SurveyResultsCalculation` - the loader card
**Location:** `src/components/survey/SurveyResultsCalculation/`
**Shared:** no - domain component under `survey`

The task delivers two things and removes one:

1. **The card** `SurveyResultsCalculation` - presentational. It draws what it is told: the lines of a run, or a message with one button, and the two result actions, always disabled. No timer, no request, no session.
2. **The phase** - `SurveyQuestionnaireResultsCalculation`, the content of the `results-calculation` phase. It runs the three steps - create the result, request the link, wait for the result - draws the lines, and leaves for the results.
3. **Removed** - `SurveyQuestionnaireHandIn`, the stand-in of `survey-questionnaire`, with its hook and its tests.

```ts
// src/components/survey/SurveyResultsCalculation/SurveyResultsCalculation.types.ts
export type SurveyResultsCalculationState =
  | "running"           // lines are on the field - also while the last line holds
  | "failed-not-saved"  // the answers could not be saved
  | "failed-not-ready"  // the result is not ready in time
  | "link-not-sent";    // the result is ready, the link could not be sent

export interface SurveyResultsCalculationProps {
  state: SurveyResultsCalculationState;
  lines: string[];          // the lines of the run so far, oldest first, passed translated. The last one is the current line
  onRetry: () => void;      // "Spróbuj ponownie", in the two failed states
  onSeeResults: () => void; // "Zobacz wyniki", on the notice
}
```

```ts
// src/components/survey/SurveyQuestionnaire/SurveyQuestionnaireSession/SurveyQuestionnaireResultsCalculation/SurveyQuestionnaireResultsCalculation.tsx
// Takes SurveyPhaseContentProps like every phase, and replaces the stand-in:
//   SURVEY_PHASE_CONTENT["results-calculation"] = SurveyQuestionnaireResultsCalculation
// in SurveyQuestionnaireSession.constants.ts.

// SurveyQuestionnaireResultsCalculation.types.ts
export type HandInState = "sending" | "created" | "calculated" | "not-saved" | "not-ready";
export type ResultLinkState = "none" | "pending" | "accepted" | "not-sent";

// SurveyQuestionnaireResultsCalculation.constants.ts
export const RESULTS_CALCULATION_POOL: readonly MessageDescriptor[]; // the 17 lines, in the order of the Copy section
export const LINE_INTERVAL_MS = 1200;
export const MIN_LINES = 5;                    // the shortest stay is MIN_LINES x LINE_INTERVAL_MS
export const MAX_LINES = 8;
export const CREATE_RESULT_TIMEOUT_MS = 10_000;
export const RESULT_READ_INTERVAL_MS = 1000;
export const RESULT_WAIT_MS = 30_000;
export const RESULTS_CALCULATION_DRAW = "results-calculation"; // the purpose of the seeded draw

// SurveyQuestionnaireResultsCalculation/utils/
export const getLoaderLines = (pool: readonly string[], seed: string): string[] => ...
export const getResultLinkInput = (session: SurveySession, locale: string): ResultLinkInput | undefined => ...
export const isReadyToLeave = (run: {
  handIn: HandInState;
  link: ResultLinkState;
  hasStayedLongEnough: boolean;
}): boolean => ...
export const getLoaderCardState = (run: {
  handIn: HandInState;
  link: ResultLinkState;
  isReadyToLeave: boolean;
}): SurveyResultsCalculationState => ...
export const useResultsCalculation = (props: SurveyPhaseContentProps): SurveyResultsCalculationProps => ...
```

Every time and every count above is a named constant. None is written as a number in the code.

### What is used from the tasks before it

Use these names as they are; do not redefine or wrap them.

| From | Used for |
|---|---|
| `createResult`, `getResult`, `CreateResultOutcome` (`survey-api`) | Steps 1 and 3. Neither call ever rejects |
| `buildResultInput`, `session.setResultState`, `session.setEmail`, `SurveyResultState`, `SurveyEmail`, `SURVEY_SESSION_CONFIG.isEmailSendingSetUp` (`survey-session`) | The hand-in body, the result state the frame reads, the address held in memory, whether sending is set up |
| `SurveyPhaseContentProps`, `SURVEY_PHASE_CONTENT`, `onLeave` (`survey-questionnaire`) | The plug point, and leaving: `onLeave()` removes the stored session and opens `getResultsUrl` in the same tab |
| `requestResultLink`, `ResultLinkInput`, `ResultLinkOutcome` (`survey-email-capture`) | Step 2 |
| `getSeededRandom`, `seededShuffle` (`survey-checkpoint-engine`) | The order of the lines - see "The seeded draw" |

### Who builds what

| Piece | Built by |
|---|---|
| The loader card, the lines, the minimum stay, the disabled actions | This task |
| Sending the hand-in, its second try, reading the result, the two time limits, the failed states and retry | This task |
| Deciding to request the link: after the result is stored, only with an address, once per session; taking the address out of the session; the "link not sent" notice | This task |
| `requestResultLink` itself: the body, the address it is sent to, how its replies are read, its 10 seconds | `survey-email-capture`. Call it; do not touch it |
| Collecting the address and the consent, the switch that turns the e-mail phase on | `survey-email-capture` |
| What the hand-in holds (`buildResultInput`), what `createResult` and `getResult` make of a reply | `survey-session` and `survey-api` - built |
| The pill "Prawie gotowe", no bar, back off, reset off and on again when the result state is `failed` (`getSurveyFrame`, `canReset`) | `survey-questionnaire` and `survey-session` - built. This task only sets the result state |
| Removing the stored session and navigating (`onLeave`), starting over when the browser shows the page again from its memory | `survey-questionnaire` - built |

**This task depends on `survey-email-capture`** for one thing: the call. Build it after that task is merged, so step 2 is written once against the real function. Nothing else of that task is needed - with the e-mail phase off, `session.session.email` is always `null` and step 2 simply never runs.

# Behaviour

The [spec](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/engaging-loader.md) is the source of truth for every case below. The [Figma frame](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5518-84111) is the source of truth for sizes, spacing, type and colours: follow it.

### Words

| Word | Means |
|---|---|
| Line | One entry of the pool, drawn on the card as a pill |
| Order | The pool shuffled for one session. The same every time it is worked out for the same session identifier |
| Run | One pass of the card, from its first line to leaving, to the notice or to a failure. A session has one run, plus one for every retry and every refresh |
| Current line | The newest line of a run: drawn in the accent colour with a spinner. Every earlier line is finished: plain, no spinner, still on the card |

### A run and its three steps

| Step | Starts when | Ends when |
|---|---|---|
| 1. Submission | The run starts | `createResult` resolves `stored` |
| 2. Link request | Step 1 ended, the session holds an address, sending is set up, and no link was requested yet in this session | `requestResultLink` resolves |
| 3. Waiting for the result | Step 1 ended | A read shows the result calculated |

Steps 2 and 3 run side by side. A run is **ready to leave** when the result is calculated, the link request - if one was made - has ended, and the run has stayed long enough.

| Case | Behaviour |
|---|---|
| The taker arrives from the last closing card | A run starts: the first line appears and the hand-in is sent, both at once. The first line does not wait for the API |
| The page is refreshed during the phase | The session restores into the phase and a run starts again from its first line. The hand-in is sent again; `createResult` reads "already exists" as `stored`, and the run carries on |
| A run starts | `session.setResultState("sending")` |
| Step 1 ended | `session.setResultState("created")` |
| The result is calculated | `session.setResultState("calculated")` |
| A run ends in a failure | `session.setResultState("failed")`. That is what turns reset on in the frame |
| The phase is left, or the page closed, during a run | Every timer is cleared; the hand-in and the reads on their way are cancelled and their outcome ignored. The link request is not cancelled - see "Requesting the link" |

### Submission

`createResult(buildResultInput(survey, session), { timeoutMs: CREATE_RESULT_TIMEOUT_MS })`. The body is the session's; this task does not read or change it.

| Outcome | Behaviour |
|---|---|
| `stored` - created, or a result with this identifier already exists | Step 1 has ended. Reading starts, and the link is requested if there is an address |
| `unreachable` - no connection, or no reply within 10 seconds | The hand-in is sent once more by itself. If the second try is not `stored` either, the run ends in the failure "the answers could not be saved" |
| `refused` - the API refused it, or answered with a server error | The run ends in the same failure, with no second try by itself |
| The hand-in is on its way | The lines keep their pace. They do not wait for the API |
| The taker is offline when the phase starts | Both tries fail, then the failure. Retry works once they are back online |

The same hand-in is sent at every try, every retry and every refresh. It is never changed to get it accepted.

### Waiting for the result

| Case | Behaviour |
|---|---|
| Step 1 ended | `getResult(session.id)` at once, then again a second after each read has answered. Reads never overlap |
| `isCalculated` is false - not calculated yet, the result not found, or the read failed | Keep reading |
| `isCalculated` is true | The result is calculated. Reading stops |
| `RESULT_WAIT_MS` have passed since step 1 ended and the result is still not calculated | Reading stops, a read on its way is cancelled, and the run ends in the failure "the result is not ready in time" |

Nothing inside the result is used. What `results` may look like is `getResult`'s matter.

### Requesting the link

| Case | Behaviour |
|---|---|
| The session holds no address - none was given, the e-mail phase was left out, or the page was refreshed since | No request. Step 2 does not exist for this run, and the card says nothing about a link |
| Step 1 ended and the session holds an address | One `requestResultLink`, with `getResultLinkInput`: the address and the consent of `session.session.email`, the session identifier as `resultId`, and the app's language - `en` when the app runs in English, `pl` otherwise |
| The request is made | The address is taken out of the session at that moment (`session.setEmail(null)`). The request keeps the only copy until it has answered, then it is gone |
| The hand-in failed | No request. A link is never asked for while no result exists. The address stays in the session for a later run |
| `accepted` | Nothing is shown. The card never says a link was sent; the message in the mailbox does |
| `invalid`, `limited` or `unavailable` | The link counts as not sent. The request is not repeated |
| The link was not sent and the run becomes ready to leave | The notice replaces leaving - see "The notice" |
| The link was not sent and the run ends in a failure | The failure is shown first. The notice comes when a later run is ready to leave |
| A run is retried after the link was requested | No second request. One session asks for one link at most |
| The request is on its way | The lines keep their pace. A slow endpoint can hold the run for up to 10 seconds past the result, and no longer - the limit is the call's own |
| The phase unmounts while the request is on its way - a quiz read again after a change of language | The request is left to finish and its outcome is ignored. It is not cancelled: a cancelled request may already have reached the endpoint. The remounted phase finds no address and asks for nothing |
| The session holds an address although sending is not set up | No request and no notice. Without an endpoint there is nothing to promise |

The link is requested once and never by itself again, because a repeat after a lost reply would mail the link twice. Taking the address out of the session when the request is made is what keeps that true through a retry and a remount.

### The lines - `getLoaderLines`

| Case | Behaviour |
|---|---|
| The order of a session | The pool, translated into the app's language, shuffled with `seededShuffle(pool, session.id, RESULTS_CALCULATION_DRAW)`. Then lines that are empty or only space are left out |
| The same session again - after a refresh or a retry | The same order. The taker sees the same lines again |
| Two sessions | Different orders, except by chance |
| The app runs in English | The same pool through the English catalogue, in the same order |
| An empty pool | No lines. Everything else works |

### The sequence

| Case | Behaviour |
|---|---|
| A run starts | The first line of the order appears as the current line |
| A line has been current for `LINE_INTERVAL_MS` | It becomes finished, and the next line of the order appears under it as the current one |
| A line is taken | It is not taken again in that run |
| `MIN_LINES` lines have had their time - 6 seconds - and the run is ready to leave | The run ends: the taker leaves, or sees the notice |
| They have had their time and the run is not ready to leave | Lines keep arriving at the same pace, and the run ends the moment it is ready |
| Line number `MAX_LINES` appears | It is the last. It stays current, spinner turning, until the run is ready to leave or ends in a failure |
| The result is calculated before the fifth line has had its time | Nothing changes on the card. The run still shows five lines |
| The order has fewer lines than a run needs | The run shows what there is and the last line stays current. The stay is still counted as five lines |
| The order has no lines | No line is shown. The stay is still 6 seconds |
| A run that follows a failure - a retry | It starts from the first line of the order again and owes no minimum stay: it ends as soon as the result is calculated and the link request, if one is made, has ended |
| The first run after the phase appears - a refresh included | It owes the minimum stay |
| The tab is in the background | Lines and reads may slow down with the browser's timers. The run ends when it is ready, whenever that is |

There is no progress percentage and no way to skip the wait.

### The card - `SurveyResultsCalculation`

| `state` | The field shows | Under the field |
|---|---|---|
| `running` | The rings, moving, with `lines` stacked from the top and centred: the last one current, the others finished | "Pobierz" and "Pełne wyniki", disabled |
| `failed-not-saved` | The rings, still, with the message "Nie udało się zapisać Twoich odpowiedzi. Sprawdź połączenie i spróbuj ponownie." and the button "Spróbuj ponownie" | The same two actions, disabled |
| `failed-not-ready` | The rings, still, with the message "Liczenie wyników trwa dłużej niż zwykle. Twoje odpowiedzi są zapisane. Spróbuj ponownie za chwilę." and "Spróbuj ponownie" | The same |
| `link-not-sent` | The rings, still, with the notice "Nie udało się wysłać linku na Twój e-mail. Twoje wyniki są gotowe. Zapisz adres strony z wynikami, żeby móc do nich wrócić." and the button "Zobacz wyniki" | The same |

| Case | Behaviour |
|---|---|
| The field | The ring artwork of the frame ["background"](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5584-98431) |
| Motion of the field, while `running` | The rings drift outwards from their centre, slowly and without end, covering the distance between two rings in about 3 seconds |
| A line arrives | It fades in |
| The taker asked their device for reduced motion | The rings stand still, lines appear without a fade, and the spinner is drawn without turning. Lines still arrive one at a time, at the same pace |
| A line longer than the field is wide - "Sprawdzamy czy przekraczasz próg" at the narrowest widths | It wraps inside its pill. It is never cut |
| `lines` is empty while `running` | The rings and the two actions, no pill |
| `lines` in any other state | Not drawn. No line of the pool is ever on screen next to a message |
| "Pobierz" and "Pełne wyniki" | Real buttons, disabled in every state, in the frame's order, "Pobierz" with its download icon. Pressing one does nothing. They never become active in this phase |
| "Spróbuj ponownie" pressed | `onRetry()` |
| "Zobacz wyniki" pressed | `onSeeResults()` |
| The two actions at a narrow width | Side by side, or wrapped as a pair. No sideways scroll |

All motion is CSS, with the reduced-motion media query. **No animation library**, and nothing on the card flashes. If the moving rings cannot be made cheap enough for a low-end phone, they stand still.

### Failure and retry

| Case | Behaviour |
|---|---|
| A run ends in a failure | The lines are removed, the rings stand still, the message for that failure shows with "Spróbuj ponownie". The pill and the disabled back control stay; reset becomes available |
| "Spróbuj ponownie" pressed | A new run: the message goes, the first line of the order appears, and the hand-in is sent again |
| Pressed twice quickly | One run |
| The retry fails too | The same failed state again. There is no limit on retries |
| Reset pressed on a failure, and confirmed | The session's doing: a new session in the first phase. Nothing of this phase survives it |
| The page is reloaded on a failure | The session restores into the phase and a run starts again |
| Reset while a run is under way, and on the notice | Off. Nothing to build: the result state is not `failed` |

### The notice

| Case | Behaviour |
|---|---|
| The run is ready to leave and the link was not sent | The card shows `link-not-sent` instead of leaving |
| "Zobacz wyniki" pressed | `onLeave()` |
| Pressed twice quickly | One navigation |
| The taker does nothing | The notice stays. It does not time out and does not leave by itself |
| The page is refreshed while the notice shows | A run starts again and ends by leaving. The notice is not shown twice: nothing remembers that a link was asked for |
| The link was sent, or none was asked for | No notice. The taker leaves straight away |

The notice gives no reason and offers no second try.

### Leaving

| Case | Behaviour |
|---|---|
| The run is ready to leave and no notice is due | `onLeave()`, once, at once |
| What `onLeave` does | The stored session is removed at that moment and not before, then the results destination opens in the same tab. Built in `survey-questionnaire` - do not clear the session or navigate here |
| Until then | The session stays stored, answers and demographics included, so a refresh at any moment of the phase comes back to it. Do not call `session.leave()` when the result is stored or calculated |
| The taker comes back with the browser's back button | A new session in the first phase. The finished loader is never shown again - also built in `survey-questionnaire`; check that it still holds |

### The seeded draw

The order comes from `seededShuffle` in `src/utils/checkpoint/`, the draw the checkpoint cards use. That function is specified in `survey-checkpoint-engine`, which is planned for a later cycle. **Check `src/utils/checkpoint/` before writing anything**:

| Found | Do |
|---|---|
| `getSeededRandom.ts` and `seededShuffle.ts` exist | Use `seededShuffle`. Change nothing in them |
| They do not exist | Create exactly those two files with their tests, as below, and nothing else of that task. `survey-checkpoint-engine` then finds them and builds on them. Do not write a draw of your own under another name or in another folder |

```ts
// src/utils/checkpoint/getSeededRandom.ts
export const getSeededRandom = (seed: string, purpose: string, draw = 0): number => ...
// A number in [0, 1) that depends only on the three arguments.

// src/utils/checkpoint/seededShuffle.ts
export const seededShuffle = <Item>(
  items: readonly Item[],
  seed: string,
  purpose: string,
  round = 0,
): Item[] => ...
// A new array in an order that depends only on the seed, the purpose and the round.
```

| Case | Behaviour |
|---|---|
| The same seed, purpose and draw number | The same result, in every browser and on every device |
| Another purpose | An unrelated result |
| The clock, `Math.random`, `crypto` | Never used |
| A seed that is missing or empty | A fixed seed is used |

A string hash feeding a small integer generator, integer arithmetic only, so every engine gives the same numbers. No new dependency.

### Privacy

- The hand-in carries answers and demographics. They go to `createResult` and nowhere else: not to analytics, not to error reporting, not to the console.
- The session identifier is a bearer key. It is in the results address and in the link request, and is sent to nothing else from this phase.
- The address passes through once: from the session into one `requestResultLink`. It is never written to storage, the address bar or the console, and never sent with the hand-in.

### Accessibility

- Entering the phase is announced once, with "Liczymy Twoje wyniki". The lines are not announced one by one: the stack is not a live region.
- A failure is announced as soon as it shows, and focus moves to "Spróbuj ponownie". The notice is announced the same way, and focus moves to "Zobacz wyniki".
- "Pobierz" and "Pełne wyniki" are real buttons in a disabled state: read as unavailable, skipped by the keyboard.
- The spinner and the rings are decoration and are hidden from assistive technology.

# Copy

Polish is the source; every string goes through a Lingui macro and the English entry is filled in. "Liczymy Twoje wyniki", the "answers could not be saved" message, "Spróbuj ponownie", "Zobacz wyniki" and "Prawie gotowe" are in the catalogue already.

| Text | Polish (source) | English |
|---|---|---|
| First result action | Pobierz | Download |
| Second result action | Pełne wyniki | Full results |
| Announcement | Liczymy Twoje wyniki | We are calculating your results |
| Message, the answers could not be saved | Nie udało się zapisać Twoich odpowiedzi. Sprawdź połączenie i spróbuj ponownie. | Your answers could not be saved. Check your connection and try again. |
| Message, the result is not ready in time | Liczenie wyników trwa dłużej niż zwykle. Twoje odpowiedzi są zapisane. Spróbuj ponownie za chwilę. | Calculating your results is taking longer than usual. Your answers are saved. Try again in a moment. |
| Retry button | Spróbuj ponownie | Try again |
| Notice, the link could not be sent | Nie udało się wysłać linku na Twój e-mail. Twoje wyniki są gotowe. Zapisz adres strony z wynikami, żeby móc do nich wrócić. | We could not send the link to your e-mail. Your results are ready. Save the address of the results page to be able to come back to them. |
| Button under the notice | Zobacz wyniki | See results |

**The pool** - `RESULTS_CALCULATION_POOL`, each line a Lingui message of its own (`msg`), in this order. The English lines carry the plain meaning; the jokes do not survive, and an English pool of its own is content work for later.

| # | Polish (source) | English |
|---|---|---|
| 1 | Prostujemy osie | Straightening the axes |
| 2 | Liczymy, nie oceniamy | Counting, not judging |
| 3 | Szukamy Twojej ćwiartki | Looking for your quadrant |
| 4 | Panowie, liczymy głosy | Gentlemen, we are counting the votes |
| 5 | Rozpoczynamy trzecie czytanie | Starting the third reading |
| 6 | Przeliczamy jeszcze raz | Counting once more |
| 7 | Liczymy, ale się cieszymy | Counting, but happy about it |
| 8 | Sprawdzamy czy przekraczasz próg | Checking whether you pass the threshold |
| 9 | Dzielimy przez zero | Dividing by zero |
| 10 | Rozdajemy 100 milionów | Handing out 100 million |
| 11 | Zaglądamy do teczek | Looking into the files |
| 12 | Kolorujemy wykresy | Colouring the charts |
| 13 | Jesteśmy za, a nawet przeciw | We are for, and even against |
| 14 | Czytamy programy partii | Reading the party programmes |
| 15 | Zgłaszamy wniosek formalny | Raising a point of order |
| 16 | Obradujemy przy okrągłym stole | Deliberating at the round table |
| 17 | Słuchamy wywiadów w telewizji | Listening to interviews on TV |

Two lines differ from what is typed in the frames, on purpose: line 1 has no trailing space, and line 3 has a capital "Twojej" - the pool frame has a small letter, both screens a capital.

The pool is content: adding, removing or rewording a line changes strings and nothing else. A line jokes about counting, parliament or procedure, names no living politician and no party, and is never chosen by what the taker answered. It is the same pool in every quiz.

# Athena components to use

- `Button` for "Pobierz" (with the download icon as `LeftIcon`) and "Pełne wyniki", disabled, and for "Spróbuj ponownie" and "Zobacz wyniki". Do not build a custom button.
- Not `Button` with `isLoading` for the current line: a line is not a control. Its spinner is drawn by the line.
- Not `Badge` for a line: it comes in fixed status colours and sizes, and the pill of the frame, with its accent state and spinner, is none of them.
- Not `InfoMessage` for the failures and the notice: it is a one-line hint with an icon, and these are a short text with a button on the field of rings.
- Not `ProgressBar`: the card shows no percentage.
- Not `SurveyPhaseActions`: the two actions here are both disabled and neither is "Pomiń".
- Icons are SVG files in `src/assets/icons/`, imported: add the download icon and the spinner from the frame. How the rings are drawn - an exported asset in `src/assets/images/` or CSS - is the developer's call.

# Out of scope

- **The body of the hand-in, and reading the replies of the API** - `buildResultInput`, `createResult`, `getResult`. Built.
- **`requestResultLink`, the e-mail card, the switch for the e-mail phase** - `survey-email-capture`.
- **The link endpoint and the message it sends** - back-end; the contract is in the [results saving and marketing spec](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/results-saving-and-marketing.md).
- **The bar, the pill, back, reset and its dialog** - `survey-questionnaire` and `SurveyControls`. This task sets the result state and nothing in the frame.
- **Removing the stored session, navigating, starting over from the browser's memory** - `onLeave` and `useLeave` of `survey-questionnaire`.
- **The short results card** - the results module. When it is built it replaces leaving, and "Pobierz" and "Pełne wyniki" become its actions. Here they are drawn and never work.
- **The results screen** - the taker is sent to the results page that already runs.
- **The checkpoint engine, its pools and its record** - `survey-checkpoint-engine`. Only the two draw files are shared with it.
- **A progress percentage, skipping the wait, a second link request** - not supported.
- **Analytics** - no event is sent.

# Files to create

```
src/components/survey/SurveyResultsCalculation/
├── SurveyResultsCalculation.tsx
├── SurveyResultsCalculation.test.tsx
├── SurveyResultsCalculation.types.ts
├── SurveyResultsCalculation.stories.tsx
├── SurveyResultsCalculationField/           # the rings, and what is on them: the lines or a message
│   ├── SurveyResultsCalculationField.tsx
│   └── SurveyResultsCalculationField.test.tsx
├── SurveyResultsCalculationLine/            # one pill: current or finished
│   ├── SurveyResultsCalculationLine.tsx
│   └── SurveyResultsCalculationLine.test.tsx
├── SurveyResultsCalculationMessage/         # a failure or the notice with its one button; announces itself and takes the focus
│   ├── SurveyResultsCalculationMessage.tsx
│   └── SurveyResultsCalculationMessage.test.tsx
└── SurveyResultsCalculationActions/         # "Pobierz" and "Pełne wyniki"
    ├── SurveyResultsCalculationActions.tsx
    └── SurveyResultsCalculationActions.test.tsx
src/components/survey/SurveyQuestionnaire/SurveyQuestionnaireSession/
├── SurveyQuestionnaireSession.constants.ts  # "results-calculation" -> the new phase (existing file)
├── SurveyQuestionnaireHandIn/               # deleted, with utils/useHandIn.ts and every test of it
└── SurveyQuestionnaireResultsCalculation/
    ├── SurveyQuestionnaireResultsCalculation.tsx
    ├── SurveyQuestionnaireResultsCalculation.test.tsx
    ├── SurveyQuestionnaireResultsCalculation.types.ts
    ├── SurveyQuestionnaireResultsCalculation.constants.ts   # the pool, the times, the purpose of the draw
    └── utils/
        ├── getLoaderLines.ts                # the order of a session
        ├── getResultLinkInput.ts            # the session and the language -> the input of the call, or nothing
        ├── isReadyToLeave.ts
        ├── getLoaderCardState.ts            # hand-in, link, ready -> the state of the card
        ├── useLoaderLines.ts                # how many lines a run shows, and whether it has stayed long enough
        ├── useResultHandIn.ts               # steps 1 and 3 of a run; sets the result state
        ├── useResultLink.ts                 # step 2, once per session
        └── useResultsCalculation.ts         # the runs: composes the three hooks, retries, leaves
src/utils/checkpoint/                        # only if they do not exist yet - see "The seeded draw"
├── getSeededRandom.ts
├── getSeededRandom.test.ts
├── seededShuffle.ts
└── seededShuffle.test.ts
src/assets/icons/                            # download, spinner
e2e/survey/questionnaire.spec.ts             # extended (existing file)
```

Every component folder holds its `.tsx` and `.test.tsx`; every util and hook has a test next to it. The tree names the pieces the behaviour needs - split further where a file passes the limits of `AGENTS.md` section 3.2, and drop a file that turns out empty. The card and its subcomponents hold no timer and no request: everything that waits lives in the hooks of the phase.

# Unit test cases (BDD)

```ts
describe('getLoaderLines()', () => {
  it('returns every line of the pool exactly once', ...);
  it('returns the same order for the same seed', ...);
  it('returns another order for another seed', ...);
  it('leaves out a line that is empty or only space', ...);
  it('keeps the order of the other lines when one is left out', ...);
  it('returns no lines for an empty pool', ...);
});

describe('getResultLinkInput()', () => {
  it('returns nothing when the session holds no e-mail', ...);
  it('takes the address and the consent from the session, and the session identifier as the result', ...);
  it('sends en when the app runs in English and pl otherwise', ...);
});

describe('isReadyToLeave()', () => {
  it('is not ready before the result is calculated', ...);
  it('is not ready while the link request is pending', ...);
  it('is not ready before the run has stayed long enough', ...);
  it('is ready when the result is calculated, the link has ended or was never asked for, and the stay is over', ...);
});

describe('getLoaderCardState()', () => {
  it('is running while the hand-in is sending, created or calculated', ...);
  it('is failed-not-saved and failed-not-ready for the two failures', ...);
  it('is link-not-sent when the run is ready to leave and the link was not sent', ...);
  it('shows the failure, not the notice, when the link was not sent and the run failed', ...);
});

describe('useLoaderLines()', () => {
  it('shows the first line at once', ...);
  it('adds a line every LINE_INTERVAL_MS', ...);
  it('stops at MAX_LINES', ...);
  it('has stayed long enough after MIN_LINES lines have had their time', ...);
  it('counts the stay as five lines when the order has fewer, and when it has none', ...);
  it('starts from the first line again on a new run', ...);
  it('has stayed long enough from the start on a run that follows a failure', ...);
  it('leaves no timer running after unmount', ...);
});

describe('useResultHandIn()', () => {
  describe('when a run starts', () => {
    it('sends the hand-in of the session once, with a time limit of 10 seconds', ...);
    it('sets the result state to sending', ...);
  });
  describe('given a stored result', () => {
    it('sets the result state to created and reads the result at once', ...);
    it('reads again a second after each read has answered, never two at a time', ...);
    it('keeps reading while the result is not calculated', ...);
    it('sets the result state to calculated and stops reading', ...);
  });
  describe('given an unreachable API', () => {
    it('sends the same hand-in once more by itself', ...);
    it('carries on when the second try is stored', ...);
    it('ends not-saved and sets the result state to failed when the second try fails', ...);
  });
  describe('given a refused hand-in', () => {
    it('ends not-saved with no second try', ...);
  });
  describe('given a result that is not calculated within RESULT_WAIT_MS', () => {
    it('ends not-ready, sets the result state to failed and stops reading', ...);
  });
  describe('when a new run starts after a failure', () => {
    it('sends the same hand-in again', ...);
    it('waits another RESULT_WAIT_MS', ...);
  });
  describe('when unmounted during a run', () => {
    it('cancels the hand-in and the reads and leaves no timer running', ...);
  });
});

describe('useResultLink()', () => {
  it('asks for nothing before the result is stored', ...);
  it('asks for nothing when the session holds no e-mail', ...);
  it('asks for nothing when sending is not set up, and reports no link', ...);
  describe('given a stored result and an e-mail', () => {
    it('requests the link once, with the input of the session', ...);
    it('takes the e-mail out of the session when the request is made', ...);
    it('is pending until the call resolves', ...);
    it('is accepted when the endpoint accepts', ...);
    it('is not-sent for invalid, limited and unavailable', ...);
  });
  describe('when another run starts after the link was requested', () => {
    it('makes no second request and keeps what the first one ended with', ...);
  });
  describe('when the hand-in failed', () => {
    it('makes no request and leaves the e-mail in the session', ...);
  });
  describe('when unmounted while the request is on its way', () => {
    it('does not cancel it', ...);
  });
});

describe('useResultsCalculation()', () => {
  it('starts a run when the phase appears', ...);
  it('leaves once when the run is ready and no notice is due', ...);
  it('does not leave before the minimum stay, however fast the result is', ...);
  it('waits for a pending link request before leaving', ...);
  it('shows the notice instead of leaving when the link was not sent', ...);
  it('leaves when "Zobacz wyniki" is pressed, once when pressed twice', ...);
  it('starts one new run when retry is pressed twice', ...);
  it('leaves as soon as the result is calculated on a run that follows a failure', ...);
  it('shows the notice after a failed run and a retry, when the link was not sent', ...);
  it('never calls leave of the session itself', ...);
});

describe('<SurveyQuestionnaireResultsCalculation />', () => {
  it('shows the card with the lines of the session, in the language of the app', ...);
  it('shows the same lines for the same session after a remount', ...);
  it('is registered for the results-calculation phase, and the stand-in is gone', ...);
});

describe('<SurveyQuestionnaireSession />', () => {
  describe('given a session in results calculation', () => {
    it('draws no bar, "Prawie gotowe", back off and reset off while a run is under way', ...);
    it('turns reset on when the run has failed, and starts a new session when it is confirmed', ...);
    it('keeps reset off on the notice', ...);
  });
});

describe('<SurveyResultsCalculation />', () => {
  describe('given running', () => {
    it('shows the lines in order, the last one as the current line', ...);
    it('announces "Liczymy Twoje wyniki" once, and not the lines', ...);
    it('shows "Pobierz" and "Pełne wyniki" disabled', ...);
    it('shows no line and no message when there are no lines', ...);
  });
  describe('given failed-not-saved', () => {
    it('shows its message and "Spróbuj ponownie", and no line', ...);
    it('calls onRetry when the button is pressed', ...);
  });
  describe('given failed-not-ready', () => {
    it('shows its message and "Spróbuj ponownie"', ...);
  });
  describe('given link-not-sent', () => {
    it('shows the notice and "Zobacz wyniki", and no line', ...);
    it('calls onSeeResults when the button is pressed', ...);
  });
  describe('in every state', () => {
    it('keeps the two actions disabled, in the order of the frame', ...);
  });
});

describe('<SurveyResultsCalculationLine />', () => {
  it('draws the current line with a spinner', ...);
  it('draws a finished line without one', ...);
  it('hides the spinner from assistive technology', ...);
});

describe('<SurveyResultsCalculationMessage />', () => {
  it('announces its text when it appears', ...);
  it('moves the focus to its button', ...);
});

describe('<SurveyResultsCalculationActions />', () => {
  it('draws "Pobierz" then "Pełne wyniki", both disabled buttons', ...);
});

// Only if this task creates them - see "The seeded draw"
describe('getSeededRandom()', () => {
  it('returns a number from 0 up to, not including, 1', ...);
  it('returns the same number for the same seed, purpose and draw', ...);
  it('returns another number for another purpose', ...);
  it('returns another number for another draw', ...);
  it('uses a fixed seed when the seed is missing or empty', ...);
  it('matches a list of numbers written down in the test, so every browser agrees', ...);
});

describe('seededShuffle()', () => {
  it('keeps every item exactly once', ...);
  it('returns the same order for the same seed, purpose and round', ...);
  it('returns another order for another round', ...);
  it('does not change the list it was given', ...);
});
```

Find elements by role and accessible name. Test the hooks with fake timers on a small quiz from `createSurvey`, with a session from `useSurveySession`; mock `createResult`, `getResult` and `requestResultLink`, never the session logic. The reduced-motion paths are CSS and are checked by eye in Storybook with the system setting on; say so in the PR.

# Storybook stories

`SurveyResultsCalculation.stories.tsx` - the card alone. Only the first state is drawn in Figma; the others reuse the card and the field, with the message where the lines were.

- `Running` - frame ["standard"](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5518-95712): "Prostujemy osie" and "Liczymy, nie oceniamy" finished, "Szukamy Twojej ćwiartki" current
- `Holding` - eight lines, the eighth current
- `FailedAnswersNotSaved`
- `FailedResultNotReady`
- `LinkNotSent`

Edge:

- `FirstLine` - one line, current
- `LongLine` - "Sprawdzamy czy przekraczasz próg" as the current line
- `NoLines` - running with no lines

The phase has no story and none is added to `SurveyQuestionnaire.stories.tsx`: it makes a request the moment it appears, and no story makes a request.

Stories show the component alone, with no decorator, background or fixed width; check them at 320, 360 and 800 px, and once with reduced motion on.

# End-to-end test

Extend `e2e/survey/questionnaire.spec.ts`. The build the e2e runs against already has the link endpoint configured (`survey-email-capture` set it), so every scenario passes the e-mail card.

Mocks, on top of those the spec has: fulfil `GET **/v1/result/**` first with a result whose `results` is `null`, then with one that holds a calculation; fulfil the link endpoint with 202, its preflight request included. No test reaches a live address.

A scenario that reaches the result now stays on the loader for 6 seconds. Do not shorten the constants and do not add a switch for tests: pass the stay with Playwright's clock (`page.clock`), or let it run under an assertion timeout that covers it. Say which in the PR.

Changed - the ending of every scenario that reaches the result:

```gherkin
    ...
    Then they see the loader under "Prawie gotowe", with no progress bar, a first line, and "Pobierz" and "Pełne wyniki" off
    And one result is created with what the scenario gave
    When the result is calculated and the stay is over
    Then they land on the results address that ends with the identifier that was sent
    And nothing of the session is left in the tab's storage
```

New scenarios:

```gherkin
  Scenario: The link is requested after the result exists
    Given a user answered every question, skipped demographics and typed an address with the consent ticked
    When they press "Wyślij i zobacz wyniki"
    Then the result is created, without the address
    And after it one request reaches the link endpoint, with the address, the consent, the consent wording, the language "pl" and the identifier of that result, and no answer
    And they land on the results address

  Scenario: The link could not be sent
    Given the link endpoint answers "unavailable"
    And a user answered every question, skipped demographics and typed an address
    When they press "Wyślij i zobacz wyniki"
    Then the result is created and the link is requested once
    And they see "Nie udało się wysłać linku na Twój e-mail." and stay on the page
    When they press "Zobacz wyniki"
    Then they land on the results address

  Scenario: A refresh during the wait
    Given a user reached the loader and the result is stored but not calculated
    When they reload the page
    Then they see the loader again, from its first line
    And the same result is sent again and answered "already exists"
    When the result is calculated and the stay is over
    Then they land on the same results address

  Scenario: The answers cannot be saved
    Given the API refuses the result
    When a user reaches the loader
    Then they see "Nie udało się zapisać Twoich odpowiedzi." with "Spróbuj ponownie", and reset is on
    When the API accepts the result and they press "Spróbuj ponownie"
    Then they land on the results address
```

The second try by itself, the 30-second limit, the order of the lines and the notice after a failed run stay in unit tests.

# Remember about standards

- Use the standard colors palette, never add colors directly (check https://tailwindcss.com/docs/colors and our color palette in the `src/index.css` file and in [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css))
- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Create a Storybook story for the component with all possible props variants of the component
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)
- Name the branch `feature/survey-results-calculation-{issue number}`, following [Conventional Branch](https://conventional-branch.github.io/) - never keep a generated or default branch name
- Read `AGENTS.md` in the repository before starting: one component per file, no `renderX()` functions, helpers and hooks in `utils/` with their own tests, no import from another component's `utils/`, constants or subcomponents
- The card fills its parent's width and its height comes from its content. Layout that depends on width is CSS; do not measure the element or the window in JavaScript
- Tailwind class names are static: a duration cannot be built into a class name from a constant at runtime
- No new dependency: no animation library, no data-fetching or polling library, no random-number library
- No request outside `src/services/api/client/`. The phase calls `createResult`, `getResult` and `requestResultLink`; it never uses Axios or `fetch`
- Copy is Polish by default, accessible names included. Run `yarn i18n:extract`, translate every new English entry, commit both catalogs
- Commit only files that belong to the task; commits follow Conventional Commits
- The PR follows the repository's pull request template, with screenshots of the stories next to the frame, and lists the decisions the frame left open - the two failed states, the notice, how the rings are drawn and moved - and whether the two draw files were created here or found

# Dependencies

- `survey-questionnaire` - the screen, `SURVEY_PHASE_CONTENT`, `SurveyPhaseContentProps`, `onLeave`, the stand-in this task deletes, the e2e spec it extends.
- `survey-email-capture` - `requestResultLink`, `ResultLinkInput`, `ResultLinkOutcome`, and the e2e build with the endpoint configured. Both tasks are in cycle 5: this one is built second.
- Through them, `survey-api` (`createResult`, `getResult`) and `survey-session` (`buildResultInput`, `setResultState`, `setEmail`, `SURVEY_SESSION_CONFIG`).

It does not depend on `survey-checkpoint-engine`: the two draw files are created by whichever of the two tasks is built first.

Nothing in this epic waits for it. The short results card of the results module will take over its ending.

# Resources

- [Figma - Loading](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5518-84111) - [standard](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5518-95712) | [texts](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5518-95758) | [background](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5584-98431) | [the phase on the strip](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5583-98319)
- [Spec - Engaging loader](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/engaging-loader.md) - all of it
- [Spec - Session and data](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/session-and-data.md) - "Creating the result", "Reading the result", "Leaving", and the rows about results calculation in "Starting and restoring a session"
- [Spec - Results saving and marketing](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/results-saving-and-marketing.md) - "The request" and "Failure modes": the contract of the call this phase makes
- [Spec - Phases model](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/phases-model.md) - "Results calculation" and its row of the frame
- [Spec - Random copy](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/checkpoints-random-copy.md) - the kind of draw the lines share with the checkpoint cards
- [Docs - Engaging loader](https://github.com/gi-org-pl/product/blob/main/mypolitics/docs/modules/quiz/results/engaging-loader.md), [Short results card](https://github.com/gi-org-pl/product/blob/main/mypolitics/docs/modules/quiz/results/short-results-card.md)
- [Survey API docs](https://api.mypolitics.pl/api) - `POST /api/v1/result` (201, 409), `GET /api/v1/result/{id}`
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Storybook docs](https://storybook.js.org/docs/writing-stories)
- [Tailwind docs](https://tailwindcss.com/docs/)
- [Vitest docs](https://vitest.dev/guide/) - [fake timers](https://vitest.dev/guide/mocking/timers)
- [Playwright - clock](https://playwright.dev/docs/clock)

# Definition of Done

- [ ] Code follows folder structure (`docs/frontend/conventions/PROJECT_STRUCTURE.md`) and the paths of "Files to create"; components sit directly in `src/components/survey/`
- [ ] Naming follows `docs/frontend/conventions/NAMING.md`
- [ ] Component layout follows `docs/frontend/conventions/COMPONENT_STRUCTURE.md`: one component per file, no `renderX()` functions, helpers and hooks in `utils/`, each with its own test; nothing imported from another component's `utils/`, constants or subcomponents
- [ ] `SurveyQuestionnaireHandIn` is deleted with its hook and tests; `results-calculation` is served by the new phase
- [ ] The first line and the hand-in start together when the phase appears; the hand-in is `buildResultInput` unchanged, at every try
- [ ] An unreachable API gets one second try by itself; a refused hand-in gets none; both end in "the answers could not be saved"
- [ ] The result is read at once and then every second, never two reads at a time, until calculated or until 30 seconds have passed since it was stored
- [ ] The result state follows the run - sending, created, calculated, failed - and nothing else in this task touches the frame
- [ ] The link is requested only after the result is stored, only with an address and with sending set up, and at most once per session; the address leaves the session when the request is made
- [ ] No answer of the link endpoint holds the result back: a link that was not sent shows the notice once, and "Zobacz wyniki" leaves
- [ ] The lines come from the 17-line pool in the seeded order of the session: the same for the same session, no line twice in a run
- [ ] A line every 1.2 seconds, eight at most, the last one holding; the first run stays at least 6 seconds, a run after a failure owes no stay
- [ ] A failure removes the lines, stills the rings, shows its message with retry, is announced and takes the focus; retry starts one new run; reset is on in the failed states and off otherwise
- [ ] "Pobierz" and "Pełne wyniki" are disabled buttons in every state
- [ ] The taker leaves through `onLeave` exactly once; the stored session is still there until that moment, so a refresh anywhere in the phase restores it
- [ ] Motion is CSS only, with a still version of every moving part under reduced motion; no animation library added
- [ ] `getSeededRandom` and `seededShuffle` exist once, in `src/utils/checkpoint/`, with the signatures above
- [ ] Nothing of the hand-in, the session identifier or the address is logged or sent anywhere but its own request
- [ ] Athena `Button` is used for every button; no custom button
- [ ] The card fills its parent's width; stories checked at 320 / 360 / 800 px with no horizontal scroll, the longest line wraps inside its pill
- [ ] Unit tests added or updated, BDD style, coverage ≥95% on changed files; every subcomponent, util and hook has its own test file; elements found by role and name
- [ ] Storybook stories added for the states listed above, showing the component alone; none makes a request
- [ ] `e2e/survey/questionnaire.spec.ts` covers the changed ending and the four new scenarios with the API, the link endpoint and the results page mocked; no test reaches a live address
- [ ] Biome lint clean
- [ ] TypeScript clean (no `any`, no `@ts-ignore`)
- [ ] Every string of the Copy section goes through a Lingui macro, with Polish as the source; `yarn i18n:extract` run, English entries translated, `.po` files committed
- [ ] PR description lists decisions and deviations, and says the reduced-motion paths were checked by eye
- [ ] Branch named `feature/survey-results-calculation-{issue number}`
- [ ] CI green: build, lint, test, e2e
