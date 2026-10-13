# Result modules configuration

> Technical specification of the one structure that says which result modules a quiz shows, where, and what each is pointed at.

Docs: [Results configuration](../../docs/modules/quiz/results/configuration.md), and [Result modules](../../docs/modules/quiz/results/modules/README.md) for the rule that the author composes the result.

## Kind
Mixed

## Scope
The structure a quiz author's choices about the result are kept in: a list of result modules, each one a record of the same shape whatever it draws. This spec covers the record, what each module type reads from it, how the app turns a record and a result into what a module is given, how the list is read from the API, and what the back-end has to store and send.

It replaces the old result pages, where each quiz had its modules, their order and their orientations written in code.

Not covered here:

- **How points become a value** - scoring, in the [event model](./event-model.md). This spec only says which values a module is given.
- **What a module draws** - each module's own spec. Nothing here changes a module.
- **The result screen** - where the header, the tabs and the columns are, and what happens while a result loads. This spec only says in what order and in which column a module asks to stand.
- **Comparison** - [comparison](../../docs/modules/quiz/results/comparison/README.md). A module receives the other side from the result screen, not from this record.
- **The editor** - the form an author fills in. This spec is what that form saves.
- **Statistics** - whether a module offers its statistics. There is no source of statistics yet, so the record has no field for it.

## Data

### The record
One record per module. A quiz has a list of them.

