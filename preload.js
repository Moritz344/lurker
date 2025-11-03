const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  openExternalLink: (url) => ipcRenderer.invoke("open-external-link", url),
  openDialog: (message) => ipcRenderer.invoke("open-dialog", message),
});
