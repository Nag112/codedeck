const api = window.codedeck;
let profile;
let selected = 0;
let catalog = [];

const grid = document.getElementById("grid");
const ports = document.getElementById("ports");
const status = document.getElementById("status");
const tokenEl = document.getElementById("token");
const fwInfo = document.getElementById("fw-info");
const fwMsg = document.getElementById("fw-msg");
const progress = document.getElementById("progress");
const editor = document.getElementById("editor");

function renderGrid() {
  const cols = profile.layout === "3x3" ? 3 : 4;
  grid.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
  grid.innerHTML = "";
  for (const key of profile.keys) {
    const btn = document.createElement("button");
    btn.className = "key" + (key.id === selected ? " active" : "");
    btn.style.background = key.color;
    btn.innerHTML = `<strong>${escapeHtml(key.label)}</strong><small>${escapeHtml(key.hint || key.action.command || "")}</small>`;
    btn.onclick = () => {
      selected = key.id;
      fillEditor();
      renderGrid();
    };
    grid.appendChild(btn);
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}

function fillEditor() {
  editor.hidden = false;
  const key = profile.keys.find((item) => item.id === selected);
  document.getElementById("label").value = key.label;
  document.getElementById("color").value = key.color;
  document.getElementById("kind").value = key.action.kind;
  document.getElementById("shortcut").value = (key.action.keys || []).join(",");
  const select = document.getElementById("command");
  select.innerHTML = catalog
    .map((item) => `<option value="${item.command}">${item.group} — ${item.label}</option>`)
    .join("");
  if (key.action.command) select.value = key.action.command;
}

async function refreshPorts() {
  const list = await api.listPorts();
  ports.innerHTML = list.map((port) => `<option value="${port.path}">${port.path} ${port.manufacturer || ""}</option>`).join("");
}

async function boot() {
  profile = await api.getProfile();
  catalog = await api.catalog();
  tokenEl.textContent = await api.token();
  renderGrid();
  fillEditor();
  await refreshPorts();
  const bundled = await api.bundledFirmware();
  if (bundled) {
    fwInfo.textContent = `Bundled firmware ${bundled.manifest.version} (${bundled.manifest.size} bytes). Connect the keypad, then update over USB.`;
  }
}

document.getElementById("refresh").onclick = refreshPorts;
document.getElementById("connect").onclick = () => api.connect(ports.value);
document.getElementById("disconnect").onclick = () => api.disconnect();
document.getElementById("apply").onclick = async () => {
  const key = profile.keys.find((item) => item.id === selected);
  key.label = document.getElementById("label").value;
  key.color = document.getElementById("color").value;
  key.action.kind = document.getElementById("kind").value;
  key.action.command = document.getElementById("command").value;
  key.action.keys = document
    .getElementById("shortcut")
    .value.split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const item = catalog.find((entry) => entry.command === key.action.command);
  if (item) key.hint = item.mac;
  profile = await api.saveProfile(profile);
  renderGrid();
};
document.getElementById("export").onclick = async () => {
  const json = await api.exportProfile();
  await navigator.clipboard.writeText(json);
  fwMsg.textContent = "Profile copied to clipboard.";
};
document.getElementById("import").onclick = async () => {
  const raw = prompt("Paste profile JSON");
  if (!raw) return;
  profile = await api.importProfile(raw);
  renderGrid();
  fillEditor();
};
document.getElementById("update-bundled").onclick = async () => {
  fwMsg.textContent = "Sending firmware over USB…";
  progress.hidden = false;
  try {
    const version = await api.updateBundled();
    fwMsg.textContent = `Device rebooting into ${version}. Reconnect if the port changes.`;
  } catch (error) {
    fwMsg.textContent = error.message;
  }
};
document.getElementById("update-file").onclick = async () => {
  fwMsg.textContent = "Installing selected image…";
  progress.hidden = false;
  try {
    const version = await api.updateFromFile();
    fwMsg.textContent = version ? `Installed ${version}.` : "Canceled.";
  } catch (error) {
    fwMsg.textContent = error.message;
  }
};

api.onState((state) => {
  status.textContent = state.connected
    ? `Connected · fw ${state.fw || "?"} · ${state.keys || "?"} keys`
    : "Disconnected";
});
api.onProgress((progressInfo) => {
  progress.hidden = false;
  progress.value = progressInfo.size ? Math.round((100 * progressInfo.written) / progressInfo.size) : 0;
});
api.onError((message) => {
  fwMsg.textContent = message;
});

boot();
