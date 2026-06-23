import { app, BrowserWindow, ipcMain } from "electron";
import { searchFiles } from "./searchEngine.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
    const preloadPath = path.join(__dirname, "preload.cjs");
    const win = new BrowserWindow({
        width: 1250,
        height: 700,
        minWidth: 1200,
        minHeight: 600,

        webPreferences: {
            preload: preloadPath,
            contextIsolation: true,
            nodeIntegration: false
        }        
    });
    console.log("Loading Electron preload:", preloadPath);

    win.loadURL("http://localhost:5173");
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    app.quit();
});

ipcMain.handle("search-files", async (_, query) => {
    return await searchFiles(query);
});