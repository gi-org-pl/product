# Devblog

> A blog on the foundation's website where everyone in GI can publish - personal articles and devlogs about how we work and build.

**Decision:** **⚪ idea**

## Context
Proposed by a team member and written down on 2026-10-18 at the president's request. **Nothing is built yet.** Everything below the idea itself is a proposal, and the open points are listed under [Open questions](#open-questions).

The idea: a blog on gi.org.pl where everyone in the foundation can publish two kinds of text.

- **Articles** - personal thoughts of members.
- **Devlogs** - articles about how we work, how we designed our solutions and what we achieve technically.

### Starting content
Many of us already run personal blogs. Part of those articles can be moved to the GI site to fill the blog from the start. Each re-posted article needs:

- **the author's consent** to re-post it,
- **a canonical link** to the original, so that search engines do not treat the copy as duplicate content,
- **the original date** of publication.

### Devlogs, written semi-automatically
A devlog is written from the actual work - pull requests, issues, Discord threads, design reviews. AI writes the first draft and adds charts, animations and the like; people check the substance.

**Trigger.** A piece of work that has a story to tell - for example a merged epic or a finished design round. A devlog is started on request; the bot does not start one on its own.

**Sources the draft may use**

- public material - public repositories, issues and pull requests, the published site,
- material whose owners agreed to its use - a private repository, a Discord thread, a design review,
- never: personal data of members, interns, volunteers or partners; secrets; internal-only threads without the consent of the people in them.

**Steps**

1. **Draft** - Gieniek writes the draft from the sources and prepares the charts and visuals. People appear in the draft by their roles only, as everywhere in Gieniek's work.
2. **Author or owner review** - the people whose work it is check the substance, correct it and agree to be named.
3. **Editor approval** - the editor approves the text for publication.
4. **President's confirmation** - a devlog drafted by Gieniek reaches the public, so under the current rules for Gieniek's work it also waits for the president's confirmation, whoever the editor is.
5. **Publication** - a person fills in the names of the authors and reviewers who agreed to be named, and publishes the entry. The bot prepares the entry in the website's CMS, with roles in place of names, but publishes nothing.

**Credit.** The people whose work the devlog describes are its authors, with their consent. Their names are entered by a person, not by the bot. Each devlog carries a note such as "Drafted with AI, reviewed by ...", in line with the foundation's message that AI writes and a person approves.

**Quality bar - no AI slop**

- Pictures are real: screenshots, diagrams and charts from the work itself. No AI-generated images - that is a rule of the foundation for all its graphics.
- Charts and animations are built from real data of the work, not invented.
- Numbers only from the sources, each one traceable to where it came from.
- If the substance is not confirmed by the people who did the work, the devlog is not published.

### First step: a blog subpage on the website
The website gi.org.pl is built in Framer. A proposed structure:

**CMS collection "Blog"**

| Field | Purpose |
|---|---|
| Title | The title of the entry |
| Slug | The address of the entry |
| Type | Article or Devlog |
| Authors | One or more people |
| Date | Date of publication; for a re-posted article, the original date |
| Cover image | The share image and the image on the list |
| Summary | A short lead for the list and for sharing |
| Body | The text |
| Tags / project | For example myPolitics, Gieniek, the foundation |
| Canonical URL | For re-posted articles: the address of the original |
| AI-assisted | Marks an entry drafted with AI |

**Pages**

- **List page** - all entries, newest first, with filters by type and by project.
- **Article page** - a template for one entry: title, authors, date, cover, body, and the "Drafted with AI, reviewed by ..." note when the entry is AI-assisted.
- **Author information** - a short note on each author, linked from the entry.
- **RSS feed** - if Framer supports one for a CMS collection; this is still to be checked.
- **Share image** - each entry uses its cover as the image when it is shared.

### Roles
| Role | What it does |
|---|---|
| Authors | Write articles, or are the people whose work a devlog describes |
| Reviewer | Checks the substance of a text before it goes to the editor |
| Editor / approver | Approves publication - the board or the marketing team |
| Gieniek | On request: drafts devlogs, and prepares the blog page and the CMS collection in Framer. It uses roles instead of names and publishes nothing |

### Metrics
Proposals:

- articles published per month,
- devlogs per finished epic,
- reads, and visitors referred from the blog to the foundation's products.

## Opportunity
- **The work becomes visible.** How the foundation designs and builds is today scattered over repositories and Discord threads; a devlog tells it to people outside.
- **A voice for everyone.** Every member can publish on the foundation's site.
- **A full blog from the start.** Re-posted articles fill it before the first new text is written.
- **Little extra writing.** Devlogs come from the record of the work, and AI writes the first draft.

## Risk
- **AI slop.** A draft that reads as generated, with invented numbers or generic pictures, would damage the foundation's credibility. The quality bar and the review by the people who did the work are there against it.
- **Personal data and internal matters.** Drafts are written from working material, where names of members and interns, and internal threads, appear. Only public or consented sources may be used.
- **Duplicate content.** A re-posted article without a canonical link competes in search with its original.
- **Personal opinions under the foundation's name.** A personal article may be read as the foundation's position.
- **No one to keep it going.** Without a cadence and an editor, a blog stops after a few entries.

## Decision
Not decided. The initiative is proposed and open; it moves to GO or NO-GO once the open questions below are settled.

### Open questions
- Who approves publication - the board, or the marketing team. For devlogs drafted by Gieniek, the president's confirmation stays on top of it unless the rules for Gieniek's work change.
- The cadence - how often an entry is expected.
- Languages - Polish, English, or both.
- Whether personal opinions need a disclaimer.
- Which past articles are migrated first.
- The consent template for re-posting an article.
