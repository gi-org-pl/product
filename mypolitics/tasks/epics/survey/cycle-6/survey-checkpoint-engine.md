# Story

As a user taking a quiz, I want the cards shown between questions to come at the right moments - one at a time, not too often, each saying something my answers already support, in words I have not heard yet in this quiz - and to stop for good the moment I turn them off, so that they feel like a reward and never like noise.

# Component properties

**Module:** the checkpoint engine - the card types and what each carries, the function that answers "which card, if any, at this boundary", the typed reading of the session's record of cards shown, the seeded draw, and the copy pools
**Location:** `src/types/checkpoint.ts`, `src/constants/checkpoint.ts`, `src/utils/checkpoint/`
**Shared:** no - the `survey` domain only

There is **no component in this task**. It is pure TypeScript: no clock, no chance outside the seeded draw, no network, no storage. The engine is asked once at every boundary between two questions and answers at once with one card or with nothing.

Two of its inputs have no source today and are simply empty: the trait list (so the running state never holds an unlocked trait) and the answer aggregates. The new trait card and the stats chart are therefore built and tested here, and can fire in no real quiz until the data exists.

```ts
// src/types/checkpoint.ts - added to the running state types of survey-running-state
import type { MessageDescriptor } from "@lingui/core";

// In priority order, 1 = highest. Every type except "halfway" is personal.
export type CheckpointType =
  | "stats"           // 1 - stats chart
  | "new-trait"       // 2
  | "position-puzzle" // 3 - double axis puzzle
  | "nolan-path"      // 4 - Nolan chart path
  | "axis-closeness"  // 5
  | "axis-puzzle"     // 6 - single axis puzzle
  | "halfway";        // 7 - halfway through, the only generic type

// One pool per card and state. Fourteen.
export type CheckpointPoolId =
  | "halfway"
  | "axis-closeness-single"
  | "axis-closeness-double"
  | "new-trait"
  | "nolan-path-partial" // two or three quadrants
  | "nolan-path-full"    // four quadrants
  | "stats-for"
  | "stats-against"
  | "axis-puzzle-ask"
  | "axis-puzzle-hit"
  | "axis-puzzle-miss"
  | "position-puzzle-ask"
  | "position-puzzle-hit"
  | "position-puzzle-miss";

// A drawn line: which line of which pool, by its position in the pool. Language-independent.
export interface CheckpointLine {
  pool: CheckpointPoolId;
  index: number;
}

// A line as written in the pools: a lead-in and a statement, always drawn together.
export interface CheckpointCopyLine {
  leadIn: MessageDescriptor;    // no slots
  statement: MessageDescriptor; // slots as ICU placeholders, such as {minutes}
}

export type CheckpointPools = Record<CheckpointPoolId, CheckpointCopyLine[]>;

// A line in the active language, slots filled. Ready for the card frame.
export interface CheckpointText {
  leadIn: string;
  statement: string;
}

export type CheckpointSlots = Record<string, string | number>;

export type CheckpointOutcome = "hit" | "miss";

// What every card carries. A card is frozen when it fires: nothing in it changes with later answers.
interface CheckpointCardBase {
  boundary: number;     // the number of done questions when it fired
  line: CheckpointLine; // the line drawn when it fired. For a puzzle: its ask line
}

export interface StatsCheckpointCard extends CheckpointCardBase {
  type: "stats";
  questionId: string;                                         // the question just answered
  thesis: string;                                             // its text, as written
  side: "for" | "against";                                    // the taker's side
  counts: { for: number; against: number; noAnswer: number }; // the three slices of the pie
  percent: number;                                            // the share of the taker's side: a whole number, 1 to 10
}

export interface NewTraitCheckpointCard extends CheckpointCardBase {
  type: "new-trait";
  trait: Orientation; // the trait announced: name, colour, image
}

export interface PositionPuzzleCheckpointCard extends CheckpointCardBase {
  type: "position-puzzle";
  leader: Orientation;    // the closest archetype - the correct option
  closeness: number;      // its closeness when the card fired, 50 to 100: the length of the bar
  options: Orientation[]; // the three rows in the order they are shown: the leader and two distractors
}

export interface NolanPathCheckpointCard extends CheckpointCardBase {
  type: "nolan-path";
  variant: "partial" | "full"; // two or three quadrants | four quadrants
  count: 2 | 3 | 4;            // quadrants visited in the whole run. 4 exactly when the variant is "full"
  trail: CompassPoint[];       // the part of the route this card draws, in order. Its last point is where the taker stands
  isSecondPath: boolean;       // true = the four-quadrant card after a partial one: the trail starts where that card left off
}

interface AxisClosenessCheckpointCardBase extends CheckpointCardBase {
  type: "axis-closeness";
  axisId: string;
}

export interface AxisClosenessSingleCheckpointCard extends AxisClosenessCheckpointCardBase {
  variant: "single";
  entry: AxisEntry; // the orientation and its value when the card fired, 70 or more
}

export interface AxisClosenessDoubleCheckpointCard extends AxisClosenessCheckpointCardBase {
  variant: "double";
  start: AxisEntry;             // the negative side and its value
  end: AxisEntry;               // the positive side and its value
  leadingSide: "start" | "end"; // the side the title and the statement name
}

export type AxisClosenessCheckpointCard =
  | AxisClosenessSingleCheckpointCard
  | AxisClosenessDoubleCheckpointCard;

export interface AxisPuzzleCheckpointCard extends CheckpointCardBase {
  type: "axis-puzzle";
  axisId: string;
  start: AxisEntry;             // the start pole and its value when the card fired
  end: AxisEntry;               // the end pole and its value
  leadingSide: "start" | "end"; // the correct option
}

export interface HalfwayCheckpointCard extends CheckpointCardBase {
  type: "halfway";
  percent: number; // progress at the boundary, a whole percent rounded down, never below 50
  minutes: number; // time left, whole minutes, 1 to 99
}

export type CheckpointCard =
  | StatsCheckpointCard
  | NewTraitCheckpointCard
  | PositionPuzzleCheckpointCard
  | NolanPathCheckpointCard
  | AxisClosenessCheckpointCard
  | AxisPuzzleCheckpointCard
  | HalfwayCheckpointCard;

// One item of the session's `cardsShown`: a card that was put on screen, and the reveal lines a puzzle drew on it.
// This is what the screen hands to `showCheckpoint` of survey-session: `session.showCheckpoint({ card })`.
export interface CheckpointShownCard {
  card: CheckpointCard;
  revealLines?: Partial<Record<CheckpointOutcome, CheckpointLine>>;
}

// `SurveyCheckpointRecord` of survey-session with `cardsShown` narrowed from `unknown[]` to the cards of this task.
// It is the same record, not a second one: survey-session stores it, resets it and restores it, and `timeSamples`
// (`SurveyTimeSample[]`) is inherited unchanged. A stored record becomes a `CheckpointRecord` only through
// `readCheckpointRecord`, which checks its cards. The record is the only memory the engine has.
export interface CheckpointRecord extends SurveyCheckpointRecord {
  cardsShown: CheckpointShownCard[]; // oldest first. The last one is the card that is up, when one is
}

// How takers answered one question. The source reads and checks the response; the engine does the adding up.
export interface CheckpointAnswerCounts {
  resultsCounted: number;         // results in which the question was shown
  chosen: Record<string, number>; // by possible answer identifier: results that chose it
}

export type CheckpointAggregates = Record<string, CheckpointAnswerCounts>; // by question identifier

export interface CheckpointEngineInput {
  survey: Survey;
  entries: SurveyAnswerEntry[];            // `session.entries`. The last one is the question done at this boundary
  state: RunningState | null;              // `getRunningState(survey, session)` for the same session
  record: CheckpointRecord;                // `readCheckpointRecord(session.checkpointRecord)`
  seed: string;                            // `session.id`
  isOptedOut: boolean;                     // `session.areCheckpointsOff`
  enabledTypes: readonly CheckpointType[]; // the types that have a card component. Any other type is never a candidate
  aggregates?: CheckpointAggregates;       // absent = no source, or not loaded yet
}
```

