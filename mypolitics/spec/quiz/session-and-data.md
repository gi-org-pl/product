# Session and data

> Technical specification of where the questionnaire gets a quiz, what a session holds, what is sent at the end, and what survives a refresh.

Docs: [Session and data](../../docs/modules/quiz/questionnaire/session-and-data.md).

## Kind
Front-end

## Scope
Everything the questionnaire knows and keeps, as opposed to what it shows: the address a quiz is taken at, the map from that address to a quiz of the API, how the quiz is read, what a session is and what changes it, what is stored in the browser and for how long, how the result is created and how the questionnaire learns that it was calculated, and what is on screen before a session exists - loading, not found and failed to load.

The API calls it a survey; the product calls it a quiz. This spec says quiz and keeps "survey" for the API's own names.

It extends [universal orientation](./universal-orientation.md), which already reads the `orientations` of the same response. That reading is not repeated here.

Not covered here:

- **Which phase is on screen, and what each button does** - [phases model](./phases-model.md). This spec says what is recorded; that one says when.
- **What kind an answer is, and what skipping means to the taker** - [answer model](./answer-model.md).
- **The running picture behind checkpoints** - scores, axes, traits and timing worked out from the session - the [event model](./event-model.md). This spec only carries what that work needs.
- **The demographic option lists** - [demographics](./demographics.md).
- **Sending the results link by e-mail** - [results saving and marketing](./results-saving-and-marketing.md). The address is never part of what is specified here.
- **When the hand-in is sent, how often it is tried and read again, and what the taker sees meanwhile** - [engaging loader](./engaging-loader.md). This spec says what the request holds and how each reply is read.
- **The result itself** - the results module. Until this app has a results screen, the taker is handed to the one that already runs.
- **Scoring** - the back-end. Nothing here calculates a result.
- **Analytics** - [analytics](../../docs/platform/analytics.md).
- **Listing quizzes, and quizzes that only exist on the old stack** - [quiz migration](../../docs/platform/quiz-migration.md).

## Data

### Where a quiz lives
| Thing | Value | Rules |
|---|---|---|
| Address of a quiz | `/quizzes/{slug}` | The slug is the only thing in the address. The phase, the question and the session are never in it |
| API | `https://api.mypolitics.pl/api` | One setting, `VITE_API_URL`, replaces it for a build |
| Results destination | `https://mypolitics.pl/results/{session identifier}` | One constant. It is replaced when this app has a results screen |

### The map from slug to quiz
The API identifies a quiz by an identifier and has no slugs, so the app keeps the map.

| Slug | Quiz | Identifier in the API |
|---|---|---|
| `mypolitics` | myPolitics Quiz Tożsamościowy | `60beb898-a4e4-4160-88c4-07a9931ab499` |
| `prezydencki2025` | Barometr Prezydencki 2025 | `270f6c12-6551-4661-bfcf-52635a703928` |

These are the two pairs the running product is configured with. Where it holds several identifiers for one slug - older versions of the same quiz - only the first, current one is taken.

### The quiz as read
One read, `GET /v1/survey/{identifier}`, returns the whole quiz.

| Property | From | Reading |
|---|---|---|
| Identifier | - | The one the quiz was asked for by. It is what the result is created against |
| Name | `title` | Text. The quiz name the controls show |
| Official or community | `type` | Official when `OFFICIAL`, community otherwise. Needed by [universal orientation](./universal-orientation.md) |
| Average time | `averageFinishTime` | Whole-quiz minutes. Carried for the time estimate on the halfway card |
| Algorithm | `algorithm` | Text naming how the back-end scores. Carried for the running picture; it means nothing here |
| Orientations | `orientations` | By [universal orientation](./universal-orientation.md) |
| Categories | `categories` | A list, in the API's order - see below |
| Axes | `axis` | A list, in the API's order - see below |
| Questions | `questions` | A list, in the API's order - see below |
| Languages | `defaultLanguage`, `supportedLanguages` | The language the texts are in when none is asked for, and the ones that can be asked for |
| - | `id`, `description`, `createdAt`, `isPublic`, `logoUrl`, `imageUrl`, `projectId`, `version`, `authors` | Not carried. The questionnaire shows none of them |

**A category**

| Property | From | Reading |
|---|---|---|
| Identifier | `id` | As sent |
| Name | `name` | The text is the name |
| Weight | `weight` | Number. Carried for the running picture |
| Hidden | - | No field. Read from packed text in `name`, key `isHidden` |

