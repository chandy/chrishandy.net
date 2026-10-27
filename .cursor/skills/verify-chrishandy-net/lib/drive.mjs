import fs from "node:fs";
import path from "node:path";
import { readState, baseUrlFromState } from "./state.mjs";
import { withBrowser, captureProof, gotoReady, prepareEvidenceDir } from "./browser.mjs";
import { fetchOk } from "./http.mjs";
import { isPidAlive } from "./process.mjs";

export const FEATURES = {
  home: driveHome,
  posts: drivePosts,
  search: driveSearch,
  tags: driveTags,
  "about-theme": driveAboutTheme,
};

export function listFeatures() {
  return Object.keys(FEATURES);
}

export async function drive(featureId, { dryRun = false } = {}) {
  if (!FEATURES[featureId]) {
    const err = new Error(
      `Unknown feature "${featureId}". Known: ${listFeatures().join(", ")}`,
    );
    err.code = "UNKNOWN_FEATURE";
    throw err;
  }

  if (dryRun) {
    return {
      dryRun: true,
      featureId,
      would: `Drive features/${featureId}.md via Playwright against the launched preview URL`,
    };
  }

  const state = readState();
  if (!state) {
    throw Object.assign(new Error("No launched instance. Run verify-site launch first."), {
      code: "NO_STATE",
    });
  }

  const health = await assertHealthy(state);
  if (!health.ok) {
    throw Object.assign(
      new Error(`Doctor failed before drive: ${JSON.stringify(health.checks)}`),
      { code: "DOCTOR_FAIL" },
    );
  }

  const baseUrl = baseUrlFromState(state);
  prepareEvidenceDir(featureId);

  const proof = await withBrowser(async page => {
    return FEATURES[featureId](page, baseUrl, featureId);
  });

  const summaryPath = path.join(prepareEvidenceDir(featureId), "PROOF.json");
  const summary = {
    featureId,
    ok: true,
    baseUrl,
    provenAt: new Date().toISOString(),
    ...proof,
  };
  fs.writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  return summary;
}

async function assertHealthy(state) {
  const checks = {
    process: { ok: isPidAlive(state.pid) },
    http: { ok: false },
  };
  const base = baseUrlFromState(state);
  const home = base ? await fetchOk(`${base}/`) : { ok: false };
  checks.http = { ok: !!home.ok };
  return { ok: Object.values(checks).every(c => c.ok), checks, state };
}

async function driveHome(page, baseUrl, featureId) {
  await gotoReady(page, `${baseUrl}/`, { readySelector: "#main-content" });

  const brand = page.getByRole("link", { name: "Chris Handy", exact: true });
  await brand.waitFor({ state: "visible" });

  const welcome = page.getByText("Welcome to my words.");
  await welcome.waitFor({ state: "visible" });

  const before = await captureProof(page, featureId, "01-home", {
    note: "Home loaded with brand and welcome copy",
  });

  await page.getByRole("link", { name: "Posts", exact: true }).click();
  await page.waitForURL(/\/posts\/?$/);
  await page.getByRole("heading", { name: "Posts", exact: true }).waitFor();

  const after = await captureProof(page, featureId, "02-posts-nav", {
    note: "Navigated to Posts via header link",
  });

  return {
    steps: ["home-identity", "nav-posts"],
    artifacts: [before, after],
  };
}

async function drivePosts(page, baseUrl, featureId) {
  await gotoReady(page, `${baseUrl}/posts/`, { readySelector: "#main-content" });
  await page.getByRole("heading", { name: "Posts", exact: true }).waitFor();

  const listProof = await captureProof(page, featureId, "01-posts-list", {
    note: "Posts listing visible",
  });

  const postLink = page.getByRole("link", { name: /Why start a blog\?/ }).first();
  await postLink.waitFor({ state: "visible" });
  await postLink.click();
  await page.waitForURL(/\/posts\/why-start-a-blog\/?/);
  await page.getByRole("heading", { name: "Why start a blog?", exact: true }).waitFor();

  const detailProof = await captureProof(page, featureId, "02-post-detail", {
    note: "Opened Why start a blog? post detail",
  });

  return {
    steps: ["posts-list", "post-detail"],
    artifacts: [listProof, detailProof],
  };
}

