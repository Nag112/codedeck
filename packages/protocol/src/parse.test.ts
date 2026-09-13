import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { LineBuffer, encodeHostMessage, parseDeviceLine, parseHostLine } from "./parse";

describe("parseDeviceLine", () => {
  it("parses hello, press, and update status", () => {
    assert.deepEqual(parseDeviceLine('{"type":"hello","protocol":1,"fw":"1.0.0","keys":12,"layout":"3x4"}'), {
      type: "hello",
      protocol: 1,
      fw: "1.0.0",
      keys: 12,
      layout: "3x4",
    });
    assert.equal(parseDeviceLine('{"type":"press","key":3,"t":12}').type, "press");
    assert.equal(parseDeviceLine('{"type":"update_ready","chunk":256}').type, "update_ready");
    assert.equal(parseDeviceLine('{"type":"update_ok","fw":"1.1.0"}').type, "update_ok");
  });

  it("rejects bad payloads", () => {
    assert.throws(() => parseDeviceLine("not-json"));
    assert.throws(() => parseDeviceLine('{"type":"press","key":99,"t":1}'));
    assert.throws(() => parseDeviceLine('{"type":"nope"}'));
  });
});

describe("parseHostLine", () => {
  it("parses firmware update commands", () => {
    const begin = parseHostLine(
      '{"type":"update_begin","size":4,"md5":"098f6bcd4621d373cade4e832627b4f6","fw":"1.0.1"}',
    );
    assert.equal(begin.type, "update_begin");
    assert.equal(parseHostLine('{"type":"update_chunk","seq":0,"data":"dGVzdA=="}').type, "update_chunk");
    assert.equal(parseHostLine('{"type":"update_end"}').type, "update_end");
  });
});

describe("LineBuffer", () => {
  it("splits NDJSON across chunks", () => {
    const buf = new LineBuffer();
    assert.deepEqual(buf.push('{"type":"ping"}\n{"type":'), ['{"type":"ping"}']);
    assert.deepEqual(buf.push('"get_info"}\n'), ['{"type":"get_info"}']);
  });
});

describe("encodeHostMessage", () => {
  it("appends a newline", () => {
    assert.equal(encodeHostMessage({ type: "ping" }), '{"type":"ping"}\n');
  });
});
