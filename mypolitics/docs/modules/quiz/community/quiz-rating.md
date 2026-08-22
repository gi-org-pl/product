# Quiz rating

> A one-tap rating collected from the taker right after finishing.

**Decision:** **⚪ idea**

## Context
After completing a community quiz, before or beside the [result screen](../results/README.md), the taker is asked how good the quiz was.

**The score:**
- an integer from **0 to 10**, nothing between - 0 is worthless, 10 is excellent
- one tap on a 0-10 row, no separate confirm step
- skippable, and a skip is not a 0 - it is no rating at all
- one score per user per quiz, editable while the result is open, overwritten on a retake
- optional free-text note attached to the score

The average of all scores feeds [quality score](./quality-score.md); scores and notes go back to the creator as feedback.

## Opportunity
- The only signal that captures whether a quiz was worth taking, as opposed to whether it was finished.
- Collected at the point of highest engagement, so it costs almost nothing to ask.
- Gives creators a feedback loop, and gives [moderation](./moderation.md) a soft signal for re-reviewing quizzes that degrade.

## Risk
- Anything placed between the questionnaire and the result costs completions, and it competes with sharing at the exact moment we want a share.
- Creators can self-rate and brigade; low-sample averages are noise and need a threshold.
- An 11-point row is wide on mobile and invites lazy anchoring at the ends - the scale has to survive a phone screen.
- Political disagreement gets rated as low quality - a quiz can be marked down for its conclusions.
