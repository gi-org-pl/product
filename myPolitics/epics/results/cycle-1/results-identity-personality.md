# Story

As a user reading my quiz results, I want a compact "identity" card showing the identity's avatar, name and how strongly I match it — with a single action button — so I can recognise the identity at a glance and either expand it or open its details.

> ⚠️ **Keep it non-political and universal.** The card is content-agnostic — props are generic (`name`, `agreementPercent`, `title`, …), no party/candidate/orientation-specific fields, naming or hardcoded labels. The design shows example content only as placeholders.

> This is **Task A of 2** for the `ResultsIdentities` component. It delivers the reusable card. Task B (`results-identities`) composes this card inside the container, switcher, views and modal.

# Component properties

**Component:** `ResultIdentityPersonality`
**Location:** `src/components/results/ResultsIdentities/ResultIdentityPersonality/`
**Shared:** no — subcomponent of `ResultsIdentities` (results domain). Lives inside its parent's folder per the encapsulation rule (used only within `ResultsIdentities`).

```ts
// ResultIdentityPersonality.types.ts
export type IdentityMode = "modal" | "expanded";

export interface IdentityInfoElement {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  imageUrl: string;
  agreementPercent: number; // 0–100
  slogan: string;
}

export interface ResultIdentityPersonalityProps {
  identity: IdentityInfoElement;
  mode: IdentityMode;
  expanded?: boolean;        // only relevant when mode === "expanded"
  onToggleExpanded?: () => void;
  onToggleModal?: () => void;
  title?: string;            // generic label shown before the percent (default e.g. "Tożsamość")
}
```

> `IdentityInfoElement` is the shared shape consumed by both tasks. Define it once here and re-export it from the `ResultsIdentities` barrel in Task B (or lift it to `ResultsIdentities.types.ts` and import — coordinate so it is declared in exactly one place, no duplication).

> The card is **content-agnostic** — it knows nothing about what an "identity" represents. The label before the percent is a plain `title` prop so the same card can be relabelled by any consumer.

Universal, presentational component — **no API calls, no context, no data fetching**. Everything arrives via props.

# Layout (from legacy `ResultIdentityPersonality`)

A single horizontal row:

- **Left — avatar:** circular `imageUrl` image, `alt={identity.name}`.
- **Middle — title line:** reads `"{title} ({percent}%)"` followed by the identity `name` on its own line/emphasis. The `(percent%)` value is **colour-coded by match strength** — see legacy `ResultPersonalityAggreement`: low percent = "weaker" palette colour, high percent = "stronger" palette colour (e.g. ~12% red, ~54% amber, ~66% green in the design). The label comes straight from the `title` prop (default a neutral label such as `"Tożsamość"`); the component does not branch on any domain-specific type.
- **Right — action button:** a single icon button, 48px wide.
  - `mode === "expanded"` → chevron icon (down when collapsed, **up** when `expanded`), click fires `onToggleExpanded`.
  - `mode === "modal"` → info ("i") icon, click fires `onToggleModal`.

# Athena components to use

- **`Avatar`** — for the circular identity image (`imageUrl`, `alt={name}`). Don't hand-roll an `<img>`.
- **`Button`** — for the right-hand action button (icon-only). Use Athena `Button` with the appropriate icon slot; do not reimplement.
- Chevron / info icons: use the project's existing icon approach (Athena `Button` icon slot + an icon from the project's icon set). Do **not** add FontAwesome — that was the legacy approach and is being dropped.

# Behaviour & edge cases

- `agreementPercent` is clamped to `0–100`, then displayed rounded to a whole number (`Math.round`), e.g. `66.6` → `67`.
- Colour-coding of the percent is derived from the (clamped) percent via a small pure helper — extract to `utils/getAgreementColor.ts` (+ test) since it's non-trivial and reused conceptually.
- Button icon + handler are chosen purely from `mode` (and `expanded` for the chevron).
- `expanded`, `onToggleExpanded`, `onToggleModal` are optional; guard the handlers (no crash if the relevant one is absent).
- `name` and the title line always render. If `title` is omitted, fall back to the default neutral label.

