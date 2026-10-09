# Random copy

> Technical specification of the pools a checkpoint card draws its wording from, how a line is drawn and filled, and the Polish lines every pool starts with.

Docs: [Random copy](../../docs/modules/quiz/questionnaire/checkpoints/checkpoints-random-copy.md). | Design: the card frames in Figma, linked with each pool below.

## Kind
Front-end

## Scope
The wording of every checkpoint card: what a pool is, which pools exist, how one line is drawn for a card so that a session never hears the same line twice, how the taker's values are put into it, and the rules a line has to follow to be correct in Polish for every taker and every quiz. The pools themselves are part of this spec and are listed under "The pools".

Not covered here:

- **When a card appears** - the [event model](./event-model.md). It also provides the seeded draw this spec uses.
- **How the line is drawn on the card** - [checkpoints](./checkpoints.md): the lead-in in the quiet colour, a long dash, the statement in bold. The dash belongs to the frame and is part of no line.
- **The values that fill a line** - each card's own spec says where its numbers and names come from.
- **The two button labels**, "Dalej" and "Wyłącz checkpointy" - fixed texts of the frame, not pooled.
- **The lines of the results loader** - the [engaging loader](./engaging-loader.md), which uses the same mechanic for its own pool.
- **Copy written by a quiz author** - a later idea in the doc. Every pool ships with the product and no quiz can change one.

## Data

### Pool, line, slot
| Entity | Data | Meaning | Rules |
|---|---|---|---|
| Pool | A card, a state of that card, and a list of lines | Everything one card can say in one state | One pool per card and state. Two states never share a pool. Three lines to start with |
| Line | A lead-in and a statement | One way of saying the finding | Written together and always drawn together. A lead-in is never paired with another line's statement |
| Lead-in | Text | The opener that sets the tone | Has no slots |
| Statement | Text with slots | The finding | Uses the slots of its pool. It may leave one unused |
| Slot | A named place in a statement | Where a value of the taker goes | Filled by the card. Never written into a line |

### The pools that exist
| Card | State | Slots | Figma frame |
|---|---|---|---|
| Halfway through | The only one | Minutes | [5515:67631](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5515-67631) |
| Axis closeness | Single axis | Orientation | [5515:67082](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5515-67082) |
| Axis closeness | Double axis | Leading, other | [5515:67161](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5515-67161) |
| New trait | The only one | Trait | [5515:67457](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5515-67457) |
| Nolan chart path | Two or three quadrants | Count | [5515:67219](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5515-67219) |
| Nolan chart path | Four quadrants | None | [5516:69231](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5516-69231), [5581:97574](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5581-97574) |
| Stats chart | The taker is for the thesis | Percent, thesis | [5515:67733](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5515-67733) |
| Stats chart | The taker is against the thesis | Percent, thesis | None drawn |
| Single axis puzzle | Ask | None | [5515:67799](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5515-67799) |
| Single axis puzzle | Hit | Leading | [5516:67925](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5516-67925) |
| Single axis puzzle | Miss | Leading | [5516:68299](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5516-68299) |
| Double axis puzzle | Ask | None | [5516:68069](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5516-68069) |
| Double axis puzzle | Hit | Position | [5516:68119](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5516-68119) |
| Double axis puzzle | Miss | None | [5516:68344](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5516-68344) |

Fourteen pools. The doc's table has no pool for halfway through and one pool for both puzzles; every card and state has its own here.

### Slots
| Slot | Value | Rules |
|---|---|---|
| Minutes | A whole number, 1 or more | Written with the abbreviation "min.", which is the same for every number |
| Orientation, leading, other, trait | An orientation's name | Exactly as the quiz wrote it: same case, same capitals, never declined, never shortened |
| Position | A named position's name | The same. Where the name has a masculine and a feminine form, the form is chosen as [universal orientation](./universal-orientation.md) says. Mid-quiz the taker has not been asked their gender, so that is the masculine form |
| Count | 2 or 3 | Only these two. Both take the same noun form, "ćwiartki" |
| Percent | A whole number, 1 to 10 | Written with the "%" sign |
| Thesis | The text of the question | As written, with one closing full stop removed so the line's own punctuation ends the sentence |

In the tables below a slot is written in braces, such as `{trait}`.

### The pools
Each table gives the three lines a pool starts with. Line 1 is the line of the Figma frame; where it differs from the frame, the frame's wording is in the last column and the reason is under "Calls and their cost". Lines 2 and 3 are new. Figma draws a long dash between lead-in and statement; it is shown here as " - ".

**Halfway through**

