# Universal orientation

> Technical specification of the one definition of an orientation the app uses, and how it is read from the API.

Docs: [Result modules](../../docs/modules/quiz/results/modules/README.md), for the rule that every entity with points is an orientation, and the [glossary](../../docs/concept/glossary.md).

## Kind
Front-end

## Scope
The single definition of an orientation: what one is, which properties it carries, what each is called, and how the orientation the API sends is read into it. Everything in the app that names, scores or compares something uses this definition - the result modules, the header, the checkpoint cards, comparison and the generated result image.

It replaces three things:

- **Each module described an orientation in its own words**, and none of those descriptions matches what the API sends.
- **The API packs the same property differently from quiz to quiz** - a candidate's name one way, an identity's another - and each old result screen read only its own.
- **The other person in a comparison was called a party**, while in the API a party is a type of orientation.

Packing a property into a text field is not a valid way to send it. This spec reads packed text because old quiz versions hold it and their results are still opened, and for no other reason. It names the properties the API has no field for, so that they are asked of the back-end as fields.

Not covered here:

- **How points become a value** - scoring. This spec only says how a result finds its orientation.
- **How an axis is defined** - quiz configuration. An axis refers to orientations by identifier, and that is all this spec needs from it.
- **Which module shows which orientation** - quiz configuration, as the [result modules](../../docs/modules/quiz/results/modules/README.md) doc says.
- **Whether an author's name, slogan, website or description is acceptable** - moderation.
- **What a friend's name and avatar are, and where they come from** - [comparison](../../docs/modules/quiz/results/comparison/README.md). This spec only says what shape they arrive in.

## Data

### What an orientation carries
| Property | Data | Meaning | Rules |
|---|---|---|---|
| Identifier | Text | What results, axes, answers and links refer to it by | Required. Unique within a quiz |
| Type | Ideology, party, identity, compass, person or other | What sort of thing it is | Required. Other when unknown |
| Name | Text | The display name | Optional. May come in two forms |
| Image | Web address | The icon, logo, portrait or avatar | Optional. May come in two forms |
| Colour | A colour | The colour it is drawn in | Optional |
| Description | Text | The text shown by default | Optional |
| Full description | Text | The longer text, opened on request | Optional |
| Slogan | Text | One author-written line | Optional |
| Website | Web address | Where the author sends a taker to read more - a candidate's programme | Optional |
| Official | Yes or no | Whether a moderator marked its answers as given by the party or candidate itself | No unless said. Only in an official quiz |
| Hidden | Yes or no | Whether the author took it out of what takers see | No unless said |
| Explanation | Text | The author's note on how to read this orientation | Optional |
| Linked orientations | A list of identifiers | Other orientations of the same quiz the author tied to this one - today, the parties closest to an identity | May be empty |

Every text, both addresses and the colour are author-supplied and untrusted. The official mark is not the author's to give: a moderator grants it, in the quizzes myPolitics writes itself.

An orientation belongs to one quiz. It is always read as part of its quiz and carries no reference back to it.

### Types
| Type | From the API | What it is |
|---|---|---|
| Ideology | `IDEOLOGY` | A position on one issue - usually one pole of an axis |
| Party | `PARTY` | Something a taker can vote for: a political party or a candidate |
| Identity | `IDENTITY` | A named character a taker can come out as |
| Compass | `COMPASS` | A position on a compass. The API has the type; no quiz in use sends one |
| Person | Never | Someone the taker compares with. Built by the app, never sent by a quiz |
| Other | Anything else, or nothing | A type the app does not know |

A trait, an archetype and a candidate are not types. They are what an orientation is used as, once an author points the traits module, the archetype module or a ranking at it. The API has no type for any of them: the presidential quiz sends its candidates as parties, and an orientation created without a type arrives as a party too. So the type is a label for choosing orientations and nothing more.

