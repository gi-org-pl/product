#!/usr/bin/env node
// Builds the markdown docs of this repository into JSON files for GitHub Pages.
//
//   node api/build.mjs --out _site
//
// The output is a function of the git tree only: no network, no clock. The same commit always gives the same
// bytes. Broken internal links and anchors fail the build. See "Docs API" in the README for the file layout.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import GithubSlugger from "github-slugger";
import hljs from "highlight.js";
import MarkdownIt from "markdown-it";
import sanitizeHtml from "sanitize-html";
import YAML from "yaml";

export const SCHEMA_VERSION = 1;

/** Folders that are published, in the order of the navigation. Their README's first heading names the section. */
export const SOURCES = ["gi", "mypolitics"];

/** A path with one of these segments is not published (developer tasks are read on GitHub). */
const EXCLUDED_SEGMENTS = new Set(["tasks"]);

const REPOSITORY = "gi-org-pl/product";
const BRANCH = "main";
const CUSTOM_DOMAIN = "product.gi.org.pl";
const SCHEMA_FILES = ["index.schema.json", "doc.schema.json", "search.schema.json"];

const DEFAULTS = {
  baseUrl: `https://${CUSTOM_DOMAIN}`,
  siteUrl: "https://gi.org.pl/produkt",
};

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// ---------------------------------------------------------------------------------------------------------------
// Repository listing

