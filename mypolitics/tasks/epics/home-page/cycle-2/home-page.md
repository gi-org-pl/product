# Story
As a user visiting myPolitics, I want to see a complete home page that showcases the featured quiz, available quizzes, platform features, and media partners so I can quickly understand what the platform offers and start exploring.

# Component properties

**Component:** `HomePage`
**Location:** `src/pages/Home/`
**Type:** page — not a shared component
**Route:** `/` (index route — already registered in `routes.ts` as `index('pages/Home/Home.tsx')`)
**Domain:** `home`

```ts
// No props — page component, all data is mocked internally for now
export default function HomePage() { ... }
```

# Page structure (top → bottom)

```
1. PromotionBanner
2. Featured section
   ├── Featured QuizCard (isHighlighted + isShowStartText)
   └── FeaturedQuizBanner
3. FeaturesList
4. PartnersList
5. Quiz section
   ├── Tabs (Wszystkie / Wyborcze / Społecznościowe)
   └── Quiz grid (QuizCard list, filtered by active tab)
6. Bottom actions row
   ├── "Zobacz więcej" button
   └── "Stwórz własny" button
```

# Implementation notes

### Routing
The page is already the index route — no changes to `routes.ts` needed. Header and Footer come from `root.tsx`.

### Mocked data
All data is defined as constants inside `Home.constants.ts`. No API calls yet. **The developer has creative freedom over the exact content** — make it realistic-looking but it doesn't need to match real quizzes exactly.

Suggested shape for each mock dataset:

```ts
// Home.constants.ts

export const MOCK_PROMOTIONS: Promotion[] = [
  {
    name: 'Discord Generacji Innowacja',
    url: 'https://discord.gg/...',
    date: { start: new Date('2024-01-01'), end: new Date('2099-12-31') },
    content: {
      leftTitle: 'Podoba Ci się myPolitics?',
      leftSubtitle: 'Twórz to z nami.',
      rightTitle: 'Dołącz na Discord',
      rightSubtitle: 'Fundacji Generacja Innowacja',
    },
  },
];

export const MOCK_FEATURES: Feature[] = [
  { title: '+4 000 000 osób', description: 'Milionom Polek i Polaków...' },
  { title: 'Nikt nas nie finansuje', description: 'Platformę tworzą wolontariusze...' },
  {
    title: 'Algorytm jest jawny',
    description: (
      <>
        Jesteśmy w pełni transparentni...{' '}
        <a href={PATHS.whitepaperPDF} className="underline text-primary">
          Sprawdź jak działa algorytm.
        </a>
      </>
    ),
  },
];

export const MOCK_PARTNER_SECTIONS: PartnerSection[] = [
  {
    partners: [
      { title: 'Demagog', logoUrl: demagogLogo, www: 'https://demagog.org.pl' },
      // ... add ~10 partners, mix of linked and non-linked
    ],
  },
];

export const MOCK_FEATURED_QUIZ: QuizCardProps = {
  logoUrl: myPoliticsLogo,
  cta: 'Nowy Quiz Tożsamościowy!',
  description: (
    <>
      <strong>Najbardziej zaawansowany test poglądów politycznych.</strong>{' '}
      Poznaj swoją tożsamość, najbliższą ideologię, partię i porównaj ze znajomymi!
    </>
  ),
  tags: ['+2M osób', '15 min'],
  isHighlighted: true,
  isShowStartText: true,
  isButtonLoading: false,
  onButtonClick: () => {},
};

export type QuizTab = 'all' | 'electoral' | 'social';

export const MOCK_QUIZZES: (QuizCardProps & { tabs: QuizTab[] })[] = [
  // ~6 quizzes mixing: backgroundUrl, logoUrl, title-only, various tags
  // each quiz tagged with which tabs it belongs to
];
```

> `PATHS.whitepaperPDF` — add to `constants/paths.ts` if not already there.

### Featured section layout
```tsx
<section className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <QuizCard {...MOCK_FEATURED_QUIZ} />
  <FeaturedQuizBanner />
</section>
```
On mobile: stacked (banner below the featured card). On desktop: side by side.

### Tabs + quiz grid
Use the `Tabs` component from the shared library.

Tab labels (from Figma):
- `Wszystkie` — shows all quizzes
- `Wyborcze` — electoral quizzes
- `Społecznościowe` — social/community quizzes

```tsx
const [activeTab, setActiveTab] = useState<QuizTab>('all');

const visibleQuizzes = activeTab === 'all'
  ? MOCK_QUIZZES
  : MOCK_QUIZZES.filter((q) => q.tabs.includes(activeTab));
```

Quiz grid:
```tsx
<ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
  {visibleQuizzes.map((quiz, i) => (
    <li key={i}><QuizCard {...quiz} /></li>
  ))}
</ul>
```

