# Architecture

CodeDeck is three cooperating programs plus a small keypad.

1. **Firmware** scans up to 12 GPIOs, debounces 2-pin switches to GND, and speaks NDJSON on USB serial. It also accepts a firmware image over that same serial port and writes it into the next OTA partition.
2. **macOS companion** owns the human mapping: labels, colors, VS Code commands, or system keystrokes. It is also the firmware installer.
3. **VS Code extension** listens on `127.0.0.1:17322` and runs `vscode.commands.executeCommand`.

HID keyboard emulation is intentionally not required. VS Code has hundreds of commands that are not single chords; executing command IDs is more reliable than synthesizing ⌘⇧P and hoping focus is correct.

## Data on disk

| File | Purpose |
| --- | --- |
| `~/.codedeck/token` | Shared bearer token, created by the Mac app |
| `~/.codedeck/profile.json` | Editable 9- or 12-key layout |

## Firmware update path

See [firmware-update.md](firmware-update.md). The Mac app keeps a `resources/firmware/manifest.json` (version, md5, size) next to `codedeck-esp32s3.bin`. Pressing **Update** runs `runSerialUpdate()` from `@codedeck/protocol`: `update_begin` → base64 chunks → `update_end` → device `Update.end()` → reboot.
