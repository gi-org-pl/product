![Product header](https://raw.githubusercontent.com/gi-org-pl/product/main/.github/image/header.png)

# Product

> Product documentation of GI projects - read it at [gi.org.pl/produkt](https://gi.org.pl/produkt), which loads it as JSON from [product.gi.org.pl](https://product.gi.org.pl/index.json).

## Contents
| Folder | Description |
|---|---|
| [Generacja Innowacja](./gi/README.md) | Roadmap, decisions and docs of the whole foundation |
| [myPolitics](./mypolitics/README.md) | Docs, specs, roadmap and tasks of myPolitics |
| [Asystent NGO](./asystent-ngo/) | Developer tasks of Asystent NGO |

## The site
The markdown files are the source of truth. On every merge to `main` a GitHub Actions workflow builds them into JSON files and publishes those on GitHub Pages at `https://product.gi.org.pl`. The documentation page of the foundation's website, [gi.org.pl/produkt](https://gi.org.pl/produkt), reads those files and shows the documents, so nobody needs to know GitHub to read them. Nothing is written for the site separately.

- **What is published** - every markdown file under [gi](./gi/README.md) and [mypolitics](./mypolitics/README.md), except the `tasks/` folders, which stay on GitHub. Other files in those folders (images, PDFs, SVGs) are published next to them.
- **Navigation follows the folders** - each folder is a section and its `README.md` is the section's landing page. Inside a folder, documents follow the order in which its `README.md` links to them. A new file appears by itself.
- **Titles come from the first heading** - the `# Title` of a file is its name in the navigation, and the quote right under it is its description.
- **Links stay relative** - link to other files as `./file.md`, the same way that works on GitHub. The build turns them into links between documents, and fails on a link or an anchor that leads nowhere.

## Editing
1. Change or add a markdown file under `gi/` or `mypolitics/`.
2. Open a pull request - the build runs as a check, so a broken link or a file that does not build is caught there.
3. Merge to `main` - the JSON is rebuilt and published within a minute or two, and the website shows the change.

## Build and check locally
```
npm ci
npm test
npm run build
```

`npm test` builds everything into a temporary folder and checks it; `npm run build` writes the files to `_site/`. Broken links are listed in the terminal.

## Docs API
Everything is served from `https://product.gi.org.pl` with `Access-Control-Allow-Origin: *`, so any page can read it.

| File | Contents |
|---|---|
| `index.json` | The commit and time of the build, the navigation tree per section, and a summary of every document in reading order: id, title, path, section, description, date of the last change, tags, excerpt |
| `docs/<id>.json` | One document: the summary, breadcrumbs, frontmatter, the table of contents, the body as sanitised HTML, the original markdown, links to GitHub, and the previous and next document |
| `search.json` | Title, headings and plain text of every document, for search in the browser |
| `files/<path>` | Images, PDFs and other files, at their path in this repository |
| `schema/*.json` | A JSON Schema for each of the three JSON files |

- **A document's id is its path** without `.md`, and without `/README` for a folder's landing page: `mypolitics/docs/concept/README.md` is `mypolitics/docs/concept`, served at `docs/mypolitics/docs/concept.json`.
- **Links in the HTML** to another document point at `https://gi.org.pl/produkt?doc=<id>` and carry `data-doc` and `data-anchor`, so a reader can open them in place. Images and files point at `files/`; anything else in the repository points at GitHub.
- **Headings have ids** as on GitHub, so `#anchor` links keep working.
- **The build is deterministic** - it reads only the git tree, never the network or the clock, and the same commit gives the same files.

## How it is built
| File | Description |
|---|---|
| [api/build.mjs](./api/build.mjs) | The build: markdown to JSON, link rewriting, sanitising, navigation |
| [api/build.test.mjs](./api/build.test.mjs) | Checks that every document builds, every link resolves and the output matches the schemas |
| [api/schema](./api/schema/) | The JSON Schemas of the output |
| [package.json](./package.json) | Pinned versions of the build tools |
| [docs.yml](./.github/workflows/docs.yml) | Builds and checks on pull requests, publishes to GitHub Pages on `main` |
