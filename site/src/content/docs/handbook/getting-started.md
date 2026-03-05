---
title: Getting Started
description: Install npm-launcher and understand the basic flow for distributing binaries via npm.
sidebar:
  order: 1
---

npm-launcher is a library for **wrapper packages**. End users install the wrapper (e.g. `npx @mcptoolshop/sovereignty`), not npm-launcher directly.

## Install

Add npm-launcher as a dependency in your wrapper package:

```bash
npm install @mcptoolshop/npm-launcher
```

## How it works

Here is the full lifecycle when a user runs your wrapper:

```
npx @mcptoolshop/sovereignty tutorial
        |
        v
  wrapper sets config JSON
        |
        v
  npm-launcher resolves platform (linux-x64, darwin-arm64, etc.)
        |
        v
  checks local cache (~/.cache/mcptoolshop/<tool>/<version>/)
        |
        +-- cached --> run binary
        |
        +-- not cached:
             fetch checksums-<version>.txt from GitHub Release
             download <tool>-<version>-<os>-<arch>[.exe]
             verify SHA256
             cache + chmod +x
             run binary
```

## Supported platforms

| Platform      | Asset suffix          |
|---------------|-----------------------|
| Linux x64     | `<tool>-<ver>-linux-x64`     |
| macOS ARM64   | `<tool>-<ver>-darwin-arm64`  |
| macOS x64     | `<tool>-<ver>-darwin-x64`    |
| Windows x64   | `<tool>-<ver>-win-x64.exe`  |

## Quick example

A minimal wrapper package has three files: `package.json`, a bin script, and a dependency on npm-launcher. See the [Wrapper Guide](/npm-launcher/handbook/wrapper-guide/) for the complete walkthrough.
