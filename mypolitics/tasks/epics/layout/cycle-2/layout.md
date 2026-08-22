# Story
As a developer, I want the Header and Footer wired into `root.tsx` so that every page in the app automatically gets consistent navigation and footer without any additional layout route.

# Implementation notes

### Why `root.tsx` — not a separate Layout component
The project already has `root.tsx` which is the universal shell for every route in React Router framework mode. It renders `<Outlet />` which receives every page. Adding `Header` and `Footer` here means **zero routing changes needed** — all current and future pages get the layout for free.

No separate `Layout` component, no `layout()` helper in `routes.ts`.

### Changes to `root.tsx`

```tsx
import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { Outlet, Scripts } from "react-router";
import "@gi/athena/athena.css";

import { messages as enMessages } from "../src/locales/en/messages";
import { messages as plMessages } from "../src/locales/pl/messages";
import { DEFAULT_LANGUAGE } from "./constants/common";
import { Header } from "./components/shared/Header/Header";
import { Footer } from "./components/shared/Footer/Footer";

import "./index.css";

i18n.load({ en: enMessages, pl: plMessages });
i18n.activate(DEFAULT_LANGUAGE);

export default function App() {
  return (
    <html lang="en">
      <head>
        <title>mypolitics</title>
      </head>
      <body>
        <I18nProvider i18n={i18n}>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
              <Outlet />
            </main>
            <Footer />
          </div>
        </I18nProvider>
        <Scripts />
      </body>
    </html>
  );
}
```

Key points:
- `flex-col` + `flex-1` on `<main>` → sticky footer pattern (footer always at the bottom, even on short pages).
- `Header` and `Footer` sit **inside** `<I18nProvider>` so Lingui context is available to both.
- `<Scripts />` stays outside the provider — it's a React Router internal, not a UI component.
- Do **not** add padding/margin inside `root.tsx` — individual pages own their own spacing.

### 404 page wiring
Add a `NotFound` page that renders `Error404` and register it as the `*` catch-all route in `routes.ts`:

```
src/pages/NotFound/
├── NotFound.tsx
└── NotFound.test.tsx
```

```tsx
// NotFound.tsx
import { Error404 } from '@/components/shared/Error404/Error404';

export default function NotFound() {
  return <Error404 />;
}
```

Then in `routes.ts` (add to the existing route list — **do not** wrap in a `layout()` call):

```ts
import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('pages/Home/Home.tsx'),
  route('quizzes',  'pages/Quizzes/Quizzes.tsx'),
  route('debates',  'pages/Debates/Debates.tsx'),
  route('terms',    'pages/Terms/Terms.tsx'),
  route('privacy',  'pages/Privacy/Privacy.tsx'),
  route('about',    'pages/About/About.tsx'),
  route('*',        'pages/NotFound/NotFound.tsx'),  // ← 404 catch-all
] satisfies RouteConfig;
```

> Page components for routes other than `NotFound` may not exist yet — add their entries only when the relevant page task is done. The `*` catch-all **must** be wired up as part of this task.

### Dependencies
This task **depends on**:
- `Header` component (`epics/layout/cycle-1/header.md`)
- `Footer` component (`epics/layout/cycle-1/footer.md`)
- `Error404` component (`epics/layout/cycle-1/error-404.md`)

If any of the above are not yet merged, import a placeholder and leave a `// TODO` comment.

### No new component, no Storybook story
This task modifies `root.tsx` and creates a thin `NotFound` page — there is no new shared component to document in Storybook.

### i18n
`root.tsx` contains no user-visible strings. `NotFound` delegates entirely to `Error404` — no additional Lingui macros needed here.

# Files to create / modify

```
root.tsx                              # modify — add Header, Footer, flex wrapper
src/
└── pages/
    └── NotFound/
        ├── NotFound.tsx              # new — wraps Error404
        └── NotFound.test.tsx         # new — unit tests
routes.ts                             # modify — add route('*', 'pages/NotFound/NotFound.tsx')
```

# Unit test cases (BDD)

```ts
describe('root App', () => {
  describe('structure', () => {
    it('renders the Header', ...);
    it('renders the Footer', ...);
    it('renders child route content via Outlet', ...);
  });

  describe('sticky footer', () => {
    it('pushes the footer to the bottom when content is short', ...);
  });
});

describe('<NotFound /> page', () => {
  describe('when a user lands on an unknown route', () => {
    it('renders the Error404 component', ...);
  });
});
```

# Remember about standards
- Use the standard colors palette, never add colors directly (check https://tailwindcss.com/docs/colors and our color palette in the `src/index.css` file and in [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css))
- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)

# Resources
- [Legacy repo](https://github.com/gi-org-pl/mypolitics-app-legacy/tree/main/frontend) — see how the legacy app root/layout is structured
- [mypolitics.pl](https://mypolitics.pl) — observe header + footer on every page
- [React Router v7 Framework Mode — routing](https://reactrouter.com/start/framework/routing)
- [Figma project link](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=1190-9207&t=k6GtQ4k9HtLFKbnM-1)
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Vitest docs](https://vitest.dev/guide/)

# Definition of Done
- [ ] `Header` and `Footer` added to `root.tsx` inside `<I18nProvider>`
- [ ] Sticky footer works — `<main>` has `flex-1`, outer `<div>` has `min-h-screen flex flex-col`
- [ ] No padding/margin added in `root.tsx` — page spacing stays in individual pages
- [ ] `NotFound` page created at `src/pages/NotFound/NotFound.tsx`
- [ ] `route('*', ...)` catch-all registered in `routes.ts`
- [ ] Unit tests added/updated, BDD style, coverage ≥95% on changed files
- [ ] Biome lint clean (no disabled rules without justification)
- [ ] TypeScript clean (no `any`, no `@ts-ignore` without comment)
- [ ] No separate `Layout` component created — logic lives in `root.tsx`
- [ ] CI green: build, lint, test, e2e
