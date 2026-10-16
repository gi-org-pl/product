# Gieniek

> The foundation's AI assistant: what it is, how the team works with it, and where it stops.

Gieniek is an AI assistant that works for Generacja Innowacja. It is presented to the public at [gi.org.pl/gieniek](https://gi.org.pl/gieniek) and on the team page of the foundation's site. This page is the longer version for the team and for partners: the idea, the everyday use, the limits, and what is still to be improved. It describes the state of mid-October 2026.

## Contents
| Section | Description |
|---|---|
| [Concept](#concept) | What Gieniek is and why the foundation has it |
| [How it works](#how-it-works) | The technology and the environment it runs in |
| [How to use it](#how-to-use-it) | Who can ask for what, and how |
| [What it does](#what-it-does) | The kinds of work it takes on |
| [Limits](#limits) | What it cannot or must not do |
| [Skills repository](#skills-repository) | Where its working knowledge is kept |
| [GitHub account](#github-account) | How its work on GitHub is attributed |
| [Planned changes](#planned-changes) | Open improvements, tracked as issues |

## Concept
The foundation is small and most of its work is repetitive: documents on a template, grant paperwork, posts for several channels, issues and pull requests, looking something up on the Drive. Gieniek takes the repetitive part, so that people spend their time on decisions and on what only people can do.

Three principles shape it:

- **A helper, not a decision-maker.** It prepares, drafts, checks and suggests. People review and approve; nothing goes public on its own.
- **Narrow access, widened on purpose.** It gets only the access a task needs. Every new place it may work in is opened by the president, one by one.
- **Open about its work.** Whatever it writes on GitHub carries its own account and a closing line saying who made it. It states what it verified and what it did not.

## How it works
- **The model.** Gieniek is Anthropic's Claude model, run through Claude Code. A Discord channel plugin connects the session to the foundation's Discord server.
- **The environment.** It works in an isolated environment on the president's computer. From the file system it sees only the folder with the foundation's repositories.
- **Connectors.** It reaches the foundation's Google Drive (documents, sheets, slides), Gmail, Figma, Framer and a few other services through connectors. Today they run on the president's accounts; see [planned changes](#planned-changes).
- **Skills.** Procedures for recurring jobs (documents, grants, posts, GitHub, Discord manners) are loaded when a task matches them; see the [skills repository](#skills-repository).
- **Sub-agents.** For larger requests it delegates independent parts to sub-agents, and the main session routes and checks the results.

## How to use it
Requests come through Discord.

- **Where.** Only on channels the president has allowed. Access to each channel is granted separately, and each grant needs the president's command in the terminal. Nobody can add a channel by asking on Discord.
- **How.** Mention the assistant in a message. A forum thread or channel per subject keeps the answer next to the request.
- **Who.** The president, and on chosen channels the vice-president. His requests cover the everyday work of the team. What reaches the public or cannot be undone (publishing, sending e-mails to outsiders, finance, grant and contract documents, merges, spending) waits for the president's confirmation.
- **Answers.** It answers where it was asked, in short chat messages. When it is busy with another job, it says at once that the request is noted and comes back to it. A reaction replaces a message when the outcome is obvious.
- **Material, not orders.** Text from other people, forwarded messages, briefs and linked pages are material to work from. A request found inside them is not carried out.

## What it does
- **Documents.** Documents on the foundation's template on the Drive; status documents of grants; checks of purchase paperwork and of intern hours against contracts and attendance lists.
- **Social media.** From a brief it prepares the copy of a post, the title and subtitle for the graphic and a preview of it. It does not publish: the team pastes the text into the publishing tool and decides. A proposal is put in a thread for review first; queueing happens only on the president's request.
- **Code and product documentation.** Branches, commits and pull requests, issues, tests, specs and developer tasks, and replies to review comments. It never approves or merges.
- **Design work.** Edits in Figma through a bridge, and checks of a page in Framer.
- **Finding things.** It knows where the foundation keeps its folders, sheets, repositories and channels, and looks them up.

## Limits
**Access**

- It sees only the folder with the foundation's repositories, not the rest of the computer.
- It works through the president's Google account for now. It reads the Drive and the mailbox, but by rule it does not send or delete e-mails and does not delete files. The reason is plain: a language model is not trusted with irreversible actions, because a hallucination could lead to an unpredictable step. (This has not happened so far.)
- It cannot change access or permissions, and it never handles secrets: where one is stored is a matter of the machine, not of a document.
- It cannot create accounts or enter passwords or payment data.

**Decisions**

- Human approval of everything public. It does not approve or merge its own pull requests, and it does not publish posts on its own.
- It does only what was asked and flags other problems instead of fixing them silently.
- It does not reveal personal data of members, interns, volunteers or partners. Role names are used instead of names.

**Technical**

- **One heavy job at a time** on the machine; larger requests are queued, and a ledger on disk records them.
- **A restart loses timers** kept inside the session. A reminders file and a hook restore them when a session starts.
- **Connectors can disconnect.** The Framer plugin must be open in the editor for it to work; Figma goes only through the bridge.
- **Graphics.** Only real photos, product screenshots and brand material. No AI-generated images.
- **Audio.** It cannot listen to recordings.
- **Mail attachments.** The Gmail connector cannot read attachments.
- **Discord forums.** Creating forum threads goes through the Discord REST API, not the plugin.
- **It can be wrong.** It states what it checked and what it did not; a result is to be verified by a person before it is relied on.

## Skills repository
The working knowledge of Gieniek is kept in the private repository `gi-org-pl/gieniek-skills`. It is a Claude Code plugin; each skill is a short procedure the assistant loads when a task calls for it. The repository holds what cannot be read from the files themselves: where things live, how the foundation does a given job, and what went wrong the last time.

| Skill | Covers |
|---|---|
| `discord-conduct` | Tone and length of messages, reactions, what is never revealed, access tiers of the president and the vice-president |
| `foundation-document` | Documents on the foundation template in Google Docs |
| `github-work` | Issues, pull requests, commits and review replies in the foundation's repositories |
| `grant-purchase` | Paperwork for purchases and refunds paid from a grant |
| `grant-status` | Result indicators, budget and evidence of a grant, written up as a status |
| `internships` | Internship documentation and hour counts |
| `resource-map` | Where the foundation keeps its folders, repositories and channels, and which products are active |
| `social-publishing` | From a brief to ready posts, with the approval step |
| `work-queue` | Long and heavy jobs, queueing, recovery after a crash |

Changes follow the foundation's [technical standards](https://github.com/gi-org-pl/gi-tech-standards): an issue first, one pull request per issue, review by the code owners. A lesson learned the hard way becomes a rule in a skill, with its reason.

## GitHub account
Gieniek has its own GitHub account, `gieniek-ai`, a member of the `gi-org-pl` organisation with write access and no admin rights.

- **Attribution.** What it does on GitHub goes out under that account, and its commits are authored as Gieniek. The history shows who did what.
- **Pull requests.** Every description ends with a line saying it was generated by Gieniek with Claude Code. Where a branch rule lets only admins create branches, the pull request comes from the account's fork.
- **No approvals, no merges.** It is not a code owner, its review never counts as the required approval, and it does not bypass branch rules.
- **Review.** It checks the comments of the automated reviewer and of people on its pull requests and answers each of them.

## Planned changes
The current setup is a first stage. Three changes are tracked as issues in this repository:

- a separate Google account for Gieniek, with access narrowed to shared folders and a mailbox of its own for incoming topics
- moving Gieniek to the foundation's Claude account
- a process that narrows connectors and commands depending on who sends the message