```ts
// src/utils/checkpoint/
export const getNextCheckpoint = (input: CheckpointEngineInput): CheckpointCard | null => ...
// One card or nothing. Immediate. Never throws: any failure inside is "nothing".

export const readCheckpointRecord = (stored: SurveyCheckpointRecord): CheckpointRecord => ...
// The session's record with its cards checked. An item of `cardsShown` is kept when it holds a card with a known
// `type`, a whole-number `boundary` and a `line` that exists in the pools; any other item is dropped. Never throws.

export const drawRevealLine = (
  record: CheckpointRecord,
  outcome: CheckpointOutcome,
  seed: string,
): { line?: CheckpointLine; record: CheckpointRecord } => ...
// For the card that is up (the last of cardsShown): the reveal line already recorded for that outcome,
// or a newly drawn one, recorded in the returned record. No line for a card that is not a puzzle.
// The returned record is what the screen writes back to the session.

export const drawCheckpointLine = (
  pool: CheckpointPoolId,
  record: CheckpointRecord,
  seed: string,
): CheckpointLine | undefined => ...
// The next unused line of the pool for this session. undefined for a pool with no lines.

export const getCheckpointSlots = (
  card: CheckpointCard,
  pool: CheckpointPoolId,
): CheckpointSlots | undefined => ...
// The values of that pool's slots, taken from the card. undefined when a value is missing or out of range.

export const getCheckpointText = (
  i18n: I18n,
  card: CheckpointCard,
  line: CheckpointLine = card.line,
): CheckpointText | undefined => ...
// The lead-in and the statement of that line in the active language, slots filled.

export const getSeededRandom = (seed: string, purpose: string, draw = 0): number => ...
// A number in [0, 1) that depends only on the three arguments.

export const seededShuffle = <Item>(
  items: readonly Item[],
  seed: string,
  purpose: string,
  round = 0,
): Item[] => ...
// A new array in an order that depends only on the seed, the purpose and the round.
```

**How a card gets its words.** A card carries `line`, never text. The card component calls `getCheckpointText(i18n, card)` and hands the two strings to the card frame. A puzzle asks the screen for its reveal line when the taker guesses, gets a `CheckpointLine` back and calls `getCheckpointText(i18n, card, revealLine)`. Because a line is a position in a pool, a change of the app's language re-renders the same line in the new language.

### What this task reads from the tasks before it

No type of an earlier task is redefined here.

| From | Read |
|---|---|
| `RunningState`, `CompassPoint` (`survey-running-state`) | As defined there |
| `Survey`, `SurveyQuestion`, `SurveyPossibleAnswer` (`survey-api`) | A question's `id`, `text` and `possibleAnswers` |
| `SurveyAnswerEntry` (`survey-session`) | `questionId`, and `answerId` - absent for a skip |
| `SurveyCheckpointRecord`, `SurveyTimeSample` (`survey-session`) | The stored record: `cardsShown: unknown[]` and `timeSamples`. `CheckpointRecord` narrows the first and keeps the second |
| `getAnswerKind(question, answer)` (`survey-session`) | `strongly-agree`, `agree`, `disagree`, `strongly-disagree` or `custom`. Used only by the stats trigger |

The session keeps everything: `showCheckpoint` appends an item to `cardsShown`, `turnCheckpointsOff` sets the opt-out, a reset empties the record and carries the opt-out over. This task adds no storage and no action - it reads the record, and hands back a new one where a reveal line is drawn.

# Behaviour

The [event model spec](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/event-model.md) is the source of truth for the engine - sections "What the engine remembers", "The pipeline", "Card types", "Selection", "Pacing", "Opt-out", "Determinism and seed" - and the [random copy spec](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/checkpoints-random-copy.md) for the wording. Each card spec states its own trigger; where a card's numbers are repeated below they are the ones that stand.

*n* is the number of done questions at the boundary (`state.progress.done`), *all* the number of questions in the quiz.

### The pipeline

| Step | What happens | Result when it fails |
|---|---|---|
| 0. Opt-out | `isOptedOut` | Nothing |
| 1. Slot | The pacing rules that do not depend on the card - see "Pacing" | Nothing. No trigger is looked at |
| 2. Trigger | Every enabled type's condition is checked against the state | A type whose condition is false is not a candidate |
| 3. Confidence gate | Each candidate's own gate | A candidate that fails its gate is dropped |
| 4. Selection | The candidates are ranked; the first one wins | With no candidate: nothing |
| 5. Pacing, last rule | A winner of the same type as the previous card is dropped, and the next in the ranking of another type takes its place | With nobody left: nothing |
| 6. Card | The winner gets its values and its line, and is returned | - |

A candidate whose slot values cannot be filled, or whose pool has no line, is not a candidate - another one may win. `state` being `null` is "nothing".

### Card types

"Shown" always means: in `record.cardsShown`.

| Type | Kind | Trigger | Gate | How often |
|---|---|---|---|---|
| `stats` | Personal, moment | The question done at this boundary was answered, is eligible, has usable counts, and the taker's side was chosen by 10% of takers or fewer | The sample for the question is at least 100 | Once per session |
| `new-trait` | Personal, standing | `state.unlockedTraits` holds a trait that no shown card announced | None | Once per trait |
| `position-puzzle` | Personal, standing | `state.archetypes` has at least 3 entries | The leader's closeness is at least 5 points above the runner-up's and is 50 or more; at least half the questions are done; two distractors can be drawn | Once per session |
| `nolan-path` | Personal, standing | `state.compass` exists and at least 2 quadrants were visited | *n* is 10 or more | The partial version once. The full version once, also after the partial one |
| `axis-closeness` | Personal, standing | An axis of `state.axes` that has had no card qualifies | At least 5 answered questions feed it; a single axis has a value of 70 or more, a two-sided axis a lean of 15 or more | Once per axis |
| `axis-puzzle` | Personal, standing | A two-sided axis of `state.axes` that has had no card qualifies | The gate of a two-sided axis above | Once per axis |
| `halfway` | Generic, moment | *n* is `state.progress.midpointBoundary` | `state.timing.minutesLeft` exists and is 99 or less | Once per session |

- An axis gets **one card in a session**, closeness or puzzle. An axis "has had a card" when a shown `axis-closeness` or `axis-puzzle` card carries its identifier, or the same orientations - two axes with the same orientations are one axis here.
- Thresholds are compared on **exact values**. 69.6 is not 70; a lean of 14.99 is not 15.
- A **standing** trigger that loses, or meets a closed slot, is simply true again at the next boundary, if the state still supports it. That is not a queue: nothing about it is remembered. A **moment** trigger that loses is lost.
- A step back never removes a card from the record, so nothing shown is ever shown again.

### What each card is given

