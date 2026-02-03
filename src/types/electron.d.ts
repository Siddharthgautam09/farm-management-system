// Type definitions for Electron API exposed via contextBridge

export interface ElectronAPI {
  // Basic connection test
  ping: () => Promise<string>
  
  // Platform information
  getPlatform: () => Promise<{
    platform: string
    isWindows: boolean
    isMac: boolean
    isLinux: boolean
    isDev: boolean
  }>
  
  // Navigation
  onNavigate: (callback: (event: Electron.IpcRendererEvent, path: string) => void) => void
  removeNavigationListener: () => void
  
  // App information
  getVersion: () => string
  getNodeVersion: () => string
  getChromiumVersion: () => string
  
  // Window controls
  minimize: () => Promise<void>
  maximize: () => Promise<void>
  close: () => Promise<void>
  
  // File operations
  openFile: () => Promise<string | null>
  saveFile: (content: string) => Promise<boolean>
  
  // System notifications
  showNotification: (title: string, body: string) => Promise<boolean>
  
  // Offline/Online status
  isOnline: () => boolean
  onOnlineStatusChange: (callback: (isOnline: boolean) => void) => void
  
  // Storage information
  getStorageEstimate: () => Promise<{
    usage?: number
    quota?: number
  } | null>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
