import { app, BrowserWindow, dialog, ipcMain } from "electron";
import { createHash } from "crypto";
import { readFile } from "fs/promises";
import { join } from "path";
import type { FirmwareManifest, Profile } from "@codedeck/protocol";
import { vscodeCatalog } from "@codedeck/protocol";
import { CodeDeckDevice } from "./device";
import { defaultBridge } from "./executor";
import { ensureToken, exportProfileJson, importProfileJson, loadProfile, saveProfile } from "./store";

let profile = loadProfile();
const token = ensureToken();
const device = new CodeDeckDevice(
  () => profile,
  () => defaultBridge(token),
);

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 980,
    height: 780,
    title: "CodeDeck",
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win.loadFile(join(__dirname, "..", "renderer", "index.html"));
  return win;
}

app.whenReady().then(() => {
  const win = createWindow();

  device.on("state", (state) => win.webContents.send("device-state", state));
  device.on("press", (key: number) => win.webContents.send("device-press", key));
  device.on("update-progress", (progress) => win.webContents.send("update-progress", progress));
  device.on("error", (error: Error) => win.webContents.send("device-error", error.message));

  ipcMain.handle("list-ports", () => device.listPorts());
  ipcMain.handle("connect", (_event, path: string) => device.connect(path));
  ipcMain.handle("disconnect", () => device.disconnect());
  ipcMain.handle("get-profile", () => profile);
  ipcMain.handle("save-profile", (_event, next: Profile) => {
    saveProfile(next);
    profile = next;
    return profile;
  });
  ipcMain.handle("export-profile", () => exportProfileJson(profile));
  ipcMain.handle("import-profile", (_event, raw: string) => {
    profile = importProfileJson(raw);
    saveProfile(profile);
    return profile;
  });
  ipcMain.handle("catalog", () => vscodeCatalog);
  ipcMain.handle("token", () => token);
  ipcMain.handle("device-state", () => device.state);
  ipcMain.handle("bundled-firmware", () => device.loadBundledFirmware());
  ipcMain.handle("update-firmware-bundled", async () => {
    const bundled = await device.loadBundledFirmware();
    if (!bundled) {
      throw new Error("No bundled firmware image. Build firmware and run package-release.mjs, or choose a .bin file.");
    }
    await device.updateFirmware(bundled.binary, bundled.manifest);
    return bundled.manifest.version;
  });
  ipcMain.handle("update-firmware-file", async () => {
    const picked = await dialog.showOpenDialog(win, {
      title: "Select CodeDeck firmware image",
      filters: [{ name: "Firmware", extensions: ["bin"] }],
      properties: ["openFile"],
    });
    if (picked.canceled || !picked.filePaths[0]) {
      return null;
    }
    const binary = await readFile(picked.filePaths[0]);
    const manifest: FirmwareManifest = {
      version: "custom",
      file: picked.filePaths[0],
      md5: createHash("md5").update(binary).digest("hex"),
      size: binary.length,
      board: "esp32s3",
    };
    await device.updateFirmware(binary, manifest);
    return manifest.version;
  });
});

app.on("window-all-closed", () => {
  void device.disconnect();
  app.quit();
});
