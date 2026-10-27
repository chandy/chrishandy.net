#!/usr/bin/env node
/**
 * verify-site — agent lever for chrishandy.net browser verification.
 *
 * Exit codes:
 *   0  success
 *   1  usage / unknown command
 *   2  doctor failed / unhealthy instance
 *   3  launch / drive / cleanup failure
 *   4  dry-run completed (informational; still 0 unless --fail-dry-run)
 */
import { launch } from "../lib/launch.mjs";
import { doctor } from "../lib/doctor.mjs";
import { drive, listFeatures } from "../lib/drive.mjs";
import { cleanup } from "../lib/cleanup.mjs";
import { DEFAULT_HOST, DEFAULT_PORT, EVIDENCE_DIR, STATE_FILE } from "../lib/paths.mjs";

const HELP = `verify-site — drive chrishandy.net like a user (Playwright + astro preview)

Usage:
  verify-site launch [--port ${DEFAULT_PORT}] [--host ${DEFAULT_HOST}] [--skip-build] [--dry-run]
  verify-site doctor [--json]
  verify-site drive <feature> [--dry-run]
  verify-site cleanup [--dry-run]
  verify-site features
  verify-site prove <feature>   # launch → doctor → drive → cleanup (evidence kept)

Features: ${listFeatures().join(", ")}

State file: ${STATE_FILE}
Evidence:   ${EVIDENCE_DIR}/<feature>/

Never kills by process name — cleanup only stops the PID recorded at launch.
`;

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--json") args.json = true;
    else if (a === "--dry-run") args.dryRun = true;
    else if (a === "--skip-build") args.skipBuild = true;
    else if (a === "--port") args.port = Number(argv[++i]);
    else if (a === "--host") args.host = argv[++i];
    else if (a === "--help" || a === "-h") args.help = true;
    else if (a.startsWith("-")) {
      throw Object.assign(new Error(`Unknown flag: ${a}`), { code: "USAGE" });
    } else args._.push(a);
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const [cmd, feature] = args._;

  if (args.help || !cmd) {
    console.log(HELP);
    process.exit(cmd ? 0 : 1);
  }

  try {
    switch (cmd) {
      case "launch": {
        const result = await launch({
          host: args.host || DEFAULT_HOST,
          port: args.port || DEFAULT_PORT,
          skipBuild: !!args.skipBuild,
          dryRun: !!args.dryRun,
        });
        console.log(JSON.stringify(result, null, 2));
        break;
      }
      case "doctor": {
        const result = await doctor({ json: !!args.json });
        if (!args.json && !result.ok) process.exitCode = 2;
        if (args.json && !result.ok) process.exitCode = 2;
        break;
      }
      case "drive": {
        if (!feature) {
          console.error(`drive requires a feature. Known: ${listFeatures().join(", ")}`);
          process.exit(1);
        }
        const result = await drive(feature, { dryRun: !!args.dryRun });
        console.log(JSON.stringify(result, null, 2));
        break;
      }
      case "cleanup": {
        const result = await cleanup({ dryRun: !!args.dryRun });
        console.log(JSON.stringify(result, null, 2));
        break;
      }
      case "features": {
        console.log(JSON.stringify({ features: listFeatures() }, null, 2));
        break;
      }
      case "prove": {
        if (!feature) {
          console.error(`prove requires a feature. Known: ${listFeatures().join(", ")}`);
          process.exit(1);
        }
        if (args.dryRun) {
          console.log(
            JSON.stringify(
              {
                dryRun: true,
                would: ["launch", "doctor", `drive ${feature}`, "cleanup"],
                evidenceKeptAt: `${EVIDENCE_DIR}/${feature}/`,
              },
              null,
              2,
            ),
          );
          break;
        }
        await cleanup({}); // clear any stranded prior run
        const launched = await launch({
          host: args.host || DEFAULT_HOST,
          port: args.port || DEFAULT_PORT,
          skipBuild: !!args.skipBuild,
        });
        console.error(`launched ${launched.baseUrl} pid=${launched.pid}`);
        const health = await doctor({ json: true });
        if (!health.ok) {
          await cleanup({});
          process.exit(2);
        }
        const proof = await drive(feature);
        const cleaned = await cleanup({});
        console.log(
          JSON.stringify(
            {
              ok: true,
              feature,
              proof,
              cleanup: cleaned,
              evidenceDir: `${EVIDENCE_DIR}/${feature}/`,
            },
            null,
            2,
          ),
        );
        break;
      }
      default:
        console.error(`Unknown command: ${cmd}\n`);
        console.log(HELP);
        process.exit(1);
    }
  } catch (err) {
    console.error(err.stack || String(err));
    if (err.code === "USAGE" || err.code === "UNKNOWN_FEATURE") process.exit(1);
    if (err.code === "DOCTOR_FAIL") process.exit(2);
    process.exit(3);
  }
}

main();