| Type | Values, frozen when it fires |
|---|---|
| `stats` | The question's identifier and text, the taker's side, the three counts, and `percent`: the share rounded up to a whole number, never below 1 |
| `new-trait` | The trait |
| `position-puzzle` | The leader, its closeness, and the three options in display order |
| `nolan-path` | The variant, the number of quadrants visited, and the trail to draw |
| `axis-closeness` | Single: the orientation with its value. Double: both sides with their values, and the leading side |
| `axis-puzzle` | Both poles with their values, and the leading side |
| `halfway` | `percent`: `state.progress.share` as a whole percent, rounded down. `minutes`: `state.timing.minutesLeft` |

**Stats counts.** For the question just answered, from `aggregates`:

| Value | Definition |
|---|---|
| Eligible question | `getAnswerKind` gives none of its possible answers as `custom`. A question with a custom answer is not eligible |
| For | The results that chose a `strongly-agree` or an `agree` answer |
| Against | The results that chose a `disagree` or a `strongly-disagree` answer |
| No answer | `resultsCounted` minus the two above |
| Sample | For plus against |
| The taker's side | For or against, by the answer just given. A skip has no side |
| Share | The count of the taker's side / `resultsCounted` |

**Position puzzle options.**

| Case | Behaviour |
|---|---|
| The correct option | The leader: the first entry of `state.archetypes` |
| Where distractors come from | The four archetypes ranked right behind the leader. With fewer than five archetypes, all the others |
| Two archetypes with the same name | The later one in the ranking is left out before the draw. Two rows never read the same |
| How the two are picked | With the seeded draw, under a purpose of this card |
| Order of the three rows | Shuffled with the seeded draw, under another purpose of this card. The leader has no fixed place |
| Fewer than two distractors are left | No candidate |

**Nolan path version and trail.**

| Case | Behaviour |
|---|---|
| 2 or 3 quadrants visited, no path card shown | `partial`, `count` 2 or 3, the whole trail |
| 4 quadrants visited, no path card shown | `full`, `count` 4, the whole trail. The partial version is then never shown in this session |
| 4 quadrants visited, the partial version shown, the full version not | `full`, `count` 4, `isSecondPath` true. The trail runs from the point the partial card ended on to the current one |
| The same, but the point the partial card ended on is no longer in the trail - the taker stepped back behind it | The whole trail, `isSecondPath` true |
| 2 or 3 quadrants visited, the partial version shown | No candidate, even if the count went from two to three |
| The full version shown | No candidate for the rest of the session |

The point the partial card ended on is the last point of that card's `trail`: the record of cards shown already holds it.

### Selection

The candidates that passed their gates are ordered by these keys, in this order. The first one wins.

| Key | Rule |
|---|---|
| 1. Personal before generic | Any personal candidate beats `halfway` |
| 2. New before seen | A type with no shown card in this session beats one that has |
| 3. Priority | The order of `CheckpointType` |
| 4. Within one type | See below |

| Case | Behaviour |
|---|---|
| Several axes qualify | The one with the highest lean. Equal leans: the one with more answered questions feeding it. Still equal: the earlier one in the quiz's order |
| Several traits are unlocked and not announced | The earlier one in the quiz's order. The others stay candidates for later boundaries |
| The full Nolan version is the candidate after the partial one was shown | It counts as a type not yet seen - the one exception to key 2 |
| `axis-closeness` and `axis-puzzle` are both candidates | Each proposes its own best axis, which may be the same one. Whichever type wins takes its axis; the other proposes again at a later boundary, from the axes still without a card |
| `halfway` is a candidate together with a personal one | The personal one wins, and the midpoint boundary passes |
| `halfway` is the only candidate | It wins |
| A decision between candidates | Never uses chance. Ties end in the quiz's order |

### Pacing

| Rule | A card may appear only when |
|---|---|
| Not at the start | *n* is 5 or more |
| Not before the end | 4 or more questions are left |
| Gap | At least 6 questions were done since the boundary of the previous card |
| Rate | Card number *k* of the session appears no earlier than boundary (*k* - 1) x *R*, where *R* is 10, or one sixth of *all* when that is more |
| Cap | Fewer than 6 cards were shown |
| No repeat in a row | Its type is not the type of the previous card, however long ago that was |

The first five are step 1; the last is step 5.

| Case | Behaviour |
|---|---|
| A quiz of 102 questions | *R* is 17. Cards may appear from boundaries 5, 17, 34, 51, 68 and 85 on, the last one at boundary 98 at the latest |
| A quiz of 30 questions | *R* is 10. The first card may appear from boundary 5, the second from boundary 10 - or 11 if the first came at 5, because of the gap - and the third from boundary 20. The last boundary a card can use is 26, so there are three cards at most |
| A quiz of 100 questions | *R* is 16.67, compared as it is: the second card needs boundary 17, the third 34, the fourth 50. Compare without a rounding error: for a quiz longer than 60 questions the rule is *n* x 6 >= (*k* - 1) x *all* |
| A quiz of fewer than 9 questions | No boundary passes both end rules. No card ever appears |
| A card was shown at boundary 20 and a standing trigger is true at boundary 23 | Nothing. The gap is 3 |
| The winner is an `axis-closeness` card and the previous card was one too | It is dropped and the next candidate of another type is returned. With none, nothing |
| The partial Nolan card was the previous card and the full one wins | It is dropped the same way: both are one type |
| The taker steps back behind the boundary of the last card and answers again | Nothing appears until 6 questions past that boundary |
| A puzzle | One card, whatever the taker does on it: guessed, continued without a guess, or closed by the opt-out |
| The question done at the boundary was skipped | The boundary is evaluated like any other. A card can follow a skip |
| The midpoint boundary falls where the slot is closed | No halfway card. It does not move to a later boundary |
| The taker steps back across the midpoint after the halfway card was dropped, and reaches it again | It is a candidate again at that boundary, under the same pacing |

Pacing overrules triggers. A card that cannot be shown now is dropped, not queued.

### Opt-out

| Case | Behaviour |
|---|---|
| `isOptedOut` is true | `getNextCheckpoint` returns nothing, at step 0, whatever the state |

Setting the opt-out (`turnCheckpointsOff`), keeping it with the session and carrying it over a reset belong to `survey-session`; pressing the button belongs to `survey-checkpoint`. The engine only obeys it.

### Seeded draw

| Case | Behaviour |
|---|---|
| The same seed, purpose and draw number | The same result, in every browser and on every device |
| Another purpose | An unrelated result. The draws of one purpose never shift those of another |
| The clock, `Math.random`, `crypto` | Never used |
| A seed that is missing or empty | A fixed seed is used. Everything still works and is still repeatable |

Write it in the repository as a string hash feeding a small integer generator; integer arithmetic only, so every engine gives the same numbers. No new dependency.

### Drawing a line

| Case | Behaviour |
|---|---|
| A session | Every pool has an order of its own: its lines shuffled by the seeded draw, under the pool's name. The order of one pool says nothing about another's |
| A card fires | It takes the next unused line in the order of its pool |
| Lines already used | Counted from the record: the `line` and the `revealLines` of every shown card that belong to the pool |
| A puzzle | The ask line is drawn when the card fires. The hit or the miss line is drawn by `drawRevealLine` when the taker guesses, from that state's own pool |
| A puzzle is guessed again after a reload | `drawRevealLine` returns the line already recorded for that outcome, if there is one, and draws nothing |
| A pool is asked for more lines than it has | A new round: the pool is shuffled again under the pool's name and the number of the round, and drawing continues from its start |
| The first line of the new round is the line used last | It swaps places with the second, so the same words never come twice in a row |
| A pool of one line | That line, every time |
| A pool with no lines | No line. The card is not a candidate |
| A new session - another seed, an empty record | New orders, no lines used |
| The record of used lines is lost | Drawing starts from the top of each pool's order |

