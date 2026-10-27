# Home

Home is the landing page at `/`: it shows the Chris Handy brand, welcome copy, featured/recent posts, and header navigation to the rest of the site.

## Sub-features

- `home-identity` shows the site brand link and welcome sentence.
- `home-nav-posts` reaches the posts listing from the header `Posts` link.

## How to get to it (user POV)

- Open `/` in the browser after launch.
- Choose the `Chris Handy` brand link in the header from any page.

## Driving it with verify-site

Preconditions:

- Preview is healthy at `http://127.0.0.1:4371` (or the launched port).
- `verify-site doctor` reports OK.

- **Open home.** Load `/`. Run `node .cursor/skills/verify-chrishandy-net/bin/verify-site.mjs drive home`. The page shows a link named `Chris Handy` and the text `Welcome to my words.`
- **Navigate to posts.** Choose `Posts` in the header. The journey clicks the `Posts` link and lands on `/posts` with heading `Posts`.
- **Proof.** Artifacts under `evidence/home/` include `01-home.png` / `01-home.aria.txt` (brand + welcome) and `02-posts-nav.png` (posts heading). `PROOF.json` lists steps `home-identity` and `nav-posts`.

## Gotchas

- The visible brand is the header link named `Chris Handy`; the hero also has an `sr-only` `h1` with the same text — assert the link or the welcome paragraph, not a second visible h1.
- Do not use `pnpm run dev` as the verify target for map proofs that also touch search later in the same run; prefer the launched preview.
- A 200 on `/` alone is insufficient. Doctor and drive both require the Chris Handy identity strings.
