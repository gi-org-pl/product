# Story

As a user who has finished a survey, I want to optionally fill in my demographic data (age, gender, place of residence size, education level, and region) so that my results can be compared with others — and I want to be able to skip this step or learn more about how my data will be used.

# Component properties

**Component:** `SurveyDemographics`
**Location:** `src/components/survey/SurveyDemographics/`
**Shared:** no — domain component under `survey`

This is a **fully controlled, presentational component**. It has no context dependencies and performs no API calls. All async behaviour lives in the parent — the component only manages its own UI state (filled fields, modal visibility) and fires callbacks.

```ts
type SurveyDemographicsProps = {
  isLoading?: boolean;         // true while the parent is uploading — disables/loads both buttons
  onSubmit: (demographics: Demographics) => void;   // called when user clicks "Zobacz wyniki"
  onSkip: () => void;          // called when user clicks skip
};

const SurveyDemographics = ({ isLoading = false, onSubmit, onSkip }: SurveyDemographicsProps) => { ... }
export default SurveyDemographics;
```

Local state (the only state this component owns):

```ts
const [showModal, setShowModal] = useState(false);
const [demographics, setDemographics] = useState<DemographicsInput>({
  age: null,
  gender: null,
  residenceAreaSize: null,
  education: null,
});
```

Exported types (in `SurveyDemographics.types.ts`):

```ts
export type Demographics = {
  age: number;
  gender: string;
  residenceAreaSize: string;
  education: string;
  region?: string;           // optional — does not block submission
};

// Internal nullable form state; not exported
type DemographicsInput = {
  age: number | null;
  gender: string | null;
  residenceAreaSize: string | null;
  education: string | null;
  region?: string;
};
```

# Behaviour

### Layout

Vertical stack with three main sections:

```
[ Header card ]
[ Demographic selects grid ]
[ Info text + "To znaczy?" link ]
[ Action buttons ]
[ Modal (conditional) ]
```

---

### Header card

Rounded card with a light background containing:

- **Title:** `<Trans>Twoja tożsamość</Trans>` — bold, large text.
- **Illustration:** SVG image of two cartoon avatars (`image.svg`) — positioned to the right.
- Horizontal divider between title row and description.
- **Description:** `<Trans>W tym teście otrzymasz dostosowaną pod siebie kartę tożsamości</Trans>`.

---

### Demographic selects (`SurveyDemographicsContent`)

A subcomponent `SurveyDemographicsContent` renders a responsive grid of `Select` fields (Athena `Select`). It accepts:

```ts
type SurveyDemographicsContentProps = {
  handleChange: (control: string, value: string) => void;
};
```

Grid layout: two columns on wider viewports, one column on narrow. Fields with `full: true` span the full width.

The five fields and their options:

| `control` | `label` | `full` | Options |
|---|---|---|---|
| `age` | `<Trans>Wiek</Trans>` | — | `"0"` → `<Trans>Mniej niż 18</Trans>`, then `"18"`–`"117"` (numeric labels) |
| `gender` | `<Trans>Płeć</Trans>` | — | `male` → `<Trans>Mężczyzna</Trans>`, `female` → `<Trans>Kobieta</Trans>`, `other` → `<Trans>Inna płeć</Trans>` |
| `residenceAreaSize` | `<Trans>Wielkość miejsca zamieszkania</Trans>` | `true` | `village` → `<Trans>Wieś</Trans>`, `city_below_50k` → `<Trans>Miasto poniżej 50 tysięcy mieszkańców</Trans>`, `city_below_200k` → `<Trans>Miasto poniżej 200 tysięcy mieszkańców</Trans>`, `city_below_500k` → `<Trans>Miasto poniżej 500 tysięcy mieszkańców</Trans>`, `city_over_500k` → `<Trans>Miasto powyżej 500 tysięcy mieszkańców</Trans>` |
| `education` | `<Trans>Wykształcenie</Trans>` | `true` | `primary` → `<Trans>Wykształcenie podstawowe</Trans>`, `basic_vocational` → `<Trans>Wykształcenie zasadnicze zawodowe</Trans>`, `secondary` → `<Trans>Wykształcenie średnie</Trans>`, `higher` → `<Trans>Wykształcenie wyższe</Trans>` |
| `region` | `<Trans>Województwo</Trans>` | `true` | `dolnoslaskie` → `<Trans>Dolnośląskie</Trans>`, `kujawsko-pomorskie` → `<Trans>Kujawsko-Pomorskie</Trans>`, `lubelskie` → `<Trans>Lubelskie</Trans>`, `lubuskie` → `<Trans>Lubuskie</Trans>`, `lodzkie` → `<Trans>Łódzkie</Trans>`, `malopolskie` → `<Trans>Małopolskie</Trans>`, `mazowieckie` → `<Trans>Mazowieckie</Trans>`, `opolskie` → `<Trans>Opolskie</Trans>`, `podkarpackie` → `<Trans>Podkarpackie</Trans>`, `podlaskie` → `<Trans>Podlaskie</Trans>`, `pomorskie` → `<Trans>Pomorskie</Trans>`, `slaskie` → `<Trans>Śląskie</Trans>`, `swietokrzyskie` → `<Trans>Świętokrzyskie</Trans>`, `warminsko-mazurskie` → `<Trans>Warmińsko-Mazurskie</Trans>`, `wielkopolskie` → `<Trans>Wielkopolskie</Trans>`, `zachodniopomorskie` → `<Trans>Zachodniopomorskie</Trans>` |