| # | Lead-in | Statement | Figma line |
|---|---|---|---|
| 1 | Jesteś na półmetku | To już prawie koniec, pozostałe pytania zajmą ok. {minutes} min. | Jesteś na półmetku - To już prawie koniec, pozostałe pytania zajmą ok. ___ min. |
| 2 | Połowa za Tobą | Reszta pytań zajmie ok. {minutes} min. | - |
| 3 | Teraz już z górki | Do końca quizu zostało ok. {minutes} min. | - |

**Axis closeness, single axis**

| # | Lead-in | Statement | Figma line |
|---|---|---|---|
| 1 | To już wiemy | Twój wynik na skali „{orientation}” jest wysoki! | To już wiemy - Twój radykalizm jest wysoki! |
| 2 | Tu nie ma wątpliwości | Na skali „{orientation}” wypadasz wysoko. | - |
| 3 | Jedno jest jasne | Skala „{orientation}”: jak dotąd wysoki wynik. | - |

**Axis closeness, double axis**

| # | Lead-in | Statement | Figma line |
|---|---|---|---|
| 1 | Tego już jesteśmy pewni | Twój wynik po stronie „{leading}” jest wyższy niż po stronie „{other}”! | Tego już jesteśmy pewni - Twój eurosceptycyzm wynosi więcej niż federacjonizm! |
| 2 | To widać coraz wyraźniej | „{leading}” czy „{other}”? Na tym etapie quizu bliżej Ci do pierwszej z tych stron. | - |
| 3 | Szala się przechyla | Jak dotąd strona „{leading}” wyprzedza u Ciebie stronę „{other}”. | - |

**New trait**

| # | Lead-in | Statement | Figma line |
|---|---|---|---|
| 1 | A to niespodzianka! | Masz nową cechę: „{trait}”... to dobrze, niedobrze? | A to niespodzianka! - Zdobyłeś cechę “Monarchizm”... to dobrze, niedobrze? |
| 2 | Proszę, proszę | Do Twojego profilu trafia cecha „{trait}”. Co Ty na to? | - |
| 3 | Nowość w kolekcji | Cecha „{trait}” jest od teraz Twoja. Dobrze to czy źle? Ocena należy do Ciebie. | - |

**Nolan chart path, two or three quadrants**

| # | Lead-in | Statement | Figma line |
|---|---|---|---|
| 1 | Co ja tu robię? | W trakcie wykonywania quizu Twoja pozycja przeszła już przez {count} ćwiartki kompasu! | Co ja tu robię? - W trakcie wykonywania quizu przeszedłeś już przez ___ ćwiartki kompasu! |
| 2 | Niezła wędrówka | Masz już za sobą {count} ćwiartki kompasu, a quiz jeszcze trwa. | - |
| 3 | Trochę Cię nosi | Twoje odpowiedzi prowadzą już przez {count} ćwiartki kompasu. | - |

**Nolan chart path, four quadrants**

| # | Lead-in | Statement | Figma line |
|---|---|---|---|
| 1 | Wielka przeprawa! | Wszystkie ćwiartki kompasu są już za Tobą. | Wielka przeprawa! - Przeszedłeś już przez wszystkie ćwiartki kompasu. |
| 2 | Dookoła kompasu | Twoja pozycja odwiedziła już każdą z czterech ćwiartek. | - |
| 3 | Komplet! | Cztery ćwiartki kompasu zaliczone, a quiz jeszcze trwa. | - |

**Stats chart, the taker is for the thesis**

| # | Lead-in | Statement | Figma line |
|---|---|---|---|
| 1 | Rzadki okaz | Należysz do {percent}% osób, które popierają tezę „{thesis}”. | Rzadki okaz - Należysz do 10% osób, które popierają tezę “Wielka Polska Katolicka w silnej chrześcijańskiej Europie.”. |
| 2 | Niewielu Was | Tezę „{thesis}” popiera tylko {percent}% osób. Ty też. | - |
| 3 | Jesteś w małej grupie | Tylko {percent}% osób jest za tezą „{thesis}”. | - |

**Stats chart, the taker is against the thesis**

| # | Lead-in | Statement | Figma line |
|---|---|---|---|
| 1 | Rzadki okaz | Należysz do {percent}% osób, które nie zgadzają się z tezą „{thesis}”. | Not drawn. Mirrors line 1 of the pool above |
| 2 | Pod prąd | Tezę „{thesis}” odrzuca tylko {percent}% osób. Ty też. | - |
| 3 | Jesteś w małej grupie | Tylko {percent}% osób jest przeciw tezie „{thesis}”. | - |

**Single axis puzzle, ask**

