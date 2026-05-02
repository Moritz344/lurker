const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  shell,
  clipboard,
} = require("electron");
const path = require("path");
const fs = require("fs");
const rpc = require("discord-rpc");
const { exec } = require("child_process");

let openUserCardWindow;
let openSettingsWindow;
let openChatterList;

let store;

// https://stackoverflow.com/questions/35876939/frameless-window-with-controls-in-electron-windows

async function initStore() {
  const StoreModule = await import("electron-store");
  store = new StoreModule.default();
}

function loadAngularRoute(window, route = "") {
  if (process.env.ELECTRON_DEV) {
    window.loadURL(`http://localhost:4200/#/${route}`);
  } else {
    window.loadFile(path.join(__dirname, "dist/launcher/browser/index.html"), {
      hash: route,
    });
  }
}

function isDiscordRunning() {
  return new Promise((resolve) => {
    commandDiscordCheck = 'pgrep -i "discord"';
    commandVesktopCheck = 'pgrep -i "vesktop"';

    exec(commandDiscordCheck, (err, stdout) => {
      if (stdout.length > 0) {
        return resolve(true);
      } else {
        exec(commandVesktopCheck, (err, stdout) => {
          if (stdout.length > 0) {
            return resolve(true);
          } else {
            return resolve(false);
          }
        });
      }
    });
  });
}


async function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    titleBarStyle: "hidden",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  ipcMain.handle("open-user-card", (_, data) => {
    openUserCardWindow = new BrowserWindow({
      width: 700,
      height: 650,
      parent: win,
      modal: true,
      frame: false,
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

  ipcMain.handle("get-version", () => {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(__dirname, "package.json"), "utf-8"),
    );
    return pkg.version;
  });

  ipcMain.handle("logout", () => {
    store.delete("userData");
  });

  ipcMain.handle("save-user-data", (_, data) => {
    store.set("userData", data);
  });

  ipcMain.handle("get-token", () => {
    let userData = store.get("userData");
    return userData ? userData.token : null;
  });

  ipcMain.handle("copy-to-clipboard", (_, text) => {
    clipboard.writeText(text);
  });

  ipcMain.handle("show-warning-box",(_,msg,title) => {
    dialog.showMessageBox({
        type: "warning",
        title: title,
        message: msg,
        buttons: ["Close"],
      });
  })

  ipcMain.handle("discord-rpc", async () => {
    const client = new rpc.Client({ transport: "websocket" });
    const running = await isDiscordRunning();
    if (!running) {
      console.log("Discord is not running. Not connecting to RPC.");
      return;
    }
    client.on("ready", () => {
      client.setActivity({
        state: "",
        details: "lurking in twitch chat",
        startTimestamp: Date.now(),
        largeImageKey: "app_icon",
      });
      console.log("Discord RPC connected!");
    });
    client.login({ clientId: "1497569565977214986" });
  });

  ipcMain.handle("get-username", () => {
    let userData = store.get("userData");
    return userData ? userData.username : null;
  });

  ipcMain.handle("get-created-at", () => {
    let userData = store.get("userData");
    return userData ? userData.created_at : null;
  });

  ipcMain.handle("get-user-id", () => {
    let userData = store.get("userData");
    return userData ? userData.id : null;
  });

  ipcMain.handle("get-desc", () => {
    let userData = store.get("userData");
    return userData ? userData.desc : null;
  });

  ipcMain.handle("get-profile-image-url", () => {
    let userData = store.get("userData");
    return userData ? userData.profile_image_url : null;
  });

  ipcMain.handle("exit", () => {
    app.exit();
  });

  ipcMain.handle("start-auth", async () => {
    const authWindow = new BrowserWindow({
      width: 600,
      frame: false,
      height: 800,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, "preload.js"),
      },
    });

    const scopes =
      "chat:edit moderator:manage:announcements moderation:read moderator:read:chatters channel:manage:moderators channel:manage:polls user:write:chat chat:read user:read:follows user:manage:chat_color user:manage:blocked_users";
    const authUrl = `https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=ds3ban6ylu8w882wox7f1xyr9s7v56&redirect_uri=https://localhost&scope=${scopes}`;

    authWindow.loadURL(authUrl);

    const extractToken = (url) => {
      try {
        const urlObj = new URL(url);
        const hash = urlObj.hash;
        if (hash) {
          const params = new URLSearchParams(hash.substring(1));
          return params.get("access_token");
        }
      } catch (e) {
        console.error("Error parsing URL:", e);
      }
      return null;
    };

    const handleAuth = (event, url) => {
      console.log("Auth URL intercepted:", url);
      if (url.includes("access_token=")) {
        event.preventDefault();
        const token = extractToken(url);
        if (token) {
          console.log("Token received:", token.substring(0, 10) + "...");
          store.set("userData", { token });
          win.webContents.send("twitch-token", token);
        }
        console.log("closing auth window");
        authWindow.close();
      }
    };

    authWindow.webContents.on("will-navigate", handleAuth);
    authWindow.webContents.on("will-redirect", handleAuth);
  });

  ipcMain.handle("open-settings", (_, data) => {
    openSettingsWindow = new BrowserWindow({
      width: 900,
      height: 650,
      frame: false,
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
      width: 800,
      height: 650,
      frame: false,
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

  ipcMain.handle("open-chatter-list", (_, data) => {
    openChatterList = new BrowserWindow({
      width: 510,
      height: 450,
      parent: win,
      frame: false,
      modal: true,
      webPreferences: {
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, "preload.js"),
      },
    });

    loadAngularRoute(openChatterList, "chatter");
  });

  ipcMain.handle("close-window", (_, window_name) => {
    console.log("Closed " + window_name + " window");
    if (window_name == "settings") {
      if (openSettingsWindow) {
        openSettingsWindow.close();
      }
    } else if (window_name == "user-card"){
      if (openUserCardWindow) {
        openUserCardWindow.close();
      }
    } else if (window_name == "chatter") {
      if (openChatterList) {
        openChatterList.close();
      }
    } else if (window_name == "emoji") {
      if (openEmojiPicker) {
        openEmojiPicker.close();
      }
    }
  });

  win.webContents.on("before-input-event", (event, input) => {
    if (
      ((input.control || input.meta) && input.key === "+") ||
      ((input.control || input.meta) && input.key === "=")
    ) {
      event.preventDefault();
      win.webContents.setZoomLevel(win.webContents.getZoomLevel() + 1);
    }
    if ((input.control || input.meta) && input.key === "-") {
      event.preventDefault();
      win.webContents.setZoomLevel(win.webContents.getZoomLevel() - 1);
    }
    if ((input.control || input.meta) && input.key === "0") {
      event.preventDefault();
      win.webContents.setZoomLevel(0);
    }
    if ((input.control || input.meta) && input.shift && input.key === "Z") {
      event.preventDefault();
      win.webContents.setZoomLevel(win.webContents.getZoomLevel() + 1);
    }
    if ((input.control || input.meta) && input.shift && input.key === "X") {
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

app.whenReady().then(async () => {
  await initStore();
  await createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("open-external-link", (_, url) => {
  shell.openExternal(url);
});
