# Traits

> Technical specification of the module that shows the traits a taker earned.

Docs: [Traits](../../docs/modules/quiz/results/modules/traits.md). | Design: [Figma](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5513-26739)

![Traits, alone and in comparison](../../assets/traits.png)

## Kind
Front-end

## Scope
One result module: a [module wrapper](./module-wrapper.md) around a set of pills, one per earned trait. It is the only result module with no bar in it, because a trait is held or not held and has no score to draw. It holds no state and decides nothing about who earned what.

Not covered here:

- **Whether a trait is earned** - scoring. The module receives the traits that already are.
- **The card frame and its two buttons** - the [module wrapper](./module-wrapper.md) spec.
- **The mid-quiz card that announces a trait** - the checkpoints.

## Data
| Input | Data | Meaning | Rules |
|---|---|---|---|
| Title | Text | The card's name | Optional, as in the wrapper |
| Traits | A list of orientations | Every trait the quiz defines | In the quiz's order |
| Earned | Which of those traits the taker earned | The taker's result | May be none |
| Comparison | The other party, and which traits they earned | A friend's traits laid over the taker's | Optional |
| Statistics action, info action | Present or absent | The wrapper's two buttons | Optional, independent |

A trait is an orientation: a name, an icon and a colour, all author-supplied and untrusted. The other party is an orientation too, their avatar being the image.

The quiz's traits are configuration and who earned what is a result, so the two arrive separately. The order is the quiz's own. It means nothing - every trait is equally earned - but it is stable, so the same result always draws the same way, with or without a comparison. A trait nobody earned is not drawn.

## Interface
| Direction | Name | Shape | Notes |
|---|---|---|---|
| In | Everything in Data | - | Passed in by the result screen |
| Out | Statistics requested | An event with no payload | Passed through from the wrapper |
| Out | Info requested | An event with no payload | Passed through from the wrapper |

## Behaviour

### Pills
| Case | Behaviour |
|---|---|
| A trait | One pill: the trait's icon, then its name, on the trait's colour |
| Several traits | Pills flow in a row and wrap onto further rows, in the order given |
| A trait without an icon | The pill shows the name alone |
| A pill pressed | Nothing happens. Pills are not interactive |

### Comparison
With a comparison, the set drawn is every trait either party earned, in the quiz's order.

| Case | Behaviour |
|---|---|
| Both earned it | A solid pill carrying the other party's avatar on its corner |
| Only the taker earned it | A solid pill with no avatar |
| Only the other party earned it | A hatched pill carrying the other party's avatar |
| The other party earned nothing | The taker's pills, all without an avatar |

The hatching is the same pattern the universal axis uses for comparison, so "hatched means theirs" holds across the whole screen.

### Empty
| Case | Behaviour |
|---|---|
| No traits, no comparison | The card is drawn with one line of text saying no traits were earned |
| No traits for either party | The same line |
| The taker earned none, the other party did | The other party's pills, all hatched |

An empty set is a real outcome of a strict rule, so the card says so instead of showing a blank body that reads as broken.

## Rules and constraints
- **A set, not a ranking.** The module never sorts, never numbers and never emphasises one pill over another.
- **One size of pill.** A pill does not grow or shrink with the number of traits.
- **No score.** A trait earned by a hair looks the same as one earned outright; the module has no input that could say otherwise.
- **The module never hides itself.** Leaving it out of a quiz with no traits configured is the result screen's decision.

## Invalid and edge input
| Input | Behaviour |
|---|---|
| Trait name longer than the card | The pill is as wide as the card at most; the name is truncated to one line and stays complete for assistive technology |
| Trait without a name | Not drawn |
| Trait without a colour | The neutral fallback colour |
| Trait with a light colour | The label stays readable: dark text on a light pill, light text on a dark one |
| The same trait listed twice | Drawn once |
| Other party without an avatar | A neutral avatar placeholder in the same place |
| Comparison that names no earned traits | Treated as the other party having earned nothing |
| An earned trait the quiz does not define | Ignored |

Nothing here throws. Trait names are the sharpest words an author writes, and a bad one must not take the card down - whether it should be shown at all is moderation's question, not this module's.

## Non-functional

### Rendering contexts
The result screen, comparison mode and the generated result image. In the image the caller passes no actions.

### Accessibility
- The pills are a list, and each item is its trait's name.
- In comparison each item also says whose it is in words - shared with the other party, or only theirs. Hatching and the avatar are never the only carriers.
- The trait icon is decorative.
- The empty line is ordinary text, read like any other.

## Dependencies
**Build order: step 1.** Needs the [module wrapper](./module-wrapper.md), which is built. It does not use the universal axis, and it can be built alongside the [single axis chart](./single-axis-chart.md), the [double axis chart](./double-axis-chart.md) and the [header](./header.md).

Relies on:

- [Traits doc](../../docs/modules/quiz/results/modules/traits.md) - the idea this implements.
- [Module wrapper](./module-wrapper.md).
- [Universal axis](./universal-axis.md) - only for the hatching pattern, which must match.

Relied on by nothing in this folder.
