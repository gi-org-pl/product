# Story

As a quiz author, I want the modules of my quiz's result - which ones, in what order, in which column, pointed at which orientations and axes - to be read from one list that travels with the quiz, so that the app draws my result from data and nobody writes a result page in code for my quiz.

# Module properties

**Module:** the result modules configuration - its types, the Zod schema of what the API sends, and the reading of a list into records
**Location:** `src/types/results.ts`, `src/constants/results.ts`, `src/services/api/schemas/`, `src/services/api/utils/result-module/`, `src/services/api/utils/survey/`
**Shared:** yes - the result screen, comparison and the quiz editor read these records

There is **no component in this task**. It is pure TypeScript: nothing renders, nothing fetches, nothing holds state.

```ts
// src/types/results.ts
export type ResultModuleType =
  | "header"
  | "single_axis"
  | "double_axis"
  | "multi_axis"
  | "horizontal_bar"
  | "nolan_chart"
  | "archetype"
  | "traits";

export type ResultModuleColumn = "start" | "end";
export type ResultModuleSelection = "all" | "linked_to_leader";
export type ResultModuleGrouping = "none" | "category";

// One record for every module type. A type reads the fields the spec lists for it and ignores the rest.
export interface ResultModule {
  id: string;
  type: ResultModuleType;
  position: number;
  column: ResultModuleColumn;
  title?: string;
  description?: string;
  orientationIds: string[]; // only orientations the quiz has, each once, in the author's order
  axisIds: string[]; // only axes the quiz has, each once, in the author's order
  selection: ResultModuleSelection;
  groupBy: ResultModuleGrouping;
  marker: number | false; // 0-100. false = no reference line
  visibleRows: number; // 1 or more
  labels: Record<string, string>; // by slot; only the slots of the record's type
  colors: Record<string, string>; // by slot; only the slots of the record's type
}

// src/types/survey.ts
export interface Survey {
  // ...everything it has today
  resultModules: ResultModule[]; // in the order they are drawn; at most one header, and it comes first
}
```

```ts
// src/services/api/utils/result-module/
export const readResultModules = (
  response: unknown, // the `resultModules` of a survey, as sent
  known: { orientationIds: ReadonlySet<string>; axisIds: ReadonlySet<string> },
): ResultModule[] => ...
```

`readResultModules` is the **only** place in the app that knows how the API spells a record. Nothing past it reads `null` for a marker or checks a slot name.

# Behaviour

> **Changed since.** The record described below was reshaped twice after the owner's review. Its fields are now only `id`, `type`, `position`, `column`, `orientationIds` and `axisIds`; the title, the description, the four settings, the labels and the colours are pairs of one list, `values`. The task `result-modules-values` and the spec hold the shape that is built. What this task says about reading a list, the order of the records and the header stands.

The [spec](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/result-modules-configuration.md) is the source of truth for every case below. This task builds its sections "The record", "Types", "Slots", "The back-end contract" (the reading side) and "Reading the list". What a record is turned into - the leader, selection, grouping, what each type is given - is the next task.

### The reading

| Field | From | Reading |
|---|---|---|
| `id` | `id` | As sent |
| `type` | `type` | One of the eight values, as sent |
| `position` | `position` | As sent |
| `column` | `column` | `start` or `end` |
| `title`, `description` | `title`, `description` | The text |
| `orientationIds` | `orientationIds` | The identifiers the quiz has |
| `axisIds` | `axisIds` | The identifiers the quiz has |
| `selection` | `selection` | `all` or `linked_to_leader` |
| `groupBy` | `groupBy` | `none` or `category` |
| `marker` | `marker` | A number as sent; `null` as `false` |
| `visibleRows` | `visibleRows` | As sent |
| `labels` | `labels` | The texts of the slots the type has |
| `colors` | `colors` | The colours of the slots the type has |

The slots of each type are a constant in `src/constants/results.ts`, written once and read by the reader and, later, by the code that hands labels to a module:

| Type | Label slots | Colour slots |
|---|---|---|
| `header` | `link` | - |
| `nolan_chart` | `centre`; `horizontalStartModerate`, `horizontalStartExtreme`, `horizontalEndModerate`, `horizontalEndExtreme`; the same four for `vertical`; for each of `topLeft`, `topRight`, `bottomLeft`, `bottomRight`: `...Moderate`, `...Extreme`, `...ModerateShort`, `...ExtremeShort` | `topLeft`, `topRight`, `bottomLeft`, `bottomRight` |
| every other type | - | - |

