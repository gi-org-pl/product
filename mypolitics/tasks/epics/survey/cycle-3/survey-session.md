# Story

As a user taking a quiz, I want the app to remember where I am and what I answered - through every question, a step back, a reset and a refresh of the page - and to hand in exactly what I chose to give, so that I never lose my place and my result is the one I answered for.

# Component properties

**Module:** the session of the questionnaire - its types, the pure functions that read and change it, and the store hook that keeps it in the tab
**Location:** `src/types/survey.ts`, `src/constants/survey.ts`, `src/utils/survey/`
**Shared:** yes - the questionnaire screen, the closing phases and the checkpoints all read and change the same session

There is **no component in this task** and no request. It is the logic the screen (`survey-questionnaire`) is built on: the screen draws a session and raises events; everything that decides what an event does lives here, as pure functions that are tested by replaying events.

### Types

```ts
// src/types/survey.ts - added to the types of survey-api
export type SurveyPhase =
  | "category-select"
  | "questions"
  | "checkpoints"
  | "demographics"
  | "email-capture"
  | "results-calculation"
  | "short-results"; // the results module's phase: part of the contract, never entered here

export interface SurveyAnswerEntry {
  questionId: string;
  answerId?: string; // absent = the question was skipped
}

// The five kinds a question can produce. Each is also a valid `SurveyAnswerType` of the answer button.
export type SurveyAnswerKind =
  | "strongly-agree"
  | "agree"
  | "disagree"
  | "strongly-disagree"
  | "custom";

export interface SurveyAnswerToDraw {
  id: string;    // identifier of the possible answer
  label: string;
  kind: SurveyAnswerKind;
}

// Moved here from SurveyDemographics.types.ts, unchanged - see "Files to create".
export type DemographicsFieldId = "age" | "gender" | "residenceAreaSize" | "education";
export type DemographicsValues = Partial<Record<DemographicsFieldId, string>>;

export interface SurveyEmail {
  address: string;
  hasConsent: boolean;
}

export type SurveyResultState = "not-sent" | "sending" | "created" | "calculated" | "failed";

export interface SurveyTimeSample {
  questionId: string;
  seconds: number; // how long that done question was on screen
}

export interface SurveyCheckpointRecord {
  cardsShown: unknown[];           // the cards put on screen, oldest first. Their shape is survey-checkpoint-engine's
  timeSamples: SurveyTimeSample[]; // at most one per done question; a question that was not timed has none
}

export interface SurveySession {
  id: string;                     // random UUID v4: the session, the seed of every seeded draw, and the result identifier
  surveyId: string;
  entries: SurveyAnswerEntry[];   // one per done question: always the first questions of the quiz, in order, no gap
  topicIds: string[];             // prioritised categories, in the order picked
  areTopicsConfirmed: boolean;
  phase: SurveyPhase;
  areCheckpointsOff: boolean;
  demographics: DemographicsValues;
  areDemographicsGiven: boolean;
  checkpointRecord: SurveyCheckpointRecord;
  email: SurveyEmail | null;      // memory only - never stored
  resultState: SurveyResultState; // memory only - never stored
}

export interface SurveySessionConfig {
  isEmailSendingSetUp: boolean;
}

export interface SurveyProgress {
  done: number; // answered + skipped
  all: number;  // questions of the quiz
}

export type SurveyVisibleCategory = SurveyCategory & { name: string };

export interface SurveySessionApi {
  session: SurveySession;
  setTopics: (topicIds: string[]) => void;
  confirmTopics: () => void;                             // "Idziemy dalej"
  skipTopics: () => void;                                // "Pomiń" on category select
  answer: (answerId: string, seconds?: number) => void;
  skip: (seconds?: number) => void;                      // "Pomiń" under a question
  back: () => void;
  showCheckpoint: (card: unknown) => void;
  closeCheckpoint: () => void;                           // "Dalej"
  turnCheckpointsOff: () => void;                        // "Wyłącz checkpointy"
  setDemographics: (values: DemographicsValues) => void;
  leaveDemographics: (isGiven: boolean) => void;         // true = "Zobacz wyniki", false = "Pomiń"
  setEmail: (email: SurveyEmail | null) => void;
  leaveEmailCapture: (isGiven: boolean) => void;         // true = "Wyślij i zobacz wyniki", false = "Pomiń"
  setResultState: (resultState: SurveyResultState) => void;
  reset: () => void;
  leave: () => void;                                     // the taker is sent to the results: the stored record is removed
  startOver: () => void;                                 // a brand-new session, nothing carried over
}
```

### Constants

