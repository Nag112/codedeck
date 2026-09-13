import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { appleScriptForKeys } from "./executor";

describe("mac shortcut translation", () => {
  it("builds System Events keystroke scripts", () => {
    assert.equal(
      appleScriptForKeys(["cmd", "shift", "p"]),
      'tell application "System Events" to keystroke "p" using {command down, shift down}',
    );
  });

  it("rejects shortcuts without a key", () => {
    assert.throws(() => appleScriptForKeys(["cmd", "shift"]));
  });
});
