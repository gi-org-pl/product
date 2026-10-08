# Story

As a user taking a quiz, I want the questionnaire to know, after every answer, what my answers add up to so far - my scores, where I stand on each axis and on the compass, which position I am closest to, and how long the rest will take - so that the cards shown between questions can tell me something true about myself before the end.

# Component properties

**Module:** the running state - its types, and the pure functions that compute it from a quiz and a session
**Location:** `src/types/checkpoint.ts`, `src/constants/checkpoint.ts`, `src/utils/running-state/`
**Shared:** no - the `survey` domain only

There is **no component in this task**. It is pure TypeScript: nothing renders, nothing fetches, nothing is stored, nothing reads the clock. The same quiz, the same session and the same sources always give the same running state, so it is tested by replaying answers.

The running state is an approximation of the final result. It is **never sent, logged or stored**: it is rebuilt from the session whenever it is needed.

```ts
// src/types/checkpoint.ts
import type { AxisEntry } from "@/types/axis";
import type { Orientation } from "@/types/orientation";
import type { NolanLevel, NolanQuadrantKey, ResultEntry } from "@/types/results";
import type { SurveySession } from "@/types/survey";

// The part of the session the running state is computed from. A whole `SurveySession` can be passed as it is.
//   entries                      - the done questions, in order: `answerId` absent = skipped
//   topicIds                     - the categories the taker prioritised; [] when none
//   checkpointRecord.timeSamples - `SurveyTimeSample[]`: how long each done question was on screen
// `checkpointRecord.cardsShown` is not read here.
export type RunningStateSession = Pick<SurveySession, "entries" | "topicIds" | "checkpointRecord">;

// Inputs that have no source today. Each is simply empty until one exists.
export interface RunningStateSources {
  traitIds?: string[]; // the orientations the quiz uses as traits. No survey sends them: absent = []
}

export interface RunningScore {
  points: number;  // what the taker's answers gave the orientation so far
  maximum: number; // the most the done questions could have given it
  value?: number;  // points / maximum x 100, exact, 0-100. Absent while maximum is 0
}

export interface RunningProgress {
  all: number;              // questions in the quiz
  done: number;             // answered + skipped. This is the number of the boundary
  answered: number;
  skipped: number;
  left: number;             // all - done
  share: number;            // done / all, 0-1
  midpointBoundary: number; // the first boundary at which share is one half or more: 51 of 102, 5 of 9
}

export interface RunningTiming {
  timedQuestions: number; // done questions that have a usable time sample
  averagePace?: number;   // seconds per question: the mean of the samples, each counted as 60 at most. Absent with no sample
  minutesLeft?: number;   // whole minutes, 1 or more. Absent when it cannot be worked out
}

interface RunningAxisBase {
  id: string;       // the axis identifier
  answered: number; // answered questions that feed the axis
  lean?: number;    // points, from the exact values. Absent while a value it needs is absent
}

// One orientation on each side, both fed by at least one question of the quiz.
export interface RunningTwoSidedAxis extends RunningAxisBase {
  kind: "two-sided";
  start: AxisEntry;              // the negative side and its value
  end: AxisEntry;                // the positive side and its value
  leadingSide?: "start" | "end"; // the side with the higher value. Absent without a lean, and at a lean of 0
}

// One fed orientation; the other side is empty or holds an orientation no question feeds.
export interface RunningSingleAxis extends RunningAxisBase {
  kind: "single";
  entry: AxisEntry; // the fed orientation and its value
}

export type RunningAxis = RunningTwoSidedAxis | RunningSingleAxis;

// A position on the compass, by the Nolan chart's rule.
export interface CompassPoint {
  x: number;                  // -1 to 1: the horizontal axis, negative side at -1
  y: number;                  // -1 to 1: the vertical axis, negative side at -1
  level: NolanLevel;          // centre, moderate or extreme
  quadrant: NolanQuadrantKey;
  done: number;               // the boundary it was reached at
}

export interface RunningCompass {
  trail: CompassPoint[];                // one point per answered question, from the first that has a position. The last one is where the taker stands now
  quadrantsVisited: NolanQuadrantKey[]; // in the order they were first visited
}

export interface RunningState {
  progress: RunningProgress;
  timing: RunningTiming;
  scores: Record<string, RunningScore>; // by orientation identifier, one per orientation of the quiz
  axes: RunningAxis[];                  // the axes a card can speak about, in the quiz's order
  archetypes: ResultEntry[];            // the named positions with their closeness, closest first
  unlockedTraits: Orientation[];        // in the quiz's order. Always [] today
  compass: RunningCompass | null;       // null = the quiz has no compass
}
```

