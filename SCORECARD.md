# Scorecard

> Scored from `npx @mcptoolshop/shipcheck audit` and the full-treatment pass for 1.2.0.

**Repo:** npm-launcher
**Date:** 2026-10-22
**Type tags:** `[all]` `[npm]` `[cli]`

## Audit result

`shipcheck audit` on 465f406: 17 checked, 18 skipped with reasons, 0 unchecked, all hard gates (A–D) pass.

| Category | Result | Notes |
|----------|--------|-------|
| A. Security | pass | SECURITY.md, a threat model in the README, no secrets, no telemetry, SHA256 check on every binary |
| B. Error Handling | pass | Structured errors with hints; exit codes 0, 1 and 2, and the tool's own code passes through |
| C. Operator Docs | pass | README, CHANGELOG, LICENSE and handbook brought up to 1.2.0; `--help` accurate |
| D. Shipping Hygiene | pass | `verify` script, version matches tag, zero runtime dependencies, `npm pack` contents checked |
| E. Identity (soft) | pass | Logo, translations (7 languages), landing page with handbook, GitHub metadata, coverage badge |

## Coverage

59.08% lines on CI (c8). CI floor 59, ratcheting. Codecov project and patch targets are 90%; project stays red until the repo reaches 90.

## Open gaps

1. Line coverage is 59% against the 90% bar. The weakest files are `src/github.js` (23%, the HTTPS fetch and redirect code) and `src/index.js` (46%, the download-and-cache path inside `launch()`); the integration test drives them through a local HTTP server, not through `launch()` itself.
2. Pass-through to a real PyInstaller binary was checked by hand on Windows and Linux (WSL), not macOS; CI checks it with node standing in for the tool.
