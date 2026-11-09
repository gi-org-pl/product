# Cloudflare settings are managed as code

> Any change to the foundation's Cloudflare account - even a single DNS record - is made only by admins, through a pull request in a dedicated repository.

**Decided:** 2026-11-09, by the Head of Engineering.

## What was decided
The foundation's Cloudflare account and every domain in it are kept as code in a dedicated private repository, and applied to Cloudflare from there automatically. This covers:

- the domains and their DNS records,
- redirects, cache rules, configuration rules and SSL settings,
- Zero Trust: who can sign in to protected applications, and the service tokens automations use,
- tunnels to our servers, file storage (R2), Turnstile and Web Analytics,
- the members of the account.

Nobody changes these settings by hand in the Cloudflare dashboard. To request a change, a member asks one of the admins (the admins team). The admin opens a pull request in the dedicated repository, which shows exactly what will change. Once it is reviewed and merged, the change is applied. A nightly check reports anything changed by hand or created outside the repository, and the next applied change reverts changes to the managed settings.

Three things stay outside the repository:

- Cloudflare Workers, which are deployed from the repository of the project they belong to.
- Tunnel tokens, which stay in the secrets of the project that runs the tunnel.
- Bot protection settings, which Cloudflare does not let the repository manage. Only admins change them, in the dashboard.

Page Rules are no longer used: the two that existed were replaced by a redirect rule and a configuration rule with the same effect.

How to request a change, for developers: [Cloudflare](https://github.com/gi-org-pl/gi-tech-standards/blob/main/docs/infrastructure/CLOUDFLARE.md) in the tech standards.

## Why
- **One reviewed source of truth** - every change has an author, a reviewer and a reason, is recorded in history and can be reverted.
- **Security** - DNS and access rules decide where the foundation's domains point and who can reach protected applications. A mistake or a single compromised account could take a site down or send its visitors elsewhere; a reviewed pull request guards against both.
- **Changes made outside the process are visible** - they are reported the next night.
