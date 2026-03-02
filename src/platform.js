"use strict";

const SUPPORTED = {
  "linux-x64":    { os: "linux",  arch: "x64",   ext: "" },
  "darwin-arm64": { os: "darwin", arch: "arm64", ext: "" },
  "darwin-x64":   { os: "darwin", arch: "x64",   ext: "" },
  "win32-x64":    { os: "win",   arch: "x64",   ext: ".exe" },
};

function resolveTarget() {
  const key = `${process.platform}-${process.arch}`;
  const target = SUPPORTED[key];
  if (!target) {
    const supported = Object.keys(SUPPORTED)
      .map((k) => k.replace("win32", "windows"))
      .join(", ");
    throw new Error(
      `Unsupported platform: ${process.platform}/${process.arch}\n` +
      `Supported: ${supported}`
    );
  }
  return target;
}

module.exports = { resolveTarget };
