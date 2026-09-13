import type { DeviceToHost, HostToDevice, KeyCount, Layout } from "./types";
import { PROTOCOL_VERSION } from "./types";

export class ProtocolError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProtocolError";
  }
}

function isKeyCount(value: unknown): value is KeyCount {
  return value === 9 || value === 12;
}

function isLayout(value: unknown): value is Layout {
  return value === "3x3" || value === "3x4";
}

function asObject(line: string): Record<string, unknown> {
  const trimmed = line.trim();
  if (!trimmed) {
    throw new ProtocolError("empty line");
  }
  let raw: unknown;
  try {
    raw = JSON.parse(trimmed);
  } catch {
    throw new ProtocolError("invalid JSON");
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new ProtocolError("message must be an object");
  }
  return raw as Record<string, unknown>;
}

export function parseDeviceLine(line: string): DeviceToHost {
  const msg = asObject(line);
  switch (msg.type) {
    case "hello": {
      if (!isKeyCount(msg.keys) || !isLayout(msg.layout) || typeof msg.fw !== "string") {
        throw new ProtocolError("invalid hello");
      }
      const protocol = typeof msg.protocol === "number" ? msg.protocol : PROTOCOL_VERSION;
      return { type: "hello", protocol, fw: msg.fw, keys: msg.keys, layout: msg.layout };
    }
    case "press":
    case "release": {
      if (typeof msg.key !== "number" || !Number.isInteger(msg.key) || msg.key < 0 || msg.key > 11) {
        throw new ProtocolError("invalid key index");
      }
      if (typeof msg.t !== "number") {
        throw new ProtocolError("missing timestamp");
      }
      return { type: msg.type, key: msg.key, t: msg.t };
    }
    case "pong": {
      if (typeof msg.t !== "number") {
        throw new ProtocolError("missing timestamp");
      }
      return { type: "pong", t: msg.t };
    }
    case "update_ready": {
      if (typeof msg.chunk !== "number" || msg.chunk < 1) {
        throw new ProtocolError("invalid update_ready");
      }
      return { type: "update_ready", chunk: msg.chunk };
    }
    case "update_ack": {
      if (typeof msg.seq !== "number" || typeof msg.written !== "number") {
        throw new ProtocolError("invalid update_ack");
      }
      return { type: "update_ack", seq: msg.seq, written: msg.written };
    }
    case "update_ok": {
      if (typeof msg.fw !== "string") {
        throw new ProtocolError("invalid update_ok");
      }
      return { type: "update_ok", fw: msg.fw };
    }
    case "update_error": {
      if (typeof msg.error !== "string") {
        throw new ProtocolError("invalid update_error");
      }
      return { type: "update_error", error: msg.error };
    }
    default:
      throw new ProtocolError(`unknown type: ${String(msg.type)}`);
  }
}

export function parseHostLine(line: string): HostToDevice {
  const msg = asObject(line);
  switch (msg.type) {
    case "ping":
      return { type: "ping" };
    case "get_info":
      return { type: "get_info" };
    case "update_begin": {
      if (typeof msg.size !== "number" || msg.size < 1) {
        throw new ProtocolError("invalid update size");
      }
      if (typeof msg.md5 !== "string" || !/^[0-9a-f]{32}$/i.test(msg.md5)) {
        throw new ProtocolError("invalid md5");
      }
      if (typeof msg.fw !== "string" || !msg.fw) {
        throw new ProtocolError("invalid firmware version");
      }
      return { type: "update_begin", size: msg.size, md5: msg.md5.toLowerCase(), fw: msg.fw };
    }
    case "update_chunk": {
      if (typeof msg.seq !== "number" || msg.seq < 0) {
        throw new ProtocolError("invalid chunk seq");
      }
      if (typeof msg.data !== "string" || msg.data.length === 0) {
        throw new ProtocolError("invalid chunk data");
      }
      return { type: "update_chunk", seq: msg.seq, data: msg.data };
    }
    case "update_end":
      return { type: "update_end" };
    case "update_abort":
      return { type: "update_abort" };
    default:
      throw new ProtocolError(`unknown host type: ${String(msg.type)}`);
  }
}

export function encodeHostMessage(message: HostToDevice): string {
  return `${JSON.stringify(message)}\n`;
}

export function encodeDeviceMessage(message: DeviceToHost): string {
  return `${JSON.stringify(message)}\n`;
}

export class LineBuffer {
  private buffer = "";

  push(chunk: string): string[] {
    this.buffer += chunk;
    const lines: string[] = [];
    let idx = this.buffer.indexOf("\n");
    while (idx >= 0) {
      lines.push(this.buffer.slice(0, idx));
      this.buffer = this.buffer.slice(idx + 1);
      idx = this.buffer.indexOf("\n");
    }
    return lines;
  }

  leftover(): string {
    return this.buffer;
  }
}