The options data is defined as a constant in `SurveyDemographicsContent.constants.ts`.

Use Athena's `Select` component for each field. On change, call `handleChange(control, value)`.

---

### Info text & "To znaczy?" link

Below the selects, a paragraph:

> `<Trans>Powyższe dane w przyszłości pozwolą Ci porównać się z innymi!</Trans>` followed by an inline clickable text `<Trans>To znaczy?</Trans>`

Clicking "To znaczy?" sets `showModal` to `true`.

---

### Action buttons

Two buttons stacked vertically (or in a flex column):

1. **Primary — "Zobacz wyniki"**
   - Athena `Button`, use an appropriate filled/colored variant.
   - `disabled` when: `isDemographicsFilled` is `false` **or** `isLoading` prop is `true`.
   - Shows loading state when `isLoading` is `true`.
   - `onClick`: calls `onSubmit(demographics as Demographics)` — cast is safe because `isDemographicsFilled` guards the button.

2. **Secondary — Skip**
   - Athena `Button`, use a transparent/ghost variant.
   - Label: use Lingui for the "Pomiń" / skip string.
   - `disabled` when: `isLoading` prop is `true`.
   - Shows loading state when `isLoading` is `true`.
   - `onClick`: calls `onSkip()`.

`isDemographicsFilled` logic — only the four required fields:

```ts
const isDemographicsFilled =
  demographics.age !== null &&
  demographics.gender !== null &&
  demographics.residenceAreaSize !== null &&
  demographics.education !== null;
```

> **Note:** `region` is optional — do **not** include it in the filled-check.

---

### "To znaczy?" Modal

Use Athena's `Modal` component. Opens when the "To znaczy?" inline link is clicked.

- **Title:** `<Trans>Zakres wykorzystania danych</Trans>`
- **Body:**
  - `<Trans>Dzięki Twoim odpowiedziom w tej sekcji będziemy mogli przeanalizować Twoje wyniki w przyszłości w celu poprawienia działania quizu, a także przygotowania analiz na data.mypolitics.pl.</Trans>`
  - `<Trans>Twoje dane pozostaną całkowicie anonimowe.</Trans>`
- **Close button:** standard modal dismiss — sets `showModal` to `false`.

---

# Files to create

```
src/components/survey/SurveyDemographics/
├── SurveyDemographics.tsx
├── SurveyDemographics.test.tsx
├── SurveyDemographics.types.ts            # Demographics, DemographicsInput
├── SurveyDemographics.stories.tsx
└── SurveyDemographicsContent/
    ├── SurveyDemographicsContent.tsx
    ├── SurveyDemographicsContent.test.tsx
    ├── SurveyDemographicsContent.constants.ts  # demographicsData array
    └── SurveyDemographicsContent.stories.tsx
```

# Unit test cases (BDD)

