"use strict";

const { spawnSync } = require("child_process");

/**
 * Execute a binary with inherited stdio.
 * Returns the exit code.
 *
 * `argv0` is the name the tool sees as its own. Without it the tool sees the
 * cached asset's file name, so a click or argparse tool's help reads
 * "Usage: xrpl-lab-2.7.9-win-x64.exe" (1.2.0).
 */
function runBinary(binPath, args, { argv0 } = {}) {
  const options = { stdio: "inherit" };
  if (argv0) options.argv0 = argv0;
  const result = spawnSync(binPath, args, options);
  if (result.error) throw result.error;
  return result.status ?? 1;
}

module.exports = { runBinary };
