const { contextBridge, ipcRenderer } = require("electron");

console.log("PRELOAD LOADED");

contextBridge.exposeInMainWorld("electronAPI", {
    searchFiles: (query) => ipcRenderer.invoke("search-files", query),
});