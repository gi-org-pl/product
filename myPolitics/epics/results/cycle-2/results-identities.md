# Story

As a user viewing my quiz results, I want to switch between my single best-matched identity (with an expandable full description) and the full list of matched identities (each openable in a details modal) — so I can read the headline result and still drill into every identity.

> ⚠️ **Keep it non-political and universal.** Props are generic (`identities`, `title`, …) — no party/candidate/orientation-specific fields, naming or hardcoded content. The design shows example content only as placeholders.

# Component properties

**Component:** `ResultsIdentities`
**Location:** `src/components/results/ResultsIdentities/`
**Shared:** no — domain component under `results`

```ts
// ResultsIdentities.types.ts
import type { IdentityInfoElement } from "./ResultIdentityPersonality/ResultIdentityPersonality.types";

export type IdentitiesView = "most-suitable" | "all";

export interface ResultsIdentitiesProps {
  identities: IdentityInfoElement[];
  title?: string; // optional label forwarded to the cards (default neutral label)
}
```

> `IdentityInfoElement` is defined in Task A. Import it — do **not** redeclare. The view-key constants (`"most-suitable"`, `"all"`) live in `ResultsIdentities.constants.ts`.

Universal, presentational component — **no API calls, no context, no data fetching**. Everything comes through props. Local UI state only (selected view, expanded flag, open modal).

# Layout & behaviour (from legacy `ResultsIdentities` + design image)

Container holds a **switcher** (two tabs) + a **divider** + the **active view**. Default view = `most-suitable`.

### Switcher (`ResultIdentitiesSwitcher`)
Two segmented options:
- `"Największa pewność"` → selects `most-suitable`
- `"Wszystkie"` → selects `all`

The active option is visually highlighted (filled). Clicking switches `view` state.

### View 1 — Most suitable (`ResultMostSuitableIdentity`)
Shows the **top identity only** (first / highest `agreementPercent` — preserve legacy ordering: index 0).
- A short paragraph (`shortDescription`) by default.
- When expanded, the full `description` is shown instead/in addition (design: multi-paragraph body).
- A `ResultIdentityPersonality` card in `mode="expanded"`, driven by a local `expanded` boolean and toggled via the card's chevron button.

### View 2 — All identities (`ResultAllIdentities`)
A vertical list of **every** identity. Each row is a `ResultIdentityPersonality` card in `mode="modal"` (info "i" button). Clicking a row's info button opens the **details modal** for that identity.

### Modal (Athena `Modal`)
- **Title** = the selected identity's `name`.
- **Content** = that identity's `description`, plus a `ResultIdentityPersonality` card for it.
- Use Athena's **`Modal`** component. Open/close is local state holding the selected identity (or `null`).

### Empty state
- If `identities.length === 0`, render nothing (`return null`) — matches legacy.

# Component tree / files to create

```
src/components/results/ResultsIdentities/
├── ResultsIdentities.tsx                 # container: switcher + divider + active view
├── ResultsIdentities.test.tsx
├── ResultsIdentities.types.ts            # ResultsIdentitiesProps, IdentitiesView
├── ResultsIdentities.constants.ts        # VIEW_MOST_SUITABLE, VIEW_ALL_IDENTITIES
├── ResultsIdentities.stories.tsx
├── ResultIdentitiesSwitcher/
│   ├── ResultIdentitiesSwitcher.tsx
│   ├── ResultIdentitiesSwitcher.test.tsx
│   └── ResultIdentitiesSwitcher.types.ts
├── ResultMostSuitableIdentity/
│   ├── ResultMostSuitableIdentity.tsx
│   └── ResultMostSuitableIdentity.test.tsx
├── ResultAllIdentities/
│   ├── ResultAllIdentities.tsx
│   └── ResultAllIdentities.test.tsx
└── ResultIdentityPersonality/            # delivered by Task A
```

> Folder structure mirrors the component tree (mirroring principle). Subviews are domain-only, so they nest under `ResultsIdentities/` rather than being promoted. Only add `.constants.ts` / `.types.ts` files where actually needed (minimization).

# Athena components to use

- **`Modal`** — the identity details modal (title = `name`, content = `description` + card). Do not build a custom dialog.
- **`ButtonSelect`** (or `Tabs`) — for the two-option switcher if it fits the API; otherwise styled `Button`s with an active state. Prefer the Athena segmented/select control over hand-rolled tabs.
- `ResultIdentityPersonality` (Task A) — used in both views and inside the modal.

