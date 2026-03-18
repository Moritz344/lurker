const { app, BrowserWindow, ipcMain, dialog, shell } = require("electron");
const path = require("path");

let openUserCardWindow;
let openSettingsWindow;

function loadAngularRoute(window, route = "") {
  if (process.env.ELECTRON_DEV) {
    window.loadURL(`http://localhost:4200/#/${route}`);
  } else {
    window.loadFile(
      path.join(__dirname, "dist/launcher/browser/index.html"),
      { hash: route }
    );
  }
}

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

    loadAngularRoute(openUserCardWindow, "user");

    openUserCardWindow.webContents.on("did-finish-load", () => {
      openUserCardWindow.webContents.send("data", data);
    });

  });

  ipcMain.handle("start-auth", async () => {
    const authWindow = new BrowserWindow({
      width: 600,
      height: 800,
      webPreferences: { nodeIntegration: false, contextIsolation: true, preload: path.join(__dirname, "preload.js") }
    });

    const scopes = "chat:edit moderator:manage:announcements moderation:read moderator:read:chatters channel:manage:moderators channel:manage:polls user:write:chat chat:read user:read:follows";
    const authUrl = `https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=ds3ban6ylu8w882wox7f1xyr9s7v56&redirect_uri=http://localhost&scope=${scopes}`;

    authWindow.loadURL(authUrl);

    authWindow.webContents.on("will-navigate", (event, url) => {
      if (url.startsWith("http://localhost")) {
        event.preventDefault();
        const hash = new URL(url).hash;

        const params = new URLSearchParams(hash.substring(1));

        const token = params.get("access_token");
        win.webContents.send("twitch-token", token);
        authWindow.close();
      }
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

    loadAngularRoute(openSettingsWindow, "settings");

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

    loadAngularRoute(openEmojiPicker, "emoji");

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

    loadAngularRoute(openChatterList, "chatter");

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

  win.webContents.on('before-input-event', (event, input) => {
    if ((input.control || input.meta) && input.key === '+' ||
      (input.control || input.meta) && input.key === '=') {
      event.preventDefault();
      win.webContents.setZoomLevel(win.webContents.getZoomLevel() + 1);
    }
    if ((input.control || input.meta) && input.key === '-') {
      event.preventDefault();
      win.webContents.setZoomLevel(win.webContents.getZoomLevel() - 1);
    }
    if ((input.control || input.meta) && input.key === '0') {
      event.preventDefault();
      win.webContents.setZoomLevel(0);
    }
    if ((input.control || input.meta) && input.shift && input.key === 'Z') {
      event.preventDefault();
      win.webContents.setZoomLevel(win.webContents.getZoomLevel() + 1);
    }
    if ((input.control || input.meta) && input.shift && input.key === 'X') {
      event.preventDefault();
      win.webContents.setZoomLevel(win.webContents.getZoomLevel() - 1);
    }
  });

  if (process.env.ELECTRON_DEV) {
    win.loadURL("http://localhost:4200/");
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
