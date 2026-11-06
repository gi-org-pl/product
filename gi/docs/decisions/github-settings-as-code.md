# GitHub settings are managed as code

> Any change to the foundation's GitHub organisation or repository settings - even a repository description - is made only by admins, through a pull request in a dedicated repository.

**Decided:** 2026-11-06, by the Head of Engineering.

## What was decided
The settings of the gi-org-pl GitHub organisation and of every repository in it are kept as code in a dedicated private repository, and applied to GitHub from there automatically. This covers:

- repository names, descriptions, websites and topics,
- visibility, features (issues, wiki, projects, discussions) and merge settings,
- which teams can access which repository, organisation members, teams and their members,
- security and GitHub Actions settings.

Nobody changes these settings by hand in GitHub, even where their role in a repository would allow it. To request a change, a member asks one of the admins (the admins team). The admin opens a pull request in the dedicated repository, which shows exactly what will change. Once it is reviewed and merged, the change is applied. A nightly check reports anything changed by hand, and the next applied change reverts it.

How to request a change, for developers: [Repository settings](https://github.com/gi-org-pl/gi-tech-standards/blob/main/docs/github/REPOSITORY_SETTINGS.md) in the tech standards.

## Why
- **One reviewed source of truth** - every change has an author, a reviewer and a reason, is recorded in history and can be reverted.
- **Security** - these settings decide who can see and change the foundation's code. Keeping them in reviewed code protects them from mistakes and from a single compromised account.
- **Changes made outside the process are visible** - they are reported the next night.
