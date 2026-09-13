export const PROTOCOL_VERSION = 1;
export const FIRMWARE_VERSION = "1.0.0";
export const DEFAULT_BRIDGE_PORT = 17322;
export const TOKEN_RELATIVE_PATH = ".codedeck/token";
export const PROFILE_RELATIVE_PATH = ".codedeck/profile.json";
export const UPDATE_CHUNK_BYTES = 256;

export type Layout = "3x3" | "3x4";
export type KeyCount = 9 | 12;

export type DeviceToHost =
  | { type: "hello"; protocol: number; fw: string; keys: KeyCount; layout: Layout }
  | { type: "press"; key: number; t: number }
  | { type: "release"; key: number; t: number }
  | { type: "pong"; t: number }
  | { type: "update_ready"; chunk: number }
  | { type: "update_ack"; seq: number; written: number }
  | { type: "update_ok"; fw: string }
  | { type: "update_error"; error: string };

export type HostToDevice =
  | { type: "ping" }
  | { type: "get_info" }
  | { type: "update_begin"; size: number; md5: string; fw: string }
  | { type: "update_chunk"; seq: number; data: string }
  | { type: "update_end" }
  | { type: "update_abort" };

export type ActionKind = "vscode" | "shortcut" | "disabled";

export interface KeyAction {
  kind: ActionKind;
  command?: string;
  args?: unknown[];
  keys?: string[];
}

export interface KeyBinding {
  id: number;
  label: string;
  hint: string;
  color: string;
  action: KeyAction;
}

export interface Profile {
  version: number;
  name: string;
  layout: Layout;
  keys: KeyBinding[];
}

export interface ExecuteRequest {
  command: string;
  args?: unknown[];
}

export interface ExecuteResponse {
  ok: boolean;
  command?: string;
  error?: string;
}

export interface FirmwareManifest {
  version: string;
  file: string;
  md5: string;
  size: number;
  board: "esp32s3" | "esp32";
}
