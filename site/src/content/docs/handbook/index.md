---
title: npm-launcher Handbook
description: Everything you need to know about using npm-launcher to distribute binaries via npm.
sidebar:
  order: 0
---

Welcome to the npm-launcher handbook. This guide covers everything from basic usage to writing your own wrapper packages.

## What is npm-launcher?

npm-launcher is a generic GitHub-release binary launcher for npm. It lets you distribute compiled binaries (from PyInstaller, Go, Rust, or any build tool) through npm with a single `npx` command.

When a user runs your wrapper package, npm-launcher:

1. Resolves the current platform (linux-x64, darwin-arm64, win-x64, etc.)
2. Checks the local cache for an existing binary
3. If not cached: downloads the binary from your GitHub Release, verifies its SHA256 checksum, caches it, and marks it executable
4. Runs the binary with full argument passthrough

## What's in this handbook

- **[Beginners](/npm-launcher/handbook/beginners/)** -- New to npm-launcher? Start here for a plain-language walkthrough
- **[Getting Started](/npm-launcher/handbook/getting-started/)** -- Install npm-launcher and understand the basic flow
- **[Configuration](/npm-launcher/handbook/configuration/)** -- The config contract, asset naming, environment variables, and cache locations
- **[Security](/npm-launcher/handbook/security/)** -- SHA256 verification, threat model, and what npm-launcher does and does not touch
- **[Wrapper Guide](/npm-launcher/handbook/wrapper-guide/)** -- Step-by-step instructions for writing your own wrapper package

## Design principles

- **Zero dependencies.** Pure Node.js stdlib. Nothing to audit, nothing to break. Under 15 kB of source code.
- **Cache-first.** Downloads once per version, then runs from local cache. Second launch is instant.
- **Verify everything.** Every binary is checked against SHA256 checksums from the same GitHub Release. Mismatches abort and clean up.
- **Concurrent-safe.** File locking prevents race conditions when multiple npx invocations hit the same binary.
