---- MODULE PostVisibility ----
\* Models which public surfaces of the chrishandy.net Astro blog can expose a
\* single blog post, given draft / schedule / build-mode. Each action mirrors
\* one code path named in the comments. See the skill SKILL.md for coverage.

EXTENDS Integers, FiniteSets, TLC

CONSTANTS
  DEV
  \* TRUE  = import.meta.env.DEV (astro dev)
  \* FALSE = production build / preview (the live site)

VARIABLES
  draft,   \* post frontmatter draft (BOOLEAN); optional in schema, treated as FALSE when absent
  pubRel,  \* publish time relative to Date.now() and SITE.scheduledPostMargin
  exposed  \* set of surface names that currently include this post

\* pubRel values:
\*   "Past"   — Date.now() > pubDatetime          (clearly published)
\*   "Margin" — within the early window of
\*              SITE.scheduledPostMargin (15 min in src/config.ts), so
\*              Date.now() > pubDatetime - margin  (postFilter allows)
\*   "Future" — Date.now() <= pubDatetime - margin (not yet publishable)

PubRels == {"Past", "Margin", "Future"}

\* Surfaces that can show a post to a reader or feed consumer.
Surfaces == {
  "home",       \* src/pages/index.astro → getSortedPosts
  "postsList",  \* src/pages/posts/[...page].astro → getSortedPosts
  "rss",        \* src/pages/rss.xml.ts → getSortedPosts
  "tags",       \* src/pages/tags/** → getUniqueTags / getPostsByTag → postFilter
  "postPage",   \* src/pages/posts/[...slug]/index.astro getStaticPaths
  "archives",   \* src/pages/archives/index.astro getCollection filter
  "og"          \* src/pages/posts/[...slug]/index.png.ts getStaticPaths
}

vars == <<draft, pubRel, exposed>>

----------------------------------------------------------------------------
\* Derived from src/utils/postFilter.ts
\*   isPublishTimePassed =
\*     Date.now() > new Date(data.pubDatetime).getTime() - SITE.scheduledPostMargin
PublishTimePassed == pubRel \in {"Past", "Margin"}

\* src/utils/postFilter.ts — the shared gate used by getSortedPosts / getUniqueTags
PostFilterOK ==
  (~draft) /\ (DEV \/ PublishTimePassed)

----------------------------------------------------------------------------
Init ==
  /\ draft \in BOOLEAN
  /\ pubRel \in PubRels
  /\ exposed = {}

\* getSortedPosts → postFilter (home, posts list, rss, tags)
ExposeHome ==
  /\ PostFilterOK
  /\ "home" \notin exposed
  /\ exposed' = exposed \union {"home"}
  /\ UNCHANGED <<draft, pubRel>>

ExposePostsList ==
  /\ PostFilterOK
  /\ "postsList" \notin exposed
  /\ exposed' = exposed \union {"postsList"}
  /\ UNCHANGED <<draft, pubRel>>

ExposeRss ==
  /\ PostFilterOK
  /\ "rss" \notin exposed
  /\ exposed' = exposed \union {"rss"}
  /\ UNCHANGED <<draft, pubRel>>

ExposeTags ==
  /\ PostFilterOK
  /\ "tags" \notin exposed
  /\ exposed' = exposed \union {"tags"}
  /\ UNCHANGED <<draft, pubRel>>

\* src/pages/posts/[...slug]/index.astro getStaticPaths:
\*   getCollection("blog", ({ data }) => !data.draft)
ExposePostPage ==
  /\ ~draft
  /\ "postPage" \notin exposed
  /\ exposed' = exposed \union {"postPage"}
  /\ UNCHANGED <<draft, pubRel>>

\* src/pages/archives/index.astro:
\*   getCollection("blog", ({ data }) => !data.draft)
ExposeArchives ==
  /\ ~draft
  /\ "archives" \notin exposed
  /\ exposed' = exposed \union {"archives"}
  /\ UNCHANGED <<draft, pubRel>>

\* src/pages/posts/[...slug]/index.png.ts:
\*   !data.draft && !data.ogImage  (model assumes no custom ogImage)
ExposeOg ==
  /\ ~draft
  /\ "og" \notin exposed
  /\ exposed' = exposed \union {"og"}
  /\ UNCHANGED <<draft, pubRel>>

\* Allow stutter so terminal states are not reported as deadlock.
Stutter == UNCHANGED vars

Next ==
  \/ ExposeHome
  \/ ExposePostsList
  \/ ExposeRss
  \/ ExposeTags
  \/ ExposePostPage
  \/ ExposeArchives
  \/ ExposeOg
  \/ Stutter

Spec == Init /\ [][Next]_vars

----------------------------------------------------------------------------
\* Property (production): a draft, or a post whose publish window has not
\* opened, must not appear on any public surface.
\*
\* Harm if broken: readers, RSS clients, or link unfurls see unpublished work.
ProductionHidesUnpublished ==
  DEV
  \/ (~draft /\ PublishTimePassed)
  \/ exposed = {}

\* Supporting check: even in DEV, postFilter never admits drafts
\* (AGENTS.md wording about drafts in DEV does not match postFilter.ts).
DraftNeverOnFilteredSurfaces ==
  draft => (exposed \intersect {"home", "postsList", "rss", "tags"} = {})

====
