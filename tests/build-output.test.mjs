import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const DIST_DIR = join(import.meta.dirname, "../dist");
const POST_PATH = join(DIST_DIR, "posts/cursor-cloud-agents/index.html");
const TITLE =
  "Cursor Cloud Agents — autonomous coding that ships while you sleep";

describe("build output for cursor cloud agents post", () => {
  it("generates the post HTML page", () => {
    assert.ok(
      existsSync(POST_PATH),
      `expected built post at ${POST_PATH} — run pnpm build first`,
    );
  });

  it("includes the post title in the built page", () => {
    const html = readFileSync(POST_PATH, "utf8");
    assert.match(html, new RegExp(TITLE));
  });

  it("includes key content sections", () => {
    const html = readFileSync(POST_PATH, "utf8");
    assert.match(html, /What are Cursor Cloud Agents/);
    assert.match(html, /Artifacts change how you review code/);
    assert.match(html, /Setting up development environments/);
  });

  it("lists the post on the homepage", () => {
    const homepage = join(DIST_DIR, "index.html");
    assert.ok(existsSync(homepage));
    const html = readFileSync(homepage, "utf8");
    assert.match(html, /Cursor Cloud Agents/);
  });
});