# Migration notes

- **Drop** `next/image` → use Athena `Avatar`.
- **Drop** FontAwesome (`@fortawesome/*`) → project icon approach.
- **Drop** styled-components (`ResultIdentitiesStyle` imports) → Tailwind utilities + palette.
- Rename callback props to the `onX` convention: `toggleExpanded` → `onToggleExpanded`, `toggleModal` → `onToggleModal`.
- **Drop** the legacy `identityType` / `optionalTitle` (`"presidential"` / `"Prezydent"`) branching → a single generic `title` label prop. The card carries no domain-specific labels.
- Do not decide exact Tailwind classes here — developer's call against the palette + Figma.

# Files to create

```
src/components/results/ResultsIdentities/ResultIdentityPersonality/
├── ResultIdentityPersonality.tsx
├── ResultIdentityPersonality.test.tsx
├── ResultIdentityPersonality.types.ts      # IdentityInfoElement, IdentityMode, props
├── ResultIdentityPersonality.stories.tsx
└── utils/
    ├── getAgreementColor.ts
    └── getAgreementColor.test.ts
```

# Unit test cases (BDD)

```ts
describe('<ResultIdentityPersonality />', () => {
  describe('given a title prop', () => {
    it('renders the provided title before the percent', ...);
  });
  describe('given no title prop', () => {
    it('renders the default neutral label', ...);
  });
  describe('given agreementPercent', () => {
    it('renders the rounded percent', ...);
    it('rounds fractional percents to a whole number', ...);
    it('clamps values below 0 and above 100', ...);
  });
  describe('given mode "expanded"', () => {
    it('shows a chevron-down when not expanded', ...);
    it('shows a chevron-up when expanded', ...);
    it('calls onToggleExpanded on button click', ...);
  });
  describe('given mode "modal"', () => {
    it('shows the info icon', ...);
    it('calls onToggleModal on button click', ...);
  });
  describe('given an imageUrl', () => {
    it('renders the avatar with alt set to name', ...);
  });
});

describe('getAgreementColor', () => {
  describe('given a low percent', () => { it('returns the weak-match color', ...); });
  describe('given a high percent', () => { it('returns the strong-match color', ...); });
});
```

# Storybook stories

- `ExpandedCollapsed` — `mode="expanded"`, `expanded={false}` (chevron down)
- `ExpandedOpen` — `mode="expanded"`, `expanded={true}` (chevron up)
- `ModalTrigger` — `mode="modal"` (info icon)
- `CustomTitle` — custom `title` label (shows the label is just a prop)
- `LowMatch` / `HighMatch` — `agreementPercent={12}` and `={98}` to show the percent colour scale

# Remember about standards

- Use the standard colors palette, never add colors directly (check `src/index.css` and [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css)) — the percent colour scale must come from the palette
- Use Athena's `Avatar` and `Button` — don't reimplement them, no FontAwesome
- Create unit tests with Vitest for 100% of the code (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Create a Storybook story for all variants listed above
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)
- All user-visible strings via Lingui macros (`<Trans>`, `` t`…` ``) — the default `title` label and the `(percent%)` formatting must not be hardcoded literals

# Resources

- [Legacy ResultIdentityPersonality](https://github.com/gi-org-pl/mypolitics-app-legacy/tree/develop/frontend/src/components/Results/ResultsIdentity) — analyze for layout + percent colour math only; do **not** copy styled-components, `next/image` or FontAwesome
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
- [ ] No styled-components, no `next/image`, no FontAwesome — Tailwind + Athena `Avatar`/`Button` only
- [ ] `agreementPercent` clamped to 0–100 and rounded; percent colour from palette
- [ ] User-visible strings wrapped in Lingui macros; `yarn i18n:extract` run, `.po` files committed
- [ ] CI green: build, lint, test