| Field | Data | Meaning | Rules |
|---|---|---|---|
| Identifier | Text | What the editor and the result screen refer to the module by | Required. Unique within a quiz |
| Type | One of the [types](#types) | Which module draws the record | Required |
| Position | A whole number | Where the module stands among the others, lowest first | Required |
| Column | Start or end | Which of the two columns of a wide screen it stands in | Start unless said |
| Title | Text | The card's name, written by the author | Optional |
| Description | Text | The author's explanation of the module | Optional. When present, the module offers its info action |
| Orientations | A list of identifiers | The orientations the module is about, in the author's order | May be empty |
| Axes | A list of identifiers | The axes the module is about, in the author's order | May be empty |
| Selection | All, or linked to the leader | Which of its orientations the module shows | All unless said |
| Grouping | None, or by category | Whether its rows are one list or one list per category | None unless said |
| Marker | A number from 0 to 100, or none | The reference line on every bar of the module | 50 unless said. None switches the line off |
| Visible rows | A whole number, 1 or more | How many rows a list shows before its fold | 3 unless said |
| Labels | Texts by [slot](#slots) | The author's texts that no orientation and no axis carries | May be empty |
| Colours | Colours by [slot](#slots) | The author's colours that no orientation carries | May be empty |

Every text and every colour is author-supplied and untrusted.

Three rules keep the record the same for every module:

- **A module points, it does not copy.** A name, an image, a colour, a description, a slogan, a website, the official mark, the hidden mark and the linked orientations belong to an [orientation](./universal-orientation.md). The name and the two sides of an axis belong to the axis. A record holds identifiers and never repeats what they lead to.
- **A field means one thing.** A module type reads the fields listed for it [below](#what-each-type-reads) and ignores the others. No type gives a field a second meaning.
- **A text or a colour with no home goes into a slot.** What only one module needs - the label of the header's link, the names on the map - is a named slot of Labels or Colours, not a field of its own.

### Types
| Type | Sent as | Module |
|---|---|---|
| Header | `header` | [Header](./header.md) |
| Single axis | `single_axis` | [Single axis chart](./single-axis-chart.md) |
| Double axis | `double_axis` | [Double axis chart](./double-axis-chart.md) |
| Multi axis | `multi_axis` | [Multi axis chart](./multi-axis-chart.md) |
| Horizontal bar | `horizontal_bar` | [Horizontal bar chart](./horizontal-bar-chart.md) |
| Nolan chart | `nolan_chart` | [Nolan chart](./nolan-chart.md) |
| Archetype | `archetype` | [Archetype](./archetype.md) |
| Traits | `traits` | [Traits](./traits.md) |

A trait, an archetype, a party and a candidate are not types of module, and not types of orientation either: they are what an orientation is used as once a module is pointed at it.

### What each type reads
| Type | Orientations | Axes | Other fields |
|---|---|---|---|
| Header | The pool its orientation is chosen from | - | Label `link` |
| Single axis | The first one: what the card is about | - | Marker |
| Double axis | - | The first one: its two sides are the two poles | Marker |
| Multi axis | - | Every axis it shows | Title, grouping, marker |
| Horizontal bar | What is ranked | - | Title, selection, grouping, visible rows |
| Nolan chart | - | The horizontal and the vertical axis | The map's labels and colours |
| Archetype | Every archetype the quiz scores | - | Title |
| Traits | Every trait the quiz defines | - | Title |

Every type reads the identifier, the type and the description. Every type but the header reads the position and the column: the header is always on top.

### Slots
| Type | Kind | Slot | What it is |
|---|---|---|---|
| Header | Label | `link` | The label of the link to the orientation's website |
| Nolan chart | Label | `centre` | The name of the middle of the map |
| Nolan chart | Label | `horizontalStartModerate`, `horizontalStartExtreme`, `horizontalEndModerate`, `horizontalEndExtreme` | The names of a lean along the horizontal axis, by pole and level |
| Nolan chart | Label | `verticalStartModerate`, `verticalStartExtreme`, `verticalEndModerate`, `verticalEndExtreme` | The same for the vertical axis |
| Nolan chart | Label | `topLeftModerate`, `topLeftExtreme`, and the same for `topRight`, `bottomLeft`, `bottomRight` | The names of a corner of the map, by level |
| Nolan chart | Label | `topLeftModerateShort`, `topLeftExtremeShort`, and the same for the other three corners | A shorter form of a corner's name, for a narrow card |
| Nolan chart | Colour | `topLeft`, `topRight`, `bottomLeft`, `bottomRight` | The colour of a corner |

A slot that is not listed for the record's type is ignored. A slot that is missing leaves the module to its own default, as its spec says.

### Terms
| Term | Meaning |
|---|---|
| Shown orientation | An orientation the quiz has that is not hidden. Only these are ever drawn |
| Value | The orientation's score from 0 to 100, as the [event model](./event-model.md) computes it from the result: points over maximum |
| Side value | The value of one side of an axis: the points of its orientations over their maximums |
| Leader | The shown orientation with the highest value among the header record's orientations. A result has one leader, or none |
| Category | A category of the quiz's questions. An axis belongs to one; an orientation is scored inside each |

## Interface
| Direction | Name | Shape | Notes |
|---|---|---|---|
| In | The quiz | Its orientations, axes and categories | As [session and data](./session-and-data.md) reads them |
| In | The list of records | `resultModules` on the survey the API sends | See the [contract](#the-back-end-contract). Until the API sends it, the app keeps a list for each quiz it knows |
| In | A result | For each orientation its points and its maximum, and the answers given | From `GET /v1/result/{identifier}` |
| Out | The header | The leader, its value as confidence, and the link label | Given to the [header](./header.md) |
| Out | The modules | For each record that can be drawn: what its module takes, its position and its column | Given to the result screen, in order |

### The back-end contract
The repo has no task convention for back-end work, so the contract below is the hand-off. It follows what the survey API already does: one flat record per thing, tied to its survey, with relations as lists of identifiers and texts held per language.

| Field | Sent as | Stored as | Rules |
|---|---|---|---|
| Identifier | `id` | A UUID | Generated by the back-end |
| Survey | - | The survey's identifier | Not sent: the list is read as part of its survey |
| Type | `type` | Text | One of the eight values under [types](#types). Anything else is refused |
| Position | `position` | A whole number | 0 or more |
| Column | `column` | Text | `start` or `end`. `start` when left out |
| Title | `title` | A text per language | Optional. Sent in the language asked for, like every other text of a survey |
| Description | `description` | A text per language | Optional. Sent the same way |
| Orientations | `orientationIds` | A list of identifiers | Each must be an orientation of the same survey. Empty when left out |
| Axes | `axisIds` | A list of identifiers | Each must be an axis of the same survey. Empty when left out |
| Selection | `selection` | Text | `all` or `linked_to_leader`. `all` when left out |
| Grouping | `groupBy` | Text | `none` or `category`. `none` when left out |
| Marker | `marker` | A number, or null | 0 to 100. 50 when left out; null switches it off |
| Visible rows | `visibleRows` | A whole number | 1 or more. 3 when left out |
| Labels | `labels` | Slot names with a text per language each | Sent as slot names with one text each. Only the slots of the record's type are accepted |
| Colours | `colors` | Slot names with a colour each | Only the slots of the record's type are accepted |

- **Where it is sent** - `GET /v1/survey/{identifier}` gains `resultModules`, a list in the order of `position`. A survey with none sends an empty list.
- **Who writes it** - whoever may edit the survey. The endpoints the editor saves through are the editor's to specify; this spec fixes only the record.
- **What it does not replace** - the fields the API still lacks for an orientation and an axis stay asked for where they are named: the seven orientation properties in [universal orientation](./universal-orientation.md), and for an axis its category and a name per language.

Three fields are asked of the back-end here, because the record leans on them:

| Asked for | On | Why |
|---|---|---|
| A category | An axis | Grouping by category needs to know which category an axis belongs to. Today it is packed into the axis name |
| A name per language | An axis | The module draws the axis name. Today it is one text, the same in every language |
| A hidden mark | A category | A hidden category is not a group. Today it is packed into the category name |

## Behaviour

### Reading the list
| Case | Behaviour |
|---|---|
| The survey has no list, or an empty one | The result has no modules and no leader. The result screen says so |
| A record has a type the app does not know | It is skipped. The others are drawn |
| A record breaks a rule of the [record](#the-record) - no identifier, no type, a position that is not a number | It is skipped. The others are drawn |
| Two records have the same identifier | The first is kept |
| Two records have the same position | They keep the order of the list |
| Column, selection or grouping holds a value the app does not know | The default of that field |
| Marker is outside 0 to 100, or not a number and not none | 50 |
| Visible rows is below 1 or not a whole number | 3 |
| A colour is not a plain colour value | It is dropped, and the module uses its default |
| There is more than one header record | The first in order is the header. The others are skipped |

### Finding what a record points at
| Case | Behaviour |
|---|---|
| An identifier names an orientation the quiz does not have | It is left out |
| An identifier names a hidden orientation | It is left out. Hidden wins |
| An identifier names an axis the quiz does not have | It is left out |
| The same identifier is listed twice | The first place counts |
| The type of an orientation does not fit what the module is usually about | Nothing. The author's choice wins and the type is not checked |

### The leader
| Case | Behaviour |
|---|---|
| The header record lists orientations with values | The leader is the one with the highest value |
| Two share the highest value | The one listed first by the author |
| None of them has a value | No leader |
| There is no header record | No leader |
| The leader's value is below 50 | It is still given to the header, which shows no match. For selection it counts as no leader |

The header's confidence is the leader's value. Nothing else in the result is called confidence.

### Selection
| Case | Behaviour |
|---|---|
| All | Every shown orientation of the record |
| Linked to the leader | Of the record's shown orientations, the ones the leader lists as linked, in the leader's order |
| Linked to the leader, and there is no leader | None |

This is the rule the old identity quiz had in code: the parties shown are the ones tied to the taker's leading identity.

### Grouping by category
| Case | Behaviour |
|---|---|
| A module of axes | One group per category of the quiz, in the quiz's order, holding the record's axes of that category in the author's order. The group is named after the category |
| An axis with no category | It stands in a group of its own, with no name, after the others |
| A module of orientations | One group per category of the quiz, each holding the record's orientations with their values scored on that category's questions alone |
| A category with nothing in it, or a hidden one | It is not a group |
| None | One list, in the author's order |

### What each type is given
| Type | Given |
|---|---|
| Header | The leader as its orientation, the leader's value as confidence, the label `link` |
| Single axis | The first shown orientation with its value, the marker |
| Double axis | The first axis: the first shown orientation of its negative side as the start entry and of its positive side as the end entry, each with the side value; the marker |
| Multi axis | The title; for every axis the same two entries as a double axis; groups as above; the marker |
| Horizontal bar | The title; the selected orientations with their values, or the categories each with theirs; visible rows. An orientation marked official carries the verified badge |
| Nolan chart | The axis of type `compass_x_axis` as the horizontal one and of type `compass_y_axis` as the vertical one, each with its name and its two entries as a double axis; the labels and colours of the map |
| Archetype | The title; every shown orientation of the record with its value as its match |
| Traits | The title; every shown orientation of the record as the catalogue; as earned, the ones that scored all they could in the whole quiz, as the [event model](./event-model.md) defines a trait |

Two lists the [event model](./event-model.md) could not find in the survey are settled by the records. The trait list is the orientations of the traits record. The named positions are the orientations of the archetype record. A quiz with no such record has no traits and falls back to the event model's stand-in for named positions.

### When a record cannot be drawn
| Case | Behaviour |
|---|---|
| A single axis, an archetype, a traits or a horizontal bar record is left with no shown orientation | Not drawn |
| A horizontal bar record whose selection leaves nothing | Not drawn |
| A double axis record with no axis, or an axis with an empty side | Not drawn |
| A multi axis record left with no axis that has both sides | Not drawn |
| A Nolan chart record that does not find both of its axes | Not drawn |
| A header record with no leader | Drawn: the header shows no match |

A module that is not drawn leaves no gap, as the [result modules](../../docs/modules/quiz/results/modules/README.md) doc says of a module missing from a quiz.

## States and lifecycle
| State | Condition | What is possible in it |
|---|---|---|
| Not configured | The quiz has no records | The result has nothing to draw |
| Configured | At least one record can be drawn | The result screen draws the header and the modules |

A record does not change while a result is open: it is read with the quiz.

## Permissions
| Role | Can | Cannot |
|---|---|---|
| Anyone | Read the list as part of a public survey | Change it |
| Whoever may edit the survey | Add, change, reorder and remove records | Point a record at an orientation or an axis of another survey |

## Rules and constraints
- **One shape.** No module type has a record of its own, and no record nests another.
- **One header.** A result has at most one.
- **Order is a number.** Position decides the order on a narrow screen and inside each column on a wide one. The header is outside both.
- **Two columns.** A module stands in the start or the end column. No module spans both.
- **Values are never configuration.** A record holds no score, no percentage and no result.
- **Thresholds are constants.** The match bands, the levels of the map and the rule for a trait are fixed in the specs that define them and cannot be set per quiz.
- **Not supported:** a module shown only to some takers, a module that depends on another module, more than one list per quiz.

## Invalid and edge input
| Input | Behaviour |
|---|---|
| A record with both orientations and axes | The type reads the one it is listed with and ignores the other |
| A record with a label or a colour in a slot of another type | The slot is ignored |
| A title or a description that is blank | As if absent |
| A very long list of orientations in a horizontal bar | All are ranked; the fold hides the rest |
| An axis listed in a Nolan chart record that is not a compass axis | It is not used by the map |
| A quiz with a compass and no Nolan chart record | No map. The axes can still be shown by a multi axis record |

## Privacy and data handling
The list is public quiz content. It holds no personal data and nothing about a taker. Its texts are written by a quiz author and are drawn as text, never as markup.

## Failure modes
| Failure | Behaviour |
|---|---|
| The list is missing from the survey | Not configured |
| The list is not a list | Not configured |
| One record cannot be read | That record is skipped |
| A module fails while it draws | The result screen contains it, as the [module wrapper](./module-wrapper.md) leaves to it |

## Non-functional
- **A new type costs no migration.** A type the app does not know is skipped, so the back-end can accept a new one before every app knows it.
- **Nothing is fetched per module.** The list comes with the quiz, and the values come with the result.

## Dependencies
- Relies on [universal orientation](./universal-orientation.md) for what an orientation is, and on [session and data](./session-and-data.md) for how a quiz and its axes are read.
- Relies on the [event model](./event-model.md) for a value, a side value and a trait.
- Relies on the spec of every [type](#types) for what its module takes.
- The result screen and the quiz editor rely on this spec.
