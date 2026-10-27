# Tags

Tags lets a user browse all post tags at `/tags` and open a tag-filtered listing such as `/tags/docs`.

## Sub-features

- `tags-index` lists tag links on `/tags`.
- `tag-docs` opens the `docs` tag listing from its link.

## How to get to it (user POV)

- Choose `Tags` in the header.
- Open `/tags` directly.
- Choose a tag chip on a post detail page.

## Driving it with verify-site

Preconditions:

- Preview is healthy at the launched URL.
- At least one published post is tagged `docs` (seed: `Why start a blog?`).
- `verify-site doctor` reports OK.

- **Open index.** Load `/tags/`. Run `node .cursor/skills/verify-chrishandy-net/bin/verify-site.mjs drive tags`. Heading `Tags` is visible.
- **Open tag.** Choose the link with `data-tag-name="docs"` (visible name `docs`). The URL becomes `/tags/docs/` and a heading mentioning `docs` is shown.
- **Proof.** Artifacts under `evidence/tags/` include `01-tags-index.*` and `02-tag-docs.*`. `PROOF.json` lists steps `tags-index` and `tag-docs`.

## Gotchas

- Tag URLs use the slugified tag (`/tags/docs/`), while the visible label comes from `data-tag-name`.
- If the seed post loses the `docs` tag, the journey must fail with that precondition — do not swap in another tag silently without updating this map.