**A question**

| Property | From | Reading |
|---|---|---|
| Identifier | `id` | As sent |
| Category | `categoryId` | The category it belongs to |
| Statement | `text` | The text the taker answers |
| Explanation | `explanation` | Text, often absent |
| Answer type | `answerType` | `AGREE_OR_DISAGREE`, `ONE_OF_MANY`, or anything else - see [answer model](./answer-model.md) |
| Status | `status` | `LIVE` in every quiz in use |
| Possible answers | `possibleAnswers` | A list, in the API's order |
| - | `surveyId` | Not carried |

**A possible answer**

| Property | From | Reading |
|---|---|---|
| Identifier | `id` | As sent. It is what an answer is recorded and sent as |
| Text | `text` | The label the taker sees |
| Weight | `weight` | Number. Carried for the running picture |
| Orientations | `orientationIds` | The orientations this answer supports |
| - | `questionId` | Not carried |

**An axis**

| Property | From | Reading |
|---|---|---|
| Identifier | `id` | As sent |
| Name | `name` | The text is the name |
| Type | `type` | `axis`, `compass_x_axis`, `compass_y_axis`, or anything else, as sent |
| Description | `description` | Text |
| Positive side | `positiveOrientations` | A list of orientation identifiers |
| Negative side | `negativeOrientations` | A list of orientation identifiers |
| Category, main | - | No fields. Read from packed text in `name`, keys `category` and `isMain` |

Axes are carried for the checkpoint cards. This spec gives them no behaviour. A quiz may have none: two of the three quizzes read for this spec send an empty list.

### Packed text in categories and axes
Two more fields hold packed text in quizzes in use, in the sense [universal orientation](./universal-orientation.md) defines: text whose content is a JSON object. The rules written there apply unchanged - it is recognised by its content, it is read and never written, a text that is not packed is the name as written, and broken machine text is never shown to a taker.

| Field | Key | Read as |
|---|---|---|
| Category `name` | `name` | Name |
| Category `name` | `isHidden` | Hidden |
| Axis `name` | `name` | Name |
| Axis `name` | `category` | The name of the category the axis is grouped under |
| Axis `name` | `isMain` | Whether it is a main axis of its group |

Each of the three properties without a field - a hidden category, an axis's category, a main axis - is asked of the back-end as a field. The list of keys is closed.

### The session
A session is one taking of one quiz in one browser tab.

| Part | Data | Meaning | Rules |
|---|---|---|---|
| Identifier | A random UUID | Names the session, then the result, then the results link | Made in the browser when the session starts. Never derived from anything about the taker |
| Seed | The identifier | What every random choice of the session is drawn from - copy lines, distractors | The same seed and the same entries give the same choices |
| Quiz | A quiz identifier | The quiz being taken | One session per quiz per tab |
| Entries | An ordered list | One per question the taker is done with: the question, and either the answer picked or a skip | Always the first questions of the quiz, in the quiz's order, with no gap |
| Topics | A list of category identifiers | The categories the taker prioritised | In the order picked. Empty when none, or when the step was skipped |
| Topics confirmed | Yes or no | Whether the taker has left category select | - |
| Phase | One of the phases | Where the taker is | See [phases model](./phases-model.md) |
| Checkpoints off | Yes or no | Whether the taker turned checkpoints off | No at first |
| Demographics | Up to four values | What is picked on the demographics card | See [demographics](./demographics.md) |
| Demographics given | Yes or no | Whether the taker left that card with "Zobacz wyniki" and not with "Pomiń" | No at first |
| E-mail and consent | Text, and yes or no | What is typed and ticked on the e-mail card | Held in the tab's memory only. Never stored, never sent with the result. A refresh loses them, and the link is then not sent |
| Checkpoint record | The cards shown, and the time each done question took | The only memory the checkpoint engine has | Kept, stored and cleared with the session. Its content is defined by the [event model](./event-model.md), not here |
| Result state | Not sent, sending, created, calculated, failed | How far the hand-in got | Not sent at first |

Words:

- **Done** - a question with an entry: answered or skipped.
- **Open** - a question without an entry.
- **The current question** - the first open one.
- **Visible category** - a category that is not hidden and has a name.

### What is derived
| Value | Is |
|---|---|
| Done, and all | The number of entries, and the number of questions. Feeds [progress](./progress-and-pacing.md) |
| Questions left in a category | The open questions that belong to it, the current one included |
| Answers | The entries that are not skips |

