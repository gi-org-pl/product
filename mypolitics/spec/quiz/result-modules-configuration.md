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
- **Statistics** - whether a module offers its statistics. There is no source of statistics yet, so no key is defined for it.

## Data

### The record
One record per module. A quiz has a list of them.

| Field | Data | Meaning | Rules |
|---|---|---|---|
| Identifier | Text | What the editor and the result screen refer to the module by | Required. Unique within a quiz |
| Type | A name | Which module draws the record. See [types](#types) | Required |
| Position | A whole number | Where the module stands among the others, lowest first | Required |
| Column | Start or end | Which of the two columns of a wide screen it stands in | Start unless said |
| Orientations | A list of identifiers | The orientations the module is about, in the author's order | May be empty |
| Axes | A list of identifiers | The axes the module is about, in the author's order | May be empty |
| Values | A list of pairs, each a [key](#keys) and a value | Everything else about the module: its title, its description, its settings, its texts and its colours | May be empty. A key that is left out has its default |

A key is a string. A value is a string or a whole number (an int). Every text and every colour is author-supplied and untrusted.

Three rules keep the record the same for every module, and keep it from ever needing a new field:

- **A module points, it does not copy.** A name, an image, a colour, a description, a slogan, a website, the official mark, the hidden mark and the linked orientations belong to an [orientation](./universal-orientation.md). The name, the category and the two sides of an axis belong to the axis. A record holds identifiers and never repeats what they lead to.
- **A field is what the back-end has a use for.** It orders the modules by position, and it keeps the two lists of identifiers true: every one belongs to the same quiz, and one is taken off the lists when its orientation or its axis is removed. Nothing else is a field.
- **Everything else is a key.** What the module is called, what it explains, how it is set and what it says or paints in a place of its own is a pair in Values. The back-end stores a pair and sends it back without knowing the key. What a key means, what it may hold and what it is when left out is written once, in the [table of keys](#keys), and the app and the quiz editor both work from that table. A new module, a new setting, a new text and a new colour are new keys: the record, the tables it is stored in and the API stay as they are.

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

The list is the app's, not the back-end's: a type is a name the app has a module for. A new module is a new name, with a row here and in the two tables below, and nothing else in this structure changes.

A trait, an archetype, a party and a candidate are not types of module, and not types of orientation either: they are what an orientation is used as once a module is pointed at it.

### What each type reads
| Type | Orientations | Axes | Keys |
|---|---|---|---|
| Header | The pool its orientation is chosen from | - | `label.link` |
| Single axis | The first one: what the card is about | - | `marker` |
| Double axis | - | The first one: its two sides are the two poles | `marker` |
| Multi axis | - | Every axis it shows | `title`, `groupBy`, `marker` |
| Horizontal bar | What is ranked | - | `title`, `selection`, `groupBy`, `visibleRows` |
| Nolan chart | - | The horizontal and the vertical axis | The labels and the colours of the [map](#keys-of-the-map) |
| Archetype | Every archetype the quiz scores | - | `title` |
| Traits | Every trait the quiz defines | - | `title` |

Every type reads the identifier, the type and the key `description`. Every type but the header reads the position and the column: the header is always on top.

### Keys
What a key means, what it may hold and what it is when left out is defined once, here, and is the same for every type that reads it.

| Key | Holds | Default | Read by | Meaning |
|---|---|---|---|---|
| `title` | A text, per language | None | Multi axis, horizontal bar, archetype, traits | The card's name, written by the author |
| `description` | A text, per language | None | Every type | The author's explanation of the module. When present, the module offers its info action |
| `selection` | `all` or `linked_to_leader` | `all` | Horizontal bar | Which of its orientations the module shows |
| `groupBy` | `none` or `category` | `none` | Multi axis, horizontal bar | Whether its rows are one list or one list per category |
| `marker` | A whole number from 0 to 100, or `none` | 50 | Single axis, double axis, multi axis | The reference line on every bar of the module. `none` switches the line off |
| `visibleRows` | A whole number, 1 or more | 3 | Horizontal bar | How many rows a list shows before its fold |
| `label.link` | A text, per language | The header's own | Header | The label of the link to the orientation's website |
| `label.` and a name of the map | A text, per language | The map's own | Nolan chart | A name on the map. See [below](#keys-of-the-map) |
| `color.` and a corner of the map | A colour | The map's own | Nolan chart | The colour of a corner |

A value is a string or a whole number, and the table says how a key reads it. There are five kinds: a text, a text per language, a whole number within bounds, one of a list of choices, a colour. A choice and a colour are strings; a key that needs yes or no is a choice of two. The kind decides how the app checks a value and which control the quiz editor offers for it, so a key that is added to the table has its place in the editor's form without a form being written for it.

- **A type reads the keys listed for it** and ignores every other key, whether another type reads it or nobody does.
- **A key means one thing.** A type that needs a different meaning takes a different key.
- **A key that belongs to one module's own places is prefixed**: `label.` for a text it shows, `color.` for a colour it paints. The prefix says what kind of value follows and keeps such keys apart from settings.
- **Adding a key** is a row in this table and an entry in the app's table of keys. No record that exists has to change: it reads as the default.
- **Not a key:** a score, a threshold of a match band or of the map, anything about a taker. See [rules](#rules-and-constraints).

### Keys of the map
| Key | What it is |
|---|---|
| `label.centre` | The name of the middle of the map |
| `label.horizontalStartModerate`, `label.horizontalStartExtreme`, `label.horizontalEndModerate`, `label.horizontalEndExtreme` | The names of a lean along the horizontal axis, by pole and level |
| `label.verticalStartModerate`, `label.verticalStartExtreme`, `label.verticalEndModerate`, `label.verticalEndExtreme` | The same for the vertical axis |
| `label.topLeftModerate`, `label.topLeftExtreme`, and the same for `topRight`, `bottomLeft`, `bottomRight` | The names of a corner of the map, by level |
| `label.topLeftModerateShort`, `label.topLeftExtremeShort`, and the same for the other three corners | A shorter form of a corner's name, for a narrow card |
| `color.topLeft`, `color.topRight`, `color.bottomLeft`, `color.bottomRight` | The colour of a corner |

A key that is missing leaves the map to its own default, as its spec says.

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
| Out | The header | The leader, its value as confidence, and the label of its link | Given to the [header](./header.md) |
| Out | The modules | For each record that can be drawn: what its module takes, its position and its column | Given to the result screen, in order |

### The back-end contract
The repo has no task convention for back-end work, so the contract below is the hand-off. It follows what the survey API already does: one flat record per thing, tied to its survey, with relations as lists of identifiers and texts held per language.

| Field | Sent as | Stored as | Rules |
|---|---|---|---|
| Identifier | `id` | A UUID | Generated by the back-end |
| Survey | - | The survey's identifier | Not sent: the list is read as part of its survey |
| Type | `type` | Text | A plain string of at most 64 characters. The back-end does not validate it - not against a list and not for its form: it stores it and sends it back. The app knows the types, and skips a record whose type it does not know |
| Position | `position` | A whole number | 0 or more |
| Column | `column` | Text | `start` when left out. Not checked against a list, for the same reason |
| Orientations | `orientationIds` | A list of identifiers | Each must be an orientation of the same survey. Empty when left out |
| Axes | `axisIds` | A list of identifiers | Each must be an axis of the same survey. Empty when left out |
| Values | `values` | Pairs of a key and a value, tied to their record | Sent as a list of `{ "key", "value" }`. A key is a text of at most 64 characters: letters, digits, dots and underscores. A value is a string or an integer; a text is stored as a string per language. A key stands once in a record. Empty when left out |

- **How the pairs are stored** is the back-end's choice: a table of rows `{ record, key, value }`, which keeps both tables flat, or one JSON column on the record. What is sent is the same.
- **A text per language** - a value saved as an object of languages, `{ "pl": ..., "en": ... }`, is sent as the one text of the language asked for, by the rule every other text of a survey follows. The back-end applies it to any value of that shape, whatever its key.
- **What the back-end checks** - only sizes: at most 100 pairs in a record, a text of at most 5000 characters. It does not know the keys, and does not check a value against one.
- **What the back-end never has to change** - a new module type and a new key need no migration and no release of the API: what a name means is the app's and this spec's. The back-end changes only if it gains a use for something it does not know today.
- **Where it is sent** - `GET /v1/survey/{identifier}` gains `resultModules`, a list in the order of `position`. A survey with none sends an empty list.
- **Who writes it** - whoever may edit the survey. The endpoints the editor saves through are the editor's to specify; this spec fixes only the record.
- **What it does not replace** - the fields the API still lacks for an orientation and an axis stay asked for where they are named: the seven orientation properties in [universal orientation](./universal-orientation.md), and for an axis its category and a name per language.

Four fields are asked of the back-end here, because the record leans on them:

| Asked for | On | Why |
|---|---|---|
| A category | An axis | Grouping by category needs to know which category an axis belongs to. Today it is packed into the axis name |
| A main mark | An axis | The main axis of a category is the one a group of axes is headed by. Today it is packed into the axis name |
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
| Column holds a value the app does not know | Start |
| Values is missing or is not a list of pairs | As if empty: every key has its default |
| A pair has no key, or a value that is not a string or a whole number | That pair is skipped |
| The same key stands twice in a record | The first counts |
| A key the record's type reads is left out | Its default |
| A key holds a value its [row](#keys) does not allow - `marker` outside 0 to 100 or not whole, `visibleRows` below 1, a `selection` the app does not know | Its default |
| A key the record's type does not read, or one the app does not know | Ignored |
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
The key `selection`.

| Case | Behaviour |
|---|---|
| All | Every shown orientation of the record |
| Linked to the leader | Of the record's shown orientations, the ones the leader lists as linked, in the leader's order |
| Linked to the leader, and there is no leader | None |

This is the rule the old identity quiz had in code: the parties shown are the ones tied to the taker's leading identity.

### Grouping by category
The key `groupBy`.

| Case | Behaviour |
|---|---|
| A module of axes | One group per category of the quiz, in the quiz's order, holding the record's axes of that category in the author's order. The group is named after the category |
| An axis with no category | It stands in a group of its own, with no name, after the others |
| A module of orientations | One group per category of the quiz, each holding the record's orientations with their values scored on that category's questions alone |
| A module of axes, and a category none of its axes belongs to | It is not a group |
| A module of orientations, and a category in which none of them has a value | Still a group. The module shows that nothing matches there |
| A hidden category | It is not a group |
| None | One list, in the author's order |

### What each type is given
| Type | Given |
|---|---|
| Header | The leader as its orientation, the leader's value as confidence, the text of the key `label.link` |
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
| A horizontal bar record whose selection leaves nothing, or one grouped by category in a quiz with no category to show | Not drawn |
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
- **The shape does not grow with the modules.** A new type and a new key are new names inside the same fields. A new field is added only for something the back-end has to understand.
- **A value is plain.** A pair holds one string or one whole number: no list, no nested object, no fraction and no empty value. What would be "nothing" is a word of its own, as `none` is for the marker. What a module is about - its orientations and axes, and the categories they are grouped by - is said by the two lists of identifiers and by the axes and orientations themselves, not by a value.
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
| A record with a key of another type | The key is ignored |
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
- **A new type or key costs no migration.** They are names the back-end stores without knowing them, and an app that does not know one skips the record or ignores the key, so a new one can be saved before every app knows it.
- **Nothing is fetched per module.** The list comes with the quiz, and the values come with the result.

## Dependencies
- Relies on [universal orientation](./universal-orientation.md) for what an orientation is, and on [session and data](./session-and-data.md) for how a quiz and its axes are read.
- Relies on the [event model](./event-model.md) for a value, a side value and a trait.
- Relies on the spec of every [type](#types) for what its module takes.
- The result screen and the quiz editor rely on this spec.