```ts
// src/constants/survey.ts - added to the constants of survey-api
export const SURVEY_PHASES: readonly SurveyPhase[]; // the seven, in their fixed order
export const MAX_TOPICS = 3;
export const ADULT_AGE = 18;
export const DEMOGRAPHICS_VALUES: Record<DemographicsFieldId, readonly string[]>; // see "Demographic values"
export const SURVEY_SESSION_CONFIG: SurveySessionConfig = { isEmailSendingSetUp: false };
export const SURVEY_SESSION_STORAGE_KEY = "mypolitics:survey-session"; // the record of a quiz is `${key}:${surveyId}`
export const SURVEY_SESSION_VERSION = 1;
```

`SURVEY_SESSION_CONFIG` is the one switch for the e-mail phase. It is `false` here; `survey-email-capture` sets it from `VITE_RESULTS_EMAIL_URL`.

### Functions

```ts
// src/utils/survey/ - reading. One function per file.
export const getVisibleCategories = (survey: Survey): SurveyVisibleCategory[] => ...
export const getTopicLimit = (survey: Survey): number => ...
export const getFirstPhase = (survey: Survey): SurveyPhase => ...
export const getCurrentQuestion = (survey: Survey, session: SurveySession): SurveyQuestion | undefined => ...
export const getProgress = (survey: Survey, session: SurveySession): SurveyProgress => ...
export const getQuestionsLeftInCategory = (survey: Survey, session: SurveySession, categoryId: string): number => ...
export const getAnswerKind = (question: SurveyQuestion, answer: SurveyPossibleAnswer): SurveyAnswerKind => ...
export const getAnswersToDraw = (question: SurveyQuestion): SurveyAnswerToDraw[] => ...
export const isPhaseInSession = (phase: SurveyPhase, survey: Survey, session: SurveySession, config: SurveySessionConfig): boolean => ...
export const canStepBack = (session: SurveySession): boolean => ...
export const canReset = (session: SurveySession): boolean => ...
export const buildResultInput = (survey: Survey, session: SurveySession): ResultInput => ...

// src/utils/survey/ - starting and restoring
export const createSession = (survey: Survey, options?: { areCheckpointsOff?: boolean }): SurveySession => ...
export const restoreSession = (survey: Survey, stored: unknown, config: SurveySessionConfig): SurveySession => ...

// src/utils/survey/ - the store
export const getSurveySessionStore = (survey: Survey): StoreApi<SurveySession> => ...
export const useSurveySession = (survey: Survey): SurveySessionApi => ...
```

Every action of `SurveySessionApi` is a pure function `(survey, session, ...arguments) => SurveySession` in its own file (listed under "Files to create"). The store holds a `SurveySession` and nothing else; the hook binds the functions to the quiz it was given, so a quiz read again in another language keeps its session.

The seed of every seeded draw is `session.id`. There is no separate seed field.

# Behaviour

Three specs are the source of truth for the cases below: [session and data](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/session-and-data.md) for the session and its storage, the [phases model](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/phases-model.md) for the moves between phases, and the [answer model](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/answer-model.md) for kinds and order. [Progress and pacing](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/progress-and-pacing.md) defines what counts as progress.

### Words

| Word | Means | Function |
|---|---|---|
| Done | A question with an entry: answered or skipped | `getProgress().done` is the number of entries |
| Open | A question without an entry | - |
| The current question | The first open one, `survey.questions[entries.length]` | `getCurrentQuestion` - `undefined` when every question is done |
| Visible category | A category that is not hidden and has a name | `getVisibleCategories`, in the quiz's order |
| Limit | Three, or one fewer than the number of visible categories when that is smaller. Two visible categories give one | `getTopicLimit` - `0` when the quiz has fewer than two |
| Questions left in a category | The open questions that belong to it, the current one included. On the last question of a category it is 1 | `getQuestionsLeftInCategory` |

### Progress - `getProgress`

| Case | Result |
|---|---|
| A question is answered | `done` grows by one |
| A question is skipped | `done` grows by one |
| The taker steps back | `done` shrinks by one |
| Topics are picked, a card is shown or left, demographics, e-mail, results calculation | Nothing changes. `all` is fixed for a session |
| The last question is done | `done` equals `all`, and stays so through the closing phases |
| The session is reset | `done` is 0 |

### Answers to draw - `getAnswerKind`, `getAnswersToDraw`

The kind comes from data: the answer type of the question, then the text of the possible answer, compared trimmed and without regard to letter case.

| Question | Text of the possible answer | Kind |
|---|---|---|
| `agree-or-disagree` | `Zdecydowanie za` | `strongly-agree` |
| `agree-or-disagree` | `Częściowo za`, `Za` | `agree` |
| `agree-or-disagree` | `Częściowo przeciw`, `Przeciw` | `disagree` |
| `agree-or-disagree` | `Zdecydowanie przeciw` | `strongly-disagree` |
| `agree-or-disagree` | Any other text - `Raczej za`, `Agree` | `custom` |
| `one-of-many` or `other` | Any text, `Za` and `Przeciw` included | `custom` |

