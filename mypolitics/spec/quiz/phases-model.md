# Phases model

> Technical specification of the questionnaire screen: the seven phases of a session, what each shows, its buttons, and how the taker moves between them.

Docs: [Phases model](../../docs/modules/quiz/questionnaire/phases-model.md). | Design: [Figma](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5582-97895)

![The seven phases of a session](../../assets/phases-model.png)

## Kind
Front-end

## Scope
The one screen a quiz is taken on. It always has the same frame - a progress bar, a controls bar with back, a pill and reset, a content area, and a row of buttons - and what fills the frame is decided by the phase the session is in. This spec says which phases a session has, in what order, what each puts in the frame, what its buttons and the two controls do, and every move from one phase to another.

Two parts of the screen have no doc of their own, so their rules are here: **category select**, the first phase, and the **controls bar**, which is on screen in every phase.

What it does not cover, and where that lives:

- **What is held, stored and sent** - [session and data](./session-and-data.md). It also owns what is on screen before a session exists: loading, not found and failed to load.
- **The answers under a question, and skipping one** - [answer model](./answer-model.md).
- **The value of the bar** - [progress and pacing](./progress-and-pacing.md).
- **Whether a card is shown after an answer, and which** - the [event model](./event-model.md). **The card's frame and its two buttons** - [checkpoints](./checkpoints.md). **What a card says** - each card's own spec.
- **The demographics card and its lists** - [demographics](./demographics.md).
- **The e-mail card, and the sending of the link** - [results saving and marketing](./results-saving-and-marketing.md).
- **The loader, the hand-in and leaving for the result** - [engaging loader](./engaging-loader.md).
- **Short results** - the seventh phase belongs to the results module, see [short results card](../../docs/modules/quiz/results/short-results-card.md). It is not built with this screen: the sixth phase ends by leaving for the results.
- **The post-survey** - it is not one of the seven phases. See [post-survey module](../../docs/modules/quiz/data-harvesting/post-survey-module.md).
- **The site's header and footer** - the questionnaire is drawn inside the shell of the app, like every page.

## Data
| Input | Data | Meaning | Rules |
|---|---|---|---|
| Quiz | Name, questions, categories | What is being taken | Read once, see [session and data](./session-and-data.md) |
| Session | Entries, topics, phase, checkpoints off, demographics | Where the taker is and what they did | The phase is part of the session and is restored with it |
| Card to show | A checkpoint card, or nothing | The event model's answer after a question is done | Asked once per done question |
| Sending is set up | Yes or no | Whether the app is configured with somewhere to send the results link | Read when the app starts |

Words:

- **Visible category** - a category of the quiz that is not hidden and has a name.
- **Closing phases** - demographics, e-mail capture, results calculation and short results: everything after the last question.
- **Topic** - a category the taker picked in category select.
- **Limit** - how many topics may be picked: three, or one fewer than the number of visible categories when that is smaller. Two visible categories give a limit of one.

### The phases
| # | Phase | Its job | Part of a session when | Can be skipped |
|---|---|---|---|---|
| 1 | Category select | Let the taker say which topics matter most | The quiz has at least two visible categories | Yes, with "Pomiń" |
| 2 | Questions | Collect the answers | Always | The phase no; each question yes, with "Pomiń" |
| 3 | Checkpoints | Pay the taker back mid-quiz | Checkpoints are on and the event model has a card | Each card with "Dalej"; all later ones with "Wyłącz checkpointy" |
| 4 | Demographics | Ask the four fields | Always | Yes, with "Pomiń" |
| 5 | E-mail capture | Ask where to send the results link | Sending is set up, and the taker did not pick an age under 18 | Yes, with "Pomiń" |
| 6 | Results calculation | Hand the session in and wait for the result | Always | No |
| 7 | Short results | The first payoff | Not built here | No |

The order is fixed. Checkpoints is the one phase that comes back: it interrupts questions, once per card, and returns to them.

