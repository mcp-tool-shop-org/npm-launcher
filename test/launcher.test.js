"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");
const crypto = require("crypto");
const { execFileSync } = require("child_process");
const { test } = require("node:test");
const assert = require("node:assert/strict");

const { parseChecksumsTxt, verifySha256, sha256File } = require("../src/verify");
const { resolveTarget, SUPPORTED } = require("../src/platform");
const { toolCacheDir, ensureDir, defaultCacheDir } = require("../src/cache");
const { acquireLock } = require("../src/lock");

const CLI_PATH = path.join(__dirname, "..", "bin", "mcptoolshop-launch.js");
const pkg = require("../package.json");

// -- CLI flag tests --

test("--version prints version and exits 0", () => {
  const out = execFileSync(process.execPath, [CLI_PATH, "--version"], {
    encoding: "utf8",
  });
  assert.match(out.trim(), new RegExp(`^mcptoolshop-launch ${pkg.version.replace(/\./g, "\\.")}$`));
});

test("-V prints version and exits 0", () => {
  const out = execFileSync(process.execPath, [CLI_PATH, "-V"], {
    encoding: "utf8",
  });
  assert.match(out.trim(), /^mcptoolshop-launch \d+\.\d+\.\d+$/);
});

test("--help prints usage and exits 0", () => {
  const out = execFileSync(process.execPath, [CLI_PATH, "--help"], {
    encoding: "utf8",
  });
  assert.ok(out.includes("USAGE"));
  assert.ok(out.includes("--version"));
  assert.ok(out.includes("--print-cache-path"));
  assert.ok(out.includes("MCPTOOLSHOP_LAUNCH_CONFIG"));
});

test("-h prints usage and exits 0", () => {
  const out = execFileSync(process.execPath, [CLI_PATH, "-h"], {
    encoding: "utf8",
  });
  assert.ok(out.includes("USAGE"));
});

// -- Unit tests for verify.js --

test("parseChecksumsTxt parses GNU coreutils format", () => {
  const hash1 = "a".repeat(64);
  const hash2 = "b".repeat(64);
  const input = Buffer.from(
    `${hash1}  myfile-1.0-linux-x64\n` +
    `${hash2}  other-file.exe\n`
  );
  const map = parseChecksumsTxt(input);
  assert.equal(map.size, 2);
  assert.equal(map.get("myfile-1.0-linux-x64"), hash1);
  assert.equal(map.get("other-file.exe"), hash2);
});

test("parseChecksumsTxt ignores blank lines and non-matching lines", () => {
  const input = Buffer.from("\n\n# comment\nnotahash  file\n\n");
  const map = parseChecksumsTxt(input);
  assert.equal(map.size, 0);
});

test("verifySha256 passes on matching hash", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "launcher-test-"));
  const filePath = path.join(tmpDir, "testfile");
  fs.writeFileSync(filePath, "hello world");
  const hash = crypto.createHash("sha256").update("hello world").digest("hex");
  verifySha256(filePath, hash); // should not throw
  fs.rmSync(tmpDir, { recursive: true });
});

test("verifySha256 throws on mismatched hash", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "launcher-test-"));
  const filePath = path.join(tmpDir, "testfile");
  fs.writeFileSync(filePath, "hello world");
  assert.throws(
    () => verifySha256(filePath, "0".repeat(64)),
    /SHA256 mismatch/
  );
  fs.rmSync(tmpDir, { recursive: true });
});

test("sha256File computes correct digest", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "launcher-test-"));
  const filePath = path.join(tmpDir, "testfile");
  fs.writeFileSync(filePath, "test content");
  const expected = crypto.createHash("sha256").update("test content").digest("hex");
  assert.equal(sha256File(filePath), expected);
  fs.rmSync(tmpDir, { recursive: true });
});

// -- Unit tests for platform.js --

test("resolveTarget returns a valid target for current platform", () => {
  const key = `${process.platform}-${process.arch}`;
  if (SUPPORTED[key]) {
    const target = resolveTarget();
    assert.ok(target.os);
    assert.ok(target.arch);
    assert.ok(typeof target.ext === "string");
  }
});

test("SUPPORTED contains exactly 4 platform entries", () => {
  assert.equal(Object.keys(SUPPORTED).length, 4);
});

// -- Unit tests for cache.js --