### What is stored in the browser
| When | Stored |
|---|---|
| From the first change of a session until the taker is sent to the results | Identifier, quiz, entries, topics, topics confirmed, phase, checkpoints off, demographics, demographics given, checkpoint record |
| At no time | The e-mail address and the consent |
| After the taker is sent to the results, and after a reset | Nothing of the old session |

It is kept in the tab's own storage (`sessionStorage`), one record per quiz. It is never in storage shared between tabs, never in a cookie and never in the address.

The record outlives the hand-in on purpose: a refresh while the result is being calculated has to find the session, or the taker would be back at the first question with a result they cannot reach. Demographics are stored for the same reason - a refresh on a closing card must not quietly drop what the taker chose to give.

## Interface
| Direction | Name | Shape | Notes |
|---|---|---|---|
| In | Slug | Text from the address | Chooses the quiz |
| In | Language of the app | A language code | The language the quiz is asked for in |
| In | API address, results destination | Two settings | See "Where a quiz lives" |
| Out | Quiz | Name, questions, categories, axes, orientations, average time, algorithm, official or community | Read once per visit and language |
| Out | Session | The parts above | One per quiz per tab |
| Out | Derived values | Done, all, questions left in a category, answers | For the screen and the bar |
| In | Session events | Topics picked, topics confirmed or skipped, answered, skipped, stepped back, demographics picked, demographics given or skipped, checkpoints turned off, phase changed, reset | Raised by the [phases model](./phases-model.md) |
| Out | `POST /v1/result` | The hand-in - see "Creating the result" | Sent by the loader. The same request every time it is repeated |
| Out | `GET /v1/result/{identifier}` | Whether the result is calculated | Read by the loader until it is |
| Out | Result state | Not sent, sending, created, calculated, failed | For the results calculation phase |

## Behaviour

### Finding the quiz
| Case | Behaviour |
|---|---|
| The slug is in the map | The quiz with the mapped identifier is read |
| The slug differs from one in the map only by letter case | It matches. The address is left as typed |
| The slug is not in the map | The site's not-found page. Nothing is read |
| The home page starts a quiz | It opens the quiz's address. A quiz the map does not know ends on the not-found page |

### Reading the quiz
| Case | Behaviour |
|---|---|
| The address is opened | The quiz is asked for in the language of the app |
| The API refuses the request while a language was named | The quiz is asked for once more without a language, and arrives in its default language. The app keeps its own language |
| The quiz arrives | It is read into the shape above, once. No later step asks for it again |
| The language of the app changes during a session | The quiz is read again. The session stays: identifiers do not change with the language |
| The taker returns to the address after leaving it | The quiz is read again |

### Starting and restoring a session
| Case | Behaviour |
|---|---|
| The quiz is read and nothing is stored for it | A new session starts: new identifier, no entries, no topics, checkpoints on, in the first phase |
| A session is stored for it | It is restored: same identifier, same entries, same phase. The taker is back on the same question |
| The stored session was on a checkpoint card | It is restored on that card - the last of the cards shown - as [checkpoints](./checkpoints.md) says. If the card cannot be put up again, the question after it is shown |
| The stored session was in results calculation | It is restored into that phase and handed in again with the same identifier. If the first hand-in got through, the API answers that the result exists, which counts as stored, and the loader carries on |
| The stored session was on a closing card | It is restored on that card with its demographics. The e-mail field is empty again |
| The browser shows the page again from its history after the taker left for the results | A new session starts in the first phase. The old loader is never shown again |
| The same quiz is open in two tabs | Two sessions, unaware of each other |
| A tab is duplicated mid-session | Two tabs hold the same session. Each goes its own way from there; see "Creating the result" for what happens when both finish |

### Recording
| Event | What changes in the session |
|---|---|
| A topic is picked or dropped | Topics change. Nothing is confirmed yet |
| Topics are confirmed | Topics stay, topics confirmed becomes yes |
| Category select is skipped | Topics are emptied, topics confirmed becomes yes |
| The current question is answered | An entry with that answer is added |
| The current question is skipped | An entry with a skip is added |
| The taker steps back to a question | The last entry is removed. That question is open again, with no trace of what was picked |
| A demographic value is picked | Demographics change |
| The demographics card is left with "Zobacz wyniki" | Demographics given becomes yes |
| The demographics card is left with "Pomiń" | Demographics given becomes no. The picked values stay for the screen |
| Checkpoints are turned off | Checkpoints off becomes yes, for the rest of the session and past a reset |
| Reset is confirmed | A new session replaces this one: new identifier and seed, no entries, no topics, no demographics, no e-mail, no checkpoint record. Checkpoints off is carried over |

