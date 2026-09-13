import type { KeyBinding, Layout, Profile } from "./types";
import { vscodeCatalog } from "./catalog";

const COLORS = [
  "#3B82F6",
  "#8B5CF6",
  "#06B6D4",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#EC4899",
  "#6366F1",
  "#14B8A6",
  "#A855F7",
  "#F97316",
  "#22C55E",
];

const DEFAULT_COMMANDS = [
  "workbench.action.showCommands",
  "workbench.action.quickOpen",
  "workbench.action.terminal.toggleTerminal",
  "workbench.action.toggleSidebarVisibility",
  "editor.action.formatDocument",
  "editor.action.revealDefinition",
  "workbench.action.findInFiles",
  "workbench.view.scm",
  "editor.action.commentLine",
  "workbench.action.splitEditor",
  "editor.action.quickFix",
  "workbench.action.debug.start",
] as const;

export function expectedKeyCount(layout: Layout): 9 | 12 {
  return layout === "3x3" ? 9 : 12;
}

export function createDefaultProfile(layout: Layout = "3x4"): Profile {
  const count = expectedKeyCount(layout);
  const keys: KeyBinding[] = DEFAULT_COMMANDS.slice(0, count).map((command, id) => {
    const item = vscodeCatalog.find((entry) => entry.command === command);
    return {
      id,
      label: item?.label ?? command,
      hint: item?.mac ?? "",
      color: COLORS[id],
      action: { kind: "vscode", command },
    };
  });
  return {
    version: 1,
    name: layout === "3x3" ? "VS Code Essentials (9)" : "VS Code Essentials",
    layout,
    keys,
  };
}

export function validateProfile(profile: Profile): string[] {
  const errors: string[] = [];
  if (profile.version !== 1) {
    errors.push("unsupported profile version");
  }
  const count = expectedKeyCount(profile.layout);
  if (profile.keys.length !== count) {
    errors.push(`layout ${profile.layout} requires ${count} keys, got ${profile.keys.length}`);
  }
  const seen = new Set<number>();
  for (const key of profile.keys) {
    if (!Number.isInteger(key.id) || key.id < 0 || key.id >= count) {
      errors.push(`key id ${key.id} is out of range`);
    }
    if (seen.has(key.id)) {
      errors.push(`duplicate key id ${key.id}`);
    }
    seen.add(key.id);
    if (!key.label.trim()) {
      errors.push(`key ${key.id} is missing a label`);
    }
    if (key.action.kind === "vscode" && !key.action.command) {
      errors.push(`key ${key.id} vscode action needs a command`);
    }
    if (key.action.kind === "shortcut" && (!key.action.keys || key.action.keys.length === 0)) {
      errors.push(`key ${key.id} shortcut action needs keys`);
    }
  }
  return errors;
}

export function bindingForKey(profile: Profile, keyId: number): KeyBinding | undefined {
  return profile.keys.find((key) => key.id === keyId);
}
