import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseHostLine } from "./parse";
import {
  createFirmwareManifest,
  encodeUpdateSession,
  md5Hex,
  needsFirmwareUpdate,
  splitFirmwareChunks,
  verifyFirmware,
} from "./update";

describe("firmware update helpers", () => {
  it("detects when the Mac app has a newer build", () => {
    assert.equal(needsFirmwareUpdate("1.0.0", "1.0.1"), true);
    assert.equal(needsFirmwareUpdate("1.2.0", "1.2.0"), false);
    assert.equal(needsFirmwareUpdate("2.0.0", "1.9.9"), false);
  });

  it("chunks a binary and round-trips through NDJSON", () => {
    const binary = Buffer.from("CodeDeck firmware fixture");
    const manifest = createFirmwareManifest("1.0.1", "codedeck.bin", binary);
    verifyFirmware(binary, manifest);
    assert.equal(manifest.md5, md5Hex(binary));
    assert.equal(splitFirmwareChunks(binary, 8).length, 4);

    const lines = encodeUpdateSession(binary, "1.0.1", 16);
    const begin = parseHostLine(lines[0]);
    assert.equal(begin.type, "update_begin");
    if (begin.type === "update_begin") {
      assert.equal(begin.size, binary.length);
      assert.equal(begin.md5, manifest.md5);
    }
    assert.equal(lines[lines.length - 1], '{"type":"update_end"}');
    const rebuilt: Buffer[] = [];
    for (const line of lines.slice(1, -1)) {
      const chunk = parseHostLine(line);
      assert.equal(chunk.type, "update_chunk");
      if (chunk.type === "update_chunk") {
        rebuilt.push(Buffer.from(chunk.data, "base64"));
      }
    }
    assert.equal(Buffer.concat(rebuilt).toString(), binary.toString());
  });

  it("rejects a tampered image", () => {
    const binary = Buffer.from("abc");
    const manifest = createFirmwareManifest("1.0.0", "x.bin", binary);
    assert.throws(() => verifyFirmware(Buffer.from("abd"), manifest));
  });
});
