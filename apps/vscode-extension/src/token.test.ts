import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { authorize } from "./token";

describe("authorize", () => {
  it("accepts a matching bearer token", () => {
    assert.equal(authorize("Bearer secret", "secret"), true);
    assert.equal(authorize("Bearer nope", "secret"), false);
    assert.equal(authorize(undefined, "secret"), false);
  });
});
