#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const version = process.env.CODEDECK_FW_VERSION || "1.0.0";
const board = process.argv[2] || "esp32s3";
const binPath = process.argv[3];
if (!binPath) {
  console.error("usage: package-release.mjs <esp32s3|esp32> <firmware.bin>");
  process.exit(1);
}
const binary = fs.readFileSync(binPath);
const destDir = path.resolve(__dirname, "../../apps/companion/resources/firmware");
fs.mkdirSync(destDir, { recursive: true });
const file = `codedeck-${board}.bin`;
fs.copyFileSync(binPath, path.join(destDir, file));
const manifest = {
  version,
  file,
  md5: crypto.createHash("md5").update(binary).digest("hex"),
  size: binary.length,
  board,
};
fs.writeFileSync(path.join(destDir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log("wrote", path.join(destDir, "manifest.json"));
