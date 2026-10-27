# About and theme

About is the static page at `/about` introducing Chris Handy. The header theme control toggles light and dark appearance site-wide via `data-theme` on `html`.

## Sub-features

- `about-content` shows the About heading and Chris Handy intro copy.
- `theme-toggle` flips the theme button `aria-label` and matching `html[data-theme]`.

## How to get to it (user POV)

- Choose `About` in the header.
- Open `/about` directly.
- Choose the theme button in the header (accessible name is the current theme: `dark` or `light`).

## Driving it with verify-site

Preconditions:

- Preview is healthy at the launched URL.
- `SITE.lightAndDarkMode` is enabled (true in `src/config.ts`).
- `verify-site doctor` reports OK.

- **Open about.** Load `/about/`. Run `node .cursor/skills/verify-chrishandy-net/bin/verify-site.mjs drive about-theme`. Heading `About` is visible and body text mentions `Chris Handy`.
- **Toggle theme.** Choose `#theme-btn`. Its `aria-label` changes (`dark` ↔ `light`) and `html` `data-theme` matches the new label.
- **Proof.** Artifacts under `evidence/about-theme/` include `01-about.*` and `02-theme-toggled.*`. `PROOF.json` records `theme.before` / `theme.after`.

## Gotchas

- Default primary scheme in `public/toggle-theme.js` is `dark` until localStorage overrides it. Assert a change of label, not a specific starting theme.
- The theme button’s accessible name is the current scheme (`aria-label`), not a fixed “Toggle theme” string.
- View transitions re-bind the click handler; drive against a fresh page load from `/about` as the lever does.
