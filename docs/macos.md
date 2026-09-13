# macOS companion

Electron app in `apps/companion`.

```bash
npm install
npm start --workspace @codedeck/companion
```

## What it does

- Lists serial ports and opens the keypad at 115200
- Renders a 3×4 (or 3×3) Stream Deck–style grid
- Lets you assign any catalogued VS Code command, a macOS chord, or disable a key
- Saves `~/.codedeck/profile.json` and creates `~/.codedeck/token`
- **Updates ESP32 firmware over USB** (bundled image or a `.bin` you choose)

On key press it POSTs to the VS Code extension. If the action kind is `shortcut`, it runs `osascript` via System Events (Accessibility permission required).

## Tests

`npm test --workspace @codedeck/companion` covers profile import/export and shortcut translation. OTA framing is tested in `@codedeck/protocol`.
