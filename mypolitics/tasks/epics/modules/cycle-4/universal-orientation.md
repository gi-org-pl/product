# Story

As a user reading a quiz result, I want every party, candidate, identity, ideology and friend to arrive in the app as the same thing - an orientation - whatever quiz it comes from, so that every module can draw every quiz and nothing on my result depends on which quiz I took.

# Module properties

**Module:** the universal orientation - its types, the Zod schema of what the API sends, and the functions that read one into the other
**Location:** `src/types/orientation.ts`, `src/services/api/schemas/`, `src/services/api/utils/orientation/`, `src/utils/orientation/`
**Shared:** yes - every domain that names, scores or compares something uses it

There is **no component in this task**. It is pure TypeScript: nothing renders, nothing fetches, nothing holds state.

```ts
// src/types/orientation.ts
export type OrientationType =
  | "ideology"
  | "party"
  | "identity"
  | "compass"
  | "person" // built by the app, never sent by a quiz
  | "other"; // a type the app does not know

export interface OrientationForms {
  masculine?: string;
  feminine?: string;
}

interface OrientationBase {
  id: string;
  type: OrientationType;
  color?: string;
  description?: string;     // the text shown by default
  fullDescription?: string; // the longer text, opened on request
  slogan?: string;
  websiteUrl?: string;
  isOfficial?: boolean;     // absent = no. A moderator's mark, never the author's
  isHidden?: boolean;       // absent = no
  explanation?: string;
  linkedOrientationIds?: string[];
}

// As read from a quiz: a name and an image may still hold two forms.
export interface QuizOrientation extends OrientationBase {
  name?: string;
  nameForms?: OrientationForms;
  imageUrl?: string;
  imageUrlForms?: OrientationForms;
}

// What anything that draws receives: exactly one name and one image.
export interface Orientation extends OrientationBase {
  name?: string;
  imageUrl?: string;
}

export type DeclaredGender = "female" | "male" | "other" | "prefer_not_to_share";
```

```ts
// src/services/api/schemas/orientation.ts
// Lenient on purpose: only `id` is required. Every other field is optional and nullable,
// because the API documents `logoUrl` and `color` as always present and sends both as null and "".
export const orientationResponseSchema = z.object({ ... });
export type OrientationResponse = z.infer<typeof orientationResponseSchema>;

// src/services/api/utils/orientation/
export const readQuizOrientations = (
  response: unknown, // the `orientations` of a quiz, as sent
  options: { isOfficialQuiz: boolean },
): QuizOrientation[] => ...

export const parsePackedText = (text?: string | null): PackedText => ...
// PackedText = { kind: "absent" } | { kind: "plain"; text: string } | { kind: "packed"; value: Record<string, unknown> }

// src/utils/orientation/
export const toDisplayOrientation = (orientation: QuizOrientation, gender?: DeclaredGender): Orientation => ...
export const createPersonOrientation = (friend: PersonInput): Orientation => ...
// PersonInput = { resultId: string; name?: string; imageUrl?: string; color?: string }
export const findOrientation = <T extends { id: string }>(orientations: T[], id: string): T | undefined => ...
export const selectOrientations = <T extends OrientationBase>(orientations: T[], type?: OrientationType): T[] => ...
```

`readQuizOrientations` is the **only** place in the app that knows an API field name or packed text. Nothing past it reads `generalName`, `logoUrl` or a JSON string.

# Behaviour

