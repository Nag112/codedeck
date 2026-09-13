import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createDefaultProfile, expectedKeyCount, validateProfile } from "./profile";

describe("profiles", () => {
  it("creates a valid 12-key VS Code profile", () => {
    const profile = createDefaultProfile("3x4");
    assert.equal(profile.keys.length, 12);
    assert.equal(expectedKeyCount("3x4"), 12);
    assert.deepEqual(validateProfile(profile), []);
    assert.equal(profile.keys[0].action.command, "workbench.action.showCommands");
  });

  it("creates a valid 9-key profile", () => {
    const profile = createDefaultProfile("3x3");
    assert.equal(profile.keys.length, 9);
    assert.deepEqual(validateProfile(profile), []);
  });

  it("flags missing vscode commands", () => {
    const profile = createDefaultProfile("3x3");
    profile.keys[0].action = { kind: "vscode" };
    assert.ok(validateProfile(profile).length > 0);
  });
});
