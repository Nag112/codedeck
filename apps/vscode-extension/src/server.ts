import http from "http";
import { authorize } from "./token";
import type { ExecuteRequest } from "@codedeck/protocol";

export interface CommandRunner {
  (command: string, args: unknown[]): Promise<unknown>;
}

export function createBridgeServer(port: number, token: string, run: CommandRunner): Promise<http.Server> {
  const server = http.createServer((req, res) => {
    void handle(req, res, token, run);
  });
  return new Promise((resolve, reject) => {
    server.listen(port, "127.0.0.1", () => resolve(server));
    server.on("error", reject);
  });
}

async function handle(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  token: string,
  run: CommandRunner,
): Promise<void> {
  const send = (status: number, body: unknown) => {
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(body));
  };

  if (!authorize(req.headers.authorization, token)) {
    send(401, { ok: false, error: "unauthorized" });
    return;
  }

  if (req.method === "GET" && req.url === "/v1/health") {
    send(200, { ok: true });
    return;
  }

  if (req.method !== "POST" || req.url !== "/v1/execute") {
    send(404, { ok: false, error: "not found" });
    return;
  }

  try {
    const raw = await readBody(req);
    const payload = JSON.parse(raw) as ExecuteRequest;
    if (!payload.command) {
      send(400, { ok: false, error: "command required" });
      return;
    }
    await run(payload.command, payload.args ?? []);
    send(200, { ok: true, command: payload.command });
  } catch (error) {
    send(500, { ok: false, error: error instanceof Error ? error.message : "execute failed" });
  }
}

function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}