### Words
| Word | Means | Never means |
|---|---|---|
| Orientation | Anything a result can name, score or compare against, in the shape above | Only an ideology |
| Party | An orientation of type party: a political party or a candidate | The other person in a comparison |
| The other side | The orientation a taker is compared with: a person, or an orientation the quiz scores | A second kind of data. It is an orientation |
| Entry | An orientation together with its value, a number from 0 to 100 that may be absent | - |
| Form | One of two variants of a name or an image: masculine and feminine | A translation |
| Packed text | A text field of the API whose content is a JSON object and not plain words. A legacy format | A valid way to send a property |

### Reading the API
Orientations arrive inside a quiz, under `orientations`.

| Property | From | Reading |
|---|---|---|
| Identifier | `id` | As sent |
| Type | `type` | By the table above |
| Name | `generalName` | The text is the name |
| Image | `logoUrl` | The address is the image |
| Colour | `color` | As sent |
| Description | `description` | The text is the description |
| Explanation | `explanation` | As sent |
| Linked orientations | `linkedOrientations` | As sent |
| - | `surveyId` | Not carried |

This is the whole of the valid reading: one field, one property, plain words in it.

Every text arrives in one language - the one the quiz was asked for, or the quiz's default. The API keeps the translations and sends one, so an orientation never holds two languages at once.

### Properties without a field
The API has no field for these. Each is asked of the back-end as a field of its own.

| Property | Field today | Carried today by |
|---|---|---|
| The two forms of a name | None | Packed text in `generalName` |
| The two forms of an image | None | Packed text in `logoUrl` |
| Full description | None | Packed text in `description` |
| Slogan | None | Packed text in `generalName` |
| Website | None | Packed text in `generalName` |
| Official | None | Packed text in `generalName` |
| Hidden | None | Packed text in `generalName` |

Until a field exists, the property is read from packed text and from nowhere else. Once it exists, the field is what the app reads, and packed text is only the fallback for a quiz version that has no value in the field.

### Packed text, read for old quiz versions
Packed text is not valid. No new quiz, no new version of a quiz and no new property uses it, and nothing in the app produces it. The keys below are the ones old quiz versions already hold, and the list is closed.

| Field | Key | Read as |
|---|---|---|
| `generalName` | `name` | Name |
| `generalName` | `m`, `f` | The masculine and the feminine form of the name |
| `generalName` | `slogan` | Slogan |
| `generalName` | `websiteUrl` | Website |
| `generalName` | `isOfficial` | Official |
| `generalName` | `isHidden` | Hidden |
| `logoUrl` | `m`, `f` | The masculine and the feminine form of the image |
| `description` | `short` or `shortDescription` | Description |
| `description` | `long` or `longDescription` | Full description |

Packed text is recognised by its content, never by the type or the quiz. The identity quiz packs the names of its identities and the presidential quiz packs the names of its candidates, with different keys; one reading takes both, and an orientation that mixes them is read the same way.

Packing sits inside each translation, so an old orientation can have two forms in one language and one name in another.

The reading follows what the API sends, where that differs from what its documentation declares:

- The documentation declares `logoUrl` and `color` as text that is always present. Quizzes in use send both as missing and as empty text.
- `surveyId` is sent on every orientation and is not in the documentation.

### The other side as a person
The API has no orientation for a person. The app builds one from the friend's result.

| Property | Value |
|---|---|
| Identifier | The identifier of the friend's result |
| Type | Person |
| Name | The friend's display name, when comparison knows one |
| Image | The friend's avatar, when comparison knows one |
| Colour | The friend's profile colour, when comparison knows one |
| Everything else | Absent, not official, not hidden |

A person has one name and one image, never two forms.

## Interface
| Direction | Name | Shape | Notes |
|---|---|---|---|
| In | Quiz orientations | The list the API sends inside a quiz, in one language | Read once per quiz and language |
| In | Whether the quiz is official or a community one | One of the two | Decides whether an official mark counts |
| In | Whose result it is, and their declared gender | Female, male, other, or not declared | Chooses the form. Not declared covers a taker who declined and one who has not reached the question yet |
| In | A friend's result | An identifier, and a name, avatar and colour when known | Becomes the other side |
| Out | Orientations of the quiz | A list in the quiz's order, each findable by identifier | For anything that selects or links |
| Out | An orientation for display | The same orientation with exactly one name and one image | For anything that draws |