### Filling the slots

| Pool | Slots | Value |
|---|---|---|
| `halfway` | `minutes` | The card's minutes |
| `axis-closeness-single` | `orientation` | The orientation's name |
| `axis-closeness-double` | `leading`, `other` | The name of the leading side, then of the other one |
| `new-trait` | `trait` | The trait's name |
| `nolan-path-partial` | `count` | The card's count |
| `nolan-path-full` | - | - |
| `stats-for`, `stats-against` | `percent`, `thesis` | The card's percent; the thesis with one closing full stop removed |
| `axis-puzzle-ask` | - | - |
| `axis-puzzle-hit`, `axis-puzzle-miss` | `leading` | The name of the leading pole |
| `position-puzzle-ask`, `position-puzzle-miss` | - | - |
| `position-puzzle-hit` | `position` | The leader's name |

| Case | Behaviour |
|---|---|
| A name | Exactly as the quiz wrote it, trimmed: same case, never declined, never shortened |
| A name that already has quotation marks, braces or markup in it | Placed as plain text. A value is never read as part of the line |
| A thesis that ends with a question mark or an exclamation mark, or has a full stop in the middle | Kept. Only a single closing full stop is removed |
| A statement that does not use one of its pool's slots | The value is simply not shown |
| A name that is missing or empty; minutes below 1; a count outside 2 and 3; a percent outside 1 to 10; an empty thesis | `getCheckpointSlots` returns nothing. The card is not a candidate |
| A card and a pool that do not belong together | Nothing |

When a card fires, the slots of every pool it can draw from are checked - for a puzzle its ask, hit and miss pools - so a card that is shown can always finish its reveal.

### The pools

Polish is the source. Every lead-in and every statement is a Lingui message of its own, defined with `msg` in `src/constants/checkpoint.ts`, with a `context` that names its pool so that equal texts in two pools stay separate entries. Slots are ICU placeholders. The English lines below go into the English catalog; they are written for English, not translated word for word, and each pool has the same number of lines in both languages. The Polish texts are quoted from the [random copy spec](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/checkpoints-random-copy.md) and are not to be reworded; the rules under "Rules and constraints" there bind any line added later.

The long dash between lead-in and statement belongs to the card frame and is part of no line.

| Pool | # | Lead-in (pl) | Statement (pl) | Lead-in (en) | Statement (en) |
|---|---|---|---|---|---|
| `halfway` | 1 | Jesteś na półmetku | To już prawie koniec, pozostałe pytania zajmą ok. {minutes} min. | You are halfway there | Almost done, the remaining questions will take about {minutes} min. |
| `halfway` | 2 | Połowa za Tobą | Reszta pytań zajmie ok. {minutes} min. | Half of it is behind you | The rest of the questions will take about {minutes} min. |
| `halfway` | 3 | Teraz już z górki | Do końca quizu zostało ok. {minutes} min. | Downhill from here | About {minutes} min. left until the end of the quiz. |
| `axis-closeness-single` | 1 | To już wiemy | Twój wynik na skali „{orientation}” jest wysoki! | This much we know | Your score on the “{orientation}” scale is high! |
| `axis-closeness-single` | 2 | Tu nie ma wątpliwości | Na skali „{orientation}” wypadasz wysoko. | No doubt about this one | On the “{orientation}” scale you score high. |
| `axis-closeness-single` | 3 | Jedno jest jasne | Skala „{orientation}”: jak dotąd wysoki wynik. | One thing is clear | The “{orientation}” scale: a high score so far. |
| `axis-closeness-double` | 1 | Tego już jesteśmy pewni | Twój wynik po stronie „{leading}” jest wyższy niż po stronie „{other}”! | Of this we are sure | Your score on the “{leading}” side is higher than on the “{other}” side! |
| `axis-closeness-double` | 2 | To widać coraz wyraźniej | „{leading}” czy „{other}”? Na tym etapie quizu bliżej Ci do pierwszej z tych stron. | It shows more and more clearly | “{leading}” or “{other}”? At this stage of the quiz you are closer to the first of these sides. |
| `axis-closeness-double` | 3 | Szala się przechyla | Jak dotąd strona „{leading}” wyprzedza u Ciebie stronę „{other}”. | The scales are tipping | So far the “{leading}” side is ahead of the “{other}” side for you. |
| `new-trait` | 1 | A to niespodzianka! | Masz nową cechę: „{trait}”... to dobrze, niedobrze? | Now that is a surprise! | You have a new trait: “{trait}”... good, bad? |
| `new-trait` | 2 | Proszę, proszę | Do Twojego profilu trafia cecha „{trait}”. Co Ty na to? | Well, well | The trait “{trait}” joins your profile. What do you make of it? |
| `new-trait` | 3 | Nowość w kolekcji | Cecha „{trait}” jest od teraz Twoja. Dobrze to czy źle? Ocena należy do Ciebie. | New in the collection | The trait “{trait}” is yours from now on. Good or bad? That is for you to judge. |
| `nolan-path-partial` | 1 | Co ja tu robię? | W trakcie wykonywania quizu Twoja pozycja przeszła już przez {count} ćwiartki kompasu! | What am I doing here? | During the quiz your position has already passed through {count} quadrants of the compass! |
| `nolan-path-partial` | 2 | Niezła wędrówka | Masz już za sobą {count} ćwiartki kompasu, a quiz jeszcze trwa. | Quite a journey | You already have {count} quadrants of the compass behind you, and the quiz is still on. |
| `nolan-path-partial` | 3 | Trochę Cię nosi | Twoje odpowiedzi prowadzą już przez {count} ćwiartki kompasu. | You do get around | Your answers have already led through {count} quadrants of the compass. |
| `nolan-path-full` | 1 | Wielka przeprawa! | Wszystkie ćwiartki kompasu są już za Tobą. | The great crossing! | All the quadrants of the compass are behind you now. |
| `nolan-path-full` | 2 | Dookoła kompasu | Twoja pozycja odwiedziła już każdą z czterech ćwiartek. | Around the compass | Your position has now visited each of the four quadrants. |
| `nolan-path-full` | 3 | Komplet! | Cztery ćwiartki kompasu zaliczone, a quiz jeszcze trwa. | Full set! | Four quadrants of the compass done, and the quiz is still on. |
| `stats-for` | 1 | Rzadki okaz | Należysz do {percent}% osób, które popierają tezę „{thesis}”. | A rare specimen | You are among the {percent}% of people who support the thesis “{thesis}”. |
| `stats-for` | 2 | Niewielu Was | Tezę „{thesis}” popiera tylko {percent}% osób. Ty też. | There are few of you | Only {percent}% of people support the thesis “{thesis}”. So do you. |
| `stats-for` | 3 | Jesteś w małej grupie | Tylko {percent}% osób jest za tezą „{thesis}”. | You are in a small group | Only {percent}% of people are for the thesis “{thesis}”. |
| `stats-against` | 1 | Rzadki okaz | Należysz do {percent}% osób, które nie zgadzają się z tezą „{thesis}”. | A rare specimen | You are among the {percent}% of people who disagree with the thesis “{thesis}”. |
| `stats-against` | 2 | Pod prąd | Tezę „{thesis}” odrzuca tylko {percent}% osób. Ty też. | Against the current | Only {percent}% of people reject the thesis “{thesis}”. So do you. |
| `stats-against` | 3 | Jesteś w małej grupie | Tylko {percent}% osób jest przeciw tezie „{thesis}”. | You are in a small group | Only {percent}% of people are against the thesis “{thesis}”. |
| `axis-puzzle-ask` | 1 | Jak myślisz? | Do czego jest Tobie bliżej? Zgadnij teraz! | What do you think? | Which are you closer to? Guess now! |
| `axis-puzzle-ask` | 2 | Mała zagadka | Która strona tej osi jest Ci bliższa? Wybierz jedną! | A little puzzle | Which side of this axis is closer to you? Pick one! |
| `axis-puzzle-ask` | 3 | Sprawdźmy intuicję | Po której stronie wypadasz na tym etapie quizu? Zgadnij! | Time to test your intuition | Which side do you land on at this stage of the quiz? Guess! |
| `axis-puzzle-hit` | 1 | Trafione! | Na tym etapie quizu bliżej Ci do strony „{leading}”. | Spot on! | At this stage of the quiz you are closer to the “{leading}” side. |
| `axis-puzzle-hit` | 2 | Znasz siebie | Jak dotąd wygrywa u Ciebie strona „{leading}”. | You know yourself | So far the “{leading}” side is winning for you. |
| `axis-puzzle-hit` | 3 | Bez pudła | Tak, na tym etapie quizu prowadzi u Ciebie strona „{leading}”. | Right on target | Yes, at this stage of the quiz the “{leading}” side is in the lead for you. |
| `axis-puzzle-miss` | 1 | A to ciekawe! | Wyszło inaczej, niż się spodziewasz. | Now that is interesting! | It came out differently than you expect. |
| `axis-puzzle-miss` | 2 | Niespodzianka | Na tym etapie quizu bliżej Ci jednak do strony „{leading}”. | Surprise | At this stage of the quiz you are in fact closer to the “{leading}” side. |
| `axis-puzzle-miss` | 3 | No proszę | Twoje odpowiedzi wskazują jak dotąd na stronę „{leading}”. | Well, look at that | So far your answers point to the “{leading}” side. |
| `position-puzzle-ask` | 1 | Jak myślisz? | Do jednej z opcji jest Tobie bardzo blisko, zgadnij do której! | What do you think? | You are very close to one of these options, guess which one! |
| `position-puzzle-ask` | 2 | Zgadnij, kto to | Jedna z tych postaci jest teraz najbliżej Twoich odpowiedzi. Która? | Guess who | One of these characters is closest to your answers right now. Which one? |
| `position-puzzle-ask` | 3 | Czas na typowanie | Tylko do jednej z tych opcji jest Ci naprawdę blisko. Wskaż ją! | Time to pick | Only one of these options is really close to you. Point to it! |
| `position-puzzle-hit` | 1 | Trafione! | {position} jest do Ciebie bardzo blisko na tym etapie quizu. | Spot on! | {position} is very close to you at this stage of the quiz. |
| `position-puzzle-hit` | 2 | Jest! | Na tym etapie quizu najbliżej Ciebie jest {position}. | Got it! | At this stage of the quiz the closest to you is {position}. |
| `position-puzzle-hit` | 3 | Dobre oko | Postać najbliższa Twoim odpowiedziom to jak dotąd {position}. | Good eye | So far the character closest to your answers is {position}. |
| `position-puzzle-miss` | 1 | Pudło! | Ktoś inny jest Tobie najbliższy. Kto? Teraz nie powiemy! | Missed! | Someone else is closest to you. Who? We are not telling yet! |
| `position-puzzle-miss` | 2 | Nie tym razem | Najbliżej Ciebie jest inna postać. Która? To się okaże w wynikach. | Not this time | Another character is closest to you. Which one? The results will tell. |
| `position-puzzle-miss` | 3 | Zagadka trwa | To nie ta opcja. Kto jest najbliżej? Odpowiedź czeka w wynikach. | The puzzle goes on | It is not this option. Who is closest? The answer is waiting in the results. |