The table is closed: it does not grow with other wordings or other languages.

| Case | Order of `getAnswersToDraw` |
|---|---|
| A scale question | Strongly agree, agree, disagree, strongly disagree - whatever order the API sent them in |
| A scale question that also has custom answers | The scale first, in its order, then the custom answers in the API's order |
| A scale question with two answers of the same step | Both as that step, next to each other, in the API's order |
| A scale question that lacks a step | The steps it has, in the scale's order |
| A scale question in which no text is recognised | Every answer custom, in the API's order |
| Any other question | The API's order |

| Case | Label |
|---|---|
| Any answer | The text the API sent, in the author's words and letter case. `Zdecydowanie za` stays "Zdecydowanie za" |
| A text with line breaks | One line: the breaks are not kept (`toSingleLine`) |
| Two possible answers with the same text | Two entries. They are different answers |

No answer is ever `custom-selectable` and none is disabled: the API has no way to say either.

### The phases

`SURVEY_PHASES` holds the seven in their fixed order. `isPhaseInSession` says whether a phase is part of this session.

| Phase | Part of a session when |
|---|---|
| `category-select` | The quiz has at least two visible categories |
| `questions` | Always |
| `checkpoints` | Checkpoints are not turned off. Whether a card exists is the event model's |
| `demographics` | Always |
| `email-capture` | `config.isEmailSendingSetUp`, and the age picked in demographics is not under `ADULT_AGE` - whichever button demographics was left with. No age picked counts as not under |
| `results-calculation` | Always |
| `short-results` | Never. It is not built here |

`getFirstPhase` is `category-select` when that phase is part of the session, `questions` otherwise.

### Starting a session - `createSession`

A new identifier (`crypto.randomUUID()`), the quiz identifier, no entries, no topics, topics not confirmed, the first phase, checkpoints on unless told otherwise, no demographics, demographics not given, an empty checkpoint record, no e-mail, result state `not-sent`.

### Events

Each row is one action of `SurveySessionApi`. The second column is when the action applies; called at any other moment it changes nothing. That is what makes two presses one action.

| Action | Applies when | What changes |
|---|---|---|
| `setTopics(ids)` | Phase is `category-select` | Topics become the given ids that are visible categories, each once, in the order given, cut to the limit. Nothing is confirmed |
| `confirmTopics()` | Phase is `category-select` and at least one topic is picked | Topics confirmed. Phase `questions` |
| `skipTopics()` | Phase is `category-select` | Topics emptied, topics confirmed. Phase `questions` |
| `answer(answerId, seconds)` | Phase is `questions`, a question is open and it has that possible answer | An entry with the answer is added, with its time sample. Phase `demographics` when it was the last question, unchanged otherwise |
| `skip(seconds)` | Phase is `questions` and a question is open | An entry without an `answerId` is added, with its time sample. Phase as above |
| `back()` | See "Back" | See "Back" |
| `showCheckpoint(card)` | Phase is `questions`, at least one question is done, a question is open, and checkpoints are on | The card is added to `cardsShown`. Phase `checkpoints` |
| `closeCheckpoint()` | Phase is `checkpoints` | Phase `questions` |
| `turnCheckpointsOff()` | Always | Checkpoints off, for the rest of the session and past a reset. Phase `questions` when it was `checkpoints` |
| `setDemographics(values)` | Phase is `demographics` | Demographics become the given values that are in `DEMOGRAPHICS_VALUES`. Nothing is given yet |
| `leaveDemographics(true)` | Phase is `demographics` and all four fields are picked | Demographics given. Phase `email-capture` when it is part of the session, `results-calculation` otherwise |
| `leaveDemographics(false)` | Phase is `demographics` | Demographics not given. The picked values stay. Phase as above |
| `setEmail(email)` | Phase is `email-capture` or `results-calculation` | The address and the consent are held, in memory. `null` drops them |
| `leaveEmailCapture(true)` | Phase is `email-capture` and an e-mail is held | Phase `results-calculation`. The e-mail stays for the request that follows the result |
| `leaveEmailCapture(false)` | Phase is `email-capture` | The e-mail is dropped. Phase `results-calculation` |
| `setResultState(state)` | Phase is `results-calculation` | Result state |
| `reset()` | See "Reset" | See "Reset" |
| `leave()` | Always | See "Leaving" |
| `startOver()` | Always | See "Leaving" |

| Case | Behaviour |
|---|---|
| `showCheckpoint` after the last question, or while checkpoints are off | Nothing changes. The card is dropped |
| The phase becomes `results-calculation` | Result state is `not-sent` |
| Demographics is left and `email-capture` is not part of the session | Any e-mail held is dropped: an address typed before the taker went back and picked an age under 18 is never used |
| `seconds` is passed to `answer` or `skip` | It is stored as the time sample of that question. Not passed, or not a finite number of zero or more: the question has no sample |
| Any change | Stored at once, so a refresh a moment later finds it |