## Interface
| Direction | Name | Shape | Notes |
|---|---|---|---|
| In | Quiz and session | See "Data" | From [session and data](./session-and-data.md) |
| In | Card to show | A card or nothing | From the [event model](./event-model.md) |
| In | Whether e-mail capture is part of this session | Yes or no | From [results saving and marketing](./results-saving-and-marketing.md), asked on leaving demographics |
| Out | Session events | Topics picked, confirmed or skipped; answered; skipped; stepped back; demographics picked, given or skipped; checkpoints turned off; phase changed; reset | To [session and data](./session-and-data.md), which records and stores them |
| Out | Done and all | Two numbers | To the [progress bar](./progress-and-pacing.md) |
| Out | Question done | The entries so far | To the event model, after every answer and every skip |

## Behaviour

### The frame in each phase
| Phase | Bar | Pill | Back | Reset | Content | Buttons |
|---|---|---|---|---|---|---|
| Category select | Drawn, empty | The quiz name | Off | Off | The prompt and one row per visible category | "Idziemy dalej", "Pomiń" |
| Questions | Drawn | The category of the question and the questions left in it | On, except on the first question | On when there is something to clear | The question card and its answers | "Pomiń" |
| Checkpoints | Drawn, unchanged | As for the next question | Off | On | The card | "Dalej", "Wyłącz checkpointy" |
| Demographics | Not drawn | "Prawie koniec!" | On | On | The demographics card | "Zobacz wyniki", "Pomiń" |
| E-mail capture | Drawn, full | "Prawie koniec!" | On | On | The e-mail card | One button: "Pomiń" or "Wyślij i zobacz wyniki" |
| Results calculation | Not drawn | "Prawie gotowe" | Off | Off while the loader runs, on once it has failed | The loader | "Pobierz", "Pełne wyniki", both off |
| Short results | Not drawn | "Skrócone wyniki" | Off | Off | The results module's | The results module's |

This is the [phase strip](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5582-97895) read screen by screen, with one difference: the strip draws back as working on the checkpoint screen, and here it is off.

### Category select
| Case | Behaviour |
|---|---|
| The phase opens | The prompt names the limit - "Wybierz 3 najważniejsze dla Ciebie tematy." - in the grammatical form the number needs. Under it, one row per visible category, in the quiz's order, none picked |
| A row is pressed | It becomes a topic, and is drawn as picked |
| A picked row is pressed | It stops being a topic |
| The number of topics reaches the limit | Every row that is not picked is drawn disabled. The prompt, which names the limit, is the reason the taker can see |
| A topic is dropped at the limit | The other rows work again |
| No topic is picked | "Idziemy dalej" is off. "Pomiń" works |
| At least one topic is picked, the limit reached or not | "Idziemy dalej" works |
| "Idziemy dalej" | The topics are confirmed and the first question is shown |
| "Pomiń" | Whatever was picked is dropped, and the first question is shown |
| The taker is past this phase | There is no way back to it except reset |

Picking topics **prioritises, it does not cut**: every question of the quiz is still asked, in the same order, and the topics travel with the result so that the back-end can weigh their answers more. The doc says a long quiz "can be cut to them"; the API has no way to do that, so the phase does not shorten anything. The frame carries no line that says what picking does, and none is added.

### Questions
| Case | Behaviour |
|---|---|
| The phase opens, or a question is done | The current question is shown: its statement, its explanation when it has one, and its answers by the [answer model](./answer-model.md) |
| An answer is acknowledged, or "Pomiń" is pressed | The question is done. The event model is asked for a card |
| It answers with nothing, and a question is open | The next question is shown |
| It answers with a card | The checkpoints phase, for that card |
| It was the last question | Demographics. No card is shown after the last question, whatever the event model says |
| Back | The last done question is shown again and its answer or skip is removed. No card is shown on the way back |
| Back on the first question | Off |
| The question belongs to a visible category | The pill shows the category name and the number of questions left in it, the current one included. On the last question of a category it reads 1 |
| The question belongs to a hidden category, to a category without a name, or to none | The pill shows the quiz name, and no number |
| The number in the pill changes | It rolls to the new value, as built: down when answering, up when stepping back |
| The explanation was open when the question changed | The next question starts with its explanation closed |

