#!/usr/bin/env node
// Renders the README header of one repository from header.html with headless Chromium.
//
//   node render.cjs <repo-name> [--family gi|mypolitics] [--out header.png] [--font poppins-bold.ttf]
//
// The family defaults to mypolitics for names starting with "mypolitics" and to gi otherwise. Without --font,
// Poppins Bold comes from Google Fonts. Needs the playwright package with Chromium installed
// (npm install playwright && npx playwright install chromium); PLAYWRIGHT_MODULE may point at another copy.
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");

function parseArgs(argv) {
  const args = { out: "header.png" };
  const rest = [];
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i];
    if (flag === "--family" || flag === "--out" || flag === "--font") {
      args[flag.slice(2)] = argv[i + 1];
      i += 1;
    } else {
      rest.push(flag);
    }
  }
  if (rest.length !== 1) {
    throw new Error("usage: node render.cjs <repo-name> [--family gi|mypolitics] [--out header.png] [--font file.ttf]");
  }
  args.name = rest[0];
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const pageUrl = pathToFileURL(path.join(__dirname, "header.html"));
  pageUrl.searchParams.set("name", args.name);
  if (args.family) pageUrl.searchParams.set("family", args.family);
  if (args.font) pageUrl.searchParams.set("font", pathToFileURL(path.resolve(args.font)).href);

  // File access lets the page load a local font file next to the logo files.
  const browser = await chromium.launch({ args: ["--allow-file-access-from-files"] });
  try {
    const page = await browser.newPage({ viewport: { width: 1000, height: 300 }, deviceScaleFactor: 2 });
    await page.goto(pageUrl.href);
    await page.waitForFunction(() => document.body.dataset.ready || document.body.dataset.error);
    const error = await page.evaluate(() => document.body.dataset.error);
    if (error) throw new Error(error);
    const info = await page.evaluate(() => window.headerInfo);
    await page.locator("#card").screenshot({ path: path.resolve(args.out), omitBackground: true });
    console.log(`${path.resolve(args.out)}: ${JSON.stringify(info)}`);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
