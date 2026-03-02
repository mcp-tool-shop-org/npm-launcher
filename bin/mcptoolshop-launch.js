#!/usr/bin/env node
"use strict";

const { launch, printCachePath, clearCache } = require("../src/index");

// Wrappers pass config as JSON via environment variable.
const raw = process.env.MCPTOOLSHOP_LAUNCH_CONFIG;
if (!raw) {
  process.stderr.write(
    "Error: MCPTOOLSHOP_LAUNCH_CONFIG is not set.\n" +
    "This binary is meant to be called by an @mcptoolshop wrapper package.\n"
  );
  process.exit(2);
}

let config;
try {
  config = JSON.parse(raw);
} catch {
  process.stderr.write(
    "Error: MCPTOOLSHOP_LAUNCH_CONFIG is not valid JSON.\n"
  );
  process.exit(2);
}

// Validate required fields
const required = ["toolName", "owner", "repo", "version"];
const missing = required.filter((k) => !config[k]);
if (missing.length > 0) {
  process.stderr.write(
    `Error: Missing required config fields: ${missing.join(", ")}\n`
  );
  process.exit(2);
}

// Launcher-level commands (intercepted before binary launch)
const arg1 = process.argv[2];

if (arg1 === "--print-cache-path") {
  printCachePath(config);
  process.exit(0);
}

if (arg1 === "--clear-cache") {
  clearCache(config);
  process.exit(0);
}

launch(config, process.argv).catch((err) => {
  process.stderr.write(`${err.message || String(err)}\n`);
  process.exit(1);
});