Every change is stored at once, so a refresh a moment later finds it.

### Creating the result
The result is created when the results calculation phase starts, and at no other moment. The [engaging loader](./engaging-loader.md) sends the request; this is what it holds and how each reply is read.

| Part of the request | Value |
|---|---|
| `surveyId` | The quiz identifier |
| `sessionId` | The session identifier. It becomes the identifier of the result |
| `prioritizedCategories` | The topics. An empty list when there are none |
| `demographics` | `gender`, `age`, `residenceAreaSize`, `education` - only when demographics given is yes and all four are picked. Left out otherwise, never sent in part |
| `answers` | One `questionId` and `answerId` per answer. Skips are left out. A question appears at most once |

| Reply | Reading |
|---|---|
| Created (201) | Stored. Result state becomes created |
| A result with this session identifier already exists (409) | Stored, the same as created: an earlier try got through, the page was refreshed, or another tab holding the same session was first |
| Anything else - refused as invalid or for any other reason, no connection, no reply in time, a server error | Not stored. Result state becomes failed. The request is never changed to get it accepted: it is not sent again without its demographics |

| Case | Behaviour |
|---|---|
| Result state becomes created | The stored session stays as it is. The request that sends the results link, if an address was given, may go out now and not before - see [results saving and marketing](./results-saving-and-marketing.md) |
| The hand-in is repeated - a retry, or a refresh | The same request, with the same identifier. Repeating it is always safe |
| Every question was skipped | The result is created with no answers. What a result without answers shows is the results module's |
| Two tabs hold the same session and both reach the end | The first creates the result. The second is told it exists and carries on to that result; its own answers are not saved |

### Reading the result
`GET /v1/result/{identifier}` is read only to learn that the result is calculated. Nothing inside it is used.

| Reply | Reading |
|---|---|
| A result whose `results` is empty | Stored, not calculated yet |
| A result whose `results` holds the calculation - as an object, or as text that contains one | Calculated. Result state becomes calculated |
| A result whose `results` is anything else | Not calculated yet |
| The result does not exist (404), or the read fails | Not calculated yet |

How often it is read and how long the questionnaire waits are the [engaging loader](./engaging-loader.md)'s.

### Leaving
| Case | Behaviour |
|---|---|
| The loader ends well | The stored session is removed, then the results destination opens in the same tab |
| The taker comes back with the browser's back button | Nothing is stored, so a new session starts in the first phase |

## States and lifecycle

### Before a session exists
| State | Condition | What is on screen | What is possible |
|---|---|---|---|
| Loading | The quiz was asked for and has not arrived | The frame of the questionnaire with still placeholders where the bar, the controls and the content will be. No text, no buttons | Wait, or leave by the site's own navigation |
| Not found | The slug is not in the map, the API says the quiz does not exist, or the quiz has no question that can be asked | The site's not-found page | Whatever that page offers |
| Failed to load | No connection, no reply within 30 seconds, a server error, or a reply that is not a quiz | A heading "Nie udało się wczytać quizu", a line "Sprawdź połączenie z internetem i spróbuj ponownie.", and a button "Spróbuj ponownie" | Retry, which goes back to loading |
| Ready | The quiz is read | The phase the session is in | See [phases model](./phases-model.md) |

Figma draws none of the first three. Loading reuses the frame of the [phase screens](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5582-97895); failed to load is a card in the same frame.

### A session
| State | Condition | What moves it on |
|---|---|---|
| Running | Result state is not sent | Reaching results calculation |
| Handing in | Sending | A reply, or none |
| Created | The result exists and is not calculated | A read with results, or the loader's time limit |
| Calculated | The result has results | The loader finishing |
| Failed | A hand-in or the waiting failed | Retry, or a reset |
| Left | The taker was sent to the results. Nothing is stored | - |

A reset is possible while running and leads to a new running session. While the hand-in and the wait are under way there is none; once they have failed, reset is possible again and leads to a new running session too.

