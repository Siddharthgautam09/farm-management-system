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
  const isDev = !app.isPackaged;

if (isDev) {
  win.loadURL("http://localhost:3000");
} else {
  win.loadURL("https://farm-management-system-taupe.vercel.app");
}

}

app.whenReady().then(createWindow);
