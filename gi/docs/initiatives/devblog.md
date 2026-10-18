# Devblog

> A blog on the foundation's website where everyone in GI can publish - foundation news, personal articles and devlogs about how we work and build.

**Decision:** **🟢 GO**

## Context
Proposed by a team member and written down on 2026-10-18 at the president's request. Approved by the president on 2026-10-18. **Nothing is built yet** - the first step is the blog subpage on the website. The president's answers to the first open questions are under [Decision](#decision) and are written into the sections below. The Framer structure, the roles' details and the metrics are still proposals.

The idea: a section on gi.org.pl where everyone in the foundation can publish. It holds three types of entries:

| Type | What it is |
|---|---|
| Aktualności (news) | News of the foundation |
| Blog | Personal thoughts of members |
| Devlog | Articles about how we work, how we designed our solutions and what we achieve technically |

**Language.** Entries are in Polish only.

**Personal opinions.** A Blog entry is the author's own view, so it carries a disclaimer. Proposed wording:

> Tekst wyraża osobistą opinię autora i nie jest stanowiskiem Fundacji Generacja Innowacja.

(The text expresses the author's personal opinion and is not the position of the Generacja Innowacja Foundation.)

### Starting content
Many of us already run personal blogs. Part of those articles can be moved to the GI site. **This comes later - it is not part of the first step.** Each re-posted article needs:

- **the author's consent** to re-post it. A message on Discord counts as consent; no consent form is needed. A link to that message is kept in the entry's internal notes, which are not public.
- **a canonical link** to the original, so that search engines do not treat the copy as duplicate content,
- **the original date** of publication.

### Devlogs, written semi-automatically
A devlog is written from the actual work - pull requests, issues, Discord threads, design reviews. AI writes the first draft and adds charts, animations and the like; people check the substance.

**Trigger.** A piece of work that has a story to tell - for example a merged epic or a finished design round. A devlog is started on request; the bot does not start one on its own. There is no required cadence.

**Sources the draft may use**

- public material - public repositories, issues and pull requests, the published site,
- material whose owners agreed to its use - a private repository, a Discord thread, a design review,
- never: personal data of members, interns, volunteers or partners; secrets; internal-only threads without the consent of the people in them.

**Steps**

1. **Draft** - Gieniek writes the draft in Polish from the sources and prepares the charts and visuals. People appear in the draft by their roles only, as everywhere in Gieniek's work.
2. **Author or owner review** - the people whose work it is check the substance, correct it and agree to be named.
3. **Board approval** - the board approves the text for publication. For a devlog drafted by Gieniek, this approval is what lets it go public.
4. **Publication** - a person fills in the names of the authors and reviewers who agreed to be named, and publishes the entry. The bot prepares the entry in the website's CMS, with roles in place of names. If the bot itself is asked to publish an entry, it does so only after the president's confirmation, as the rules for Gieniek's work require for everything it makes public.

**Credit.** The people whose work the devlog describes are its authors, with their consent. Their names are entered by a person, not by the bot. Each devlog carries a note saying that AI wrote the draft and naming the people who checked it, in line with the foundation's message that AI writes and a person approves. The Polish wording of the note is still to be written.

**Quality bar - no AI slop**

- Pictures are real: screenshots, diagrams and charts from the work itself. No AI-generated images - that is a rule of the foundation for all its graphics.
- Charts and animations are built from real data of the work, not invented. Gieniek draws them with code from that data; they are not generated images. Making them for devlogs is part of this proposal at the president's request, and widens the graphics limit in [Gieniek's doc](../gieniek/README.md#limits), which today allows only real photos, product screenshots and brand material. The doc is to be updated if the initiative goes ahead.
- Numbers only from the sources, each one traceable to where it came from.
- If the substance is not confirmed by the people who did the work, the devlog is not published.

### First step: a subpage on the website
The website gi.org.pl is built in Framer. A proposed structure:

**One CMS collection for all three types**

| Field | Purpose |
|---|---|
| Title | The title of the entry |
| Slug | The address of the entry |
| Type | Aktualności, Blog or Devlog |
| Authors | One or more people |
| Date | Date of publication; for a re-posted article, the original date |
| Cover image | The share image and the image on the list |
| Summary | A short lead for the list and for sharing |
| Body | The text |
| Tags / project | For example myPolitics, Gieniek, the foundation |
| Canonical URL | For re-posted articles: the address of the original |
| AI-assisted | Marks an entry drafted with AI |
| Reviewed by | The people who checked an AI-assisted entry, for the note on the entry page; entered by a person |
| Internal notes | Links to the Discord messages that record consent; never shown on the site |

Whether Framer keeps a CMS field that no page uses out of the published site is still to be checked before consent links go into it.

**Pages**

- **List page** - all entries, newest first, with filters by type (Aktualności, Blog, Devlog) and by project.
- **Entry page** - a template for one entry: title, authors, date, cover and body. A Blog entry also shows the personal-opinion disclaimer. An AI-assisted entry shows the note on who checked it, from the Reviewed by field.
- **Canonical link** - for a re-posted article, the entry page puts the Canonical URL field into its `<link rel="canonical">` tag, so that search engines treat the original as the main version. Storing the address alone is not enough. Whether Framer can bind this tag to a CMS field is still to be checked.
- **Author information** - a short note on each author, linked from the entry.
- **RSS feed** - if Framer supports one for a CMS collection; this is still to be checked.
- **Share image** - each entry uses its cover as the image when it is shared.

### Roles
| Role | What it does |
|---|---|
| Authors | Write news and Blog entries, or are the people whose work a devlog describes |
| Reviewer | Checks the substance of a text before it goes to the board |
| Board | Approves publication |
| Gieniek | On request: drafts devlogs, and prepares the subpage and the CMS collection in Framer. It uses roles instead of names, and publishes only after the president's confirmation |

### Metrics
Proposals. With no required cadence, these are observed, not targets:

- entries published per month, by type,
- devlogs per finished epic,
- reads, and visitors referred from the entries to the foundation's products.

## Opportunity
- **The work becomes visible.** How the foundation designs and builds is today scattered over repositories and Discord threads; a devlog tells it to people outside.
- **A voice for everyone.** Every member can publish on the foundation's site.
- **One place for news and stories.** Foundation news, personal articles and devlogs share one list, with filters by type.
- **Little extra writing.** Devlogs come from the record of the work, and AI writes the first draft.

## Risk
- **AI slop.** A draft that reads as generated, with invented numbers or generic pictures, would damage the foundation's credibility. The quality bar and the review by the people who did the work are there against it.
- **Personal data and internal matters.** Drafts are written from working material, where names of members and interns, and internal threads, appear. Only public or consented sources may be used.
- **Duplicate content.** A re-posted article without a canonical link competes in search with its original.
- **Personal opinions under the foundation's name.** A Blog entry may be read as the foundation's position; the disclaimer is there against it.
- **Consent links leaking.** If a field not used on the page were still published, the internal notes would be public; this is checked before they are filled in.
- **No one to keep it going.** There is no required cadence, so the blog lives only as long as people write; the metrics show when it slows down.

## Decision
Approved - GO - by the president on 2026-10-18. His answers to the first open questions, the same day:

| Question | Answer |
|---|---|
| Who approves publication | The board. For devlogs drafted by Gieniek, the board's approval lets them go public; the president's confirmation stays for anything the bot publishes itself |
| Cadence | No required cadence |
| Languages | Polish only |
| A disclaimer for personal opinions | Yes, on Blog entries |
| Migrating past articles | Yes, later - not part of the first step |
| A consent template for re-posting | Not needed - a message on Discord counts as consent, and its link is kept in the entry's internal notes |
| Types of entries | Three: Aktualności (news), Blog, Devlog |

### Open questions
- The Polish wording of the note on AI-drafted entries, and the final wording of the disclaimer.
- Whether Framer keeps unused CMS fields out of the published site, whether it can set the canonical link of a CMS page from a field, and whether it offers an RSS feed for a collection.
- Which past articles are migrated, when migration starts.
