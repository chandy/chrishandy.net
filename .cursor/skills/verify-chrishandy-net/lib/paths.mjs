import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Skill root: .cursor/skills/verify-chrishandy-net */
export const SKILL_ROOT = path.resolve(__dirname, "..");

/** Repository root (chrishandy.net) */
export const REPO_ROOT = path.resolve(SKILL_ROOT, "../../..");

export const STATE_DIR = path.join(SKILL_ROOT, "state");
export const STATE_FILE = path.join(STATE_DIR, "run.json");
export const EVIDENCE_DIR = path.join(SKILL_ROOT, "evidence");

export const DEFAULT_HOST = "127.0.0.1";
/** Dedicated verify port — avoids colliding with config server.port (8080) or ad-hoc 4321. */
export const DEFAULT_PORT = 4371;

export function evidenceDirFor(featureId) {
  return path.join(EVIDENCE_DIR, featureId);
}