The [spec](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/universal-orientation.md) is the source of truth for every case below. The [survey API docs](https://api.mypolitics.pl/api) describe the `GetOrientationResponse` it reads.

### The valid reading

One field, one property, plain words in it.

| Property | From | Reading |
|---|---|---|
| `id` | `id` | As sent |
| `type` | `type` | `IDEOLOGY`, `PARTY`, `IDENTITY`, `COMPASS` to their lower-case type; anything else, or nothing, is `other` |
| `name` | `generalName` | The text |
| `imageUrl` | `logoUrl` | The address |
| `color` | `color` | As sent |
| `description` | `description` | The text |
| `explanation` | `explanation` | As sent |
| `linkedOrientationIds` | `linkedOrientations` | As sent |
| - | `surveyId` | Not carried |

### Packed text - legacy, read for old quiz versions

Old quiz versions put a JSON object inside `generalName`, `logoUrl` and `description`. **This is not a valid format.** Nothing in the app produces it, and the list of keys below is closed - if the app needs a property the API does not send, the back-end is asked for a field. Do not add a key.

| Field | Key | Read as |
|---|---|---|
| `generalName` | `name` | `name` |
| `generalName` | `m`, `f` | `nameForms.masculine`, `nameForms.feminine` |
| `generalName` | `slogan` | `slogan` |
| `generalName` | `websiteUrl` | `websiteUrl` |
| `generalName` | `isOfficial` | `isOfficial` |
| `generalName` | `isHidden` | `isHidden` |
| `logoUrl` | `m`, `f` | `imageUrlForms.masculine`, `imageUrlForms.feminine` |
| `description` | `short` or `shortDescription` | `description` |
| `description` | `long` or `longDescription` | `fullDescription` |

- Packed text is recognised by its **content**, never by the orientation's type or by the quiz. The identity quiz packs `m` / `f` / `slogan`, the presidential quiz packs `name` / `slogan` / `websiteUrl` / `isOfficial` / `isHidden`; one reader takes both.
- Keep the reading of each property in one place, so that when the back-end adds a field for it, the field is read first and packed text stays only as the fallback for a quiz version with no value in the field.

### Choosing a form - `toDisplayOrientation`

A name and an image are chosen separately, by the same cases.

| Case | Result |
|---|---|
| No forms | `name` / `imageUrl` as they are |
| One form only | That form, for everyone |
| Two forms, gender `female` | The feminine form |
| Two forms, gender `male` | The masculine form |
| Two forms, gender `other`, `prefer_not_to_share` or not passed | The masculine form |

The gender passed is the one declared by the person **the result belongs to**, never the friend's. The function is pure, so a declaration that arrives later is simply a second call.

### The other side as a person - `createPersonOrientation`

| Property | Value |
|---|---|
| `id` | The friend's result identifier |
| `type` | `person` |
| `name`, `imageUrl`, `color` | What was passed, cleaned by the same rules as a quiz orientation |
| Everything else | Absent |

### Finding and selecting

| Case | Behaviour |
|---|---|
| `findOrientation` with an identifier the quiz has | That orientation - a hidden one included, with `isHidden` set |
| `findOrientation` with an identifier the quiz does not have | `undefined`. The caller drops the reference |
| `selectOrientations(list)` | Every orientation that is not hidden, in the quiz's order |
| `selectOrientations(list, type)` | The same, of that type only |
| Every orientation of the type is hidden | An empty list |

### Invalid and edge input

Nothing here throws, and one bad orientation never costs the quiz its others - read the list item by item, never with one all-or-nothing parse.

| Input | Behaviour |
|---|---|
| The list is missing, empty or not a list | `[]` |
| An item without an `id` | Dropped |
| Two items with the same `id` | The first is kept |
| `type` missing or unknown | `other` |
| The API sends the type `person` | `other` |
| The order of the list | Kept |
| Text with space or line breaks around it | Trimmed |
| Text that is missing, empty or only space | Absent |
| Text that is valid JSON but not an object - a name like `"2050"` | Plain text, as written |
| Packed text with raw line breaks inside its values | Read as if they were escaped. Live data has it: every identity description of quiz `2b5c1d4d-5e3b-4fae-b86d-9be400fc6de8` |
| Text that opens like packed text and still does not parse | Absent. Broken machine text is never shown |
| Packed text with keys not in the table | Ignored |
| A packed value of the wrong sort - a number for a name, text for `isOfficial` | Absent, or `false` |
| Packed name with one form | That form only |
| Packed name with forms and a `name` | The forms. `name` is ignored |
| Packed name with no form and no `name` | No name. `slogan`, `websiteUrl` and the marks are still read |
| Both `short` and `shortDescription`, or both `long` and `longDescription` | The shorter key |
| Packed description with only a long one | `fullDescription` and no `description` |
| `isOfficial` when `isOfficialQuiz` is `false` | `false`. The text is the author's, and the mark is not theirs to give |
| Image or website that is not an `http` / `https` address | Absent |
| Colour missing, or not a colour | Absent |
| Colour that is white (`#FFF`, `#FFFFFF`, any case) | Absent. Quizzes in use store white for "not set" |
| `linkedOrientations` missing or not a list | `[]` |
| A link to an identifier the quiz does not have, or to itself | Dropped |
| The same link twice | Kept once |

# Out of scope

- **Fetching a quiz.** There is no API client in the app yet. This task reads a list it is handed; the Axios client, the survey schema and the `lang` parameter belong to the quiz loading task. A quiz fetched again in another language is simply read again.
- **Changing any component.** The result modules keep their current types here and move to `Orientation` in the follow-up task, `UniversalOrientation: one type and one term in the result modules`.
- **Scoring** - turning a result's `points` and `maxPossible` into a value.
- **Axes**, their schema and their packed names.
- **Not drawing a hidden orientation an author pointed a module at** - the result screen, which does not exist yet.
- **New API fields.** Asking the back-end for them is not this task. The reading is only built so that a field is a small addition.

# Files to create

```
src/types/orientation.ts
src/services/api/schemas/orientation.ts
src/services/api/schemas/orientation.test.ts
src/services/api/utils/orientation/
├── readQuizOrientations.ts          # the list: item by item, duplicates, links
├── readQuizOrientations.test.ts
├── toQuizOrientation.ts             # one item: valid reading, then the legacy fallback
├── toQuizOrientation.test.ts
├── parsePackedText.ts               # plain / packed / absent, tolerant of raw line breaks
└── parsePackedText.test.ts
src/utils/orientation/
├── toDisplayOrientation.ts
├── toDisplayOrientation.test.ts
├── createPersonOrientation.ts
├── createPersonOrientation.test.ts
├── findOrientation.ts
├── findOrientation.test.ts
├── selectOrientations.ts
└── selectOrientations.test.ts
src/utils/url/
├── toWebAddress.ts                  # an http/https address, or undefined
└── toWebAddress.test.ts
```

Reuse `getSafeColor` from `src/utils/color/` for the colour check and add the white rule on top of it in the reading - do not change what `getSafeColor` returns for the components that already use it. Split further only if a file gets hard to read; no empty files.

# Unit test cases (BDD)

```ts
describe('parsePackedText()', () => {
  describe('given plain words', () => {
    it('returns them as plain text, trimmed', ...);
  });
  describe('given missing, empty or blank text', () => {
    it('returns absent', ...);
  });
  describe('given a JSON object', () => {
    it('returns it as packed', ...);
  });
  describe('given valid JSON that is not an object', () => {
    it('returns "2050", "true" and "null" as plain text', ...);
  });
  describe('given packed text with raw line breaks inside its values', () => {
    it('reads it and keeps the line breaks in the value', ...);
    it('still reads pretty-printed packed text with line breaks between its keys', ...);
  });
  describe('given text that opens like packed text and does not parse', () => {
    it('returns absent', ...);
  });
});

describe('toQuizOrientation()', () => {
  describe('given plain fields', () => {
    it('maps id, generalName, logoUrl, color, description and explanation', ...);
    it('does not carry surveyId', ...);
  });
  describe('type', () => {
    it('maps the four API types to their lower-case type', ...);
    it('maps a missing or unknown type to other', ...);
    it('maps a sent "person" to other', ...);
  });
  describe('given a packed name with forms', () => {
    it('reads m and f as the two forms and slogan as the slogan', ...);
    it('keeps a single form as the only form', ...);
    it('ignores name when a form is present', ...);
  });
  describe('given a packed name without forms', () => {
    it('reads name, slogan, websiteUrl, isOfficial and isHidden', ...);
    it('has no name when neither a form nor name is present, and still reads the rest', ...);
    it('treats an empty slogan as absent', ...);
  });
  describe('given a packed image', () => {
    it('reads m and f as the two image forms', ...);
    it('trims a form that ends with a line break', ...);
  });
  describe('given a packed description', () => {
    it('reads short and long', ...);
    it('reads shortDescription and longDescription', ...);
    it('prefers the shorter key when both spellings are present', ...);
    it('has a full description and no description when only long is present', ...);
  });
  describe('given packed text on any type', () => {
    it('reads a packed name on an identity, a party and an ideology alike', ...);
    it('ignores keys it does not know', ...);
    it('treats a value of the wrong sort as absent, and as false for a mark', ...);
  });
  describe('official', () => {
    it('keeps the mark in an official quiz', ...);
    it('drops the mark in a community quiz', ...);
  });
  describe('image and website', () => {
    it('drops an address that is not http or https', ...);
    it('treats null and "" as absent', ...);
  });
  describe('colour', () => {
    it('keeps a valid colour', ...);
    it('drops a missing or invalid colour', ...);
    it('drops white in any spelling', ...);
  });
});

describe('readQuizOrientations()', () => {
  describe('given something that is not a list', () => {
    it('returns an empty list', ...);
  });
  describe('given a list', () => {
    it('keeps the order it was sent in', ...);
    it('drops an item without an id and keeps the others', ...);
    it('keeps the first of two items with the same id', ...);
    it('never throws on a malformed item', ...);
  });
  describe('linked orientations', () => {
    it('keeps a link to an orientation of the same quiz', ...);
    it('drops a link to an unknown id and a link to itself', ...);
    it('keeps a repeated link once', ...);
    it('returns an empty list when the field is missing or not a list', ...);
  });
  describe('given the live shapes', () => {
    it('reads an identity of the identity quiz', ...);
    it('reads a candidate of the presidential quiz', ...);
    it('reads an identity of the presidential quiz', ...);
  });
});

describe('toDisplayOrientation()', () => {
  describe('given no forms', () => {
    it('returns the name and the image as they are', ...);
  });
  describe('given one form', () => {
    it('uses it for every gender', ...);
  });
  describe('given two forms', () => {
    it('uses the feminine form for female', ...);
    it('uses the masculine form for male', ...);
    it('uses the masculine form for other, prefer_not_to_share and undefined', ...);
    it('chooses the name and the image independently', ...);
  });
  it('carries every other property unchanged and leaves no forms on the result', ...);
});

describe('createPersonOrientation()', () => {
  it('uses the result identifier as the id and person as the type', ...);
  it('cleans the name, the image and the colour by the same rules', ...);
  it('leaves everything else absent', ...);
});

describe('findOrientation()', () => {
  it('returns the orientation with the id', ...);
  it('returns a hidden orientation, marked hidden', ...);
  it('returns undefined for an unknown id', ...);
});

describe('selectOrientations()', () => {
  it('leaves hidden orientations out', ...);
  it('returns only the given type when one is passed', ...);
  it('keeps the order of the quiz', ...);
  it('returns an empty list when every orientation of the type is hidden', ...);
});
```

Build the "live shapes" fixtures from real responses of `GET https://api.mypolitics.pl/api/v1/survey/{id}`: the identity quiz `60beb898-a4e4-4160-88c4-07a9931ab499` and the presidential quiz `270f6c12-6551-4661-bfcf-52635a703928`. Keep them small - two or three orientations each, in a fixture file next to the test.

# Remember about standards

- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Validate what the API sends with Zod and derive the response type from the schema - but leniently and per item, as described above
- No new dependency. `JSON.parse` and Zod are enough
- No Storybook story - there is no component
- No user-visible strings are added, so nothing goes through Lingui
- Name the branch `feature/universal-orientation-85`, following [Conventional Branch](https://conventional-branch.github.io/) - never keep a generated or default branch name
- The PR follows the repository's pull request template: Changes, How to test, Checklist

# Dependencies

Nothing blocks this task.

It blocks `UniversalOrientation: one type and one term in the result modules` (#86), which moves every module to the `Orientation` type created here.

# Resources

- [Spec - Universal orientation](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/universal-orientation.md) - every case, in full
- [Docs - Result modules](https://github.com/gi-org-pl/product/blob/main/mypolitics/docs/modules/quiz/results/modules/README.md) - why every entity with points is an orientation
- [Survey API docs](https://api.mypolitics.pl/api) - `GetOrientationResponse` and `GET /api/v1/survey/{id}`
- Legacy readers this replaces, one per quiz: [candidates of the presidential quiz](https://github.com/gi-org-pl/mypolitics-app-legacy/blob/develop/frontend/src/components/Results/ModernResults/Quizzes/Prezydencki2025/utils/candidates/mapOrientationToCandidate.ts), [identities of the presidential quiz](https://github.com/gi-org-pl/mypolitics-app-legacy/blob/develop/frontend/src/components/Results/ModernResults/Quizzes/Prezydencki2025/utils/identities/mapOrientationToIdentity.ts), [identities of the identity quiz](https://github.com/gi-org-pl/mypolitics-app-legacy/blob/develop/frontend/src/components/Results/ModernResults/Quizzes/IdentityQuizResults/utils/identities/mapOrientationToIdentity.ts)
- [Front-end standards](https://github.com/Generacja-Innowacja/gi-tech-standards/tree/main/docs/frontend)
- [Vitest docs](https://vitest.dev/guide/)
- [Zod docs](https://zod.dev/)

# Definition of Done

- [ ] Code follows folder structure (`docs/frontend/conventions/PROJECT_STRUCTURE.md`)
- [ ] Naming follows `docs/frontend/conventions/NAMING.md`
- [ ] `Orientation`, `QuizOrientation`, `OrientationType` and `DeclaredGender` live in `src/types/orientation.ts`
- [ ] `readQuizOrientations` is the only code that names an API field or parses packed text
- [ ] The valid reading and the legacy packed reading both follow the tables above; no key outside the table is read
- [ ] Packed text with raw line breaks is read; anything still broken is absent
- [ ] An official mark is kept only when `isOfficialQuiz` is true
- [ ] White, invalid and missing colours are absent; images and websites that are not web addresses are absent
- [ ] Links to unknown ids, to itself and repeated links are cleaned
- [ ] A malformed item is dropped without throwing and without losing the rest of the list
- [ ] `toDisplayOrientation` chooses the form by the declared gender and returns exactly one name and one image
- [ ] `createPersonOrientation`, `findOrientation` and `selectOrientations` behave as in the tables; `selectOrientations` never returns a hidden orientation
- [ ] The live-shape fixtures of the identity quiz and the presidential quiz are read correctly
- [ ] Unit tests added, BDD style, coverage ≥95% on all new files
- [ ] Biome lint clean
- [ ] TypeScript clean (no `any`, no `@ts-ignore`)
- [ ] CI green: build, lint, test
