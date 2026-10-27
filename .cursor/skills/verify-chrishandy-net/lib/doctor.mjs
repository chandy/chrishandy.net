import fs from "node:fs";
import path from "node:path";
import { REPO_ROOT } from "./paths.mjs";
import { readState, baseUrlFromState } from "./state.mjs";
import { isPidAlive } from "./process.mjs";
import { fetchOk } from "./http.mjs";

export async function doctor({ json = false } = {}) {
  const state = readState();
  const result = {
    ok: false,
    checks: {},
    state,
  };

  if (!state) {
    result.checks.stateFile = {
      ok: false,
      detail: "No run state. Launch first with verify-site launch.",
    };
    return finish(result, json);
  }

  result.checks.stateFile = { ok: true, detail: `pid=${state.pid} ${state.baseUrl}` };

  const alive = isPidAlive(state.pid);
  result.checks.process = {
    ok: alive,
    detail: alive ? `pid ${state.pid} is alive` : `pid ${state.pid} is not running`,
  };

  const baseUrl = baseUrlFromState(state);
  const home = await fetchOk(`${baseUrl}/`);
  result.checks.httpHome = {
    ok: home.ok,
    detail: home.ok ? `GET / → ${home.status}` : `GET / failed: ${home.error || home.status}`,
  };

  let bodyOk = false;
  let titleSnippet = null;
  if (home.ok) {
    try {
      const html = await (await fetch(`${baseUrl}/`)).text();
      bodyOk = html.includes("Chris Handy") && html.includes("Welcome to my words");
      const m = html.match(/<title[^>]*>([^<]*)<\/title>/i);
      titleSnippet = m?.[1]?.trim() ?? null;
    } catch (err) {
      bodyOk = false;
      titleSnippet = String(err.message || err);
    }
  }
  result.checks.siteIdentity = {
    ok: bodyOk,
    detail: bodyOk
      ? `Home HTML identifies Chris Handy (title=${titleSnippet})`
      : `Home HTML missing expected identity (title=${titleSnippet})`,
  };

  const pagefindDir = path.join(REPO_ROOT, "dist", "pagefind");
  const pagefindOk = fs.existsSync(path.join(pagefindDir, "pagefind.js"));
  result.checks.pagefindIndex = {
    ok: pagefindOk,
    detail: pagefindOk
      ? "dist/pagefind/pagefind.js present (search ready)"
      : "dist/pagefind missing — rerun launch without --skip-build",
  };

  const posts = await fetchOk(`${baseUrl}/posts/`);
  result.checks.httpPosts = {
    ok: posts.ok,
    detail: posts.ok ? `GET /posts/ → ${posts.status}` : `GET /posts/ failed`,
  };

  result.ok = Object.values(result.checks).every(c => c.ok);
  return finish(result, json);
}

function finish(result, json) {
  if (json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(result.ok ? "doctor: OK" : "doctor: FAIL");
    for (const [name, check] of Object.entries(result.checks)) {
      console.log(`  ${check.ok ? "✓" : "✗"} ${name}: ${check.detail}`);
    }
  }
  return result;
}
