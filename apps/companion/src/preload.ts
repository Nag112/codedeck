import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("codedeck", {
  listPorts: () => ipcRenderer.invoke("list-ports"),
  connect: (path: string) => ipcRenderer.invoke("connect", path),
  disconnect: () => ipcRenderer.invoke("disconnect"),
  getProfile: () => ipcRenderer.invoke("get-profile"),
  saveProfile: (profile: unknown) => ipcRenderer.invoke("save-profile", profile),
  exportProfile: () => ipcRenderer.invoke("export-profile"),
  importProfile: (raw: string) => ipcRenderer.invoke("import-profile", raw),
  catalog: () => ipcRenderer.invoke("catalog"),
  token: () => ipcRenderer.invoke("token"),
  deviceState: () => ipcRenderer.invoke("device-state"),
  bundledFirmware: () => ipcRenderer.invoke("bundled-firmware"),
  updateBundled: () => ipcRenderer.invoke("update-firmware-bundled"),
  updateFromFile: () => ipcRenderer.invoke("update-firmware-file"),
  onState: (cb: (state: unknown) => void) => ipcRenderer.on("device-state", (_e, state) => cb(state)),
  onPress: (cb: (key: number) => void) => ipcRenderer.on("device-press", (_e, key) => cb(key)),
  onProgress: (cb: (progress: unknown) => void) => ipcRenderer.on("update-progress", (_e, progress) => cb(progress)),
  onError: (cb: (message: string) => void) => ipcRenderer.on("device-error", (_e, message) => cb(message)),
});