Measuring the seconds and capping them belongs to the checkpoint tasks (`survey-running-state` defines the sample, `survey-checkpoint` measures it on the screen). This task only keeps a sample for as long as its entry exists. `SurveyTimeSample` and `SurveyCheckpointRecord` have the shape the checkpoint tasks expect of a time sample and of the record, so those tasks can narrow `cardsShown` without changing what is stored.

### Back - `canStepBack`, `back`

| Phase | `canStepBack` | `back()` |
|---|---|---|
| `category-select` | No | Nothing |
| `questions`, no question done | No | Nothing |
| `questions`, at least one done | Yes | The last entry and its time sample are removed. That question is open again, with no trace of what was picked. No card is shown on the way back |
| `checkpoints` | No | Nothing. A card is not a place to go back from |
| `demographics` | Yes | Phase `questions`; the last entry and its time sample are removed. The picked demographics are kept |
| `email-capture` | Yes | Phase `demographics`. Demographics and the held e-mail are kept |
| `results-calculation`, `short-results` | No | Nothing, in every result state |

A step back never removes a card from `cardsShown`.

### Reset - `canReset`, `reset`

| Phase | `canReset` |
|---|---|
| `category-select` | No, even with topics picked |
| `questions` | Yes when there is something to clear: a done question, or confirmed topics that are not empty. No on the first question of a quiz without category select, or of a session that skipped it |
| `checkpoints`, `demographics`, `email-capture` | Yes |
| `results-calculation` | No, except when result state is `failed` |
| `short-results` | No |

`reset()` applies when `canReset` is true: a new session replaces this one (`createSession`) - new identifier and seed, no entries, no topics, no demographics, no e-mail, an empty checkpoint record, the first phase of the quiz. `areCheckpointsOff` is carried over. The confirmation dialog is the screen's: this action is what its confirmation calls.

### The hand-in - `buildResultInput`

| Part | Value |
|---|---|
| `surveyId` | The quiz identifier |
| `sessionId` | The session identifier |
| `prioritizedCategories` | The topics when they were confirmed. An empty list otherwise |
| `demographics` | `gender`, `age` as a number, `residenceAreaSize`, `education` - only when demographics are given and all four are picked. The key is left out otherwise, never sent in part |
| `answers` | One `questionId` and `answerId` per entry that is not a skip, in the quiz's order. A question appears at most once: the first entry of a question wins |

| Case | Result |
|---|---|
| Every question was skipped | `answers` is empty. The input is still built |
| Demographics picked in full and the card left with "Pomiń" | No `demographics` |
| Called twice for the same session | The same input. It is what makes repeating the hand-in safe |
| The e-mail | Never part of the input |

### Demographic values - `DEMOGRAPHICS_VALUES`

The values the API accepts, and nothing else. The labels shown for them are `survey-questionnaire`'s.

| Field | Values, in the order shown |
|---|---|
| `age` | `"13"`, `"14"`, and so on to `"99"` - 87 values, one per year, youngest first. There is no "under 18" value |
| `gender` | `female`, `male`, `other`, `prefer_not_to_share` |
| `residenceAreaSize` | `village`, `city_below_50k`, `city_below_200k`, `city_below_500k`, `city_over_500k` |
| `education` | `primary`, `basic_vocational`, `secondary`, `higher` |

### Storing

| Case | Behaviour |
|---|---|
| Where | The tab's own storage (`sessionStorage`), one record per quiz, under `SURVEY_SESSION_STORAGE_KEY` and the quiz identifier. Never `localStorage`, a cookie or the address |
| What | Identifier, quiz, entries, topics, topics confirmed, phase, checkpoints off, demographics, demographics given, checkpoint record - with `SURVEY_SESSION_VERSION` |
| What is never stored | The e-mail and its consent, and the result state |
| When | From the first change of a session, at every change |
| Two tabs with the same quiz | Two sessions, unaware of each other. Nothing is synchronised between tabs |
| The browser refuses storage, or it is full - at the start or mid-session | The session lives in memory only. Everything works, nothing is shown, a refresh starts over. No call to storage may throw into the app |

### Restoring - `restoreSession`

The store restores once, when it is created for a quiz. `stored` is whatever storage held; the result is always a valid session.

