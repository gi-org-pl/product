# Results configuration

> One list per quiz that says which modules its result shows, where, and what each is pointed at.

**Decision:** **⚪ idea**

## Context
The old app drew every quiz's result from code. Each quiz had a page of its own, written by hand: which charts it shows, in which column, under which titles, and which orientations feed them. A new quiz meant a new page, and the editor could not touch any of it.

The [result modules](./modules/README.md) were built to end that. Each is a frame around the same bar and takes orientations, whatever they are. What is still missing is the part that says, for one quiz, which of them to draw.

- **One list per quiz** - a result is a list of modules. The list is part of the quiz, next to its questions, orientations and axes.
- **One shape for every module** - a header, a ranking and a map are described by the same record. A module reads the fields it needs and leaves the rest.
- **Pointing, not copying** - a module names orientations and axes by identifier. Their names, images, colours and descriptions stay where they are, on the orientation.
- **Layout is in the list** - the order of the modules and the column each stands in are two fields of the same record.

## Opportunity
- **A result without a developer** - an author composes the result in the editor, the same way they write questions.
- **One editor form** - one record shape means one form, with fields that switch on and off by module type, instead of a form per chart.
- **Old quizzes come over** - [migration](../../../platform/quiz-migration.md) says every migrated quiz needs its result composed by hand. With a structure, that is filling in a list, not writing a page.
- **New modules cost little** - a new chart is a new type that reads the same fields.

## Risk
- **The lowest common shape** - one record for everything means some fields mean nothing for some modules, and a module with needs of its own has to fit them into named slots. The map is the hard case: seventeen named positions and four colours.
- **Rules hide in the list** - "the parties of the leading identity" is behaviour, not a title. Every such rule has to become a field, or the old hard-coded page comes back through the side door.
- **Authors can compose a bad result** - a module pointed at nothing, two rankings of the same thing, a header nobody leads. The result has to stay readable when the list is poor.
- **Two halves** - the list is stored by the back-end and drawn by the app. Until the back-end serves it, the app has to carry a copy for the quizzes it knows.

## Decision
*not decided*