Questions are asked in the quiz's order, so the category in the pill can change back and forth: the presidential quiz mixes its categories.

### Checkpoints
| Case | Behaviour |
|---|---|
| A card is to be shown | It takes the place of the question card and the answers. The bar and the pill stay as they are |
| "Dalej" | The next question is shown |
| "Wyłącz checkpointy" | Checkpoints are turned off for the session, and the next question is shown. No card is shown again, even after a reset |
| A card that asks the taker to guess | Its own spec says in which of its states "Dalej" is offered. "Wyłącz checkpointy" is on every state of every card |
| Back | Off. A card is not a place to go back from; the taker continues and can step back from the next question |
| Reset | Works, as in questions |
| Checkpoints are off | The event model is not asked, and this phase never comes |
| The page is refreshed on a card | The same card is up again, as [checkpoints](./checkpoints.md) says. If it cannot be put up again, the next question is shown |

### Demographics
| Case | Behaviour |
|---|---|
| The phase opens | The [demographics](./demographics.md) card, with whatever the session already holds picked |
| "Zobacz wyniki" | Works when all four fields are picked. The demographics are marked as given, and the next phase comes |
| "Pomiń" | Always works. The demographics are marked as not given, and the next phase comes |
| The next phase | E-mail capture when it is part of this session; results calculation otherwise |
| Back | The last question is shown again and its answer or skip is removed. What was picked on the card is kept |
| The taker answers that question again | They are back here, with the same values picked |

### E-mail capture
| Case | Behaviour |
|---|---|
| Sending is not set up | The phase does not exist. Nothing on screen hints that a card is missing |
| The age picked on the demographics card is under 18 | The phase is left out, whether that card was left with "Zobacz wyniki" or with "Pomiń". No address is asked of a minor |
| The taker skipped demographics without picking an age | The phase is shown. Nobody is asked their age in order to leave an e-mail |
| The phase opens | The [e-mail card](./results-saving-and-marketing.md) |
| The button, while the field holds no valid address | "Pomiń". It leads to results calculation, and no link will be sent |
| The button, once the field holds a valid address | "Wyślij i zobacz wyniki". It leads to results calculation, and the link is sent from there, after the result exists |
| Back | Demographics, with its values as they were. What was typed and ticked here is still there when the taker comes forward again |
| The page is refreshed | The phase comes back with an empty field and an unticked box |

This phase only collects. Nothing is sent while it is on screen.

### Results calculation
| Case | Behaviour |
|---|---|
| The phase opens | The [loader](./engaging-loader.md). The session is handed in at once |
| Back | Off, in every state of the loader, failure included |
| Reset | Off while the loader runs. On in its failed state, so a taker whose hand-in is refused for good can start over |
| "Pobierz", "Pełne wyniki" | Drawn and off for the whole phase |
| The loader ends well | The taker is sent to the results, in the same tab, and the session is removed from the browser |
| The loader fails | Its own retry works, and so does reset. Nothing else does |
| The page is refreshed | The phase starts again with the same session. The hand-in is repeated, which is safe |

### Reset
| Case | Behaviour |
|---|---|
| Reset is pressed | The dialog that is built opens: "Rozpocząć od nowa?", with the quiz name in its question and "Resetuj quiz" |
| The dialog is confirmed | Answers, skips, topics, demographics, the e-mail field and its box are cleared, a new session starts, and the first phase of this quiz is shown |
| The dialog is closed any other way | Nothing changes |
| Checkpoints were turned off | They stay off after the reset |
| There is nothing to clear - no done question, no confirmed topic | Reset is off. This is the first question of a quiz without category select, or of a session that skipped it |
| Category select | Reset is off, as in the frame, even with rows picked |
| Results calculation | Reset is off while the loader runs, and on once it has failed |
| Short results | Reset is off |

