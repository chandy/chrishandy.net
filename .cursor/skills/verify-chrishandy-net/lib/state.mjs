import fs from "node:fs";
import { STATE_DIR, STATE_FILE } from "./paths.mjs";

export function ensureStateDir() {
  fs.mkdirSync(STATE_DIR, { recursive: true });
}

export function readState() {
  if (!fs.existsSync(STATE_FILE)) return null;
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
  } catch {
    return null;
  }
}

export function writeState(state) {
  ensureStateDir();
  fs.writeFileSync(STATE_FILE, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

export function clearState() {
  if (fs.existsSync(STATE_FILE)) fs.unlinkSync(STATE_FILE);
}

export function baseUrlFromState(state) {
  if (!state?.host || !state?.port) return null;
  return `http://${state.host}:${state.port}`;
}
