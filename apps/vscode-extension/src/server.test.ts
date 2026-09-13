import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createBridgeServer } from "./server";

describe("bridge server", () => {
  it("executes an authorized command", async () => {
    const ran: string[] = [];
    const server = await createBridgeServer(0, "tok", async (command) => {
      ran.push(command);
    });
    const addr = server.address();
    const port = typeof addr === "object" && addr ? addr.port : 0;
    const response = await fetch(`http://127.0.0.1:${port}/v1/execute`, {
      method: "POST",
      headers: { Authorization: "Bearer tok", "Content-Type": "application/json" },
      body: JSON.stringify({ command: "workbench.action.showCommands" }),
    });
    const body = (await response.json()) as { ok: boolean };
    assert.equal(response.status, 200);
    assert.equal(body.ok, true);
    assert.deepEqual(ran, ["workbench.action.showCommands"]);
    const denied = await fetch(`http://127.0.0.1:${port}/v1/execute`, {
      method: "POST",
      headers: { Authorization: "Bearer wrong", "Content-Type": "application/json" },
      body: JSON.stringify({ command: "x" }),
    });
    assert.equal(denied.status, 401);
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });
});
