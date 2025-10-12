const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');
const os = require('os');

// 613 646
function createWindow() {
  const win = new BrowserWindow({
    width: 613,
    height: 646,
    frame: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  if (process.env.ELECTRON_DEV) {
    win.loadURL('http://localhost:4200');  // Angular Dev Server
    win.webContents.openDevTools();        // optional Debugging
  }else {
    win.loadFile(path.join(__dirname, 'dist/launcher/browser/index.html'));
  }

}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});


