import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { evidenceDirFor, REPO_ROOT } from "./paths.mjs";

function repoRel(absPath) {
  return path.relative(REPO_ROOT, absPath).split(path.sep).join("/");
}

export async function withBrowser(fn, { headless = true } = {}) {
  const browser = await chromium.launch({
    channel: "chrome",
    headless,
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    colorScheme: "light",
  });
  const page = await context.newPage();
  try {
    return await fn(page, context);
  } finally {
    await context.close();
    await browser.close();
  }
}

export function prepareEvidenceDir(featureId) {
  const dir = evidenceDirFor(featureId);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export async function captureProof(page, featureId, stem, { note } = {}) {
  const dir = prepareEvidenceDir(featureId);
  const screenshotPath = path.join(dir, `${stem}.png`);
  const ariaPath = path.join(dir, `${stem}.aria.txt`);
  const metaPath = path.join(dir, `${stem}.meta.json`);

  await page.screenshot({ path: screenshotPath, fullPage: true });

  let ariaText;
  try {
    ariaText = await page.locator("body").ariaSnapshot();
  } catch {
    const aria = await page.accessibility.snapshot({ interestingOnly: true });
    ariaText = formatAria(aria);
  }
  fs.writeFileSync(ariaPath, `${ariaText}\n`, "utf8");

  const meta = {
    featureId,
    stem,
    note: note ?? null,
    url: page.url(),
    title: await page.title(),
    capturedAt: new Date().toISOString(),
    screenshotPath: repoRel(screenshotPath),
    ariaPath: repoRel(ariaPath),
  };
  fs.writeFileSync(metaPath, `${JSON.stringify(meta, null, 2)}\n`, "utf8");
  return meta;
}

function formatAria(node, depth = 0) {
  if (!node) return "(empty accessibility tree)\n";
  const indent = "  ".repeat(depth);
  const role = node.role || "node";
  const name = node.name ? ` "${node.name}"` : "";
  const value = node.value != null ? ` = ${JSON.stringify(node.value)}` : "";
  let out = `${indent}${role}${name}${value}\n`;
  for (const child of node.children || []) {
    out += formatAria(child, depth + 1);
  }
  return out;
}

export async function gotoReady(page, url, { readySelector = "body" } = {}) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForSelector(readySelector, { timeout: 30_000 });
}