### Moving between phases
| From | On | To |
|---|---|---|
| A new session | The quiz has at least two visible categories | Category select |
| A new session | It has fewer | Questions, on the first question |
| Category select | "Idziemy dalej", "Pomiń" | Questions, on the first question |
| Questions | A question is done and a card is to be shown | Checkpoints |
| Questions | A question is done, no card, a question is open | Questions, on the next one |
| Questions | The last question is done | Demographics |
| Questions | Back | Questions, on the question before |
| Checkpoints | "Dalej", "Wyłącz checkpointy" | Questions, on the next question |
| Demographics | "Zobacz wyniki", "Pomiń" | E-mail capture, or results calculation when that phase is not part of the session |
| Demographics | Back | Questions, on the last question |
| E-mail capture | Its button, in either wording | Results calculation |
| E-mail capture | Back | Demographics |
| Results calculation | The result is calculated and the loader is done | Out, to the results |
| Any phase where reset is on | Reset, confirmed | The first phase of a new session |

### Changing what is on screen
| Case | Behaviour |
|---|---|
| The question changes | The old question and its answers leave and the new ones arrive in one short movement: forwards when answering or skipping, backwards when stepping back |
| The phase changes | The same movement, forwards, or backwards after back |
| The taker asked their device for reduced motion | Nothing moves. The new content replaces the old at once |
| A change is under way | The screen takes no press until the new content is there. The change is never longer than the acknowledgement of an answer |
| The new content is taller or shorter | The view returns to the top of the screen, so a question is never opened half-scrolled |
| A card, a closing card or the loader takes over | The frame stays where it is. Only the bar, the pill and the content change |

Figma draws no movement between phases. It draws the roll of the number in the pill and the acknowledgement of an answer, and both are built.

## States and lifecycle
The screen has no state of its own beyond the phase of the session. Each phase is one state; what is possible in it is the row of "The frame in each phase". Before any phase there are the three states of [session and data](./session-and-data.md): loading, not found and failed to load.

| State | Condition | What is possible in it |
|---|---|---|
| Category select | New session, at least two visible categories, topics not confirmed | Pick up to the limit, continue, skip |
| Questions | A question is open | Answer, skip, open the explanation, step back, reset |
| Checkpoints | A card is on screen | Continue, guess when the card asks, turn checkpoints off, reset |
| Demographics | Every question is done | Pick values, continue with or without them, step back, reset |
| E-mail capture | Demographics was left, and the phase is part of the session | Type, tick, continue, step back, reset |
| Results calculation | The last closing card was left | Wait; after a failure, retry or reset |

## Rules and constraints
- **The order is fixed, the membership is not.** Category select needs categories, e-mail capture needs somewhere to send and a taker who is not a minor, checkpoints stop when turned off. No phase is ever reordered.
- **Everything asked for comes after the answers.** No phase before the last question asks the taker for anything but answers and, once, their topics.
- **Leaving early leaves nothing.** The session is handed in when results calculation starts. A taker who quits on a closing card leaves no result. The doc says the data is safe by then; with one hand-in it is not, and that is the cost of sending nothing early.
- **One way forward per phase.** Each phase has one primary button, and "Pomiń" beside or under it wherever the phase can be skipped. E-mail capture has one button that is both.
- **Skipping is never hidden.** Where a phase can be skipped, "Pomiń" is on screen from the first moment and is never disabled.
- **Back undoes.** Stepping back to a question removes what was answered there. There is no browsing of earlier answers.
- **A card is not a place.** It cannot be reached by going back and cannot be gone back from.
- **No way back from the hand-in.** Back is off from results calculation on, and reset is off while the loader runs, so the result is the one the taker answered for. Reset returns only when the loader has failed: a taker with no result to reach can start over instead of being stuck.
- **The end announces itself.** The pill stops naming a category and says "Prawie koniec!" from demographics on, then "Prawie gotowe".
- **One column.** The frame is the same at every width: a single column, centred, never wider than a comfortable line of text. Figma draws it at phone width only, and no second layout exists.
- **The seventh phase is a contract.** The phase list is shared with the results module. Until short results is built, the sixth phase stands in for the end and sends the taker to the results that already run.
- **Not supported: jumping to a question.** There is no list of questions, no "next" without answering or skipping, and no return to category select.