A name used as a label sits inside the line's own quotation marks - Polish ones in the Polish line. A position is a character and is written without them.

### Invalid and edge input

Nothing here throws. A failure of any kind ends as "no card".

| Input | Behaviour |
|---|---|
| `state` is `null`, or the quiz has no questions | Nothing |
| `enabledTypes` is empty | Nothing, at every boundary |
| Fewer than 3 archetypes | No `position-puzzle` |
| Two archetypes with the same closeness at the top | The separation is zero. No `position-puzzle` |
| A leader without a value | No `position-puzzle` |
| A two-sided axis with one value absent, or with equal values | Not a candidate for either axis card |
| A single axis with a value of 30 or less | Nothing. Only a high reading is stated |
| A single axis | Never a candidate for `axis-puzzle` |
| `aggregates` absent, or with no entry for the question just answered | No `stats` |
| The taker skipped the question | No `stats` |
| A count that is negative or not a whole number | No `stats` for that question |
| The answers of a question add up to more than its `resultsCounted` | No `stats` for that question |
| `resultsCounted` is zero | No `stats` for that question |
| An answer of the question with no count | Read as zero |
| Counts for an answer the question does not have | Ignored |
| A sample under 100 | No `stats`, however small the share |
| The share is exactly 10% | A candidate |
| Nobody chose the taker's side yet | A candidate. `percent` is 1 |
| A stored record with an item that is not a shown card - no card, an unknown type, no boundary, a line that does not exist | `readCheckpointRecord` drops that item and keeps the others. A dropped card may then repeat once |
| A stored record whose `cardsShown` is not a list | `readCheckpointRecord` reads it as no cards shown, and keeps the time samples |
| An exception anywhere inside `getNextCheckpoint` | Caught. Nothing is returned |

### Non-functional

- **Immediate.** The answer for a quiz of a hundred questions is ready well inside the answer's own animation. The engine never waits for anything.
- **Deterministic.** The same survey, seed, entries, record and aggregates give the same card with the same values and the same line. Answering faster or slower can change only the minutes of a halfway card.
- **Stable within a release.** Adding or removing a line changes what a seed draws. Do not reorder the pools without a reason.
- **Private.** Nothing in `src/utils/checkpoint/` stores, sends or logs anything. The record is handed back to the caller, who keeps it with the session.

# Out of scope

- **The running state** - `survey-running-state`. The engine reads it and computes no score.
- **Putting a card on screen**, the frame, the two buttons, the Checkpoints phase, calling the session's `showCheckpoint`, `closeCheckpoint` and `turnCheckpointsOff`, measuring time, and the registry that says which types are enabled - `survey-checkpoint`.
- **Storing the record and the opt-out** - `survey-session`, which already does both.
- **What each card draws** - the card tasks. They read their member of `CheckpointCard` and nothing else.
- **Loading answer aggregates** - the source address, the request, checking the response, how old it may be: `survey-checkpoint-stats`. The engine takes `aggregates` as given, and none are given today.
- **A source for the trait list** - none exists. `state.unlockedTraits` is empty in every real quiz.
- **Two-beat events** - a card that schedules a follow-up. Not built: both puzzles reveal on their own card.
- **Per-quiz switches and author-written copy** - there are none.
- **Analytics** - no event is raised here.

# Files to create