async function driveSearch(page, baseUrl, featureId) {
  await gotoReady(page, `${baseUrl}/search/`, { readySelector: "#pagefind-search" });
  await page.getByRole("heading", { name: "Search", exact: true }).waitFor();

  // Pagefind default UI search input
  const input = page.locator(".pagefind-ui__search-input");
  await input.waitFor({ state: "visible", timeout: 30_000 });

  const emptyProof = await captureProof(page, featureId, "01-search-open", {
    note: "Search page with Pagefind input ready",
  });

  await input.fill("agents");
  // Wait for results (Pagefind results list)
  const results = page.locator(".pagefind-ui__results");
  await results.waitFor({ state: "visible", timeout: 30_000 });
  await page.locator(".pagefind-ui__result").first().waitFor({ state: "visible", timeout: 30_000 });

  // Confirm a known post appears
  const match = page.getByRole("link", { name: /AI agents|Cursor Cloud Agents/i }).first();
  await match.waitFor({ state: "visible", timeout: 30_000 });

  const matchProof = await captureProof(page, featureId, "02-search-results", {
    note: "Query 'agents' returns matching post link(s)",
  });

  // Empty state
  await input.fill("xyzzy-no-such-post-chrishandy");
  await page
    .locator(".pagefind-ui__message, .pagefind-ui__results")
    .first()
    .waitFor({ state: "visible", timeout: 30_000 });
  // Give Pagefind a beat to settle empty message
  await page.waitForTimeout(500);
  const emptyMsg = page.locator(".pagefind-ui__message");
  const emptyVisible = await emptyMsg.isVisible().catch(() => false);
  const resultCount = await page.locator(".pagefind-ui__result").count();
  if (!emptyVisible && resultCount > 0) {
    throw new Error(
      `Expected empty search state for nonsense query; got ${resultCount} result(s)`,
    );
  }

  const missProof = await captureProof(page, featureId, "03-search-empty", {
    note: "Nonsense query shows empty/no-results state",
  });

  return {
    steps: ["search-open", "search-match", "search-empty"],
    query: "agents",
    artifacts: [emptyProof, matchProof, missProof],
  };
}

async function driveTags(page, baseUrl, featureId) {
  await gotoReady(page, `${baseUrl}/tags/`, { readySelector: "#main-content" });
  await page.getByRole("heading", { name: "Tags", exact: true }).waitFor();

  const indexProof = await captureProof(page, featureId, "01-tags-index", {
    note: "Tags index listing",
  });

  const docsTag = page.locator('a[data-tag-name="docs"]').first();
  await docsTag.waitFor({ state: "visible" });
  await docsTag.click();
  await page.waitForURL(/\/tags\/docs\/?/);
  await page.getByRole("heading", { name: /docs/i }).waitFor();

  const tagProof = await captureProof(page, featureId, "02-tag-docs", {
    note: "Opened docs tag listing",
  });

  return {
    steps: ["tags-index", "tag-docs"],
    artifacts: [indexProof, tagProof],
  };
}

async function driveAboutTheme(page, baseUrl, featureId) {
  await gotoReady(page, `${baseUrl}/about/`, { readySelector: "#main-content" });
  await page.getByRole("heading", { name: "About", exact: true }).waitFor();
  await page.getByText(/Chris Handy/).first().waitFor();

  const aboutProof = await captureProof(page, featureId, "01-about", {
    note: "About page content visible",
  });

  const themeBtn = page.locator("#theme-btn");
  await themeBtn.waitFor({ state: "visible" });
  const before = await themeBtn.getAttribute("aria-label");
  await themeBtn.click();
  await page.waitForFunction(
    prev => document.querySelector("#theme-btn")?.getAttribute("aria-label") !== prev,
    before,
    { timeout: 5_000 },
  );
  const after = await themeBtn.getAttribute("aria-label");
  const htmlTheme = await page.locator("html").getAttribute("data-theme");

  if (!after || after === before) {
    throw new Error(`Theme toggle did not change aria-label (still ${before})`);
  }
  if (htmlTheme !== after) {
    throw new Error(`data-theme=${htmlTheme} does not match button aria-label=${after}`);
  }

  const themeProof = await captureProof(page, featureId, "02-theme-toggled", {
    note: `Theme toggled ${before} → ${after}`,
  });

  return {
    steps: ["about-content", "theme-toggle"],
    theme: { before, after, dataTheme: htmlTheme },
    artifacts: [aboutProof, themeProof],
  };
}
