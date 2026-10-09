# Quiz spec

> Technical specifications for the quiz module.

## Contents
| File | Description |
|---|---|
| [Answer model](./answer-model.md) | The six kinds of answer, one tap, and skipping |
| [Archetype](./archetype.md) | The named archetype, its match, its description and the ranking |
| [Axis closeness](./axis-closeness.md) | The checkpoint card that says where the taker stands on one axis |
| [Checkpoints](./checkpoints.md) | The frame every checkpoint card sits in, and its two buttons |
| [Demographics](./demographics.md) | The four demographic fields, their lists and when they are sent |
| [Double axis chart](./double-axis-chart.md) | Two opposing orientations on one bar |
| [Double axis puzzle](./double-axis-puzzle.md) | The checkpoint card that asks which of three archetypes is closest |
| [Engaging loader](./engaging-loader.md) | The results calculation phase: the hand-in, the wait and its lines |
| [Event model](./event-model.md) | The running state, and the engine that picks a checkpoint card |
| [Halfway through](./halfway-through.md) | The checkpoint card at the midpoint, with the time left |
| [Header](./header.md) | The top of the result: one orientation, its confidence and the tabs |
| [Horizontal bar chart](./horizontal-bar-chart.md) | A ranked list of orientations, flat or grouped |
| [Module wrapper](./module-wrapper.md) | The frame every result module sits in |
| [Multi axis chart](./multi-axis-chart.md) | Groups of axes, collapsed to their winners |
| [New trait](./new-trait.md) | The checkpoint card that announces a trait earned for good |
| [Nolan chart](./nolan-chart.md) | Two axes crossed into a map |
| [Nolan chart path](./nolan-chart-path.md) | The checkpoint card that draws the route across the compass |
| [Phases model](./phases-model.md) | The questionnaire screen: seven phases, their buttons, back and reset |
| [Progress and pacing](./progress-and-pacing.md) | The progress bar: what counts, what it shows, where it is drawn |
| [Random copy](./checkpoints-random-copy.md) | The pools of lines the checkpoint cards draw their wording from |
| [Results saving and marketing](./results-saving-and-marketing.md) | The e-mail card, and the endpoint that sends the results link |
| [Session and data](./session-and-data.md) | Where a quiz is read from, what a session holds and what is handed in |
| [Single axis chart](./single-axis-chart.md) | One orientation, one bar |
| [Single axis puzzle](./single-axis-puzzle.md) | The checkpoint card that asks which pole of an axis is closer |
| [Stats chart](./stats-chart.md) | The checkpoint card that shows how everyone answered a thesis |
| [Traits](./traits.md) | The traits a taker earned, as a set of pills |
| [Universal axis](./universal-axis.md) | The bar every result module is built from |
| [Universal orientation](./universal-orientation.md) | The one definition of an orientation, and how it is read from the API |

## Build order
The result modules lean on each other, so they are built in steps. Everything inside one step can be built at the same time; a step needs the ones above it only where the last column says so. Steps 0 to 3 are the result modules; steps 4 and up are the questionnaire.

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
| 4 | [Session and data](./session-and-data.md) | Universal orientation, for the reading of the API. Built as two units: the API, then the session |
| 5 | [Answer model](./answer-model.md) | Session and data |
| 5 | [Progress and pacing](./progress-and-pacing.md) | Session and data, for done and all |
| 5 | [Demographics](./demographics.md) | Session and data |
| 6 | [Phases model](./phases-model.md) | Answer model, progress and pacing, demographics - the screen they fill |
| 7 | [Results saving and marketing](./results-saving-and-marketing.md) | Phases model. Its phase stays off until an endpoint exists |
| 7 | [Engaging loader](./engaging-loader.md) | Phases model, session and data |
| 7 | [Event model](./event-model.md) | Session and data. Built as two units: the running state, then the engine |
| 8 | [Random copy](./checkpoints-random-copy.md) | Event model, for the seeded draw |
| 8 | [Checkpoints](./checkpoints.md) | Phases model, event model |
| 9 | [Halfway through](./halfway-through.md) | Checkpoints, random copy |
| 9 | [Axis closeness](./axis-closeness.md) | Checkpoints, random copy; universal axis, to which it adds the bar without value labels |
| 9 | [New trait](./new-trait.md) | Checkpoints, random copy; traits, for the pill. Its trigger cannot fire until the API marks traits |
| 9 | [Nolan chart path](./nolan-chart-path.md) | Checkpoints, random copy; Nolan chart, for the map |
| 9 | [Stats chart](./stats-chart.md) | Checkpoints, random copy; answer model. Its trigger cannot fire until a source of answer counts exists |
| 10 | [Single axis puzzle](./single-axis-puzzle.md) | Axis closeness, for the bar without value labels and the shared gate |
| 11 | [Double axis puzzle](./double-axis-puzzle.md) | Single axis puzzle, for the option row and the bar without numbers; archetype, for the row a hit uncovers |

Four rules are written once and used by more than one module. Each lives in the spec that is built first:

- **Lead rule** - which side of a pair wins, and when it is a tie. In the [double axis chart](./double-axis-chart.md).
- **Match bands** - no match, partial match, match. In the [header](./header.md).
- **Ranked row** - a name, a badge and a one-sided bar. In the [horizontal bar chart](./horizontal-bar-chart.md).
- **Axis row** - a heading naming an axis and its lead, over a double-sided bar. In the [multi axis chart](./multi-axis-chart.md).
