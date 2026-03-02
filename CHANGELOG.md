# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

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
