import { app, BrowserWindow, ipcMain ,shell } from "electron";
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
        icon: path.join(__dirname, "assets/icon.ico"),
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

ipcMain.handle("open-file", async (event, filePath) => {
    try {
        console.log("OPEN REQUEST",filePath);
        await shell.openPath(filePath);
        return true;
    } catch (err) {
        console.error("Failed to open file:", err);
        return false;
    }
});

ipcMain.handle("show-in-folder", async (event, filePath) => {
    try {
        console.log("SHOW REQUEST",filePath);
        shell.showItemInFolder(filePath);
        return true;
    } catch (err) {
        console.error("Failed to show file:", err);
        return false;
    }
});