```ts
// src/utils/running-state/getRunningState.ts
export const getRunningState = (
  survey: Survey,
  session: RunningStateSession,
  sources?: RunningStateSources,
): RunningState | null => ...
// null only for a quiz with no questions. It never throws.
```

`getRunningState`, `RunningState` and the types above are the contract the checkpoint engine (`survey-checkpoint-engine`) and every card task build on. Do not rename a field without updating them.

### What this task reads from the tasks before it

No type of `survey-api` or `survey-session` is redefined here. `SurveyTimeSample` in particular is the session's type: this task reads it and declares no time sample of its own.

| From | Read |
|---|---|
| `Survey` (`survey-api`) | `questions`, `categories`, `axes`, `orientations` (`QuizOrientation[]`), `averageFinishTime` |
| `SurveyQuestion` | `id`, `categoryId`, `possibleAnswers` |
| `SurveyPossibleAnswer` | `id`, `weight`, `orientationIds` |
| `SurveyCategory` | `id`, `weight` |
| `SurveyAxis` | `id`, `type` (`axis`, `compass_x_axis`, `compass_y_axis` or anything else, as sent), `positiveOrientationIds`, `negativeOrientationIds` |
| `SurveySession` (`survey-session`) | `entries` (`SurveyAnswerEntry`: `questionId`, and `answerId` - absent for a skip), `topicIds`, `checkpointRecord.timeSamples` (`SurveyTimeSample`: `questionId`, `seconds`) |

`readSurvey` of `survey-api` already drops references to orientations the quiz does not have and reads a missing weight as 0. The rows of "Invalid and edge input" below still hold for a `Survey` built any other way - a test, a story - so the functions here stay safe on their own.

Every orientation put into the running state is passed through `toDisplayOrientation(orientation)` with no gender: mid-quiz the taker has not been asked, so a name or an image with two forms shows the masculine one.

# Behaviour

The [event model spec](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/event-model.md) is the source of truth for every case below - sections "Data", "What one question adds", "Adding questions up", "Axes and compass", "Time" and "Invalid and edge input". This task builds the **running state** half of that spec. There is no Figma frame: nothing here is drawn.

Words used below, as the spec defines them: a question is **done** when it has an entry, **answered** when that entry is an answer, **skipped** when it is a skip. A question **feeds** an orientation when at least one of its possible answers lists it, and feeds an axis when it feeds any orientation of the axis. **Boundary** *n* is the moment after the *n*-th done question.

### Scores

The arithmetic is the one the back-end runs today, algorithm `mp-qu-2025-1.0.1`, applied to the done questions only.

| Value | Definition |
|---|---|
| Multiplier of a question | The `weight` of its category when the category is in `topicIds`, otherwise 1 |
| Points of an orientation | The sum, over answered questions whose chosen answer lists it, of the chosen answer's weight x the multiplier |
| Maximum of an orientation | The sum, over done questions that feed it, of the highest weight among the possible answers that list it x the multiplier |
| Value | Points / maximum x 100. Absent when the maximum is 0 |

There is no fixed 1.33, no offset and no answer on a range. A skipped question gives no points and still adds its full maximum, so a skip lowers a value and never raises one.

One question, in a category the taker did not prioritise:

| Possible answer | Weight | Orientations |
|---|---|---|
| A1 | 2 | X, Y |
| A2 | 1 | X |
| A3 | 2 | Z |
| A4 | 4 | Z |

| Case | X | Y | Z |
|---|---|---|---|
| The taker chooses A1 | 2 of 2 | 2 of 2 | 0 of 4 |
| The taker chooses A2 | 1 of 2 | 0 of 2 | 0 of 4 |
| The taker chooses A4 | 0 of 2 | 0 of 2 | 4 of 4 |
| The taker skips the question | 0 of 2 | 0 of 2 | 0 of 4 |
| The question is not done yet | 0 of 0, no value | 0 of 0, no value | 0 of 0, no value |
| The category is prioritised with weight 1.25, the taker chooses A2 | 1.25 of 2.5 | 0 of 2.5 | 0 of 5 |
| The category is prioritised with weight 1.25, the taker skips | 0 of 2.5 | 0 of 2.5 | 0 of 5 |
| The entry of this question is removed (a step back) | Everything it added is gone | | |

