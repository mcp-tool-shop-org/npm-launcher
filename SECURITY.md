# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.x     | Yes       |
| < 1.0   | No        |

## Reporting a Vulnerability

Email: **64996768+mcp-tool-shop@users.noreply.github.com**

Include:
- Description of the vulnerability
- Steps to reproduce
- Version affected
- Potential impact

### Response timeline

| Action | Target |
|--------|--------|
| Acknowledge report | 48 hours |
| Assess severity | 7 days |
| Release fix | 30 days |

## Scope

This tool downloads and caches prebuilt binaries from GitHub Releases.

- **Data touched:** Downloads binaries to local cache (`~/.cache/mcptoolshop/` or `%LOCALAPPDATA%\mcptoolshop\`)
- **Network egress:** HTTPS only, to `github.com` and GitHub's CDN — no other destinations
- **No secrets handling** — does not read, store, or transmit credentials
- **No telemetry** is collected or sent
- **Checksum verification:** All downloaded binaries are verified against SHA256 checksums before execution
