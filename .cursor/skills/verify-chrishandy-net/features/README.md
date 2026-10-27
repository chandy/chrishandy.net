# chrishandy.net verification map

This directory is the maintained source for verifying user-facing behavior of the Chris Handy Astro blog. Read the index before driving the app, then use the matching feature file as the recipe.

## Baseline preconditions

- Launch with `node .cursor/skills/verify-chrishandy-net/bin/verify-site.mjs launch` so the site is served at `http://127.0.0.1:4371` (or the port you passed).
- Require a production preview build: Pagefind search is empty on `pnpm run dev` until `pnpm run build` has produced `dist/pagefind/`.
- Put nothing else on that port. Never drive an instance that was not started by this verification run.
- Run `verify-site doctor` and require home identity (`Chris Handy`), live PID, and pagefind index present.
- Chrome must be available (`google-chrome`); the lever launches Playwright with `channel: "chrome"`.

## Driving conventions

- Start every recipe from the baseline state unless its preconditions say otherwise.
- Prefer ARIA roles and accessible names (`getByRole`) over CSS selectors or DOM position. Pagefind’s search box is an exception: use `.pagefind-ui__search-input` / `.pagefind-ui__result` as the stable vendor handles.
- Treat every command as literal. Keep quoted names and flags unchanged.
- Run browser actions only through `verify-site drive <feature>` (or the same Playwright steps the lever encodes).
- Cleanup stops the launched PID only. Do not remove proof artifacts during cleanup.

## Proof and skip reporting

- Capture the user action and the resulting state, not only the final screen.
- UI proof includes an ARIA snapshot and a screenshot with the site identity visible (`Chris Handy` in header or title).
- Record the feature ID and entry point used with every artifact under `evidence/<feature>/`.
- Report an unreachable path with the attempted command and the unmet precondition.
- Do not report a skipped entry point as verified through a different path.

## Feature entry contract

Each feature file starts with an H1 title and one paragraph describing the user-visible behavior. It then uses exactly four H2 sections in this order.

1. `Sub-features` lists short IDs with one line for each behavior.
2. `How to get to it (user POV)` lists every user entry point.
3. `Driving it with verify-site` starts with `Preconditions:` and uses labeled bullets that pair each user action with an exact command and observable result.
4. `Gotchas` lists traps that can waste or invalidate a verification run.

Keep implementation details out of the map. Name only user paths, stable handles, required state, commands, and observable proof.

## Features

- [Home](./home.md) covers brand identity, welcome copy, and header navigation to Posts.
- [Posts](./posts.md) covers the posts listing and opening a post detail page.
- [Search](./search.md) covers Pagefind open, match, and empty states on `/search`.
- [Tags](./tags.md) covers the tags index and opening a tag listing.
- [About and theme](./about-theme.md) covers the about page and light/dark theme toggle.