Three done questions. Q1 is the question above, not prioritised, answered A2. Q2 is in a prioritised category with weight 1.25 and has B1 (weight 3, X) and B2 (weight 1, Z); the taker chose B1. Q3 is not prioritised, has C1 (weight 2, Y) and C2 (weight 2, Z), and was skipped.

| Orientation | Points | Maximum | Value |
|---|---|---|---|
| X | 1 + 3.75 = 4.75 | 2 + 3.75 = 5.75 | 82.6 (exact: 4.75 / 5.75 x 100) |
| Y | 0 | 2 + 2 = 4 | 0 |
| Z | 0 | 4 + 1.25 + 2 = 7.25 | 0 |
| An orientation none of the three feeds | 0 | 0 | Absent |

When every question of the quiz is done, points and maximum equal the back-end's `points` and `maxPossible` for the same answers. Values are never rounded in the state: thresholds are compared on exact values by the engine, and rounding is for whoever prints a number.

### Axes

Only an axis of type `axis` can be in `axes`. Each side has one value: the sum of the side's points / the sum of the side's maximums x 100.

| The axis has | It is |
|---|---|
| One orientation in `negativeOrientationIds` and one in `positiveOrientationIds`, and at least one question of the quiz feeds each | `two-sided`: `start` is the negative side, `end` the positive side |
| One orientation that some question feeds on one side, and on the other side nothing, or one orientation that no question feeds | `single`, about the fed orientation |
| More than one orientation on a side; a hidden or nameless orientation on either side; the same orientation on both sides; no orientation that a question feeds; any other type | Not in `axes` |

| Case | Result |
|---|---|
| Two-sided, negative side 12 of 20, positive side 3 of 15 | Values 60 and 20. `lean` 40, `leadingSide` `start` |
| Two-sided, values 47 and 47 | `lean` 0, no `leadingSide` |
| Two-sided, one side's maximum still 0 | That side has no value; no `lean`, no `leadingSide` |
| Single, value 83 | `lean` 33 |
| Single, value 40 | `lean` -10 |
| Single, maximum still 0 | No value, no `lean` |
| `answered` | The answered questions that feed any orientation of the axis. A skip does not count |

The two side values are independent and are never made to add up to a hundred. The sides are never swapped to put the leader first.

### Archetypes

`archetypes` holds the quiz's orientations of type `identity` that are not hidden, have a name and are fed by at least one question of the quiz, each with its score value as `value` - its closeness.

| Case | Result |
|---|---|
| Order | The highest value first, from the exact values. Equal values keep the quiz's order |
| An archetype whose maximum is still 0 | In the list with no `value`, after every archetype that has one |
| An identity orientation no question feeds, a hidden one, one without a name | Not in the list |
| The quiz has no identity orientation | `[]` |

### Traits

A trait of `sources.traitIds` is in `unlockedTraits` when all three hold:

- every question of the quiz that feeds it is answered - none is left and none was skipped,
- in each of them the chosen answer lists the trait,
- in each of them the chosen answer carries the highest weight the question has for the trait.

| Case | Result |
|---|---|
| `traitIds` absent or empty - every quiz today | `[]` |
| The answers line up so far and a question that feeds the trait is still not done | Not unlocked |
| One answer lists the trait with a lower weight than another answer of that question | Not unlocked |
| A question that feeds the trait was skipped | Not unlocked |
| The entry that completed the trait is removed | Not unlocked any more |
| A trait the quiz does not have, a hidden one, one without a name, one no question feeds | Never unlocked |
| The same trait listed twice | One trait |
| Order | The quiz's order of orientations, whatever the order of `traitIds` |

No survey marks its traits, so the list is empty in every real quiz. The function is built and tested with a list passed in.

### Compass

A quiz has a compass when its axes include one of type `compass_x_axis` and one of type `compass_y_axis`, and each of the two has at least one orientation of the quiz on its negative side and one on its positive side. A compass axis may have several orientations on a side; the side still has one value, as under "Axes". Without a compass, `compass` is `null`.

The position is the Nolan chart's, computed by the same function the result uses: for each axis the negative side is the start pole and the positive side the end pole, and the coordinate is (positive side value - negative side value) / 100. The horizontal axis is `compass_x_axis`, the vertical axis `compass_y_axis`. Quadrant and level - centre, moderate or extreme - come from that function too, so the dot on a card and the dot on the result follow one rule.

