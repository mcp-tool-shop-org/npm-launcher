---
title: Security
description: SHA256 verification, threat model, and what npm-launcher does and does not touch.
sidebar:
  order: 3
---

npm-launcher downloads and executes binaries on behalf of the user. Security is not optional.

## SHA256 verification

Every GitHub Release must include a `checksums-<version>.txt` file in GNU coreutils format. When npm-launcher downloads a binary, it:

1. Fetches `checksums-<version>.txt` from the same Release
2. Downloads the platform-specific binary to a `.tmp` file
3. Computes the SHA256 hash of the downloaded file
4. Compares it against the expected hash from the checksums file
5. If the hashes match, renames the file into cache and marks it executable
6. If they do not match, deletes the downloaded file and aborts with an error

This prevents tampered or corrupted binaries from ever being executed.

## Atomic downloads

Downloads write to a temporary `.tmp` file first. The rename into cache only happens after verification passes. This means an interrupted download or a verification failure never leaves a broken binary in the cache.

## Threat model

### What npm-launcher touches

- **Network:** HTTPS only, to `github.com` and GitHub's CDN. No other destinations.
- **Filesystem:** Writes to local cache only (`~/.cache/mcptoolshop/` on Linux/macOS, `%LOCALAPPDATA%\mcptoolshop\` on Windows). Does not modify system files or read outside the cache directory.

### What npm-launcher does not do

- **No telemetry.** No usage data, analytics, or crash reports are sent anywhere.
- **No secrets handling.** No credentials are stored, read, or transmitted.
- **No system modifications.** No PATH changes, no registry edits, no startup entries.
- **No elevated permissions.** Runs entirely within normal user-level filesystem and network access.

## Concurrent safety

File locking prevents race conditions when multiple npx invocations attempt to download the same binary simultaneously. Only one process downloads; others wait for the lock, then use the cached result.

## Supply chain considerations

The security of npm-launcher depends on the integrity of:

1. **The GitHub Release** -- whoever has push access to the upstream repo controls the binaries. Review release automation carefully.
2. **The checksums file** -- if an attacker can modify both the binary and the checksums file in the same Release, verification passes. Use branch protection rules and require PR reviews for release workflows.
3. **The wrapper package on npm** -- the wrapper pins a specific version. An npm account compromise could push a wrapper pointing to a malicious version. Enable 2FA and use npm provenance if available.
