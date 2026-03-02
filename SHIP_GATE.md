# Ship Gate

> No repo is "done" until every applicable line is checked.

**Tags:** `[all]` every repo · `[npm]` published artifacts · `[cli]` CLI tools

---

## A. Security Baseline

- [x] `[all]` SECURITY.md exists (report email, supported versions, response timeline) (2026-03-02)
- [x] `[all]` README includes threat model paragraph (data touched, data NOT touched, permissions required) (2026-03-02)
- [x] `[all]` No secrets, tokens, or credentials in source or diagnostics output (2026-03-02)
- [x] `[all]` No telemetry by default — state it explicitly even if obvious (2026-03-02)

### Default safety posture

- [ ] `[cli|mcp|desktop]` SKIP: Not a CLI itself — library consumed by wrapper packages
- [ ] `[cli|mcp|desktop]` SKIP: File ops constrained to cache dir only, not user-configurable
- [ ] `[mcp]` SKIP: Not an MCP server
- [ ] `[mcp]` SKIP: Not an MCP server

## B. Error Handling

- [x] `[all]` Errors follow the Structured Error Shape: `code`, `message`, `hint`, `cause?`, `retryable?` (2026-03-02)
- [ ] `[cli]` SKIP: Library — exit codes are passthrough from the wrapped binary
- [ ] `[cli]` SKIP: Library — no --debug flag; errors always include actionable context
- [ ] `[mcp]` SKIP: Not an MCP server
- [ ] `[mcp]` SKIP: Not an MCP server
- [ ] `[desktop]` SKIP: Not a desktop app
- [ ] `[vscode]` SKIP: Not a VS Code extension

## C. Operator Docs

- [x] `[all]` README is current: what it does, install, usage, supported platforms + runtime versions (2026-03-02)
- [x] `[all]` CHANGELOG.md (Keep a Changelog format) (2026-03-02)
- [x] `[all]` LICENSE file present and repo states support status (2026-03-02)
- [ ] `[cli]` SKIP: Library — no --help; wrappers expose the binary's --help
- [ ] `[cli|mcp|desktop]` SKIP: Two logging levels (normal/quiet via env var) appropriate for download+cache scope
- [ ] `[mcp]` SKIP: Not an MCP server
- [ ] `[complex]` SKIP: Single-purpose download+cache+run — not complex

## D. Shipping Hygiene

- [x] `[all]` `verify` script exists (test + build + smoke in one command) (2026-03-02)
- [x] `[all]` Version in manifest matches git tag (2026-03-02)
- [ ] `[all]` SKIP: Zero runtime dependencies — nothing to scan
- [ ] `[all]` SKIP: Zero runtime dependencies — nothing to update
- [x] `[npm]` `npm pack --dry-run` includes: src/, bin/, README.md, LICENSE (2026-03-02)
- [x] `[npm]` `engines.node` set (>=18) (2026-03-02)
- [x] `[npm]` SKIP: No lockfile needed — zero runtime dependencies
- [ ] `[vsix]` SKIP: Not a VS Code extension
- [ ] `[desktop]` SKIP: Not a desktop app

## E. Identity (soft gate — does not block ship)

- [x] `[all]` Logo in README header (2026-03-02)
- [x] `[all]` Translations (polyglot-mcp, 8 languages) (2026-03-02)
- [x] `[org]` Landing page (@mcptoolshop/site-theme) (2026-03-02)
- [x] `[all]` GitHub repo metadata: description, homepage, topics (2026-03-02)

---

## Gate Rules

**Hard gate (A–D):** Must pass before any version is tagged or published.
If a section doesn't apply, mark `SKIP:` with justification — don't leave it unchecked.

**Soft gate (E):** Should be done. Product ships without it, but isn't "whole."
