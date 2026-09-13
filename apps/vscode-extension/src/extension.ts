import * as vscode from "vscode";
import { DEFAULT_BRIDGE_PORT } from "@codedeck/protocol";
import { createBridgeServer } from "./server";
import { resolveToken } from "./token";
import type http from "http";

let server: http.Server | undefined;

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const config = vscode.workspace.getConfiguration("codedeck");
  const port = config.get<number>("port") ?? DEFAULT_BRIDGE_PORT;
  const token = resolveToken(config.get<string>("token"));
  server = await createBridgeServer(port, token, async (command, args) => {
    await vscode.commands.executeCommand(command, ...args);
  });
  context.subscriptions.push(
    vscode.commands.registerCommand("codedeck.showStatus", () => {
      vscode.window.showInformationMessage(`CodeDeck bridge listening on 127.0.0.1:${port}`);
    }),
    { dispose: () => server?.close() },
  );
}

export function deactivate(): void {
  server?.close();
}