`getSeededRandom.ts` and `seededShuffle.ts` (with their tests) may already be on `main`: the results calculation task (`survey-results-calculation`, cycle 5) needs the same seeded shuffle for its lines and creates exactly these two files, with the signatures above, when they do not exist yet. If they are there, use them as they are and add only the missing test cases; if they are not, create them here.

```
src/types/checkpoint.ts                    # + the types above
src/constants/checkpoint.ts                # + CHECKPOINT_PRIORITY, the thresholds below, CHECKPOINT_POOLS
src/utils/checkpoint/
├── getNextCheckpoint.ts                   # the pipeline; catches everything
├── getNextCheckpoint.test.ts
├── getNextCheckpoint.fixtures.ts          # hand-built states, records and quizzes
├── isCheckpointSlotOpen.ts                # step 1: start, end, gap, rate, cap
├── isCheckpointSlotOpen.test.ts
├── rankCheckpointCandidates.ts            # step 4, and the no-repeat rule of step 5
├── rankCheckpointCandidates.test.ts
├── getStatsCandidate.ts
├── getStatsCandidate.test.ts
├── getQuestionCounts.ts                   # for / against / no answer / sample for one question
├── getQuestionCounts.test.ts
├── getNewTraitCandidate.ts
├── getNewTraitCandidate.test.ts
├── getPositionPuzzleCandidate.ts
├── getPositionPuzzleCandidate.test.ts
├── getPositionPuzzleOptions.ts            # distractors and order
├── getPositionPuzzleOptions.test.ts
├── getNolanPathCandidate.ts
├── getNolanPathCandidate.test.ts
├── getQualifyingAxes.ts                   # the shared gate, "has had a card", and the order
├── getQualifyingAxes.test.ts
├── getAxisClosenessCandidate.ts
├── getAxisClosenessCandidate.test.ts
├── getAxisPuzzleCandidate.ts
├── getAxisPuzzleCandidate.test.ts
├── getHalfwayCandidate.ts
├── getHalfwayCandidate.test.ts
├── getSeededRandom.ts
├── getSeededRandom.test.ts
├── seededShuffle.ts
├── seededShuffle.test.ts
├── drawCheckpointLine.ts
├── drawCheckpointLine.test.ts
├── drawRevealLine.ts
├── drawRevealLine.test.ts
├── getCheckpointSlots.ts
├── getCheckpointSlots.test.ts
├── getCheckpointText.ts
├── getCheckpointText.test.ts
├── readCheckpointRecord.ts
└── readCheckpointRecord.test.ts
```

One function per file, each with its own test. Split further if a file gets hard to read; no empty files.

Thresholds are constants with a name, in `src/constants/checkpoint.ts`, never numbers in the code: 5 done before the first card, 4 left after the last, a gap of 6, a rate of 10 and of one sixth, a cap of 6, 5 answered questions behind an axis, 70 for a single axis, 15 for a two-sided one, 3 archetypes, a separation of 5, 4 archetypes to draw distractors from, 10 done and 2 quadrants for the path, a share of 10% and a sample of 100 for the stats, 99 minutes. The closeness of 50 is `PARTIAL_MATCH_FROM` from `src/constants/results.ts` - the same number for the same reason; do not declare it twice.

# Unit test cases (BDD)