# Behaviour & edge cases

- Default `view` is `most-suitable`.
- Switching views resets nothing destructive; expanded state belongs to the most-suitable view, modal state to the all view.
- Most-suitable view uses identity at index `0` (legacy behaviour — list is assumed pre-sorted by the caller).
- Opening a modal sets the selected identity; closing clears it.
- The optional `title` label is forwarded to every `ResultIdentityPersonality`.
- Empty `identities` → renders `null`.

# Migration notes

- **Drop** styled-components (`ResultIdentitiesStyle`, container/divider/switcher styles) → Tailwind utilities + palette.
- **Drop** the `ComponentType` view-registry indirection if a simple conditional render is clearer — keep the two views as separate components either way.
- Keep view-key strings in `ResultsIdentities.constants.ts` (legacy `ResultIdentityConstants.ts`).
- Rename `handleChangeView` prop to follow the project convention used elsewhere; keep behaviour identical.
- Do not decide exact Tailwind classes here — developer's call against palette + Figma.

# Unit test cases (BDD)

```ts
describe('<ResultsIdentities />', () => {
  describe('given an empty identities array', () => {
    it('renders nothing', ...);
  });
  describe('given identities, by default', () => {
    it('shows the most-suitable view with the first identity', ...);
    it('highlights the "Największa pewność" switcher option', ...);
  });
  describe('when the user clicks "Wszystkie"', () => {
    it('renders one card per identity', ...);
  });
  describe('when the user clicks an identity info button (all view)', () => {
    it('opens the modal with that identity name as title', ...);
    it('shows that identity description in the modal', ...);
    it('closes the modal on dismiss', ...);
  });
});

describe('<ResultMostSuitableIdentity />', () => {
  describe('by default', () => { it('shows the shortDescription', ...); });
  describe('when the card chevron is clicked', () => { it('reveals the full description', ...); });
});

describe('<ResultAllIdentities />', () => {
  describe('given N identities', () => { it('renders N modal-mode cards', ...); });
});

describe('<ResultIdentitiesSwitcher />', () => {
  describe('when an option is clicked', () => { it('calls handleChangeView with the right view key', ...); });
});
```

# Storybook stories

- `Default` — several identities, most-suitable view
- `AllView` — pre-toggled to the "all" list (or interaction note)
- `CustomTitle` — custom `title` label forwarded to the cards
- `SingleIdentity` — array of one
- `Empty` — `identities={[]}` (renders nothing)

# Remember about standards

- Use the standard colors palette, never add colors directly (check `src/index.css` and [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css))
- Use Athena's `Modal` and `ButtonSelect`/`Tabs` — don't reimplement a dialog or tab control
- Create unit tests with Vitest for 100% of the code (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Create a Storybook story for all variants listed above
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)
- All user-visible strings via Lingui macros (`<Trans>`, `` t`…` ``) — `"Największa pewność"`, `"Wszystkie"` and any other literals must not be hardcoded

# Resources

- [Legacy ResultsIdentities](https://github.com/gi-org-pl/mypolitics-app-legacy/tree/develop/frontend/src/components/Results/ResultsIdentity) — analyze for structure + the `views` switching behaviour; do **not** copy styled-components
- [Figma project link](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=1190-9207&t=k6GtQ4k9HtLFKbnM-1)
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Storybook docs](https://storybook.js.org/docs/writing-stories)
- [Tailwind docs](https://tailwindcss.com/docs/)
- [Vitest docs](https://vitest.dev/guide/)

# Definition of Done

- [ ] Depends on Task A `ResultIdentityPersonality` (imported, not duplicated)
- [ ] Code follows folder structure (`docs/frontend/conventions/PROJECT_STRUCTURE.md`)
- [ ] Naming follows `docs/frontend/conventions/NAMING.md`
- [ ] Component layout follows `docs/frontend/conventions/COMPONENT_STRUCTURE.md`
- [ ] Unit tests added, BDD style, coverage ≥95% on all new files
- [ ] Storybook stories added for all variants listed above
- [ ] Biome lint clean
- [ ] TypeScript clean (no `any`, no `@ts-ignore`)
- [ ] No styled-components — Tailwind + Athena `Modal`/`ButtonSelect` only
- [ ] Empty array renders nothing; default view is most-suitable
- [ ] User-visible strings wrapped in Lingui macros; `yarn i18n:extract` run, `.po` files committed
- [ ] CI green: build, lint, test
