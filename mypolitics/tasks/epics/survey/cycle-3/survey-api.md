# Story

As a user opening a quiz, I want the app to fetch the quiz from the myPolitics API, to read it safely whatever shape it arrives in, and to be able to hand my answers in and learn that my result is ready, so that a quiz can be taken here from the first question to the result.

# Component properties

**Module:** the survey API layer - the Axios client, the Zod schemas of what the API sends, the survey types, the map from a quiz slug to a survey of the API, and the three calls: read a quiz, create a result, read a result
**Location:** `src/services/api/client/`, `src/services/api/schemas/`, `src/services/api/utils/`, `src/types/`, `src/constants/`, `src/utils/survey/`
**Shared:** yes - the questionnaire, the checkpoints and the results all read a quiz through it

There is **no component in this task**. Nothing renders and nothing holds state. It is the first API code in the app besides the reading of orientations ([#85](https://github.com/gi-org-pl/mypolitics-app/issues/85)), which it reuses.

The API calls it a survey; the product calls it a quiz. Code names say `survey`, texts for people say quiz.

### Types

```ts
// src/types/survey.ts
import type { DeclaredGender, QuizOrientation } from "@/types/orientation";

export type SurveyQuestionAnswerType =
  | "agree-or-disagree" // AGREE_OR_DISAGREE
  | "one-of-many"       // ONE_OF_MANY
  | "other";            // missing or unknown

export interface SurveyPossibleAnswer {
  id: string;               // what an answer is recorded and sent as
  text: string;             // the label, trimmed, in the author's words
  weight: number;           // 0 when missing or not a number
  orientationIds: string[]; // only orientations the quiz has
}

export interface SurveyQuestion {
  id: string;
  categoryId?: string;      // absent when the quiz has no such category
  text: string;             // the statement, trimmed, never empty
  explanation?: string;
  answerType: SurveyQuestionAnswerType;
  possibleAnswers: SurveyPossibleAnswer[]; // in the API's order, at least one
}

export interface SurveyCategory {
  id: string;
  name?: string;            // absent: missing, empty or broken packed text
  weight: number;           // 0 when missing or not a number
  isHidden: boolean;        // packed key `isHidden`; false when absent
}

export interface SurveyAxis {
  id: string;
  name?: string;
  type: string;             // "axis", "compass_x_axis", "compass_y_axis" or anything else, as sent
  description?: string;
  positiveOrientationIds: string[]; // `positiveOrientations`, only orientations the quiz has
  negativeOrientationIds: string[]; // `negativeOrientations`, only orientations the quiz has
  categoryName?: string;    // packed key `category`
  isMain: boolean;          // packed key `isMain`; false when absent
}

export interface Survey {
  id: string;                  // the identifier the quiz was asked for by
  name?: string;               // `title`
  isOfficial: boolean;         // `type` is OFFICIAL
  averageFinishTime?: number;  // minutes for the whole quiz
  algorithm?: string;
  defaultLanguage?: string;
  supportedLanguages: string[];
  orientations: QuizOrientation[];
  categories: SurveyCategory[]; // in the API's order
  axes: SurveyAxis[];           // `axis`, in the API's order
  questions: SurveyQuestion[];  // in the API's order, at least one
}

export type SurveyLoadResult =
  | { status: "ready"; survey: Survey }
  | { status: "not-found" }
  | { status: "failed" };

export type ResidenceAreaSize =
  | "village"
  | "city_below_50k"
  | "city_below_200k"
  | "city_below_500k"
  | "city_over_500k";

export type EducationLevel = "primary" | "basic_vocational" | "secondary" | "higher";

export interface ResultInputDemographics {
  gender: DeclaredGender;
  age: number;
  residenceAreaSize: ResidenceAreaSize;
  education: EducationLevel;
}

export interface ResultInputAnswer {
  questionId: string;
  answerId: string;
}

export interface ResultInput {
  surveyId: string;
  sessionId: string;                 // becomes the identifier of the result
  prioritizedCategories: string[];   // category identifiers
  demographics?: ResultInputDemographics; // all four or left out
  answers: ResultInputAnswer[];
}

export type CreateResultOutcome =
  | "stored"       // created (201), or a result with this identifier already exists (409)
  | "refused"      // any other reply of the API
  | "unreachable"; // no connection, or no reply in time

export interface SurveyResult {
  id: string;            // the identifier the result was asked for by
  isCalculated: boolean;
}
```

```ts
// src/types/api.ts
export interface ApiRequestOptions {
  signal?: AbortSignal;
  timeoutMs?: number; // default API_TIMEOUT_MS
}

export type ApiFailure =
  | { kind: "http"; status: number }
  | { kind: "network" }
  | { kind: "timeout" }
  | { kind: "aborted" };
```

### Constants

```ts
// src/constants/api.ts
export const DEFAULT_API_URL = "https://api.mypolitics.pl/api";
export const API_TIMEOUT_MS = 30_000;

// src/constants/survey.ts
export const QUIZ_SURVEY_IDS: Record<string, string> = {
  mypolitics: "60beb898-a4e4-4160-88c4-07a9931ab499",
  prezydencki2025: "270f6c12-6551-4661-bfcf-52635a703928",
};
export const RESULTS_URL = "https://mypolitics.pl/results";

// src/constants/paths.ts - one entry added to PATHS
quiz: (slug: string) => `/quizzes/${encodeURIComponent(slug)}`,
```

### Calls and helpers

```ts
// src/services/api/client/
export const apiClient: AxiosInstance; // the only Axios instance of the app

export const getSurvey = (
  surveyId: string,
  language: string,
  options?: ApiRequestOptions,
): Promise<SurveyLoadResult> => ...

export const createResult = (
  input: ResultInput,
  options?: ApiRequestOptions,
): Promise<CreateResultOutcome> => ...

export const getResult = (
  resultId: string,
  options?: ApiRequestOptions,
): Promise<SurveyResult> => ...

// src/services/api/utils/survey/
export const readSurvey = (response: unknown, surveyId: string): SurveyLoadResult => ...

// src/utils/survey/
export const getSurveyId = (slug?: string): string | undefined => ...
export const getResultsUrl = (sessionId: string): string => ... // `${RESULTS_URL}/${sessionId}`
```

**None of the three calls ever rejects.** Every failure is one of the values of its return type, so a screen never needs a `try` around a call and never sees an Axios error.

`readSurvey` is the only place that knows a field name of the survey response or reads packed text of a category or an axis. Nothing past it reads `title`, `axis` or a JSON string.

# Behaviour

The [spec](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/session-and-data.md) is the source of truth for every case below; this task builds its data part. The [survey API docs](https://api.mypolitics.pl/api) describe the three endpoints.

### The client

| Case | Behaviour |
|---|---|
| Base address | `VITE_API_URL` when the build sets it to a non-empty value, otherwise `DEFAULT_API_URL` |
| Time limit | A request with no reply within `API_TIMEOUT_MS` counts as failed. A call may pass a shorter `timeoutMs` |
| A request fails in any way | One response interceptor turns it into an `ApiFailure`: a reply with a status outside 2xx is `http` with that status, no connection is `network`, no reply in time is `timeout`, a cancelled request is `aborted` |
| A call is cancelled through its `signal` | It resolves with its failed value - `failed`, `unreachable`, not calculated. The caller that cancelled it ignores the value |
| Anything that needs the API | Goes through `apiClient`. No page, component or util creates an Axios instance or calls `axios` or `fetch` itself |

### The map from slug to quiz - `getSurveyId`

| Case | Behaviour |
|---|---|
| The slug is in `QUIZ_SURVEY_IDS` | Its identifier |
| The slug differs from one in the map only by letter case | It matches |
| The slug is not in the map, is empty or is missing | `undefined` |

The map is kept by hand and holds the two quizzes the running product is configured with. Do not add the other slugs of `src/constants/home.ts`: they have no survey in this API, and a quiz that is not in the map ends on the not-found page.

### Reading the quiz - `getSurvey`

| Case | Behaviour |
|---|---|
| Called | `GET /v1/survey/{surveyId}` with the query parameter `lang` set to `language` |
| The API refuses the request while a language was named - a reply with a 4xx status other than 404. Today it answers 400 to `lang=en` for both quizzes of the map | The quiz is asked for once more, without `lang`. It arrives in its default language |
| The second request is refused too | `failed` |
| The API says the quiz does not exist (404), on either request | `not-found` |
| No connection, no reply within 30 seconds, or a server error | `failed`. It is not asked for again by itself |
| A reply arrives | It is read by `readSurvey`, once |

### The quiz as read - `readSurvey`

| Property | From | Reading |
|---|---|---|
| `id` | - | The identifier the quiz was asked for by, not the `id` of the reply |
| `name` | `title` | The text |
| `isOfficial` | `type` | `true` when `OFFICIAL`, `false` otherwise |
| `averageFinishTime` | `averageFinishTime` | The number |
| `algorithm` | `algorithm` | The text |
| `defaultLanguage`, `supportedLanguages` | The same fields | As sent |
| `orientations` | `orientations` | By `readQuizOrientations` with `isOfficialQuiz` set from `isOfficial`. Do not read an orientation here |
| `categories`, `axes`, `questions` | `categories`, `axis`, `questions` | Item by item, in the API's order - see the types above |
| - | `id`, `description`, `createdAt`, `isPublic`, `logoUrl`, `imageUrl`, `projectId`, `version`, `authors`, a question's `surveyId` and `status`, a possible answer's `questionId` | Not carried. `status` is only read to drop a question |

**Packed text.** A category `name` and an axis `name` may hold a JSON object as text. It is read with the rules and the helper the orientations already use (`packedTextSchema`): recognised by its content, read and never written, a text that is not packed is the name as written, and broken machine text is never shown. The list of keys is closed - do not add one.

| Field | Key | Read as |
|---|---|---|
| Category `name` | `name` | `name` |
| Category `name` | `isHidden` | `isHidden` |
| Axis `name` | `name` | `name` |
| Axis `name` | `category` | `categoryName` |
| Axis `name` | `isMain` | `isMain` |

### Invalid and edge input of a quiz

Nothing here throws, and one bad item never costs the quiz its others - read each list item by item, never with one all-or-nothing parse.

| Input | Behaviour |
|---|---|
| The reply is not an object, or has no list of questions | `failed` |
| No question is left after the rows below | `not-found` |
| A question without an identifier | Dropped |
| Two questions with the same identifier | The first is kept |
| A question whose statement is missing, empty or only space | Dropped |
| A question with a status other than `LIVE` | Dropped |
| A question with no status | Kept |
| A question with no possible answer left | Dropped |
| A question with one possible answer | Kept, as it is |
| A question whose category the quiz does not have | Kept, without a `categoryId` |
| An answer type that is missing or unknown | Kept, as `other` |
| A possible answer without an identifier, or with a text that is missing, empty or only space | Dropped |
| Two possible answers of one question with the same identifier | The first is kept |
| Two possible answers of one question with the same text | Both kept |
| A weight that is missing or not a number | `0` |
| An answer naming an orientation the quiz does not have | That reference is dropped |
| Explanation missing, empty or only space | No explanation |
| A category without an identifier | Dropped |
| Two categories with the same identifier | The first is kept |
| A category name that is missing, empty, or broken packed text | A category without a `name` |
| The list of categories is missing or empty | `categories` is empty |
| An axis without an identifier | Dropped |
| An axis naming an orientation the quiz does not have | That reference is dropped |
| The list of axes is missing or empty | `axes` is empty |
| Average time missing, not a number, or below zero | Absent |
| Name missing or empty | A quiz without a `name` |
| Text with space or line breaks around it | Trimmed |

"An orientation the quiz has" is any orientation `readQuizOrientations` returned, a hidden one included. "A category the quiz has" is any category kept by the rows above, a hidden or nameless one included.

### Creating the result - `createResult`

`POST /v1/result` with the `ResultInput` as it is handed in. The call does not build, check or change the body - the session does that.

| Reply | Outcome |
|---|---|
| Created (201) | `stored` |
| A result with this session identifier already exists (409) | `stored`. An earlier try got through, the page was refreshed, or another tab was first |
| Any other reply - refused as invalid or for any other reason, a server error | `refused` |
| No connection, or no reply in time | `unreachable` |

| Case | Behaviour |
|---|---|
| The body of a 201 reply | Not read. The status decides, so a reply whose `id` differs from the session's is still `stored` |
| `demographics` absent in the input | The request carries no `demographics` key. It is never sent in part and never added |
| The same input is sent again | The same request. Repeating it is always safe |
| A request is refused | The request is never changed to get it accepted, and never sent again by this call. When to retry is the caller's decision |

### Reading the result - `getResult`

`GET /v1/result/{resultId}`, read only to learn that the result is calculated. Nothing else of the reply is carried.

| Reply | `isCalculated` |
|---|---|
| A result whose `results` is empty (`null`) | `false` |
| A result whose `results` holds the calculation - an object with a list of `orientations`, or text that contains one | `true` |
| `results` filled with an empty list of orientations | `true` |
| `results` is text that holds `null` | `false` |
| A result whose `results` is anything else | `false` |
| The result does not exist (404), or the read fails in any way | `false` |

`id` is always the identifier asked for.

### Privacy

- Answers and demographics are special-category data, and the session identifier is a bearer key. Nothing of a request body, a reply or an identifier is written to the console or to any log by this layer.
- The hand-in goes to the result endpoint only. No other request carries an answer.

# Out of scope

- **The session** - what is recorded, stored and restored, and building the `ResultInput`: `survey-session`.
- **When the quiz is read, and what is on screen while it loads or fails** - loading, not found and failed to load, reading again when the language changes: `survey-questionnaire`.
- **When the result is created and read, how often it is retried, and the time limits of the hand-in** - `survey-results-calculation`.
- **Sending the results link** - `survey-email-capture`. No request here carries an e-mail address.
- **The demographic option lists** - `survey-session` (values) and `survey-questionnaire` (labels).
- **Scoring and the running picture** - `survey-running-state`. Weights and orientation identifiers are only carried.
- **Reading an orientation** - built in [#85](https://github.com/gi-org-pl/mypolitics-app/issues/85). Call it; do not change it.
- **Listing quizzes** - not used by the questionnaire.
- **Authentication** - no endpoint used here needs it, so the client has no auth interceptor.

# Files to create

```
src/constants/api.ts                         # DEFAULT_API_URL, API_TIMEOUT_MS
src/constants/survey.ts                      # QUIZ_SURVEY_IDS, RESULTS_URL
src/constants/paths.ts                       # + PATHS.quiz (existing file)
src/types/api.ts
src/types/survey.ts
src/vite-env.d.ts                            # types VITE_API_URL
src/services/api/client/
├── apiClient.ts                             # replaces .gitkeep
├── apiClient.test.ts
├── getSurvey.ts
├── getSurvey.test.ts
├── createResult.ts
├── createResult.test.ts
├── getResult.ts
└── getResult.test.ts
src/services/api/schemas/
├── survey.ts                                # survey, category, question, possible answer and axis, as sent
├── survey.test.ts
├── result.ts                                # the reply of GET /v1/result/{id}
└── result.test.ts
src/services/api/utils/error/
├── toApiFailure.ts                          # anything thrown by Axios -> ApiFailure
└── toApiFailure.test.ts
src/services/api/utils/survey/
├── readSurvey.ts                            # the whole quiz: lists item by item, duplicates, references
├── readSurvey.test.ts
├── readSurvey.fixtures.ts
├── toSurveyQuestion.ts                      # one question with its possible answers
├── toSurveyQuestion.test.ts
├── toSurveyCategory.ts
├── toSurveyCategory.test.ts
├── toSurveyAxis.ts
└── toSurveyAxis.test.ts
src/services/api/utils/result/
├── toSurveyResult.ts                        # a reply, or a failure -> SurveyResult
└── toSurveyResult.test.ts
src/utils/survey/
├── getSurveyId.ts
├── getSurveyId.test.ts
├── getResultsUrl.ts
└── getResultsUrl.test.ts
```

Reuse what exists: `packedTextSchema`, `trimmedTextSchema`, `stringToJsonObjectSchema`, `readQuizOrientations`, `uniqueBy`, `isNumber`. One function per file. Split further only if a file gets hard to read; no empty files.

# Unit test cases (BDD)

```ts
describe('apiClient', () => {
  describe('given no VITE_API_URL', () => {
    it('uses the default address', ...);
  });
  describe('given VITE_API_URL', () => {
    it('uses it', ...);
  });
  it('gives up after API_TIMEOUT_MS', ...);
});

describe('toApiFailure()', () => {
  it('reads a reply with a status as http with that status', ...);
  it('reads a request with no reply as network', ...);
  it('reads a request that ran out of time as timeout', ...);
  it('reads a cancelled request as aborted', ...);
  it('reads anything else as network', ...);
});

describe('getSurveyId()', () => {
  it('returns the identifier of a known slug', ...);
  it('matches a slug whatever its letter case', ...);
  it('returns undefined for an unknown, empty or missing slug', ...);
});

describe('getResultsUrl()', () => {
  it('ends the results address with the session identifier', ...);
});

describe('PATHS.quiz()', () => {
  it('returns the address of a quiz', ...);
});

describe('getSurvey()', () => {
  describe('when called', () => {
    it('asks for the quiz in the given language', ...);
  });
  describe('given a quiz', () => {
    it('resolves ready with the quiz as read', ...);
  });
  describe('given a refusal while a language was named', () => {
    it('asks once more without a language', ...);
    it('resolves ready with the quiz in its default language', ...);
    it('resolves failed when the second request is refused too', ...);
  });
  describe('given a 404', () => {
    it('resolves not-found', ...);
    it('does not ask again', ...);
  });
  describe('given no connection, no reply in time or a server error', () => {
    it('resolves failed', ...);
    it('does not ask again', ...);
  });
  describe('given a reply that is not a quiz', () => {
    it('resolves failed', ...);
  });
  describe('given a quiz with no question left', () => {
    it('resolves not-found', ...);
  });
  describe('when cancelled', () => {
    it('resolves failed without throwing', ...);
  });
});

describe('readSurvey()', () => {
  describe('given something that is not an object, or has no list of questions', () => {
    it('returns failed', ...);
  });
  describe('the quiz', () => {
    it('uses the identifier it was asked for by', ...);
    it('reads title as the name, and has no name when it is missing or empty', ...);
    it('is official only when type is OFFICIAL', ...);
    it('carries the algorithm, the default language and the supported languages', ...);
    it('has no average time when it is missing, not a number or below zero', ...);
    it('reads the orientations with readQuizOrientations and the official mark of the quiz', ...);
  });
  describe('questions', () => {
    it('keeps the order of the API', ...);
    it('drops a question without an identifier', ...);
    it('keeps the first of two questions with the same identifier', ...);
    it('drops a question whose statement is missing, empty or only space', ...);
    it('drops a question whose status is not LIVE, and keeps one with no status', ...);
    it('drops a question left with no possible answer, and keeps one with a single answer', ...);
    it('keeps a question whose category is unknown, without a category', ...);
    it('returns not-found when no question is left', ...);
    it('never throws on a malformed question', ...);
  });
  describe('references', () => {
    it('drops an orientation the quiz does not have from an answer', ...);
    it('drops an orientation the quiz does not have from an axis', ...);
    it('keeps a reference to a hidden orientation', ...);
  });
  describe('given the live shapes', () => {
    it('reads the identity quiz: 102 questions, 5 plain categories, 18 axes with packed names', ...);
    it('reads the presidential quiz: 77 questions, 6 packed category names of which one is hidden, no axes', ...);
  });
});

describe('toSurveyQuestion()', () => {
  it('maps the two answer types, and anything else to other', ...);
  it('trims the statement and the explanation, and has no explanation when it is blank', ...);
  it('drops a possible answer without an identifier or without a text', ...);
  it('keeps the first of two possible answers with the same identifier', ...);
  it('keeps two possible answers with the same text', ...);
  it('reads a missing or non-numeric weight as 0', ...);
  it('keeps the possible answers in the order of the API', ...);
});

describe('toSurveyCategory()', () => {
  it('reads a plain name', ...);
  it('reads a packed name and its hidden mark', ...);
  it('has no name when it is missing, empty or broken packed text', ...);
  it('is not hidden when the mark is absent or of the wrong sort', ...);
  it('ignores packed keys it does not know', ...);
  it('reads a missing weight as 0', ...);
});

describe('toSurveyAxis()', () => {
  it('reads a plain name', ...);
  it('reads a packed name, its category and its main mark', ...);
  it('reads a packed name with raw line breaks, as the identity quiz sends it', ...);
  it('keeps the type as sent', ...);
  it('reads missing lists of orientations as empty', ...);
});

describe('createResult()', () => {
  it('posts the input as it is', ...);
  it('sends no demographics key when the input has none', ...);
  it('resolves stored on 201', ...);
  it('resolves stored on 409', ...);
  it('resolves stored on 201 whatever the body holds', ...);
  it('resolves refused on 400, 404, 422 and 500', ...);
  it('resolves unreachable with no connection and with no reply in time', ...);
  it('honours a shorter time limit passed by the caller', ...);
  it('never sends a second request by itself', ...);
});

describe('getResult()', () => {
  it('is not calculated when results is null', ...);
  it('is calculated when results is an object with orientations', ...);
  it('is calculated when results is text that holds such an object', ...);
  it('is calculated when the list of orientations is empty', ...);
  it('is not calculated when results is the text "null" or anything else', ...);
  it('is not calculated on 404 and on any failed read, without throwing', ...);
  it('returns the identifier it was asked for', ...);
});
```

Build the "live shapes" fixtures from real responses of `GET https://api.mypolitics.pl/api/v1/survey/{id}?lang=pl` for the identity quiz `60beb898-a4e4-4160-88c4-07a9931ab499` and the presidential quiz `270f6c12-6551-4661-bfcf-52635a703928`. Keep them small in the file - a few questions, categories and axes each - and assert the counts of the full quiz against a number, not against a full copy. Test the calls with a stub adapter on `apiClient` or by spying on it; do not add a mocking library and never call the live API from a test.

# Remember about standards

- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Validate what the API sends with Zod and derive the response types from the schemas (`z.infer`) - leniently and per item, as the orientation schema does. The domain types above are written by hand, like `QuizOrientation`
- Read `AGENTS.md` in the repository before starting: section 2 is the only folder layout, and section 4.4 is the rule for API code
- No new dependency. Axios and Zod are in `package.json`
- No Storybook story - there is no component
- No user-visible strings are added, so nothing goes through Lingui
- State in the PR: "No e2e: not mounted on any route"
- Name the branch `feature/survey-api-{issue number}`, following [Conventional Branch](https://conventional-branch.github.io/) - never keep a generated or default branch name
- Commit only files that belong to the task; the PR follows the repository's pull request template

# Dependencies

Nothing blocks this task. `UniversalOrientation` ([#85](https://github.com/gi-org-pl/mypolitics-app/issues/85)) is merged.

It blocks `survey-session`, `survey-questionnaire`, `survey-results-calculation` and `survey-running-state`.

# Resources

- [Spec - Session and data](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/session-and-data.md) - "Where a quiz lives", "The map from slug to quiz", "The quiz as read", "Packed text in categories and axes", "Creating the result", "Reading the result" and "Invalid and edge input - The quiz"
- [Spec - Universal orientation](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/universal-orientation.md) - the reading of `orientations` and the rules for packed text
- [Docs - Session and data](https://github.com/gi-org-pl/product/blob/main/mypolitics/docs/modules/quiz/questionnaire/session-and-data.md)
- [Survey API docs](https://api.mypolitics.pl/api) - `GET /api/v1/survey/{id}` (query `lang`), `POST /api/v1/result` (201, 409), `GET /api/v1/result/{id}`
- [Legacy Zod schemas](https://github.com/gi-org-pl/mypolitics-app-legacy/tree/develop/frontend/src/services/api/schema) - the same endpoints in myPolitics 1.0. Context only: they are strict and parse all or nothing, which is what this task must not do
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Vitest docs](https://vitest.dev/guide/)
- [Zod docs](https://zod.dev/)

# Definition of Done

- [ ] Code follows folder structure (`docs/frontend/conventions/PROJECT_STRUCTURE.md`) and the paths of "Files to create"
- [ ] Naming follows `docs/frontend/conventions/NAMING.md`; one function per file, each with its own test
- [ ] `apiClient` is the only Axios instance; its address is `VITE_API_URL` or the default, its time limit 30 seconds
- [ ] `getSurvey`, `createResult` and `getResult` never reject: every failure is a value of their return types
- [ ] `getSurvey` asks in the given language, asks once more without one when refused, and tells not-found from failed as in the tables
- [ ] `readSurvey` is the only code that names a field of the survey response or reads packed text of a category or an axis; orientations are read by `readQuizOrientations`
- [ ] Every row of "Invalid and edge input of a quiz" holds; a malformed item is dropped without throwing and without losing the rest
- [ ] `createResult` reads 201 and 409 as stored, any other reply as refused, no reply as unreachable, and never changes or repeats the request
- [ ] `getResult` reports calculated only for a result that holds the calculation, as an object or as text
- [ ] `getSurveyId` matches the two slugs of the map whatever their letter case; `PATHS.quiz` and `getResultsUrl` build the two addresses
- [ ] Nothing of a request, a reply or an identifier is written to the console
- [ ] The live-shape fixtures of the identity quiz and the presidential quiz are read correctly
- [ ] API responses validated with Zod; response types derived from the schemas
- [ ] Unit tests added, BDD style, coverage ≥95% on all new files
- [ ] Biome lint clean
- [ ] TypeScript clean (no `any`, no `@ts-ignore`)
- [ ] PR states "No e2e: not mounted on any route" and lists decisions and deviations
- [ ] Branch named `feature/survey-api-{issue number}`
- [ ] CI green: build, lint, test