### Bottom actions
```tsx
<div className="flex gap-4">
  <Button variant="outline" onClick={() => {}}>
    <Trans>Zobacz więcej</Trans>
  </Button>
  <Button variant="primary" onClick={() => {}}>
    ✕ <Trans>Stwórz własny</Trans>
  </Button>
</div>
```
Both are no-ops for now (`onClick={() => {}`). The "Stwórz własny" icon matches the Figma (cross/plus icon).

### i18n
All user-visible strings in the page (tab labels, button labels, mock copy) go through Lingui macros. Mock data strings in `Home.constants.ts` should also use `msg` macro where used as plain strings, or `<Trans>` where used as JSX.

```tsx
import { msg } from '@lingui/core';
import { Trans } from '@lingui/react';

// tab label example
{ label: <Trans>Wszystkie</Trans>, value: 'all' }
```

Run `yarn i18n:extract` after adding strings.

### No API integration yet
All `onButtonClick` / `onCardClick` handlers are no-ops (`() => {}`). API wiring is a future task.

# Files to create

```
src/pages/Home/
├── Home.tsx               # Page component
├── Home.test.tsx          # Unit tests
└── Home.constants.ts      # All mock data constants
```

# Unit test cases (BDD)

```ts
describe('<HomePage />', () => {
  describe('structure', () => {
    it('renders the PromotionBanner', ...);
    it('renders the featured QuizCard', ...);
    it('renders the FeaturedQuizBanner', ...);
    it('renders the FeaturesList', ...);
    it('renders the PartnersList', ...);
    it('renders the quiz tabs', ...);
    it('renders the quiz grid', ...);
    it('renders the "Zobacz więcej" button', ...);
    it('renders the "Stwórz własny" button', ...);
  });

  describe('tab filtering', () => {
    describe('when "Wszystkie" tab is active (default)', () => {
      it('shows all quizzes', ...);
    });
    describe('when "Wyborcze" tab is selected', () => {
      it('shows only electoral quizzes', ...);
    });
    describe('when "Społecznościowe" tab is selected', () => {
      it('shows only social quizzes', ...);
    });
  });
});
```

# Storybook stories

Page-level components typically don't get Storybook stories — skip. Individual sub-components all have their own stories.

# Remember about standards
- Use the standard colors palette, never add colors directly (check https://tailwindcss.com/docs/colors and our color palette in the `src/index.css` file and in [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css))
- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)

# Dependencies — must be done in cycle 1 first
- `PromotionBanner` (`epics/home-page/cycle-1/promotion-banner.md`)
- `FeaturedQuizBanner` (`epics/home-page/cycle-1/featured-quiz-banner.md`)
- `QuizCard` (`epics/home-page/cycle-1/quiz-card.md`)
- `FeaturesList` (`epics/home-page/cycle-1/features-list.md`)
- `PartnersList` (`epics/home-page/cycle-1/partners-list.md`)
- `Layout` wired in `root.tsx` (`epics/layout/cycle-2/layout.md`)

# Resources
- [Legacy HomePage](https://github.com/gi-org-pl/mypolitics-app-legacy/tree/main/frontend/src/modules/HomePage) — see how sections are composed; ignore Next.js, styled-components, and data-fetching patterns
- [mypolitics.pl](https://mypolitics.pl) — the live home page is the best reference for section order, spacing, and content
- [Figma project link](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=1190-9207&t=k6GtQ4k9HtLFKbnM-1)
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Tailwind docs](https://tailwindcss.com/docs/)
- [Vitest docs](https://vitest.dev/guide/)

# Definition of Done
- [ ] All 6 sections rendered in correct order (matching Figma)
- [ ] `PromotionBanner` receives `MOCK_PROMOTIONS` from `Home.constants.ts`
- [ ] `FeaturesList` receives `MOCK_FEATURES` from `Home.constants.ts`
- [ ] `PartnersList` receives `MOCK_PARTNER_SECTIONS` from `Home.constants.ts`
- [ ] Featured `QuizCard` uses `isHighlighted + isShowStartText`
- [ ] Tab filtering works: Wszystkie / Wyborcze / Społecznościowe
- [ ] Tab state managed with `useState` — no Zustand
- [ ] Quiz grid uses `Tabs` component from shared library
- [ ] All mock data in `Home.constants.ts` — zero hardcoded content in `Home.tsx`
- [ ] All user-visible strings through Lingui macros; `yarn i18n:extract` run
- [ ] `onButtonClick` / `onCardClick` handlers are no-ops (API wiring is future task)
- [ ] Unit tests added, BDD style, coverage ≥95%
- [ ] No Storybook story (page-level component)
- [ ] Biome lint clean
- [ ] TypeScript clean (no `any`, no `@ts-ignore`)
- [ ] CI green: build, lint, test, e2e
