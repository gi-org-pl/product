---
name: concept-to-task
description: Turn a myPolitics product doc into a reviewed spec, then into developer tasks published on GitHub - reads the doc under mypolitics/docs, reads the linked Figma frame, writes the spec under mypolitics/spec, stops for human review, and only after approval writes the task under mypolitics/tasks and publishes it as a sub-issue of its epic in gi-org-pl/mypolitics-app. Use it whenever the user wants to spec a functionality, write a spec from a doc or a Figma frame, cut a doc or spec into tasks, prepare or publish a task, ticket or issue for a myPolitics component, screen or endpoint, or move an idea "from docs to tasks" - even if they name only one of the steps.
---

# Concept to task

myPolitics moves in one direction: an idea is agreed in **docs**, specified in **spec**, then cut into **tasks**. This skill walks one functionality along that line.

```
doc + Figma  ->  spec  ->  human review  ->  task(s)  ->  GitHub issue(s)
```

The review is a hard stop, and the only one. A task is what a developer builds from, and once it is an issue the team can see it and pick it up, so a wrong call in the spec becomes wrong code. The person reviewing the spec is the last cheap place to catch it. That is why nothing after the spec is written in the same turn as the spec, and why everything after approval runs through to the published issue without asking again.

Everything lives under `mypolitics/`. The other projects in this repo have no docs or spec layer, so this pipeline does not apply to them.

## Sources of truth

The repo owns the formats. Read these every run rather than relying on memory or on the summaries here - they change, and a spec or task in last month's shape is a review comment waiting to happen.

| What | File |
|---|---|
| Spec shape and its rules | `mypolitics/conventions/spec-template.md` |
| What a spec is and where it goes | `mypolitics/spec/README.md` |
| Task shape | `mypolitics/conventions/task-template.md` |
| Task rules | `mypolitics/tasks/INSTRUCTIONS.md` |
| Front-end standards, Definition of Done | `mypolitics/tasks/CLAUDE.md` |
| Inputs a task needs | `mypolitics/tasks/PROMPT_TEMPLATE.md` |
| README shape | `mypolitics/conventions/readme-template.md` |

## Where to start

Work out which step the user is at before doing anything.

| Situation | Start at |
|---|---|
| A doc exists, no spec | Step 1 |
| A spec exists and the user wants it changed | Step 3, then the review again |
| A spec exists and is approved | Step 5 |
| A task file exists for an approved spec but has no issue | Step 6 |
| No doc exists for the functionality | Stop. A spec follows a doc and never replaces one - say so and offer to draft the doc from `conventions/idea-template.md` first |

A spec counts as approved when the user says so in this conversation, or when it is merged on `main` with no local changes - merging here goes through a reviewed pull request. If neither holds, ask.

## Step 1 - Read the docs

Find the doc under `mypolitics/docs/` (the user may give a path, a title or just a Figma link - search for it). Then read around it, because a doc rarely stands alone:

- The doc itself: Context, Opportunity, Risk, Decision.
- Every doc it links to, and the README of its folder. Neighbours define what this functionality composes and what composes it, which is most of the spec's Scope and Dependencies.
- `mypolitics/docs/concept/glossary.md` for terms, so the spec uses the product's words.
- Existing specs under `mypolitics/spec/` that it depends on, so the new spec agrees with them.

Check the **Decision** line. On 🔴 NO-GO, stop and tell the user. On ⚪ idea, carry on but say so in the review handoff - the spec is being written before the idea is formally agreed.

Read the Risk section closely. Each risk is a case the spec has to answer (a long author-written name, a value too small to show), not background.

## Step 2 - Read the Figma frame

The doc's `Design:` line links the exact frame. If the user gave a different link, use theirs and mention the mismatch.

A URL like `.../design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5500-3483` gives the node id with a hyphen. Every tool wants a colon: `5500:3483`.

**Prefer figma-bridge** (`mcp__figma-bridge__*`), which reads the file open in the Figma desktop app:

1. `list_files` first. The bridge registers the file under its own key (for example `unsaved-...`), not the key from the URL, so match on the file name `mypolitics-app` and pass the bridge's `fileKey` from then on. Using the URL key fails with "No plugin connected".
2. `get_node` on the frame for the tree: variants, text, slots, annotations.
3. `get_screenshot` on the frame, and on any child whose structure is unclear, to see what the tree describes.

**Fallback:** the claude.ai Figma tools (`mcp__claude_ai_Figma__get_design_context`, `get_screenshot`), which take the file key and node id from the URL as they are.

If neither can reach the frame, stop and tell the user (usually the bridge plugin is not running in Figma). Do not write a front-end spec from the doc alone when a design exists: the frame is where the states are, and a spec that misses states is the failure this pipeline exists to prevent. A back-end functionality with no `Design:` line skips this step.

What to take from the frame:

- **Every variant and state drawn**, with the label the designer gave it. These become rows in Behaviour and States, and later Storybook stories.
- **Designer notes** written on the canvas (thresholds, "hidden under 20%", "any component here"). They are requirements that exist nowhere else.
- **Slots and content**: what is fixed, what is passed in, what is optional.
- **Child frame ids** for groups of states, to link them individually later.

Leave pixel sizes, spacing and colour values in Figma. The spec says what happens in each case and the task tells the developer to follow the frame, so copying measurements into either only creates a second source that goes stale.

Where the doc and the frame disagree, do not silently pick one. Make the call, write it into the spec, and list it in the review handoff.

## Step 3 - Write the spec

**Path:** `mypolitics/spec/{module}/{doc-file-name}.md`. The module is one of `quiz`, `data`, `polls`, `media`, or `platform`, mirroring where the doc sits. The file is named after its doc so the two line up, and sits directly in the module folder however deep the doc is nested.

Fill in `conventions/spec-template.md` exactly, following the rules written at its top. In practice they mean:

- **Kind** decides which sections survive. Delete every section that does not apply - an empty section is worse than a missing one.
- **Cases, not code.** One row per condition with its expected behaviour. No prop names, no TypeScript, no component library choices; those belong in the task.
- **Decide, do not defer.** No "TBD", no open questions left in the file. Answer each with the best call and say what it costs. Keep a list of these calls as you go - they are what the reviewer most needs to see.
- **Invalid and edge input is not optional thinking.** Configuration and user content are author-supplied and can be wrong, so say how each bad input degrades.

The header links back to the doc and to the Figma frame. Links are relative (`../../docs/...`) because the spec is published on the site; count the `../` from the spec's own folder. For the image, reuse the asset the doc already shows from `mypolitics/assets/`. If the doc has none, export the frame with `mcp__figma-bridge__save_screenshots` to `mypolitics/assets/{doc-file-name}.png` using an absolute output path, since a relative one resolves from the bridge's own directory.

Then keep the navigation honest, because the site is built from the folders:

- Add the spec to the Contents table of `mypolitics/spec/{module}/README.md`, keeping the table alphabetical.
- If the module folder has no README yet, create one from `conventions/readme-template.md`.

If `mkdocs` is installed, run `mkdocs build` and fix any broken-link warning that names the new file.

## Step 4 - Stop for review

End the turn here. Do not start the task, and do not commit, push or open a pull request unless asked.

Give the reviewer what they need to approve quickly, without making them diff the spec against the doc themselves:

- The path of the spec.
- **Calls made** - each decision the doc and Figma did not settle, with what it costs.
- **Conflicts** - where doc and Figma disagreed and which one won.
- **Left out** - anything deliberately put out of scope and where it lives instead.
- The doc's Decision status, if it is still ⚪ idea.
- What the task step will need and cannot be inferred: **epic** and **cycle**, plus anything it blocks on. Asking now lets one reply carry both the approval and the answers. List the epics that already exist (see Step 6) so the user picks one by name, and say when a new one would be created.
- **What approval sets off**: the task gets written and published straight away as an issue in `gi-org-pl/mypolitics-app`, with no second confirmation. Say this every time, so that approving is an informed choice. If the user wants the task without the issue, they can say so here.

