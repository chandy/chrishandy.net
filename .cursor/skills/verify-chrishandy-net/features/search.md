# Search

Search lets a user find posts by full-text query via Pagefind on `/search`, inspect matching results, and see an empty state when nothing matches.

## Sub-features

- `search-open` shows the Search page with the Pagefind input ready.
- `search-match` returns result links for a query that hits real post content.
- `search-empty` shows a no-results state for a nonsense query.

## How to get to it (user POV)

- Choose the header control named `search` (accessible name / `sr-only` “Search”).
- Open `/search` directly.
- Open `/search?q=<term>` to deep-link a query (Pagefind runs `triggerSearch` on load).

## Driving it with verify-site

Preconditions:

- Preview was started with a full `verify-site launch` (not `--skip-build`) so `dist/pagefind/pagefind.js` exists.
- `verify-site doctor` reports `pagefindIndex` OK.
- Indexed content includes posts that match the word `agents` (for example `AI agents — what they are and why they matter`).

- **Open search.** Load `/search/`. Run `node .cursor/skills/verify-chrishandy-net/bin/verify-site.mjs drive search`. Heading `Search` is visible and `.pagefind-ui__search-input` is ready.
- **Match.** Type `agents` into `.pagefind-ui__search-input`. At least one `.pagefind-ui__result` appears and a result link matches `/AI agents|Cursor Cloud Agents/i`.
- **Empty.** Replace the query with `xyzzy-no-such-post-chrishandy`. The UI shows a Pagefind empty message (`.pagefind-ui__message`) and no result cards.
- **Proof.** Artifacts under `evidence/search/` include `01-search-open.*`, `02-search-results.*`, and `03-search-empty.*`. `PROOF.json` lists steps `search-open`, `search-match`, and `search-empty`.

## Gotchas

- `pnpm run dev` shows a DEV mode warning and does not serve useful Pagefind results until a build has copied the index. Always verify search against the launched preview.
- Pagefind results update asynchronously. Wait for `.pagefind-ui__result` or `.pagefind-ui__message`, not a fixed short sleep alone.
- Prefer the vendor class hooks above for the search box; header entry uses the link/button accessible name `search`.
- A URL `?q=` update alone is not proof — assert visible result links or the empty message.
