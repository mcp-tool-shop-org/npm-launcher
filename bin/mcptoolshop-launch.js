#!/usr/bin/env node
"use strict";

const { launch, printCachePath, clearCache } = require("../src/index");

const earlyArg = process.argv[2];
// A wrapper sets this before requiring us. When it is set, the launcher is
// standing in for a tool, so the tool's flags belong to the tool (#6).
const viaWrapper = Boolean(process.env.MCPTOOLSHOP_LAUNCH_CONFIG);

// The launcher's own version, with or without a wrapper.
if (earlyArg === "--launcher-version") {
  const pkg = require("../package.json");
  console.log(`mcptoolshop-launch ${pkg.version}`);
  process.exit(0);
}

// Run on its own, the launcher answers --version and --help itself. Through a
// wrapper they go to the tool: 1.1.1 answered them here, so `npx <tool>
// --version` printed the launcher's version instead of the tool's.
if (!viaWrapper && (earlyArg === "--version" || earlyArg === "-V")) {
  const pkg = require("../package.json");
  console.log(`mcptoolshop-launch ${pkg.version}`);
  process.exit(0);
}

if (!viaWrapper && (earlyArg === "--help" || earlyArg === "-h")) {
  const pkg = require("../package.json");
  console.log(`mcptoolshop-launch v${pkg.version}

Generic GitHub-release binary launcher with cache + SHA256 verification.

USAGE (direct):
  mcptoolshop-launch [OPTIONS]

USAGE (via wrapper):
  Set MCPTOOLSHOP_LAUNCH_CONFIG as JSON, then run mcptoolshop-launch [-- args...]
  Every argument goes to the tool, --version and --help included.

OPTIONS:
  --version, -V          Print the launcher's version and exit (run on its own)
  --help, -h             Show this help and exit (run on its own)
  --launcher-version     Print the launcher's version, also via a wrapper
  --print-cache-path     Show cache directory for configured tool
  --clear-cache          Remove cached binaries for configured tool

CONFIG (via MCPTOOLSHOP_LAUNCH_CONFIG env var):
  toolName  (required)   Binary base name, e.g. "sovereignty"
  owner     (required)   GitHub org/user, e.g. "mcp-tool-shop-org"
  repo      (required)   GitHub repo name
  version   (required)   Semver without v prefix, e.g. "1.4.0"
  tag       (optional)   Git tag, defaults to "v<version>"
  quiet     (optional)   Suppress progress messages

DOCS: ${pkg.homepage || "https://github.com/mcp-tool-shop-org/npm-launcher"}`);
  process.exit(0);
}

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