Then wait. "Looks good", "approved", "go ahead with the task" is approval. Comments are not: apply them, summarise what changed, and ask again. Anything ambiguous, ask.

## Step 5 - Write the task

Only after approval. Re-read the spec from disk first - the reviewer may have edited it by hand, and the file is the source of truth, not the earlier draft in this conversation.

Read the four task files from the table above, plus one or two existing tasks under `mypolitics/tasks/epics/` near this one for the level of detail expected.

**Path:** `mypolitics/tasks/epics/{epic}/cycle-{n}/{task-name}.md`, kebab-case.

**Inputs** (from `PROMPT_TEMPLATE.md`): component name, shared or not, domain, epic, cycle, blocked by, legacy files. Infer what the spec settles - a component composed by two or more domains is shared and goes to `src/components/shared/`. Ask for epic and cycle if still unknown. Legacy links apply only when the functionality existed in myPolitics 1.0; for new work leave them out rather than pointing at something unrelated.

**Split when it is too big.** One task is one reviewable pull request. A spec covering a component, the screen that uses it and its data usually means several tasks, with later ones naming what they are blocked by and landing in a later cycle.

**Shape.** `conventions/task-template.md` is the minimum: Story, Component properties, Remember about standards, Resources. Existing tasks grow these around it as needed:

| Section | Content |
|---|---|
| Story | "As a user ..." - the outcome, in the taker's terms |
| Component properties | Name, location, shared or not, and the props interface. This is where the spec's Data and Interface tables become TypeScript |
| Behaviour | The spec's cases, restated as tables. Name the spec as the source of truth for cases and the Figma frame as the source of truth for sizes, spacing and type |
| Athena components to use | Which to use, and which obvious candidate not to use and why |
| Deviation from standards | Anything that breaks `tasks/CLAUDE.md`, with a sub-task to get Technical Leader approval |
| Out of scope | What the developer should not build here, lifted from the spec's Scope |
| Files to create | The component tree, listing only files that are needed |
| Unit test cases (BDD) | `describe` / `it` skeleton in Given-When-Then, one `it` per spec case |
| Storybook stories | One per state in the Figma frame, in the frame's order. Skip for page-level components |
| Remember about standards | The template's list, plus anything specific to this task |
| Dependencies | Tasks that must land first |
| Resources | Spec, doc, Figma frame and its state sub-frames, then the standard links |
| Definition of Done | The checklist from `tasks/CLAUDE.md` section 5, cut to what applies, plus one line per behaviour group so "done" is checkable against the spec |

Rules that are easy to break:

- **No styling instructions.** No Tailwind classes, no exact sizes, no layout snippets. The developer reads Figma and decides. Say what must be true, not how to style it.
- **Use Athena where it fits.** The component list is in `INSTRUCTIONS.md`. When an Athena component looks like a fit but is not, say so explicitly, or the developer will reach for it.
- **Every spec case lands somewhere testable.** If a row of the spec has no matching test case or Definition of Done line, the task has lost a requirement.
- **Nothing new.** The task adds implementation shape (props, files, tests), never behaviour the spec does not have. If writing the task exposes a missing case, fix the spec, tell the user, and get that change approved.
- **The file is the issue.** The task file is published as the issue body as it stands, so write it to be read on GitHub. When the functionality has an image in `mypolitics/assets/`, open the file with it, above the Story, as `<img alt="{caption}" src="{raw URL}" />`.
- **Name the branch.** Follow the Branch name section of `conventions/task-template.md` and write the exact name into the task, with the type and task name filled in. The issue number does not exist yet, so leave it as the literal `{issue number}` and let Step 6 fill it. A concrete name matters because whoever picks the issue up - a developer or a coding agent - will otherwise invent one, and generated names like `claude/gracious-fermat-ixzpf8` say nothing about the work.
- **Absolute links.** Tasks are excluded from the site and are published as issues in another repo, where relative links break. Link the spec and doc as `https://github.com/gi-org-pl/product/blob/main/mypolitics/...` and the image as `https://raw.githubusercontent.com/gi-org-pl/product/main/mypolitics/assets/...`.
- **Standards are front-end only.** `tasks/CLAUDE.md` covers the front-end. For the back-end half of a spec there is no task convention in this repo yet: write the front-end tasks, and ask the user how they want the back-end work described rather than inventing a format.

