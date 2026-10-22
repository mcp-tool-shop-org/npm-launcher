# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [1.2.0] - 2026-10-22

### Changed

- **Through a wrapper, `--version`, `-V`, `--help` and `-h` reach the tool**
  (#6). 1.1.1 answered them before reading the wrapper's config, so
  `npx @mcptoolshop/<tool> --version` printed `mcptoolshop-launch 1.1.1`
  instead of the tool's version. Run on its own (no
  `MCPTOOLSHOP_LAUNCH_CONFIG`), the launcher still answers them itself.
  Wrappers with a `^1` range pick this up on their next install.

- **The tool sees its own name.** The binary is started with `argv[0]` set to
  the tool's name, so a tool's help reads `Usage: xrpl-lab ...` rather than
  `Usage: xrpl-lab-2.7.9-win-x64.exe ...`, the cached asset's file name. That
  only became visible once `--help` reached the tool.

### Added

- `--launcher-version` prints the launcher's version, with or without a
  wrapper.
- Seven pass-through tests (24 total), and a CI line-coverage floor at the
  measured level (target 90).

## [1.1.1] - 2026-03-25

### Added

- `--version` / `-V` flag — prints version and exits (works without config)
- `--help` / `-h` flag — full CLI usage documentation (works without config)
- CHANGELOG.md included in npm tarball
- 4 new CLI flag tests (17 total)

### Changed

- CI matrix updated from Node 18+22 to Node 20+22 (18 is EOL)
- CI now smoke-tests `--version` and `--help` flags

## [1.1.0] - 2026-03-02

### Added

- `--print-cache-path`: show where binaries are cached for this tool+version
- `--clear-cache`: remove cached binaries (useful for support + fresh re-download)

### Changed

- Example CI workflow: drop macos-13 (deprecated), add `--collect-submodules rich`, pin `pyinstaller>=6.9.0`

## [1.0.0] - 2026-03-02

### Added

- Platform detection for linux-x64, darwin-arm64, darwin-x64, win-x64
- SHA256 checksum verification against `checksums-<version>.txt`
- Local binary caching (`~/.cache/mcptoolshop/` / `%LOCALAPPDATA%`)
- Atomic writes: download to `.tmp`, verify, rename
- 30s timeout on all HTTPS requests
- File locking to prevent concurrent download races
- Quiet mode via `MCPTOOLSHOP_LAUNCHER_QUIET=1` or `config.quiet`
- Helpful error messages with platform hints and release page links
- 13 tests: verify, platform, cache, locking, integration flow
- Wrapper examples for sovereignty and xrpl-camp
- Reference PyInstaller CI workflow (`examples/ci/release-binaries.yml`)
