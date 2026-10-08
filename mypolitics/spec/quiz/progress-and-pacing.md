# Progress and pacing

> Technical specification of the progress bar of the questionnaire: what counts as progress, what the bar shows for it, when it flashes, and where it is drawn.

Docs: [Progress and pacing](../../docs/modules/quiz/questionnaire/progress-and-pacing.md). | Design: [Figma](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=4237-57347)

![Saturated progress bar](../../assets/saturated-progress-bar.png)

## Kind
Front-end

## Scope
The one bar at the top of the questionnaire. It is built: it takes how many questions are done and how many there are, shows a value that is boosted in the first half of the quiz and true in the second, and flashes when that value changes. This spec writes down what is built and adds the three things the build left open - what counts as progress, what happens for a taker who asked for reduced motion, and in which phases the bar is drawn.

What it does not cover, and where that lives:

- **Where the taker is** - the category and the questions left in it are the pill's, in the [phases model](./phases-model.md). So is "Prawie koniec!", the other half of what the doc calls pacing.
- **How often the run of questions is interrupted** - the [event model](./event-model.md) budgets the cards. No card decides for itself.
- **How much time is left** - the [halfway through](./halfway-through.md) card.
- **How the track and the fill look** - the design system's progress bar, and the frame.

## Data
| Input | Data | Meaning | Rules |
|---|---|---|---|
| Done | A whole number | Questions the taker answered or skipped | From zero to all |
| All | A whole number | Questions of the quiz | Fixed for a session |

Words:

- **Progress** - done divided by all, as a percentage. It is the truth.
- **Shown value** - what the bar is filled to. It is progress put through the curve.
- **Midpoint** - progress of 50%.

## Interface
| Direction | Name | Shape | Notes |
|---|---|---|---|
| In | Done and all | Two numbers | From the session, by the [phases model](./phases-model.md) |
| Out | Nothing | - | The bar raises no event and cannot be pressed |

## Behaviour

### What counts as progress
| Case | Behaviour |
|---|---|
| A question is answered | Done grows by one |
| A question is skipped | Done grows by one. A skip moves the taker forward as much as an answer |
| The taker steps back | Done shrinks by one |
| Topics are picked in category select | Nothing. Every question is still asked, so all does not change |
| A checkpoint card is shown or left | Nothing |
| Demographics, the e-mail card, the loader | Nothing. They are not counted, before or after |
| The last question is done | Progress is 100% and stays there |
| The session is reset | Progress is zero |

There is one bar for the whole quiz. Cards and closing cards do not get their own, and do not take a share of this one.

### The curve
The shown value is progress, pulled upwards below the midpoint and left alone from the midpoint on.

| Progress | Shown value |
|---|---|
| At or below the midpoint | progress + 0.0003 x progress x (100 - progress) x (50 - progress) |
| Above the midpoint | progress |

| Progress | Shown value | Boost |
|---|---|---|
| 0 | 0 | 0 |
| 1 | 2.5 | 1.5 |
| 5 | 11.4 | 6.4 |
| 10 | 20.8 | 10.8 |
| 20 | 34.4 | 14.4 |
| 25 | 39.1 | 14.1 |
| 30 | 42.6 | 12.6 |
| 40 | 47.2 | 7.2 |
| 50 | 50 | 0 |
| 51 and above | The same number | 0 |
| 100 | 100 | 0 |

| Case | Behaviour |
|---|---|
| Nothing is done | The bar is empty |
| Everything is done | The bar is full |
| A quarter is done | The bar reads about two fifths |
| The boost | Largest a little past one fifth, about 14 points, and gone at the midpoint |
| The midpoint | Both halves give 50. There is no jump in the value |
| More is done | The shown value is always higher than before. One more answer never moves the bar back, at any point of the curve |
| Just below the midpoint | The bar moves at a quarter of its true pace: the boost is being paid back |
| Any quiz | The same curve. It is not tuned per quiz, per length or per taker |

### The flash
| Case | Behaviour |
|---|---|
| The shown value changes - an answer, a skip, a step back | The bar lightens for about a third of a second and settles back, so one answer is felt even when the fill barely moves |
| The bar appears - the session starts, the page is refreshed, the taker arrives on a phase that draws it | No flash. Nothing was done |
| A card is shown or left | No flash. The value did not change |
| The value changes while a flash is under way | One flash, counted from the last change |
| The taker asked their device for reduced motion | No flash, ever. The fill takes its new value at once |

