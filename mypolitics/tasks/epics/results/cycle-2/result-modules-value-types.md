# Story

As a back-end developer, I want a value of a result module's key-value list to be a string or an integer and nothing else, so that the list is stored and sent in the simplest shape there is.

# Module properties

**Module:** the result modules configuration - what a value of the key-value list may be
**Location:** `src/types/results.ts`, `src/constants/results.ts`, `src/services/api/schemas/`, `src/services/api/utils/result-module/`, `src/utils/result-modules/values/`
**Shared:** yes - the result screen, comparison and the quiz editor read these records

There is **no component in this task** and nothing a taker sees changes.

`result-modules-values` (#195) let a value be a string, a number, a boolean or null. The owner narrowed it: a key is a string, a value is a string or an int.

```ts
// src/types/results.ts
export type ResultModuleValue = string | number; // a number is whole
```

# Behaviour

The [spec](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/result-modules-configuration.md) is the source of truth: "The record", "Keys" and the rows about values of "Reading the list".

### Reading a record

| Case | Reading |
|---|---|
| A value is a string | Kept |
| A value is a whole number | Kept |
| A value is a fraction, a boolean, null, a list or an object | The pair is skipped |

### Reading a key

| Case | `getModuleValues` gives |
|---|---|
| `marker` is a whole number from 0 to 100 | That number |
| `marker` is the string `none` | `false`: no reference line |
| `marker` is anything else - a fraction, a number outside 0 to 100, another string | `50` |
| `visibleRows` is a whole number, 1 or more | That number |
| Every other row of #195's "Reading a key" | Unchanged |

### The kinds of value

- Five kinds are left: a text, a text per language, a whole number within bounds, one of a list of choices, a colour. The yes-or-no kind and its reader are removed: a key that needs yes or no is a choice of two.
- A definition of a number no longer says whether it is whole (it always is) or whether nothing is allowed (nothing is not a value). Where a key has a word that stands for "off", as `none` does for `marker`, the definition names that word and what the app reads it as. No reader knows a key by name.
- What the resolvers hand to the screen does not change: a marker that is switched off is still `false` there.

# Out of scope

- Any module, the result screen and comparison.
- A new key. The app's own lists hold no `marker`, so they do not change.
- The back-end.

# Files to create

```
src/types/results.ts                                  (a value; a number definition)
src/constants/results.ts                              (the definitions of `marker` and `visibleRows`; no yes-or-no kind)
src/services/api/schemas/resultModule.ts              (a value is a string or an integer)
src/services/api/utils/result-module/...              (reading the pairs)
src/utils/result-modules/values/readNumberValue.ts    (+ test)
src/utils/result-modules/values/readBooleanValue.ts   (removed with its test)
```

# Unit test cases (BDD)

- Given each row of "Reading a record" and of "Reading a key", when the record is read, then the behaviour in that row holds - one test per row.
- Given the app's own lists, when each is resolved against the saved result of its quiz, then what the header and every module are given is what it was before this task.

# Dependencies

- `result-modules-values` (#195): done. This task narrows its value.

# Remember about standards
- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md): one function per file, each with its own test
- Name the branch `{type}/{task-name}-{issue number}`, following [Conventional Branch](https://conventional-branch.github.io/) - never keep a generated or default branch name

# Resources
- [Spec: result modules configuration](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/result-modules-configuration.md)
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Vitest docs](https://vitest.dev/guide/)
