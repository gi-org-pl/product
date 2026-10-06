# Task template

> The required shape of every developer task.

## The template

```markdown
# Story
As a user...

# Component properties


# Remember about standards
- Use the standard colors palette, never add colors directly (check https://tailwindcss.com/docs/colors and our color palette in the `src/index.css` file and in [athena](https://github.com/gi-org-pl/athena/blob/main/src/index.css))
- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Create a Storybook story for the component with all possible props variants of the component
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)
- Name the branch `{type}/{task-name}-{issue number}`, following [Conventional Branch](https://conventional-branch.github.io/) - never keep a generated or default branch name

# Resources
- [Legacy repo link](https://github.com/gi-org-pl/mypolitics-app-legacy/tree/main/frontend)
- [Figma project link](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=1190-9207&t=k6GtQ4k9HtLFKbnM-1)
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Storybook docs](https://storybook.js.org/docs/writing-stories)
- [Tailwind docs](https://tailwindcss.com/docs/)
- [Vitest docs](https://vitest.dev/guide/)
```

## Branch name
Every task names the branch its work is done on, so the branch can be traced to its issue and reads the same whoever, or whatever, opens it.

- **Shape** - `{type}/{task-name}-{issue number}`, as in `feature/universal-axis-60`.
- **Type** - `feature` for new work, `bugfix` for a fix, `hotfix` for an urgent fix, `chore` for work that changes no behaviour.
- **Task name** - the task's file name: lowercase, words joined with hyphens, no other characters.
- **Issue number** - the number of the GitHub issue the task is published as. It exists only after publishing, so it is filled in then.
