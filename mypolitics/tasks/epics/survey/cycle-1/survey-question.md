# Story

As a user taking a quiz, I want the current statement shown on one clear card, with the negation in it marked and an explanation I can open when a term is unclear, so that I answer what is actually being asked.

# Replaces

This task replaces [#32](https://github.com/gi-org-pl/mypolitics-app/issues/32) and its pull request [#54](https://github.com/gi-org-pl/mypolitics-app/pull/54). Start from a fresh branch off `main`; do not continue that branch. What was wrong in the old task, so it is not repeated:

- It asked for an Athena `ButtonSelect` with the answers inside this component. The frame has none: answers are `SurveyAnswer`, rendered by the parent.
- It described "Sprawdź wyjaśnienie" as a separate button. In the frame it is the fallback text of the explanation bar.
- Its example list underlined "powinien" and "nie powinien". The frame underlines the negation only.
- It offered Framer Motion for the animation. It is not in the stack.

# Component properties

**Component:** `SurveyQuestion`
**Location:** `src/components/survey/SurveyQuestion/`
**Shared:** no - domain component under `survey`

Presentational. No context, no API calls. The only state it owns is whether the explanation is open.

```ts
export interface SurveyQuestionProps {
  question: string;      // the statement, already in the taker's language
  explanation?: string;  // optional; without it the card has no explanation bar
}
```

# Behaviour

The [Figma frame](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=4260-2233) is the source of truth for sizes, spacing, type, icons and colours. The cases below are the source of truth for what happens.

### Statement

| Case | Behaviour |
|---|---|
| Any statement | Shown in full on the card. It wraps; it is never truncated |
| The statement contains an emphasised phrase | Each occurrence is underlined, as in the frame |
| The phrase is part of a longer word (`nie` in `niepodległość`, `niektórzy`) | Not underlined. Only whole words match, and Polish letters count as letters |
| The phrase differs in case (`Nie` at the start of a sentence) | Underlined; the original spelling is kept |
| The phrase is next to punctuation (`nie,` `(nie` `nie.`) | Underlined, without the punctuation |
| No emphasised phrase in the statement | Plain text |

The emphasised phrases are a translatable list kept in the constants file. In Polish the list has one entry, `nie`. Other locales translate the list, so a locale can emphasise its own negation.

### Explanation bar

| Case | Behaviour |
|---|---|
| No explanation | No bar. The card is the statement alone |
| Explanation given | A collapsed bar under the card: a one-line preview and a chevron |
| The explanation contains a trigger phrase | The preview is the explanation from its start up to and including the first trigger phrase, followed by `...` - "Obraza uczuć religijnych to..." |
| The explanation contains no trigger phrase | The preview is the fallback text "Sprawdź wyjaśnienie" |
| The preview is longer than the bar | Cut with an ellipsis. It stays on one line |
| The bar is activated while collapsed | It opens: the full explanation replaces the preview and the bar grows to fit it, as in the animation frame |
| The bar is activated while open | It collapses back to the preview |
| `question` or `explanation` changes | The bar returns to collapsed - a new question never starts open |

The trigger phrases are a translatable list in the constants file. In Polish the list has one entry, `to`, matched as a whole word, like the emphasised phrases.

### Animation

- Opening and closing animate the height and fade the text, over 300 ms.
- The height animation is CSS. Do not measure the DOM in JavaScript and do not add an animation library.
- With `prefers-reduced-motion` the bar switches state without animating.

### Invalid and edge input

| Input | Behaviour |
|---|---|
| `question` empty or only whitespace | The component renders nothing |
| `explanation` empty or only whitespace | Treated as absent: no bar |
| The trigger phrase is the first word of the explanation | The preview is that word followed by `...` |
| A very long statement or explanation | Both wrap; the card and the open bar grow in height. Nothing scrolls inside the component |
| The emphasised or trigger list is empty in a locale | Nothing is underlined; every explanation uses the fallback text |

### Accessibility

- The bar is a real button. It states whether it is expanded and which element it controls.
- Enter and Space toggle it; focus is visible.
- The full explanation is not exposed to assistive technology while collapsed.
- Underlining is emphasis, not information: the statement reads the same without it.

# Copy

Polish is the source; every string goes through a Lingui macro and the English entry is filled in.

| Text | Polish (source) | English |
|---|---|---|
| Emphasised phrase | `nie` | `not` |
| Explanation trigger phrase | `to` | `is` |
| Preview fallback | Sprawdź wyjaśnienie | Check the explanation |

The statement and the explanation come from props, already translated.

# Athena components to use

None fits. `ButtonSelect`, which the old task named, is not part of this component. The bar is not an Athena `Button` either: it is a full-width disclosure with its own look, so build it as a native button.

The chevron is `src/assets/icons/chevron-down.svg`, which is already in the repo. Import it; do not inline SVG in the component.

# Out of scope

- The answers under the card - `SurveyAnswer`, rendered by the parent.
- The slide transition between two questions - the questionnaire owns it.
- Reporting a question, and any link out of the card.

# Files to create

```
src/components/survey/SurveyQuestion/
├── SurveyQuestion.tsx
├── SurveyQuestion.test.tsx
├── SurveyQuestion.types.ts
├── SurveyQuestion.constants.ts          # EMPHASISED_PHRASES, EXPLANATION_TRIGGER_PHRASES, the fallback
├── SurveyQuestion.stories.tsx
├── SurveyQuestionStatement/             # the statement with its underlined phrases
│   ├── SurveyQuestionStatement.tsx
│   ├── SurveyQuestionStatement.test.tsx
│   └── utils/
│       ├── splitByPhrases.ts            # text + phrases -> ordered parts, each marked matched or not
│       └── splitByPhrases.test.ts
└── SurveyQuestionExplanation/           # the bar, collapsed and open
    ├── SurveyQuestionExplanation.tsx
    ├── SurveyQuestionExplanation.test.tsx
    └── utils/
        ├── getExplanationPreview.ts     # explanation + trigger phrases -> preview, or nothing when the fallback applies
        └── getExplanationPreview.test.ts
```

The folder is `SurveyQuestion`, singular. One component per file, no functions in a component file, no `renderX()`.

# Unit test cases (BDD)

```ts
describe('<SurveyQuestion />', () => {
  describe('given a question', () => {
    it('renders the statement in full', ...);
  });
  describe('given no explanation', () => {
    it('renders no explanation bar', ...);
  });
  describe('given an explanation', () => {
    it('renders the bar collapsed', ...);
  });
  describe('given an explanation that is only whitespace', () => {
    it('renders no explanation bar', ...);
  });
  describe('given an empty question', () => {
    it('renders nothing', ...);
  });
  describe('when the question changes while the bar is open', () => {
    it('collapses the bar', ...);
  });
});

describe('<SurveyQuestionStatement />', () => {
  describe('given a statement with an emphasised phrase', () => {
    it('underlines every occurrence', ...);
    it('keeps the original spelling', ...);
  });
  describe('given a statement without one', () => {
    it('renders plain text', ...);
  });
});

describe('splitByPhrases()', () => {
  describe('given a phrase as a whole word', () => {
    it('marks it as matched', ...);
  });
  describe('given the phrase inside a longer word', () => {
    it('does not match it', ...);
  });
  describe('given the phrase next to a Polish letter', () => {
    it('does not match it', ...);
  });
  describe('given the phrase in a different case', () => {
    it('matches it and keeps the spelling', ...);
  });
  describe('given the phrase next to punctuation', () => {
    it('matches the word without the punctuation', ...);
  });
  describe('given an empty phrase list', () => {
    it('returns the text as one unmatched part', ...);
  });
});

describe('<SurveyQuestionExplanation />', () => {
  describe('given an explanation with a trigger phrase', () => {
    it('shows the preview up to the trigger phrase', ...);
  });
  describe('given an explanation without a trigger phrase', () => {
    it('shows the fallback text', ...);
  });
  describe('when the bar is activated', () => {
    it('shows the full explanation', ...);
    it('reports itself as expanded', ...);
  });
  describe('when the bar is activated again', () => {
    it('returns to the preview', ...);
  });
  describe('while collapsed', () => {
    it('hides the full explanation from assistive technology', ...);
  });
});

describe('getExplanationPreview()', () => {
  describe('given a trigger phrase in the text', () => {
    it('returns the text up to and including the first one, with an ellipsis', ...);
  });
  describe('given the trigger phrase as the first word', () => {
    it('returns that word with an ellipsis', ...);
  });
  describe('given the trigger phrase only inside a longer word', () => {
    it('returns nothing', ...);
  });
  describe('given no trigger phrase', () => {
    it('returns nothing', ...);
  });
});
```

# Storybook stories

**Figma, in the frame's order**
- `WithExplanation` - "Obraza uczuć religijnych nie powinna być karalna.", preview from the trigger phrase
- `ExplanationFallback` - an explanation without a trigger phrase
- `NoExplanation` - "Kościół katolicki powinien utrzymać uprzywilejowaną pozycję regulowaną konkordatem."
- `ExplanationOpen` - opened in a `play` function

**Edge**
- `LongStatement`, `LongExplanation`
- `PhraseInsideWord` - a statement with "niepodległość", nothing underlined

# Remember about standards

- Use the standard colors palette, never add colors directly (check https://tailwindcss.com/docs/colors and our color palette in the `src/index.css` file and in [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css))
- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Create a Storybook story for the component with all possible props variants of the component
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)
- Name the branch `feature/survey-question-87`, following [Conventional Branch](https://conventional-branch.github.io/) - never keep a generated or default branch name
- Read `AGENTS.md` in the repository before starting. It holds the lessons from earlier reviews, and most of what blocked #54 is in it
- The component fills its parent's width and its height comes from its content. Stories show it alone, with no decorator, background or fixed width; check them at 320, 360 and 800 px
- Tests render through `renderWithI18n` from `src/utils/vitest/`. Do not build a provider in the test or mock Lingui, and do not put test strings through `msg` - they end up in the catalog
- Never edit `.po` files by hand. Run `yarn i18n:extract`, translate the new English entries, commit both catalogs
- Commit only files that belong to the task. `yarn.lock` does not change in this task
- Test descriptions and commit messages are in English; commits follow Conventional Commits
- The PR follows the repository's pull request template, with screenshots of the stories next to the Figma frame

# Dependencies

None. `SurveyAnswer` is done ([#33](https://github.com/gi-org-pl/mypolitics-app/issues/33)) and is not used here.

# Resources

- [Figma - SurveyQuestion frame](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=4260-2233) - [with explanation](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=4260-2236) | [fallback text](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=4260-10763) | [no explanation](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=4260-2999) | [explanation animation](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=4260-2692)
- [Figma - the card inside the Questions phase](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=4272-11664)
- [Docs - Phases model](https://github.com/gi-org-pl/product/blob/main/mypolitics/docs/modules/quiz/questionnaire/phases-model.md) - where the card sits in a session
- [Legacy SurveyQuestion](https://github.com/gi-org-pl/mypolitics-app-legacy/blob/develop/frontend/src/components/Survey/SurveyQuestion/SurveyQuestion.tsx) - for the preview and toggle behaviour only; do not copy styled-components or Framer Motion
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Storybook docs](https://storybook.js.org/docs/writing-stories)
- [Tailwind docs](https://tailwindcss.com/docs/)
- [Vitest docs](https://vitest.dev/guide/)

# Definition of Done

- [ ] Code follows folder structure (`docs/frontend/conventions/PROJECT_STRUCTURE.md`); the folder is `src/components/survey/SurveyQuestion/`
- [ ] Naming follows `docs/frontend/conventions/NAMING.md`
- [ ] Component layout follows `docs/frontend/conventions/COMPONENT_STRUCTURE.md`: one component per file, helpers in `utils/`, each with its own test
- [ ] Emphasised phrases are underlined as whole words only, in any case, with Polish letters handled
- [ ] The bar shows the trigger-phrase preview, or the fallback text when there is none
- [ ] The bar opens and collapses on activation, and collapses when the question changes
- [ ] The height animation is CSS, 300 ms, and is skipped under `prefers-reduced-motion`
- [ ] No answers, `ButtonSelect` or animation library in the component
- [ ] Invalid input degrades as in the table, without throwing
- [ ] The bar is a button that reports its expanded state; the collapsed explanation is hidden from assistive technology
- [ ] The component fills its parent's width; stories checked at 320 / 360 / 800 px with no horizontal scroll
- [ ] Unit tests added, BDD style, coverage ≥95% on all new files
- [ ] Storybook stories added for all variants listed above, showing the component alone
- [ ] Biome lint clean
- [ ] TypeScript clean (no `any`, no `@ts-ignore`, no non-null assertions)
- [ ] Every string from the Copy section goes through a Lingui macro, with Polish as the source; `yarn i18n:extract` run, English entries translated, `.po` files committed and not hand-edited
- [ ] PR states "No e2e: not mounted on any route"
- [ ] Branch named `feature/survey-question-87`
- [ ] CI green: build, lint, test
