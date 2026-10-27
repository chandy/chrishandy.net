import fs from "node:fs";
import path from "node:path";
import { STATE_DIR, EVIDENCE_DIR } from "./paths.mjs";
import { readState, clearState } from "./state.mjs";
import { isPidAlive, stopPid } from "./process.mjs";

/**
 * Tear down only the instance this verify run started.
 * Never deletes evidence/ — proof must survive cleanup.
 */
export async function cleanup({ dryRun = false } = {}) {
  const state = readState();
  const report = {
    hadState: !!state,
    evidencePreserved: fs.existsSync(EVIDENCE_DIR),
    evidenceDir: EVIDENCE_DIR,
  };

  if (!state) {
    report.stopped = false;
    report.reason = "no-state";
    if (!dryRun) {
      // Still remove stale log if present, but keep evidence
      const log = path.join(STATE_DIR, "preview.log");
      if (fs.existsSync(log)) fs.unlinkSync(log);
    }
    return report;
  }

  report.pid = state.pid;
  report.baseUrl = state.baseUrl;

  if (dryRun) {
    report.dryRun = true;
    report.wouldStop = isPidAlive(state.pid);
    report.wouldClearState = true;
    report.wouldKeepEvidence = true;
    return report;
  }

  if (isPidAlive(state.pid)) {
    report.stop = await stopPid(state.pid);
  } else {
    report.stop = { stopped: false, reason: "already-dead" };
  }

  if (state.logFile && fs.existsSync(state.logFile)) {
    fs.unlinkSync(state.logFile);
  }
  clearState();
  report.stateCleared = true;
  report.evidenceStillPresent = fs.existsSync(EVIDENCE_DIR);
  return report;
}
