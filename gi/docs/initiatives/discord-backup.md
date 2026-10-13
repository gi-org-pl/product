# Discord backup

> A regular, encrypted backup of the foundation's Discord server to a place the foundation controls.

**Decision:** **⚪ idea**

## Context
Most of the foundation's daily work happens on Discord: discussions, decisions, briefs, reviews of members' projects. The foundation does not own that data. If the server is lost for a reason outside its control - a suspension of the account or the server, a mistake, a change of the platform's rules - the context collected there is lost with it.

Proposed on 2026-10-13 after a first analysis, tracked in [issue #109](https://github.com/gi-org-pl/product/issues/109). **Nothing is built yet.** The decisions below are open.

The proposal in short:

- **A separate, read-only bot** exports the server through Discord's official API on a schedule. A user account's token is never used - that is against Discord's terms.
- **An existing tool** does the export: [DiscordChatExporter](https://github.com/Tyrrrz/DiscordChatExporter), command line version, to JSON and HTML, with media downloaded as files (Discord's attachment links expire). The tool has an option to include threads; whether that covers forum channels and private threads is not verified - until the trial export confirms it, the backup is not to be counted as covering them.
- **Beyond messages** it keeps the structure of the server (channels, categories, roles, permission overwrites) and the audit log, which Discord holds for 45 days only.
- **On the foundation's own server** an incremental export runs nightly and a full one weekly. The archive is encrypted, a second encrypted copy is kept elsewhere, and access is limited to the board.
- **Members are told** that it happens.

The full plan, the steps and the sources are in the issue.

## Opportunity
- **The context survives the platform** - decisions and discussions stay readable and searchable even if the server is gone.
- **The audit log is kept** - past its 45 days it is otherwise lost.
- **Independent of Discord** - it complements writing decisions down in repositories and documents, which stays the first line of protection.

## Risk
- **It is an archive, not a restore** - the server cannot be rebuilt from it; messages can at most be re-posted as copies. Direct messages and deleted messages are not in it.
- **Discord's rules** - the developer terms ask for encryption of API data at rest, a privacy policy and deletion on request, and contain a general ban on scraping. Neither a ban nor a permission for a private backup of one's own server was found, and the text was read from a 2022 copy. The current version still has to be read.
- **GDPR** - the foundation is the controller of the copy. It needs a legal basis with the balancing written down, information for members, a retention period and a way to remove a person's data from the backups. Some members are minors. A lawyer or the data protection contact has to check these points.
- **A block of the IP address** - Discord restricts an address that makes too many invalid requests (401, 403, 429), and the restriction takes down everything else on that network, including other bots of the foundation. The plan limits this with one run at a time, access matching the scope, a run that stops itself far below the limit, and a measurement in the trial.

## Decision
Not decided. The initiative is proposed and open; it moves to GO or NO-GO once these are settled:

- which channels are in scope - the narrower, the lower the risk; a start with working channels and forums is suggested
- how long backups are kept, and how a deletion request reaches the copies
- where the second copy is kept
- who confirms the legal points with a lawyer, and who reads Discord's current developer terms
- whether the backup runs from the same network as the foundation's other bots or from an address of its own

Not known yet: how the tool handles forum channels and private threads, and how long a full export takes within the rate limits. A trial export of one forum and one text channel is to answer both.
