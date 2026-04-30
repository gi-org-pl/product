# Story
As a user on the home page, I want to see a list of key facts/features about myPolitics so I can quickly understand what makes the platform trustworthy and unique.

# Component properties

**Component:** `FeaturesList`
**Location:** `src/components/home/FeaturesList/`
**Shared:** no — domain component under `home`

```ts
export interface Feature {
  title: string;
  description: string | ReactNode; // ReactNode to support inline links
}

export interface FeaturesListProps {
  features: Feature[];
}

export const FeaturesList: React.FC<FeaturesListProps> = ({ features }) => { ... }
```

# Use cases (from legacy + Figma)

### 1 — Standard feature item (plain text description)
- Card with a bold teal title and a paragraph of body text below.
- Examples from legacy:
  - `"+4 000 000 osób"` / `"Milionom Polek i Polaków pomogliśmy..."`
  - `"Nikt nas nie finansuje"` / `"Platformę tworzą wolontariusze..."`

### 2 — Feature item with inline link in description
- Description contains a clickable hyperlink rendered inline within the text.
- Example from legacy: `"Algorytm jest jawny"` — description ends with `<Link href={paths.whitepaperPDF}>Sprawdź jak działa algorytm.</Link>`
- Supported via `description: ReactNode` — the **caller** is responsible for passing the link; `FeaturesList` just renders whatever it receives.

### 3 — Desktop layout (≥ `md`)
- All cards rendered in a single row, equal-width columns (3-column grid for 3 items, but the grid should handle any count gracefully).

### 4 — Mobile layout (< `md`)
- Cards stacked vertically, each taking full width.

# Implementation notes

### Data flow
The component is purely presentational — it receives `features` as a prop and renders them. **No hardcoded copy inside the component.** The parent page/section owns the data array (including any inline links in descriptions).

### Card structure
Each `Feature` renders as a card:
```tsx
<article>
  <h3>{feature.title}</h3>
  <p>{feature.description}</p>   {/* ReactNode — renders plain text or JSX */}
</article>
```
Use semantic HTML (`<article>` for each card, `<h3>` for the title).

### Grid
```tsx
<ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
  {features.map((feature, index) => (
    <li key={index}>
      <FeatureCard feature={feature} />
    </li>
  ))}
</ul>
```

If the subcomponent `FeatureCard` is small enough (just title + description), it can stay inline inside `FeaturesList.tsx` instead of a separate file — apply the minimization principle.

### Styling
- Card: white background, rounded corners, subtle border or shadow (match Figma).
- Title: bold, teal (primary brand color via Tailwind utility — no hardcoded hex).
- Description: standard body text color.
- Inline links in description: teal, underlined (match Figma — the link in card 3 is visually distinct).

### i18n
`FeaturesList` renders whatever strings are passed in — no Lingui macros needed inside the component itself. The **caller** (parent page) is responsible for wrapping its string literals in `<Trans>` / `t` macros before passing them as props.

Document this clearly in a JSDoc comment on the `Feature` interface:
```ts
/**
 * title and description must already be translated by the caller.
 * Use <Trans> / t`` macros at the call site, not inside FeaturesList.
 */
```

# Files to create

```
src/components/home/FeaturesList/
├── FeaturesList.tsx
├── FeaturesList.test.tsx
├── FeaturesList.types.ts     # Feature + FeaturesListProps interfaces
└── FeaturesList.stories.tsx
```

# Unit test cases (BDD)

```ts
describe('<FeaturesList />', () => {
  describe('given a list of features', () => {
    it('renders a card for each feature', ...);
    it('renders the title of each feature', ...);
    it('renders the description of each feature', ...);
  });

  describe('given a feature with a ReactNode description', () => {
    it('renders the inline link within the description', ...);
  });

  describe('given an empty features array', () => {
    it('renders no cards', ...);
  });

  describe('layout', () => {
    it('applies a single-column layout on mobile', ...);
    it('applies a 3-column grid layout on desktop', ...);
  });
});
```

# Storybook stories

- `Default` — 3 features, third one with an inline link in description (mirrors the real home page data)
- `SingleFeature` — only 1 item (verify grid degrades gracefully)
- `ManyFeatures` — 6 items (verify wrapping behavior)

# Remember about standards
- Use the standard colors palette, never add colors directly (check https://tailwindcss.com/docs/colors and our color palette in the `src/index.css` file and in [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css))
- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Create a Storybook story for the component with all possible variants
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)

# Resources
- [Legacy InfoSectionView](https://github.com/gi-org-pl/mypolitics-app-legacy/tree/main/frontend/src/modules/HomePage/InfoSection) — analyze `CardsWrapper` / `Card` / `CardTitle` / `CardContent` for use cases only; ignore styled-components and hardcoded copy
- [mypolitics.pl](https://mypolitics.pl) — see the live features section on the home page
- [Figma project link](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=1190-9207&t=k6GtQ4k9HtLFKbnM-1)
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Storybook docs](https://storybook.js.org/docs/writing-stories)
- [Tailwind docs](https://tailwindcss.com/docs/)
- [Vitest docs](https://vitest.dev/guide/)

# Definition of Done
- [ ] Code follows folder structure (`docs/frontend/conventions/PROJECT_STRUCTURE.md`)
- [ ] Naming follows `docs/frontend/conventions/NAMING.md`
- [ ] Component layout follows `docs/frontend/conventions/COMPONENT_STRUCTURE.md`)
- [ ] Unit tests added, BDD style, coverage ≥95%
- [ ] Storybook stories added (Default + SingleFeature + ManyFeatures)
- [ ] Biome lint clean
- [ ] TypeScript clean (no `any`, no `@ts-ignore`)
- [ ] No hardcoded copy inside the component — all text comes from `features` prop
- [ ] `description` typed as `string | ReactNode` to support inline links
- [ ] JSDoc comment on `Feature` interface noting that caller is responsible for i18n
- [ ] No Lingui macros inside `FeaturesList` — translation responsibility documented at call site
- [ ] Semantic HTML: `<ul>`/`<li>` for the list, `<article>` per card, `<h3>` for title
- [ ] Grid degrades gracefully for any number of items (not hardcoded to 3)
- [ ] CI green: build, lint, test, e2e
