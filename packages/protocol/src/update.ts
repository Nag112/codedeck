import { createHash } from "crypto";
import type { FirmwareManifest, HostToDevice } from "./types";
import { UPDATE_CHUNK_BYTES } from "./types";
import { encodeHostMessage } from "./parse";

export function md5Hex(data: Buffer): string {
  return createHash("md5").update(data).digest("hex");
}

export function compareVersions(a: string, b: string): number {
  const pa = a.split(".").map((part) => Number.parseInt(part, 10) || 0);
  const pb = b.split(".").map((part) => Number.parseInt(part, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i += 1) {
    const da = pa[i] ?? 0;
    const db = pb[i] ?? 0;
    if (da > db) return 1;
    if (da < db) return -1;
  }
  return 0;
}

export function needsFirmwareUpdate(deviceVersion: string, bundledVersion: string): boolean {
  return compareVersions(bundledVersion, deviceVersion) > 0;
}

export function createFirmwareManifest(
  version: string,
  file: string,
  binary: Buffer,
  board: FirmwareManifest["board"] = "esp32s3",
): FirmwareManifest {
  return {
    version,
    file,
    md5: md5Hex(binary),
    size: binary.length,
    board,
  };
}

export function verifyFirmware(binary: Buffer, manifest: Pick<FirmwareManifest, "md5" | "size">): void {
  if (binary.length !== manifest.size) {
    throw new Error(`firmware size mismatch: expected ${manifest.size}, got ${binary.length}`);
  }
  const actual = md5Hex(binary);
  if (actual !== manifest.md5.toLowerCase()) {
    throw new Error(`firmware md5 mismatch: expected ${manifest.md5}, got ${actual}`);
  }
}

export interface FirmwareChunk {
  seq: number;
  bytes: Buffer;
}

export function splitFirmwareChunks(binary: Buffer, chunkBytes = UPDATE_CHUNK_BYTES): FirmwareChunk[] {
  if (chunkBytes < 1) {
    throw new Error("chunk size must be positive");
  }
  const chunks: FirmwareChunk[] = [];
  for (let offset = 0, seq = 0; offset < binary.length; offset += chunkBytes, seq += 1) {
    chunks.push({ seq, bytes: binary.subarray(offset, offset + chunkBytes) });
  }
  return chunks;
}

export function encodeUpdateSession(binary: Buffer, fw: string, chunkBytes = UPDATE_CHUNK_BYTES): string[] {
  const md5 = md5Hex(binary);
  const lines = [encodeHostMessage({ type: "update_begin", size: binary.length, md5, fw }).trimEnd()];
  for (const chunk of splitFirmwareChunks(binary, chunkBytes)) {
    const message: HostToDevice = {
      type: "update_chunk",
      seq: chunk.seq,
      data: chunk.bytes.toString("base64"),
    };
    lines.push(encodeHostMessage(message).trimEnd());
  }
  lines.push(encodeHostMessage({ type: "update_end" }).trimEnd());
  return lines;
}
