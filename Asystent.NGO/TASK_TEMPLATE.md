# Story
As a user...

## Differences between design and final effect

- Please use Athena's components if possible
- NGO Manager design isn't fully aligned with the Athena design. If an external component (like Button) is different than the one in the design, please keep it as it in Athena. Do not adjust external components for the design.
- Colors may be different. Please use the closest one you can find until we adjust the NGO Manager design for our new color palette

## Component properties

## Assets

## How to init the component?

1. Create the [ComponentName] component in the [DomainName] domain (components/Domain/Component)
2. Adjust component structure to [[the standard](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)
3. Add unit tests and storybook stories

## Remember about standards
- Use the standard colors palette, never add colors directly (check https://tailwindcss.com/docs/colors and our color palette in the `src/index.css` file)
- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Create a Storybook story for the component with all possible props variants of the component
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)

## Resources
- [Figma project link](https://www.figma.com/design/wtEn2r9S9s4rzq1teIXeE9/asystent-ngo?node-id=0-1&t=ZutmUh0Dly1Plmh2-1)
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Storybook docs](https://storybook.js.org/docs/writing-stories)
- [Tailwind docs](https://tailwindcss.com/docs/)
- [Vitest docs](https://vitest.dev/guide/)
