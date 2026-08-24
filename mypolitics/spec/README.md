# Spec

> The technical side of each functionality - how it is actually built.

## What belongs here
[Docs](../docs/README.md) describe the idea: what a functionality is, why it exists, what it risks. A spec describes the same functionality as a system - data model, API, states, permissions, edge cases, limits.

- **One file per functionality** - named after the doc it specifies, so the two line up.
- **Written once the idea settles** - a spec follows a doc, it never replaces one.
- **Starts with a link back** - every spec opens with the doc it implements.
- **Follows the [spec template](../conventions/spec-template.md)** - one shape for front-end, back-end and mixed specs.
- **Grouped by module** - the folders mirror [modules](../docs/modules/README.md), so a spec sits where its doc does.

## Contents
| Folder | Description |
|---|---|
| [Data](./data/) | Datasets, analysis and reports |
| [Media](./media/) | Aggregation and distribution |
| [Platform](./platform/README.md) | Cross-cutting concerns no module owns |
| [Polls](./polls/) | Poll aggregation and predictions |
| [Quiz](./quiz/README.md) | Taking, creating and scoring quizzes |

