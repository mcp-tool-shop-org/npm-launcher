#!/usr/bin/env node
"use strict";

// Pure JSON config — launcher derives asset names from convention:
//   binary:    sovereignty-2.1.0-linux-x64
//   checksums: checksums-2.1.0.txt
process.env.MCPTOOLSHOP_LAUNCH_CONFIG = JSON.stringify({
  toolName: "sovereignty",
  owner: "mcp-tool-shop-org",
  repo: "sovereignty",
  version: "2.1.0",
  tag: "v2.1.0",
});

require("@mcptoolshop/npm-launcher/bin/mcptoolshop-launch.js");