| Case | Result |
|---|---|
| Horizontal positive 60 and negative 20, vertical positive 20 and negative 60 | `x` 0.40, `y` -0.40, distance from the centre 0.57: `moderate`, quadrant `bottomRight` |
| A position at 0.04, -0.02 | On the trail at level `centre`. It visits no quadrant |
| One of the four sides has no value yet | No position for that answer. Nothing is added to the trail - "no position" is not the centre |
| The trail | One point for every answered question, in order, from the first that has a position, each with the boundary it was reached at |
| A skipped question | Adds no point |
| `quadrantsVisited` | The quadrants in which at least one point of the trail lies at level `moderate` or `extreme`, in the order they were first visited |
| The position returns to a quadrant already visited | The trail grows. `quadrantsVisited` does not |
| The last entry is removed | Its point leaves the trail. A quadrant only that point was in leaves `quadrantsVisited` |

Where the taker stands now is the last point of the trail.

### Progress and time

| Value | Definition |
|---|---|
| `all`, `done`, `answered`, `skipped`, `left` | Counts over the questions of the quiz |
| `share` | `done` / `all` |
| `midpointBoundary` | The first boundary at which `share` is one half or more |
| `timedQuestions` | The done questions that have a usable sample in `checkpointRecord.timeSamples` |
| `averagePace` | The mean of those samples, each counted as 60 seconds at most |
| `minutesLeft`, 5 or more timed questions | `left` x `averagePace`, in minutes, rounded up to a whole minute, never below 1 |
| `minutesLeft`, fewer than 5 timed questions | The survey's average finish time x (`left` / `all`), rounded up to a whole minute, never below 1 |
| `minutesLeft`, fewer than 5 timed questions and no usable survey average | Absent. Nothing is invented in its place |

| Case | Result |
|---|---|
| 51 questions left, 40 timed questions with an average pace of 9.2 seconds | 469.2 seconds: 8 |
| 51 questions left, an average pace of 8.2 seconds | 418.2 seconds: 7 |
| 51 of 102 left, 3 timed questions, survey average 15 | 7.5 minutes: 8 |
| 4 left, average pace 6 seconds | 24 seconds: 1 |
| One sample of 600 seconds | Counted as 60 |
| A sample for a question that is not done - the taker stepped back, or the page was reloaded while it was open | Not counted |
| Two samples for one question | The later one |
| 102 questions, 51 done | `share` 0.5, `midpointBoundary` 51 |
| 9 questions | `midpointBoundary` 5 |

Time never decides anything here. It only produces the minutes a card prints.

### Invalid and edge input

Nothing here throws. Quiz data is author-supplied and can be wrong; one bad question never costs the quiz the rest of its state.

| Input | Behaviour |
|---|---|
| A possible answer that lists an orientation the quiz does not have | That reference is dropped. The rest of the answer counts |
| A possible answer that lists the same orientation twice | Counted once |
| A weight that is missing, not a number, zero or negative | Counted as zero |
| A category weight that is missing, not a number, zero or negative | The multiplier is 1 |
| A `topicIds` entry the quiz does not have | Ignored |
| An entry for a question the quiz does not have | Ignored |
| An entry whose answer is not one of the question's possible answers | The question counts as skipped |
| Two entries for one question | The later one counts |
| A question with no possible answers | It adds nothing to any score. It still counts as a question for progress |
| An orientation no question feeds | A score of 0 of 0 with no value. Not an archetype. On an axis it counts as an empty side |
| An axis with an unknown type | Ignored |
| An axis naming an orientation the quiz does not have | That reference is dropped. If a side is left empty the axis is read by what remains |
| The same orientation on both sides of an axis | The axis is not in `axes` |
| Two axes of the same compass type | The first in the quiz's order is the compass axis |
| Only one of the two compass axes, or a compass axis with an empty side | `compass` is `null` |
| A side value outside 0-100 | Clamped before the coordinate is computed |
| A survey average that is missing, zero, negative or not a number | Treated as missing |
| A time sample that is negative or not a number | Dropped. That question is not a timed one |
| A quiz with no questions | `getRunningState` returns `null` |

### Non-functional

- **Fast enough not to be noticed.** The state of a quiz of a hundred questions and a few hundred orientations is ready well inside the time the answer's own animation takes. Compute the trail in one pass over the entries; do not recompute every score from the start for every point.
- **Private.** Nothing in `src/utils/running-state/` writes to storage, sends a request, logs or raises an analytics event.

# Out of scope

