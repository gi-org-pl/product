# Spec template

> The required shape of every spec file, whatever it specifies.

## How to use it
One template covers all three kinds of spec. The **Kind** field says which one this is, and the sections marked with a kind are kept only when they apply.

- **Front-end** - a component, a screen or a flow the user sees.
- **Back-end** - an endpoint, a job, a store or a rule the user never sees.
- **Mixed** - a functionality with both halves, specified together because splitting it would hide the contract between them.

Rules for filling it in:

- **Cases, not code** - a spec says what happens in each case. Example implementations belong in a task.
- **Tables over prose** - a condition and its expected behaviour, one row each.
- **Delete what does not apply** - an empty section is worse than a missing one.
- **Decide, do not defer** - if a question is still open, answer it with the best call and say what it costs.

## The template

```markdown
# {Title}

> {one line: what is specified here}

Docs: [{Doc title}]({path to the doc it implements}). | Design: [Figma]({link})

![{caption}]({path to the asset})

## Kind
Front-end | Back-end | Mixed

## Scope
What this covers in one paragraph, then what it explicitly does not and where that lives instead.

## Data
*front-end: what the thing receives. back-end: what it stores. mixed: both.*

| Input / Entity | Data | Meaning | Rules |
|---|---|---|---|
| | | | |

Any structure worth a diagram gets one, and any term with a meaning of its own is defined under the table.

## Interface
*what this exposes to the rest of the system, and what it needs from it.*

| Direction | Name | Shape | Notes |
|---|---|---|---|
| | | | |

## Behaviour
*the cases. one table per group of them.*

| Case | Behaviour |
|---|---|
| | |

## States and lifecycle
*front-end: the states it renders. back-end: the states a record moves through, and what moves it.*

| State | Condition | What is possible in it |
|---|---|---|

## Permissions
*back-end and mixed. who may do what, and what happens when they may not.*

| Role | Can | Cannot |
|---|---|---|

## Rules and constraints
The invariants that must hold, the limits that apply, and anything that is deliberately not supported.

## Invalid and edge input
| Input | Behaviour |
|---|---|
| | |

## Privacy and data handling
What personal or special-category data this touches, what it must never join to, and what it keeps.

## Failure modes
| Failure | Behaviour |
|---|---|
| | |

## Non-functional
*front-end: rendering contexts, accessibility, performance. back-end: limits, throughput, retention.*

## Dependencies
The specs and docs this one relies on, and the ones that rely on it.
```
