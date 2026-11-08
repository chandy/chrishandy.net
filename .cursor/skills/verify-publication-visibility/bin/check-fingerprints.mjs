#!/usr/bin/env node
/**
 * Cheap sync gate: ensure the source snippets the TLA+ model claims to
 * mirror are still present. Does not run TLC. Exit 0 = fingerprints ok.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);

const checks = [
  {
    file: "src/utils/postFilter.ts",
    mustInclude: [
      "!data.draft",
      "import.meta.env.DEV",
      "SITE.scheduledPostMargin",
    ],
  },
  {
    file: "src/config.ts",
    mustInclude: ["scheduledPostMargin: 15 * 60 * 1000"],
  },
  {
    file: "src/pages/posts/[...slug]/index.astro",
    mustInclude: ['getCollection("blog", ({ data }) => !data.draft)'],
  },
  {
    file: "src/pages/archives/index.astro",
    mustInclude: ['getCollection("blog", ({ data }) => !data.draft)'],
  },
  {
    file: "src/pages/posts/[...slug]/index.png.ts",
    mustInclude: ["!data.draft && !data.ogImage"],
  },
  {
    file: "src/utils/getSortedPosts.ts",
    mustInclude: [".filter(postFilter)"],
  },
];

let failed = false;
for (const { file, mustInclude } of checks) {
  const full = path.join(repoRoot, file);
  if (!fs.existsSync(full)) {
    console.error(`MISSING ${file}`);
    failed = true;
    continue;
  }
  const text = fs.readFileSync(full, "utf8");
  for (const snippet of mustInclude) {
    if (!text.includes(snippet)) {
      console.error(`DRIFT ${file}: expected snippet not found:\n  ${snippet}`);
      failed = true;
    }
  }
}

if (failed) {
  console.error(
    "Fingerprints drifted. Update model/PostVisibility.tla to match the code, then /statechart.",
  );
  process.exit(1);
}
console.log("Fingerprints OK — model mappings still present in source.");
