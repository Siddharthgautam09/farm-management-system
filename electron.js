const { app, BrowserWindow } = require("electron");
const waitPort = require("wait-port");

async function createWindow() {
  // Wait until Next.js starts
  await waitPort({
    host: "localhost",
    port: 3000,
    timeout: 60000, // 60 seconds
  });

  const win = new BrowserWindow({
    width: 1400,
    height: 900,
  });

  win.loadURL("http://localhost:3000");
}

app.whenReady().then(createWindow);