## Invalid and edge input
| Input | Behaviour |
|---|---|
| A quiz with one visible category, or none | No category select |
| A quiz with exactly two visible categories | Category select with a limit of one: "Wybierz 1 najważniejszy dla Ciebie temat." |
| Two categories with the same name | Two rows. They are different categories |
| A long category name | In a row it wraps. In the pill it is cut with an ellipsis and read in full by assistive technology |
| A quiz with one question | Questions, then demographics. No card can fit |
| A question with a very long statement | The card grows and the page scrolls |
| A quiz without a name | The pill is not drawn where it would show only the name. The dialog asks "Czy na pewno chcesz rozpocząć quiz od nowa?" without one |
| Two presses on a button before the screen has changed | One action |
| Reset pressed while an answer is being acknowledged | Ignored, like every other press during the acknowledgement |
| The event model returns a card after the last question | The card is dropped |
| The event model returns a card while checkpoints are off | The card is dropped |
| A restored session whose phase does not fit | Repaired by [session and data](./session-and-data.md) before anything is drawn |

## Privacy and data handling
- **The address bar says nothing.** The phase and the question are not in the address, so a shared or logged address shows only which quiz was opened.
- **No address from a minor.** A taker who picks an age under 18 is never shown the e-mail card.
- **The screen sends nothing.** Every request is made by the data layer, the loader or the e-mail card, under their own rules.

## Failure modes
| Failure | Behaviour |
|---|---|
| The event model fails or does not answer | Counted as nothing to show. The next question comes; a broken card never holds the quiz |
| A card fails to draw | It is dropped and the next question is shown |
| The connection is lost during questions | Nothing changes. No phase before results calculation needs the network |
| The hand-in or the wait fails | The loader shows it and offers retry. No other phase is affected |

## Non-functional

### Accessibility
- Each phase opens with focus on the top of its content: the prompt, the statement, the card, the heading of a closing card. A taker using a screen reader hears what the phase is before its controls.
- The change of the pill to "Prawie koniec!" and "Prawie gotowe" is announced once.
- The back control is built with one name, "Poprzednie pytanie". That is right in questions and demographics. On e-mail capture it leads to demographics, so there it is named "Wróć"; the control has to take its name from the phase.
- A control that is off is announced as unavailable, and is skipped by the keyboard.
- Everything works from the keyboard in reading order: back, reset, content, buttons.
- Nothing depends on hover.

### Performance
Moving between questions needs no network and must feel immediate after the acknowledgement. The frame is not redrawn between questions: the bar and the controls stay, so the number in the pill can roll and the bar can flash.

### Rendering contexts
The screen is taken on a phone first. It is checked at the narrowest phone widths and on a desktop, where it stays one centred column inside the site's shell.

## Dependencies
Relies on:

- [Phases model doc](../../docs/modules/quiz/questionnaire/phases-model.md) - the idea this implements.
- [Session and data](./session-and-data.md) - the quiz, the session, and the states before a session exists.
- [Answer model](./answer-model.md), [progress and pacing](./progress-and-pacing.md), [demographics](./demographics.md) - what fills the questions phase, the bar and the fourth phase.
- [Event model](./event-model.md) and [checkpoints](./checkpoints.md) - whether a card comes, and its frame.
- [Results saving and marketing](./results-saving-and-marketing.md) and [engaging loader](./engaging-loader.md) - the fifth and sixth phase.
- The built pieces: the controls bar with its pill and reset dialog, category select, the question card, the answer button, the demographics card and the progress bar.

Relied on by:

- Every spec above, for its place in the sequence and for the controls bar over it.
- The results module - the phase list is the contract with it, and short results is its phase.
- [Analytics](../../docs/platform/analytics.md) - the funnel is counted by these phases.

It is built in steps: the screen with category select, questions, demographics and the hand-in first, on its address and started from the home page; then the e-mail phase and the loader; then the checkpoints phase.
