<img alt="A composed result of the identity quiz" src="https://raw.githubusercontent.com/gi-org-pl/product/main/mypolitics/assets/results-example.png" width="360"/>

# Story

As a user who finished a quiz, I want to read my result in the app - the verdict on top, then every module the quiz's author composed, in their columns - so that I do not have to leave for the old site to see what I scored.

# Component properties

**Component:** `ResultsScreen`
**Location:** `src/components/results/ResultsScreen/`, mounted by the page `src/pages/results.$resultId.tsx`
**Shared:** no - the results domain

```ts
interface ResultsScreenProps {
  resultId: string; // from the address
}
```

It reads the result and its quiz itself, resolves the modules with `resolveResult`, and draws one of its states.

# Behaviour

The [spec](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/results-screen.md) is the source of truth for every case: its sections "Loading", "Composition", "Layout of the modules", "A module on the screen", "States and lifecycle", "Copy" and "Invalid and edge input".

### The pieces

| Piece | What it does |
|---|---|
| The page | Takes `resultId` from the address, renders `ResultsScreen`, sets the document title to the quiz name once known, and asks search engines not to index the address |
| Loading the result | A hook of the screen: the result, then its survey by `surveyId` in the app's language, with the retries of "Loading". It returns one state of the spec's table, never a mix of flags |
| The header | The existing `ResultsHeader`, given the resolved header and the active tab |
| The modules | Two columns on a wide screen, one on a narrow one, as "Layout of the modules" says. Done in CSS, not by measuring |
| One module | A resolved module handed to its component. Which component draws which type is one table by type |
| The info dialog | Opened by a module's info action when its record has a description: the module's title and the description. Built from the dialog the app already has |
| The quiz name | The quiz's name under the modules |
| The comparison tab | Until the comparison task is built, the tab shows one line: "Porównanie będzie dostępne wkrótce." / "Comparison is coming soon." |
| A state that is not ready | Loading, not found, not ready, failed, not configured - one small component with the spec's copy and, where the spec says so, the retry |

### From a resolved module to a component

| Resolved | Component | Notes |
|---|---|---|
| `single_axis` | `SingleAxisChart` | `entry` as the orientation and value |
| `double_axis` | `DoubleAxisChart` | The axis's two entries |
| `multi_axis` | `MultiAxisChart` | Groups and their axes as they are |
| `horizontal_bar` | `HorizontalBarChart` | `entries` or `categories`. An official entry carries the verified badge |
| `nolan_chart` | `NolanChart` | The two axes with their names; the labels and colours by slot into the pole names, the quadrants and the centre name |
| `archetype` | `Archetype` | The value of an entry as its match |
| `traits` | `Traits` | As they are |

No module component changes in this task. Where a component cannot take what a resolved module holds, that is a finding for the pull request, not a change to the component.

### Leaving the questionnaire

The loader's last step goes to this screen: `PATHS` gains the result's address and `useLeave` navigates to it inside the app. `RESULTS_URL` and the opening of the old site are removed. The questionnaire's e2e scenario ends on this screen.

# Copy

The spec's "Copy" table, plus the line of the comparison tab above. Polish is the source.

# Design

- The composed screen: `mypolitics/assets/results-example.png` and `results-example-2.png` in the product repository. There is no Figma frame of the whole screen; the parts are the frames of the header (`5500:3239`, desktop `5514:56171`) and of each module, which are built already.
- The space between and around the modules, the width at which two columns start and the quiz name row are measured from those two pictures and stated in the pull request.

# Out of scope

- **Comparison** - its own tasks.
- **The next-quiz banner, statistics, the short results card, sharing.**
- **Changing a module component or `ResultsHeader`.**
- **The declared gender** - the API does not send it back.

# Files to create

```
src/pages/results.$resultId.tsx
src/components/results/ResultsScreen/ResultsScreen.tsx (+ .test.tsx, .types.ts, .stories.tsx)
src/components/results/ResultsScreen/utils/...          (the loading hook and the mapping to props, one per file)
src/components/results/ResultsScreen/<SubComponent>/... (one folder per piece above that has logic of its own)
src/constants/paths.ts                                   (the result's address)
e2e/results/results.spec.ts (+ fixtures, mocked routes)
```

# Unit test cases (BDD)

- Given each row of "Loading" and of "States and lifecycle", when the screen is mounted with the API mocked that way, then that state is drawn with the spec's copy.
- Given a ready result of the identity-quiz fixture, when it is drawn, then the header names the leader, each module of the list is a region named by its title, and they stand in two columns in the order of the spec.
- Given a record with a description, when its info action is used, then a dialog shows the title and the description, and closing it returns focus to the action.
- Given a module that throws while drawing, when the screen is drawn, then the other modules are still there.
- Given the retry is used in a failed state, then loading starts again.
- Every subcomponent, util and hook has its own test file.

# E2E (Gherkin)

```gherkin
Given a calculated result of the identity quiz
When the user opens its address
Then they see the leading identity in the header and the modules "Ideologie", "Tożsamość" and "Partie"

Given a user answers the last question of a quiz
When the result is calculated
Then they are on the result's address in the app and see their result
```

# Storybook stories

`ResultsScreen` is a page-level component that fetches; the story is of its ready content with fixtures: the identity quiz, the presidential quiz, a result with no match, and one long-names case. Checked at 320, 360, 800 and 1280 px.

# Dependencies

- `result-modules-configuration`, `result-modules-resolution`, `results-api`.
- Every result module and `ResultsHeader`: done.

# Remember about standards
- Use the standard colors palette, never add colors directly (check https://tailwindcss.com/docs/colors and our color palette in the `src/index.css` file and in [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css))
- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Create a Storybook story for the component with all possible props variants of the component
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)
- Name the branch `{type}/{task-name}-{issue number}`, following [Conventional Branch](https://conventional-branch.github.io/) - never keep a generated or default branch name

# Resources
- [Spec: results screen](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/results-screen.md)
- [Spec: result modules configuration](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/result-modules-configuration.md)
- [Legacy repo link](https://github.com/gi-org-pl/mypolitics-app-legacy/tree/main/frontend)
- [Figma project link](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5499-667)
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
