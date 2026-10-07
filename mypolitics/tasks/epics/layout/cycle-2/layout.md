# Story

As a user, I want the same header and footer on every page, and a proper "not found" page for an address that does not exist, so that I can always navigate and never land on a blank screen.

# Status

**Continue pull request [#27](https://github.com/gi-org-pl/mypolitics-app/pull/27) on its branch `layout-wrapper`.** The work is close: this task lists what is left. Do not start over.

Already right in #27 - keep it:

- `Header` and `Footer` are rendered in `src/root.tsx`, inside the i18n provider, around the route content.
- Unknown addresses are caught by the catch-all route file `src/pages/$.tsx`, which renders `Error404`. `flatRoutes` stays in `src/routes.ts`.
- Test files inside `src/pages/` are excluded from routing through `ignoredRouteFiles`.
- The promotion banner is no longer on the home page.
- `Header` is a named export, like every other component.

# What changed in this task

The first version of this task told you to list routes by hand in `routes.ts` with `route('*', 'pages/NotFound/NotFound.tsx')`. **That instruction is withdrawn.** The project uses file-based routes, and the review of #27 settled it: keep `flatRoutes`, and use the [catch-all route file](https://reactrouter.com/how-to/file-route-conventions#catch-all-route). There is no `pages/NotFound/` folder.

# Behaviour

The [Figma frame](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=4236-56053) is the source of truth for how the shell looks.

| Case | Behaviour |
|---|---|
| Any existing route | Header, then the route's content, then the footer |
| A route whose content is shorter than the window | The footer sits at the bottom of the window, not under the content |
| A route whose content is longer than the window | The footer follows the content; the page scrolls as a whole |
| An address that matches no route | The same header and footer, with `Error404` as the content |
| Any route | The shell adds no spacing around the content: each page owns its own |

No separate `Layout` component and no layout route: the shell lives in `root.tsx`.

# What is left to fix in #27

1. **Merge `main` and make the build pass.** `main` has moved since June: Athena is now the npm package `@gi-org-pl/athena` and its stylesheet is imported in `src/index.css`, not in `root.tsx`.
2. **Remove the changes that do not belong to this task.**
   - `PromotionBanner.tsx`: the wrapper with a maximum width and side padding. The banner is no longer on the home page, and a component does not carry its own outer width or margins - the page that places it decides.
   - `SurveySaturatedProgressBar.tsx` and its stories: formatting-only changes.
3. **Rewrite the `root` tests so they test behaviour, not class names.** They currently look for the wrapper by its Tailwind classes and assert a class on `main`. Instead:
   - render the app through a router with a stub route and check that the route's content appears inside `main`;
   - check the order: header, then `main`, then footer.
   The sticky footer cannot be proved in a unit test - it is covered by the e2e spec below.
4. **Add the end-to-end spec.** This pull request puts the shell on every route, so it is user-facing: a happy-path Playwright spec is required. It is also the first real spec in the repository, so the same pull request makes `yarn e2e` runnable - see `AGENTS.md` §4.6 for exactly what that means (`webServer` and `baseURL` in `playwright.config.ts`, and the CI job switched on).
5. **Describe the pull request properly.** Under Changes, list the decisions and the deviations: the catch-all route instead of the route list, the footer border colour change that a reviewer asked for, and what you verified, with commands and results.

# Files to create / modify

```
src/root.tsx                    # modify - done in #27, re-check after merging main
src/root.test.tsx               # rewrite the assertions
src/routes.ts                   # modify - done in #27
src/pages/$.tsx                 # new - done in #27
src/pages/$.test.tsx            # new - done in #27
e2e/layout/layout.spec.ts       # new
playwright.config.ts            # modify - webServer and baseURL
.github/workflows/...           # modify - enable the e2e job
```

`PromotionBanner.tsx`, `SurveySaturatedProgressBar.tsx` and its stories must end up identical to `main`.

# Unit test cases (BDD)

```ts
describe('root App', () => {
  describe('given any route', () => {
    it('renders the header', ...);
    it('renders the footer', ...);
    it('renders the route content inside main', ...);
    it('renders header, main and footer in that order', ...);
  });
});

describe('<NotFound /> page', () => {
  describe('when a user lands on an unknown route', () => {
    it('renders the Error404 component', ...);
  });
});
```

# End-to-end cases (Gherkin)

```gherkin
Feature: Application shell

  Scenario: The shell is on the home page
    Given a user opens the home page
    Then they see the header navigation
    And they see the footer

  Scenario: The footer stays at the bottom of a short page
    Given a user opens a page whose content is shorter than the window
    Then the footer ends at the bottom of the window

  Scenario: An unknown address shows the not-found page inside the shell
    Given a user opens an address that does not exist
    Then they see the not-found page
    And they still see the header navigation and the footer
```

# Out of scope

- Page components for `/quizzes`, `/debates`, `/terms`, `/privacy` and `/about` - each comes with its own task.
- The content of the home page - [HomePage](https://github.com/gi-org-pl/mypolitics-app/issues/16).
- Any change to `Header`, `Footer` or `Error404` beyond the named export and the border colour already in #27.

# Remember about standards

- Use the standard colors palette, never add colors directly (check https://tailwindcss.com/docs/colors and our color palette in the `src/index.css` file and in [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css))
- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)
- Keep working on the branch `layout-wrapper`, so the pull request and its review history stay. If the work is ever restarted on a new branch, name it `feature/layout-10`, following [Conventional Branch](https://conventional-branch.github.io/)
- Read `AGENTS.md` in the repository before continuing - it was extended after this pull request was opened
- Commit only files that belong to the task; each commit message says what changed, following Conventional Commits
- This task has no Storybook story: it adds no component

# Dependencies

- `Header` - done ([#9](https://github.com/gi-org-pl/mypolitics-app/issues/9))
- `Footer` - done ([#8](https://github.com/gi-org-pl/mypolitics-app/issues/8))
- `Error404` - done ([#7](https://github.com/gi-org-pl/mypolitics-app/issues/7))

# Resources

- [Pull request #27](https://github.com/gi-org-pl/mypolitics-app/pull/27) - the work so far and its reviews
- [Figma - Layout wrapper frame](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=4236-56053)
- [React Router - file route conventions, catch-all route](https://reactrouter.com/how-to/file-route-conventions#catch-all-route)
- [Playwright - web server](https://playwright.dev/docs/test-webserver)
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Vitest docs](https://vitest.dev/guide/)

# Definition of Done

- [ ] `main` merged into the branch; build, lint and tests pass on the merged result
- [ ] `Header` and `Footer` are rendered in `root.tsx` inside the i18n provider; no separate `Layout` component
- [ ] Unknown addresses render `Error404` through `src/pages/$.tsx`; `routes.ts` still uses `flatRoutes`
- [ ] The shell adds no spacing around the route content
- [ ] `PromotionBanner` and `SurveySaturatedProgressBar` files are identical to `main`
- [ ] `root` tests assert rendered structure and order, with no class-name selectors
- [ ] Unit tests BDD style, coverage ≥95% on changed files
- [ ] Playwright spec `e2e/layout/layout.spec.ts` covers the three scenarios and passes with `yarn e2e` alone, locally and in CI
- [ ] Biome lint clean
- [ ] TypeScript clean (no `any`, no `@ts-ignore`)
- [ ] PR description lists decisions, deviations and verification
- [ ] CI green: build, lint, test, e2e
