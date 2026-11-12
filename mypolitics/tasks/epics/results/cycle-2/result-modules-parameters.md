# Story

As a quiz author, I want every setting of a result module to be a named parameter of the same record, so that a new kind of module or a new setting can be added later without changing the structure my quiz is saved in.

# Module properties

**Module:** the result modules configuration - the record, its reading and the settings each module type reads
**Location:** `src/types/results.ts`, `src/constants/results.ts`, `src/constants/result-modules.ts`, `src/services/api/schemas/`, `src/services/api/utils/result-module/`, `src/utils/result-modules/`
**Shared:** yes - the result screen, comparison and the quiz editor read these records

There is **no component in this task** and nothing a taker sees changes: the same result is drawn from a record of a different shape.

This task changes what `result-modules-configuration` (#181) built. There the four settings of a module - selection, grouping, marker, visible rows - were fields of the record, so a fifth setting would have meant a new field in the app, a new column in the back-end and a new version of the API. Here they become names in one open map, and the record keeps only what every module has.

```ts
// src/types/results.ts
export type ResultModuleParamScalar = string | number | boolean | null;
export type ResultModuleParamValue = ResultModuleParamScalar | ResultModuleParamScalar[];

// One record for every module type. Its fields are what every module has; everything a type can be set to is a
// parameter, a label or a colour, by name.
export interface ResultModule {
  id: string;
  type: ResultModuleType;
  position: number;
  column: ResultModuleColumn;
  title?: string;
  description?: string;
  orientationIds: string[];
  axisIds: string[];
  params: Record<string, ResultModuleParamValue>; // as saved: the names are not interpreted here
  labels: Record<string, string>;
  colors: Record<string, string>;
}
```

`selection`, `groupBy`, `marker` and `visibleRows` are no longer fields of `ResultModule`. Whoever needs one reads it through the parameters of the record's type:

```ts
// src/utils/result-modules/params/
export const getModuleParams = <Type extends ResultModuleType>(
  module: ResultModule & { type: Type },
): ResultModuleParamsOf<Type> => ...
// horizontal_bar -> { selection: "all" | "linked_to_leader"; groupBy: "none" | "category"; visibleRows: number }
// multi_axis     -> { groupBy: "none" | "category"; marker: number | false }
// single_axis, double_axis -> { marker: number | false }
// header, nolan_chart, archetype, traits -> {}
```

# Behaviour

> **Changed since.** The three maps of this task - `params`, `labels`, `colors` - and the fields `title` and `description` became one list of keys and values in the task `result-modules-values`. The idea of this task stands and went further there: definitions as data, one reader per kind, defaults for what is left out.

The [spec](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/result-modules-configuration.md) is the source of truth. This task builds its sections "The record" (the four rules), "What each type reads", "Parameters", and the parameter rows of "Reading the list" and "Invalid and edge input".

### Two tables hold everything about a parameter

| Table | Holds | A new parameter is |
|---|---|---|
| The definitions, by name | What a name may hold and what it is when left out: a choice with its allowed values, or a number with its bounds, whether it must be whole and whether nothing is allowed | One more entry |
| The parameters of each type | The names a module type reads | The name added to the types that read it |

- Both are data in `src/constants/results.ts`. A definition is a description (`{ kind: "choice", values, fallback }`, `{ kind: "number", min, max, whole, nullable, fallback }`), not a function, and one reader per kind turns a saved value into the value the app works with. Reading by kind is a table of readers, not a chain of conditions.
- The types of `getModuleParams`' result are derived from the two tables, so a type that reads a name it has no definition for, or a resolver that asks for a name its type does not read, does not compile.
- `RESULT_MODULE_DEFAULTS` keeps only `column`. `RESULT_MODULE_SELECTIONS` and `RESULT_MODULE_GROUPINGS` become the allowed values of their definitions.

### Reading a record

| Case | Reading |
|---|---|
| `params` is an object | Kept as sent, name by name. A value that is not a number, a text, a boolean, null or a list of those is dropped |
| `params` is missing or is not an object | `{}` |
| A name the record's type does not read, or one the app does not know | Kept on the record, never interpreted |
| A record sends `selection`, `groupBy`, `marker` or `visibleRows` beside `params`, as the first version of the contract had it | Not read. Only `params` counts |

### Reading a parameter

| Case | `getModuleParams` gives |
|---|---|
| The name is left out | Its default: `selection` `all`, `groupBy` `none`, `marker` `50`, `visibleRows` `3` |
| `selection` or `groupBy` holds a value that is not allowed | The default |
| `marker` is a number from 0 to 100 | That number |
| `marker` is `null` | `false`: no reference line |
| `marker` is outside 0 to 100 or is not a number | `50` |
| `visibleRows` is a whole number, 1 or more | That number |
| `visibleRows` is below 1, not whole or not a number | `3` |
| A type that reads no parameter | An empty object, whatever the record holds |

### The app's own lists and everything built on the record

- `OWN_RESULT_MODULES` (`src/constants/result-modules.ts`) is written in the new shape: a setting that differs from its default is a name in `params`, and a setting equal to its default is left out.
- The resolvers of `src/utils/result-modules/resolvers/` read their settings through `getModuleParams`. What they hand to the screen - `ResolvedModule` and the props of every module - does not change, so no component and no mapper of the result screen changes.
- `createResultModule` and every fixture that writes one of the four settings on a record move it into `params`.

# Out of scope

- **Any module, the result screen and comparison.** They take what the resolvers give, which stays the same.
- **A new parameter or a new module type.** This task makes room for them and adds none.
- **Labels and colours.** They stay two maps by slot: a label is held per language and a colour is checked as a colour.
- **The back-end.** The contract in the spec is its hand-off.

# Files to create

```
src/types/results.ts                                         (the record, the value of a parameter, the parameters of a type)
src/constants/results.ts                                     (the definitions and the parameters of each type)
src/constants/result-modules.ts                              (the own lists in the new shape)
src/services/api/schemas/resultModule.ts                     (`params` instead of the four fields)
src/services/api/utils/result-module/toResultModule.ts       (keeps `params`)
src/services/api/utils/result-module/toParamValues.ts        (+ test)
src/utils/result-modules/params/getModuleParams.ts           (+ test)
src/utils/result-modules/params/...                          (one reader per kind, each with its test)
src/utils/result-modules/resolvers/...                       (read through `getModuleParams`)
src/utils/vitest/results/createResultModule.ts
```

# Unit test cases (BDD)

- `getModuleParams`: given a record of each type with every one of its parameters set, when it is read, then the values come back as set; given the same record with no `params`, then every default comes back.
- Given each row of "Reading a parameter", when the record is read, then the behaviour in that row holds - one test per row.
- Given a horizontal bar record that also holds `marker` and a name nobody defines, when its parameters are read, then neither is in the result, and both are still on the record.
- `readResultModules`: given each row of "Reading a record", then the behaviour in that row holds.
- Given the app's own lists, when each is resolved against the saved result of its quiz, then what the header and every module are given is what it was before this task.

# Dependencies

- `result-modules-configuration` (#181), `result-modules-resolution` (#182) and `results-api` (#183): done. This task changes their record and keeps their results.

# Remember about standards
- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md): one function per file, each with its own test
- Name the branch `{type}/{task-name}-{issue number}`, following [Conventional Branch](https://conventional-branch.github.io/) - never keep a generated or default branch name

# Resources
- [Spec: result modules configuration](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/result-modules-configuration.md)
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Vitest docs](https://vitest.dev/guide/)