## Behaviour

### Choosing a form
A name and an image are chosen separately, by the same cases.

| Case | Behaviour |
|---|---|
| One form only, or no forms at all | That name or image, for everyone |
| Two forms, the person declared female | The feminine form |
| Two forms, the person declared male | The masculine form |
| Two forms, the person declared other, declined, or was not asked yet | The masculine form |
| The declaration arrives or changes later | Every orientation on screen switches form. Nothing else about the result changes |
| The other side is shown | The form follows the taker whose result the screen belongs to, never the friend |

The form follows the person the result belongs to. Nothing that draws an orientation ever sees two forms or chooses between them.

### Finding an orientation
| Case | Behaviour |
|---|---|
| A result, an axis, an answer or a link names an identifier the quiz has | It resolves to that orientation |
| It names an identifier the quiz does not have | That reference is dropped. Everything else is unaffected |
| The quiz has an orientation no result names | The orientation stands, without a value |
| The result is not calculated yet | Every orientation stands, without a value |
| The other side is a person | Never looked up among the quiz's orientations, whatever its identifier |

### Type
| Case | Behaviour |
|---|---|
| A screen needs all orientations of one sort - the parties for a ranking, every orientation for the comparison picker | It selects by type |
| An author's configuration points at orientations one by one | The configuration wins. The type is not checked against it |
| Anything draws an orientation | The type changes nothing. An ideology, a party and a person with the same name, image and colour draw the same |

### Hidden
| Case | Behaviour |
|---|---|
| A screen selects orientations by type | Hidden ones are left out |
| A ranking is drawn, or a leader is chosen | Hidden ones take no part |
| The comparison picker lists orientations | Hidden ones are not offered |
| An author's configuration points at a hidden orientation | It is not drawn. Hidden wins |
| A result, an answer or a link names a hidden orientation | It resolves, and says it is hidden. Scoring is untouched |

### Language
| Case | Behaviour |
|---|---|
| The quiz is asked for in a language it supports | Every text of every orientation is in that language |
| The app's language changes | The quiz is read again. Identifiers, types, colours and links do not change; texts, forms and images may |
| The quiz is asked for in a language it does not support | The API refuses the quiz, so there is nothing to read. What to show instead is the screen's decision |

## Rules and constraints
- **One definition.** No module, screen or card describes an orientation of its own. A module that needs less than the whole takes what it needs from this one.
- **One reading.** The API's orientation becomes this one in a single place. Nothing past it sees an API field name or packed text.
- **Packed text is legacy.** It is read and never written. Reading it keeps old quiz versions and the results shared from them working; it is not a format to build on.
- **A new property needs a new field.** When the app needs something the API does not send, the back-end is asked for a field. A new key inside a text is never the answer, and the list of keys read here does not grow.
- **The other side is an orientation.** A comparison names it as an orientation, in the same words a module uses for any other.
- **Party is a type.** It covers parties and candidates. The word is not used for the other person in a comparison.
- **The quiz's order is kept.** Orientations stay in the order the API sent them. Modules lean on it for ties and for a stable drawing.
- **Text is plain text.** Names, slogans, descriptions and explanations are shown as written and never interpreted. Paragraph breaks in the two descriptions are kept.
- **Official is a moderator's claim.** myPolitics grants it, in the quizzes it writes itself. A community author cannot, and the app shows the mark without ever working it out.
- **Orientations are never merged.** The same party in two quizzes, or in two versions of one quiz, is two orientations. The app does not match by name.
- **Not supported: more than two forms.** A name or an image has a masculine and a feminine form and no third.