```ts
describe('<SurveyDemographics />', () => {

  describe('given no demographic fields are filled', () => {
    it('disables the primary submit button', ...);
    it('does not disable the skip button', ...);
  });

  describe('given all required demographic fields are filled', () => {
    it('enables the primary submit button', ...);
  });

  describe('when the primary button is clicked', () => {
    it('calls onSubmit with the current demographics object', ...);
  });

  describe('when the skip button is clicked', () => {
    it('calls onSkip', ...);
  });

  describe('when isLoading is true', () => {
    it('disables both buttons', ...);
    it('shows loading state on both buttons', ...);
  });

  describe('when "To znaczy?" link is clicked', () => {
    it('opens the modal', ...);
  });

  describe('when the modal is closed', () => {
    it('hides the modal', ...);
  });
});

describe('<SurveyDemographicsContent />', () => {

  describe('given rendered', () => {
    it('renders a Select for each demographic field', ...);
    it('renders age, gender, residenceAreaSize, education, and region selects', ...);
  });

  describe('when a select value changes', () => {
    it('calls handleChange with the correct control key and value', ...);
  });
});
```

# Storybook stories

**SurveyDemographics:**
- `Default` — no fields filled, submit button disabled
- `AllFilled` — all required selects set, submit button enabled
- `Loading` — `isLoading = true`, both buttons in loading/disabled state
- `ModalOpen` — "To znaczy?" modal pre-opened

**SurveyDemographicsContent:**
- `Default` — all five selects rendered in an uncontrolled state

# Remember about standards

- **No context hooks, no API calls, no side effects** — this component is purely presentational; the parent owns all async logic
- Use Athena `Select` for each dropdown — do **not** roll a custom select or reuse the legacy `SurveyAnswerSelect`
- Use Athena `Button` for both action buttons
- Use Athena `Modal` for the "To znaczy?" modal
- No styled-components — Tailwind utility classes only
- All user-visible strings wrapped in Lingui macros (`<Trans>` in JSX, `` t`…` `` for ARIA labels/attributes) — no hardcoded literals
- Run `yarn i18n:extract` after adding strings; commit the updated `.po` files
- `region` is optional and must **not** block the submit button
- The options data for all selects lives in `SurveyDemographicsContent.constants.ts`
- Create unit tests with Vitest, BDD style, ≥95% coverage on all new files
- Create Storybook stories for all variants listed above
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)

# Resources

- [Legacy SurveyDemographics](https://github.com/gi-org-pl/mypolitics-app-legacy/tree/develop/frontend/src/components/Survey/v3/SingleSurveyPage/SurveyContent/QuestionAnswer/Answer) — analyze for behaviour and option data only; do **not** copy styled-components
- [Figma project link](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=1190-9207&t=k6GtQ4k9HtLFKbnM-1)
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Storybook docs](https://storybook.js.org/docs/writing-stories)
- [Tailwind docs](https://tailwindcss.com/docs/)
- [Vitest docs](https://vitest.dev/guide/)

# Definition of Done

- [ ] Code follows folder structure (`docs/frontend/conventions/PROJECT_STRUCTURE.md`)
- [ ] Naming follows `docs/frontend/conventions/NAMING.md`
- [ ] Component layout follows `docs/frontend/conventions/COMPONENT_STRUCTURE.md`
- [ ] Unit tests added, BDD style, coverage ≥95% on all new files
- [ ] Storybook stories added for all variants listed above
- [ ] Biome lint clean
- [ ] TypeScript clean (no `any`, no `@ts-ignore`)
- [ ] No styled-components — Tailwind only
- [ ] Athena `Select` used for all demographic dropdowns
- [ ] Athena `Button` used for submit and skip buttons
- [ ] Athena `Modal` used for the "To znaczy?" explanation modal
- [ ] No context hooks or API calls — component is fully controlled via props
- [ ] All user-visible strings wrapped in Lingui macros — no hardcoded literals
- [ ] `yarn i18n:extract` run after adding strings; `.po` files committed
- [ ] `region` field is optional and does not block form submission
- [ ] Demographics options data extracted to `SurveyDemographicsContent.constants.ts`
- [ ] CI green: build, lint, test
