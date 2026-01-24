const { app, BrowserWindow, ipcMain, dialog, shell } = require("electron");
const path = require("path");

let openUserCardWindow;
let openSettingsWindow;

// 613 646
function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    frame: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  ipcMain.handle("open-user-card", (event, data) => {
    openUserCardWindow = new BrowserWindow({
      width: 500,
      height: 400,
      parent: win,
      modal: true,
      webPreferences: {
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, "preload.js"),
      },
    });

    openUserCardWindow.loadURL("http://localhost:4200/user");

    openUserCardWindow.webContents.on("did-finish-load", () => {
      openUserCardWindow.webContents.send("data", data);
    });

  });

  ipcMain.handle("open-settings", (event, data) => {
    openSettingsWindow = new BrowserWindow({
      width: 510,
      height: 450,
      parent: win,
      modal: true,
      webPreferences: {
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, "preload.js"),
      },
    });

    openSettingsWindow.loadURL("http://localhost:4200/settings");

    openSettingsWindow.webContents.on("did-finish-load", () => {
      openSettingsWindow.webContents.send("data", data);
    });
  });
  ipcMain.handle("open-emoji-picker", (event, data) => {
    openEmojiPicker = new BrowserWindow({
      width: 510,
      height: 450,
      parent: win,
      modal: true,
      webPreferences: {
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, "preload.js"),
      },
    });

    openEmojiPicker.loadURL("http://localhost:4200/emoji");

  });

  ipcMain.handle("open-chatter-list", (event, data) => {
    openChatterList = new BrowserWindow({
      width: 510,
      height: 450,
      parent: win,
      modal: true,
      webPreferences: {
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, "preload.js"),
      },
    });

    openChatterList.loadURL("http://localhost:4200/chatter");

  });

  ipcMain.handle("close-window", (event, window_name) => {

    if (window_name == "settings") {
      if (openSettingsWindow) {
        openSettingsWindow.close();
        openSettingsWindow = null;

      }
    } else {
      if (openUserCardWindow) {
        openUserCardWindow.close();
        openUserCardWindow = null;

      }
    }

  });

  // Custom zoom keybindings
  win.webContents.on('before-input-event', (event, input) => {
    // Zoom in: Ctrl/Cmd + +
    if ((input.control || input.meta) && input.key === '+' ||
      (input.control || input.meta) && input.key === '=') {
      event.preventDefault();
      win.webContents.setZoomLevel(win.webContents.getZoomLevel() + 1);
    }
    // Zoom out: Ctrl/Cmd + -
    if ((input.control || input.meta) && input.key === '-') {
      event.preventDefault();
      win.webContents.setZoomLevel(win.webContents.getZoomLevel() - 1);
    }
    // Reset zoom: Ctrl/Cmd + 0
    if ((input.control || input.meta) && input.key === '0') {
      event.preventDefault();
      win.webContents.setZoomLevel(0);
    }
    // Custom keybinding: Ctrl/Cmd + Shift + Z for zoom in
    if ((input.control || input.meta) && input.shift && input.key === 'Z') {
      event.preventDefault();
      win.webContents.setZoomLevel(win.webContents.getZoomLevel() + 1);
    }
    // Custom keybinding: Ctrl/Cmd + Shift + X for zoom out
    if ((input.control || input.meta) && input.shift && input.key === 'X') {
      event.preventDefault();
      win.webContents.setZoomLevel(win.webContents.getZoomLevel() - 1);
    }
  });

  if (process.env.ELECTRON_DEV) {
    win.loadURL("http://localhost:4200");
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, "dist/launcher/browser/index.html"));
  }
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("open-external-link", (event, url) => {
  shell.openExternal(url);
});
