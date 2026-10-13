# Story

As a user reading my result, I want every module on it to show what the quiz author pointed it at, with my own values in it, so that the result I see is the one the author composed and not one a developer wrote for that quiz.

# Module properties

**Module:** the resolution of result modules - turning the records of a quiz and one result into what the header and each module are given
**Location:** `src/types/results.ts`, `src/utils/result-modules/`
**Shared:** yes - the result screen, comparison and the generated result image all draw from it

There is **no component in this task**. It is pure TypeScript: nothing renders, nothing fetches, nothing holds state. The same function is called a second time for a friend's result when two results are compared.

```ts
// src/types/results.ts

// What a result brings: for each orientation its points and its maximum, as the back-end calculated them,
// and the answers given.
export interface QuizResult {
  scores: Record<string, ScoreTotal>; // by orientation identifier
  answers: ResultAnswer[];
}

export interface ResultAnswer {
  questionId: string;
  answerId: string;
}

// An axis with its two poles: the negative side as the start entry, the positive side as the end entry.
export interface ResolvedAxis {
  id: string;
  name?: string;
  start: ResultEntry;
  end: ResultEntry;
}

interface ResolvedModuleBase {
  id: string;
  position: number;
  column: ResultModuleColumn;
  title?: string;
  description?: string;
}

export type ResolvedModule = ResolvedModuleBase &
  (
    | { type: "single_axis"; entry: ResultEntry; marker: number | false }
    | { type: "double_axis"; axis: ResolvedAxis; marker: number | false }
    | { type: "multi_axis"; groups: ResolvedAxisGroup[]; marker: number | false }
    | { type: "horizontal_bar"; entries: ResolvedRankedEntry[]; visibleRows: number }
    | { type: "horizontal_bar"; categories: ResolvedCategory[]; visibleRows: number }
    | { type: "nolan_chart"; horizontal: ResolvedAxis; vertical: ResolvedAxis; labels: Record<string, string>; colors: Record<string, string> }
    | { type: "archetype"; entries: ResultEntry[] }
    | { type: "traits"; traits: Orientation[]; earnedIds: string[] }
  );

export interface ResolvedAxisGroup {
  name?: string;
  axes: ResolvedAxis[];
}

export interface ResolvedRankedEntry extends ResultEntry {
  isOfficial: boolean;
}

export interface ResolvedCategory {
  id: string;
  name?: string;
  entries: ResolvedRankedEntry[];
}

export interface ResolvedHeader {
  orientation?: Orientation; // the leader. Absent = no match
  confidence?: number; // the leader's value
  linkLabel?: string;
}

export interface ResolvedResult {
  leader?: ResultEntry; // absent = nobody leads, or the leader is below a partial match
  header?: ResolvedHeader; // absent = the quiz has no header record
  modules: ResolvedModule[]; // only the ones that can be drawn, in the order they are drawn
}
```

```ts
// src/utils/result-modules/
export const resolveResult = (
  survey: Survey,
  result: QuizResult,
  gender?: DeclaredGender, // of the person the result belongs to; chooses the form of a name and an image
): ResolvedResult => ...
```

The names above are the contract. Shapes that already exist are reused, never redefined: `ResultEntry`, `Orientation`, `ScoreTotal`, and the functions that already turn a quiz axis and scores into two entries (`src/utils/running-state/axes/`), choose a display form (`toDisplayOrientation`), tell a shown orientation (`isOrientationShown`), compute a value from points and a maximum, and tell an earned trait (`isTraitUnlocked`). Where one of them is written in the checkpoint engine's terms and is needed here unchanged, promote it as AGENTS.md section 3.2 says - do not copy it.

# Behaviour

The [spec](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/result-modules-configuration.md) is the source of truth for every case below. This task builds its sections "Terms", "Finding what a record points at", "The leader", "Selection", "Grouping by category", "What each type is given" and "When a record cannot be drawn".

### Values

| Value | How |
|---|---|
| An orientation's value | Its points over its maximum, times 100, from `result.scores`. Absent when it has no score or its maximum is 0 |
| An axis side's value | The points of the side's orientations over their maximums, times 100 - every orientation of the side the quiz has, hidden ones included |
| An orientation's value inside a category | The same arithmetic on the questions of that category alone, from `result.answers` and the quiz - the points and maximums the scoring utilities of the event model already compute per question |

Nothing is rounded here. A module rounds what it draws.

### What a record points at

| Case | Behaviour |
|---|---|
| An orientation the record lists is hidden | Left out |
| An orientation is given to a module | In its display form for the declared gender |
| An axis side has several orientations | Its entry carries the first shown one, with the side's value |
| An axis side has no shown orientation | The axis has no such side |

### The leader

| Case | Behaviour |
|---|---|
| The header record lists shown orientations with values | The one with the highest value |
| Two share the highest value | The one listed first |
| None has a value, or there is no header record | No leader |
| The leader's value is below the partial match threshold (`PARTIAL_MATCH_FROM`) | `header.orientation` and `header.confidence` still carry it; `leader` is absent, so nothing is linked to it |

