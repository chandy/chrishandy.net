---
name: verify-chrishandy-net
description: "Drive the chrishandy.net Astro blog in a real browser (home, posts, Pagefind search, tags, about/theme) and capture proof. Use when verifying user-facing site changes, before shipping UI work, or when unit tests alone are not enough."
---

# Verify chrishandy.net

Agent-facing control skill for the static AstroPaper blog in this repo. Surface is the **web UI** served from a local production preview (`pnpm run build` + `astro preview`). Unit tests under `tests/` do not replace this loop.

Cold-start: read this file, then the matching file under `features/`. Drive only through the `verify-site` lever — do not reinvent Playwright glue.

## Launch

Preconditions: Node 22+, `pnpm`, Google Chrome available as `google-chrome` (Playwright uses `channel: "chrome"`).

Install the lever once per checkout:

```bash
pnpm install
pnpm --dir .cursor/skills/verify-chrishandy-net install
```

Start a disposable preview (builds the site + Pagefind index, then serves on a dedicated port):

```bash
node .cursor/skills/verify-chrishandy-net/bin/verify-site.mjs launch
# optional: --port 4371 --host 127.0.0.1 --skip-build --dry-run
```

Ready when `GET http://127.0.0.1:4371/` returns 200 and home HTML contains `Chris Handy` / `Welcome to my words.` Run state (including PID) is written to `.cursor/skills/verify-chrishandy-net/state/run.json`. Preview logs: `state/preview.log`.

Default verify port is **4371** so it does not collide with `astro.config.ts` `server.port` (8080) or ad-hoc `4321` dev servers. Prefer this launched instance; do not drive a shared/user preview you did not start.

One-shot (launch → doctor → drive → cleanup, evidence kept):

```bash
node .cursor/skills/verify-chrishandy-net/bin/verify-site.mjs prove search
```

## Doctor

Read-only health check for the instance this skill launched:

```bash
node .cursor/skills/verify-chrishandy-net/bin/verify-site.mjs doctor
node .cursor/skills/verify-chrishandy-net/bin/verify-site.mjs doctor --json
```

Requires: state file present, PID alive, `GET /` and `GET /posts/` OK, home identifies Chris Handy, `dist/pagefind/pagefind.js` present. Exit code `2` on failure. Run doctor whenever anything looks off before driving.

## Drive

Mapped features: `home`, `posts`, `search`, `tags`, `about-theme`. Recipes live in `features/`. Prefer ARIA roles, accessible names, and routes over coordinates.

```bash
node .cursor/skills/verify-chrishandy-net/bin/verify-site.mjs features
node .cursor/skills/verify-chrishandy-net/bin/verify-site.mjs drive search
node .cursor/skills/verify-chrishandy-net/bin/verify-site.mjs drive home --dry-run
```

Drive fails closed if doctor gates fail. Search **requires** a full `launch` build (Pagefind). Dev server (`pnpm run dev`) is not the verify target — Pagefind warns and results are empty there.

## Evidence

Proof artifacts land under:

```text
.cursor/skills/verify-chrishandy-net/evidence/<feature>/
  01-*.png / 01-*.aria.txt / 01-*.meta.json
  …
  PROOF.json
```

Standards:

- Exercise the real user path (header nav, Pagefind input, theme button) — not internal APIs.
- Capture action + resulting state (before/after screenshots and ARIA snapshots).
- `PROOF.json` records feature id, URL, steps, and artifact paths.
- Evidence is committed for the seed proof so PR review can see it; later local runs overwrite the same paths unless you copy them aside.

## Cleanup

```bash
node .cursor/skills/verify-chrishandy-net/bin/verify-site.mjs cleanup
node .cursor/skills/verify-chrishandy-net/bin/verify-site.mjs cleanup --dry-run
```

Stops **only** the PID in `state/run.json` (SIGTERM then SIGKILL). Never kill by process name. Removes run state and `preview.log`. **Does not delete `evidence/`.**

After failed iterations, always run cleanup so ports/PIDs are not stranded.

## Helpers

| Command | Purpose |
| --- | --- |
| `verify-site launch` | Build + preview; write state |
| `verify-site doctor` | Read-only instance check |
| `verify-site drive <feature>` | Playwright journey + evidence |
| `verify-site cleanup` | Tear down launched PID only |
| `verify-site prove <feature>` | Full loop; evidence survives |
| `verify-site features` | List feature ids |
| `--dry-run` | Print plan / would-be actions as JSON |

Exit codes: `0` ok, `1` usage, `2` doctor/unhealthy, `3` launch/drive/cleanup error.

Implementation: `bin/verify-site.mjs` + `lib/*.mjs`. Skill-local dependency: `playwright` (see skill `package.json`).

## Feature map

See [`features/README.md`](features/README.md). Keep the map honest with `/maintain-verification-skill` (pstack) as routes and UI change — that maintainer skill is not vendored into this repo.
