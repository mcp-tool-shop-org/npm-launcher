import type { SiteConfig } from '@mcptoolshop/site-theme';

export const config: SiteConfig = {
  title: '@mcptoolshop/npm-launcher',
  description: 'Generic GitHub-release binary launcher with cache + SHA256 verification',
  logoBadge: 'NL',
  brandName: 'npm-launcher',
  repoUrl: 'https://github.com/mcp-tool-shop-org/npm-launcher',
  npmUrl: 'https://www.npmjs.com/package/@mcptoolshop/npm-launcher',
  footerText: 'MIT Licensed — built by <a href="https://github.com/mcp-tool-shop-org" style="color:var(--color-muted);text-decoration:underline">mcp-tool-shop-org</a>',

  hero: {
    badge: 'Zero dependencies',
    headline: 'npm-launcher',
    headlineAccent: 'npx anything, anywhere.',
    description: 'Download, cache, verify, and run platform-specific binaries from GitHub Releases. One shared launcher for every CLI in your ecosystem.',
    primaryCta: { href: '#usage', label: 'Get started' },
    secondaryCta: { href: '#features', label: 'How it works' },
    previews: [
      { label: 'End user', code: 'npx @mcptoolshop/sovereignty tutorial' },
      { label: 'Wrapper', code: 'process.env.MCPTOOLSHOP_LAUNCH_CONFIG = JSON.stringify({\n  toolName: "sovereignty",\n  owner: "mcp-tool-shop-org",\n  repo: "sovereignty",\n  version: "1.4.0",\n});\nrequire("@mcptoolshop/npm-launcher/bin/mcptoolshop-launch.js");' },
      { label: 'CI', code: 'pyinstaller --onefile --name sovereignty src/__main__.py\nsha256sum dist/* > checksums-1.4.0.txt' },
    ],
  },

  sections: [
    {
      kind: 'features',
      id: 'features',
      title: 'Features',
      subtitle: 'Everything a binary launcher needs. Nothing it doesn\'t.',
      features: [
        { title: 'SHA256 verified', desc: 'Every binary is checked against checksums from the same GitHub Release. Mismatches abort and clean up.' },
        { title: 'Atomic downloads', desc: 'Writes to .tmp, verifies, then renames. Interrupted downloads never poison the cache.' },
        { title: 'Zero dependencies', desc: 'Pure Node.js stdlib. No node-fetch, no got, nothing to audit. Ships at 8 kB.' },
        { title: 'Cache-first', desc: 'Downloads once per version, then runs from local cache. Second launch is instant.' },
        { title: 'Quiet mode', desc: 'Set MCPTOOLSHOP_LAUNCHER_QUIET=1 for script-friendly silent operation. Errors always print.' },
        { title: 'Concurrent-safe', desc: 'File locking prevents race conditions when multiple npx invocations download the same binary.' },
      ],
    },
    {
      kind: 'code-cards',
      id: 'usage',
      title: 'Usage',
      cards: [
        {
          title: '1. Build binaries in CI',
          code: '# PyInstaller matrix → GitHub Release assets\nsovereignty-1.4.0-linux-x64\nsovereignty-1.4.0-darwin-arm64\nsovereignty-1.4.0-darwin-x64\nsovereignty-1.4.0-win-x64.exe\nchecksums-1.4.0.txt',
        },
        {
          title: '2. Write a tiny wrapper',
          code: '#!/usr/bin/env node\nprocess.env.MCPTOOLSHOP_LAUNCH_CONFIG = JSON.stringify({\n  toolName: "sovereignty",\n  owner: "mcp-tool-shop-org",\n  repo: "sovereignty",\n  version: "1.4.0",\n});\nrequire("@mcptoolshop/npm-launcher/bin/mcptoolshop-launch.js");',
        },
      ],
    },
    {
      kind: 'data-table',
      id: 'platforms',
      title: 'Supported Platforms',
      columns: ['Platform', 'Asset suffix', 'Cache location'],
      rows: [
        ['Linux x64', '<tool>-<ver>-linux-x64', '~/.cache/mcptoolshop/'],
        ['macOS ARM64', '<tool>-<ver>-darwin-arm64', '~/.cache/mcptoolshop/'],
        ['macOS x64', '<tool>-<ver>-darwin-x64', '~/.cache/mcptoolshop/'],
        ['Windows x64', '<tool>-<ver>-win-x64.exe', '%LOCALAPPDATA%\\mcptoolshop\\'],
      ],
    },
  ],
};
