import type { DeviceToHost } from "./types";
import { UPDATE_CHUNK_BYTES } from "./types";
import { parseDeviceLine } from "./parse";
import { encodeUpdateSession } from "./update";

export interface SerialIo {
  write(text: string): Promise<void>;
  readLine(timeoutMs: number): Promise<string>;
}

export interface UpdateProgress {
  phase: "begin" | "write" | "finish";
  written: number;
  size: number;
}

function waitForType(io: SerialIo, type: DeviceToHost["type"], timeoutMs: number): Promise<DeviceToHost> {
  return io.readLine(timeoutMs).then((line) => {
    const message = parseDeviceLine(line);
    if (
      message.type === "press" ||
      message.type === "release" ||
      message.type === "pong" ||
      message.type === "hello"
    ) {
      return waitForType(io, type, timeoutMs);
    }
    if (message.type !== type && message.type !== "update_error") {
      throw new Error(`expected ${type}, got ${message.type}`);
    }
    if (message.type === "update_error") {
      throw new Error(message.error);
    }
    return message;
  });
}

export async function runSerialUpdate(
  io: SerialIo,
  binary: Buffer,
  fw: string,
  onProgress?: (progress: UpdateProgress) => void,
  chunkBytes = UPDATE_CHUNK_BYTES,
): Promise<void> {
  const lines = encodeUpdateSession(binary, fw, chunkBytes);
  await io.write(`${lines[0]}\n`);
  const ready = await waitForType(io, "update_ready", 5000);
  if (ready.type !== "update_ready") {
    throw new Error("device did not accept update");
  }

  const chunks = lines.slice(1, -1);
  let written = 0;
  for (const line of chunks) {
    await io.write(`${line}\n`);
    const ack = await waitForType(io, "update_ack", 8000);
    if (ack.type === "update_ack") {
      written = ack.written;
      onProgress?.({ phase: "write", written, size: binary.length });
    }
  }

  await io.write(`${lines[lines.length - 1]}\n`);
  onProgress?.({ phase: "finish", written: binary.length, size: binary.length });
  await waitForType(io, "update_ok", 15000);
}
