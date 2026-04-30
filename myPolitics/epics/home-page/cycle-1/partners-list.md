# Story
As a user on the home page, I want to see a list of media partners and supporters of myPolitics so I can see which organisations have endorsed or collaborated with the platform.

# Component properties

**Component:** `PartnersList`
**Location:** `src/components/home/PartnersList/`
**Shared:** no — domain component under `home`

```ts
export interface Partner {
  title: string;    // used as alt + title attribute on the logo image
  logoUrl: string;  // URL or imported asset path
  www?: string;     // optional external link — if present, logo is wrapped in <a>
}

export interface PartnerSection {
  title?: string;   // optional section label rendered as "{title}:"
  partners: Partner[];
}

export interface PartnersListProps {
  sections: PartnerSection[];
}

export const PartnersList: React.FC<PartnersListProps> = ({ sections }) => { ... }
```

# Use cases (from legacy + Figma)

### 1 — Partner with external link
- Logo image wrapped in `<a href={www} target="_blank" rel="noopener noreferrer">`.
- Example: Demagog, Onet, Wprost, Radio Wnet, etc.

### 2 — Partner without a link
- Logo image rendered standalone, no anchor wrapper.
- `www` is `undefined` / absent.

### 3 — Section with a title
- Optional section label rendered above (or inline before) the logos row as `"{title}:"`.
- Example from legacy: sections like `"Patroni medialni:"` or similar groupings from `ORGS_SECTIONS`.
- Check legacy `InfoSectionConstants.ts` for actual section titles and groupings.

### 4 — Section without a title
- `title` is `undefined` — no label rendered, logos flow directly.

### 5 — Desktop layout (≥ `md`)
- All logos in a horizontally flowing `flex-wrap` row — many logos across two dense rows (see Figma).
- Logos scale proportionally; consistent height, variable width (`height: auto`, fixed `max-height`).

### 6 — Mobile layout (< `md`)
- Logos wrap into a tighter grid — approximately 4 columns, flowing downward across multiple rows.

# Implementation notes

### Data flow
Purely presentational — all data via `sections` prop. **No hardcoded partner data inside the component.** The parent page/section defines the array (including asset imports and URLs).

### Logo rendering
```tsx
const image = (
  <img
    src={org.logoUrl}
    alt={org.title}
    title={org.title}
    className="max-h-8 w-auto object-contain"
  />
);

return org.www ? (
  <a href={org.www} target="_blank" rel="noopener noreferrer">
    {image}
  </a>
) : image;
```

- All partner links are **external** (media/org websites) → plain `<a>` tag, not React Router `<Link>`.
- `max-h-8` (or match Figma) keeps logos uniform height while preserving aspect ratio.
- Logos should render in greyscale or full color depending on what the Figma shows — check the live site at [mypolitics.pl](https://mypolitics.pl).

### Section structure
```tsx
<div>
  {sections.map((section, i) => (
    <div key={i}>
      {section.title && <span>{section.title}:</span>}
      <ul className="flex flex-wrap gap-4 md:gap-6 items-center">
        {section.partners.map((partner) => (
          <li key={partner.title}>
            {/* logo with optional link */}
          </li>
        ))}
      </ul>
    </div>
  ))}
</div>
```

### i18n
`PartnersList` has no own user-visible strings — the `title` and `alt` values come from the caller. Document on the interface that caller handles translation:

```ts
/**
 * All string values (title, partner.title) must be translated at the call site.
 * PartnersList does not apply any Lingui macros internally.
 */
```

# Files to create

```
src/components/home/PartnersList/
├── PartnersList.tsx
├── PartnersList.test.tsx
├── PartnersList.types.ts       # Partner, PartnerSection, PartnersListProps
└── PartnersList.stories.tsx
```

# Unit test cases (BDD)

```ts
describe('<PartnersList />', () => {
  describe('given sections with partners', () => {
    it('renders a logo for each partner', ...);
    it('renders the correct alt and title attributes on each logo', ...);
  });

  describe('given a partner with a www URL', () => {
    it('wraps the logo in an external link', ...);
    it('sets target="_blank" and rel="noopener noreferrer" on the link', ...);
  });

  describe('given a partner without a www URL', () => {
    it('renders the logo without a link wrapper', ...);
  });

  describe('given a section with a title', () => {
    it('renders the section title with a colon suffix', ...);
  });

  describe('given a section without a title', () => {
    it('does not render any section title', ...);
  });

  describe('given an empty sections array', () => {
    it('renders nothing', ...);
  });
});
```

# Storybook stories

- `Default` — two sections, first with a title, second without; mix of linked and unlinked logos
- `SingleSection` — one section, no title, all logos linked
- `NoLinks` — all partners without `www`
- `MobileViewport` — same as Default at 375 px width (verify wrapping)

# Remember about standards
- Use the standard colors palette, never add colors directly (check https://tailwindcss.com/docs/colors and our color palette in the `src/index.css` file and in [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css))
- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Create a Storybook story for the component with all possible variants
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)

# Resources
- [Legacy InfoSectionConstants](https://github.com/gi-org-pl/mypolitics-app-legacy/tree/main/frontend/src/modules/HomePage/InfoSection) — check `InfoSectionContants.ts` for exact `ORGS_SECTIONS` shape (actual section titles, partner list, logo asset paths, URLs); use for reference only
- [mypolitics.pl](https://mypolitics.pl) — see the live partners section on the home page (check for greyscale vs color logos)
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
- [ ] Storybook stories added (Default + SingleSection + NoLinks + MobileViewport)
- [ ] Biome lint clean
- [ ] TypeScript clean (no `any`, no `@ts-ignore`)
- [ ] No hardcoded partner data inside the component — all data from `sections` prop
- [ ] Partner links use `<a target="_blank" rel="noopener noreferrer">` — not React Router `<Link>`
- [ ] Logo images have both `alt` and `title` attributes from `partner.title`
- [ ] Section title rendered with `:` suffix only when `title` is defined
- [ ] JSDoc on interfaces noting caller handles i18n
- [ ] Semantic HTML: `<ul>`/`<li>` for logo lists
- [ ] Logo height consistent via `max-h` + `w-auto object-contain`
- [ ] CI green: build, lint, test, e2e