## Rules and constraints
- **One hand-in.** Nothing about a session reaches the back-end before results calculation, and after it only reads. A taker who leaves earlier leaves no result. This is the cost of one request: the [phases model](../../docs/modules/quiz/questionnaire/phases-model.md) doc counts on the answers being safe before the closing cards, and they are not.
- **The quiz's order is kept.** Questions are asked in the order the API sent them. They are not shuffled and not regrouped by category - the presidential quiz mixes its categories on purpose.
- **Topics do not cut.** Whatever is picked, every question is asked. The topics only travel with the result.
- **Entries have no gap.** There is no way to jump ahead, so the done questions are always the first ones. Everything that counts questions leans on it.
- **The result is the back-end's.** The session never holds a score. What checkpoints show is worked out elsewhere and is never sent.
- **The hand-in is sent as it is, or not at all.** Demographics are the one part of the hand-in the taker did not have to give, and the one part the API checks value by value: it accepts an age from 13 to 120. So the lists in [demographics](./demographics.md) hold only values the API takes - the age list runs from 13 to 99 and has no "under 18" entry - and a hand-in refused as invalid fails as a whole. It is never repeated without its demographics.
- **The identifier is random and is the only key.** It is not built from the time, the device or the taker, and nothing else is needed to open the result.
- **A session belongs to a tab.** It is not shared with other tabs, not synchronised, and not resumable elsewhere.
- **No warning on leaving.** Closing the tab or navigating away asks nothing. A refresh restores; a closed tab does not.
- **The browser's back button leaves the questionnaire.** It does not step back a question; the back control of the screen does.
- **The map is kept by hand.** A new quiz, or a new version of one, needs the map changed. It stays so until the API can find a quiz by its slug.
- **Not supported: a quiz that is not in the map.** The quizzes that only exist on the old stack have no identifier in this API and cannot be taken here.

## Invalid and edge input

### The quiz
| Input | Behaviour |
|---|---|
| The reply is not an object, or has no list of questions | Failed to load |
| No question is left after the rows below | Not found |
| A question without an identifier | Dropped |
| Two questions with the same identifier | The first is kept |
| A question whose statement is missing, empty or only space | Dropped. A statement that cannot be read cannot be answered |
| A question with a status other than `LIVE` | Dropped |
| A question with no status | Kept |
| A question with no possible answer left | Dropped |
| A question with one possible answer | Kept, as it is |
| A question whose category the quiz does not have | Kept, without a category |
| An answer type that is missing or unknown | Kept. The [answer model](./answer-model.md) decides what its answers are |
| A possible answer without an identifier, or with a text that is missing, empty or only space | Dropped |
| Two possible answers of one question with the same identifier | The first is kept |
| Two possible answers of one question with the same text | Both kept. They are different answers |
| A weight that is missing or not a number | Zero. It adds nothing to the running picture; the result is unaffected |
| An answer naming an orientation the quiz does not have | That reference is dropped, as [universal orientation](./universal-orientation.md) says |
| Explanation missing, empty or only space | No explanation |
| A category without an identifier | Dropped |
| Two categories with the same identifier | The first is kept |
| A category name that is missing, empty, or broken packed text | A category without a name. It is not visible |
| The list of categories is missing or empty | A quiz without categories |
| An axis without an identifier | Dropped |
| An axis naming an orientation the quiz does not have | That reference is dropped |
| The list of axes is missing or empty | A quiz without axes |
| Average time missing, not a number, or below zero | Absent |
| Name missing or empty | A quiz without a name. The controls draw no name |

One bad question never costs the quiz its others.

### The stored session
| Input | Behaviour |
|---|---|
| The record cannot be read, is not in the shape this version writes, or is for another quiz | Thrown away. A new session starts |
| An entry names a question that is not at its place in the quiz as read now, or an answer that question does not have | That entry and every later one are thrown away. The session continues from there, in the questions phase |
| A topic that is not a visible category of the quiz as read now | Dropped from the topics |
| More topics than category select allows | The first ones are kept |
| A demographic value that is not in its list | That field is empty, and demographics given becomes no |
| A phase the entries do not allow - a closing phase with open questions, category select with entries, a card with no question open or no card on record | The questions phase when a question is open, demographics when none is |
| A checkpoint record that cannot be read | An empty record. The session is kept; the event model says what an empty record costs |
| The e-mail phase while that phase is not part of the session - sending is not set up, or the age picked is under 18 | Demographics |
| The browser refuses storage, or it is full | The session lives in memory only. Everything works; a refresh starts over |