- **Deciding whether a card appears, and which** - triggers, gates, selection, pacing, the record of cards shown, the seeded draw, the copy pools: `survey-checkpoint-engine`.
- **Measuring time.** The clock belongs to the screen: `survey-checkpoint` measures the seconds and passes them to the session's `answer` and `skip`, and `survey-session` keeps the sample for as long as its entry exists. This task only reads the samples and applies the 60-second cap.
- **The card frame, the Checkpoints phase and every card** - `survey-checkpoint` and the card tasks.
- **A source for the trait list.** The API sends none. It is asked of the back-end as a field of the quiz; until then `traitIds` is not passed.
- **Answer aggregates** - not part of the running state at all. The engine takes them as its own input.
- **Categories visited** - no card uses it, so the state does not hold it.
- **The final result.** The back-end still calculates it. Nothing here is sent with the hand-in.
- **Changing the Nolan chart.** `getNolanPosition` only moves (see below); how the chart draws is untouched. Taking the map out of `NolanChart` belongs to `survey-checkpoint-nolan-path`.

# Files to create

```
src/types/checkpoint.ts                    # the types above
src/constants/checkpoint.ts                # TIME_SAMPLE_CAP_SECONDS = 60, MIN_TIMED_QUESTIONS = 5
src/utils/running-state/
├── getRunningState.ts                     # composes the functions below; null for a quiz with no questions
├── getRunningState.test.ts
├── getRunningState.fixtures.ts            # the worked examples of the spec, and the trimmed identity quiz
├── getDoneQuestions.ts                    # entries -> the done questions: unknown questions dropped, later entry wins, unknown answer = skip
├── getDoneQuestions.test.ts
├── getQuestionMultiplier.ts               # the category's weight when prioritised, else 1
├── getQuestionMultiplier.test.ts
├── getQuestionMaximums.ts                 # per orientation: the highest weight among the answers that list it
├── getQuestionMaximums.test.ts
├── getRunningScores.ts                    # points, maximum, value per orientation
├── getRunningScores.test.ts
├── getSideValue.ts                        # one value for a list of orientations
├── getSideValue.test.ts
├── getRunningAxes.ts                      # which axes can be spoken about, their kind, values, lean, answered
├── getRunningAxes.test.ts
├── getRunningArchetypes.ts
├── getRunningArchetypes.test.ts
├── getUnlockedTraits.ts
├── getUnlockedTraits.test.ts
├── getCompassAxes.ts                      # the two compass axes of a quiz, or nothing
├── getCompassAxes.test.ts
├── getRunningCompass.ts                   # the trail and the quadrants visited
├── getRunningCompass.test.ts
├── getRunningProgress.ts
├── getRunningProgress.test.ts
├── getRunningTiming.ts
└── getRunningTiming.test.ts
```

One function per file, each with its own test. Split further if a file gets hard to read; do not merge. No empty files.

**Move, do not copy, the Nolan position.** `getNolanPosition` lives inside the `NolanChart` component today, and a global util must not import from a component's `utils/`. This task is its second consumer, so in the same pull request:

- move `getNolanPosition` and its test to `src/utils/results/`,
- move what it needs - `MAP_MODERATE_RADIUS`, `MAP_EXTREME_RADIUS`, `LEVEL_TOLERANCE`, `QUADRANT_BY_POLES` - to `src/constants/results.ts`, and `NolanLevel`, `NolanPoleSide`, `NolanQuadrantKey`, `NolanAxisValues`, `NolanPosition` to `src/types/results.ts`,
- update the imports inside `NolanChart`. Its behaviour, its stories and its tests do not change.

Reuse what exists: `clamp` and `isNumber` from `src/utils/number/`, `toDisplayOrientation` and `isOrientationShown`, `uniqueBy` from `src/utils/array/`, and `createSurvey` and `createSession` of `survey-session` to build quizzes and sessions in tests. Search `src/utils/` before writing a helper.

# Unit test cases (BDD)

