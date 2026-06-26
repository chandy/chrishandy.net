import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const BLOG_DIR = join(import.meta.dirname, "../src/data/blog");
const CURSOR_CLOUD_AGENTS = join(BLOG_DIR, "cursor_cloud_agents.md");

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  assert.ok(match, "frontmatter block is required");
  const lines = match[1].split("\n");
  const data = {};
  let currentKey = null;
  let list = null;

  for (const line of lines) {
    if (line.startsWith("  - ")) {
      list.push(line.slice(4).trim());
      continue;
    }
    const kv = line.match(/^([\w]+):\s*(.*)$/);
    if (!kv) continue;
    currentKey = kv[1];
    const value = kv[2].trim();
    if (value === "") {
      list = [];
      data[currentKey] = list;
    } else if (value === "true" || value === "false") {
      data[currentKey] = value === "true";
    } else {
      data[currentKey] = value;
    }
  }
  return data;
}

describe("cursor cloud agents blog post", () => {
  it("exists on disk", () => {
    assert.ok(existsSync(CURSOR_CLOUD_AGENTS));
  });

  it("has valid required frontmatter", () => {
    const content = readFileSync(CURSOR_CLOUD_AGENTS, "utf8");
    const fm = parseFrontmatter(content);

    assert.equal(fm.author, "Chris Handy");
    assert.equal(fm.title, "Cursor Cloud Agents — autonomous coding that ships while you sleep");
    assert.equal(fm.draft, false);
    assert.ok(fm.description?.length > 20);
    assert.ok(fm.pubDatetime);
    assert.ok(Array.isArray(fm.tags));
    assert.ok(fm.tags.includes("cursor"));
    assert.ok(fm.tags.includes("agents"));
  });

  it("contains expected sections in the body", () => {
    const content = readFileSync(CURSOR_CLOUD_AGENTS, "utf8");
    const body = content.split("---").slice(2).join("---");

    assert.match(body, /## What are Cursor Cloud Agents\?/);
    assert.match(body, /## How they differ from local agents/);
    assert.match(body, /## Artifacts change how you review code/);
    assert.match(body, /## Setting up development environments/);
    assert.match(body, /## Tips for better results/);
    assert.match(body, /TL;DR/);
  });
});