## Privacy and data handling
- **Answers are special-category data.** A set of answers is a statement of political views. Until the hand-in it exists only in the taker's tab.
- **What the tab holds is readable on that device.** Anyone using the same tab before it is closed can open the stored session. It is removed when the taker is sent to the results and at a reset, and the browser removes it with the tab.
- **It outlives the hand-in by one phase.** The answers stay stored while the result is calculated, so that a refresh there loses nothing. If the calculation fails and the tab stays open, they stay with it.
- **Nothing is sent early.** No answer, topic or demographic value goes to the back-end, to analytics or to any third party before the hand-in, and the hand-in goes to the result endpoint only.
- **The e-mail never meets the answers.** The address and the consent are never written to storage and never sent with the result. The request that carries them carries no answers and no demographics; what it may carry is specified with the [e-mail card](./results-saving-and-marketing.md).
- **The identifier is a bearer key.** It is shown in the results address and nowhere else. It is not written to logs or analytics by this app.
- **Demographics travel with the answers and nowhere else.** They are stored with them, sent in the same request, and removed with them.

## Failure modes
| Failure | Behaviour |
|---|---|
| The quiz cannot be read | Failed to load, with retry. No session is touched |
| The API says the quiz does not exist | Not found |
| The connection drops while the taker answers | Nothing happens. Answering needs no network |
| The hand-in fails | Result state becomes failed. The session and its answers are still stored. The loader says so and offers retry |
| The back-end refuses the demographics | The hand-in fails as a whole, like any refused request. It is not repeated without them. Every value the lists offer is one the API accepts, so it takes a defect in the app or a changed API to get here |
| The result is created but never calculated | Failed at the loader's time limit, with retry. The session is still stored, so a retry and a refresh both find the same result |
| The taker refreshes during the hand-in | The session is restored in results calculation and handed in again with the same identifier. If the first try got through, the reply says the result exists and the flow goes on |
| A hand-in is refused and no retry changes that | The taker stays on the failed loader, and the stored session brings them back to it after a refresh. Reset is on in the loader's failed state, so they can start the quiz over with a new session; the answers of the old one are not handed in. It takes a defect in the app or a changed API to get here |
| The results link cannot be sent | Nothing here changes. The result exists and the taker is sent to it |
| Storage fails mid-session | The session goes on in memory. No message is shown |

## Non-functional
- **One read.** A quiz of a hundred questions with their weights is one response of a few hundred kilobytes. It is read once per visit and never per question.
- **Nothing between questions.** Recording an entry and showing the next question need no network and no visible wait.
- **Long quizzes.** A quiz of several hundred questions is read, stored and restored without a visible delay.
- **Loading is announced.** The loading state says "Wczytywanie quizu" to assistive technology, and the failed state is announced when it appears.
- **Every reply is checked.** Nothing from the API is trusted to have the declared shape; the rows under "Invalid and edge input" are what a wrong shape turns into.

## Dependencies
Relies on:

- [Session and data doc](../../docs/modules/quiz/questionnaire/session-and-data.md) - the idea this implements.
- [Universal orientation](./universal-orientation.md) - the reading of `orientations`, and the rules for packed text that this spec applies to two more fields.
- The [survey API](https://api.mypolitics.pl/api) - `GET /v1/survey/{id}`, `POST /v1/result`, `GET /v1/result/{id}`. The shapes above were checked against the three public quizzes it serves. This spec asks it for three fields: a hidden flag on a category, and a category and a main flag on an axis.
- The home page and the not-found page of the app - the start controls and the page an unknown address ends on.

Relied on by:

- [Phases model](./phases-model.md) - raises every session event and shows the states.
- [Answer model](./answer-model.md) - the possible answers of a question.
- [Progress and pacing](./progress-and-pacing.md) - done and all.
- [Demographics](./demographics.md) - when its values are sent.
- [Event model](./event-model.md) and [checkpoints](./checkpoints.md) - the quiz, the entries, the seed, the checkpoint record, and the card a refresh restores.
- [Engaging loader](./engaging-loader.md) - the hand-in it sends, how its replies are read, and the removal of the stored session on leaving.
- [Results saving and marketing](./results-saving-and-marketing.md) - the session identifier its link points at, and the moment the result exists.

It is built as two units: the reading of the API (the calls, the shapes, the map), then the session (its logic, its storage). The screen comes after both.
