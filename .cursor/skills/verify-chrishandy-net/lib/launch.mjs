import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import {
  DEFAULT_HOST,
  DEFAULT_PORT,
  REPO_ROOT,
  STATE_DIR,
} from "./paths.mjs";
import { readState, writeState, clearState } from "./state.mjs";
import { waitForUrl } from "./http.mjs";
import { isPidAlive } from "./process.mjs";

function logPath() {
  return path.join(STATE_DIR, "preview.log");
}

export async function launch({
  host = DEFAULT_HOST,
  port = DEFAULT_PORT,
  skipBuild = false,
  dryRun = false,
} = {}) {
  const existing = readState();
  if (existing?.pid && isPidAlive(existing.pid)) {
    const err = new Error(
      `Verify instance already running (pid ${existing.pid} at http://${existing.host}:${existing.port}). Run cleanup first.`,
    );
    err.code = "ALREADY_RUNNING";
    throw err;
  }
  if (existing) clearState();

  const previewArgs = [
    "exec",
    "astro",
    "preview",
    "--host",
    host,
    "--port",
    String(port),
  ];
  const buildCmd = "pnpm run build";
  const previewCmd = `pnpm ${previewArgs.join(" ")}`;

  if (dryRun) {
    return {
      dryRun: true,
      would: {
        cwd: REPO_ROOT,
        build: skipBuild ? null : buildCmd,
        preview: previewCmd,
        readyUrl: `http://${host}:${port}/`,
        stateFile: path.join(STATE_DIR, "run.json"),
      },
    };
  }

  fs.mkdirSync(STATE_DIR, { recursive: true });

  if (!skipBuild) {
    await runForeground(buildCmd, REPO_ROOT);
  }

  const out = fs.openSync(logPath(), "w");
  const child = spawn("pnpm", previewArgs, {
    cwd: REPO_ROOT,
    env: { ...process.env, FORCE_COLOR: "0" },
    stdio: ["ignore", out, out],
    detached: true,
  });
  fs.closeSync(out);
  child.unref();

  const baseUrl = `http://${host}:${port}`;
  const startedAt = new Date().toISOString();

  try {
    await waitForUrl(`${baseUrl}/`, { timeoutMs: 90_000 });
  } catch (err) {
    try {
      process.kill(child.pid, "SIGTERM");
    } catch {
      /* ignore */
    }
    throw err;
  }

  const state = {
    pid: child.pid,
    host,
    port,
    baseUrl,
    startedAt,
    skipBuild,
    logFile: logPath(),
    command: previewCmd,
  };
  writeState(state);
  return state;
}

function runForeground(command, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, {
      cwd,
      shell: true,
      stdio: "inherit",
      env: process.env,
    });
    child.on("error", reject);
    child.on("exit", code => {
      if (code === 0) resolve();
      else reject(new Error(`Command failed (${code}): ${command}`));
    });
  });
}
