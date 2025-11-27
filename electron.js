const { app, BrowserWindow, Menu, shell, dialog, ipcMain } = require("electron");
const path = require("path");
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow;

// Platform-specific configurations
const isWindows = process.platform === 'win32';
const isMac = process.platform === 'darwin';
const isLinux = process.platform === 'linux';

function createWindow() {
  // Create the browser window with platform-specific settings
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    show: false, // Don't show until ready
    icon: getIconPath(),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: !isDev,
      // Performance optimizations
      experimentalFeatures: true,
      enableBlinkFeatures: 'CSSColorSchemeUARendering',
      backgroundThrottling: false,
      // Hardware acceleration
      hardwareAcceleration: true,
      // Memory optimization
      v8CacheOptions: 'bypassHeatCheck',
      // Smooth scrolling
      enableWebSQL: false,
      allowRunningInsecureContent: false
    },
    titleBarStyle: isMac ? 'hiddenInset' : 'default',
    frame: !isMac, // Hide frame on macOS for native look
    // Performance settings
    transparent: false,
    vibrancy: isMac ? 'under-window' : undefined,
    visualEffectState: isMac ? 'active' : undefined,
  });

  // Load the appropriate URL
  if (isDev) {
    // In development, wait for Next.js server
    const waitPort = require("wait-port");
    waitPort({
      host: "localhost",
      port: 3000,
      timeout: 60000,
    }).then(() => {
      mainWindow.loadURL("http://localhost:3000");
      mainWindow.webContents.openDevTools();
    }).catch(err => {
      console.error('Failed to connect to development server:', err);
      dialog.showErrorBox('Development Server Error', 'Failed to connect to Next.js development server on port 3000.');
    });
  } else {
    // In production, load the built Next.js app
    const startUrl = path.join(__dirname, '.next/server/pages/index.html');
    mainWindow.loadFile(startUrl).catch(() => {
      // Fallback to online version if local files fail
      mainWindow.loadURL("https://farm-management-system-taupe.vercel.app");
    });
  }

  // Optimize window loading
  mainWindow.webContents.once('dom-ready', () => {
    // Inject performance CSS
    mainWindow.webContents.insertCSS(`
      * {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      
      html {
        scroll-behavior: smooth;
      }
      
      body {
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
        will-change: transform;
      }
    `);
  });

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Focus the window on creation
    if (isDev) {
      mainWindow.focus();
    }
    
    // Enable smooth animations
    mainWindow.webContents.executeJavaScript(`
      // Enable hardware acceleration for animations
      document.documentElement.style.cssText += '
        -webkit-transform: translate3d(0,0,0);
        transform: translate3d(0,0,0);
      ';
    `);
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Create application menu
  createMenu();
}

function getIconPath() {
  if (isWindows) {
    return path.join(__dirname, 'build/icon.ico');
  } else if (isMac) {
    return path.join(__dirname, 'build/icon.icns');
  } else {
    return path.join(__dirname, 'build/icon.png');
  }
}

function createMenu() {
  const template = [
    ...(isMac ? [{
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'New Animal',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('navigate', '/animals/new');
            }
          }
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        ...(isMac ? [
          { role: 'pasteAndMatchStyle' },
          { role: 'delete' },
          { role: 'selectAll' },
          { type: 'separator' },
          {
            label: 'Speech',
            submenu: [
              { role: 'startSpeaking' },
              { role: 'stopSpeaking' }
            ]
          }
        ] : [
          { role: 'delete' },
          { type: 'separator' },
          { role: 'selectAll' }
        ])
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' },
        ...(isMac ? [
          { type: 'separator' },
          { role: 'front' }
        ] : [])
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About Farm Management System',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About Farm Management System',
              message: 'Farm Management System',
              detail: 'A comprehensive solution for managing farm animals, inventory, and reports.\n\nVersion: ' + app.getVersion()
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Performance optimizations
app.commandLine.appendSwitch('enable-features', 'VaapiVideoDecoder');
app.commandLine.appendSwitch('disable-features', 'VizDisplayCompositor');
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('disable-dev-shm-usage');
app.commandLine.appendSwitch('disable-background-timer-throttling');
app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-web-security');
app.commandLine.appendSwitch('enable-unsafe-webgpu');

// App event handlers
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // On macOS, re-create window when dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // On macOS, keep app running even when all windows are closed
  if (!isMac) {
    app.quit();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (navigationEvent, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});

// IPC handlers
ipcMain.handle('ping', () => 'pong');

ipcMain.handle('get-platform', () => ({
  platform: process.platform,
  isWindows,
  isMac,
  isLinux,
  isDev
}));
