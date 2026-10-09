# Session and data

> Where a quiz comes from, what a session is, what is handed in at the end, and what survives a refresh.

**Decision:** **⚪ idea**

## Context
Every other file in this folder describes what the taker sees. This one describes what the questionnaire holds while they see it: the quiz it was given, the session it keeps, and the single moment anything is sent back.

A **quiz** has its own address. Opening it needs no account and no choice of version - one address, one quiz, the current one.

A **session** is one taking of one quiz, in one browser tab. It holds the answers and the skips in the order they were given, the topics the taker picked, where in the [phases](./phases-model.md) they are, whether they turned [checkpoints](./checkpoints/README.md) off, and a random identifier made in the browser.

How it behaves:

- **The whole quiz arrives at once** - statements, answers, categories and what each answer scores come in one read. After that the questionnaire does not need the network until the end.
- **Nothing leaves the browser until the end** - answers stay in the tab. Not one of them is sent while the taker is still answering.
- **One hand-in** - after the closing cards the session is sent once: the answers, the topics, and the [demographics](../data-harvesting/demographics.md) if they were given. The result is calculated from that and from nothing else.
- **The identifier becomes the result's address** - the random identifier the browser made is what the result is saved under, and what the results link carries. It names a result, not a person.
- **A refresh loses nothing** - the session is kept in the tab and comes back after a reload, on the same question.
- **It ends with the tab** - close the tab and the session is gone. It is not shared with another tab, another browser or another device, and there is no way to continue a quiz somewhere else.
- **It ends when the taker leaves for the result** - the answers are removed from the browser the moment the result is ready and the taker is sent to it, not before, so a refresh during the wait still finds them. Starting over removes them too.
- **The e-mail never sits next to the answers** - the address typed on the [last card](./results-saving-and-marketing.md) is not part of the session and is never stored with it. The link is sent only once the result exists.
- **The running picture is ours alone** - what checkpoints show mid-quiz is worked out in the browser from the answers so far. It is an estimate of the result, never the result, and it is never sent.

## Opportunity
- **No waiting between questions** - with the quiz already in the browser, the next question is instant, which is most of what [pacing](./progress-and-pacing.md) feels like.
- **A lost connection costs nothing** - a train tunnel in the middle of a quiz does not interrupt it; only the very start and the very end need the network.
- **Privacy by construction** - a taker who walks away leaves no half-finished set of political answers on our servers, because none was ever sent.
- **No account, no cookie wall** - a session needs nothing from the taker before the first question - see [accounts](../../../platform/accounts.md).
- **The most common accident is covered** - a stray refresh or a mis-swipe is the cheapest way to lose a taker at question 60, and keeping the session in the tab removes it.
- **One contract with what already runs** - the quiz is read and the result is saved the same way the current product does it, so a result made here opens wherever results already open.

## Risk
- **People who leave are invisible** - with one hand-in at the end, a taker who quits on the demographics card leaves no answers at all, complete as they were. The [phases](./phases-model.md) promise that the data is safe early, and this breaks it.
- **Political answers sit in the browser** - until the taker is sent to the result, a full set of views is kept in the tab, readable by anyone who sits down at the same computer before it is closed.
- **A refresh loses the e-mail** - the address is deliberately kept out of what the tab stores, so a reload on the closing cards empties the field, and a taker who does not notice gets no link.
- **The tab is a fragile place** - a phone that drops a background tab drops eighty answers with it, and the taker has no way to get them back.
- **No resume anywhere else** - starting on a phone and finishing on a laptop is not possible, and every request to fix that ends with answers attached to an identity - see [privacy and legal](../../../platform/privacy-and-legal.md).
- **The identifier is a key** - whoever has the link has the result. It is random and long, but it is also the only lock.
- **The whole quiz is in the open** - sending everything up front means the weights behind each answer can be read by anyone who looks. The algorithm is public anyway, but a quiz that can be reverse-read can be gamed.
- **A quiz can change under a session** - if an author edits a quiz while someone is half way through, the answers they hold may no longer fit it.
- **Two calculations can disagree** - the running picture in the browser and the result from the server are separate work, and a checkpoint that says one thing before a result that says another is our contradiction to explain.