```ts
describe('getQuestionMultiplier()', () => {
  describe('given a question whose category is in topicIds', () => {
    it('returns the weight of the category', ...);
  });
  describe('given a question in a category that is not prioritised', () => {
    it('returns 1', ...);
  });
  describe('given a category weight that is missing, not a number, zero or negative', () => {
    it('returns 1', ...);
  });
  describe('given a topic the quiz does not have', () => {
    it('ignores it', ...);
  });
});

describe('getQuestionMaximums()', () => {
  describe('given the question A1-A4 of the spec', () => {
    it('returns 2 for X, 2 for Y and 4 for Z', ...);
  });
  describe('given an answer that lists an orientation twice', () => {
    it('counts it once', ...);
  });
  describe('given a weight that is missing, not a number, zero or negative', () => {
    it('counts it as zero', ...);
  });
  describe('given an answer that lists an orientation the quiz does not have', () => {
    it('drops the reference and keeps the rest of the answer', ...);
  });
  describe('given a question with no possible answers', () => {
    it('returns nothing', ...);
  });
});

describe('getDoneQuestions()', () => {
  it('keeps the order of the entries', ...);
  it('ignores an entry for a question the quiz does not have', ...);
  it('keeps the later of two entries for one question', ...);
  it('reads an answer the question does not have as a skip', ...);
});

describe('getRunningScores()', () => {
  describe('given one question, not prioritised', () => {
    it('gives X 2 of 2, Y 2 of 2, Z 0 of 4 when A1 is chosen', ...);
    it('gives X 1 of 2, Y 0 of 2, Z 0 of 4 when A2 is chosen', ...);
    it('gives X 0 of 2, Y 0 of 2, Z 4 of 4 when A4 is chosen', ...);
    it('gives 0 points and the full maximum when the question is skipped', ...);
    it('gives 0 of 0 and no value when the question is not done', ...);
  });
  describe('given the category is prioritised with weight 1.25', () => {
    it('gives X 1.25 of 2.5, Y 0 of 2.5, Z 0 of 5 when A2 is chosen', ...);
    it('gives 0 of 2.5, 0 of 2.5, 0 of 5 when the question is skipped', ...);
  });
  describe('given the three done questions of the spec', () => {
    it('gives X 4.75 of 5.75 with a value of 4.75 / 5.75 x 100', ...);
    it('gives Y 0 of 4 with a value of 0', ...);
    it('gives Z 0 of 7.25 with a value of 0', ...);
    it('gives an orientation none of them feeds 0 of 0 and no value', ...);
  });
  describe('when the last entry is removed', () => {
    it('takes away everything that question added', ...);
  });
  describe('when every question of the quiz is done', () => {
    it('equals points and maxPossible of each of the back-end calculator cases', ...);
  });
  it('never rounds a value', ...);
  it('has an entry for every orientation of the quiz', ...);
});

describe('getSideValue()', () => {
  it('divides the sum of the points by the sum of the maximums', ...);
  it('returns nothing while the sum of the maximums is 0', ...);
  it('gives one value for a side with several orientations', ...);
});

describe('getRunningAxes()', () => {
  describe('which axes are kept', () => {
    it('keeps an axis of type axis with one fed orientation on each side as two-sided', ...);
    it('reads an axis with one side empty as single', ...);
    it('reads an axis whose other side holds an orientation no question feeds as single', ...);
    it('drops an axis with more than one orientation on a side', ...);
    it('drops an axis with a hidden orientation on either side', ...);
    it('drops an axis with a nameless orientation on a side', ...);
    it('drops an axis with the same orientation on both sides', ...);
    it('drops an axis no question feeds', ...);
    it('drops the two compass axes and an axis of an unknown type', ...);
    it('drops a reference to an orientation the quiz does not have and reads the axis by what remains', ...);
    it('keeps the order of the quiz', ...);
  });
  describe('given a two-sided axis with 12 of 20 on the negative side and 3 of 15 on the positive side', () => {
    it('has values 60 and 20, a lean of 40 and the start side leading', ...);
  });
  describe('given a two-sided axis at 47 and 47', () => {
    it('has a lean of 0 and no leading side', ...);
  });
  describe('given a two-sided axis with a side whose maximum is 0', () => {
    it('has no value for that side, no lean and no leading side', ...);
  });
  describe('given a single axis', () => {
    it('has a lean of 33 at a value of 83', ...);
    it('has a lean of -10 at a value of 40', ...);
    it('has no lean while its maximum is 0', ...);
  });
  describe('answered', () => {
    it('counts the answered questions that feed either side', ...);
    it('does not count a skipped question', ...);
  });
  it('shows a name with two forms in its masculine form', ...);
});

describe('getRunningArchetypes()', () => {
  it('keeps the identity orientations that are shown, named and fed', ...);
  it('ranks them by exact value, highest first', ...);
  it('keeps the order of the quiz for equal values', ...);
  it('puts an archetype without a value after every archetype that has one', ...);
  it('returns an empty list for a quiz with no identity orientation', ...);
});

describe('getUnlockedTraits()', () => {
  describe('given no trait list', () => {
    it('returns an empty list', ...);
  });
  describe('given a trait whose every question is answered with its highest weight', () => {
    it('unlocks it', ...);
  });
  describe('given a question that feeds the trait is still open', () => {
    it('does not unlock it', ...);
  });
  describe('given one answer that lists the trait with a lower weight', () => {
    it('does not unlock it', ...);
  });
  describe('given one answer that does not list the trait', () => {
    it('does not unlock it', ...);
  });
  describe('given a question that feeds the trait was skipped', () => {
    it('does not unlock it', ...);
  });
  describe('given a trait that is unknown, hidden, nameless or fed by no question', () => {
    it('never unlocks it', ...);
  });
  it('keeps one trait when it is listed twice', ...);
  it('returns the unlocked traits in the order of the quiz', ...);
});

describe('getCompassAxes()', () => {
  it('finds the compass_x_axis as horizontal and the compass_y_axis as vertical', ...);
  it('takes the first of two axes of the same compass type', ...);
  it('returns nothing when one of the two is missing', ...);
  it('returns nothing when a compass axis has a side with no orientation of the quiz', ...);
});

describe('getRunningCompass()', () => {
  describe('given a quiz without a compass', () => {
    it('returns null', ...);
  });
  describe('given horizontal 60 and 20, vertical 20 and 60', () => {
    it('puts the point at 0.40, -0.40, moderate, bottom right', ...);
    it('counts the quadrant as visited', ...);
  });
  describe('given a point at 0.04, -0.02', () => {
    it('keeps it on the trail at the centre level', ...);
    it('visits no quadrant', ...);
  });
  describe('given one of the four sides has no value yet', () => {
    it('adds no point for that answer', ...);
  });
  describe('given a skipped question', () => {
    it('adds no point', ...);
  });
  describe('given the position returns to a visited quadrant', () => {
    it('grows the trail and not the quadrants visited', ...);
  });
  describe('when the last entry is removed', () => {
    it('drops its point from the trail', ...);
    it('drops a quadrant only that point was in', ...);
  });
  it('gives every point the boundary it was reached at', ...);
  it('lists the quadrants in the order they were first visited', ...);
});

describe('getRunningProgress()', () => {
  it('counts all, done, answered, skipped and left', ...);
  it('puts the midpoint boundary at 51 of 102 and at 5 of 9', ...);
  it('counts a question with no possible answers as a question', ...);
});

describe('getRunningTiming()', () => {
  describe('given 5 or more timed questions', () => {
    it('gives 8 minutes for 51 left at 9.2 seconds', ...);
    it('gives 7 minutes for 51 left at 8.2 seconds', ...);
    it('gives 1 minute for 4 left at 6 seconds', ...);
  });
  describe('given fewer than 5 timed questions', () => {
    it('gives 8 minutes for 51 of 102 left with a survey average of 15', ...);
    it('gives nothing when the survey average is missing, zero, negative or not a number', ...);
  });
  describe('samples', () => {
    it('counts a sample of 600 seconds as 60', ...);
    it('drops a sample that is negative or not a number', ...);
    it('does not count a sample for a question that is not done', ...);
    it('takes the later of two samples for one question', ...);
  });
});

describe('getRunningState()', () => {
  describe('given a quiz with no questions', () => {
    it('returns null', ...);
  });
  describe('given the same quiz, session and sources twice', () => {
    it('returns equal states', ...);
  });
  describe('given malformed quiz data', () => {
    it('never throws', ...);
    it('still computes the state of the well-formed questions', ...);
  });
  describe('given the identity quiz as the API sends it', () => {
    it('has 102 questions', ...);
    it('has 15 two-sided axes and one single axis, "Decentralizacja-Centralizacja"', ...);
    it('has 15 archetypes and no unlocked trait', ...);
    it('has a compass, and no point on its trail before the first question that feeds it', ...);
    it('reaches a share of 1 and no questions left when every question is done', ...);
  });
});
```

