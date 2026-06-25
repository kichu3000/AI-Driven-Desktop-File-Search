const { contextBridge, ipcRenderer } = require("electron");

console.log("PRELOAD LOADED");

contextBridge.exposeInMainWorld("electronAPI", {
    searchFiles: (query) => ipcRenderer.invoke("search-files", query),
    openFile: (filePath) => ipcRenderer.invoke("open-file", filePath),
    showInFolder: (filePath) => ipcRenderer.invoke("show-in-folder", filePath),
});