| Stored | Result |
|---|---|
| Nothing | A new session (`createSession`) |
| A record that cannot be read, is not in the shape or version this code writes, or is for another quiz | Thrown away. A new session |
| A valid record | The same session: same identifier, same entries, same phase. E-mail `null`, result state `not-sent` |
| An entry that names a question that is not at its place in the quiz as read now, or an answer that question does not have | That entry and every later one are thrown away, with their time samples. The session continues from there, in `questions` |
| A topic that is not a visible category of the quiz as read now | Dropped from the topics |
| More topics than the limit | The first ones are kept |
| A demographic value that is not in its list | That field is empty, and demographics are not given |
| Demographics marked as given with fewer than four values | Not given |
| A checkpoint record that cannot be read | An empty record. The session is kept |
| A time sample of a question that has no entry, or a second sample of one question | Dropped |
| Phase `category-select` with entries, or in a quiz that no longer has that phase | Repaired, see below |
| A closing phase with open questions | Repaired |
| Phase `questions` with no question open | Repaired |
| Phase `checkpoints` with no question open, or with no card on record | Repaired |
| Phase `email-capture` while that phase is not part of the session - sending is not set up, or the age picked is under 18 | `demographics` |
| Phase `short-results` | Repaired. This code never writes it |
| Phase `checkpoints` with a card on record | Kept: the card that is up is the last of `cardsShown` |
| Phase `results-calculation` with every question done | Kept. The hand-in is sent again with the same identifier, which is safe |

"Repaired" is one rule: `questions` when a question is open, `demographics` when none is.

### Leaving - `leave`, `startOver`

| Case | Behaviour |
|---|---|
| `leave()` | The record of the quiz is removed from storage. The session in memory is left as it is, so the screen keeps showing what it showed until the browser has navigated away |
| After it | Nothing of the session is in storage: no entry, topic, demographic value or card. Nothing is written again unless the session changes |
| The taker comes back to the quiz and the page loads again | Nothing is stored, so a new session starts in the first phase (`restoreSession`) |
| `startOver()` | A new session takes the place of the old one in memory (`createSession`): new identifier, first phase, checkpoints on. Nothing is carried over, the checkpoint opt-out included - unlike a reset |

Opening the results destination is the caller's, and so is calling `startOver()` when the browser shows the finished page again from its memory. `leave` only removes what was stored.

# Deviation from standards

None. The store is Zustand with its `persist` middleware, and `AGENTS.md` section 4.3 asks a ticket that introduces Zustand to name the trigger: the state must persist across a refresh (`sessionStorage`), and it is one state changed by many actions from several components. Say so in the PR description. `zustand` is already in `package.json`; nothing is added.

# Out of scope

- **Reading the quiz, creating and reading the result** - `survey-api`. Nothing here makes a request.
- **Everything on screen** - the frame, the buttons, the lock while the screen changes, the confirmation of a reset, loading and failed to load: `survey-questionnaire`.
- **The labels of the demographic options** - `survey-questionnaire`.
- **What is in a shown card, and validating a stored one** - `survey-checkpoint-engine`. Here a card is `unknown` and is stored as it is given; that task narrows the type.
- **Whether a card is shown after a question, and which** - `survey-checkpoint-engine`. `showCheckpoint` only records the one it is handed.
- **Scores, axes and positions** - `survey-running-state`. **Measuring the time a question took** - `survey-checkpoint`, which passes the seconds to `answer` and `skip`.
- **Whether an address is valid, and the switch from the environment** - `survey-email-capture`.
- **When the hand-in is sent and how its replies move the result state** - `survey-results-calculation`. `setResultState` only records.
- **A warning on leaving the page** - there is none. Do not add a `beforeunload` handler.
- **Resuming on another device or in another tab** - not supported.

# Files to create

```
src/types/survey.ts                           # + the types above (existing file from survey-api)
src/constants/survey.ts                       # + the constants above (existing file from survey-api)
src/utils/survey/
├── getVisibleCategories.ts
├── getTopicLimit.ts
├── getFirstPhase.ts
├── getCurrentQuestion.ts
├── getProgress.ts
├── getQuestionsLeftInCategory.ts
├── getAnswerKind.ts
├── getAnswersToDraw.ts
├── isPhaseInSession.ts
├── canStepBack.ts
├── canReset.ts
├── buildResultInput.ts
├── createSession.ts
├── restoreSession.ts
├── setSessionTopics.ts                       # the actions, one pure function each
├── confirmSessionTopics.ts
├── skipSessionTopics.ts
├── answerQuestion.ts
├── skipQuestion.ts
├── stepBack.ts
├── showSessionCheckpoint.ts
├── closeSessionCheckpoint.ts
├── turnSessionCheckpointsOff.ts
├── setSessionDemographics.ts
├── leaveSessionDemographics.ts
├── setSessionEmail.ts
├── leaveSessionEmailCapture.ts
├── setSessionResultState.ts
├── resetSession.ts
├── getSurveySessionStore.ts                  # one Zustand store per quiz identifier, persisted
└── useSurveySession.ts                       # the hook: the session and its bound actions
src/utils/storage/
└── getSafeSessionStorage.ts                  # sessionStorage that never throws, or nothing
src/utils/vitest/
└── createSurvey.ts                           # a small quiz for tests and stories, like createOrientation
```

