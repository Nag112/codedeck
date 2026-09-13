import { mkdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import { homedir } from "os";
import { dirname, join } from "path";
import { randomBytes } from "crypto";
import {
  PROFILE_RELATIVE_PATH,
  TOKEN_RELATIVE_PATH,
  createDefaultProfile,
  validateProfile,
  type Profile,
} from "@codedeck/protocol";

export function codedeckHome(): string {
  return join(homedir(), ".codedeck");
}

export function tokenPath(): string {
  return join(homedir(), TOKEN_RELATIVE_PATH);
}

export function profilePath(): string {
  return join(homedir(), PROFILE_RELATIVE_PATH);
}

export function ensureToken(): string {
  const path = tokenPath();
  if (existsSync(path)) {
    return readFileSync(path, "utf8").trim();
  }
  mkdirSync(dirname(path), { recursive: true });
  const token = randomBytes(16).toString("hex");
  writeFileSync(path, `${token}\n`, { encoding: "utf8", mode: 0o600 });
  return token;
}

export function loadProfile(): Profile {
  const path = profilePath();
  if (!existsSync(path)) {
    const profile = createDefaultProfile("3x4");
    saveProfile(profile);
    return profile;
  }
  const parsed = JSON.parse(readFileSync(path, "utf8")) as Profile;
  const errors = validateProfile(parsed);
  if (errors.length) {
    throw new Error(errors.join("; "));
  }
  return parsed;
}

export function saveProfile(profile: Profile): void {
  const errors = validateProfile(profile);
  if (errors.length) {
    throw new Error(errors.join("; "));
  }
  mkdirSync(dirname(profilePath()), { recursive: true });
  writeFileSync(profilePath(), `${JSON.stringify(profile, null, 2)}\n`);
}

export function exportProfileJson(profile: Profile): string {
  return `${JSON.stringify(profile, null, 2)}\n`;
}

export function importProfileJson(raw: string): Profile {
  const parsed = JSON.parse(raw) as Profile;
  const errors = validateProfile(parsed);
  if (errors.length) {
    throw new Error(errors.join("; "));
  }
  return parsed;
}
