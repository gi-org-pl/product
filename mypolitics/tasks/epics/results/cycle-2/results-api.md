# Story

As a user opening my result, I want the app to read everything my result holds and to know which modules my quiz's result is made of, so that the result screen has what it needs to draw.

# Module properties

**Module:** the result as read from the API, and the app's own lists of result modules for the quizzes it knows
**Location:** `src/services/api/schemas/result.ts`, `src/services/api/utils/result/`, `src/services/api/client/getResult.ts`, `src/types/survey.ts`, `src/constants/`, `src/services/api/utils/survey/readSurvey.ts`
**Shared:** yes - the result screen and comparison read a result through it

There is **no component in this task**.

```ts
// src/types/survey.ts - SurveyResult grows; what it has today stays
export interface SurveyResult {
  id: string;
  isCalculated: boolean;
  surveyId?: string; // the survey the result was handed in for
  scores: Record<string, ScoreTotal>; // by orientation identifier; empty until calculated
  answers: ResultAnswer[]; // as handed in
}
```

`QuizResult` (`scores` and `answers`) of the resolution task is a part of `SurveyResult`, so a read result is passed to `resolveResult` as it is.

# Behaviour

The [results screen spec](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/results-screen.md) is the source of truth: its sections "Data" and "The app's own lists". The [survey API docs](https://api.mypolitics.pl/api) describe `GetResultResponse`.

### Reading a result - `GET /v1/result/{identifier}`

| Property | From | Reading |
|---|---|---|
| `surveyId` | `surveyId` | As sent |
| `isCalculated` | `results` | As today: true when `results` holds a list of orientations |
| `scores` | `results.orientations[]` | By `id`: `points` as points, `maxPossible` as maximum |
| `answers` | `answers[]` | `questionId` and `answerId`, as sent |

`results` arrives as an object or as the text of one, as the schema already allows.

### Invalid and edge input

One bad item never costs the result its others: read the lists item by item.

| Input | Behaviour |
|---|---|
| `results` is null or missing | Not calculated; `scores` is `{}` |
| An orientation item without an `id`, or whose `points` or `maxPossible` is not a finite number | Dropped |
| Negative `points` or `maxPossible` | Read as 0 |
| The same orientation twice | The first is kept |
| `answers` missing or not a list | `[]` |
| An answer without a `questionId` or an `answerId` | Dropped |
| `surveyId` missing or blank | Absent |

### The app's own lists

The API sends no `resultModules` yet. The app keeps a list for the two quizzes it knows, written exactly as the API would send it, except that a text is held per language:

- The lists are data, in `src/constants/` - one constant keyed by survey identifier. Their content is given in the issue's attachment below and must be committed as it is: the identifiers are the live ones.
- `readSurvey` uses the survey's own list when the API's list is missing or empty, and reads it with the same `readResultModules`, so one reader and one set of rules serve both.
- A text of an own list is taken in the language the survey was asked for, falling back to Polish.
- A survey the app has no list for keeps `resultModules: []`.

| Survey | Identifier |
|---|---|
| myPolitics Quiz Tożsamościowy | `60beb898-a4e4-4160-88c4-07a9931ab499` |
| Barometr Prezydencki 2025 | `270f6c12-6551-4661-bfcf-52635a703928` |

<details>
<summary>The two lists</summary>

```json
{
  "60beb898-a4e4-4160-88c4-07a9931ab499": [
    {
      "id": "identity-header",
      "type": "header",
      "position": 0,
      "orientationIds": [
        "f108a0b0-1ac7-4111-88cb-a4bbfe7f059b",
        "99681a0e-6851-4967-8fcc-cf77ac4717a5",
        "14fc7ded-e9c0-447c-aa18-380d7241be00",
        "5f733105-050f-4d65-8d1c-5f387212ea0b",
        "296019ab-8963-4590-896e-51426517d11b",
        "90e1762d-9e22-4f32-8130-e7828595ea1f",
        "6f1cb5a4-232a-41b5-a848-f2329406d12d",
        "59d45ff8-6e4c-47b8-895e-1846a2d0fe94",
        "322b9b00-b131-4d8b-9eb5-c38ba552dc93",
        "4cf08882-e9f9-4f5d-a27c-eac3f24e3a77",
        "8625fa1f-e39e-4183-8a37-5d78fa6c3c85",
        "4a1c3bef-42fc-49d2-b8c7-279a446aa9e3",
        "a6ef4109-7141-4b0b-9924-b87a700d90b5",
        "2e46f89d-913e-4d82-85a6-70a8c25902f5",
        "010a5a3d-0729-4315-b231-c9dd081d0d55"
      ],
      "axisIds": [],
      "values": []
    },
    {
      "id": "identity-archetype",
      "type": "archetype",
      "position": 1,
      "column": "end",
      "orientationIds": [
        "f108a0b0-1ac7-4111-88cb-a4bbfe7f059b",
        "99681a0e-6851-4967-8fcc-cf77ac4717a5",
        "14fc7ded-e9c0-447c-aa18-380d7241be00",
        "5f733105-050f-4d65-8d1c-5f387212ea0b",
        "296019ab-8963-4590-896e-51426517d11b",
        "90e1762d-9e22-4f32-8130-e7828595ea1f",
        "6f1cb5a4-232a-41b5-a848-f2329406d12d",
        "59d45ff8-6e4c-47b8-895e-1846a2d0fe94",
        "322b9b00-b131-4d8b-9eb5-c38ba552dc93",
        "4cf08882-e9f9-4f5d-a27c-eac3f24e3a77",
        "8625fa1f-e39e-4183-8a37-5d78fa6c3c85",
        "4a1c3bef-42fc-49d2-b8c7-279a446aa9e3",
        "a6ef4109-7141-4b0b-9924-b87a700d90b5",
        "2e46f89d-913e-4d82-85a6-70a8c25902f5",
        "010a5a3d-0729-4315-b231-c9dd081d0d55"
      ],
      "axisIds": [],
      "values": [
        {
          "key": "title",
          "value": {
            "pl": "Tożsamość",
            "en": "Identity"
          }
        }
      ]
    },
    {
      "id": "identity-ideologies",
      "type": "multi_axis",
      "position": 2,
      "column": "start",
      "axisIds": [
        "6c2611c8-2989-48a9-ab9f-dbf45dbb3496",
        "c4b9c12a-96e5-4b8a-88ea-0a0b262b13d0",
        "fe9a1d36-e127-4aee-bd88-a5638415ecc2",
        "10e3dd16-08a4-45de-90af-2a1dcda7177b",
        "5bee0f10-a7d2-43ee-a731-384c2e68067a",
        "5b50de95-3b38-414f-aa17-f2e1dc88bac8",
        "34986b5c-5f60-407e-86e1-537b70a133da",
        "21103775-2988-41a6-97e8-d6e955d915d6",
        "8994da07-5c80-475f-9aca-cff8b519a1a2",
        "25233c46-e0d3-4288-ac4f-bae8b9dcda8f",
        "99ac7fae-050b-4847-91f9-fb2e7d83ff72",
        "400ac069-425a-42dd-838f-083adef98f2b",
        "841d9884-aedd-48ad-ac5b-bc59109efcc9",
        "32460d47-dca9-4029-baa7-ad3c45740680",
        "94e03d6a-562a-4f7f-ba67-01a1ac41effa",
        "c1ffca92-311c-4f09-b41e-81f5961198e4"
      ],
      "orientationIds": [],
      "values": [
        {
          "key": "title",
          "value": {
            "pl": "Ideologie",
            "en": "Ideologies"
          }
        },
        {
          "key": "groupBy",
          "value": "category"
        }
      ]
    },
    {
      "id": "identity-compass",
      "type": "nolan_chart",
      "position": 3,
      "column": "end",
      "axisIds": [
        "8bd5f826-1aed-409b-8a6e-da4a76189c03",
        "092ea01d-2d31-4ee2-ae30-deffa1c7c096"
      ],
      "orientationIds": [],
      "values": [
        {
          "key": "description",
          "value": {
            "pl": "Kompas dwuosiowy to forma prezentacji Twoich poglądów na wykresie dwuosiowym. Oś pozioma to poglądy gospodarcze (lewica-prawica), a pionowa to poglądy obyczajowe (lewica na dole, prawica na górze).",
            "en": "The compass shows your views on two axes. The horizontal one is economic views (left to right), the vertical one is social views (left at the bottom, right at the top)."
          }
        },
        {
          "key": "label.centre",
          "value": {
            "pl": "Centrowy",
            "en": "Centrist"
          }
        },
        {
          "key": "label.horizontalStartModerate",
          "value": {
            "pl": "Lewicowy gospodarczo",
            "en": "Economically left-wing"
          }
        },
        {
          "key": "label.horizontalStartExtreme",
          "value": {
            "pl": "Lewicowy gospodarczo",
            "en": "Economically left-wing"
          }
        },
        {
          "key": "label.horizontalEndModerate",
          "value": {
            "pl": "Prawicowy gospodarczo",
            "en": "Economically right-wing"
          }
        },
        {
          "key": "label.horizontalEndExtreme",
          "value": {
            "pl": "Prawicowy gospodarczo",
            "en": "Economically right-wing"
          }
        },
        {
          "key": "label.verticalStartModerate",
          "value": {
            "pl": "Lewicowy światopoglądowo",
            "en": "Socially left-wing"
          }
        },
        {
          "key": "label.verticalStartExtreme",
          "value": {
            "pl": "Lewicowy światopoglądowo",
            "en": "Socially left-wing"
          }
        },
        {
          "key": "label.verticalEndModerate",
          "value": {
            "pl": "Prawicowy światopoglądowo",
            "en": "Socially right-wing"
          }
        },
        {
          "key": "label.verticalEndExtreme",
          "value": {
            "pl": "Prawicowy światopoglądowo",
            "en": "Socially right-wing"
          }
        },
        {
          "key": "label.bottomLeftModerate",
          "value": {
            "pl": "Lewicowy",
            "en": "Left-wing"
          }
        },
        {
          "key": "label.bottomLeftExtreme",
          "value": {
            "pl": "Lewicowy",
            "en": "Left-wing"
          }
        },
        {
          "key": "label.topRightModerate",
          "value": {
            "pl": "Prawicowy",
            "en": "Right-wing"
          }
        },
        {
          "key": "label.topRightExtreme",
          "value": {
            "pl": "Prawicowy",
            "en": "Right-wing"
          }
        },
        {
          "key": "label.topLeftModerate",
          "value": {
            "pl": "Mieszany",
            "en": "Mixed"
          }
        },
        {
          "key": "label.topLeftExtreme",
          "value": {
            "pl": "Mieszany",
            "en": "Mixed"
          }
        },
        {
          "key": "label.bottomRightModerate",
          "value": {
            "pl": "Mieszany",
            "en": "Mixed"
          }
        },
        {
          "key": "label.bottomRightExtreme",
          "value": {
            "pl": "Mieszany",
            "en": "Mixed"
          }
        }
      ]
    },
    {
      "id": "identity-parties",
      "type": "horizontal_bar",
      "position": 4,
      "column": "start",
      "orientationIds": [
        "a3356612-5554-4510-a867-71b03bc63980",
        "c00d6c51-7ab2-450d-b779-8a01ab269965",
        "fa5274b9-3b9f-4d54-a07f-fe96bb65b2a9",
        "cd7c4031-81a4-4a93-aa04-a66651f10b8a",
        "6a2f8e53-1573-4257-b0eb-1806e3fe137a",
        "2d2b6c42-a704-4276-b88a-53b8f712456d",
        "2cd6fdd2-4144-4eb9-873e-ef6316b8f9c2",
        "044d38fe-a589-4240-9f66-1ae728f757a4",
        "6a890e5e-7137-4e8c-a7ba-a140b639d71e",
        "09d0f391-236c-4de2-860a-d86b023214b3",
        "9d67d502-a832-489e-aa5d-af8ef69b72aa"
      ],
      "axisIds": [],
      "values": [
        {
          "key": "title",
          "value": {
            "pl": "Partie",
            "en": "Parties"
          }
        },
        {
          "key": "description",
          "value": {
            "pl": "W quizie tożsamościowym nie dopasowujemy partii do Twoich wyników według odpowiedzi. Zamiast tego najpierw określamy najbliższą tożsamość, a później to, jak ta tożsamość prawdopodobnie zagłosowałaby w wyborach.",
            "en": "The identity quiz does not match parties to your answers. It first finds your closest identity, and then how that identity would probably vote."
          }
        },
        {
          "key": "selection",
          "value": "linked_to_leader"
        }
      ]
    }
  ],
  "270f6c12-6551-4661-bfcf-52635a703928": [
    {
      "id": "presidential-header",
      "type": "header",
      "position": 0,
      "orientationIds": [
        "50208528-a7de-4d9a-ba99-529ad8b85776",
        "565946a2-6622-4fb6-8eee-196408544e9a",
        "2f6058b0-ec60-435f-aa9a-31bfac23f586",
        "041b4896-272f-48fe-9def-c174756819d4",
        "761060bd-3e76-4ec5-80f4-30114cad8d0a",
        "a20ecba3-a899-41c8-87f5-1ca60996d763",
        "8eba6169-c6de-41d7-bcf2-1c9be62bafea",
        "a837818f-df74-4156-a370-44e01d98a3cf",
        "beedd58a-3d5d-4e4c-acc2-2c564d196fa0",
        "848ae1af-a051-41f8-949b-b8c587726216",
        "d7e8404f-25f1-460e-a37c-f58aa3aab2a8",
        "538434a9-dfed-4680-be7d-01eadfcb27fe",
        "176a1292-3630-4d2d-ae5f-f703de6dff51"
      ],
      "axisIds": [],
      "values": [
        {
          "key": "label.link",
          "value": {
            "pl": "Program",
            "en": "Programme"
          }
        }
      ]
    },
    {
      "id": "presidential-candidates",
      "type": "horizontal_bar",
      "position": 1,
      "column": "start",
      "orientationIds": [
        "50208528-a7de-4d9a-ba99-529ad8b85776",
        "565946a2-6622-4fb6-8eee-196408544e9a",
        "2f6058b0-ec60-435f-aa9a-31bfac23f586",
        "041b4896-272f-48fe-9def-c174756819d4",
        "761060bd-3e76-4ec5-80f4-30114cad8d0a",
        "a20ecba3-a899-41c8-87f5-1ca60996d763",
        "8eba6169-c6de-41d7-bcf2-1c9be62bafea",
        "a837818f-df74-4156-a370-44e01d98a3cf",
        "beedd58a-3d5d-4e4c-acc2-2c564d196fa0",
        "848ae1af-a051-41f8-949b-b8c587726216",
        "d7e8404f-25f1-460e-a37c-f58aa3aab2a8",
        "538434a9-dfed-4680-be7d-01eadfcb27fe",
        "176a1292-3630-4d2d-ae5f-f703de6dff51"
      ],
      "axisIds": [],
      "values": [
        {
          "key": "title",
          "value": {
            "pl": "Kandydaci",
            "en": "Candidates"
          }
        },
        {
          "key": "visibleRows",
          "value": 13
        }
      ]
    },
    {
      "id": "presidential-identity",
      "type": "archetype",
      "position": 2,
      "column": "end",
      "orientationIds": [
        "1f412f57-341b-42c5-a2cd-bfcc9a1bb420",
        "6f24ac8d-6ef8-427f-8fda-67c073eb6f39",
        "d928f20a-6003-40af-a329-e15e8c69483e",
        "0422c15e-5de5-424a-b024-ba5525403581",
        "8eaec33a-c2ac-4422-8933-a46cdc7eef2d",
        "f1c4f09c-e7bc-45e0-b9d6-b7bc5309eec5",
        "37b2a278-a43e-46ca-ba5b-52ef26b6da8d",
        "ba7240c9-3c0b-44cd-a941-45a93d1a6665",
        "c28e9896-ff92-4881-a650-0e7f828ec381",
        "a309edcc-327c-40ae-8ce7-a7528619a3c1"
      ],
      "axisIds": [],
      "values": [
        {
          "key": "title",
          "value": {
            "pl": "Prezydent",
            "en": "President"
          }
        }
      ]
    },
    {
      "id": "presidential-categories",
      "type": "horizontal_bar",
      "position": 3,
      "column": "end",
      "orientationIds": [
        "50208528-a7de-4d9a-ba99-529ad8b85776",
        "565946a2-6622-4fb6-8eee-196408544e9a",
        "2f6058b0-ec60-435f-aa9a-31bfac23f586",
        "041b4896-272f-48fe-9def-c174756819d4",
        "761060bd-3e76-4ec5-80f4-30114cad8d0a",
        "a20ecba3-a899-41c8-87f5-1ca60996d763",
        "8eba6169-c6de-41d7-bcf2-1c9be62bafea",
        "a837818f-df74-4156-a370-44e01d98a3cf",
        "beedd58a-3d5d-4e4c-acc2-2c564d196fa0",
        "848ae1af-a051-41f8-949b-b8c587726216",
        "d7e8404f-25f1-460e-a37c-f58aa3aab2a8",
        "538434a9-dfed-4680-be7d-01eadfcb27fe",
        "176a1292-3630-4d2d-ae5f-f703de6dff51"
      ],
      "axisIds": [],
      "values": [
        {
          "key": "title",
          "value": {
            "pl": "Kategorie",
            "en": "Categories"
          }
        },
        {
          "key": "groupBy",
          "value": "category"
        }
      ]
    }
  ]
}
```

</details>

# Out of scope

- **The result screen**, its states and its requests in sequence - the next task.
- **Sending a result** - unchanged.
- **The back-end.**

# Files to create

```
src/types/survey.ts                              (SurveyResult grows)
src/services/api/schemas/result.ts               (the orientation and answer items)
src/services/api/utils/result/...                (one function per file, each with its test)
src/constants/...                                (the own lists)
src/services/api/utils/survey/readSurvey.ts      (fall back to the own list)
```

Every place that builds a `SurveyResult` by hand gains the new fields.

# Unit test cases (BDD)

- Given a calculated result as the API sends it (object and text form), when it is read, then `surveyId`, `scores` and `answers` hold what the table says.
- Given every row of "Invalid and edge input", when the result is read, then the behaviour in that row holds.
- Given a survey with one of the two identifiers and no list from the API, when it is read, then `resultModules` is the app's own list, in the language asked for; given a list from the API, then that one wins; given any other survey, then `[]`.
- Given the own list of each quiz and the fixture of that quiz, when it is read, then no record and no identifier is dropped - the lists match their quizzes.

# Dependencies

- `result-modules-configuration` and `result-modules-resolution`.

# Remember about standards
- Create unit tests with Vitest for 100% of the code created if feasible (check our [testing convention](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/TESTING_CONVENTION.md))
- Comply with [the component structure](https://github.com/Generacja-Innowacja/gi-tech-standards/blob/main/docs/frontend/conventions/COMPONENT_STRUCTURE.md)
- Name the branch `{type}/{task-name}-{issue number}`, following [Conventional Branch](https://conventional-branch.github.io/)

# Resources
- [Spec: results screen](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/results-screen.md)
- [Spec: result modules configuration](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/result-modules-configuration.md)
- [Spec: session and data](https://github.com/gi-org-pl/product/blob/main/mypolitics/spec/quiz/session-and-data.md)
- [Legacy: the two result pages](https://github.com/gi-org-pl/mypolitics-app-legacy/tree/develop/frontend/src/components/Results/ModernResults/Quizzes), which the own lists reproduce