Every file has a `.test.ts` next to it. Add a helper only where two functions need the same step, in its own file with its own test.

**One move in a built component.** `DemographicsFieldId` and `DemographicsValues` are defined in `src/components/survey/SurveyDemographics/SurveyDemographics.types.ts`. A global util may not import from a component, and the session now uses both, so move the two types to `src/types/survey.ts` unchanged and make `SurveyDemographics` and its subfolders import them from there. Nothing else in that component changes.

**One name to keep apart.** `SurveyCategorySelect.types.ts` exports its own `SurveyCategory { id, name }` - the shape of a row. It stays. `SurveyVisibleCategory` is assignable to it, so the screen passes `getVisibleCategories(survey)` without importing that type.

# Unit test cases (BDD)

```ts
describe('getVisibleCategories()', () => {
  it('leaves out a hidden category and a category without a name', ...);
  it('keeps the order of the quiz', ...);
});

describe('getTopicLimit()', () => {
  it('is 3 for four or more visible categories', ...);
  it('is 2 for three and 1 for two', ...);
  it('is 0 for one or none', ...);
});

describe('getFirstPhase()', () => {
  it('is category-select for a quiz with two visible categories', ...);
  it('is questions for a quiz with one visible category, or none', ...);
});

describe('getCurrentQuestion()', () => {
  it('is the first question of a new session', ...);
  it('is the question after the last entry', ...);
  it('is undefined when every question is done', ...);
});

describe('getProgress()', () => {
  it('counts an answer and a skip alike', ...);
  it('shrinks by one after a step back', ...);
  it('does not change with topics, a card or a closing phase', ...);
  it('has done equal to all after the last question', ...);
  it('is zero after a reset', ...);
});

describe('getQuestionsLeftInCategory()', () => {
  it('counts the open questions of the category, the current one included', ...);
  it('is 1 on the last question of the category', ...);
  it('counts across a quiz that mixes its categories', ...);
  it('is 0 for a category with no open question', ...);
});

describe('getAnswerKind()', () => {
  describe('given a scale question', () => {
    it('reads the six known texts as their steps', ...);
    it('ignores letter case and space around the text', ...);
    it('reads any other text as custom', ...);
  });
  describe('given a one-of-many question or an unknown type', () => {
    it('reads every answer as custom, "Za" and "Przeciw" included', ...);
  });
});

describe('getAnswersToDraw()', () => {
  it('orders a scale question by the scale whatever the API sent', ...);
  it('puts custom answers after the scale, in the API order', ...);
  it('keeps two answers of the same step next to each other, in the API order', ...);
  it('shows only the steps a question has', ...);
  it('keeps the API order when no text is recognised', ...);
  it('keeps the API order for any other question', ...);
  it('uses the author text as the label, on one line', ...);
  it('keeps two answers with the same text', ...);
  it('handles a question with fourteen answers and a question with one', ...);
});

describe('isPhaseInSession()', () => {
  it('has category-select only with two or more visible categories', ...);
  it('always has questions, demographics and results-calculation', ...);
  it('has checkpoints until they are turned off', ...);
  it('has no email-capture while sending is not set up', ...);
  it('has no email-capture for an age under 18, whichever way demographics was left', ...);
  it('has email-capture for an age of 18 or more, and for no age', ...);
  it('never has short-results', ...);
});

describe('createSession()', () => {
  it('starts in the first phase with a new UUID and nothing recorded', ...);
  it('gives two sessions two identifiers', ...);
  it('carries checkpoints off when told to', ...);
});

describe('setSessionTopics()', () => {
  it('keeps visible categories, once each, in the order given', ...);
  it('cuts the topics to the limit', ...);
  it('changes nothing outside category select', ...);
});

describe('confirmSessionTopics() and skipSessionTopics()', () => {
  it('confirms the topics and moves to questions', ...);
  it('does not confirm with no topic picked', ...);
  it('empties the topics on skip and moves to questions', ...);
});

describe('answerQuestion() and skipQuestion()', () => {
  it('adds an entry with the answer', ...);
  it('adds an entry with a skip', ...);
  it('stores the seconds as the time sample of the question, and no sample without them', ...);
  it('ignores an answer the current question does not have', ...);
  it('moves to demographics after the last question', ...);
  it('changes nothing outside the questions phase', ...);
});

describe('stepBack() and canStepBack()', () => {
  it('cannot step back on category select, on the first question, on a card or in results calculation', ...);
  it('removes the last entry and its time sample', ...);
  it('removes a skip the same way', ...);
  it('returns from demographics to the last question and keeps the picked values', ...);
  it('returns from e-mail capture to demographics and keeps the e-mail', ...);
  it('never removes a shown card', ...);
});

describe('showSessionCheckpoint(), closeSessionCheckpoint(), turnSessionCheckpointsOff()', () => {
  it('records the card and moves to checkpoints', ...);
  it('drops a card after the last question', ...);
  it('drops a card while checkpoints are off', ...);
  it('drops a card before the first done question', ...);
  it('returns to questions on close', ...);
  it('turns checkpoints off and returns to questions', ...);
});

describe('setSessionDemographics() and leaveSessionDemographics()', () => {
  it('keeps only values of the lists', ...);
  it('does not give demographics with fewer than four fields', ...);
  it('marks them given and moves on', ...);
  it('marks them not given on skip and keeps the picked values', ...);
  it('moves to e-mail capture when it is part of the session', ...);
  it('moves to results calculation otherwise, and drops a held e-mail', ...);
  it('sets the result state to not-sent on entering results calculation', ...);
});

describe('setSessionEmail() and leaveSessionEmailCapture()', () => {
  it('holds the address and the consent', ...);
  it('keeps the e-mail when it is given', ...);
  it('drops the e-mail when it is skipped', ...);
  it('treats "given" with no e-mail held as skipped', ...);
});

describe('canReset() and resetSession()', () => {
  it('cannot reset on category select, even with topics picked', ...);
  it('cannot reset on the first question with nothing to clear', ...);
  it('can reset on the first question after topics were confirmed', ...);
  it('can reset on a card, on demographics and on e-mail capture', ...);
  it('can reset in results calculation only when it has failed', ...);
  it('starts a new session with a new identifier in the first phase', ...);
  it('clears entries, topics, demographics, the e-mail and the checkpoint record', ...);
  it('carries checkpoints off over', ...);
});

describe('buildResultInput()', () => {
  it('holds the quiz identifier and the session identifier', ...);
  it('leaves skips out of the answers', ...);
  it('holds a question at most once', ...);
  it('sends confirmed topics, and an empty list when there are none', ...);
  it('sends all four demographics, with the age as a number, when they are given', ...);
  it('leaves demographics out when they were skipped, even if all four are picked', ...);
  it('leaves demographics out when fewer than four are picked', ...);
  it('builds an input with no answers when every question was skipped', ...);
  it('never holds the e-mail', ...);
});

describe('restoreSession()', () => {
  it('starts a new session when nothing is stored', ...);
  it('throws away a record that is not an object, has another version or is for another quiz', ...);
  it('restores a valid record with the same identifier, entries and phase', ...);
  it('restores with no e-mail and result state not-sent', ...);
  it('cuts the entries at the first one that does not fit the quiz, and continues in questions', ...);
  it('drops a topic that is not a visible category, and topics over the limit', ...);
  it('empties a demographic value that is not in its list, and marks them not given', ...);
  it('replaces an unreadable checkpoint record with an empty one', ...);
  it('drops a time sample of a question that has no entry', ...);
  it('repairs a phase the entries do not allow: questions when a question is open, demographics when none is', ...);
  it('keeps a card phase that has a card on record', ...);
  it('moves a stored e-mail phase to demographics when that phase is not part of the session', ...);
  it('keeps results calculation when every question is done', ...);
  it('never throws, whatever it is handed', ...);
});

describe('getSurveySessionStore()', () => {
  it('returns the same store for the same quiz identifier', ...);
  it('writes every change to sessionStorage under the key of the quiz', ...);
  it('writes neither the e-mail nor the result state', ...);
  it('restores the stored session when it is created', ...);
  it('keeps two quizzes in two records', ...);
  it('works in memory when storage throws on read, and when it throws on write', ...);
});

describe('useSurveySession()', () => {
  it('returns the session and applies each action to it', ...);
  it('applies an action once when it is called twice at a moment it applies once', ...);
  describe('when leave is called', () => {
    it('removes the record of the quiz from storage', ...);
    it('leaves the session in memory as it is', ...);
    it('writes nothing to storage afterwards', ...);
  });
  describe('when startOver is called', () => {
    it('replaces the session with a new one in the first phase', ...);
    it('turns checkpoints on again, even if they were off', ...);
  });
  describe('when the quiz is read again in another language', () => {
    it('keeps the session', ...);
  });
});
```

