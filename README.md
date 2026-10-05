# Product

> Product documentation of GI projects - published as a site at [roadmap.gi.org.pl](https://roadmap.gi.org.pl/).

## Contents
| Folder | Description |
|---|---|
| [myPolitics](./mypolitics/README.md) | Docs, specs, roadmap and tasks of myPolitics |
| [Asystent NGO](./asystent-ngo/) | Developer tasks of Asystent NGO |

## The site
The markdown files are the source of truth. The site is generated from them on every merge to `main` - nothing is written for the site separately.

- **What is published** - everything under [mypolitics](./mypolitics/README.md) except `tasks/`.
- **Navigation follows the folders** - each folder is a section and its `README.md` is the section's landing page. A new file appears on the site by itself.
- **Titles come from the first heading** - the `# Title` of a file is its name in the navigation.
- **Links stay relative** - link to other files as `./file.md`, the same way that works on GitHub. Images go to `mypolitics/assets/`.

## Editing
1. Change or add a markdown file under `mypolitics/`.
2. Open a pull request - the site is built as a check, so a file that breaks the build is caught there.
3. Merge to `main` - the site is rebuilt and published within a minute or two.

## Preview locally
```
pip install -r requirements.txt
mkdocs serve
```

The site is then served at `http://127.0.0.1:8000` and reloads on every save. Links to files that do not exist are listed as warnings in the terminal.

## How it is built
| File | Description |
|---|---|
| [mkdocs.yml](./mkdocs.yml) | Site configuration - [MkDocs](https://www.mkdocs.org/) with the [Material](https://squidfunk.github.io/mkdocs-material/) theme |
| [site-hooks.py](./site-hooks.py) | Sends links to folders left out of the site to GitHub |
| [requirements.txt](./requirements.txt) | Pinned versions of the build tools |
| [docs.yml](./.github/workflows/docs.yml) | Builds on pull requests, publishes to GitHub Pages on `main` |
