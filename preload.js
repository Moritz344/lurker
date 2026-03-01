const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  openExternalLink: (url) => ipcRenderer.invoke("open-external-link", url),
  startAuth: () => ipcRenderer.invoke("start-auth"),
  openUserCard: () => ipcRenderer.invoke("open-user-card"),
  openSettings: () => ipcRenderer.invoke("open-settings"),
  openChatterList: () => ipcRenderer.invoke("open-chatter-list"),
  openEmojiPicker: () => ipcRenderer.invoke("open-emoji-picker"),
  closeWindow: (window_name) => ipcRenderer.invoke("close-window", window_name),
  onTwitchToken: (callback) => ipcRenderer.on("twitch-token", (event, token) => callback(token))
});
