# Exports

> How a CSV export is produced, delivered and limited.

**Decision:** **⚪ idea**

## Context
One export mechanism, shared by everyone allowed to pull data out - see [creator exports](../community/creator-exports.md) for the creator-facing side.

- **Format** - CSV, one row per completed questionnaire, inside the anonymisation boundary - see [anonymisation](../../data/datasets/anonymisation.md).
- **Scope** - A single quiz per export.
- **Date range** - Chosen by the requester. It starts no earlier than the quiz's publication date and ends at request day - 1, so a partial day is never exported.
- **Asynchronous** - The request is queued and the file is built in the background. Big quizzes take time, so an export is never guaranteed to be ready on the spot.
- **Delivery** - The file appears in the requester's exports list when it is done. Open: whether we also mail the link on completion.
- **Retention** - The file is deleted after a fixed time window and the requester regenerates it if they need it again.
- **Limits** - One pending export per quiz, plus a cap on how often the same quiz can be exported, so a queue cannot be flooded.

An expired export is gone, not archived - the requester asks for the same range again and gets an identical file, because the range always ends at day - 1.

## Opportunity
- One pipeline covers creators, admins and internal analysis instead of three one-off scripts.
- Asynchronous generation means a quiz with a million rows is a scheduling problem, not a timeout.
- A fixed retention window puts a ceiling on storage cost without anyone having to clean up by hand.
- Day - 1 cut-off makes exports reproducible: the same range always returns the same rows.

## Risk
- Political views are special-category data, and an export is the moment rows leave the platform - the anonymisation boundary has to hold here, not only in the database.
- Narrow ranges on low-traffic quizzes produce small samples that can be re-identified.
- Generated files are a second copy of sensitive data sitting in storage; the retention window has to be enforced, not assumed.
- A download link is a bearer token - anyone with the URL has the file unless it is tied to the session.
