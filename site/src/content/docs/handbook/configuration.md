---
title: Configuration
description: Config contract, asset naming convention, environment variables, and cache locations.
sidebar:
  order: 2
---

## Config contract

Wrappers pass configuration as pure JSON via the `MCPTOOLSHOP_LAUNCH_CONFIG` environment variable. No functions, no magic.

| Field      | Required | Example                | Description                          |
|------------|----------|------------------------|--------------------------------------|
| `toolName` | yes      | `"sovereignty"`        | Binary base name                     |
| `owner`    | yes      | `"mcp-tool-shop-org"`  | GitHub org or user                   |
| `repo`     | yes      | `"sovereignty"`        | GitHub repo name                     |
| `version`  | yes      | `"1.4.0"`              | Semver (no `v` prefix)               |
| `tag`      | no       | `"v1.4.0"`             | Git tag (defaults to `v<version>`)   |
| `quiet`    | no       | `true`                 | Suppress progress messages           |

## Asset naming convention

This naming scheme is locked. Every tool built on npm-launcher follows the same pattern:

```
<toolName>-<version>-<os>-<arch><ext>
```

Examples:

| Platform      | Asset filename                       |
|---------------|--------------------------------------|
| Linux x64     | `sovereignty-1.4.0-linux-x64`        |
| macOS ARM     | `sovereignty-1.4.0-darwin-arm64`     |
| macOS Intel   | `sovereignty-1.4.0-darwin-x64`       |
| Windows x64   | `sovereignty-1.4.0-win-x64.exe`     |

The checksums file is always named `checksums-<version>.txt` and uses GNU coreutils format.

## Version pinning

The `version` field in the config is an exact pin, not a range. When you want to ship a new version, update the version string in your wrapper's bin script and publish a new npm release.

The optional `tag` field lets you use a custom git tag format. If omitted, npm-launcher assumes the tag is `v<version>` (e.g. version `1.4.0` maps to tag `v1.4.0`).

## Environment variables

| Variable                       | Effect                                              |
|--------------------------------|-----------------------------------------------------|
| `MCPTOOLSHOP_LAUNCH_CONFIG`    | JSON config object (set by wrapper, not end user)   |
| `MCPTOOLSHOP_LAUNCHER_QUIET=1` | Suppress progress messages (errors still print)     |

## Cache locations

Downloaded binaries are stored per-tool, per-version:

| OS      | Path                                           |
|---------|-------------------------------------------------|
| Linux   | `$XDG_CACHE_HOME/mcptoolshop/<tool>/<version>/` (defaults to `~/.cache/mcptoolshop/`) |
| macOS   | `~/.cache/mcptoolshop/<tool>/<version>/`        |
| Windows | `%LOCALAPPDATA%\mcptoolshop\<tool>\<version>\`  |

On Linux, npm-launcher respects the `XDG_CACHE_HOME` environment variable. If unset, it defaults to `~/.cache`.

The cache is safe to delete at any time. npm-launcher will re-download and re-verify on next launch.

## Cache management

Two CLI flags help manage the cache:

- `--print-cache-path` -- prints the cache directory for the configured tool and version
- `--clear-cache` -- removes all cached binaries for the configured tool

These flags are intercepted by the launcher before the binary runs, so they work even if the binary is not yet downloaded.
