#!/usr/bin/env node
"use strict";

// Pure JSON config — npm-launcher derives asset names from convention:
//   binary:    xrpl-lab-1.6.0-linux-x64
//   checksums: checksums-1.6.0.txt
process.env.MCPTOOLSHOP_LAUNCH_CONFIG = JSON.stringify({
  toolName: "xrpl-lab",
  owner: "mcp-tool-shop-org",
  repo: "xrpl-lab",
  version: "1.6.0",
  tag: "v1.6.0",
});

require("@mcptoolshop/npm-launcher/bin/mcptoolshop-launch.js");
