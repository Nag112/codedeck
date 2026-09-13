# VS Code extension

Package: `apps/vscode-extension` (`codedeck`).

It starts a loopback HTTP server (`127.0.0.1`, default port **17322**) after activation and executes `vscode.commands.executeCommand` for authorized POSTs.

## Settings

- `codedeck.port` — bridge port
- `codedeck.token` — optional override; otherwise `~/.codedeck/token`

## Install from this repo

```bash
npm install
npm run build --workspace codedeck
cd apps/vscode-extension
npx @vscode/vsce package
```

Then Install from VSIX in VS Code / Cursor.

## Security

The server binds localhost only and requires `Authorization: Bearer <token>`. It is meant for a companion on the same machine, not a LAN service.