`header.linkLabel` is the label `link` of the header record.

### Selection, for a horizontal bar record

| Case | Behaviour |
|---|---|
| `all` | Every shown orientation of the record, in the author's order |
| `linked_to_leader` | Of those, the ones the leader's `linkedOrientationIds` name, in the leader's order |
| `linked_to_leader` with no leader | None, so the record is not drawn |

### Grouping by category

| Case | Behaviour |
|---|---|
| A multi axis record, `category` | One group per category of the quiz that is not hidden, in the quiz's order, named after it, holding the record's axes whose category is that one, in the author's order |
| An axis of the record whose category matches no category of the quiz | A last group with no name |
| A multi axis record, `none` | One group with no name holding every axis |
| A horizontal bar record, `category` | `categories`: one per category of the quiz that is not hidden, in the quiz's order, each with the selected orientations and their values inside that category |
| A category in which none of the record's orientations has a value | Still a group, with its entries and no values: the module shows that nothing matches there |
| A horizontal bar record, `none` | `entries`: the selected orientations with their values |

`isOfficial` of a ranked entry is the orientation's official mark.

### Each type

| Type | Resolved as |
|---|---|
| `header` | `header`, as "The leader" says. Never part of `modules` |
| `single_axis` | `entry`: the record's first shown orientation and its value; `marker` |
| `double_axis` | `axis`: the record's first axis with both entries; `marker` |
| `multi_axis` | `groups`; `marker` |
| `horizontal_bar` | `entries` or `categories`; `visibleRows` |
| `nolan_chart` | `horizontal`: the record's axis of type `compass_x_axis`; `vertical`: its axis of type `compass_y_axis`; `labels` and `colors` as read |
| `archetype` | `entries`: every shown orientation of the record with its value |
| `traits` | `traits`: every shown orientation of the record; `earnedIds`: the ones that scored all they could in the whole quiz |

### A record that cannot be drawn is left out of `modules`

| Record | Left out when |
|---|---|
| `single_axis`, `archetype`, `traits` | No shown orientation is left |
| `horizontal_bar` | The selection leaves nothing, or grouping leaves no category |
| `double_axis` | It has no axis, or the axis lacks a side |
| `multi_axis` | No axis with both sides is left. An axis that lacks a side is left out of its group, and a group left empty is not a group |
| `nolan_chart` | It does not find both axes, or one of them lacks a side |

### Invalid and edge input

Nothing here throws.

| Input | Behaviour |
|---|---|
| `survey.resultModules` is empty | `{ modules: [] }` |
| `result.scores` is empty | Every value is absent; modules that need no value are still resolved |
| An answer names a question or an answer the quiz does not have | Ignored |
| The same question answered twice in `result.answers` | The first counts |
| A record lists the same axis under two categories | Cannot happen: an axis has one category |

# Out of scope

- **Reading the list** - done in `result-modules-configuration`.
- **Reading a result from the API** - the API integration task builds `QuizResult` from `GET /v1/result/{id}`.
- **Handing the resolved modules to components** - the result screen task maps each resolved module to its component's props.
- **Comparison.** The result screen calls `resolveResult` once per result and lays one over the other.
- **Changing any module component.**

# Files to create

```
src/types/results.ts                         (add the types above)
src/utils/result-modules/resolveResult.ts
src/utils/result-modules/resolveResult.test.ts
src/utils/result-modules/...                 (one function per file, each with its test)
```

Suggested pieces, each small enough to read at a glance: the value of an orientation; the shown orientations of a record; the leader; the selection; a resolved axis; the groups of axes; the scores inside a category; the earned traits; one resolver per module type, looked up by type from a table - not a chain of conditions.

# Unit test cases (BDD)

- `resolveResult`: given a quiz with one record of every type and a result, when it is resolved, then the header and seven modules come back with what each type is given.
- Given every row of "The leader", "Selection", "Grouping by category" and "A record that cannot be drawn", when the result is resolved, then the behaviour in that row holds - one test per row.
- Given a fixture cut from the identity quiz (identities, parties linked to them, axes with categories, the two compass axes), when a result is resolved, then the leader is the top identity and the parties are the ones linked to it.
- Every function has its own test file.

# Dependencies

- `result-modules-configuration`: the records on `Survey.resultModules`.
- `survey-running-state` (#105): the scoring utilities and the axis poles. Done.

# Remember about standards
- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md): one function per file, each with its own test
- Name the branch `{type}/{task-name}-{issue number}`, following [Conventional Branch](https://conventional-branch.github.io/) - never keep a generated or default branch name

# Resources
- [Spec: result modules configuration](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/result-modules-configuration.md)
- [Spec: event model](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/event-model.md), for a value, a side value and a trait
- [Spec: universal orientation](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/universal-orientation.md)
- [Legacy: the identity quiz result](https://github.com/gi-org-pl/mypolitics-app-legacy/tree/develop/frontend/src/components/Results/ModernResults/Quizzes/IdentityQuizResults/utils), for the rules that used to be code
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
