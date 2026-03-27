---
title: Beginners
description: New to npm-launcher? A plain-language guide to what it does, why it exists, and how to get started.
sidebar:
  order: 99
---

## What is npm-launcher?

npm-launcher is a small Node.js library that lets you distribute compiled binaries through npm. If you have a Python CLI, a Go tool, or any compiled program, npm-launcher wraps it so users can run it with a single `npx` command -- no Python, Go, or Rust install required on their machine.

When a user runs `npx @mcptoolshop/my-tool`, npm-launcher figures out what operating system they are on, downloads the correct binary from your GitHub Release, verifies it has not been tampered with, caches it locally, and runs it. The second time they run it, the binary is already cached and launches instantly.

## Who is this for?

npm-launcher is for developers who:

- Build CLI tools in Python, Go, Rust, C, or any language that compiles to a standalone binary
- Want users to install and run the tool with `npx` instead of setting up a language runtime
- Already publish binaries as GitHub Releases and want a smoother distribution channel
- Need SHA256 verification and cross-platform support without writing boilerplate

If you are an **end user** of a tool that uses npm-launcher, you do not need to install npm-launcher directly. Just run the wrapper package (e.g. `npx @mcptoolshop/sovereignty`) and npm-launcher handles everything behind the scenes.

## Key concepts

**Wrapper package.** A tiny npm package (about 3 files) that tells npm-launcher which GitHub repo and version to fetch. The wrapper is what gets published to npm. It contains no binary code -- just a config pointing to your GitHub Release.

**Config contract.** The wrapper passes a JSON object via the `MCPTOOLSHOP_LAUNCH_CONFIG` environment variable. This object specifies the tool name, GitHub owner, repo, and version. npm-launcher uses this to construct download URLs and locate the cache.

**Asset naming convention.** Binaries in your GitHub Release must follow the pattern `<toolName>-<version>-<os>-<arch><ext>`. For example, `my-tool-1.0.0-linux-x64` or `my-tool-1.0.0-win-x64.exe`. A matching `checksums-<version>.txt` file must also be present.

**Local cache.** Downloaded binaries are stored in a per-tool, per-version directory on the user's machine. On Linux and macOS this is under `~/.cache/mcptoolshop/`, and on Windows under `%LOCALAPPDATA%\mcptoolshop\`. The cache is safe to delete at any time.

## First steps

1. **Install Node.js 20 or later.** npm-launcher requires Node.js 20+ (LTS recommended). Check with `node --version`.

2. **Create a wrapper package.** Start with a new directory containing `package.json` and a `bin/` script. The [Wrapper Guide](/npm-launcher/handbook/wrapper-guide/) walks through every file.

3. **Build your binaries.** Use PyInstaller, `go build`, `cargo build --release`, or any build tool. Name the output files following the asset naming convention above.

4. **Generate checksums.** Run `sha256sum dist/* > checksums-1.0.0.txt` (or equivalent) to create the checksums file in GNU coreutils format.

5. **Create a GitHub Release.** Tag your commit (e.g. `v1.0.0`) and upload all binaries plus the checksums file to the release.

6. **Publish the wrapper.** Run `npm publish --access public`. Users can now run `npx @your-scope/my-tool`.

## Common questions

**Does npm-launcher phone home or collect data?**
No. There is no telemetry, no analytics, and no crash reporting. The only network requests go to `github.com` to download your release assets.

**What happens if the download fails or the checksum does not match?**
npm-launcher deletes any partial or mismatched download and exits with a clear error message. The cache is never left in a broken state. Run the command again to retry.

**Can two users (or two terminals) download at the same time?**
Yes. npm-launcher uses file locking so only one process downloads a given binary. Others wait for the lock and then use the cached result.

**How do I update the binary version?**
Update the `version` field in both your wrapper's `package.json` and the bin script's config JSON, then publish a new npm release. Users get the new version on their next `npx` run.

**What platforms are supported?**
Linux x64, macOS ARM64 (Apple Silicon), macOS x64 (Intel), and Windows x64. If a user runs on an unsupported platform, npm-launcher exits with a message listing supported options.

## Troubleshooting

**"MCPTOOLSHOP_LAUNCH_CONFIG is not set"** -- You ran `mcptoolshop-launch` directly instead of through a wrapper. This binary is designed to be called by a wrapper package that sets the config environment variable.

**"No checksum found for asset"** -- The checksums file in your GitHub Release does not contain an entry for the user's platform. Check that your CI built and uploaded binaries for all supported platforms, and that the asset names follow the naming convention exactly.

**"SHA256 mismatch"** -- The downloaded file does not match the expected hash. This could mean a corrupted download or a mismatch between the binary and checksums file. Re-upload the release assets and try again. npm-launcher automatically deletes the mismatched file.

**"Timed out waiting for lock"** -- Another download process may be stuck. Delete the `.lock` file in the cache directory (shown in the error message) and retry. Lock files older than 60 seconds are automatically broken.

**"Unsupported platform"** -- npm-launcher does not have a mapping for the user's OS and architecture. See [supported platforms](/npm-launcher/handbook/getting-started/#supported-platforms) for the full list.

## Next steps

- Read the [Getting Started](/npm-launcher/handbook/getting-started/) guide for the full lifecycle diagram
- See the [Configuration](/npm-launcher/handbook/configuration/) reference for all config fields and environment variables
- Follow the [Wrapper Guide](/npm-launcher/handbook/wrapper-guide/) to build and publish your first wrapper
- Review the [Security](/npm-launcher/handbook/security/) page to understand the threat model