| # | Lead-in | Statement | Figma line |
|---|---|---|---|
| 1 | Jak myślisz? | Do czego jest Tobie bliżej? Zgadnij teraz! | Jak myślisz? - Do czego jest Tobie bliżej? Zgadnij teraz! |
| 2 | Mała zagadka | Która strona tej osi jest Ci bliższa? Wybierz jedną! | - |
| 3 | Sprawdźmy intuicję | Po której stronie wypadasz na tym etapie quizu? Zgadnij! | - |

**Single axis puzzle, hit**

| # | Lead-in | Statement | Figma line |
|---|---|---|---|
| 1 | Trafione! | Na tym etapie quizu bliżej Ci do strony „{leading}”. | Trafione! - Wolny rynek jest ci najbliższy na tym etapie quizu. |
| 2 | Znasz siebie | Jak dotąd wygrywa u Ciebie strona „{leading}”. | - |
| 3 | Bez pudła | Tak, na tym etapie quizu prowadzi u Ciebie strona „{leading}”. | - |

**Single axis puzzle, miss**

| # | Lead-in | Statement | Figma line |
|---|---|---|---|
| 1 | A to ciekawe! | Wyszło inaczej, niż się spodziewasz. | A to ciekawe! - Wyszło inaczej niż myślałeś. |
| 2 | Niespodzianka | Na tym etapie quizu bliżej Ci jednak do strony „{leading}”. | - |
| 3 | No proszę | Twoje odpowiedzi wskazują jak dotąd na stronę „{leading}”. | - |

**Double axis puzzle, ask**

| # | Lead-in | Statement | Figma line |
|---|---|---|---|
| 1 | Jak myślisz? | Do jednej z opcji jest Tobie bardzo blisko, zgadnij do której! | Jak myślisz? - Do jednej z opcji jest Tobie bardzo blisko, zgadnij do której! |
| 2 | Zgadnij, kto to | Jedna z tych postaci jest teraz najbliżej Twoich odpowiedzi. Która? | - |
| 3 | Czas na typowanie | Tylko do jednej z tych opcji jest Ci naprawdę blisko. Wskaż ją! | - |

**Double axis puzzle, hit**

| # | Lead-in | Statement | Figma line |
|---|---|---|---|
| 1 | Trafione! | {position} jest do Ciebie bardzo blisko na tym etapie quizu. | Trafione! - Zielony postępowiec jest do Ciebie bardzo blisko na tym etapie quizu. |
| 2 | Jest! | Na tym etapie quizu najbliżej Ciebie jest {position}. | - |
| 3 | Dobre oko | Postać najbliższa Twoim odpowiedziom to jak dotąd {position}. | - |

**Double axis puzzle, miss**

| # | Lead-in | Statement | Figma line |
|---|---|---|---|
| 1 | Pudło! | Ktoś inny jest Tobie najbliższy. Kto? Teraz nie powiemy! | Pudło! - Ktoś inny jest Tobie najbliższy. Kto? Teraz nie powiemy! |
| 2 | Nie tym razem | Najbliżej Ciebie jest inna postać. Która? To się okaże w wynikach. | - |
| 3 | Zagadka trwa | To nie ta opcja. Kto jest najbliżej? Odpowiedź czeka w wynikach. | - |

## Interface
| Direction | Name | Shape | Notes |
|---|---|---|---|
| In | Card and state | Which pool to draw from | From the event model when a card fires, and from a puzzle when it reveals |
| In | Slot values | The values for that pool's slots | From the card |
| In | Seeded draw | A choice that depends on the session's seed and on a name | From the [event model](./event-model.md) |
| In | Lines already used | Which lines this session has drawn from each pool | From the event model's record of cards shown |
| In | Language | The language the app is shown in | Chooses the catalogue |
| Out | Lead-in and statement | Two finished texts, the slots filled | To the [card frame](./checkpoints.md) |
| Out | The line drawn | Which line of which pool | Recorded with the card, so a reload shows the same words |

## Behaviour

### Drawing a line
| Case | Behaviour |
|---|---|
| A session starts | Every pool gets an order of its own: its lines shuffled by the seeded draw, under the pool's name. The order of one pool says nothing about another's |
| A card fires | It takes the next unused line in the order of its pool |
| The same pool is used again later in the session | The next line in that order. A line used once is not used again |
| A puzzle | The ask line is drawn when the card fires. The hit or the miss line is drawn when the taker guesses, from that state's own pool |
| The page is reloaded while a card is up | The card shows the line recorded for it. Nothing is drawn again |
| A puzzle is guessed again after a reload | It shows the reveal line already recorded for it, if there is one |
| The taker goes back and answers again | Lines already used stay used. Cards are not shown twice, so nothing is drawn |
| The quiz is reset | A new session starts with a new seed and no lines used. Its pools get new orders |
| Two sessions with the same seed and the same answers | The same lines on the same cards |
| Two sessions with different seeds | Usually different lines on the same card |

