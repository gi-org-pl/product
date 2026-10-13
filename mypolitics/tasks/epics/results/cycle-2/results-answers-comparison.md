# Story

As a user comparing my result, I want to go through the questions one by one and see what the other side answered next to what I answered, so that I learn where exactly we differ and not only by how much.

# Component properties

**Component:** `ResultsAnswersComparison`
**Location:** `src/components/results/ResultsAnswersComparison/`, shown by `ResultsComparison` as the "Questions" view
**Shared:** no - the results domain

```ts
interface ResultsAnswersComparisonProps {
  survey: Survey;
  answers: ResultAnswer[]; // the taker's
  otherSide: Orientation; // a friend as a person, or an orientation of the quiz
  otherAnswers?: ResultAnswer[]; // a friend's. Absent for an orientation: its answers come from the quiz
}
```

# Behaviour

The [spec](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/results-comparison.md) is the source of truth: its section "Questions", the table "Agreement on a question", and the copy, edge input and accessibility that go with them.

| Piece | What it does |
|---|---|
| The rows | One per question of the quiz, in the quiz's order, collapsed, tinted by agreement. A row is a disclosure |
| An opened row | Both sides, each named, with what each chose; a tick or a cross on each answer of the other side |
| Search | Narrows by the question's text, ignoring case |
| "Only disagreements" | A switch that keeps the rows that disagree |
| Two layouts | The two sides stacked on a narrow screen, side by side on a wide one |

With this task the comparison gets its second view: `ResultsComparison` shows "Results" and "Questions" for a friend, and the questions alone for an orientation.

# Design

Frame in Figma: answers comparison `5514:53568` (mobile and desktop).

# Out of scope

- **Explaining a question**, statistics of how everyone answered, sharing one question.

# Unit test cases (BDD)

- Given every row of "Questions" in the spec, when it happens, then the behaviour in that row holds.
- Given a friend and an orientation as the other side, when a row is opened, then each shows what the spec says for it, with "No answer" where there is nothing.
- Given the search and the switch together, when both are on, then only the rows that pass both are listed, and a line says so when none does.
- Every subcomponent, util and hook has its own test file.

# E2E (Gherkin)

```gherkin
Given a user compares their result with an orientation
When they turn on "Tylko niezgodność" and open the first question
Then they see their own answer and the answers that orientation stands for
```

# Dependencies

- `results-comparison`.

# Remember about standards
- Use the standard colors palette, never add colors directly
- Create unit tests with Vitest for 100% of the code created if feasible
- Create a Storybook story for each new component with all possible props variants
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)
- Name the branch `{type}/{task-name}-{issue number}`

# Resources
- [Spec: results comparison](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/results-comparison.md)
- [Legacy: comparing answers](https://github.com/gi-org-pl/mypolitics-app-legacy/tree/develop/frontend/src/components/Results/ResultsCompareAnswers)
- [Figma project link](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5514-53568)
