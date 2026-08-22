# Moderation

> Approval before a community quiz can be shared with anyone.

**Decision:** **⚪ idea**

## Context
The author can always take their own quiz. Sharing it requires our approval - the gate is enforced by the [authoring flow](./authoring-flow.md) state machine, not by convention.

**Review checks:**
- no illegal content, hate speech, or targeting of private individuals
- questions are answerable and not push-polled
- orientations and weights are coherent enough to produce a meaningful result
- result modules are configured and the quiz actually finishes
- not spam, not a near-duplicate of an existing quiz

**Outcomes:**
- **approve** -> quiz published
- **reject with a written reason** -> quiz need to be fixed
- **reject and remove** -> quiz is outside acceptable boundaries so we need to remove it

## Opportunity
- Everything published under our name is our credibility, and credibility is the whole asset - see [Why](../../../concept/why.md). A gate is what makes opening the editor survivable.
- Provides a quality floor in the window before [quality score](./quality-score.md) has enough data to rank anything.
- Written reasons double as creator education - the cheapest way to raise the median submission.

## Risk
- Manual review is a human bottleneck on a volunteer team - the exact constraint this module exists to escape.
- Judgement calls on political content will be read as bias, so criteria must be published and reasons written down.
- Volume from [LLM authoring](../editor/llm-authoring.md) can outpace reviewers faster than we can staff them.
- Latency demotivates creators at their most motivated moment.

