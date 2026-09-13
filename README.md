# CodeDeck

Open-source **12-key (or 9-key) Stream Deck–style keypad** for Visual Studio Code. ESP32 firmware reads 2-pin keyboard switches, a **macOS companion** maps those keys and **updates firmware over USB**, and a **VS Code extension** runs the real editor commands.

## Why this layout

The default 3×4 map is the VS Code actions people hit all day on macOS: Command Palette, Quick Open, terminal, sidebar, format, go to definition, find in files, source control, toggle comment, split editor, quick fix, and start debug. Every key is editable in the Mac app.

## Architecture

```
[ 2-pin switches ] → [ ESP32-S3 USB CDC ]
                           │  NDJSON (press / hello / OTA)
                           ▼
                  [ CodeDeck.app ]
                     │            │
                     │ HTTP       │ USB serial OTA
                     ▼            ▼
              [ VS Code ext ]   [ flash next OTA slot, reboot ]
```

Firmware updates are **not** a separate esptool workflow for day-to-day use. The companion sends the `.bin` on the same serial protocol the keypad already uses. Pick **Update to bundled firmware** or **Install .bin from disk**.

## Repo layout

| Path | Role |
| --- | --- |
| `firmware/` | PlatformIO firmware, debounce, serial OTA |
| `hardware/` | BOM, netlist, PCB top view, KiCad schematic stub |
| `packages/protocol/` | Shared NDJSON protocol, profiles, OTA client |
| `apps/companion/` | macOS Electron app |
| `apps/vscode-extension/` | Local command bridge |

## Quick start

1. Wire twelve 2-pin switches to the GPIOs in `hardware/netlist.csv` (other pin of each switch to GND).
2. `cd firmware && pio run -e esp32s3 -t upload`
3. `node firmware/scripts/package-release.mjs esp32s3 .pio/build/esp32s3/firmware.bin` (from `firmware/` the path is `.pio/build/...`)
4. `npm install && npm test`
5. `npm start --workspace @codedeck/companion`
6. In VS Code, install the extension from `apps/vscode-extension` (`vsce package` or "Install from VSIX" after `npm run build --workspace codedeck`).

The companion and the extension share `~/.codedeck/token`. Profiles live at `~/.codedeck/profile.json`.

## Documentation

- [Architecture](docs/architecture.md)
- [Hardware & PCB](docs/hardware.md)
- [Firmware](docs/firmware.md)
- [Firmware update from the Mac app](docs/firmware-update.md)
- [macOS companion](docs/macos.md)
- [VS Code extension](docs/vscode.md)
- [Default shortcuts](docs/shortcuts.md)
- [Serial protocol](docs/protocol.md)

## Tests

```bash
npm test
```

Runs protocol unit tests, companion profile/shortcut tests, the VS Code bridge HTTP tests, and a host-compiled C debounce test.

## License

MIT
