<img alt="A result compared with a friend" src="https://raw.githubusercontent.com/gi-org-pl/product/main/mypolitics/assets/results-example-comparision.png" width="360"/>

# Story

As a user reading my result, I want to put a friend's result over mine, or pick an orientation of the quiz, and see how much we agree, so that the result becomes something I talk about with someone.

# Component properties

**Component:** `ResultsComparison`
**Location:** `src/components/results/ResultsComparison/`, shown by `ResultsScreen` under the "Comparison" tab
**Shared:** no - the results domain

```ts
interface ResultsComparisonProps {
  resultId: string; // the taker's
  survey: Survey;
  result: QuizResult; // the taker's
  modules: ResolvedModule[]; // the taker's, as drawn on "Your results"
}
```

# Behaviour

The [spec](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/results-comparison.md) is the source of truth. This task builds its sections "Choosing the other side", "While a comparison runs" and "Results, for a friend", with their copy, states, invalid input and failure modes. The list of questions is the next task: until it is built, a friend comparison has one view and an orientation comparison shows the agreement bar alone.

| Piece | What it does |
|---|---|
| Mode selector | Two modes as a tab list. Friend: the taker's identifier with a copy control and the field for a friend's. Orientation: a search field over the offered orientations |
| Fetching a friend | A hook: the identifier checked in form, then `getResult`, then the spec's refusals |
| Agreement bar | The other side's name and image, the agreement score on a one-sided `UniversalAxis`, the control that ends the comparison. Stacked on a narrow screen, the control beside the bar on a wide one |
| The agreement score | One function from the quiz, the taker's answers and the other side: the table "Agreement on a question" and the rule under it |
| Results for a friend | The friend's result resolved with `resolveResult`, and for each of the taker's modules the comparison its component takes, as the table "Results, for a friend" says. The modules are laid out as on "Your results" |

The friend is a person orientation made with `createPersonOrientation` from the friend's result identifier, named with the copy "Znajomy" / "Friend".

# Design

Frames in Figma: mode selector `5514:41702`, agreement bar `5514:52491`, results comparison `5514:52656`.

# Out of scope

- **The list of questions** - `results-answers-comparison`.
- **A comparison in the address**, names and avatars of friends, more than one other side.
- **Changing a module component.** Each already takes its comparison.

# Unit test cases (BDD)

- Given every row of "Choosing the other side" and "While a comparison runs", when it happens, then the behaviour in that row holds.
- Given two results of the same quiz, when they are compared, then each module is handed what "Results, for a friend" lists for its type.
- Given the table "Agreement on a question" row by row, for both modes, when the score is computed, then it is the share the spec defines; given no question that agrees or disagrees, then there is no score.
- Every subcomponent, util and hook has its own test file.

# E2E (Gherkin)

```gherkin
Given a user is on their result and has a friend's result identifier of the same quiz
When they open "Tryb porównania" and paste it
Then they see the agreement bar and every module with the friend's marks
```

# Dependencies

- `results-screen`.

# Remember about standards
- Use the standard colors palette, never add colors directly
- Create unit tests with Vitest for 100% of the code created if feasible
- Create a Storybook story for each new component with all possible props variants
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)
- Name the branch `{type}/{task-name}-{issue number}`

# Resources
- [Spec: results comparison](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/results-comparison.md)
- [Spec: results screen](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/results-screen.md)
- [Legacy: comparing answers](https://github.com/gi-org-pl/mypolitics-app-legacy/tree/develop/frontend/src/components/Results/ResultsCompareAnswers)
- [Figma project link](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5514-41702)
