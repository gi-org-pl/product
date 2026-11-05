# Story

As a quiz author, I want everything about a result module beyond what it is, where it stands and what it points at to be a pair of a key and a value, so that a new module, a new setting, a new text or a new colour can be added later without changing how my quiz is stored or sent.

# Module properties

**Module:** the result modules configuration - the record, its reading, and the one table of keys the app and the quiz editor work from
**Location:** `src/types/results.ts`, `src/constants/results.ts`, `src/constants/result-modules.ts`, `src/services/api/schemas/`, `src/services/api/utils/result-module/`, `src/utils/result-modules/`
**Shared:** yes - the result screen, comparison and the quiz editor read these records

There is **no component in this task** and nothing a taker sees changes: the same result is drawn from a record of a different shape.

This task replaces what `result-modules-parameters` (#193) built. There the record had a title, a description and three maps - parameters, labels, colours. Here the record keeps only the fields the back-end has a use for, and the title, the description, every setting, every label and every colour are pairs of one list.

```ts
// src/types/results.ts
export type ResultModuleValue = string | number | boolean | null;

// One record for every module type. Its fields are what the back-end has a use for; everything else about the
// module is a value by key.
export interface ResultModule {
  id: string;
  type: ResultModuleType;
  position: number;
  column: ResultModuleColumn;
  orientationIds: string[];
  axisIds: string[];
  values: Record<string, ResultModuleValue>; // by key, as saved: the keys are not interpreted here
}
```

What the API sends, and what the app's own lists hold:

```json
{
  "id": "...",
  "type": "horizontal_bar",
  "position": 4,
  "column": "start",
  "orientationIds": ["...", "..."],
  "axisIds": [],
  "values": [
    { "key": "title", "value": "Partie" },
    { "key": "selection", "value": "linked_to_leader" }
  ]
}
```

`title`, `description`, `params`, `labels` and `colors` are no longer fields of `ResultModule`. Whoever needs one reads it through the keys of the record's type:

```ts
// src/utils/result-modules/values/
export const getModuleValues = <Type extends ResultModuleType>(
  module: ResultModuleOf<Type>,
): ResultModuleValuesOf<Type> => ...
```

# Behaviour

The [spec](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/result-modules-configuration.md) is the source of truth. This task builds its sections "The record" (the three rules), "What each type reads", "Keys", "Keys of the map", and the rows about values and keys of "Reading the list" and "Invalid and edge input".

### One table holds everything about a key

| Table | Holds | A new key is |
|---|---|---|
| The definitions, by key | The kind of value a key holds and what it is when left out | One more entry |
| The keys of each type | The keys a module type reads | The key added to the types that read it |

- Both are data in `src/constants/results.ts`. They replace the definitions and the lists of parameters of #193 and the lists of slots of #181: after this task there is no second place that names a setting, a label or a colour of a module.
- A definition is a description, not a function. Its kind is one of six: a text, a text per language, a number within bounds (whole or not, nothing allowed or not), one of a list of choices, yes or no, a colour. One reader per kind turns a saved value into the value the app works with, chosen from a table by kind.
- A text per language reads like a text - the API sends it in one language - and differs only in what it tells the quiz editor. The definitions carry everything the editor needs to offer a control for a key; the editor itself is not part of this task.
- The keys of the map (`label.centre`, `label.topLeftModerate`, ..., `color.topLeft`, ...) are entries like any other. They may be generated from the lists of the map's names and corners that exist today, as long as the table is the one place they come from.
- The type of what `getModuleValues` gives is derived from the two tables, so a resolver that asks for a key its type does not read does not compile.

### Reading a record

| Case | Reading |
|---|---|
| `values` is a list of pairs | Kept by key. A pair with no key, or with a value that is not a text, a number, a boolean or null, is skipped |
| The same key stands twice | The first counts |
| `values` is missing or is not a list | No values: every key has its default |
| A key the record's type does not read, or one the app does not know | Kept on the record, never interpreted |
| A record sends `title`, `description`, `params`, `labels` or `colors` as fields, as the earlier versions of the contract had it | Not read. Only `values` counts |

### Reading a key

| Case | `getModuleValues` gives |
|---|---|
| A key is left out | Its default, or nothing when it has none: `selection` `all`, `groupBy` `none`, `marker` `50`, `visibleRows` `3`; no title, no description, no label, no colour |
| A text that is blank, or not a text | As if left out |
| `selection` or `groupBy` holds a value that is not allowed | The default |
| `marker` is a number from 0 to 100 | That number |
| `marker` is `null` | `false`: no reference line |
| `marker` is outside 0 to 100 or is not a number | `50` |
| `visibleRows` is a whole number, 1 or more | That number |
| `visibleRows` is below 1, not whole or not a number | `3` |
| A colour that does not pass the app's colour check (`SAFE_COLOR_PATTERN`) | As if left out |
| A type that reads no key but `description` | The description alone, whatever the record holds |

### The app's own lists and everything built on the record

- `OWN_RESULT_MODULES` (`src/constants/result-modules.ts`) is written in the new shape, as the JSON block of the `results-api` task has it: a text is a pair whose value holds each language, and the reading of an own list turns such a value into the text of the language asked for - any value of that shape, whatever its key.
- The resolvers of `src/utils/result-modules/` read the title, the description, their settings, their labels and their colours through `getModuleValues`. What they hand to the screen - `ResolvedModule` and the props of every module - does not change, so no component and no mapper of the result screen changes.
- `createResultModule` and every fixture that writes one of the old fields on a record move it into `values`.

# Out of scope

- **Any module, the result screen and comparison.** They take what the resolvers give, which stays the same.
- **A new key or a new module type.** This task makes room for them and adds none.
- **The quiz editor.** The definitions are written so a form can be built from them; no form is built.
- **Lists or objects as values.** A value is plain.
- **The back-end.** The contract in the spec is its hand-off.

# Files to create

```
src/types/results.ts                                         (the record, a value, the values of a type)
src/constants/results.ts                                     (the definitions and the keys of each type)
src/constants/result-modules.ts                              (the own lists in the new shape)
src/services/api/schemas/resultModule.ts                     (`values` instead of the old fields)
src/services/api/utils/result-module/...                     (reading the pairs; one language for an own list)
src/utils/result-modules/values/getModuleValues.ts           (+ test)
src/utils/result-modules/values/...                          (one reader per kind, each with its test)
src/utils/result-modules/resolvers/...                       (read through `getModuleValues`)
src/utils/vitest/results/createResultModule.ts
```

What #193 added under `src/utils/result-modules/params/` is replaced, not kept beside the new readers.

# Unit test cases (BDD)

- `getModuleValues`: given a record of each type with every one of its keys set, when it is read, then the values come back as set; given the same record with no values, then every default comes back.
- Given each row of "Reading a key", when the record is read, then the behaviour in that row holds - one test per row.
- Given a horizontal bar record that also holds `marker`, `label.centre` and a key nobody defines, when its values are read, then none of the three is in the result, and all are still on the record.
- `readResultModules`: given each row of "Reading a record", then the behaviour in that row holds.
- Given an own list read in Polish and in English, when a value holds both languages, then the record holds the text of the language asked for; a plain value stays as it is.
- Given the app's own lists, when each is resolved against the saved result of its quiz, then what the header and every module are given is what it was before this task (the test and its captured values of #193 stay and pass unchanged).

# Dependencies

- `result-modules-parameters` (#193): done. This task replaces its record and keeps its results.

# Remember about standards
- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md): one function per file, each with its own test
- Name the branch `{type}/{task-name}-{issue number}`, following [Conventional Branch](https://conventional-branch.github.io/) - never keep a generated or default branch name

# Resources
- [Spec: result modules configuration](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/result-modules-configuration.md)
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Vitest docs](https://vitest.dev/guide/)
