import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { describe, it } from "node:test";
import { createDefaultProfile } from "@codedeck/protocol";
import { exportProfileJson, importProfileJson } from "./store";

describe("profile store", () => {
  it("round-trips JSON", () => {
    const profile = createDefaultProfile("3x4");
    profile.keys[2].label = "Term";
    const json = exportProfileJson(profile);
    const loaded = importProfileJson(json);
    assert.equal(loaded.keys[2].label, "Term");
    writeFileSync(join(mkdtempSync(join(tmpdir(), "cd-")), "p.json"), json);
  });

  it("rejects invalid JSON profiles", () => {
    assert.throws(() => importProfileJson('{"version":1,"name":"x","layout":"3x4","keys":[]}'));
  });
});
