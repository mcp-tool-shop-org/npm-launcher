#!/usr/bin/env node
"use strict";

process.env.MCPTOOLSHOP_LAUNCH_CONFIG = JSON.stringify({
  toolName: "xrpl-camp",
  owner: "mcp-tool-shop-org",
  repo: "xrpl-camp",
  version: "0.1.0",
  tag: "v0.1.0",
});

require("@mcptoolshop/npm-launcher/bin/mcptoolshop-launch.js");
