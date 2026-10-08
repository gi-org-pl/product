<img alt="The seven phases of a session" src="https://raw.githubusercontent.com/gi-org-pl/product/main/mypolitics/assets/phases-model.png" />

# Story

As a user who pressed "Rozpocznij" on a quiz, I want one screen that takes me from picking my topics, through every question, to the demographics card and on to my result - with a bar that shows how far I am, a way to step back or start over, and my place kept when I refresh - so that I can take a whole quiz in this app.

# Component properties

**Component:** `SurveyQuestionnaire` - the questionnaire screen
**Location:** `src/components/survey/SurveyQuestionnaire/`, mounted by the route `src/pages/quizzes.$quizSlug.tsx`
**Shared:** no - domain component under `survey`

This is the task that puts the built survey components on a route. It composes `SurveySaturatedProgressBar` ([#30](https://github.com/gi-org-pl/mypolitics-app/issues/30)), `SurveyControls` ([#88](https://github.com/gi-org-pl/mypolitics-app/issues/88)), `SurveyCategorySelect` ([#37](https://github.com/gi-org-pl/mypolitics-app/issues/37)), `SurveyQuestion` ([#87](https://github.com/gi-org-pl/mypolitics-app/issues/87)), `SurveyAnswer` ([#33](https://github.com/gi-org-pl/mypolitics-app/issues/33)) and `SurveyDemographics` ([#89](https://github.com/gi-org-pl/mypolitics-app/issues/89)) with the quiz of `survey-api` and the session of `survey-session`. It decides nothing about the session itself: every rule for what an event does is a function of `survey-session`, and the screen calls it.

It builds four of the seven phases - category select, questions, demographics, and a plain hand-in that stands in for results calculation - and leaves a marked place for the other three. See "Phases added by later tasks".

```ts
// src/types/survey.ts - added
export type SurveyLoadState = { status: "loading" } | SurveyLoadResult;

// What every phase of the screen is given. A later phase is a component that takes exactly this.
export interface SurveyPhaseContentProps {
  survey: Survey;
  session: SurveySessionApi; // from useSurveySession(survey); the screen calls the hook once
  lock: () => void;          // call at a press that changes the screen only after a delay; the screen releases it
  onLeave: () => void;       // end the session and open the results destination
}
```

```ts
// src/components/survey/SurveyQuestionnaire/SurveyQuestionnaire.types.ts
export interface SurveyQuestionnaireProps {
  load: Exclude<SurveyLoadState, { status: "not-found" }>; // not found is the page's
  onRetry: () => void;
}

// src/components/survey/SurveyQuestionnaire/SurveyQuestionnaireSession/SurveyQuestionnaireSession.constants.ts
export const SURVEY_PHASE_CONTENT: Partial<Record<SurveyPhase, ComponentType<SurveyPhaseContentProps>>> = {
  "category-select": SurveyQuestionnaireCategorySelect,
  questions: SurveyQuestionnaireQuestions,
  demographics: SurveyQuestionnaireDemographics,
  "results-calculation": SurveyQuestionnaireHandIn, // stand-in until survey-results-calculation
};
```

```ts
// src/utils/survey/useSurvey.ts
export const useSurvey = (surveyId?: string): { load: SurveyLoadState; retry: () => void } => ...

// src/pages/quizzes.$quizSlug.tsx - the route /quizzes/:quizSlug
export default function QuizPage() { ... }

// src/components/survey/SurveyPhaseActions/SurveyPhaseActions.types.ts - the button pair under a phase
export interface SurveyPhaseActionsProps {
  primaryLabel: string;           // passed translated
  onPrimary: () => void;
  isPrimaryDisabled?: boolean;    // default false
  primaryDisabledReason?: string; // read by assistive technology while the primary button is off
  onSkip: () => void;             // "Pomiń"
}
```

Two built components get a small change each:

```ts
// SurveyControls.types.ts - one prop added
previousLabel?: string; // accessible name of the back control - passed translated. Default "Poprzednie pytanie"

// SurveySaturatedProgressBar - props unchanged ({ value, maxValue }); behaviour changed, see below
```

# Behaviour

The specs are the source of truth for what happens: the [phases model](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/phases-model.md) for the screen, the [answer model](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/answer-model.md) for answering and skipping, [progress and pacing](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/progress-and-pacing.md) for the bar, [demographics](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/demographics.md) for the fourth phase, and [session and data](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/session-and-data.md) for what is on screen before a session exists. The [phase strip](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5582-97895) is the source of truth for sizes, spacing, type and colours: follow the frame of each phase.

### The route and the quiz

| Case | Behaviour |
|---|---|
| `/quizzes/{slug}` with a slug `getSurveyId` knows, in any letter case | The quiz is read. The address is left as typed |
| A slug it does not know | The site's not-found page (`Error404`), inside the shell. Nothing is read |
| The address is opened | The quiz is asked for once, in the language of the app (`getSurvey(surveyId, i18n.locale)`) |
| The quiz arrives | It is kept for the visit. No later step asks for it again |
| The language of the app changes | The quiz is read again; the state is loading until it arrives. The session stays: the taker is back on the same question |
| The taker returns to the address after leaving it | The quiz is read again. Nothing is cached between visits |
| The page is left while the quiz is on its way | The request is cancelled and its result ignored |
| The phase, the question or the session | Never in the address |

### Before a session exists

| State | Condition | What is on screen | What is possible |
|---|---|---|---|
| Loading | `load.status` is `loading` | The frame of the questionnaire with still placeholders where the bar, the controls and the content will be. No text, no buttons | Wait, or leave by the site's navigation |
| Not found | `getSurveyId` gives nothing, or `getSurvey` resolves `not-found` | The site's not-found page, drawn by the page | Whatever that page offers |
| Failed to load | `load.status` is `failed` | A card in the same frame: the heading "Nie udało się wczytać quizu", the line "Sprawdź połączenie z internetem i spróbuj ponownie." and the button "Spróbuj ponownie" | Retry, which goes back to loading |
| Ready | `load.status` is `ready` | The phase the session is in | See below |

Figma draws none of the first three. Loading and failed to load reuse the frame of the [phase screens](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5582-97895); the placeholders stand where the bar, the controls and the question card stand on the [questions screen](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5582-97955).

A failed read touches no session. A stored session is restored and repaired by `survey-session` before anything is drawn, so the first thing on screen is already the right phase.

### The frame in each phase

The screen always has the same frame: the progress bar, the controls bar, the content, and the buttons of the phase. One pure function (`getSurveyFrame`) gives the first two for a session; it is implemented for **every** row below, including the phases whose content comes later, so a later task adds content and nothing else.

| Phase | Bar | Pill | Back | Name of back | Reset |
|---|---|---|---|---|---|
| Category select | Drawn, empty | The quiz name | Off | "Poprzednie pytanie" | Off |
| Questions | Drawn, at `getProgress` | The category of the current question and the questions left in it; the quiz name alone when the category is hidden, has no name or is missing | `canStepBack` | "Poprzednie pytanie" | `canReset` |
| Checkpoints | Drawn, unchanged | As for the question that follows the card - the current question | Off | "Poprzednie pytanie" | On |
| Demographics | Not drawn | "Prawie koniec!" | On | "Poprzednie pytanie" | On |
| E-mail capture | Drawn, full | "Prawie koniec!" | On | "Wróć" | On |
| Results calculation | Not drawn | "Prawie gotowe" | Off | "Poprzednie pytanie" | Off; on once the result state is `failed` |

| Case | Behaviour |
|---|---|
| The bar is not drawn | Nothing holds its place: the frame closes the gap |
| Back and reset | `isPreviousDisabled` and `isResetDisabled` of `SurveyControls` are the opposites of `canStepBack` and `canReset`. Do not decide either here |
| Back pressed | `session.back()` |
| Reset pressed and confirmed in the dialog `SurveyControls` already has | `session.reset()`. The first phase of the quiz is shown. Checkpoints that were turned off stay off |
| The dialog is closed any other way | Nothing changes |
| A quiz without a name | `quizName` is passed empty: `SurveyControls` then draws no pill where it would show only the name, and its dialog asks without one |
| The bar and the controls between two questions | The same elements stay mounted, so the number in the pill can roll and the bar can flash. Only the content is replaced |
| The pill changes to "Prawie koniec!" or "Prawie gotowe" | Announced once to assistive technology |
| The seventh phase, short results | Not built. The session never enters it |

### Category select

Content: `SurveyCategorySelect` with `getVisibleCategories(survey)`, the topics of the session and `getTopicLimit(survey)` as `maxSelection`. Buttons: `SurveyPhaseActions` with "Idziemy dalej". Frame: [category select](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5582-97901).

| Case | Behaviour |
|---|---|
| The phase opens | The prompt names the limit in the grammatical form the number needs, then one row per visible category in the quiz's order, none picked. The prompt and its plural forms are the component's |
| A row is pressed, or a picked row is pressed | `session.setTopics` with the selection the component reports |
| The number of topics reaches the limit | The rows that are not picked are drawn disabled, by the component. The prompt is the reason the taker can see - add no other line |
| No topic is picked | "Idziemy dalej" is off. "Pomiń" works |
| At least one topic is picked, the limit reached or not | "Idziemy dalej" works |
| "Idziemy dalej" | `session.confirmTopics()`. The first question is shown |
| "Pomiń" | `session.skipTopics()`. Whatever was picked is dropped, and the first question is shown |
| A quiz with exactly two visible categories | A limit of one: "Wybierz 1 najważniejszy dla Ciebie temat." |
| A quiz with one visible category, or none | The phase does not exist: the session starts on the first question |
| Two categories with the same name | Two rows |

Picking topics prioritises, it does not cut: every question is still asked, in the same order. The frame carries no line that says what picking does, and none is added.

### Questions

Content: `SurveyQuestion` with the statement and the explanation of `getCurrentQuestion`, then one `SurveyAnswer` per entry of `getAnswersToDraw` - `title` from `label`, `type` from `kind` - then "Pomiń". Frame: [questions](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5582-97955).

| Case | Behaviour |
|---|---|
| The phase opens, or a question is done | The current question is shown: its statement, its explanation when it has one, its answers in the order given |
| An answer is pressed | It reacts at once with the acknowledgement built into `SurveyAnswer`. Nothing else on the screen changes until it has played |
| The acknowledgement has played - `SurveyAnswer` calls `onClick` | `session.answer(id)`. The next question is shown, or demographics after the last one. There is no confirm step |
| "Pomiń" is pressed | `session.skip()`, at once. Nothing is acknowledged |
| Another answer, "Pomiń", back or reset is pressed while an answer is being acknowledged | Ignored. The first press stands, and no second answer plays its acknowledgement |
| The same answer is pressed twice quickly | One answer |
| The taker steps back to a question | It is open. No answer is marked as the one picked before |
| The explanation was open when the question changed | The next question starts with its explanation closed |
| The labels | The author's words, as `getAnswersToDraw` gives them. Never the sample labels of the frame ("Zgadzam się"), never the names of the kinds |
| An answer of a question | Never drawn disabled and never drawn selected. Do not pass `isDisabled` or `isSelected` |
| A question with one possible answer | One button and "Pomiń" |
| A question with many answers - the presidential quiz has one with fourteen | All of them in one list. The page scrolls; "Pomiń" stays under the last one |
| A long label, a long statement | They wrap and the card grows, as built. The page scrolls |
| "Pomiń" | Under the last answer, drawn as text and not as an answer. On every question, never disabled while the question is open |
| Kind and order | Worked out once per question, when it is shown - not on every render of a press |

**What `SurveyAnswer` does and does not do.** It plays the acknowledgement and calls `onClick` when it is over, 300 ms after the press. It ignores a second press on itself, but it knows nothing about its neighbours, about "Pomiń" or about the controls. The screen therefore has to learn about the press when it happens, not when `onClick` arrives: catch it on the group of answers and call `lock()`. Do not change `SurveyAnswer` for this, and do not lock the other answers with `isDisabled` - that dims them, and an answer of a question is never drawn disabled.

### Demographics

Content: `SurveyDemographics` with the four option lists and the values of the session. Buttons: `SurveyPhaseActions` with "Zobacz wyniki". Frame: [demographics](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5582-98067).

The option lists are built here: the values and their order come from `DEMOGRAPHICS_VALUES` of `survey-session`, the labels from this table. The age options are the 87 years "13" to "99", youngest first, each labelled with its number.

| Field | Label - value |
|---|---|
| Gender | "Kobieta" - `female`, "Mężczyzna" - `male`, "Inna" - `other`, "Wolę nie podawać" - `prefer_not_to_share` |
| Size of the place of residence | "Wieś" - `village`, "Miasto do 50 tys. mieszkańców" - `city_below_50k`, "Miasto od 50 do 200 tys. mieszkańców" - `city_below_200k`, "Miasto od 200 do 500 tys. mieszkańców" - `city_below_500k`, "Miasto powyżej 500 tys. mieszkańców" - `city_over_500k` |
| Education | "Podstawowe" - `primary`, "Zasadnicze zawodowe" - `basic_vocational`, "Średnie" - `secondary`, "Wyższe" - `higher` |

| Case | Behaviour |
|---|---|
| The phase opens in a new session | Four fields, nothing picked |
| The phase opens again - after back and forward, after a refresh | The values the session holds are picked |
| An option is picked | `session.setDemographics` with the values the card reports |
| Fewer than four fields are picked | "Zobacz wyniki" is off. "Pomiń" works |
| All four are picked - "Wolę nie podawać" counts as picked | "Zobacz wyniki" works. "Pomiń" still works |
| "Zobacz wyniki" | `session.leaveDemographics(true)`. The next phase comes |
| "Pomiń", with nothing, some or all fields picked | `session.leaveDemographics(false)`. The next phase comes. The values stay on the card for as long as the session lasts |
| The next phase | Whatever the session moves to: results calculation here, e-mail capture once `survey-email-capture` turns it on |
| "Zobacz wyniki" | Keeps its label, whatever stands between the taker and the result |
| Back | The last question is shown again and its answer or skip is removed. Answering it again brings the card back with the same values |
| A button was pressed and the screen is changing | The fields and both buttons take no further press |

### Handing in - the stand-in for results calculation

`survey-results-calculation` builds the real phase: the loader card, its lines, the minimum stay, the wait for the calculated result and the two result actions. Until it lands, the flow still has to reach a result, so this task builds the smallest thing that does: `SurveyQuestionnaireHandIn`. It is not in Figma and is replaced as a whole.

| Case | Behaviour |
|---|---|
| The phase opens | A plain waiting state: one line, "Liczymy Twoje wyniki", announced once. Result state `sending`, and `createResult(buildResultInput(survey, session))` is called at once, once |
| `stored` | Result state `created`, then `onLeave()` at once. It does not wait for the calculation: the results page does |
| `refused` or `unreachable` | Result state `failed`. The line is replaced by "Nie udało się zapisać Twoich odpowiedzi. Sprawdź połączenie i spróbuj ponownie." with the button "Spróbuj ponownie". Reset becomes available |
| "Spróbuj ponownie" | The waiting state again, and the same hand-in is sent again. Pressed twice quickly: one request |
| Reset, confirmed, in the failed state | A new session in the first phase. The answers of the old one are not handed in |
| The page is refreshed during the phase | The session restores into it and the hand-in is sent again with the same identifier. `createResult` reads "already exists" as stored, so the taker leaves |
| The phase is left or the page closed while the request is on its way | The request is cancelled and its outcome ignored |

### Leaving - `onLeave`

| Case | Behaviour |
|---|---|
| `onLeave()` | `session.leave()` - the stored session is removed - then `getResultsUrl` of that session's identifier opens in the same tab, as an ordinary navigation |
| Between the call and the navigation | The screen keeps showing what it showed. `leave` does not touch the session in memory |
| `onLeave()` called twice | One navigation |
| The taker comes back with the browser's back button and the page loads again | Nothing is stored, so a new session starts in the first phase |
| The browser shows the page again from its memory (`pageshow` with `persisted`) after the taker left | `session.startOver()`: the first phase of a new session is shown. The finished hand-in is never shown again |

### Changing what is on screen

| Case | Behaviour |
|---|---|
| The question changes | The old question and its answers leave and the new ones arrive in one short movement: forwards after an answer or a skip, backwards after back |
| The phase changes | The same movement: forwards, or backwards after back |
| The taker asked their device for reduced motion | Nothing moves. The new content replaces the old at once |
| A change is under way | The screen takes no press until the new content is there |
| How long it lasts | Never longer than the acknowledgement of an answer, 300 ms. The duration is a constant |
| The new content is there | The view is back at the top of the screen, so a question is never opened half-scrolled. Focus is on the top of the new content |
| The bar, the controls | Stay where they are. Only their values and the content change |

CSS transitions only. **No animation library** - none is in the stack and none is added. Do the reduced-motion path in CSS, with the reduced-motion media query, not by reading it in JavaScript.

**The lock.** One mechanism covers "ignored while an answer is acknowledged", "no press while the screen changes" and "two presses, one action": while locked, the controls, the content and the buttons take no pointer and no keyboard input and look as they did - they are not drawn disabled. The lock starts at `lock()` and at every change of content, and is released when the new content is there. It also releases itself after a time limit, so a lock that nothing answers can never leave the screen dead.

### Phases added by later tasks

A later phase is a component that takes `SurveyPhaseContentProps` and is added to `SURVEY_PHASE_CONTENT` under its phase. Its row of "The frame in each phase" is already implemented here, so the bar, the pill, back and reset are right the moment the content is registered.

| Phase | In this task | Added by | Where it plugs in |
|---|---|---|---|
| Checkpoints | Never entered: the screen asks nobody for a card after a done question. No content is registered | `survey-checkpoint` | Registers its content under `checkpoints`. In `useQuestionActions` - the one place a done question is handled - it asks the engine for a card after `answer` and `skip`, and calls `session.showCheckpoint` |
| E-mail capture | Never entered: `SURVEY_SESSION_CONFIG.isEmailSendingSetUp` is `false`, so demographics leads to results calculation. No content is registered | `survey-email-capture` | Sets the switch from `VITE_RESULTS_EMAIL_URL` and registers its content under `email-capture` |
| Results calculation | `SurveyQuestionnaireHandIn`, above | `survey-results-calculation` | Registers its content under `results-calculation` in place of the stand-in and deletes `SurveyQuestionnaireHandIn`. It ends by calling `onLeave` |
| Time per question | Not measured: `answer` and `skip` are called without seconds | `survey-checkpoint`, with the sample `survey-running-state` defines | Passes the seconds in `useQuestionActions` |

| Case | Behaviour |
|---|---|
| The session is in a phase with no content registered | The screen moves it on instead of drawing nothing: `closeCheckpoint()` for `checkpoints`, `leaveEmailCapture(false)` for `email-capture`. A phase that cannot be drawn never holds the quiz |

### The progress bar - changes in `SurveySaturatedProgressBar`

The component is built ([#30](https://github.com/gi-org-pl/mypolitics-app/issues/30)): it takes done and all as `value` and `maxValue`, shows the value on the curve and flashes when it changes. The curve is not touched, and neither is the look on the [board](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=4237-57347). Four things change: the first draw, reduced motion, the name and value for assistive technology, and invalid input.

| Case | Behaviour |
|---|---|
| The bar appears - the session starts, the page is refreshed, the taker arrives on a phase that draws it | No flash. Today it flashes on its first draw |
| The shown value changes - an answer, a skip, a step back | One flash of about a third of a second, as built |
| The value changes while a flash is under way | One flash, counted from the last change, as built |
| A card is shown or left, the same value is passed again | No flash |
| The taker asked their device for reduced motion | No flash, ever, and the fill takes its new value at once. Today there is no such path |
| Assistive technology | The bar is a progress bar named "Postęp quizu". The value it reports is the shown value rounded to a whole percent. Changes are not announced as they happen: no live region |
| `maxValue` is zero, below zero or not a number | An empty bar |
| `value` is below zero or not a number | An empty bar |
| `value` is above `maxValue` | A full bar |
| `value` or `maxValue` is not whole | Used as given |
| A quiz with one question | Empty, then full |
| The system forces its own colours | An empty bar and a full bar can still be told apart |

The bar is never a control: it cannot be pressed or focused. The frame tints the fill and the component lightens the whole bar; the built effect stays.

### The back control - change in `SurveyControls`

| Case | Behaviour |
|---|---|
| `previousLabel` not passed | The back control is named "Poprzednie pytanie", as built |
| `previousLabel` passed | That text is its accessible name |
| `previousLabel` empty or only space | Treated as absent |

Nothing else in `SurveyControls` changes. The screen passes "Wróć" in the e-mail capture phase and nothing in the others.

### Starting from the home page

| Case | Behaviour |
|---|---|
| The start button of the featured quiz | Opens `PATHS.quiz(FEATURED_QUIZ.id)` |
| The start button of a quiz card | Opens `PATHS.quiz(quizId)` with the identifier `QuizSection` reports |
| A quiz whose identifier `getSurveyId` does not know - every card except "myPolitics" today | Its address is opened and ends on the not-found page |

Navigate inside the app (`useNavigate`), without a full page load. The static content of `src/constants/home.ts` is mock data and is not changed here; neither are the home components, which already report the press.

### Layout

One column at every width: centred, never wider than a comfortable line of text, inside the shell of the app like every page. Figma draws the screen at phone width only and no second layout exists. The spacing around the screen belongs to the page; the component fills its parent's width.

### Accessibility

- Each phase opens with focus on the top of its content - the prompt, the statement, the heading of the demographics card - so a taker using a screen reader hears what the phase is before its controls. The element that takes the focus is not a stop for the Tab key.
- When the question changes, focus moves to the new statement.
- The answers of a question are a group named by its statement, in the order they are drawn. "Pomiń" comes after the last answer.
- Everything works from the keyboard in reading order: back, reset, content, buttons. Nothing depends on hover.
- A control that is off is announced as unavailable and skipped by the keyboard. "Zobacz wyniki" while off also says why: "Wybierz wszystkie cztery pola albo pomiń".
- Loading says "Wczytywanie quizu" to assistive technology. The failed-to-load state and the failed hand-in are announced when they appear.
- The demographics fields, the link and the buttons are reached in this order: age, gender, residence, education, "To znaczy?", "Zobacz wyniki", "Pomiń".

# Copy

Polish is the source; every string goes through a Lingui macro and the English entry is filled in. Texts of the built components (the prompt, the dialog, the demographics card) are already in the catalogue.

| Text | Polish (source) | English |
|---|---|---|
| Category select, primary button | Idziemy dalej | Let's go |
| Skip, in every phase | Pomiń | Skip |
| Demographics, primary button | Zobacz wyniki | See results |
| Reason "Zobacz wyniki" is off | Wybierz wszystkie cztery pola albo pomiń | Pick all four fields or skip |
| Pill, demographics and e-mail capture | Prawie koniec! | Almost done! |
| Pill, results calculation | Prawie gotowe | Almost ready |
| Back control, e-mail capture | Wróć | Go back |
| Progress bar name | Postęp quizu | Quiz progress |
| Loading, for assistive technology | Wczytywanie quizu | Loading the quiz |
| Failed to load, heading | Nie udało się wczytać quizu | The quiz could not be loaded |
| Failed to load, line | Sprawdź połączenie z internetem i spróbuj ponownie. | Check your internet connection and try again. |
| Retry | Spróbuj ponownie | Try again |
| Hand-in, waiting | Liczymy Twoje wyniki | We are calculating your results |
| Hand-in, failed | Nie udało się zapisać Twoich odpowiedzi. Sprawdź połączenie i spróbuj ponownie. | Your answers could not be saved. Check your connection and try again. |
| Gender | Kobieta, Mężczyzna, Inna, Wolę nie podawać | Woman, Man, Other, I prefer not to say |
| Residence | Wieś, Miasto do 50 tys. mieszkańców, Miasto od 50 do 200 tys. mieszkańców, Miasto od 200 do 500 tys. mieszkańców, Miasto powyżej 500 tys. mieszkańców | Village, Town of up to 50,000 residents, City of 50,000 to 200,000 residents, City of 200,000 to 500,000 residents, City of over 500,000 residents |
| Education | Podstawowe, Zasadnicze zawodowe, Średnie, Wyższe | Primary, Basic vocational, Secondary, Higher |

The texts of the quiz - statements, explanations, answers, category names, the quiz name - come from the API in one language and are never put through Lingui.

# Athena components to use

- `Button` for "Idziemy dalej", "Zobacz wyniki", every "Pomiń" and "Spróbuj ponownie" - the frame shows which is the main button and which is the quiet one. Do not build a custom button.
- Not `ProgressBar` directly: the bar is `SurveySaturatedProgressBar`, which wraps it.
- Not `Modal` for the reset confirmation: `SurveyControls` already owns that dialog. Do not add a second one.
- Not `Checkbox`, `RadioGroup` or `ButtonSelect` for answers or topics: answers are `SurveyAnswer`, topics are `SurveyCategorySelect`.
- Not `Select` directly: the four fields are `SurveyDemographics`.
- Not `InfoMessage` for the failed states: it is a one-line hint with an icon, and these are a card with a heading, a line and a button.
- No Athena component fits the loading placeholders.

# Out of scope

- **What an event does to the session**, storage, restoring, the kinds and order of answers, the hand-in body - `survey-session`. Call its functions; do not re-implement a rule here.
- **The API calls and the reading of a quiz** - `survey-api`.
- **The checkpoints phase**: asking for a card, the card frame, "Dalej" and "Wyłącz checkpointy" - `survey-checkpoint`, on top of `survey-checkpoint-engine`.
- **The e-mail capture phase** and its card - `survey-email-capture`.
- **The loader**: its card and lines, the minimum stay, the second try of a failed hand-in, reading the result until it is calculated, the link request and its notice, "Pobierz" and "Pełne wyniki" - `survey-results-calculation`.
- **Short results and the results screen** - the results module. The taker is sent to the results page that already runs.
- **Timing a question** - the checkpoint tasks.
- **Swipe and keys that answer, a question that takes several answers** - not supported.
- **A warning on leaving the page, and stepping back with the browser's back button** - there is none: the browser's back button leaves the questionnaire.
- **Analytics** - no event is sent from this screen.
- **The header and the footer** - the shell draws them around every page.

# Files to create

```
src/pages/
├── quizzes.$quizSlug.tsx                     # slug -> quiz -> not found, or the screen
├── quizzes.$quizSlug.test.tsx
└── _index.tsx                                # the two start handlers (existing file; its test now renders it inside a router)
src/utils/survey/
├── useSurvey.ts                              # reads the quiz: loading, ready, not found, failed; retry
└── useSurvey.test.tsx
src/types/survey.ts                           # + SurveyLoadState, SurveyPhaseContentProps (existing file)
src/components/survey/SurveyQuestionnaire/
├── SurveyQuestionnaire.tsx                   # loading | failed to load | the session
├── SurveyQuestionnaire.test.tsx
├── SurveyQuestionnaire.types.ts
├── SurveyQuestionnaire.stories.tsx
├── SurveyQuestionnaireLoading/               # the placeholders
├── SurveyQuestionnaireLoadError/             # the failed-to-load card
└── SurveyQuestionnaireSession/               # a quiz and its session: the frame and the phase content
    ├── SurveyQuestionnaireSession.tsx
    ├── SurveyQuestionnaireSession.test.tsx
    ├── SurveyQuestionnaireSession.constants.ts   # SURVEY_PHASE_CONTENT, the two durations
    ├── SurveyQuestionnaireFrame/             # the bar, the controls, the announcement of the pill; a slot for the content
    ├── SurveyQuestionnaireTransition/        # the movement between two contents
    ├── SurveyQuestionnaireCategorySelect/
    ├── SurveyQuestionnaireQuestions/
    │   ├── SurveyQuestionnaireAnswers/       # the group of answers and "Pomiń"
    │   └── utils/
    │       └── useQuestionActions.ts         # answer and skip - the one place a done question is handled
    ├── SurveyQuestionnaireDemographics/
    │   ├── SurveyQuestionnaireDemographics.constants.ts   # the labels of the options
    │   └── utils/
    │       └── useDemographicsOptions.ts
    ├── SurveyQuestionnaireHandIn/            # the stand-in; deleted by survey-results-calculation
    │   └── utils/
    │       └── useHandIn.ts
    └── utils/
        ├── getSurveyFrame.ts                 # phase -> bar, pill, back, reset
        ├── getContentKey.ts                  # what counts as "the content changed"
        ├── getChangeDirection.ts             # forwards or backwards
        ├── useScreenLock.ts
        ├── usePhaseFocus.ts                  # focus and scroll when the content changes
        └── useLeave.ts                       # onLeave, and the page shown again from memory
src/components/survey/SurveyPhaseActions/     # the main button and "Pomiń"
├── SurveyPhaseActions.tsx
├── SurveyPhaseActions.test.tsx
├── SurveyPhaseActions.types.ts
└── SurveyPhaseActions.stories.tsx
src/components/survey/SurveySaturatedProgressBar/   # existing: the four changes, a util for the percent, tests, stories
src/components/survey/SurveyControls/               # existing: previousLabel, a test, a story
e2e/survey/
├── questionnaire.spec.ts
└── survey.fixture.ts                         # a small quiz as the API sends it
```

Every component folder holds its `.tsx` and `.test.tsx`; every util and hook has a test next to it. The tree names the pieces the behaviour needs - split further where a file passes the limits of `AGENTS.md` section 3.2, and drop a file that turns out empty. `SurveyPhaseActions` is a sibling component because two phases draw it; `SurveyPhaseContentProps` is a global type because components of later tasks take it.

# Unit test cases (BDD)

```ts
describe('useSurvey()', () => {
  describe('given no quiz identifier', () => {
    it('is not-found and reads nothing', ...);
  });
  describe('given a quiz identifier', () => {
    it('is loading, then ready with the quiz', ...);
    it('asks for the quiz in the language of the app', ...);
    it('is not-found when the quiz does not exist', ...);
    it('is failed when the quiz cannot be read', ...);
    it('does not read the quiz again while it is ready', ...);
  });
  describe('when retry is called', () => {
    it('is loading again and reads the quiz again', ...);
  });
  describe('when the language of the app changes', () => {
    it('reads the quiz again', ...);
  });
  describe('when unmounted while the quiz is on its way', () => {
    it('cancels the request and ignores its result', ...);
  });
});

describe('<QuizPage />', () => {
  it('shows the not-found page for a slug that is not in the map, and reads nothing', ...);
  it('reads the quiz of a known slug, whatever its letter case', ...);
  it('shows the not-found page when the quiz does not exist', ...);
  it('shows the screen while the quiz loads, when it failed and when it is ready', ...);
});

describe('<HomePage />', () => {
  describe('when the featured quiz is started', () => {
    it('opens the address of that quiz', ...);
  });
  describe('when a quiz of the list is started', () => {
    it('opens the address of that quiz', ...);
  });
});

describe('<SurveyQuestionnaire />', () => {
  describe('given a loading quiz', () => {
    it('shows the placeholders and no text or button', ...);
    it('says "Wczytywanie quizu" to assistive technology', ...);
  });
  describe('given a failed read', () => {
    it('shows the heading, the line and the retry button', ...);
    it('announces the failure', ...);
    it('calls onRetry when retry is pressed', ...);
  });
  describe('given a quiz', () => {
    it('shows the phase the session is in', ...);
  });
});

describe('getSurveyFrame()', () => {
  it('draws an empty bar, the quiz name and both controls off on category select', ...);
  it('draws the bar at the progress of the session on questions', ...);
  it('shows the category and the questions left for a question of a visible category', ...);
  it('shows 1 on the last question of a category', ...);
  it('shows the quiz name and no number for a hidden, nameless or missing category', ...);
  it('takes back and reset from canStepBack and canReset', ...);
  it('keeps the bar and the pill of the next question, back off and reset on, on a card', ...);
  it('draws no bar and "Prawie koniec!" on demographics', ...);
  it('draws a full bar, "Prawie koniec!" and a back control named "Wróć" on e-mail capture', ...);
  it('draws no bar and "Prawie gotowe" in results calculation, with reset on only when it failed', ...);
});

describe('<SurveyQuestionnaireSession />', () => {
  describe('the frame', () => {
    it('passes the frame of the phase to the bar and the controls', ...);
    it('draws no bar where the phase has none', ...);
    it('keeps the bar and the controls mounted between two questions', ...);
    it('announces the pill once when it becomes "Prawie koniec!" and "Prawie gotowe"', ...);
    it('passes an empty quiz name for a quiz without one', ...);
  });
  describe('when back is pressed', () => {
    it('calls back of the session', ...);
  });
  describe('when reset is confirmed', () => {
    it('calls reset of the session and shows the first phase', ...);
  });
  describe('when the reset dialog is dismissed', () => {
    it('changes nothing', ...);
  });
  describe('when the content changes', () => {
    it('moves forwards after an answer, a skip and a phase forward', ...);
    it('moves backwards after back', ...);
    it('takes no press until the new content is there', ...);
    it('puts the focus on the top of the new content', ...);
    it('returns the view to the top of the screen', ...);
  });
  describe('given a phase with no content registered', () => {
    it('closes a card phase and shows the question', ...);
    it('leaves an e-mail phase as skipped', ...);
  });
  describe('when onLeave is called', () => {
    it('removes the stored session, then opens the results address of that session in the same tab', ...);
    it('keeps showing what it showed', ...);
    it('navigates once when called twice', ...);
  });
  describe('when the page is shown again from the memory of the browser after leaving', () => {
    it('starts over and shows the first phase of a new session', ...);
  });
});

describe('useScreenLock()', () => {
  it('is locked from lock() until the content has changed', ...);
  it('releases itself after the time limit', ...);
  it('leaves no timer running after unmount', ...);
});

describe('<SurveyQuestionnaireCategorySelect />', () => {
  it('lists the visible categories of the quiz with the limit of the quiz', ...);
  it('passes a toggle to setTopics', ...);
  it('turns "Idziemy dalej" off with no topic picked', ...);
  it('turns it on with one topic, below the limit and at it', ...);
  it('confirms the topics on "Idziemy dalej"', ...);
  it('skips on "Pomiń", with topics picked or not', ...);
});

describe('<SurveyQuestionnaireQuestions />', () => {
  it('shows the statement and the explanation of the current question', ...);
  it('shows the answers with the author labels, in the order of getAnswersToDraw', ...);
  it('names the group of answers by the statement', ...);
  it('draws "Pomiń" after the last answer', ...);
  it('passes no disabled and no selected answer', ...);
  describe('when an answer is pressed', () => {
    it('locks the screen at the press', ...);
    it('records the answer when the acknowledgement has played, once', ...);
  });
  describe('when another answer or "Pomiń" is pressed during the acknowledgement', () => {
    it('ignores it', ...);
  });
  describe('when "Pomiń" is pressed', () => {
    it('records a skip at once', ...);
  });
  describe('when the question changes', () => {
    it('shows the next question with its explanation closed', ...);
    it('shows a stepped-back question with no answer marked', ...);
  });
  describe('given a question with fourteen answers, and one with a single answer', () => {
    it('shows them all, with "Pomiń" under the last', ...);
  });
});

describe('useDemographicsOptions()', () => {
  it('lists 87 ages from 13 to 99, youngest first, labelled with their number', ...);
  it('lists the gender, residence and education options in the order of the table, with their values', ...);
  it('has a label for every value of DEMOGRAPHICS_VALUES', ...);
});

describe('<SurveyQuestionnaireDemographics />', () => {
  it('shows the values the session holds', ...);
  it('passes a pick to setDemographics', ...);
  it('turns "Zobacz wyniki" off with fewer than four fields, and says why to assistive technology', ...);
  it('turns it on with all four, "Wolę nie podawać" included', ...);
  it('leaves as given on "Zobacz wyniki"', ...);
  it('leaves as not given on "Pomiń", whatever is picked', ...);
});

describe('<SurveyQuestionnaireHandIn />', () => {
  describe('when the phase opens', () => {
    it('shows and announces "Liczymy Twoje wyniki"', ...);
    it('sends the hand-in of the session once', ...);
    it('sets the result state to sending', ...);
  });
  describe('given a stored result', () => {
    it('sets the result state to created and leaves', ...);
  });
  describe('given a refused or unreachable hand-in', () => {
    it('sets the result state to failed', ...);
    it('shows the message and the retry button, and announces them', ...);
  });
  describe('when retry is pressed', () => {
    it('shows the waiting state and sends the same hand-in again', ...);
    it('sends one request when pressed twice', ...);
  });
  describe('when unmounted while the request is on its way', () => {
    it('cancels it and ignores its outcome', ...);
  });
});

describe('<SurveyPhaseActions />', () => {
  it('draws the main button with its label, then "Pomiń"', ...);
  it('calls onPrimary and onSkip', ...);
  describe('given isPrimaryDisabled', () => {
    it('disables the main button and keeps "Pomiń" working', ...);
    it('describes the main button with the reason', ...);
  });
});

describe('<SurveySaturatedProgressBar />', () => {
  describe('on first render', () => {
    it('does not flash', ...);
  });
  describe('when the shown value changes', () => {
    it('flashes once and settles', ...);
  });
  describe('when the value changes again during a flash', () => {
    it('ends one flash after the last change', ...);
  });
  describe('when it is rendered again with the same value', () => {
    it('does not flash', ...);
  });
  describe('accessibility', () => {
    it('is a progress bar named "Postęp quizu"', ...);
    it('reports the shown value rounded to a whole percent', ...);
  });
  describe('invalid input', () => {
    it('is empty when maxValue is zero, negative or not a number', ...);
    it('is empty when value is negative or not a number', ...);
    it('is full when value is above maxValue', ...);
    it('uses fractions as given', ...);
  });
});

describe('<SurveyControls />', () => {
  describe('given previousLabel', () => {
    it('names the back control with it', ...);
  });
  describe('given no previousLabel, or a blank one', () => {
    it('names the back control "Poprzednie pytanie"', ...);
  });
});
```

Find elements by role and accessible name. Give the components a session through `useSurveySession` on a small quiz from `createSurvey`, seeded with `getSurveySessionStore(survey).setState(...)`; mock `createResult` and `getSurvey`, never the session logic. The reduced-motion paths are CSS and are checked by eye in Storybook with the system setting on; say so in the PR.

# Storybook stories

`SurveyQuestionnaire.stories.tsx` - one story per state of the frame, in the order of the phase strip. Each story that needs a session seeds it before it renders (`getSurveySessionStore(survey).setState(...)` in the story's `beforeEach`) on a small quiz built with `createSurvey`. No story makes a request.

- `Loading`
- `FailedToLoad`
- `CategorySelect` - five categories, none picked: "Idziemy dalej" off
- `CategorySelectAtLimit` - three picked, the other rows disabled
- `Questions` - a scale question with an explanation, "Polityka zagraniczna", 11 left
- `QuestionsCustomAnswers` - a one-of-many question with long labels
- `QuestionsHiddenCategory` - the pill shows the quiz name
- `QuestionsFirst` - the first question of a quiz without category select: back and reset off
- `Demographics` - nothing picked: "Zobacz wyniki" off
- `DemographicsComplete` - all four picked

The stand-in hand-in has no story: it makes a request when it appears, and it is replaced by the loader of `survey-results-calculation`, which has its own.

`SurveyPhaseActions.stories.tsx` - `Default`, `PrimaryDisabled`.

Existing stories: add `PreviousLabel` to `SurveyControls`. Keep the stories of `SurveySaturatedProgressBar` and check `Flashing` still shows the flash on a change and none on its first draw.

Stories show the component alone, with no decorator, background or fixed width; check them at 320, 360 and 800 px.

# End-to-end test

This is the first survey spec: `e2e/survey/questionnaire.spec.ts`, Gherkin steps as in `e2e/home/home-page.spec.ts`. `playwright.config.ts` already builds and serves the app and the CI job is on - nothing to configure, whatever `AGENTS.md` section 4.6 still says.

**The API is mocked with Playwright routes; no test ever reaches the live API or the live results page.** Fulfil `GET **/v1/survey/**` with the fixture and `POST **/v1/result` with 201, fulfil the results destination (`https://mypolitics.pl/results/**`) with a stub page, and abort every other request to `api.mypolitics.pl`. The fixture is a small quiz in the shape the API sends: three categories with packed names of which one is hidden, and four questions that mix the categories - scale and one-of-many.

```gherkin
Feature: Questionnaire

  Scenario: A taker starts a quiz from the home page and reaches the result
    Given a user is on the home page
    When they start the featured quiz
    Then they are on the address of that quiz and see the topics to pick, with "Idziemy dalej" off
    When they pick a topic and continue
    Then they see the first question, its category and the questions left in the pill
    When they answer two questions and skip the others
    Then they see the demographics card under "Prawie koniec!", with no progress bar
    When they skip demographics
    Then one result is created with the picked topic, the two answers and no demographics
    And they land on the results address that ends with the identifier that was sent

  Scenario: A taker gives demographics
    Given a user opened the quiz, skipped the topics and answered every question
    Then "Zobacz wyniki" is off
    When they pick all four fields
    And they press "Zobacz wyniki"
    Then the result is created with the four values, the age as a number

  Scenario: A refresh keeps the place
    Given a user answered two questions
    When they reload the page
    Then they see the third question again, with the same number in the pill

  Scenario: A taker steps back and starts over
    Given a user answered one question
    When they press back
    Then they see the first question again and back is off
    When they answer it, press reset and confirm
    Then they see the topics to pick again, none picked

  Scenario: A quiz that cannot be read
    Given the API does not answer
    When a user opens the quiz
    Then they see "Nie udało się wczytać quizu"
    When the API answers again and they press "Spróbuj ponownie"
    Then they see the quiz

  Scenario: A quiz the app does not have
    When a user opens the address of an unknown quiz
    Then they see the not-found page inside the shell
```

Edge cases stay in unit tests. `survey-email-capture`, `survey-results-calculation` and `survey-checkpoint` extend this spec where their phase becomes reachable.

# Remember about standards

- Use the standard colors palette, never add colors directly (check https://tailwindcss.com/docs/colors and our color palette in the `src/index.css` file and in [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css))
- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Create a Storybook story for the component with all possible props variants of the component
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)
- Name the branch `feature/survey-questionnaire-102`, following [Conventional Branch](https://conventional-branch.github.io/) - never keep a generated or default branch name
- Read `AGENTS.md` in the repository before starting: one component per file, no `renderX()` functions, helpers and hooks in `utils/` with their own tests, no import from another component's `utils/`, constants or subcomponents
- The screen fills its parent's width and its height comes from its content. Layout that depends on width is CSS; do not measure the element or the window in JavaScript
- Tailwind class names are static: a duration cannot be built into a class name from a constant at runtime
- No new dependency: no animation library, no data-fetching library, no router helper
- No request outside `src/services/api/client/`. The screen calls `getSurvey` and `createResult`; it never uses Axios or `fetch`
- Copy is Polish by default, accessible names included. Run `yarn i18n:extract`, translate every new English entry, commit both catalogs
- Commit only files that belong to the task; commits follow Conventional Commits
- The PR follows the repository's pull request template, with screenshots of the stories next to the frames of the phase strip, and lists the decisions the frames left open - the loading placeholders, the failed states, the movement between contents

# Dependencies

- `survey-api` (#100) - `getSurvey`, `createResult`, `getSurveyId`, `getResultsUrl`, `PATHS.quiz`, the survey types.
- `survey-session` (#101) - `useSurveySession`, `getSurveySessionStore`, and the functions the screen calls: `getVisibleCategories`, `getTopicLimit`, `getCurrentQuestion`, `getProgress`, `getQuestionsLeftInCategory`, `getAnswersToDraw`, `canStepBack`, `canReset`, `buildResultInput`, `DEMOGRAPHICS_VALUES`.

The six survey components it composes are merged (#30, #33, #37, #87, #88, #89).

It blocks `survey-email-capture` (#103), `survey-results-calculation` (#104) and `survey-checkpoint` (#107).

# Resources

- [Figma - the seven phases](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5582-97895) - [category select](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5582-97901) | [questions](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5582-97955) | [checkpoints](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5582-98011) | [demographics](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5582-98067) | [e-mail capture](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5582-98197) | [results calculation](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5583-98319). The last three are linked for their bar, pill and controls only
- [Figma - answer types and the acknowledgement](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=4260-1802) | [progress bar and its flash](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=4237-57347) | [controls](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=4260-1738) | [demographics dialog](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=4275-1703)
- [Spec - Phases model](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/phases-model.md) - the frame in each phase, every phase, reset, the moves, changing what is on screen
- [Spec - Answer model](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/answer-model.md) - answering, skipping, disabled and selected
- [Spec - Progress and pacing](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/progress-and-pacing.md) - the flash, where the bar is drawn, invalid input, accessibility
- [Spec - Demographics](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/demographics.md) - the lists, the buttons, coming back to the card
- [Spec - Session and data](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/session-and-data.md) - finding and reading the quiz, the states before a session exists, leaving
- [Spec - Engaging loader](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/engaging-loader.md) - the phase the stand-in holds the place of; its texts are reused
- [Docs - Phases model](https://github.com/gi-org-pl/product/blob/main/mypolitics/docs/modules/quiz/questionnaire/phases-model.md), [Answer model](https://github.com/gi-org-pl/product/blob/main/mypolitics/docs/modules/quiz/questionnaire/answer-model.md), [Progress and pacing](https://github.com/gi-org-pl/product/blob/main/mypolitics/docs/modules/quiz/questionnaire/progress-and-pacing.md), [Demographics](https://github.com/gi-org-pl/product/blob/main/mypolitics/docs/modules/quiz/data-harvesting/demographics.md), [Session and data](https://github.com/gi-org-pl/product/blob/main/mypolitics/docs/modules/quiz/questionnaire/session-and-data.md)
- [Legacy questionnaire view](https://github.com/gi-org-pl/mypolitics-app-legacy/blob/develop/frontend/src/components/Survey/v3/SingleSurveyPage/SingleSurveyPageView.tsx) - three phases, Framer Motion, a `beforeunload` guard. Context only; copy none of the three
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Storybook docs](https://storybook.js.org/docs/writing-stories)
- [Tailwind docs](https://tailwindcss.com/docs/)
- [Vitest docs](https://vitest.dev/guide/)
- [Playwright - mock APIs](https://playwright.dev/docs/mock)

# Definition of Done

- [ ] Code follows folder structure (`docs/frontend/conventions/PROJECT_STRUCTURE.md`); the route is `src/pages/quizzes.$quizSlug.tsx`, components sit directly in `src/components/survey/`
- [ ] Naming follows `docs/frontend/conventions/NAMING.md`
- [ ] Component layout follows `docs/frontend/conventions/COMPONENT_STRUCTURE.md`: one component per file, no `renderX()` functions, helpers and hooks in `utils/`, each with its own test; nothing imported from another component's `utils/`, constants or subcomponents
- [ ] `/quizzes/{slug}` reads the quiz of a known slug in the language of the app and shows the not-found page for an unknown slug and for a quiz that does not exist
- [ ] Loading shows placeholders and no text; failed to load shows the heading, the line and a retry that works; both are announced
- [ ] The bar, the pill, back, its name and reset follow "The frame in each phase" for all six rows, from one function
- [ ] Category select: the limit of the quiz, "Idziemy dalej" off with no topic, "Pomiń" always on; it does not exist for a quiz with fewer than two visible categories
- [ ] Questions: the author's labels in the order of `getAnswersToDraw`; one press answers after the acknowledgement; "Pomiń" skips at once; no answer is drawn disabled or selected
- [ ] From the press of an answer until the next content is there, no other press does anything, and nothing is drawn disabled meanwhile
- [ ] Demographics: the four lists of the table; "Zobacz wyniki" works only with all four and says why when it is off; "Pomiń" always works; the values survive back, forward and a refresh
- [ ] After demographics the result is handed in once, the taker is sent to `getResultsUrl` in the same tab, and nothing of the session is left in storage; a page shown again from the browser's memory starts over
- [ ] A failed hand-in shows the message, retry sends the same hand-in again, and reset is available
- [ ] Back and reset act through the session; reset asks first, in the dialog that is built
- [ ] Content changes with one short CSS movement, forwards or backwards, no longer than 300 ms, and not at all under reduced motion; no animation library added
- [ ] After a change the view is at the top and focus is on the top of the new content; the bar and the controls stay mounted between questions
- [ ] The three later phases plug in through `SURVEY_PHASE_CONTENT`, `useQuestionActions` and `SURVEY_SESSION_CONFIG`; a phase with no content never holds the quiz
- [ ] `SurveySaturatedProgressBar`: no flash on first draw, none under reduced motion, named "Postęp quizu", reports a whole percent, follows the invalid-input rows
- [ ] `SurveyControls`: `previousLabel` names the back control, "Poprzednie pytanie" by default
- [ ] Both start buttons of the home page open the address of their quiz
- [ ] Athena `Button` is used for every button; no custom button, no second reset dialog
- [ ] The screen fills its parent's width; stories checked at 320 / 360 / 800 px with no horizontal scroll, long labels and statements wrap
- [ ] Unit tests added or updated, BDD style, coverage ≥95% on changed files; every subcomponent, util and hook has its own test file; elements found by role and name
- [ ] Storybook stories added for the states listed above, showing the component alone; none makes a request
- [ ] `e2e/survey/questionnaire.spec.ts` covers the six scenarios with the API and the results page mocked; no test reaches a live address
- [ ] Biome lint clean
- [ ] TypeScript clean (no `any`, no `@ts-ignore`)
- [ ] Every string of the Copy section goes through a Lingui macro, with Polish as the source; `yarn i18n:extract` run, English entries translated, `.po` files committed
- [ ] PR description lists decisions and deviations, and says the reduced-motion paths were checked by eye
- [ ] Branch named `feature/survey-questionnaire-102`
- [ ] CI green: build, lint, test, e2e
