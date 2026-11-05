# Sign-in

> One door for signing in and signing up - Google, Facebook or X - shown on its own page or over whatever action needs an account.

**Decision:** **🟢 GO**

Design: [Figma - sign-in and sign-up, providers only](https://www.figma.com/design/DIInW4qrIxsgXmKbSHukNm/mypolitics-app?node-id=6014-52980)

![The sign-in card, the account that exists with another provider, and the step that completes a new account](../../assets/sign-in.png)

## Context
[Accounts](./accounts.md) exist for the people who build: authors of quizzes, reviewers and administrators. Taking a quiz never needs one. This doc decides how a person gets into an account.

- **Social providers only** - "Kontynuuj z Google", "Kontynuuj z Facebookiem", "Kontynuuj z X". There is no e-mail field, no password, no password rules and no reset flow anywhere in the product.
- **One door for both** - the first sign-in with a provider starts an account; every later one signs in. The person never has to know whether they already have an account.
- **The account is saved only after "Prawie gotowe"** - a short step after the first sign-in: the name quizzes will be signed with (suggested from the provider, editable), a declaration of being 16 or older, and acceptance of the terms and the privacy policy. Only "Gotowe" saves the account; "Anuluj" keeps nothing.
- **No silent merging** - when a provider returns an e-mail that already belongs to an account made with another provider, the screen names that provider and offers only "Zaloguj się przez ...". Once that sign-in succeeds, the new provider is linked to the account, so either works next time.
- **Shown where it is needed** - the same card works as a page of its own (the "Zaloguj się" button in the header) and as a dialog over any action that needs an account: a modal on a computer, a bottom sheet on a phone, with one line saying why an account is needed. "Utwórz quiz" is the first such action. After signing in the action carries on; closing the dialog leaves everything as it was.
- **The header knows** - signed out it shows "Zaloguj się"; signed in it shows the person's avatar and name, with a menu to sign out.

What the sign-in deliberately does not do: it does not ask for an account before a quiz, a result or a comparison; it does not attach answers to the account (see [privacy and legal](./privacy-and-legal.md)); and it does not add a second factor yet - stronger verification is reserved for the moment an author sends a quiz to moderation.

## Opportunity
- **No credentials to keep** - no passwords to hash, leak or reset, and no support for forgotten ones, on a volunteer team. The risk "password and recovery obligations" in [accounts](./accounts.md) disappears.
- **Seconds, not minutes** - an author who wants to try the editor is one provider window and one short step away from it.
- **One component for every gate** - every future feature that needs an account (rating a quiz, saving a draft, moderation) calls the same dialog instead of building its own wall.
- **Consent before processing** - the account record and everything beyond authentication start only after the person has declared their age and accepted the terms.
- **Takeover-safe by design** - refusing to merge accounts on an e-mail alone closes the easiest way to steal an author's account.

## Risk
- **Dependence on three companies** - a provider that changes its terms, its review process or its availability locks out the authors who used only it. Linking a second provider is the way out, and it has to stay easy.
- **People without any of the three accounts** cannot author. We accept that for now.
- **X may not return an e-mail address** - such an account can never be found by e-mail, so accounts are identified by provider and the provider's user identifier, and the e-mail is optional throughout.
- **Provider windows fail in ways we do not control** - blocked pop-ups, closed windows, in-app browsers of social apps. Every failure needs a clear message and another way forward.
- **The provider's name and photo are personal data** - and the name becomes public as the author of a quiz. The suggested name is only a suggestion, and it is the person who confirms it.
- **No Sign in with Apple** - an iOS app that offers third-party sign-in would have to add it before its store review.

## Decision
GO, approved together with the design on 15 October 2026. The open questions of the design were settled as follows, each open to the president's override:

- **No Apple sign-in** for now. It is added together with an iOS app, if one is ever built.
- **Minimum age 16**, declared with a box on the "Prawie gotowe" step - the age of consent to processing in Poland, and the age from which [privacy and legal](./privacy-and-legal.md) allows processing personal data at all.
- **Identity is the provider and the provider's user identifier**; the e-mail is optional and is used only to detect an account made with another provider and to show the person which address they signed in with.
- **Avatar** - the provider's photo when the provider gives one, the person's initials otherwise. The frames draw the initials, which is the fallback.

The specification is [sign-in](../../spec/platform/sign-in.md).