### The list

| Case | Behaviour |
|---|---|
| The survey sends no `resultModules`, an empty list, or something that is not a list | `[]` |
| The order of the result | By `position`, lowest first; equal positions keep the order of the list. The header record, when there is one, comes first whatever its position |
| More than one header record | The first in that order is kept, the others are dropped |
| Two records with the same `id` | The first is kept |

### Invalid and edge input

Nothing here throws, and one bad record never costs the quiz its others - read the list item by item, never with one all-or-nothing parse.

| Input | Behaviour |
|---|---|
| A record without an `id`, or with a blank one | Dropped |
| A record whose `type` is missing or not one of the eight | Dropped |
| A record whose `position` is missing or not a finite number | Dropped |
| `column` missing or unknown | `start` |
| `selection` missing or unknown | `all` |
| `groupBy` missing or unknown | `none` |
| `marker` missing, not a number and not `null`, or outside 0 to 100 | `50` |
| `marker` is `null` | `false` |
| `visibleRows` missing, below 1 or not a whole number | `3` |
| `title` or `description` missing, empty or only space | Absent |
| Text with space or line breaks around it | Trimmed |
| `orientationIds` or `axisIds` missing or not a list | `[]` |
| An identifier the quiz does not have | Dropped |
| The same identifier twice in one list | Kept once, at its first place |
| An identifier of a hidden orientation | Kept. Not drawing it is the next task's rule, where hidden is checked for everything at once |
| `labels` or `colors` missing or not an object | `{}` |
| A slot the record's type does not have | Dropped |
| A label that is not text, or blank | Dropped |
| A colour that does not pass the app's colour check (`SAFE_COLOR_PATTERN`) | Dropped |

### The survey

- `surveyResponseSchema` gains `resultModules`, read as loosely as `orientations` is today.
- `readSurvey` hands the list to `readResultModules` with the identifiers of the orientations and axes it has just read, and puts the result on `Survey.resultModules`.
- No quiz in use sends the list yet, so every survey read from the live API has `resultModules: []` after this task. That is the expected result, not a failure.

# Out of scope

- **Turning a record into what a module draws** - the leader, selection, grouping, values. The next task, `result-modules-resolution`.
- **A list kept in the app for the quizzes it knows** - the API integration task.
- **Any component, route or request.**
- **The back-end.** The contract in the spec is its hand-off; nothing is sent or stored by this task.
- **Statistics**, which the record has no field for.

# Files to create

```
src/types/results.ts                                    (add the record and its four unions)
src/types/survey.ts                                     (add `resultModules` to `Survey`)
src/constants/results.ts                                (add the types, the defaults and the slots)
src/services/api/schemas/resultModule.ts
src/services/api/schemas/survey.ts                      (add `resultModules`)
src/services/api/utils/result-module/readResultModules.ts
src/services/api/utils/result-module/readResultModules.test.ts
src/services/api/utils/result-module/...                (one function per file, each with its test)
src/services/api/utils/survey/readSurvey.ts             (hand the list over)
```

Every place that builds a `Survey` by hand - fixtures and test helpers - gains `resultModules: []`.

# Unit test cases (BDD)

- `readResultModules`: given a list with one record of each type, when it is read, then eight records come back with every field as the reading table says.
- Given each row of "The list" and of "Invalid and edge input", when the list is read, then the behaviour in that row holds - one test per row.
- Given a list where the header record has the highest position, when it is read, then the header is first and the others follow by position.
- `readSurvey`: given a survey response with `resultModules` that point at its orientations and axes, when it is read, then `Survey.resultModules` holds them; given a response without the field, then it holds `[]`.

# Dependencies

- `universal-orientation` (#85) and `survey-api` (#100): done. The reader follows the same item-by-item pattern as `readQuizOrientations`.

# Remember about standards
- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md): one function per file, each with its own test
- Name the branch `{type}/{task-name}-{issue number}`, following [Conventional Branch](https://conventional-branch.github.io/) - never keep a generated or default branch name

# Resources
- [Spec: result modules configuration](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/result-modules-configuration.md)
- [Spec: universal orientation](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/universal-orientation.md)
- [Spec: session and data](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/session-and-data.md)
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Vitest docs](https://vitest.dev/guide/)