Fixtures:

- **The worked examples** - build the question A1-A4 and the three questions Q1-Q3 by hand, in a fixture file next to the tests.
- **The back-end calculator cases** - take the test cases of the calculator in [mypolitics-survey-consumer](https://github.com/Generacja-Innowacja/mypolitics-survey-consumer) at the version that carries algorithm `mp-qu-2025-1.0.1`, and port their inputs and expected `points` / `maxPossible` as they are. Do not write these numbers from memory or from this task.
- **The identity quiz** - a real response of `GET https://api.mypolitics.pl/api/v1/survey/60beb898-a4e4-4160-88c4-07a9931ab499`, trimmed to the fields this task reads (identifiers, weights, orientation lists, categories, axes, the type and name of each orientation). Keep all 102 questions: the replay is the point.

# Remember about standards

- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Name the branch `feature/survey-running-state-{issue number}`, following [Conventional Branch](https://conventional-branch.github.io/) - never keep a generated or default branch name
- Read `AGENTS.md` in the repository before starting; where it differs from this task on a standard, it wins
- No Storybook story - there is no component
- No user-visible strings are added, so nothing goes through Lingui
- No new dependency
- No clock, no randomness, no storage, no network and no logging in `src/utils/running-state/`
- Moving `getNolanPosition` is a move: its test moves with it, and no copy is left behind in `NolanChart`
- Commit only files that belong to the task; commits follow Conventional Commits
- The PR follows the repository's pull request template: Changes (with Decisions, Deviations, Verification), How to test, Checklist

# Dependencies

- `survey-api` - the `Survey` types this task reads.
- `survey-session` - `SurveySession`, `SurveyAnswerEntry`, `SurveyTimeSample`.

It blocks `survey-checkpoint-engine`, which decides on cards from the running state, and through it every checkpoint task.

# Resources

- [Spec - Event model](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/event-model.md) - every case, in full; this task is its running state part
- [Docs - Event model](https://github.com/gi-org-pl/product/blob/main/mypolitics/docs/modules/quiz/questionnaire/checkpoints/event-model.md) - the idea
- [Spec - Session and data](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/session-and-data.md) - the quiz as read, and the entries
- [Spec - Universal orientation](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/universal-orientation.md) - names, types, hidden marks, the two forms of a name
- [Spec - Nolan chart](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/nolan-chart.md) - the coordinate, the quadrant and the levels
- What reads this state: [halfway through](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/halfway-through.md), [axis closeness](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/axis-closeness.md), [new trait](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/new-trait.md), [single axis puzzle](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/single-axis-puzzle.md), [Nolan chart path](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/nolan-chart-path.md), [double axis puzzle](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/double-axis-puzzle.md)
- [Survey API docs](https://api.mypolitics.pl/api) - `GET /api/v1/survey/{id}`
- [Back-end calculator](https://github.com/Generacja-Innowacja/mypolitics-survey-consumer) - the arithmetic the scores repeat, and its test cases
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Vitest docs](https://vitest.dev/guide/)

# Definition of Done

- [ ] Code follows folder structure (`docs/frontend/conventions/PROJECT_STRUCTURE.md`)
- [ ] Naming follows `docs/frontend/conventions/NAMING.md`
- [ ] `RunningState` and the types around it live in `src/types/checkpoint.ts`, exactly as in this task; `getRunningState(survey, session, sources?)` lives in `src/utils/running-state/`
- [ ] Scores follow `mp-qu-2025-1.0.1`: weight x multiplier, the multiplier being the category's own weight when prioritised and 1 otherwise; no 1.33, no offset
- [ ] The maximum counts done questions only; a skip adds no points and its full maximum; removing an entry removes everything it added
- [ ] The worked examples of the spec pass as test cases with their exact numbers; the back-end calculator cases pass when every question is done
- [ ] Axes: two-sided, single and not-used are told apart as in the table; lean and leading side come from exact values; `answered` ignores skips
- [ ] Archetypes are the shown, named, fed identity orientations, ranked by exact value with ties in the quiz's order
- [ ] Traits unlock only when every question that feeds them is answered with their highest weight; with no trait list nothing unlocks
- [ ] The compass is recognised by the two axis types; position, level and quadrant come from the one `getNolanPosition`; the trail has one point per answered question and skips add none; a quadrant is visited only at the moderate or extreme level
- [ ] Progress and time follow the tables: midpoint boundary, the 60-second cap, the 5-question rule, the survey average as fallback, no estimate when neither exists
- [ ] Every row of "Invalid and edge input" degrades as written, without throwing
- [ ] The identity quiz replay passes
- [ ] The state is derived: same inputs, same state; nothing is stored, sent or logged
- [ ] `getNolanPosition`, its constants and its types are moved to `src/utils/results/`, `src/constants/results.ts` and `src/types/results.ts`; `NolanChart` imports them from there and behaves as before
- [ ] Nothing imported from a component's `utils/`, constants or subcomponents
- [ ] Unit tests added, BDD style, coverage ≥95% on all new files; every function has its own test file
- [ ] PR states "No e2e: not mounted on any route"
- [ ] Biome lint clean
- [ ] TypeScript clean (no `any`, no `@ts-ignore`)
- [ ] Branch named `feature/survey-running-state-{issue number}`
- [ ] CI green: build, lint, test
- [ ] PR description lists decisions and deviations from the ticket/spec; only files belonging to the task are committed
