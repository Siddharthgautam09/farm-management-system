# Quick Start Guide - Electron with Offline Support

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Development Mode

#### Run Web Version (Browser)
```bash
npm run dev
```
Then open http://localhost:3000

#### Run Electron Desktop App
```bash
npm run desktop
```
This will:
- Start Next.js dev server
- Launch Electron window
- Enable hot reload

### 3. Building for Production

#### Build Web Version
```bash
npm run build:web
```

#### Build Desktop App
```bash
# Build for current platform
npm run build:electron

# Build for macOS
npm run build:desktop:mac

# Build for Windows
npm run build:desktop:win

# Build for all platforms
npm run build:desktop:all
```

## 📦 What's Included

### Offline Support ✅
- **IndexedDB** - Local database storage
- **Dexie.js** - Modern IndexedDB wrapper
- **Automatic Sync** - Syncs when online
- **Offline Indicator** - Shows connection status
- **Sync Queue** - Tracks pending changes

### Features Working Offline
- ✅ Create/Edit/Delete animals
- ✅ Record weights
- ✅ Log feeding activities
- ✅ Track medicine/vaccines
- ✅ Manage inventory
- ✅ View all data
- ✅ Generate reports

## 🔧 Using Offline Features

### In Your Components

```typescript
import { animalService } from '@/lib/db/offlineService'
import { useOfflineStatus } from '@/hooks/useOffline'

function MyComponent() {
  const { online, syncStatus } = useOfflineStatus()
  
  const handleCreate = async () => {
    const result = await animalService.create({
      id: crypto.randomUUID(),
      animal_id: 'A001',
      category: 'beef',
      // ... other fields
    })
    
    if (result.error) {
      console.error(result.error)
    } else {
      console.log('Created:', result.data)
    }
  }
  
  return (
    <div>
      <p>Status: {online ? '🟢 Online' : '🔴 Offline'}</p>
      <button onClick={handleCreate}>Add Animal</button>
    </div>
  )
}
```

### Using the Hook

```typescript
import { useOfflineFirst } from '@/lib/db/offlineService'

function AnimalsList() {
  const { data, loading, error, refetch } = useOfflineFirst(animalService)
  
  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  
  return (
    <div>
      {data?.map(animal => (
        <div key={animal.id}>{animal.animal_id}</div>
      ))}
    </div>
  )
}
```

## 🎯 Testing Offline Mode

### In Browser
1. Open DevTools (F12)
2. Go to Network tab
3. Select "Offline" from dropdown
4. App continues to work!

### In Electron
1. Disconnect network/WiFi
2. App works normally
3. Changes queue for sync
4. Reconnect network
5. Auto-syncs to server

## 📊 Offline Indicator

Located at **bottom-right corner**:

- **🟢 Green Badge** - Online and synced
- **🔴 Red Badge** - Offline mode active
- **🔄 Spinning Icon** - Currently syncing
- **Click Badge** - View details panel

## 🛠️ Electron Configuration

### Main Files
- `electron.js` - Main Electron process
- `preload.js` - Context bridge API
- `package.json` - Build configuration

### Window Shortcuts
- `Cmd/Ctrl + N` - New Animal
- `Cmd/Ctrl + W` - Close Window
- `Cmd/Ctrl + Q` - Quit App
- `Cmd/Ctrl + R` - Reload
- `F12` - Toggle DevTools

## 📱 Platform Builds

### macOS (.dmg, .zip)
- Intel (x64) and Apple Silicon (arm64)
- Signed and notarized (if configured)
- Auto-updater support

### Windows (.exe, portable)
- 64-bit and 32-bit
- NSIS installer with options
- Portable version available

### Linux (.AppImage, .deb)
- AppImage (universal)
- Debian package (.deb)
- 64-bit support

## 🔐 Security

- Context Isolation enabled
- Node Integration disabled
- Web Security enforced
- Preload script sandboxed

## 🐛 Debugging

### Enable DevTools
```javascript
// In electron.js
mainWindow.webContents.openDevTools()
```

### Check IndexedDB
1. Open DevTools
2. Go to Application tab
3. Click IndexedDB
4. View `FarmManagementDB`

### View Sync Queue
```javascript
import { db } from '@/lib/db/indexedDB'

// Check pending items
const pending = await db.syncQueue.toArray()
console.log('Pending sync:', pending)
```

## 📚 Additional Resources

- [Electron Documentation](https://electronjs.org/docs)
- [Dexie.js Guide](https://dexie.org)
- [Next.js Docs](https://nextjs.org/docs)
- [OFFLINE_GUIDE.md](./OFFLINE_GUIDE.md) - Detailed offline guide

## 🆘 Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf node_modules .next dist
npm install
npm run build
```

### Electron Won't Start
```bash
# Check if port 3000 is available
lsof -ti:3000 | xargs kill -9
npm run desktop
```

### Sync Not Working
1. Check offline indicator status
2. Open browser console
3. Check for errors
4. Try manual sync button
5. Check Supabase connection

### Data Not Saving Offline
1. Check IndexedDB in DevTools
2. Verify syncQueue table
3. Check browser console for errors
4. Try clearing IndexedDB and re-syncing

## 💡 Tips

1. **Always check online status** before critical operations
2. **Show user feedback** when working offline
3. **Test offline mode** during development
4. **Monitor sync queue** for pending items
5. **Clear old data** periodically to save space

## 🎉 Success!

Your app now works **100% offline** with automatic sync when online!

Need help? Check the detailed guide: [OFFLINE_GUIDE.md](./OFFLINE_GUIDE.md)
