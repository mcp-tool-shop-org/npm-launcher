"use strict";

const fs = require("fs");
const path = require("path");
const { resolveTarget } = require("./platform");
const { toolCacheDir, ensureDir } = require("./cache");
const { releaseAssetUrl, downloadToFile, get } = require("./github");
const { parseChecksumsTxt, verifySha256 } = require("./verify");
const { runBinary } = require("./run");

/**
 * Config contract (pure JSON, no functions):
 *
 *   toolName    - binary base name, e.g. "sovereignty"
 *   owner       - GitHub org, e.g. "mcp-tool-shop-org"
 *   repo        - GitHub repo name, e.g. "sovereignty"
 *   version     - semver without v prefix, e.g. "1.4.0"
 *   tag         - git tag, default "v<version>"
 *
 * Asset naming convention (locked):
 *   binary:    <toolName>-<version>-<os>-<arch><ext>
 *   checksums: checksums-<version>.txt
 */

function assetName(toolName, version, target) {
  return `${toolName}-${version}-${target.os}-${target.arch}${target.ext}`;
}

function checksumsAssetName(version) {
  return `checksums-${version}.txt`;
}

/**
 * Ensure the binary is downloaded, verified, and cached.
 * Returns the absolute path to the executable.
 */
async function ensureBinary(config) {
  const target = resolveTarget();
  const tag = config.tag || `v${config.version}`;
  const asset = assetName(config.toolName, config.version, target);
  const checksumsFile = checksumsAssetName(config.version);

  const cacheDir = toolCacheDir(config.toolName, config.version);
  ensureDir(cacheDir);

  const binPath = path.join(cacheDir, asset);

  // Already cached — skip download
  if (fs.existsSync(binPath)) {
    return binPath;
  }

  // Download checksums
  const checksumsUrl = releaseAssetUrl(config.owner, config.repo, tag, checksumsFile);
  process.stderr.write(`Fetching checksums from ${config.owner}/${config.repo}@${tag}...\n`);

  const checksumsRes = await get(checksumsUrl);
  if (checksumsRes.status !== 200) {
    throw new Error(
      `Failed to fetch checksums (HTTP ${checksumsRes.status})\n` +
      `  URL: ${checksumsUrl}\n` +
      `  Hint: Does release ${tag} exist with a ${checksumsFile} asset?`
    );
  }

  const checksums = parseChecksumsTxt(checksumsRes.body);
  const expected = checksums.get(asset);
  if (!expected) {
    const available = [...checksums.keys()].join(", ") || "(none)";
    throw new Error(
      `No checksum found for asset: ${asset}\n` +
      `  Available assets in ${checksumsFile}: ${available}\n` +
      `  Hint: Is this platform supported for ${config.toolName} ${config.version}?`
    );
  }

  // Download binary
  const assetUrl = releaseAssetUrl(config.owner, config.repo, tag, asset);
  process.stderr.write(`Downloading ${asset}...\n`);
  await downloadToFile(assetUrl, binPath);

  // Verify checksum — delete on mismatch so next run retries
  process.stderr.write("Verifying SHA256...\n");
  try {
    verifySha256(binPath, expected);
  } catch (err) {
    try { fs.unlinkSync(binPath); } catch {}
    throw err;
  }

  // Make executable on Unix
  if (process.platform !== "win32") {
    fs.chmodSync(binPath, 0o755);
  }

  process.stderr.write("Ready.\n");
  return binPath;
}

/**
 * Main entry: ensure binary, then run it with argv passthrough.
 */
async function launch(config, argv) {
  const args = argv.slice(2);
  const binPath = await ensureBinary(config);
  const code = runBinary(binPath, args);
  process.exit(code);
}

module.exports = { launch, ensureBinary, assetName, checksumsAssetName };
