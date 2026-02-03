# Offline Support & IndexedDB Guide

## Overview

Your Farm Management System now has full offline support using IndexedDB for local data storage and automatic synchronization when online.

## Features

### ✅ What Works Offline

- **View all animals** - Browse your complete animal database
- **Add new animals** - Create animal records offline
- **Update animal data** - Edit existing records
- **Record weights** - Track weight measurements
- **Log feeding** - Record feeding activities
- **Medicine records** - Track medical treatments
- **Vaccine logs** - Manage vaccination schedules
- **Inventory management** - Update inventory items
- **View reports** - Access locally cached reports

### 🔄 Automatic Synchronization

The app automatically syncs data in the following scenarios:

1. **When coming back online** - Pending changes upload automatically
2. **Every 30 seconds** - Background sync while online
3. **Manual sync** - Click "Sync Now" button in offline indicator
4. **On app start** - Downloads latest data from server

## Using the Offline Indicator

### Location
Bottom-right corner of the screen

### Status Badge
- **Green "Online"** - Connected to server
- **Red "Offline"** - No internet connection
- **Spinning icon** - Currently syncing

### Details Panel
Click the badge to see:
- Connection status
- Sync status
- Pending items waiting to sync
- Local data counts
- Storage usage
- Manual sync button

## Architecture

### Data Flow

```
┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│   Supabase  │ <-----> │  Sync Service │ <-----> │  IndexedDB   │
│  (Server)   │         │  (Auto Sync)  │         │   (Local)    │
└─────────────┘         └──────────────┘         └──────────────┘
       ↑                        ↑                        ↑
       │                        │                        │
       └────────────────────────┴────────────────────────┘
                          Your App
```

### Database Tables (IndexedDB)

1. **animals** - Animal records with full details
2. **weightRecords** - Weight measurements
3. **feedingLogs** - Feeding activity logs
4. **medicineLogs** - Medical treatment records
5. **vaccineLogs** - Vaccination records
6. **inventoryItems** - Inventory management
7. **syncQueue** - Pending changes to upload

## How It Works

### Creating Data Offline

```typescript
// Example: Adding an animal offline
const newAnimal = {
  id: uuid(),
  animal_id: 'A001',
  category: 'beef',
  entry_date: new Date().toISOString(),
  // ... other fields
  synced: false,
  lastModified: Date.now()
}

// Save to IndexedDB
await db.animals.add(newAnimal)

// Add to sync queue
await addToSyncQueue('animals', 'create', newAnimal.id, newAnimal)
```

When you create data offline:
1. Saved immediately to IndexedDB
2. Added to sync queue
3. Marked as `synced: false`
4. Automatically uploaded when connection restored

### Sync Process

1. **Detect online** - App detects internet connection
2. **Process queue** - Each pending item processed
3. **Upload to Supabase** - Data sent to server
4. **Mark as synced** - Update local record status
5. **Clear queue** - Remove successfully synced items
6. **Download updates** - Fetch latest server data

## Development Usage

### Import Required Modules

```typescript
import { db } from '@/lib/db/indexedDB'
import { syncService } from '@/lib/db/syncService'
import { useOfflineStatus } from '@/hooks/useOffline'
```

### Check Online Status

```typescript
const { online, syncStatus } = useOfflineStatus()

if (!online) {
  console.log('Working offline')
}
```

### Manual Sync

```typescript
// Force sync now
await syncService.forceSyncNow()

// Sync from server only
await syncService.syncFromServer()

// Sync to server only
await syncService.syncToServer()
```

### Query Local Data

```typescript
// Get all animals
const animals = await db.animals.toArray()

// Filter animals
const beefAnimals = await db.animals
  .where('category')
  .equals('beef')
  .toArray()

// Get unsynced records
const pendingAnimals = await db.animals
  .where('synced')
  .equals(false)
  .toArray()
```

### Add Data with Offline Support

```typescript
import { addToSyncQueue } from '@/lib/db/indexedDB'

async function createAnimalOffline(animalData) {
  // Add to local database
  await db.animals.add({
    ...animalData,
    synced: false,
    lastModified: Date.now()
  })
  
  // Queue for sync
  await addToSyncQueue(
    'animals',
    'create',
    animalData.id,
    animalData
  )
}
```

## Electron Integration

### Preload API

Access offline features from Electron:

```javascript
// Check if online
const online = window.electronAPI.isOnline()

// Listen for status changes
window.electronAPI.onOnlineStatusChange((isOnline) => {
  console.log('Online status:', isOnline)
})

// Get storage info
const storage = await window.electronAPI.getStorageEstimate()
```

## Storage Limits

### Browser Storage
- **Chrome/Edge**: ~60% of disk space
- **Firefox**: ~50% of disk space
- **Safari**: ~1GB

### Electron (Desktop)
- No hard limits
- Depends on available disk space
- Typically can store gigabytes of data

## Best Practices

### 1. Always Check Online Status

```typescript
if (online) {
  // Fetch from server
} else {
  // Use local data
}
```

### 2. Show User Feedback

```typescript
if (syncStatus === 'syncing') {
  showLoadingIndicator()
} else if (pendingSync > 0) {
  showPendingBadge(pendingSync)
}
```

### 3. Handle Sync Conflicts

Currently uses "last write wins" strategy. Consider adding:
- Version numbers
- Conflict resolution UI
- Manual merge options

### 4. Periodic Cleanup

```typescript
// Remove old synced data (optional)
await db.animals
  .where('synced')
  .equals(true)
  .and(item => item.lastModified < oldDate)
  .delete()
```

## Troubleshooting

### Sync Not Working

1. Check online status in indicator
2. Open browser DevTools → Application → IndexedDB
3. Check `syncQueue` table for pending items
4. Try manual sync button
5. Check browser console for errors

### Data Not Appearing

1. Refresh the page
2. Check if data is in IndexedDB
3. Verify sync queue is processing
4. Check Supabase dashboard for server data

### Storage Full

1. Check storage usage in indicator
2. Clear old data: Settings → Clear Cache
3. Export important data before clearing
4. Increase browser storage if needed

## Advanced Features

### Custom Sync Logic

```typescript
// Extend sync service
class CustomSyncService extends SyncService {
  async syncWithConflictResolution() {
    // Your custom sync logic
  }
}
```

### Selective Sync

```typescript
// Only sync specific tables
await syncService.syncFromServer([
  'animals',
  'weight_records'
])
```

### Background Sync (PWA)

```typescript
// Register background sync
if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
  const registration = await navigator.serviceWorker.ready
  await registration.sync.register('sync-farm-data')
}
```

## Testing Offline Mode

### In Browser
1. Open DevTools → Network tab
2. Select "Offline" from throttling dropdown
3. Test app functionality

### In Electron
1. Disable network adapter
2. Or use offline simulator in code

### Automated Testing

```typescript
describe('Offline Mode', () => {
  beforeEach(() => {
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false
    })
  })
  
  it('should save data locally when offline', async () => {
    await createAnimal(testData)
    const saved = await db.animals.get(testData.id)
    expect(saved).toBeDefined()
    expect(saved.synced).toBe(false)
  })
})
```

## Future Enhancements

### Planned Features
- [ ] Conflict resolution UI
- [ ] Selective table sync
- [ ] Export/import offline data
- [ ] Offline analytics
- [ ] Delta sync (only changed data)
- [ ] Compression for large datasets
- [ ] Multi-device sync detection

## Support

For issues or questions:
1. Check browser console for errors
2. Review sync queue in IndexedDB
3. Check network tab for failed requests
4. Open GitHub issue with details
