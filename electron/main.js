import {app, BrowserWindow } from "electron";

function createWindow() {
    const win = new BrowserWindow({
    width: 1150,
    height: 700,
    minWidth: 1200,
    minHeight: 600
    });

    win.loadURL("http://localhost:5173");
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    app.quit();
});