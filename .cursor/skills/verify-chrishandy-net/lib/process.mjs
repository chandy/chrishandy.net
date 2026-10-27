import fs from "node:fs";

export function isPidAlive(pid) {
  if (!pid || typeof pid !== "number") return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

/** Stop only the PID recorded for this verify run. Never kill by name. */
export async function stopPid(pid, { timeoutMs = 10_000 } = {}) {
  if (!isPidAlive(pid)) return { stopped: false, reason: "not-alive" };

  try {
    process.kill(pid, "SIGTERM");
  } catch (err) {
    return { stopped: false, reason: String(err.message || err) };
  }

  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (!isPidAlive(pid)) return { stopped: true, signal: "SIGTERM" };
    await new Promise(r => setTimeout(r, 100));
  }

  if (isPidAlive(pid)) {
    try {
      process.kill(pid, "SIGKILL");
    } catch {
      /* ignore */
    }
    await new Promise(r => setTimeout(r, 200));
    return {
      stopped: !isPidAlive(pid),
      signal: "SIGKILL",
    };
  }
  return { stopped: true, signal: "SIGTERM" };
}

export function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return null;
  }
}