```ts
describe('getSeededRandom()', () => {
  it('returns a number from 0 up to, not including, 1', ...);
  it('returns the same number for the same seed, purpose and draw', ...);
  it('returns another number for another purpose', ...);
  it('returns another number for another draw', ...);
  it('uses a fixed seed when the seed is missing or empty', ...);
  it('matches a list of numbers written down in the test, so every browser agrees', ...);
});

describe('seededShuffle()', () => {
  it('keeps every item exactly once', ...);
  it('returns the same order for the same seed, purpose and round', ...);
  it('returns another order for another round', ...);
  it('does not change the list it was given', ...);
});

describe('isCheckpointSlotOpen()', () => {
  describe('given fewer than 5 done questions', () => {
    it('is closed', ...);
  });
  describe('given fewer than 4 questions left', () => {
    it('is closed', ...);
  });
  describe('given a quiz of fewer than 9 questions', () => {
    it('is closed at every boundary', ...);
  });
  describe('given a card shown at boundary 20', () => {
    it('is closed at boundary 23', ...);
    it('is open at boundary 26 when the rate allows', ...);
  });
  describe('given a quiz of 102 questions', () => {
    it('opens for cards 1 to 6 from boundaries 5, 17, 34, 51, 68 and 85', ...);
    it('is closed after boundary 98', ...);
  });
  describe('given a quiz of 30 questions', () => {
    it('opens for the second card at 10, or at 11 when the first came at 5', ...);
    it('opens for the third card at 20', ...);
    it('never opens for a fourth card', ...);
  });
  describe('given a quiz of 100 questions', () => {
    it('opens for the second card at 17, the third at 34 and the fourth at exactly 50', ...);
  });
  describe('given 6 cards shown', () => {
    it('is closed', ...);
  });
  describe('given the taker stepped back behind the boundary of the last card', () => {
    it('stays closed until 6 questions past that boundary', ...);
  });
});

describe('getQuestionCounts()', () => {
  it('adds strongly agree and agree into for, disagree and strongly disagree into against', ...);
  it('counts what is left of resultsCounted as no answer', ...);
  it('reads an answer with no count as zero', ...);
  it('ignores a count for an answer the question does not have', ...);
  it('returns nothing for a question with a custom answer', ...);
  it('returns nothing for a count that is negative or not a whole number', ...);
  it('returns nothing when the answers add up to more than resultsCounted', ...);
  it('returns nothing when resultsCounted is zero', ...);
});

describe('getStatsCandidate()', () => {
  describe('given no aggregates', () => {
    it('returns nothing', ...);
  });
  describe('given a share of 10% or less and a sample of 100 or more', () => {
    it('returns a card for the question just answered', ...);
    it('takes the side from the answer just given', ...);
    it('rounds the percent up and never below 1', ...);
  });
  describe('given a share of exactly 10%', () => {
    it('returns a card', ...);
  });
  describe('given a share above 10%', () => {
    it('returns nothing', ...);
  });
  describe('given a sample under 100', () => {
    it('returns nothing', ...);
  });
  describe('given nobody chose the taker\'s side', () => {
    it('returns a card with a percent of 1', ...);
  });
  describe('given the question was skipped', () => {
    it('returns nothing', ...);
  });
  describe('given a stats card was already shown', () => {
    it('returns nothing', ...);
  });
});

describe('getNewTraitCandidate()', () => {
  it('returns nothing when no trait is unlocked', ...);
  it('returns the first unlocked trait that was not announced, in the quiz\'s order', ...);
  it('returns the next one once the first was announced', ...);
  it('returns nothing when every unlocked trait was announced', ...);
});

describe('getPositionPuzzleOptions()', () => {
  it('draws two distractors from the four archetypes ranked right behind the leader', ...);
  it('draws from all the others when there are fewer than five archetypes', ...);
  it('leaves out the later of two archetypes with the same name', ...);
  it('returns nothing when fewer than two distractors are left', ...);
  it('returns three options that include the leader', ...);
  it('returns the same options in the same order for the same seed', ...);
  it('is not changed by a draw made for another purpose', ...);
});

describe('getPositionPuzzleCandidate()', () => {
  it('returns nothing with fewer than 3 archetypes', ...);
  it('returns nothing before half the questions are done', ...);
  it('returns nothing when the leader is under 50', ...);
  it('returns nothing when the leader is less than 5 points ahead', ...);
  it('returns nothing when the two closest are equal', ...);
  it('returns a card at a separation of exactly 5 and a closeness of exactly 50', ...);
  it('returns nothing once the card was shown', ...);
});

describe('getNolanPathCandidate()', () => {
  it('returns nothing for a quiz without a compass', ...);
  it('returns nothing with fewer than 2 quadrants visited', ...);
  it('returns nothing before 10 questions are done', ...);
  describe('given 2 or 3 quadrants and no path card shown', () => {
    it('returns the partial version with the count and the whole trail', ...);
  });
  describe('given 4 quadrants and no path card shown', () => {
    it('returns the full version with the whole trail', ...);
  });
  describe('given 4 quadrants and the partial version shown', () => {
    it('returns the full version as a second path', ...);
    it('starts the trail at the point the partial card ended on', ...);
    it('returns the whole trail when that point is no longer on the trail', ...);
  });
  describe('given 3 quadrants and the partial version shown at 2', () => {
    it('returns nothing', ...);
  });
  describe('given the full version shown', () => {
    it('returns nothing', ...);
  });
});

describe('getQualifyingAxes()', () => {
  it('needs at least 5 answered questions behind the axis', ...);
  it('takes a single axis at 70 and not at 69.6', ...);
  it('takes a two-sided axis at a lean of 15 and not at 14.99', ...);
  it('leaves out a two-sided axis with an absent value', ...);
  it('leaves out an axis that has had a closeness card or a puzzle', ...);
  it('treats two axes with the same orientations as one', ...);
  it('orders by lean, then by answered questions, then by the quiz\'s order', ...);
});

describe('getAxisClosenessCandidate()', () => {
  it('returns the single variant for a single axis, with its orientation and value', ...);
  it('returns the double variant for a two-sided axis, with both sides and the leading side', ...);
  it('keeps the sides of the quiz when the positive side leads', ...);
  it('returns nothing when no axis qualifies', ...);
});

describe('getAxisPuzzleCandidate()', () => {
  it('returns the best two-sided axis with both poles and the leading side', ...);
  it('never returns a single axis', ...);
  it('returns nothing when no two-sided axis qualifies', ...);
});

describe('getHalfwayCandidate()', () => {
  it('returns a card at the midpoint boundary', ...);
  it('returns nothing at any other boundary', ...);
  it('rounds the percent down: 5 of 9 is 55', ...);
  it('returns nothing without minutes left', ...);
  it('returns nothing above 99 minutes', ...);
  it('returns nothing once the card was shown', ...);
});

describe('rankCheckpointCandidates()', () => {
  it('puts any personal candidate before halfway', ...);
  it('puts a type not yet shown before a type shown', ...);
  it('orders by priority within the same newness', ...);
  it('counts the full Nolan version as not yet shown after the partial one', ...);
  it('skips a winner of the same type as the previous card and takes the next of another type', ...);
  it('skips the full Nolan version when the partial one was the previous card', ...);
  it('returns nothing when every candidate is of the previous card\'s type', ...);
});

describe('drawCheckpointLine()', () => {
  it('returns the first line of the pool\'s order for a fresh record', ...);
  it('returns the next unused line when the pool was used before', ...);
  it('counts reveal lines as used', ...);
  it('never returns a line twice within one round', ...);
  it('starts a new round with a new order when the pool is used up', ...);
  it('swaps the first two lines of a new round when the first is the line used last', ...);
  it('returns the only line of a one-line pool every time', ...);
  it('returns nothing for a pool with no lines', ...);
  it('gives each pool an order that does not depend on the other pools', ...);
  it('returns the same lines for the same seed and record', ...);
});

describe('drawRevealLine()', () => {
  it('draws a hit line from the hit pool of the puzzle that is up, and records it', ...);
  it('draws a miss line from the miss pool, and records it', ...);
  it('returns the recorded line and draws nothing when that outcome was revealed before', ...);
  it('returns no line when the card that is up is not a puzzle', ...);
  it('returns no line for an empty record', ...);
});

describe('getCheckpointSlots()', () => {
  it('returns the minutes for the halfway pool', ...);
  it('returns the orientation name for the single axis pool', ...);
  it('returns the leading and the other name for the double axis pool', ...);
  it('returns the trait name, the count, the percent and the thesis for their pools', ...);
  it('returns the leading pole for the axis puzzle hit and miss pools', ...);
  it('returns the leader\'s name for the position puzzle hit pool', ...);
  it('returns no slots for the pools that have none', ...);
  it('trims a name and keeps its case', ...);
  it('removes one closing full stop from a thesis', ...);
  it('keeps a closing question mark, an exclamation mark and a full stop in the middle', ...);
  it('returns nothing for a missing or empty name', ...);
  it('returns nothing for minutes below 1, a count outside 2 and 3, a percent outside 1 to 10', ...);
  it('returns nothing for a pool that does not belong to the card', ...);
});

describe('getCheckpointText()', () => {
  it('returns the lead-in and the statement of the card\'s line with its slots filled', ...);
  it('returns the text of another line of the card when one is passed', ...);
  it('places a value with braces or markup in it as plain text', ...);
  it('returns the same line in English when the language changes', ...);
  it('returns nothing when the slots cannot be filled or the line does not exist', ...);
});

describe('CHECKPOINT_POOLS', () => {
  it('has fourteen pools of three lines each', ...);
  it('has no slot in any lead-in', ...);
  it('uses only the slots of its pool in every statement', ...);
  it('has an English counterpart for every line', ...);
});

describe('readCheckpointRecord()', () => {
  it('returns the cards of a record written by this code, in their order', ...);
  it('keeps the time samples as they are', ...);
  it('keeps the reveal lines of a puzzle', ...);
  it('drops an item with no card, an unknown type, no boundary or a line that does not exist', ...);
  it('keeps the other items when one is dropped', ...);
  it('reads cardsShown that is not a list as no cards shown', ...);
  it('never throws', ...);
});

describe('getNextCheckpoint()', () => {
  describe('given the taker turned checkpoints off', () => {
    it('returns nothing, whatever the state', ...);
  });
  describe('given no state', () => {
    it('returns nothing', ...);
  });
  describe('given a closed slot', () => {
    it('returns nothing even when a trigger is true', ...);
  });
  describe('given a type that is not enabled', () => {
    it('never returns it', ...);
    it('returns another candidate that is enabled', ...);
  });
  describe('given one candidate', () => {
    it('returns its card with the boundary, the values and a drawn line', ...);
  });
  describe('given the question done at the boundary was skipped', () => {
    it('evaluates the boundary like any other', ...);
  });
  describe('given halfway and a personal candidate at the midpoint', () => {
    it('returns the personal one', ...);
  });
  describe('given halfway alone at the midpoint', () => {
    it('returns halfway', ...);
  });
  describe('given a standing trigger that met a closed slot', () => {
    it('returns its card at the first boundary where the slot is open', ...);
    it('returns nothing if the state stopped supporting it in between', ...);
  });
  describe('given both axis cards qualify on the same axis', () => {
    it('returns one of them, by selection', ...);
    it('offers that axis to neither afterwards', ...);
  });
  describe('given a candidate whose slot value is missing', () => {
    it('leaves it out and returns the next candidate', ...);
  });
  describe('given a puzzle whose hit pool cannot be filled', () => {
    it('leaves it out', ...);
  });
  describe('given the same input twice', () => {
    it('returns equal cards', ...);
  });
  describe('given the same answers with other time samples', () => {
    it('returns the same cards, with other minutes on a halfway card at most', ...);
  });
  describe('given a replay of a whole quiz with a fixed seed', () => {
    it('shows the same cards at the same boundaries on every run', ...);
    it('never shows two cards of one type in a row, more than 6 cards, or two cards less than 6 questions apart', ...);
    it('never shows a card twice after the taker steps back and answers again', ...);
  });
  describe('given malformed input', () => {
    it('returns nothing and does not throw', ...);
  });
});
```

