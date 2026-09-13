# Firmware

PlatformIO project in `firmware/`.

```bash
cd firmware
pio run -e esp32s3
pio run -e esp32s3 -t upload
pio device monitor
```

## Key scan

`codedeck_pins.h` maps keys 0–11 to GPIO 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 21. Debounce is 20 ms (`codedeck_debounce.h`). During an in-progress OTA, scanning is paused so serial bandwidth stays with the image.

## Serial

115200 8N1 NDJSON (USB CDC ignores baud). On boot the device sends `hello` with `fw`, `keys`, and `layout`.

Host can send `ping` / `get_info` at any time.

## Packaging an image for the Mac app

```bash
pio run -e esp32s3
node firmware/scripts/package-release.mjs esp32s3 firmware/.pio/build/esp32s3/firmware.bin
```

That copies the binary into `apps/companion/resources/firmware/` and writes `manifest.json` with md5 and size. Without this step the Mac app still offers **Install .bin from disk**.

## Tests

`firmware/test/run.sh` compiles the debounce header with the host C compiler (no ESP toolchain required).
