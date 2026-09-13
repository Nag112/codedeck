import { EventEmitter } from "events";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { dirname, join } from "path";
import {
  LineBuffer,
  bindingForKey,
  encodeHostMessage,
  parseDeviceLine,
  runSerialUpdate,
  needsFirmwareUpdate,
  verifyFirmware,
  type FirmwareManifest,
  type Profile,
} from "@codedeck/protocol";
import { SerialPort } from "serialport";
import { executeAction, type BridgeConfig } from "./executor";

export interface DeviceState {
  path: string | null;
  connected: boolean;
  fw: string | null;
  keys: number | null;
  layout: string | null;
}

export class CodeDeckDevice extends EventEmitter {
  private port: SerialPort | null = null;
  private lines = new LineBuffer();
  private pending: Array<{ resolve: (line: string) => void; reject: (err: Error) => void; timer: NodeJS.Timeout }> =
    [];
  private inbound: string[] = [];
  public state: DeviceState = { path: null, connected: false, fw: null, keys: null, layout: null };

  constructor(
    private readonly profileProvider: () => Profile,
    private readonly bridgeProvider: () => BridgeConfig,
  ) {
    super();
  }

  async listPorts(): Promise<Array<{ path: string; manufacturer?: string }>> {
    const ports = await SerialPort.list();
    return ports.map((port) => ({ path: port.path, manufacturer: port.manufacturer }));
  }

  async connect(path: string): Promise<void> {
    await this.disconnect();
    this.port = new SerialPort({ path, baudRate: 115200 });
    this.state = { ...this.state, path, connected: true };
    this.port.on("data", (buf: Buffer) => {
      for (const line of this.lines.push(buf.toString("utf8"))) {
        this.onLine(line);
      }
    });
    this.port.on("close", () => {
      this.state.connected = false;
      this.emit("state", this.state);
    });
    this.port.on("error", (error: Error) => this.emit("error", error));
    this.emit("state", this.state);
    await this.write(encodeHostMessage({ type: "get_info" }));
  }

  async disconnect(): Promise<void> {
    for (const waiter of this.pending) {
      clearTimeout(waiter.timer);
      waiter.reject(new Error("disconnected"));
    }
    this.pending = [];
    this.inbound = [];
    if (this.port?.isOpen) {
      await new Promise<void>((resolve) => this.port?.close(() => resolve()));
    }
    this.port = null;
    this.state.connected = false;
    this.emit("state", this.state);
  }

  async updateFirmware(binary: Buffer, manifest: Pick<FirmwareManifest, "md5" | "size" | "version">): Promise<void> {
    verifyFirmware(binary, manifest);
    if (!this.port) {
      throw new Error("device not connected");
    }
    const io = {
      write: (text: string) => this.write(text),
      readLine: (timeoutMs: number) => this.readLine(timeoutMs),
    };
    await runSerialUpdate(io, binary, manifest.version, (progress) => this.emit("update-progress", progress));
  }

  bundledManifestPath(): string {
    return join(__dirname, "..", "resources", "firmware", "manifest.json");
  }

  async loadBundledFirmware(): Promise<{ manifest: FirmwareManifest; binary: Buffer } | null> {
    const manifestPath = this.bundledManifestPath();
    if (!existsSync(manifestPath)) {
      return null;
    }
    const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as FirmwareManifest;
    const binPath = join(dirname(manifestPath), manifest.file);
    if (!existsSync(binPath) || manifest.size < 1 || manifest.md5 === "pending-build") {
      return null;
    }
    const binary = await readFile(binPath);
    verifyFirmware(binary, manifest);
    return { manifest, binary };
  }

  updateAvailable(bundledVersion: string): boolean {
    if (!this.state.fw) return false;
    return needsFirmwareUpdate(this.state.fw, bundledVersion);
  }

  private async write(text: string): Promise<void> {
    const port = this.port;
    if (!port) {
      throw new Error("device not connected");
    }
    await new Promise<void>((resolve, reject) => {
      port.write(text, (error) => (error ? reject(error) : resolve()));
    });
  }

  private readLine(timeoutMs: number): Promise<string> {
    const queued = this.inbound.shift();
    if (queued !== undefined) {
      return Promise.resolve(queued);
    }
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending = this.pending.filter((item) => item.resolve !== resolve);
        reject(new Error("timeout waiting for device"));
      }, timeoutMs);
      this.pending.push({ resolve, reject, timer });
    });
  }

  private onLine(line: string): void {
    if (this.pending.length) {
      const waiter = this.pending.shift();
      if (waiter) {
        clearTimeout(waiter.timer);
        waiter.resolve(line);
      }
      return;
    }
    try {
      const message = parseDeviceLine(line);
      if (message.type.startsWith("update_")) {
        this.inbound.push(line);
        return;
      }
      if (message.type === "hello") {
        this.state = {
          ...this.state,
          fw: message.fw,
          keys: message.keys,
          layout: message.layout,
        };
        this.emit("state", this.state);
        return;
      }
      if (message.type === "press") {
        const binding = bindingForKey(this.profileProvider(), message.key);
        if (!binding) return;
        void executeAction(binding.action, this.bridgeProvider()).catch((error: Error) => this.emit("error", error));
        this.emit("press", message.key);
      }
    } catch (error) {
      this.emit("error", error);
    }
  }
}
