"use strict";

const https = require("https");
const fs = require("fs");
const { pipeline } = require("stream");
const { promisify } = require("util");

const streamPipeline = promisify(pipeline);

const UA = "mcptoolshop-launcher";
const MAX_REDIRECTS = 5;

/**
 * GET a URL, following redirects. Returns { status, body }.
 */
function get(url, headers = {}, redirectsLeft = MAX_REDIRECTS) {
  return new Promise((resolve, reject) => {
    const opts = { headers: { "User-Agent": UA, ...headers } };
    https.get(url, opts, (res) => {
      if (
        res.statusCode >= 300 &&
        res.statusCode < 400 &&
        res.headers.location
      ) {
        if (redirectsLeft <= 0) {
          reject(new Error(`Too many redirects for ${url}`));
          return;
        }
        // drain response before following redirect
        res.resume();
        resolve(get(res.headers.location, headers, redirectsLeft - 1));
        return;
      }

      const chunks = [];
      res.on("data", (d) => chunks.push(d));
      res.on("end", () =>
        resolve({ status: res.statusCode || 0, body: Buffer.concat(chunks) })
      );
      res.on("error", reject);
    }).on("error", reject);
  });
}

/**
 * Download a URL to a local file, following redirects.
 */
function downloadToFile(url, outPath, headers = {}, redirectsLeft = MAX_REDIRECTS) {
  return new Promise((resolve, reject) => {
    const opts = { headers: { "User-Agent": UA, ...headers } };
    https.get(url, opts, (res) => {
      if (
        res.statusCode >= 300 &&
        res.statusCode < 400 &&
        res.headers.location
      ) {
        if (redirectsLeft <= 0) {
          reject(new Error(`Too many redirects for ${url}`));
          return;
        }
        res.resume();
        downloadToFile(res.headers.location, outPath, headers, redirectsLeft - 1)
          .then(resolve)
          .catch(reject);
        return;
      }

      if (res.statusCode !== 200) {
        res.resume();
        reject(new Error(`Download failed (HTTP ${res.statusCode}): ${url}`));
        return;
      }

      const file = fs.createWriteStream(outPath);
      streamPipeline(res, file).then(resolve).catch(reject);
    }).on("error", reject);
  });
}

/**
 * Build a GitHub Release asset download URL.
 */
function releaseAssetUrl(owner, repo, tag, assetName) {
  return `https://github.com/${owner}/${repo}/releases/download/${tag}/${assetName}`;
}

module.exports = { get, downloadToFile, releaseAssetUrl };
