const { app, BrowserWindow, ipcMain, dialog, shell } = require("electron");
const path = require("path");

// 613 646
function createWindow() {
  const win = new BrowserWindow({
    width: 613,
    height: 646,
    frame: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  ipcMain.handle("open-dialog", (event, data) => {
    const dialogWindow = new BrowserWindow({
      width: 400,
      height: 300,
      parent: win,
      modal: true,
      webPreferences: {
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, "preload.js"),
      },
    });

    dialogWindow.loadURL("http://localhost:4200/settings");

    dialogWindow.webContents.on("did-finish-load", () => {
      dialogWindow.webContents.send("data", data);
    });
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
