import { contextBridge, ipcRenderer } from "electron";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  // Basic ping for testing connection
  ping: () => ipcRenderer.invoke("ping"),
  
  // Platform information
  getPlatform: () => ipcRenderer.invoke("get-platform"),
  
  // Navigation handler
  onNavigate: (callback) => ipcRenderer.on('navigate', callback),
  removeNavigationListener: () => ipcRenderer.removeAllListeners('navigate'),
  
  // App information
  getVersion: () => process.versions.electron,
  getNodeVersion: () => process.versions.node,
  getChromiumVersion: () => process.versions.chrome,
  
  // Window controls
  minimize: () => ipcRenderer.invoke('window-minimize'),
  maximize: () => ipcRenderer.invoke('window-maximize'),
  close: () => ipcRenderer.invoke('window-close'),
  
  // File operations (if needed)
  openFile: () => ipcRenderer.invoke('dialog-open-file'),
  saveFile: (content) => ipcRenderer.invoke('dialog-save-file', content),
  
  // System notifications
  showNotification: (title, body) => ipcRenderer.invoke('show-notification', { title, body }),
  
  // Offline/Online status
  isOnline: () => navigator.onLine,
  onOnlineStatusChange: (callback) => {
    window.addEventListener('online', () => callback(true))
    window.addEventListener('offline', () => callback(false))
  },
  
  // IndexedDB storage info
  getStorageEstimate: async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      return await navigator.storage.estimate()
    }
    return null
  }
});
