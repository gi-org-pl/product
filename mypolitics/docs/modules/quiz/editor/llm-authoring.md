# LLM authoring

> An 'edit with ChatGPT/Claude' button that produces a config file to paste back.

**Decision:** **⚪ idea**

## Context
The editor offers a button that hands the creator a ready prompt - a skill file documenting the full [JSON schema](./json-schema.md): questions, weights, orientations, result modules.

The creator runs it on their own LLM account, works the design through with the agent, and returns with a JSON file they paste into the editor and refine by hand.

## Opportunity
- Drops the entry barrier from "design a scoring model" to "describe an idea".
- Zero inference cost to us - no model integration, no per-token bill, no vendor lock-in. The skill is a static, versioned artefact.
- Hosted generation stays open as a later step, once volume justifies paying for it.
- Lowers the cost of authoring for everyone, not only [community creators](../community/README.md).

## Risk
- The copy-paste handoff is clunky and is a real drop-off point.
- Output quality depends on the creator's model and plan, and we control neither.
- Schema drift silently breaks pasted files - the skill has to be versioned together with the schema.
- Cheap generation means cheap bulk submissions, pushing load onto [moderation](../community/moderation.md).
