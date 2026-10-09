# Results saving and marketing

> The last card of the quiz - an e-mail for the results link, and an optional consent to be contacted.

**Decision:** **⚪ idea**

Design: [Figma](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=5516-70263)

## Context
After the last question and before the result, the questionnaire shows one card: *save your results*. It asks for an e-mail address and sends a link to the result, so the taker can come back to it later - which matters because there is [no cross-device resume](./session-and-data.md) and no account is required to take a quiz.

The card carries two asks, deliberately separated:

- **The e-mail** - the address the results link is sent to, and the only thing the card actually needs.
- **The consent** - an unticked checkbox for marketing content - new quizzes, updates - from the foundation, next to a link to the privacy policy.

How it behaves:

- **Skippable** - *Skip* is always there and never hidden; the result is shown either way.
- **One button, two states** - the skip turns into *Send and see results* the moment a valid address is typed, so there is one way forward, not a choice between two.
- **Consent is not a gate** - the link is sent whether the box is ticked or not, and ticking it is not what unlocks the result.
- **The promise is on the card** - a line stating that the address will never be tied to the taker's views, in plain language, where the ask is made.

That promise is the design constraint everything else follows from:

- **Send and forget** - the mail goes out at submission and the address/result pair is not stored; what remains is a result under a random URL and, if the box was ticked, an address on the marketing list.
- **No consent, no address** - without the checkbox the e-mail is used for that one message and kept nowhere.
- **A link, not the result** - the message carries a URL, never the political content, so neither the mailbox nor the mail provider ever holds a profile.
- **Out of the logs** - the request carrying the address is excluded from access logs, error traces and analytics events, because a log line is the easiest place for the pair to survive.
- **The list is just addresses** - the marketing list holds e-mails and consent state, with nothing from the quiz attached - see [privacy and legal](../../../platform/privacy-and-legal.md).

## Opportunity
- **Results outlive the session** - the link is the only way back to a result, and without it a finished quiz is gone when the tab closes.
- **The only owned audience** - a list we can announce new quizzes on, independent of any platform's reach.
- **The privacy promise is the pitch** - saying what we will not do, at the moment of asking, is what makes the ask answerable at all.
- **One interruption, not two** - the address and the consent are collected on a single card, at the point where the taker is most willing.
- **A free skip protects the funnel** - nobody is trapped between their result and a form.

## Risk
- **It sits on the payoff** - the card stands between the last question and the result, exactly where drop-off is most expensive.
- **The promise costs us the analysis** - we can never say which views convert to subscribers, or segment the list politically, and that is the point.
- **No pairing means no support** - somebody who loses the link cannot be helped, because we cannot look their result up by their address.
- **Deliverability decides everything** - a link mail in the spam folder makes the whole ask worthless, and quiz results are exactly the shape spam filters dislike.
- **The two asks blur** - a checkbox under an e-mail field reads as required, which produces consent we cannot rely on and mistrust once noticed.
- **Consent binds what we can send** - the wording set here fixes the scope, and broadening it later needs asking everyone again.
