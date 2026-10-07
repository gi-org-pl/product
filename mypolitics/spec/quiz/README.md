# Quiz spec

> Technical specifications for the quiz module.

## Contents
| File | Description |
|---|---|
| [Archetype](./archetype.md) | The named archetype, its match, its description and the ranking |
| [Double axis chart](./double-axis-chart.md) | Two opposing orientations on one bar |
| [Header](./header.md) | The top of the result: one orientation, its confidence and the tabs |
| [Horizontal bar chart](./horizontal-bar-chart.md) | A ranked list of orientations, flat or grouped |
| [Module wrapper](./module-wrapper.md) | The frame every result module sits in |
| [Multi axis chart](./multi-axis-chart.md) | Groups of axes, collapsed to their winners |
| [Nolan chart](./nolan-chart.md) | Two axes crossed into a map |
| [Single axis chart](./single-axis-chart.md) | One orientation, one bar |
| [Traits](./traits.md) | The traits a taker earned, as a set of pills |
| [Universal axis](./universal-axis.md) | The bar every result module is built from |
| [Universal orientation](./universal-orientation.md) | The one definition of an orientation, and how it is read from the API |

## Build order
The result modules lean on each other, so they are built in steps. Everything inside one step can be built at the same time; a step needs the ones above it only where the last column says so.

| Step | Spec | Needs first |
|---|---|---|
| 0 | [Universal axis](./universal-axis.md) | Nothing |
| 0 | [Module wrapper](./module-wrapper.md) | Nothing |
| 0 | [Universal orientation](./universal-orientation.md) | Nothing |
| 1 | [Single axis chart](./single-axis-chart.md) | Universal axis, module wrapper |
| 1 | [Double axis chart](./double-axis-chart.md) | Universal axis, module wrapper |
| 1 | [Traits](./traits.md) | Module wrapper |
| 1 | [Header](./header.md) | Nothing |
| 1 | [Horizontal bar chart](./horizontal-bar-chart.md) | Universal axis, module wrapper |
| 2 | [Multi axis chart](./multi-axis-chart.md) | Double axis chart, for the lead rule |
| 2 | [Archetype](./archetype.md) | Header, for the match bands; horizontal bar chart, for the ranked row |
| 3 | [Nolan chart](./nolan-chart.md) | Multi axis chart, for the axis row |

Four rules are written once and used by more than one module. Each lives in the spec that is built first:

- **Lead rule** - which side of a pair wins, and when it is a tie. In the [double axis chart](./double-axis-chart.md).
- **Match bands** - no match, partial match, match. In the [header](./header.md).
- **Ranked row** - a name, a badge and a one-sided bar. In the [horizontal bar chart](./horizontal-bar-chart.md).
- **Axis row** - a heading naming an axis and its lead, over a double-sided bar. In the [multi axis chart](./multi-axis-chart.md).
