const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  openExternalLink: (url) => ipcRenderer.invoke("open-external-link", url),
  openUserCard: () => ipcRenderer.invoke("open-user-card"),
  openSettings: () => ipcRenderer.invoke("open-settings"),
  openChatterList: () => ipcRenderer.invoke("open-chatter-list"),
  closeWindow: (window_name) => ipcRenderer.invoke("close-window",window_name),
});