## Step 6 - Publish to GitHub

Run this as soon as Step 5 is done, in the same turn, without asking. Both conditions have to hold, and each is there for a reason:

- **The spec is approved.** An issue is public to the team and may be picked up within the hour, so an unreviewed spec must never reach one. Writing the spec, or the user asking for "a spec and a task" in one message, is not approval - the review in Step 4 still comes first.
- **The task file is written.** The issue is a copy of the file, so the repo and GitHub never tell different stories.

Do not publish if the user asked for the task only, or said not to.

Issues go to `gi-org-pl/mypolitics-app`. Its shape, which the new issues must match:

| Issue | Title | Body | Labels, type |
|---|---|---|---|
| Epic | `[Epic] {Name}`, as in `[Epic] Results`, `[Epic] HomePage` | `_Please close this task only if all subtasks are finished._` | None |
| Task | The component name in PascalCase, as in `UniversalAxis` | The task file | None |

Every task is a sub-issue of its epic.

**1. Check it is not there already.** Search open and closed issues for the title:

```
gh issue list --repo gi-org-pl/mypolitics-app --state all --search '"{ComponentName}" in:title' --json number,title,state,url
```

If an issue with the same title exists, do not create a second one. Tell the user which issue it is and ask whether to update it or leave it. A duplicate is worse than a delay: two developers end up on the same work.

**2. Find the epic.**

```
gh issue list --repo gi-org-pl/mypolitics-app --state all --search '"[Epic]" in:title' --json number,title,state
```

Match the task's epic folder to an epic title ignoring case, hyphens and spaces, so `home-page` is `[Epic] HomePage`.

| Result | Do |
|---|---|
| One open epic matches | Use it |
| None matches | Create it: `gh issue create --repo gi-org-pl/mypolitics-app --title "[Epic] {Name}" --body "_Please close this task only if all subtasks are finished._"` |
| Only a closed epic matches | Ask. A closed epic was declared finished, and reopening it or starting a second one is the user's call |

**3. Create the task as a sub-issue.**

```
gh issue create --repo gi-org-pl/mypolitics-app --title "{ComponentName}" --body-file {task file} --parent {epic number}
```

Take the issue number from the URL `gh` prints, replace `{issue number}` in the task file's branch name with it, and push the file back so the issue carries the final name:

```
gh issue edit {issue number} --repo gi-org-pl/mypolitics-app --body-file {task file}
```

With several tasks, publish them in dependency order. Once a blocker has its issue, write its number into the Dependencies section of the tasks that wait on it, then publish those - so each issue names the issue it is blocked by, and the file still matches.

**4. Check the links will work.** The task links the spec, the doc and the image on `main`. Run `git fetch origin main` and check each with `git cat-file -e origin/main:{path}`. Publish either way, but if any is not on `main` yet, tell the user plainly which links are dead until the spec is merged.

If `gh` fails (not logged in, no write access, sub-issues unavailable), keep the task file, report the exact error and stop. Do not fall back to an issue without a parent or to another repo.

Committing, pushing and opening a pull request in this repo are not part of this step - they happen only when the user asks.

## Finish

Report the task paths, the issue links and the branch name of each, the epic each went under and whether it was created, how the spec was split if it was, and any links that will not resolve until the spec is merged.
