# Story

As a user who has just answered the last question, I want to tell the quiz a few things about myself - my age, gender, where I live and my education - from short fixed lists, and to see why it asks, so that my result can later be compared with people like me without my typing anything identifying.

# Replaces

This task replaces [#34](https://github.com/gi-org-pl/mypolitics-app/issues/34) and its pull request [#48](https://github.com/gi-org-pl/mypolitics-app/pull/48). Start from a fresh branch off `main`; do not continue that branch. What changed from the old task:

- **Four fields, not five.** Region ("Województwo") is gone: the [demographics doc](https://github.com/gi-org-pl/product/blob/main/mypolitics/docs/modules/quiz/data-harvesting/demographics.md) and the Demographics phase frame have four. The component frame still draws a fifth field; ignore it.
- **No action buttons.** "Zobacz wyniki" and "Pomiń" belong to the questionnaire that wraps this component, as they do for the category select. The old task put them, and a loading state, inside.
- **No option lists inside.** The lists are a data contract - they travel with the answers into exports - so the parent passes them in. The old task hard-coded them, with every age from 18 to 117.
- **Fully controlled.** The parent holds the values; whether a field is required is the parent's decision.

# Component properties

**Component:** `SurveyDemographics`
**Location:** `src/components/survey/SurveyDemographics/`
**Shared:** no - domain component under `survey`

Presentational. No context, no API calls. The only state it owns is whether the "To znaczy?" dialog is open.

```ts
export type DemographicsFieldId = "age" | "gender" | "residenceAreaSize" | "education";

export interface DemographicsOption {
  value: string;
  label: string; // already in the taker's language
}

export type DemographicsValues = Partial<Record<DemographicsFieldId, string>>;

export interface SurveyDemographicsProps {
  options: Record<DemographicsFieldId, DemographicsOption[]>; // the fixed list of each field
  values: DemographicsValues;                                 // chosen values (controlled)
  onChange: (values: DemographicsValues) => void;             // fired on every choice with the full new set
  isDisabled?: boolean;                                       // true while the parent is saving
}
```

# Behaviour

The [Figma frame](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=4237-59739) is the source of truth for sizes, spacing, type and colours, read together with the [Demographics phase frame](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=4272-11722), which shows the four fields in place. The cases below are the source of truth for what happens.

### Layout

Three blocks, top to bottom: the header card, the four fields, the info card.

- Header card: the title, the illustration of two avatars beside it, a divider, the description.
- Fields: age and gender share a row; settlement size and education each take a full row. The order is fixed: age, gender, settlement size, education.
- Info card: one sentence, ending in the inline "To znaczy?" control.

### Fields

| Case | Behaviour |
|---|---|
| No value for a field | The field shows its name |
| A value that matches an option | The field shows that option's label |
| The field is opened | It lists the field's options, in the order given |
| An option is chosen | `onChange` is called with all current values plus this one; the list closes |
| A different option is chosen later | `onChange` is called with the value replaced |
| `isDisabled` | No field can be opened. The "To znaczy?" control still works |

A chosen value can be changed, not emptied: a taker who wants to leave a field out does not open it.

### "To znaczy?" dialog

| Case | Behaviour |
|---|---|
| "To znaczy?" activated | The dialog opens with its title and two paragraphs |
| The dialog dismissed (close button, overlay, Escape) | It closes. Nothing else changes |

### Invalid and edge input

| Input | Behaviour |
|---|---|
| A value that matches no option of its field | Treated as no value: the field shows its name |
| A field with an empty option list | The field is drawn disabled |
| A key in `values` that is not one of the four fields | Ignored, and not passed back through `onChange` |
| An option label longer than the field | Cut with an ellipsis in the closed field; shown in full in the open list |
| Two options with the same value | The first one is used |

### Accessibility

- Every field is named after what it asks, whether or not it holds a value - a field showing "Kobieta" is still announced as "Płeć".
- The illustration is decorative.
- "To znaczy?" is a button, reachable by keyboard.
- The dialog moves focus in, traps it, and returns it on close - Athena `Modal` does this.

# Copy

Polish is the source; every string goes through a Lingui macro and the English entry is filled in.

| Text | Polish (source) | English |
|---|---|---|
| Title | Twoja tożsamość | Your identity |
| Description | W tym teście otrzymasz dostosowaną pod siebie kartę tożsamości | In this test you will get an identity card tailored to you |
| Field: age | Wiek | Age |
| Field: gender | Płeć | Gender |
| Field: settlement size | Wielkość miejsca zamieszkania | Size of the place you live in |
| Field: education | Wykształcenie | Education |
| Info | Powyższe dane w przyszłości pozwolą Ci porównać się z innymi! | This will let you compare yourself with others in the future! |
| Info control | To znaczy? | Meaning? |
| Dialog title | Zakres wykorzystania danych | How the data is used |
| Dialog, first paragraph | Dzięki Twoim odpowiedziom w tej sekcji będziemy mogli przeanalizować Twoje wyniki w przyszłości w celu poprawienia działania quizu, a także przygotowania analiz na data.mypolitics.pl. | Your answers in this section let us analyse results in the future, to improve the quiz and to prepare analyses on data.mypolitics.pl. |
| Dialog, second paragraph | Twoje dane pozostaną całkowicie anonimowe. | Your data stays completely anonymous. |

Option labels come from props, already translated.

# Athena components to use

- `Select` for each field, with `ActionList` as its content: the option's label goes in `value`, the field's name in `placeholder`. Do not build a custom dropdown.
- `Modal` for the dialog, through its `title` and `description`.
- No Athena `Button` in this component: the two action buttons are out of scope, and "To znaczy?" is inline text, so it is a native button styled as in the frame.
- The illustration is exported from the frame as an image into `src/assets/images/survey/` and imported. Do not reuse the two files from #48: they are 1.2 MB of PNG wrapped in SVG, referenced by a source path that does not exist in a build.

# Out of scope

- "Zobacz wyniki" and "Pomiń", their disabled and loading states, and whether any field is required - the questionnaire.
- The option lists themselves, including the age bands.
- Saving the answers, and remembering them on the account.
- Region.

# Files to create

```
src/components/survey/SurveyDemographics/
├── SurveyDemographics.tsx
├── SurveyDemographics.test.tsx
├── SurveyDemographics.types.ts
├── SurveyDemographics.constants.ts        # the four fields: id, name, width
├── SurveyDemographics.stories.tsx
├── SurveyDemographicsHeader/              # title, illustration, description
│   ├── SurveyDemographicsHeader.tsx
│   └── SurveyDemographicsHeader.test.tsx
├── SurveyDemographicsField/               # one Select
│   ├── SurveyDemographicsField.tsx
│   ├── SurveyDemographicsField.test.tsx
│   └── utils/
│       ├── getSelectedOption.ts           # options + value -> the option, or nothing
│       └── getSelectedOption.test.ts
├── SurveyDemographicsInfo/                # the sentence and "To znaczy?"
│   ├── SurveyDemographicsInfo.tsx
│   └── SurveyDemographicsInfo.test.tsx
└── SurveyDemographicsModal/
    ├── SurveyDemographicsModal.tsx
    └── SurveyDemographicsModal.test.tsx
```

No functions in a component file, no `renderX()`. No props that exist only for stories or tests.

# Unit test cases (BDD)

```ts
describe('<SurveyDemographics />', () => {
  describe('given no values', () => {
    it('renders the four fields in order, each showing its name', ...);
    it('renders no region field', ...);
  });
  describe('given values', () => {
    it('shows the chosen label in each field', ...);
  });
  describe('when an option is chosen', () => {
    it('calls onChange with the other values kept and this one added', ...);
  });
  describe('when a different option is chosen for a filled field', () => {
    it('calls onChange with the value replaced', ...);
  });
  describe('given a key that is not one of the four fields', () => {
    it('does not pass it back through onChange', ...);
  });
  describe('given isDisabled', () => {
    it('disables every field', ...);
    it('keeps "To znaczy?" working', ...);
  });
  describe('when "To znaczy?" is activated', () => {
    it('opens the dialog', ...);
  });
  describe('when the dialog is dismissed', () => {
    it('closes it', ...);
    it('does not call onChange', ...);
  });
});

describe('<SurveyDemographicsField />', () => {
  describe('given no value', () => {
    it('shows the field name', ...);
  });
  describe('given a value that matches an option', () => {
    it('shows the option label', ...);
    it('is still named after the field', ...);
  });
  describe('given a value that matches no option', () => {
    it('shows the field name', ...);
  });
  describe('given an empty option list', () => {
    it('is disabled', ...);
  });
  describe('when opened', () => {
    it('lists the options in the order given', ...);
  });
  describe('when an option is activated', () => {
    it('calls its handler with the option value', ...);
  });
});

describe('getSelectedOption()', () => {
  describe('given a value present in the options', () => {
    it('returns that option', ...);
  });
  describe('given a value absent from the options', () => {
    it('returns nothing', ...);
  });
  describe('given two options with the same value', () => {
    it('returns the first', ...);
  });
});

describe('<SurveyDemographicsHeader />', () => {
  it('renders the title and the description', ...);
  it('hides the illustration from assistive technology', ...);
});

describe('<SurveyDemographicsModal />', () => {
  describe('given it is open', () => {
    it('renders the title and both paragraphs', ...);
  });
});
```

# Storybook stories

**Figma**
- `Default` - no values
- `Filled` - all four chosen
- `DialogOpen` - opened in a `play` function

**Edge**
- `PartlyFilled` - two of four
- `Disabled`
- `LongOptionLabel`
- `EmptyOptionList` - one field without options
- `UnknownValue` - a value that is in no list

Stories use mock lists. For gender, settlement size and education take the lists of myPolitics 1.0 (linked below); for age use a handful of bands. They are placeholders, not the product's lists.

# Remember about standards

- Use the standard colors palette, never add colors directly (check https://tailwindcss.com/docs/colors and our color palette in the `src/index.css` file and in [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css))
- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Create a Storybook story for the component with all possible props variants of the component
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)
- Name the branch `feature/survey-demographics-89`, following [Conventional Branch](https://conventional-branch.github.io/) - never keep a generated or default branch name
- Read `AGENTS.md` in the repository before starting. It holds the lessons from earlier reviews, and most of what blocked #48 is in it
- The component fills its parent's width and its height comes from its content: no maximum width and no centring inside it. Stories show it alone, with no decorator; check them at 320, 360 and 800 px
- Stories and tests use the shared i18n set-up (`withI18n` in Storybook, `renderWithI18n` from `src/utils/vitest/`). No provider of your own, no `console.log`, no `alert`
- Assets are imported, never referenced by a path string
- Run `yarn i18n:extract`, translate every new English entry, commit both catalogs
- Look at every story in the browser before opening the PR
- Commit only files that belong to the task; each commit message says what changed, following Conventional Commits
- The PR follows the repository's pull request template, with screenshots of the stories next to the Figma frame

# Dependencies

None.

# Resources

- [Docs - Demographics](https://github.com/gi-org-pl/product/blob/main/mypolitics/docs/modules/quiz/data-harvesting/demographics.md) - the four fields and why they are fixed lists
- [Docs - Phases model](https://github.com/gi-org-pl/product/blob/main/mypolitics/docs/modules/quiz/questionnaire/phases-model.md) - where the card sits in a session
- [Figma - SurveyDemographics frame](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=4237-59739) - [the card](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=4261-11066) (draws a fifth field - ignore it) | [dialog](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=4275-1690)
- [Figma - Demographics phase](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=4272-11722) - the four fields in place; its two buttons are not part of this task
- [Legacy option lists](https://github.com/gi-org-pl/mypolitics-app-legacy/blob/develop/frontend/src/components/Survey/v3/SingleSurveyPage/SurveyDemographics/SurveyDemographicsContent/SurveyDemographicsContent.tsx) - for story data only
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Storybook docs](https://storybook.js.org/docs/writing-stories)
- [Tailwind docs](https://tailwindcss.com/docs/)
- [Vitest docs](https://vitest.dev/guide/)

# Definition of Done

- [ ] Code follows folder structure (`docs/frontend/conventions/PROJECT_STRUCTURE.md`)
- [ ] Naming follows `docs/frontend/conventions/NAMING.md`
- [ ] Component layout follows `docs/frontend/conventions/COMPONENT_STRUCTURE.md`: one component per file, helpers in `utils/`, each with its own test
- [ ] Four fields in the fixed order; no region
- [ ] Each field shows its name when empty and the chosen label when filled
- [ ] Choosing an option calls `onChange` with the full set of values; the component keeps no copy of them
- [ ] The component has no action buttons, no option lists of its own and no props that exist only for stories
- [ ] `isDisabled` blocks the fields and nothing else
- [ ] "To znaczy?" opens the dialog; dismissing it changes nothing
- [ ] Invalid input degrades as in the table, without throwing
- [ ] Every field is named after what it asks, with or without a value
- [ ] Athena `Select` with `ActionList`, and Athena `Modal`, are used
- [ ] The illustration is an imported image of a sensible size, not an embedded base64 file
- [ ] The component fills its parent's width; stories checked at 320 / 360 / 800 px with no horizontal scroll
- [ ] Unit tests added, BDD style, coverage ≥95% on all new files
- [ ] Storybook stories added for all variants listed above, showing the component alone
- [ ] Biome lint clean
- [ ] TypeScript clean (no `any`, no `@ts-ignore`)
- [ ] Every string from the Copy section goes through a Lingui macro, with Polish as the source; `yarn i18n:extract` run, English entries translated, `.po` files committed
- [ ] PR states "No e2e: not mounted on any route"
- [ ] Branch named `feature/survey-demographics-89`
- [ ] CI green: build, lint, test
