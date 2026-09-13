import { execFile } from "child_process";
import { promisify } from "util";
import { DEFAULT_BRIDGE_PORT, type KeyAction } from "@codedeck/protocol";

const execFileAsync = promisify(execFile);

export interface BridgeConfig {
  port: number;
  token: string;
}

export async function executeAction(action: KeyAction, bridge: BridgeConfig): Promise<void> {
  if (action.kind === "disabled") {
    return;
  }
  if (action.kind === "vscode") {
    if (!action.command) {
      throw new Error("missing VS Code command");
    }
    await executeVscode(action.command, action.args ?? [], bridge);
    return;
  }
  if (!action.keys?.length) {
    throw new Error("missing shortcut keys");
  }
  await executeMacShortcut(action.keys);
}

async function executeVscode(command: string, args: unknown[], bridge: BridgeConfig): Promise<void> {
  const response = await fetch(`http://127.0.0.1:${bridge.port}/v1/execute`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${bridge.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ command, args }),
  });
  const body = (await response.json()) as { ok?: boolean; error?: string };
  if (!response.ok || !body.ok) {
    throw new Error(body.error ?? `VS Code bridge HTTP ${response.status}`);
  }
}

function appleScriptForKeys(keys: string[]): string {
  const mods: string[] = [];
  const keyChars: string[] = [];
  for (const raw of keys) {
    const key = raw.toLowerCase();
    if (key === "cmd" || key === "command" || key === "meta") mods.push("command down");
    else if (key === "shift") mods.push("shift down");
    else if (key === "alt" || key === "option") mods.push("option down");
    else if (key === "ctrl" || key === "control") mods.push("control down");
    else keyChars.push(raw);
  }
  if (keyChars.length !== 1) {
    throw new Error("shortcut must include exactly one key plus modifiers");
  }
  const key = keyChars[0].replace(/"/g, '\\"');
  const using = mods.length ? ` using {${mods.join(", ")}}` : "";
  return `tell application "System Events" to keystroke "${key}"${using}`;
}

export async function executeMacShortcut(keys: string[]): Promise<void> {
  const script = appleScriptForKeys(keys);
  await execFileAsync("osascript", ["-e", script]);
}

export function defaultBridge(token: string): BridgeConfig {
  return { port: DEFAULT_BRIDGE_PORT, token };
}

export { appleScriptForKeys };
