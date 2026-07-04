const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  openExternalLink: (url) => ipcRenderer.invoke("open-external-link", url),
  startAuth: () => ipcRenderer.invoke("start-auth"),
  openUserCard: () => ipcRenderer.invoke("open-user-card"),
  exit: () => ipcRenderer.invoke("exit"),
  openSettings: () => ipcRenderer.invoke("open-settings"),
  openChatterList: () => ipcRenderer.invoke("open-chatter-list"),
  openEmojiPicker: () => ipcRenderer.invoke("open-emoji-picker"),
  closeWindow: (window_name) => ipcRenderer.invoke("close-window", window_name),
  saveUserData: (data) => ipcRenderer.invoke("save-user-data", data),
  getToken: () => ipcRenderer.invoke("get-token"),
  getUsername: () => ipcRenderer.invoke("get-username"),
  getCreatedAt: () => ipcRenderer.invoke("get-created-at"),
  getUserId: () => ipcRenderer.invoke("get-user-id"),
  getDesc: () => ipcRenderer.invoke("get-desc"),
  getProfileImageUrl: () => ipcRenderer.invoke("get-profile-image-url"),
  onTwitchToken: (callback) =>
    ipcRenderer.on("twitch-token", (_, token) => callback(token)),
  logout: () => ipcRenderer.invoke("logout"),
  copyTextToClipboard: (text) => ipcRenderer.invoke("copy-to-clipboard", text),
  getVersion: () => ipcRenderer.invoke("get-version"),
  showWarning: (msg,title) => ipcRenderer.invoke("show-warning-box",msg,title),
});