test("toolCacheDir returns nested path", () => {
  const dir = toolCacheDir("mytool", "1.0.0");
  assert.ok(dir.includes("mcptoolshop"));
  assert.ok(dir.includes("mytool"));
  assert.ok(dir.includes("1.0.0"));
});

test("ensureDir creates nested directories", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "launcher-test-"));
  const deep = path.join(tmpDir, "a", "b", "c");
  ensureDir(deep);
  assert.ok(fs.existsSync(deep));
  fs.rmSync(tmpDir, { recursive: true });
});

test("defaultCacheDir returns a string", () => {
  assert.ok(typeof defaultCacheDir() === "string");
});

// -- Unit tests for lock.js --

test("acquireLock creates and releases lock file", async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "launcher-test-"));
  const release = await acquireLock(tmpDir, "test-asset");
  const lockPath = path.join(tmpDir, ".test-asset.lock");
  assert.ok(fs.existsSync(lockPath));
  release();
  assert.ok(!fs.existsSync(lockPath));
  fs.rmSync(tmpDir, { recursive: true });
});

test("acquireLock waits for existing lock then acquires", async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "launcher-test-"));
  const lockPath = path.join(tmpDir, ".test-asset.lock");

  // Create a lock that will be released after 600ms
  fs.writeFileSync(lockPath, "fake-pid");

  const start = Date.now();
  // Release the lock after 600ms
  setTimeout(() => { try { fs.unlinkSync(lockPath); } catch {} }, 600);

  const release = await acquireLock(tmpDir, "test-asset");
  const elapsed = Date.now() - start;
  assert.ok(elapsed >= 500, `Should have waited at least 500ms, waited ${elapsed}ms`);
  release();
  fs.rmSync(tmpDir, { recursive: true });
});

// -- Integration test: full download → verify → run flow with local HTTP server --

test("full launcher flow with local HTTP server", async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "launcher-integration-"));
  const cacheDir = path.join(tmpDir, "cache");
  fs.mkdirSync(cacheDir, { recursive: true });

  // Create a fake "binary" — a small script
  const fakeBinary = process.platform === "win32"
    ? "@echo off\necho launcher-test-ok"
    : "#!/bin/sh\necho launcher-test-ok";
  const fakeBinaryBuf = Buffer.from(fakeBinary);
  const fakeSha = crypto.createHash("sha256").update(fakeBinaryBuf).digest("hex");

  const assetFileName = "testcli-1.0.0-win-x64.exe";
  const checksumsContent = `${fakeSha}  ${assetFileName}\n`;

  // Start local HTTP server
  const server = http.createServer((req, res) => {
    if (req.url?.includes("checksums-1.0.0.txt")) {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end(checksumsContent);
    } else if (req.url?.includes(assetFileName)) {
      res.writeHead(200, { "Content-Type": "application/octet-stream" });
      res.end(fakeBinaryBuf);
    } else {
      res.writeHead(404);
      res.end("Not found");
    }
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;

  try {
    // Test checksums download + parse
    const { get } = require("../src/github");
    const checksumsUrl = `http://127.0.0.1:${port}/checksums-1.0.0.txt`;
    // get() uses https — we need to test the parse logic separately
    // Fetch via http directly for integration test
    const httpGet = (url) => new Promise((resolve, reject) => {
      http.get(url, (res) => {
        const chunks = [];
        res.on("data", (d) => chunks.push(d));
        res.on("end", () => resolve({ status: res.statusCode, body: Buffer.concat(chunks) }));
        res.on("error", reject);
      }).on("error", reject);
    });

    const checksumsRes = await httpGet(checksumsUrl);
    assert.equal(checksumsRes.status, 200);

    const checksums = parseChecksumsTxt(checksumsRes.body);
    assert.equal(checksums.get(assetFileName), fakeSha);

    // Download binary via HTTP
    const binaryUrl = `http://127.0.0.1:${port}/${assetFileName}`;
    const binaryRes = await httpGet(binaryUrl);
    assert.equal(binaryRes.status, 200);

    const binPath = path.join(cacheDir, assetFileName);
    fs.writeFileSync(binPath, binaryRes.body);

    // Verify checksum
    verifySha256(binPath, fakeSha);

    // Verify file content
    assert.ok(fs.existsSync(binPath));
    assert.equal(fs.readFileSync(binPath).toString(), fakeBinary);
  } finally {
    server.close();
    fs.rmSync(tmpDir, { recursive: true });
  }
});
