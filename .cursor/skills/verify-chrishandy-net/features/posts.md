# Posts

Posts lets a user browse all articles at `/posts` and open an individual post detail page such as `/posts/why-start-a-blog`.

## Sub-features

- `posts-list` shows the paginated posts index with article titles as links.
- `post-detail` opens a known post and shows its title heading.

## How to get to it (user POV)

- Choose `Posts` in the header.
- Open `/posts` directly.
- Choose a post title card/link from the home featured or recent sections.

## Driving it with verify-site

Preconditions:

- Preview is healthy at the launched URL.
- Content includes the post titled `Why start a blog?` (slug `why-start-a-blog`).
- `verify-site doctor` reports OK.

- **Open listing.** Load `/posts/`. Run `node .cursor/skills/verify-chrishandy-net/bin/verify-site.mjs drive posts`. Heading `Posts` is visible.
- **Open a post.** Choose the link whose name matches `Why start a blog?`. The URL becomes `/posts/why-start-a-blog/` and the detail heading reads `Why start a blog?`.
- **Proof.** Artifacts under `evidence/posts/` include `01-posts-list.*` and `02-post-detail.*`. `PROOF.json` lists steps `posts-list` and `post-detail`.

## Gotchas

- Post paths use `/posts/<slug>`; the seed post slug is `why-start-a-blog` from frontmatter, not the filename alone.
- Draft posts are excluded from the listing in production builds. If a journey targets a draft title, fail with that precondition — do not weaken the journey.
- Pagination appears when there are more than `SITE.postPerPage` (4) posts; the seed content currently fits one page.