Two differences from what is built, both to be made in the component: it flashes when it first appears, and it has no path for reduced motion.

One difference from the frame, kept as built: the frame tints the fill towards a lighter blue in steps and back, and the component lightens the whole bar, track included. The effect is the same event and the built one stays.

### Where the bar is drawn
| Phase | Bar | Reads |
|---|---|---|
| Loading | A placeholder in its place | - |
| Category select | Drawn | Empty |
| Questions | Drawn | The shown value |
| Checkpoints | Drawn | The value of the question just done. It does not move while the card is up |
| Demographics | Not drawn | - |
| E-mail capture | Drawn | Full |
| Results calculation | Not drawn | - |
| Short results | Not drawn | - |

This follows the [phase strip](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5582-97895) screen by screen. It means the bar leaves on demographics and returns, full, on the e-mail card. The strip draws that card with the short fill of the questions screen; that is a copied placeholder, since every question is behind the taker by then.

Where the bar is not drawn, the frame closes the gap: nothing holds its place.

## States and lifecycle
| State | Condition | What is possible in it |
|---|---|---|
| Empty | Nothing done | - |
| Boosted | Progress above zero and below the midpoint | - |
| True | Progress at or above the midpoint | - |
| Full | Everything done | - |
| Flashing | Within a third of a second of a change | - |

The board draws the bar at one value and the flash in eight steps. The bar is never interactive.

## Rules and constraints
- **A pure function of progress.** The shown value depends on done and all and on nothing else - not on time, not on the quiz, not on what was shown before.
- **The ends are exact.** The bar does not lie about starting or about finishing.
- **True from the midpoint on.** Every value the taker can check against the end of the quiz is the real one.
- **A printed percentage is progress, never the shown value.** Any number the questionnaire prints for how far the taker is - the halfway card prints one - is the truth. And none is printed below the midpoint, where the bar would disagree with it. The halfway card fires at or past the midpoint, where bar and number are the same.
- **One bar.** There is no second indicator of length: no "question 12 of 80", no per-category bar. The pill counts what is left in a category, which is a different question.
- **The bar is not a control.** It cannot be pressed, dragged or focused.
- **Short quizzes are not spared.** At ten questions two answers read as a third. The doc names it as the hardest distortion and the curve is still the same in every quiz; tuning it per length would make the bar depend on something other than progress.

## Invalid and edge input
| Input | Behaviour |
|---|---|
| All is zero | An empty bar |
| All is below zero, or not a number | An empty bar |
| Done is below zero, or not a number | An empty bar |
| Done is above all | A full bar |
| Done or all is not whole | Used as given. The curve does not need whole numbers |
| A quiz with one question | Empty, then full |
| A quiz of several hundred questions | The same curve. One answer moves the fill by less than can be seen, which is what the flash is for |

Nothing here throws.

## Non-functional

### Accessibility
- The bar is a progress bar to assistive technology, named "Postęp quizu". As built it has no name.
- The value it reports is the shown value, rounded to a whole percent - one number for everyone, whichever way the taker reads the screen.
- Changes are not announced as they happen. A hundred announcements would talk over the questions; the pill is what tells a screen reader user what is left.
- The flash is the only motion, it is brief, and it is removed for reduced motion. It carries no information that is not also in the fill.
- An empty bar and a full bar can be told apart when the system forces its own colours.

### Performance
The value is recalculated on every answer and costs nothing. The flash must not delay the next question: it runs while the screen changes, never before it.

## Dependencies
Relies on:

- [Progress and pacing doc](../../docs/modules/quiz/questionnaire/progress-and-pacing.md) - the idea this implements.
- [Session and data](./session-and-data.md) - done and all.
- [Answer model](./answer-model.md) - a skipped question is done.
- [Phases model](./phases-model.md) - which phase is on, and so whether the bar is drawn.
- The design system's progress bar, which the built component wraps.

Relied on by:

- [Phases model](./phases-model.md) - the top of the frame.
- [Halfway through](./halfway-through.md) - the percentage it prints has to agree with the bar, and does from the midpoint on.
- [Event model](./event-model.md) - it paces the interruptions that this bar does not show.
