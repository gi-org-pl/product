// Checks the docs build: every document builds, every internal link and anchor resolves, and every output file
// matches its JSON Schema. Run with `npm test`.

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { after, before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import { SOURCES, build, docIdFor } from "./build.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (dir, rel) => JSON.parse(fs.readFileSync(path.join(dir, rel), "utf8"));

let tmp;
let result;
let index;

before(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "docs-api-"));
  result = build({ out: path.join(tmp, "a") });
  index = read(result.out, "index.json");
});

after(() => fs.rmSync(tmp, { recursive: true, force: true }));

describe("docs build", () => {
  it("builds every published markdown file into a document", () => {
    const sources = execFileSync("git", ["ls-files", "-z", "--", ...SOURCES], { cwd: ROOT, encoding: "utf8" })
      .split("\0")
      .filter((f) => f.endsWith(".md") && !f.split("/").includes("tasks"));
    assert.ok(sources.length > 0);
    assert.deepEqual(index.docs.map((d) => d.id).sort(), sources.map(docIdFor).sort());
    for (const id of sources.map(docIdFor)) assert.ok(fs.existsSync(path.join(result.out, "docs", `${id}.json`)), id);
  });

  it("finds no broken internal link or anchor", () => {
    assert.deepEqual(result.problems, []);
  });

  it("publishes only the source folders, never developer tasks or other products", () => {
    for (const doc of index.docs) {
      assert.ok(SOURCES.includes(doc.section), doc.id);
      assert.ok(!doc.id.split("/").includes("tasks"), doc.id);
      assert.ok(!doc.id.startsWith("asystent-ngo"), doc.id);
    }
  });

  it("gives every document a unique id and a chain of prev and next in index order", () => {
    const ids = index.docs.map((d) => d.id);
    assert.equal(new Set(ids).size, ids.length);
    ids.forEach((id, i) => {
      const doc = read(result.out, `docs/${id}.json`);
      assert.equal(doc.prev?.id ?? null, ids[i - 1] ?? null, `${id} prev`);
      assert.equal(doc.next?.id ?? null, ids[i + 1] ?? null, `${id} next`);
    });
  });

  it("lists every document in the navigation tree exactly once", () => {
    const seen = [];
    const walk = (node) => {
      if (node.id) seen.push(node.id);
      (node.children || []).forEach(walk);
    };
    index.sections.forEach(walk);
    assert.deepEqual(seen, index.docs.map((d) => d.id));
  });

  it("matches the JSON Schemas", () => {
    const ajv = new Ajv2020({ allErrors: true, strict: true });
    addFormats(ajv);
    for (const f of ["index", "doc", "search"]) ajv.addSchema(JSON.parse(fs.readFileSync(path.join(ROOT, "api/schema", `${f}.schema.json`), "utf8")));
    const check = (schema, data, name) => {
      const validate = ajv.getSchema(`https://product.gi.org.pl/schema/${schema}.schema.json`);
      assert.ok(validate(data), `${name}: ${ajv.errorsText(validate.errors)}`);
    };
    check("index", index, "index.json");
    check("search", read(result.out, "search.json"), "search.json");
    for (const doc of index.docs) check("doc", read(result.out, `docs/${doc.id}.json`), doc.id);
  });

  it("keeps only allowed markup in the HTML", () => {
    for (const { id } of index.docs) {
      const { html } = read(result.out, `docs/${id}.json`);
      assert.doesNotMatch(html, /<(script|style|iframe|object|embed|form)\b/i, id);
      assert.doesNotMatch(html, /\son[a-z]+=/i, id);
      assert.doesNotMatch(html, /(href|src)="\.{0,2}\//, `${id} has a relative URL`);
    }
  });

  it("copies every linked file", () => {
    const prefix = `${index.baseUrl}/files/`;
    for (const { id } of index.docs) {
      const { html } = read(result.out, `docs/${id}.json`);
      for (const [, url] of html.matchAll(/(?:href|src|srcset)="([^"\s]+)/g)) {
        if (url.startsWith(prefix)) assert.ok(fs.existsSync(path.join(result.out, "files", decodeURIComponent(url.slice(prefix.length)))), `${id}: ${url}`);
      }
    }
  });

  it("is deterministic", () => {
    const second = build({ out: path.join(tmp, "b") });
    const list = (dir) => fs.readdirSync(dir, { recursive: true }).map(String).sort();
    assert.deepEqual(list(second.out), list(result.out));
    for (const rel of list(result.out)) {
      const file = path.join(result.out, rel);
      if (fs.statSync(file).isFile()) assert.ok(fs.readFileSync(file).equals(fs.readFileSync(path.join(second.out, rel))), rel);
    }
  });
});