Test the engine on hand-built `RunningState` objects: the engine is a function of the state, so most cases need no quiz at all. Where a quiz or a session is needed, build it with `createSurvey` and `createSession` of `survey-session`. The stats cases need a small quiz and its entries. For `getCheckpointText`, activate the catalogs of the app in the test; for the pools, read the two `.po` files or the compiled catalogs to check that every line has an English counterpart.

# Remember about standards

- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Name the branch `feature/survey-checkpoint-engine-106`, following [Conventional Branch](https://conventional-branch.github.io/) - never keep a generated or default branch name
- Read `AGENTS.md` in the repository before starting; where it differs from this task on a standard, it wins
- No Storybook story - there is no component
- Every pool line goes through a Lingui `msg` macro with Polish as the source. Run `yarn i18n:extract`, fill in every new English entry from the table above, commit both catalogs. No line is built from parts at run time, and no word is chosen by a number
- No new dependency: the seeded draw is written in the repository
- No clock, no `Math.random`, no `crypto`, no storage, no network and no logging in `src/utils/checkpoint/`
- Commit only files that belong to the task; commits follow Conventional Commits
- The PR follows the repository's pull request template: Changes (with Decisions, Deviations, Verification), How to test, Checklist

# Dependencies

- `survey-running-state` (#105) - `RunningState` and `getRunningState`.
- `survey-session` (#101) - `SurveyCheckpointRecord`, `SurveyTimeSample`, `SurveyAnswerEntry`, `getAnswerKind`.
- `survey-api` (#100) - the `Survey` types.

It blocks `survey-checkpoint` (#107), which asks the engine at every boundary and keeps its record, and through it every card task. The card tasks are written against `CheckpointCard`: do not rename a member or a field without updating them.

# Resources

- [Spec - Event model](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/event-model.md) - the pipeline, the card types, selection, pacing, opt-out, determinism; this task is its engine part
- [Spec - Random copy](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/checkpoints-random-copy.md) - the pools, drawing a line, filling the slots, the rules every line keeps
- [Docs - Event model](https://github.com/gi-org-pl/product/blob/main/mypolitics/docs/modules/quiz/questionnaire/checkpoints/event-model.md) and [Docs - Random copy](https://github.com/gi-org-pl/product/blob/main/mypolitics/docs/modules/quiz/questionnaire/checkpoints/checkpoints-random-copy.md) - the ideas
- The card specs, for each trigger and for what each card draws from: [halfway through](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/halfway-through.md), [axis closeness](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/axis-closeness.md), [new trait](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/new-trait.md), [stats chart](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/stats-chart.md), [single axis puzzle](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/single-axis-puzzle.md), [double axis puzzle](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/double-axis-puzzle.md), [Nolan chart path](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/nolan-chart-path.md)
- [Spec - Session and data](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/session-and-data.md) - the seed and the checkpoint record
- Figma, for the first line of each pool: [halfway](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5515-67631) | [single axis](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5515-67082) | [double axis](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5515-67161) | [trait](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5515-67457) | [path, two or three](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5515-67219) | [path, four](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5516-69231) | [stats](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5515-67733) | [axis puzzle ask](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5515-67799), [hit](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5516-67925), [miss](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5516-68299) | [position puzzle ask](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5516-68069), [hit](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5516-68119), [miss](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5516-68344). Where a pool's first line differs from its frame, the spec says why, and the spec's wording stands
- [Lingui docs - macros](https://lingui.dev/ref/macro) - `msg` with placeholders and a `context`
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Vitest docs](https://vitest.dev/guide/)

# Definition of Done

- [ ] Code follows folder structure (`docs/frontend/conventions/PROJECT_STRUCTURE.md`)
- [ ] Naming follows `docs/frontend/conventions/NAMING.md`
- [ ] `CheckpointType`, `CheckpointCard` with its seven members, `CheckpointLine`, `CheckpointShownCard`, `CheckpointRecord` and `CheckpointEngineInput` live in `src/types/checkpoint.ts`, exactly as in this task
- [ ] `CheckpointRecord` extends `SurveyCheckpointRecord` of `survey-session` and only narrows `cardsShown`; there is no second record, no second time sample type, and nothing is stored outside the session
- [ ] `readCheckpointRecord` is the only way a stored record becomes a typed one; an item it cannot read is dropped without throwing
- [ ] `getNextCheckpoint` runs the pipeline in the order of the table and returns one card or nothing, at once, without throwing
- [ ] Every trigger and gate of "Card types" is implemented with its numbers as named constants, compared on exact values
- [ ] A type missing from `enabledTypes` is never returned
- [ ] Selection follows the four keys, the full Nolan version being the one exception to "new before seen"; no decision between candidates uses chance
- [ ] Pacing: start, end, gap, rate, cap and no-repeat hold; the 102, 30 and 100 question cases pass with their boundaries; a quiz of fewer than 9 questions never gets a card
- [ ] Nothing is queued: the engine's memory is the record it is given; a standing trigger is simply true again, a moment trigger that lost is gone
- [ ] An axis gets one card in a session, closeness or puzzle; two axes with the same orientations are one
- [ ] With `isOptedOut` nothing is returned at any boundary
- [ ] The stats trigger cannot fire without aggregates, and the new trait trigger cannot fire without an unlocked trait; both are tested with data passed in
- [ ] The seeded draw depends only on seed, purpose and draw number, uses a fixed seed when none is given, and gives the numbers written down in its test
- [ ] Fourteen pools of three lines exist as Lingui messages, Polish as written in the spec, English filled in; no lead-in has a slot
- [ ] Every line, in both languages, was read against the rules of the random copy spec by someone who is not its author, and the PR says who
- [ ] A line is drawn per pool in a seeded order, is not repeated within a round, and a new round never starts with the line used last
- [ ] Reveal lines are drawn on the guess, recorded, and returned again after a reload
- [ ] Slots are filled as plain text, names as written, the thesis without its one closing full stop; a card whose slots cannot be filled is never returned
- [ ] The same input gives the same card, values and line; a whole-quiz replay with a fixed seed is repeatable
- [ ] Every row of "Invalid and edge input" degrades as written
- [ ] Nothing in `src/utils/checkpoint/` reads the clock, `Math.random` or `crypto`, or stores, sends or logs anything
- [ ] Nothing imported from a component's `utils/`, constants or subcomponents
- [ ] Unit tests added, BDD style, coverage ≥95% on all new files; every function has its own test file
- [ ] PR states "No e2e: not mounted on any route"
- [ ] `yarn i18n:extract` run; every new English entry translated; `.po` files committed
- [ ] Biome lint clean
- [ ] TypeScript clean (no `any`, no `@ts-ignore`)
- [ ] Branch named `feature/survey-checkpoint-engine-106`
- [ ] CI green: build, lint, test
- [ ] PR description lists decisions and deviations from the ticket/spec; only files belonging to the task are committed
