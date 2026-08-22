# Result modules

> The blocks a result screen is composed from.

## Contents
| File | Description |
|---|---|
| [Archetype](./archetype.md) | The named character, its match and its story |
| [Double axis chart](./double-axis-chart.md) | Two opposing orientations on one bar |
| [Header](./header.md) | The verdict at the top of the result |
| [Horizontal bar chart](./horizontal-bar-chart.md) | A ranked list of orientations |
| [Module wrapper](./module-wrapper.md) | The frame every module sits in |
| [Multi axis chart](./multi-axis-chart.md) | Grouped axes, collapsed to their winners |
| [Nolan chart](./nolan-chart.md) | Two axes crossed into a map |
| [Single axis chart](./single-axis-chart.md) | One orientation, one bar |
| [Traits](./traits.md) | The badges earned at full agreement |
| [Universal axis](./universal-axis.md) | The bar everything is built from |

## Context
A result screen is a set of modules, and a module is a [frame](./module-wrapper.md) around an arrangement of [bars](./universal-axis.md). Those two carry everything else.

Two rules make the set small:

- **Every entity with points is an orientation** - ideologies, parties, candidates, archetypes and traits are the same kind of thing, so any chart can render any of them. A quiz decides what its orientations are; the modules do not care.
- **The author composes, we do not** - which modules a quiz shows, what they are called and which orientations they point at is configuration. A module missing from a quiz is simply not drawn - see [short results card](../short-results-card.md).