Test the pure functions by replaying events on a small quiz from `createSurvey`: two visible categories and one hidden, mixed in the question order, with scale and one-of-many questions.

# Remember about standards

- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Read `AGENTS.md` in the repository before starting: section 2 is the only folder layout - there is no `stores/` folder, the store is a file in `src/utils/survey/` - and section 3.2 is the rule for where a type lives
- One function per file, each with its own test. The functions are pure: no clock, no storage, no chance except the new identifier in `createSession`
- No new dependency. No React Context for the session
- No Storybook story - there is no component
- No user-visible strings are added, so nothing goes through Lingui
- State in the PR: "No e2e: not mounted on any route", and which Zustand trigger applies
- Name the branch `feature/survey-session-101`, following [Conventional Branch](https://conventional-branch.github.io/) - never keep a generated or default branch name
- Commit only files that belong to the task; the PR follows the repository's pull request template

# Dependencies

- `survey-api` (#100) - the types `Survey`, `SurveyQuestion`, `SurveyPossibleAnswer`, `SurveyCategory` and `ResultInput`, and the files `src/types/survey.ts` and `src/constants/survey.ts` this task adds to.

It blocks `survey-questionnaire` (#102) and `survey-running-state` (#105).

# Resources

- [Spec - Session and data](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/session-and-data.md) - "The session", "What is derived", "What is stored in the browser", "Starting and restoring a session", "Recording", "Creating the result" (the request), "Leaving" and "Invalid and edge input - The stored session"
- [Spec - Phases model](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/phases-model.md) - "The phases", "Moving between phases", "Reset", and the back column of "The frame in each phase"
- [Spec - Answer model](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/answer-model.md) - "From text to kind", "Kind", "Order", "Label", "Skipping"
- [Spec - Progress and pacing](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/progress-and-pacing.md) - "What counts as progress"
- [Spec - Demographics](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/demographics.md) - the values of the four lists, and "What is sent"
- [Docs - Session and data](https://github.com/gi-org-pl/product/blob/main/mypolitics/docs/modules/quiz/questionnaire/session-and-data.md), [Phases model](https://github.com/gi-org-pl/product/blob/main/mypolitics/docs/modules/quiz/questionnaire/phases-model.md), [Answer model](https://github.com/gi-org-pl/product/blob/main/mypolitics/docs/modules/quiz/questionnaire/answer-model.md)
- Legacy, for context only - three phases, answers in `useState`, nothing kept over a refresh: [useSurveyQuestion](https://github.com/gi-org-pl/mypolitics-app-legacy/blob/develop/frontend/src/components/Survey/utils/hooks/v3/useSurveyQuestion.ts), [getResultInput](https://github.com/gi-org-pl/mypolitics-app-legacy/blob/develop/frontend/src/components/Survey/v3/SingleSurveyPage/SurveyDemographics/utils/getResultInput.ts), [the answer kinds by text](https://github.com/gi-org-pl/mypolitics-app-legacy/blob/develop/frontend/src/components/Survey/v3/SingleSurveyPage/SurveyContent/QuestionAnswer/Answer/AnswerView.tsx)
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Zustand - persist](https://zustand.docs.pmnd.rs/middlewares/persist)
- [Vitest docs](https://vitest.dev/guide/)

# Definition of Done

- [ ] Code follows folder structure (`docs/frontend/conventions/PROJECT_STRUCTURE.md`) and the paths of "Files to create"; no `stores/` folder
- [ ] Naming follows `docs/frontend/conventions/NAMING.md`; one function per file, each with its own test
- [ ] The types and constants above exist with these names; `DemographicsFieldId` and `DemographicsValues` live in `src/types/survey.ts` and `SurveyDemographics` imports them from there
- [ ] Kind, order and label of the answers follow the tables; no answer is custom selectable or disabled
- [ ] Progress counts answers and skips alike and nothing else
- [ ] Phase membership follows the table: category select needs two visible categories, e-mail capture needs the switch and a taker who did not pick an age under 18
- [ ] Every action applies only when its row says so and changes exactly what its row says; called twice, it acts once
- [ ] Back and reset follow their tables; a reset carries only the checkpoint opt-out over
- [ ] `buildResultInput` leaves skips out, holds a question once, and sends demographics complete and given or not at all
- [ ] The session is written to `sessionStorage` at every change, one record per quiz; the e-mail and the result state are never written
- [ ] `restoreSession` returns a valid session for every row of the table and never throws
- [ ] Storage that fails leaves the session working in memory, silently
- [ ] `leave` removes the record and leaves the session in memory untouched; `startOver` replaces it with a new session that carries nothing over
- [ ] No `beforeunload` handler, no `localStorage`, no cookie, nothing in the address
- [ ] Zustand trigger named in the PR description
- [ ] Unit tests added, BDD style, coverage ≥95% on all new files
- [ ] Biome lint clean
- [ ] TypeScript clean (no `any`, no `@ts-ignore`)
- [ ] PR states "No e2e: not mounted on any route" and lists decisions and deviations
- [ ] Branch named `feature/survey-session-101`
- [ ] CI green: build, lint, test
