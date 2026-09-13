# Update firmware from the Mac app

Day-to-day flashing uses the **same USB serial connection** as key events. You do not need esptool, a BOOT button, or a separate UART adapter on ESP32-S3.

## Bundled image

1. Connect the keypad in CodeDeck.app.
2. Confirm the status chip shows the running `fw` version.
3. Click **Update to bundled firmware**.
4. Progress is reported per acknowledged chunk. The device sends `update_ok` and reboots.

`apps/companion/resources/firmware/manifest.json` must point at a real `.bin` with a matching md5. Produce that with `firmware/scripts/package-release.mjs` after a PlatformIO build.

## Any .bin on disk

**Install .bin from disk…** computes md5 locally and runs the same OTA session. Use this for CI artifacts or a locally built `firmware.bin`.

The file must be an Arduino-ESP32 app image that fits the default OTA partition (not a combined bootloader+partition+app flash dump). PlatformIO’s `.pio/build/<env>/firmware.bin` is the correct artifact.

## Protocol (summary)

1. Host `update_begin` `{ size, md5, fw }`
2. Device `Update.begin(size)`, `Update.setMD5(md5)`, `update_ready`
3. Host `update_chunk` `{ seq, data }` (base64, 256-byte payload)
4. Device `update_ack` `{ seq, written }`
5. Host `update_end`
6. Device `Update.end(true)`, `update_ok`, `ESP.restart()`

If md5, sequence, or size fail, the device aborts the update and stays on the current slot.

## First-time factory flash

An empty module still needs a **one-time** USB flash of this firmware (PlatformIO `upload` or Espressif’s flash tool) so the OTA protocol exists. After that, the Mac app owns updates.