### Filling the slots
| Case | Behaviour |
|---|---|
| A statement with a slot | The value is put in its place, as the slot table says |
| A statement that does not use one of its pool's slots | Nothing happens. The value is simply not shown |
| A name with capitals, digits or several words | Placed as written |
| A value that looks like a slot, or contains braces or markup | Placed as plain text. A value is never read as part of the line |
| A name long enough to break the line | The frame wraps it. A line is never shortened to fit |

### When a pool runs out
| Case | Behaviour |
|---|---|
| A pool is asked for more lines than it has | A new round starts: the pool is shuffled again by the seeded draw, under the pool's name and the number of the round, and drawing continues from its start |
| The first line of the new round is the line used last | It swaps places with the second, so the same words never come twice in a row |
| A pool of one line | That line, every time |
| With three lines per pool and the event model's limits | No pool can run out in one session: no card type appears more than three times in it |

### Languages
| Case | Behaviour |
|---|---|
| The source | Polish. Every lead-in and every statement is a source string of the app's catalogue |
| English | Each line has an English counterpart in the catalogue, written for English and not translated word for word. The pools have the same number of lines in both languages |
| The app's language changes during a session | A card on screen shows the same line of the same pool in the new language. The draw is by position in the pool, so it does not change |
| A line has no counterpart in the active language | The Polish source is shown, as for any other string of the app. This is a defect to catch before release, not a state to design for |
| The quiz is in another language than the app | The line is in the app's language and the names in its slots are in the quiz's. Nothing translates a name |
| A language is added to the app | It needs its own lines for all fourteen pools before checkpoints are complete in it |

## States and lifecycle
| State | Condition | What is possible in it |
|---|---|---|
| Fresh | No line of the pool was drawn in this session | Any line can come next, as the order says |
| Partly used | Some lines were drawn | Only the unused ones can come |
| Used up | Every line was drawn | The next draw starts a new round |

A pool's state belongs to one session and is rebuilt from the record of cards shown. It ends with the session.

## Rules and constraints
Rules every line has to follow. They are what makes a pool safe for any taker and any quiz, and they bind new lines as much as the ones above.

- **Nothing depends on the taker's gender.** Demographics come after the questions and can be skipped, so mid-quiz the gender is unknown. No past-tense verb about the taker ("zdobyłeś", "przeszłaś"), no adjective or participle about them ("pewien", "gotowa"). What works: the present tense, "Ty" and its forms, and a noun of ours as the subject - "Twoja pozycja przeszła", "Twój wynik jest wysoki".
- **A name is never bent.** It is author-supplied, so the line cannot know its gender, its number or how it declines. It appears in the nominative, attached to a noun of ours that carries the grammar - "cecha", "strona", "skala", "teza", "postać" - or standing alone after a colon or in a question. No adjective, pronoun or verb in the line has to agree with it.
- **One exception: a position.** It names a single character, so it may be the subject of a present-tense verb ("{position} jest ...").
- **A name used as a label is in Polish quotation marks.** A position is a character and is written without them.
- **The taker is addressed directly and with a capital letter:** "Ty", "Ci", "Twój", "Tobie".
- **A line states, it does not judge.** It never calls a finding good, bad, extreme or normal, and never jokes about the name in the slot. The tone may be light; the claim may not be.
- **A line about a score is hedged to the moment** at least once in every such pool: "jak dotąd", "na tym etapie quizu".
- **A miss is interesting, never wrong** in the single axis puzzle. Its lines do not say "źle" or "błąd".
- **A line claims only what the card knows.** No line says how rare or how common a finding is, except in the stats pools, where the number is on the card.
- **Lead-ins have no slots and end without a full stop.** The dash that follows is the frame's.
- **Lines are written, not assembled.** No line is built from parts at run time, and no word is chosen by a number, because the forms would have to agree.
- **Zero configuration.** A quiz cannot add, remove or reorder lines.
- **Not supported: a line per gender, a line per quiz, a line chosen by the value in its slot.**

