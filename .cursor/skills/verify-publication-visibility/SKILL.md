---
name: verify-publication-visibility
description: "Model-check that production builds of this Astro blog never expose draft or not-yet-scheduled posts on any public surface (home, posts list, post page, archives, RSS, tags, OG). Use when changing postFilter, getSortedPosts, getUniqueTags, getPostsByTag, scheduledPostMargin, draft frontmatter handling, or any page that loads the blog collection."
---

# Verify publication visibility

Cold-start skill: an agent mid-change can tell whether the edit touches the verified code, rerun the check, tell a real bug from a modeling error, and update the model when the change is intentional.

## Property

**In a production build, a post that is a draft or whose publish window has not opened must not appear on any public surface.**

Harm if broken: readers, RSS clients, search indexes, or link unfurls can see unpublished work.

## Tool

**TLA+ / TLC**, results read with `/statechart`.

Why: the question is whether any combination of post attributes and surface code paths can expose unpublished content. That is a finite configuration space over several independently written filters, which a model checker enumerates completely. A unit test of `postFilter` alone would miss surfaces that never call it. There is no TypeScript-native model checker in this repo; TLC fits, and `/statechart` turns each broken invariant into the shortest path in plain words.

## When this skill applies

Run it when the change touches any of:

| Path | Role |
| --- | --- |
| `src/utils/postFilter.ts` | Shared draft + schedule gate |
| `src/utils/getSortedPosts.ts` | Applies `postFilter` then sorts |
| `src/utils/getUniqueTags.ts` | Applies `postFilter` |
| `src/utils/getPostsByTag.ts` | Via `getSortedPosts` |
| `src/config.ts` (`scheduledPostMargin`) | Early-publish window |
| `src/pages/index.astro` | Home listing |
| `src/pages/posts/[...page].astro` | Paginated posts |
| `src/pages/posts/[...slug]/index.astro` | Per-post static paths (draft-only filter today) |
| `src/pages/posts/[...slug]/index.png.ts` | OG image paths (draft-only filter today) |
| `src/pages/archives/index.astro` | Archives (draft-only filter today) |
| `src/pages/rss.xml.ts` | RSS |
| `src/pages/tags/index.astro` | Tag index |
| `src/pages/tags/[tag]/[...page].astro` | Tag pages |
| `.cursor/skills/verify-publication-visibility/model/**` | This check |

If none of those changed since **Sync commit** below, say so and skip unless the user asked to recheck.

## How to run

1. Work in a scratch folder **outside** the repo for `/statechart` output (the command requires a new or empty `--out` dir).
2. Invoke `/statechart` on:
   - Spec: `.cursor/skills/verify-publication-visibility/model/PostVisibility.tla`
   - Config: `.cursor/skills/verify-publication-visibility/model/PostVisibility.cfg` (production, `DEV = FALSE`)
   - View: `.cursor/skills/verify-publication-visibility/model/view.mjs`
3. Read **every** result with `/statechart` (do not parse `tlc.out` by hand). Show the chart when present.
4. Optional: rerun with `PostVisibilityDev.cfg` (`DEV = TRUE`) to confirm the DEV profile. `ProductionHidesUnpublished` is vacuously true under DEV; `DraftNeverOnFilteredSurfaces` still applies.

Do not copy `/statechart` CLI paths into new scripts; resolve them through that skill so upgrades do not rot this one.

## How to read a result

- **Pass:** every invariant holds in the bound. That proves the **model**, not the whole site. Confirm the model still matches the code (next section) before trusting the pass.
- **Fail (`ProductionHidesUnpublished`):** a production surface can show a draft or still-scheduled post. Replay the `/statechart` path against the real files named in the model comments. If every step exists in code, it is a **finding** — report it; do not weaken the invariant or the model to make TLC green, and do not change product code unless the user asks.
- **Fail (`DraftNeverOnFilteredSurfaces`):** `postFilter` (or its model) admitted a draft onto home / posts list / RSS / tags.
- **Model error:** a step in the counterexample cannot happen in the cited code (wrong guard, wrong surface). Fix the model, not the property.

Known baseline findings (do not “fix” by weakening): under production, a **non-draft** post with `pubRel = "Future"` can reach `postPage`, `archives`, and `og` because those paths filter only `!data.draft` and skip the schedule check that `postFilter` applies.

## Keep the model true to the code

Before trusting a pass, confirm each mapping still holds:

| Model piece | Code |
| --- | --- |
| `PostFilterOK` | `src/utils/postFilter.ts` — `!data.draft && (import.meta.env.DEV \|\| isPublishTimePassed)` |
| `PublishTimePassed` / `Margin` | `SITE.scheduledPostMargin` in `src/config.ts` (15 minutes) |
| `ExposeHome` / `ExposePostsList` / `ExposeRss` / `ExposeTags` | callers of `getSortedPosts` / `getUniqueTags` / `getPostsByTag` |
| `ExposePostPage` | `getCollection(..., !data.draft)` in `posts/[...slug]/index.astro` `getStaticPaths` |
| `ExposeArchives` | same draft-only filter in `archives/index.astro` |
| `ExposeOg` | `!data.draft && !data.ogImage` in `posts/[...slug]/index.png.ts` |

One indivisible filter decision in code is one action guard in the model. Names match repo nouns (`draft`, `scheduledPostMargin`, surface routes).

If covered code changed and the model no longer describes it, update the model from the code **before** rerunning. Move **Sync commit** forward only after TLC/`/statechart` confirms the model describes that commit. For drift left by other merges, use `/maintain-formal-verification-skill`.

## Prove a change is caught (agent self-check)

When editing this skill or after a large refactor of the model:

1. Scratch-break **real** code, e.g. in `postFilter.ts` remove the `!data.draft &&` conjunct so drafts pass the schedule check alone.
2. Update `PostFilterOK` in the model to match that break (model must stay true to code).
3. Rerun `/statechart` on the production config — expect a new counterexample where a draft appears on a filtered surface (or production invariant fails).
4. Drop the scratch changes to code and model; rerun; confirm the result matches **baseline** (the known schedule-leak findings only, or pass if those were fixed on purpose with evidence).

## Bounds and assumptions

- Single post, attributes `draft ∈ BOOLEAN`, `pubRel ∈ {Past, Margin, Future}`; surfaces listed above.
- `DEV` is a constant (`FALSE` in the production config).
- Custom `ogImage` is assumed absent (OG route only built when `!ogImage` in code).
- Does not model Pagefind indexing, CDN caching, `_`-prefixed files excluded by the glob loader, timezone parsing of frontmatter, or pagination page-count side effects.
- Does not execute Astro; it checks the filter decisions each surface makes.

## Sync commit

- **Sync commit:** `(set on first green handoff commit of this skill)`
- **Last confirmed:** model describes the files in the table at that commit.

## Second nearby target

`src/utils/getPath.ts` underscore-directory exclusion and slug assembly — URL shape bugs are real but lower severity than leaking unpublished posts; verify only after this check stays in sync.
