import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseHostLine } from "./parse";
import { runSerialUpdate, type SerialIo } from "./ota-client";

describe("runSerialUpdate", () => {
  it("streams begin, chunks, and end against a mock device", async () => {
    const binary = Buffer.from("0123456789abcdef");
    const inbound: string[] = ['{"type":"update_ready","chunk":256}'];
    const outbound: string[] = [];
    let written = 0;

    const io: SerialIo = {
      async write(text: string) {
        outbound.push(text.trim());
        const msg = parseHostLine(text);
        if (msg.type === "update_chunk") {
          written += Buffer.from(msg.data, "base64").length;
          inbound.push(JSON.stringify({ type: "update_ack", seq: msg.seq, written }));
        }
        if (msg.type === "update_end") {
          inbound.push(JSON.stringify({ type: "update_ok", fw: "1.0.1" }));
        }
      },
      async readLine() {
        const line = inbound.shift();
        if (!line) throw new Error("no device line");
        return line;
      },
    };

    await runSerialUpdate(io, binary, "1.0.1", undefined, 8);
    assert.equal(outbound[0].includes("update_begin"), true);
    assert.equal(outbound[outbound.length - 1], '{"type":"update_end"}');
    assert.equal(written, binary.length);
  });
});
