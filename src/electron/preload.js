const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  // Expose any Electron APIs you need
  platform: process.platform
})