function git(args) {
  return execFileSync("git", args, { cwd: ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
}

function isPublished(file) {
  const segments = file.split("/");
  return SOURCES.includes(segments[0]) && !segments.some((s) => EXCLUDED_SEGMENTS.has(s));
}

/** Tracked files only, so that local leftovers never reach the output. */
function listTrackedFiles() {
  return git(["ls-files", "-z"]).split("\0").filter(Boolean).sort();
}

/** The date of the last commit that touched each file, from one pass over the log. */
function lastCommitDates(files) {
  const wanted = new Set(files);
  const dates = new Map();
  let current = null;
  const log = git(["log", "--format=%x00%cI", "--name-only", "--no-renames", "--", ...SOURCES]);
  for (const line of log.split("\n")) {
    if (line.startsWith("\0")) {
      current = line.slice(1).trim();
    } else if (line && current && wanted.has(line) && !dates.has(line)) {
      dates.set(line, current);
    }
  }
  return dates;
}

// ---------------------------------------------------------------------------------------------------------------
// Ids and URLs

/** `mypolitics/docs/concept/README.md` -> `mypolitics/docs/concept`; `gi/docs/roadmap/roadmap.md` -> `gi/docs/roadmap/roadmap`. */
export function docIdFor(file) {
  const withoutExt = file.replace(/\.md$/i, "");
  return withoutExt.endsWith("/README") ? withoutExt.slice(0, -"/README".length) : withoutExt;
}

function githubUrl(kind, file) {
  return `https://github.com/${REPOSITORY}/${kind}/${BRANCH}/${file}`;
}

function encodePath(p) {
  return p.split("/").map(encodeURIComponent).join("/");
}

function titleFromName(name) {
  const words = name.replace(/\.md$/i, "").replace(/[-_]+/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

// ---------------------------------------------------------------------------------------------------------------
// Markdown

function parseFrontmatter(source) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(source);
  if (!match) return { frontmatter: {}, body: source };
  const data = YAML.parse(match[1]) ?? {};
  return { frontmatter: typeof data === "object" && !Array.isArray(data) ? data : {}, body: source.slice(match[0].length) };
}

/** GitHub-style task lists: `- [ ] text` and `- [x] text` become disabled checkboxes. */
function taskLists(md) {
  md.core.ruler.after("inline", "task-lists", (state) => {
    const tokens = state.tokens;
    for (let i = 2; i < tokens.length; i++) {
      const inline = tokens[i];
      if (inline.type !== "inline" || tokens[i - 1].type !== "paragraph_open" || tokens[i - 2].type !== "list_item_open") continue;
      const first = inline.children[0];
      const m = first && first.type === "text" ? /^\[([ xX])\]\s/.exec(first.content) : null;
      if (!m) continue;
      first.content = first.content.slice(m[0].length);
      const box = new state.Token("html_inline", "", 0);
      box.content = `<input type="checkbox" class="task-list-item-checkbox" disabled${m[1] === " " ? "" : " checked"}> `;
      inline.children.unshift(box);
      tokens[i - 2].attrJoin("class", "task-list-item");
      for (let j = i - 3; j >= 0; j--) {
        if ((tokens[j].type === "bullet_list_open" || tokens[j].type === "ordered_list_open") && tokens[j].level === tokens[i - 2].level - 1) {
          if (!(tokens[j].attrGet("class") || "").includes("contains-task-list")) tokens[j].attrJoin("class", "contains-task-list");
          break;
        }
      }
    }
  });
}

function createMarkdown() {
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: false,
    highlight(code, lang) {
      const language = lang && hljs.getLanguage(lang) ? lang : null;
      if (!language) return "";
      return `<pre class="hljs"><code class="hljs language-${language}">${hljs.highlight(code, { language, ignoreIllegals: true }).value}</code></pre>`;
    },
  });
  md.use(taskLists);
  return md;
}

function inlineText(token) {
  if (!token.children) return token.content;
  return token.children
    .map((c) => (c.type === "text" || c.type === "code_inline" ? c.content : c.type === "softbreak" || c.type === "hardbreak" ? " " : c.type === "image" ? "" : ""))
    .join("");
}

function collapse(text) {
  return text.replace(/\s+/g, " ").trim();
}

function truncate(text, max) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s.,;:-]+$/, "")}…`;
}

// ---------------------------------------------------------------------------------------------------------------
// HTML sanitising

const ALLOWED_CLASSES = /^(hljs(-[\w-]+)?|language-[\w+-]+|task-list-item|contains-task-list|task-list-item-checkbox)$/;

function sanitizeOptions(rewriteUrl) {
  const filterClass = (attribs) => {
    if (attribs.class) {
      const kept = attribs.class.split(/\s+/).filter((c) => ALLOWED_CLASSES.test(c));
      if (kept.length) attribs.class = kept.join(" ");
      else delete attribs.class;
    }
    return attribs;
  };
  return {
    allowedTags: [
      "h1", "h2", "h3", "h4", "h5", "h6", "p", "a", "ul", "ol", "li", "blockquote", "pre", "code", "span", "em",
      "strong", "del", "s", "table", "thead", "tbody", "tr", "th", "td", "img", "picture", "source", "hr", "br",
      "input", "details", "summary", "sup", "sub", "kbd",
    ],
    allowedAttributes: {
      a: ["href", "title", "data-doc", "data-anchor", "rel"],
      img: ["src", "alt", "title", "width", "height", "loading"],
      source: ["srcset", "media", "type"],
      h1: ["id"], h2: ["id"], h3: ["id"], h4: ["id"], h5: ["id"], h6: ["id"],
      ol: ["start", "class"], ul: ["class"], li: ["class"],
      pre: ["class"], code: ["class"], span: ["class"],
      th: ["style"], td: ["style"],
      input: ["type", "checked", "disabled", "class"],
    },
    allowedStyles: { th: { "text-align": [/^(left|right|center)$/] }, td: { "text-align": [/^(left|right|center)$/] } },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesAppliedToAttributes: ["href", "src", "srcset"],
    allowProtocolRelative: false,
    selfClosing: ["img", "br", "hr", "input", "source"],
    transformTags: {
      a: (tagName, attribs) => ({ tagName, attribs: filterClass({ ...attribs, ...rewriteUrl("link", attribs.href) }) }),
      img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, src: rewriteUrl("asset", attribs.src).href, loading: "lazy" } }),
      source: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          srcset: (attribs.srcset || "")
            .split(",")
            .map((part) => {
              const [url, ...rest] = part.trim().split(/\s+/);
              return [rewriteUrl("asset", url).href, ...rest].join(" ");
            })
            .join(", "),
        },
      }),
      input: (tagName, attribs) => (attribs.type === "checkbox" ? { tagName, attribs: filterClass({ ...attribs, disabled: "" }) } : { tagName: "span", attribs: {} }),
      ul: (tagName, attribs) => ({ tagName, attribs: filterClass(attribs) }),
      ol: (tagName, attribs) => ({ tagName, attribs: filterClass(attribs) }),
      li: (tagName, attribs) => ({ tagName, attribs: filterClass(attribs) }),
      pre: (tagName, attribs) => ({ tagName, attribs: filterClass(attribs) }),
      code: (tagName, attribs) => ({ tagName, attribs: filterClass(attribs) }),
      span: (tagName, attribs) => ({ tagName, attribs: filterClass(attribs) }),
    },
  };
}

// ---------------------------------------------------------------------------------------------------------------
// The build

export function build({ out, baseUrl = DEFAULTS.baseUrl, assetBaseUrl, siteUrl = DEFAULTS.siteUrl } = {}) {
  baseUrl = baseUrl.replace(/\/+$/, "");
  assetBaseUrl = (assetBaseUrl || `${baseUrl}/files`).replace(/\/+$/, "");
  siteUrl = siteUrl.replace(/\/+$/, "");

  const tracked = listTrackedFiles();
  const trackedSet = new Set(tracked);
  const trackedDirs = new Set();
  for (const f of tracked) {
    const parts = f.split("/");
    for (let i = 1; i < parts.length; i++) trackedDirs.add(parts.slice(0, i).join("/"));
  }

  const published = tracked.filter(isPublished);
  const docFiles = published.filter((f) => f.toLowerCase().endsWith(".md"));
  const assetFiles = published.filter((f) => !f.toLowerCase().endsWith(".md") && path.posix.basename(f) !== ".gitkeep");
  const assetSet = new Set(assetFiles);
  const docIdByFile = new Map(docFiles.map((f) => [f, docIdFor(f)]));
  const dates = lastCommitDates(docFiles);
  const md = createMarkdown();

  const problems = [];
  const anchorChecks = [];

  // Pass 1: render every document.
  const docs = new Map();
  for (const file of docFiles) {
    const id = docIdByFile.get(file);
    const source = fs.readFileSync(path.join(ROOT, file), "utf8").replace(/\r\n/g, "\n");
    const { frontmatter, body } = parseFrontmatter(source);
    const tokens = md.parse(body, {});
    const slugger = new GithubSlugger();
    const toc = [];
    const headingTexts = [];
    const anchors = new Set();
    let title = null;
    let titleIndex = -1;
    let description = null;
    let excerpt = null;
    const textParts = [];

    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      if (t.type === "heading_open") {
        const text = collapse(inlineText(tokens[i + 1]));
        const slug = slugger.slug(text);
        t.attrSet("id", slug);
        anchors.add(slug);
        const level = Number(t.tag.slice(1));
        if (level === 1 && title === null) {
          title = text;
          titleIndex = i;
        } else {
          headingTexts.push(text);
          if (level >= 2 && level <= 4) toc.push({ level, text, id: slug });
        }
      }
      if (t.type === "inline") textParts.push(inlineText(t));
      if (t.type === "fence" || t.type === "code_block") textParts.push(t.content);
      if (t.type === "html_block") {
        for (const m of t.content.matchAll(/\sid="([^"]+)"/g)) anchors.add(m[1]);
      }
      // README standard: the blockquote right under the title is the document's one-line description.
      if (description === null && t.type === "blockquote_open" && titleIndex >= 0 && i === titleIndex + 3) {
        const inner = [];
        for (let j = i + 1; j < tokens.length && tokens[j].type !== "blockquote_close"; j++) if (tokens[j].type === "inline") inner.push(inlineText(tokens[j]));
        description = collapse(inner.join(" "));
      }
      if (excerpt === null && t.type === "paragraph_open" && t.level === 0) {
        const text = collapse(inlineText(tokens[i + 1]));
        if (text) excerpt = truncate(text, 240);
      }
    }

    // The title is shown by the reader on its own; the body starts after it.
    const bodyTokens = titleIndex >= 0 ? [...tokens.slice(0, titleIndex), ...tokens.slice(titleIndex + 3)] : tokens;
    const rawHtml = md.renderer.render(bodyTokens, md.options, {});

    docs.set(id, {
      id,
      file,
      frontmatter,
      title: typeof frontmatter.title === "string" ? frontmatter.title : title ?? titleFromName(path.posix.basename(file === `${id}.md` ? file : id)),
      description: typeof frontmatter.description === "string" ? frontmatter.description : description,
      excerpt,
      toc,
      headingTexts,
      anchors,
      rawHtml,
      markdown: source,
      plainText: collapse(textParts.join(" ")),
      linkOrder: [],
    });
  }

  // Pass 2: rewrite links and sanitise, now that every document and anchor is known.
  const docDirOf = (id) => (docs.get(id).file.endsWith("/README.md") ? id : path.posix.dirname(id));

  for (const doc of docs.values()) {
    const fromDir = path.posix.dirname(doc.file);
    const rewriteUrl = (kind, raw) => {
      if (!raw) return { href: raw };
      const url = raw.trim();
      if (/^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith("//")) return { href: url };
      const hashIndex = url.indexOf("#");
      const rawPath = hashIndex >= 0 ? url.slice(0, hashIndex) : url;
      const anchor = hashIndex >= 0 ? decodeURIComponent(url.slice(hashIndex + 1)) : "";
      const cleanPath = decodeURIComponent(rawPath.split("?")[0]);

      if (!cleanPath) {
        if (anchor) anchorChecks.push({ from: doc.file, to: doc.id, anchor, raw });
        return { href: `#${encodeURIComponent(anchor)}`, "data-doc": doc.id, "data-anchor": anchor };
      }

      const target = cleanPath.startsWith("/")
        ? path.posix.normalize(cleanPath.slice(1))
        : path.posix.normalize(path.posix.join(fromDir, cleanPath));
      const targetNoSlash = target.replace(/\/+$/, "");

      // A document, or a folder whose README is a document.
      let targetDoc = null;
      if (docIdByFile.has(targetNoSlash)) targetDoc = docIdByFile.get(targetNoSlash);
      else if (docIdByFile.has(`${targetNoSlash}/README.md`)) targetDoc = docIdByFile.get(`${targetNoSlash}/README.md`);
      if (targetDoc && kind === "link") {
        if (anchor) anchorChecks.push({ from: doc.file, to: targetDoc, anchor, raw });
        doc.linkOrder.push(targetDoc);
        return {
          href: `${siteUrl}?doc=${encodeURIComponent(targetDoc).replace(/%2F/g, "/")}${anchor ? `#${encodeURIComponent(anchor)}` : ""}`,
          "data-doc": targetDoc,
          ...(anchor ? { "data-anchor": anchor } : {}),
        };
      }
      if (assetSet.has(targetNoSlash)) return { href: `${assetBaseUrl}/${encodePath(targetNoSlash)}` };
      if (trackedSet.has(targetNoSlash)) return { href: githubUrl("blob", encodePath(targetNoSlash)) + (anchor ? `#${anchor}` : "") };
      if (trackedDirs.has(targetNoSlash)) return { href: githubUrl("tree", encodePath(targetNoSlash)) };
      problems.push(`${doc.file}: broken ${kind === "link" ? "link" : "image"} "${raw}" (resolves to ${target})`);
      return { href: githubUrl("blob", encodePath(targetNoSlash)) };
    };
    doc.html = sanitizeHtml(doc.rawHtml, sanitizeOptions(rewriteUrl));
  }

  for (const check of anchorChecks) {
    if (!docs.get(check.to).anchors.has(check.anchor)) problems.push(`${check.from}: broken anchor "${check.raw}" (no heading "#${check.anchor}" in ${docs.get(check.to).file})`);
  }

  // Navigation: one tree per source folder, mirroring the folders. Children follow the order in which the folder's
  // README links to them; the rest follow by path.
  const buildNode = (dir) => {
    const readmeId = docIdByFile.get(`${dir}/README.md`) ?? null;
    const childDirs = new Set();
    const childDocs = [];
    for (const id of docs.keys()) {
      const file = docs.get(id).file;
      if (!file.startsWith(`${dir}/`) || file === `${dir}/README.md`) continue;
      const rest = file.slice(dir.length + 1).split("/");
      if (rest.length === 1) childDocs.push(id);
      else childDirs.add(`${dir}/${rest[0]}`);
    }
    const children = [
      ...childDocs.map((id) => ({ id, title: docs.get(id).title, path: docs.get(id).file, firstDoc: id })),
      ...[...childDirs].map((d) => buildNode(d)),
    ];
    const order = readmeId ? docs.get(readmeId).linkOrder : [];
    const rank = (node) => {
      const ids = node.children ? collectIds(node) : [node.id];
      const positions = ids.map((x) => order.indexOf(x)).filter((p) => p >= 0);
      return positions.length ? Math.min(...positions) : Number.MAX_SAFE_INTEGER;
    };
    children.sort((a, b) => rank(a) - rank(b) || (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
    for (const c of children) delete c.firstDoc;
    return {
      id: readmeId,
      title: readmeId ? docs.get(readmeId).title : titleFromName(path.posix.basename(dir)),
      path: `${dir}/`,
      children,
    };
  };
  const collectIds = (node) => [...(node.id ? [node.id] : []), ...(node.children || []).flatMap((c) => (c.children ? collectIds(c) : [c.id]))];

  const sections = SOURCES.filter((s) => trackedDirs.has(s)).map((s) => buildNode(s));
  const order = sections.flatMap(collectIds);
  const sectionOf = (id) => id.split("/")[0];
  const sectionTitle = new Map(sections.map((s) => [s.path.replace(/\/$/, ""), s.title]));

  const breadcrumbsOf = (id) => {
    const crumbs = [];
    const walk = (node, trail) => {
      if (node.id === id && node.children) return trail;
      for (const child of node.children || []) {
        if (child.id === id && !child.children) return [...trail, node];
        if (child.children) {
          const found = walk(child, [...trail, node]);
          if (found) return found;
        }
      }
      return null;
    };
    for (const s of sections) {
      const found = walk(s, []);
      if (found) {
        for (const n of found) crumbs.push({ id: n.id, title: n.title });
        break;
      }
    }
    return crumbs;
  };

  const tagsOf = (doc) => {
    if (Array.isArray(doc.frontmatter.tags)) return doc.frontmatter.tags.map(String);
    return path.posix.dirname(doc.file).split("/").slice(1).filter((s) => s !== "docs");
  };

  // Output.
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });
  const write = (rel, data) => {
    const file = path.join(out, rel);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, typeof data === "string" ? data : `${JSON.stringify(data)}\n`);
  };

  const commit = git(["rev-parse", "HEAD"]).trim();
  const generatedAt = git(["log", "-1", "--format=%cI", "HEAD"]).trim();
  const summary = (id) => {
    const d = docs.get(id);
    return {
      id,
      title: d.title,
      path: d.file,
      section: sectionOf(id),
      description: d.description,
      updated: dates.get(d.file) ?? null,
      tags: tagsOf(d),
      excerpt: d.excerpt ?? (d.description ? truncate(d.description, 240) : null),
      url: `${baseUrl}/docs/${encodePath(id)}.json`,
    };
  };
  const link = (id) => (id ? { id, title: docs.get(id).title } : null);

  order.forEach((id, i) => {
    const d = docs.get(id);
    write(`docs/${id}.json`, {
      $schema: `${baseUrl}/schema/doc.schema.json`,
      schemaVersion: SCHEMA_VERSION,
      ...summary(id),
      sectionTitle: sectionTitle.get(sectionOf(id)),
      breadcrumbs: breadcrumbsOf(id),
      frontmatter: d.frontmatter,
      toc: d.toc,
      html: d.html,
      markdown: d.markdown,
      githubUrl: githubUrl("blob", encodePath(d.file)),
      editUrl: githubUrl("edit", encodePath(d.file)),
      prev: link(order[i - 1]),
      next: link(order[i + 1]),
    });
  });

  write("index.json", {
    $schema: `${baseUrl}/schema/index.schema.json`,
    schemaVersion: SCHEMA_VERSION,
    repository: REPOSITORY,
    branch: BRANCH,
    commit,
    generatedAt,
    baseUrl,
    siteUrl,
    files: {
      search: `${baseUrl}/search.json`,
      doc: `${baseUrl}/docs/{id}.json`,
      asset: `${assetBaseUrl}/{path}`,
      schemas: SCHEMA_FILES.map((f) => `${baseUrl}/schema/${f}`),
    },
    sections,
    docs: order.map(summary),
  });

  write("search.json", {
    $schema: `${baseUrl}/schema/search.schema.json`,
    schemaVersion: SCHEMA_VERSION,
    commit,
    docs: order.map((id) => {
      const d = docs.get(id);
      return { id, title: d.title, section: sectionOf(id), headings: d.headingTexts, text: d.plainText };
    }),
  });

  for (const f of SCHEMA_FILES) write(`schema/${f}`, fs.readFileSync(path.join(ROOT, "api", "schema", f), "utf8"));
  for (const f of assetFiles) {
    const dest = path.join(out, "files", f);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(path.join(ROOT, f), dest);
  }
  write("CNAME", `${CUSTOM_DOMAIN}\n`);
  write(".nojekyll", "");

  return { docs: order.length, assets: assetFiles.length, problems, order, out };
}

// ---------------------------------------------------------------------------------------------------------------
// CLI

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const args = process.argv.slice(2);
  const arg = (name) => {
    const i = args.indexOf(name);
    return i >= 0 ? args[i + 1] : undefined;
  };
  const out = path.resolve(arg("--out") ?? "_site");
  const result = build({
    out,
    baseUrl: process.env.DOCS_BASE_URL || DEFAULTS.baseUrl,
    assetBaseUrl: process.env.DOCS_ASSET_BASE_URL || undefined,
    siteUrl: process.env.DOCS_SITE_URL || DEFAULTS.siteUrl,
  });
  for (const p of result.problems) console.error(p);
  console.log(`${result.docs} documents and ${result.assets} files written to ${path.relative(ROOT, out) || "."}`);
  if (result.problems.length) {
    console.error(`${result.problems.length} broken link(s) - fix them in the markdown`);
    process.exit(1);
  }
}
