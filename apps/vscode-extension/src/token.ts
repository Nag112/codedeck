import { existsSync, readFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import { TOKEN_RELATIVE_PATH } from "@codedeck/protocol";

export function resolveToken(configured: string | undefined): string {
  if (configured && configured.trim()) {
    return configured.trim();
  }
  const path = join(homedir(), TOKEN_RELATIVE_PATH);
  if (!existsSync(path)) {
    throw new Error(`No token in settings and ${path} is missing. Open the CodeDeck macOS app once to create it.`);
  }
  return readFileSync(path, "utf8").trim();
}

export function authorize(header: string | undefined, expected: string): boolean {
  if (!header) return false;
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return Boolean(match && match[1] === expected);
}