### Calls and their cost
| Call | Instead of | Cost |
|---|---|---|
| A line is a lead-in and a statement written as a pair | The doc's table, which pools lead-ins only | Three lines give three wordings, not nine. No pairing goes out that nobody read |
| "Masz nową cechę: ..." | Figma: "Zdobyłeś cechę ..." - a verb in the masculine form | The line loses the sense of having earned something |
| "Twoja pozycja przeszła już przez ..." and "Wszystkie ćwiartki kompasu są już za Tobą." | Figma: "przeszedłeś ...", "Przeszedłeś ..." - masculine | Slightly less direct |
| "Wyszło inaczej, niż się spodziewasz." | Figma: "Wyszło inaczej niż myślałeś." - masculine | None |
| "Twój wynik na skali „{orientation}” jest wysoki!" | Figma: "Twój radykalizm jest wysoki!" - "Twój" and "wysoki" agree with a masculine name, and the name is lower-cased | The sentence is longer and names a "scale". "Twoja religijność", "Twoje państwo minimum" would each need another form |
| "Twój wynik po stronie „{leading}” jest wyższy niż po stronie „{other}”!" | Figma: "Twój eurosceptycyzm wynosi więcej niż federacjonizm!" - the same agreement | Longer |
| "Na tym etapie quizu bliżej Ci do strony „{leading}”." | Figma: "Wolny rynek jest ci najbliższy ..." - "najbliższy" agrees with the name | None |
| Polish quotation marks, and no second full stop after a quoted thesis | Figma: English quotation marks, and a full stop on both sides of the closing mark | None |
| Two stats pools, for and against | One Figma line, written for a taker who supports the thesis | A second pool to keep in step with the first |
| The thesis is quoted without its closing full stop | Quoting it to the letter, as the stats chart doc says | One character of the author's text is dropped. With it, a quote in the middle of a sentence would carry a full stop there |
| A position's name is shown in its masculine form on a card | Waiting for the taker's gender, which is asked after the questions | A taker who later declares female sees "Zielony postępowiec" on the card and the feminine form in the result |
| Halfway through has a pool | The doc, which lists none for it | Three lines for a card that appears once per quiz. The variety shows between sessions, not within one |
| English lines are written with the build, one per Polish line | The doc's "authored per language", which would let pools differ in size | The English pools cannot be longer or shorter than the Polish ones |

## Invalid and edge input
| Input | Behaviour |
|---|---|
| A slot value that is missing or empty | The line cannot be finished. The card is not shown - see the [event model](./event-model.md) |
| A name with space around it | Trimmed |
| A name that already has quotation marks in it | Placed as written, inside the line's own marks |
| A thesis that ends with a question mark or an exclamation mark | Kept. Only a single closing full stop is removed |
| A thesis with a full stop in the middle | Kept as written |
| Minutes below 1, count outside 2 and 3, percent outside 1 to 10 | Not a value the card may pass. The card is not shown |
| A pool with no lines in the active language | The card is not shown |
| A pool asked for by a state that does not exist | Nothing is drawn and the card is not shown |
| A seed that is missing | The draw uses the event model's fixed seed. Lines are still drawn, in a fixed order |

Nothing here throws. A card without words is a card that does not appear.

## Failure modes
| Failure | Behaviour |
|---|---|
| A line cannot be drawn or filled | The card is not shown and the next question appears |
| The record of used lines is lost | Drawing starts from the top of each pool's order. A line may repeat once in the session |

## Non-functional
- **Every line is checked with its worst values**: the longest orientation name and the longest thesis the quizzes in use have, a one-character name, a name of several words, each number at both ends of its range. At the narrowest supported width the line wraps and nothing is cut.
- **Every line is read against the rules above** before it ships, by someone who is not its author. The rules are checkable one by one.
- **The same in every browser.** A seed draws the same lines everywhere.
- **Stable within a release.** Adding or removing a line changes what a seed draws, so a session is repeatable against the version of the pools it ran on.
- **Read by a screen reader as one sentence**: lead-in, pause, statement. No line relies on its typography to make sense.

## Dependencies
Relies on:

- [Random copy doc](../../docs/modules/quiz/questionnaire/checkpoints/checkpoints-random-copy.md) - the idea this implements - and [internationalisation](../../docs/platform/internationalisation.md), which counts these pools as content.
- [Event model](./event-model.md) - the seeded draw, the record of cards shown, and the limits that keep a pool from running out.
- [Checkpoints](./checkpoints.md) - the frame that draws a line.
- [Universal orientation](./universal-orientation.md) - names, and the form of a position's name.

Relied on by every card spec, for its wording: [halfway through](./halfway-through.md), [axis closeness](./axis-closeness.md), [new trait](./new-trait.md), [single axis puzzle](./single-axis-puzzle.md), [Nolan chart path](./nolan-chart-path.md), [double axis puzzle](./double-axis-puzzle.md), [stats chart](./stats-chart.md).