## Invalid and edge input
| Input | Behaviour |
|---|---|
| The list of orientations is missing, empty or not a list | The quiz has no orientations |
| An orientation without an identifier | Dropped |
| Two orientations with the same identifier | The first is kept |
| Type missing, or one the app does not know | Other |
| The API sends the type person | Other. A person is only ever built by the app |
| Text with space or line breaks around it | Trimmed |
| Text that is missing, empty or only space | Absent |
| Text that is valid JSON but not an object - a name like "2050" | Plain text, as written |
| Packed text with raw line breaks inside its values | Read as if they were written correctly. One version of the identity quiz stores every description this way |
| Text that opens like packed text and still does not parse | Absent. Broken machine text is never shown to a taker |
| Packed text with keys this spec does not name | Those keys are ignored. A new key is a reason to ask for a field, not to extend the list |
| A property sent both in a field of its own and in packed text | The field |
| An official mark in a community quiz | Not official. The text it sits in is the author's, and the mark is not theirs to give |
| A packed value of the wrong sort - a number for a name, text for official | Absent, or no for a yes-or-no |
| Packed name with one form | That form, for everyone |
| Packed name with forms and a `name` | The forms. The `name` is ignored |
| Packed name with no form and no `name` | No name. The rest of it is still read |
| Packed description with both `short` and `shortDescription`, or both `long` and `longDescription` | The shorter key |
| Packed description with only a full description | A full description and no description |
| Image or website that is not a web address | Absent |
| Colour missing, or not a colour | Absent |
| Colour that is white | Absent. Quizzes in use store white for "not set", and a white fill cannot be seen on the track |
| Linked orientations missing or not a list | Empty |
| A link to an identifier the quiz does not have, or to itself | Dropped |
| The same link twice | Kept once |
| Every orientation of a type is hidden | A selection by that type is empty. Each module has its own empty state |
| A person without a name or an avatar | A person with those absent. Each module has its own placeholder |

An orientation with no name, no image and no colour is still an orientation. What to draw for it is each module's rule: the chart modules fall back to a neutral colour, and the traits module leaves a nameless trait out.

Nothing here throws, and one bad orientation never costs the quiz its others.

## Privacy and data handling
- **The declared gender is used to choose a form and for nothing else here.** It is read where the result is drawn and is not stored with an orientation.
- **A gendered name discloses the declaration.** A result shared as an image carries the form, so whoever sees "Zielona postępowczyni" learns what its owner declared.
- **A person is personal data.** The friend's name and avatar are held for the comparison on screen. They are never stored with the quiz's orientations or sent along with them.
- **A website is someone else's page.** The app never loads it. It is only ever a link the taker chooses to follow.

## Non-functional
- **Read once.** A quiz is read into orientations once per language, not on every draw. The identity quiz has 58 orientations; a few hundred must stay unnoticeable.
- **The same everywhere.** The app, the checkpoint cards and the generated result image use the same definition and choose the same form for the same person.

## Dependencies
**Build order: step 0.** Needs nothing in this folder.

Relies on:

- [Result modules doc](../../docs/modules/quiz/results/modules/README.md) - the rule this implements.
- The [survey API](https://api.mypolitics.pl/api) - the orientation it sends inside a quiz, and the identifiers a result and an answer carry. The reading was checked against every public quiz it serves. This spec asks it for the fields listed under "Properties without a field"; until they exist nothing here is blocked, since the legacy reading covers every quiz in use.

Relied on by every spec in this folder that takes an orientation. Where their wording differs, this spec decides:

- [Universal axis](./universal-axis.md) and every chart module - "the other party" is the other side, and the orientation they describe is this one.
- [Header](./header.md) - the slogan it shows is the orientation's own, and so is the address of its link.
- [Horizontal bar chart](./horizontal-bar-chart.md) - an "official" badge is drawn from the orientation's own mark, and a hidden orientation is not ranked.
- [Archetype](./archetype.md) - its short and full description are the orientation's description and full description.
- [Traits](./traits.md) - a trait is an orientation used as a trait, not a type.
