---
title: Wrapper Guide
description: Step-by-step instructions for writing a wrapper package that uses npm-launcher.
sidebar:
  order: 4
---

A wrapper is a tiny npm package (about 3 files) that tells npm-launcher which binary to fetch and run. End users install the wrapper; npm-launcher does the rest.

## Package structure

```
my-tool/
  package.json
  bin/
    my-tool.js
  LICENSE
```

## Step 1: package.json

```json
{
  "name": "@mcptoolshop/my-tool",
  "version": "1.0.0",
  "bin": {
    "my-tool": "bin/my-tool.js"
  },
  "dependencies": {
    "@mcptoolshop/npm-launcher": "^1.0.0"
  }
}
```

Key points:
- The `bin` field maps the CLI command name to your bin script
- The only dependency is npm-launcher itself
- The wrapper version should match the binary version you are distributing

## Step 2: bin script

Create `bin/my-tool.js`:

```js
#!/usr/bin/env node
process.env.MCPTOOLSHOP_LAUNCH_CONFIG = JSON.stringify({
  toolName: "my-tool",
  owner: "your-org",
  repo: "my-tool",
  version: "1.0.0",
});
require("@mcptoolshop/npm-launcher/bin/mcptoolshop-launch.js");
```

The bin script does two things:
1. Sets the `MCPTOOLSHOP_LAUNCH_CONFIG` environment variable with your tool's coordinates
2. Hands off to npm-launcher, which handles download, verification, caching, and execution

## Step 3: Build and release binaries

Your CI workflow should:

1. Build platform-specific binaries following the [asset naming convention](/npm-launcher/handbook/configuration/#asset-naming-convention)
2. Generate a `checksums-<version>.txt` file using `sha256sum`
3. Upload everything to a GitHub Release tagged with `v<version>`

Example CI snippet for a Python tool:

```bash
# Build with PyInstaller
pyinstaller --onefile --name my-tool src/__main__.py

# Generate checksums
sha256sum dist/* > checksums-1.0.0.txt
```

## Step 4: Publish the wrapper

```bash
npm publish --access public
```

Users can now run your tool with:

```bash
npx @mcptoolshop/my-tool --help
```

## Updating versions

When you release a new binary version:

1. Build and publish the new binaries to a new GitHub Release
2. Update the `version` field in both `package.json` and the bin script's config
3. Publish the updated wrapper to npm

The wrapper version and the binary version should always stay in sync.

## Quiet mode

If you want your wrapper to suppress npm-launcher's progress output by default, set `quiet: true` in the config:

```js
process.env.MCPTOOLSHOP_LAUNCH_CONFIG = JSON.stringify({
  toolName: "my-tool",
  owner: "your-org",
  repo: "my-tool",
  version: "1.0.0",
  quiet: true,
});
```

Users can also set the `MCPTOOLSHOP_LAUNCHER_QUIET=1` environment variable to suppress output for any wrapper.
