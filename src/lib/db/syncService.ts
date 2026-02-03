import { createClient } from '@/lib/supabase/client'
import { db, getPendingSyncItems, clearSyncedItems, markAsSynced, isOnline } from './indexedDB'

type SyncStatus = 'idle' | 'syncing' | 'error'

class SyncService {
  private syncStatus: SyncStatus = 'idle'
  private syncInterval: number | null = null
  private onlineHandler: () => void = () => {
    /* no-op default for non-browser environments */
  }
  private offlineHandler: () => void = () => {
    /* no-op default for non-browser environments */
  }
  private listeners: ((status: SyncStatus) => void)[] = []

  constructor() {
    if (typeof window !== 'undefined') {
      // Bind handlers so removeEventListener can remove them later
      this.onlineHandler = () => this.handleOnline()
      this.offlineHandler = () => this.handleOffline()

      // Listen for online/offline events
      window.addEventListener('online', this.onlineHandler)
      window.addEventListener('offline', this.offlineHandler)
      
      // Start periodic sync if online
      if (isOnline()) {
        this.startPeriodicSync()
      }
    }
  }

  // Subscribe to sync status changes
  onStatusChange(callback: (status: SyncStatus) => void) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback)
    }
  }

  private updateStatus(status: SyncStatus) {
    this.syncStatus = status
    this.listeners.forEach(callback => callback(status))
  }

  private handleOnline() {
    console.log('📡 Connection restored - syncing data...')
    this.startPeriodicSync()
    this.syncToServer()
  }

  private handleOffline() {
    console.log('📴 Connection lost - working offline')
    this.stopPeriodicSync()
  }

  private startPeriodicSync() {
    if (!this.syncInterval) {
      // Sync every 30 seconds
      this.syncInterval = window.setInterval(() => {
        if (isOnline()) {
          this.syncToServer()
        }
      }, 30000)
    }
  }

  private stopPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  // Sync local changes to server
  async syncToServer(): Promise<boolean> {
    if (!isOnline()) {
      console.log('⚠️ Offline - cannot sync to server')
      return false
    }

    if (this.syncStatus === 'syncing') {
      console.log('⏳ Sync already in progress')
      return false
    }

    try {
      this.updateStatus('syncing')
      const supabase = createClient()
      const pendingItems = await getPendingSyncItems()

      if (pendingItems.length === 0) {
        console.log('✅ No items to sync')
        this.updateStatus('idle')
        return true
      }

      console.log(`🔄 Syncing ${pendingItems.length} items to server...`)
      const syncedIds: number[] = []

      for (const item of pendingItems) {
        try {
          const { table, operation, recordId, data } = item

          switch (operation) {
            case 'create':
              // supabase typed client doesn't accept dynamic table name here
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const { error: createError } = await (supabase as any)
                .from(table)
                .insert(data)
              
              if (!createError) {
                syncedIds.push(item.id!)
                await markAsSynced(table, recordId)
              }
              break

            case 'update':
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const { error: updateError } = await (supabase as any)
                .from(table)
                .update(data)
                .eq('id', recordId)
              
              if (!updateError) {
                syncedIds.push(item.id!)
                await markAsSynced(table, recordId)
              }
              break

            case 'delete':
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const { error: deleteError } = await (supabase as any)
                .from(table)
                .delete()
                .eq('id', recordId)
              
              if (!deleteError) {
                syncedIds.push(item.id!)
              }
              break
          }
        } catch (error) {
          console.error(`❌ Failed to sync item ${item.id}:`, error)
          // Increment retry count
          await db.syncQueue.update(item.id!, { 
            retries: (item.retries || 0) + 1 
          })
        }
      }

      // Clear successfully synced items
      if (syncedIds.length > 0) {
        await clearSyncedItems(syncedIds)
        console.log(`✅ Successfully synced ${syncedIds.length} items`)
      }

      this.updateStatus('idle')
      return true
    } catch (error) {
      console.error('❌ Sync error:', error)
      this.updateStatus('error')
      return false
    }
  }

  // Sync server data to local database
  async syncFromServer(tables: string[] = ['animals', 'weight_records', 'feeding_logs', 'medicine_logs', 'vaccine_logs', 'inventory_items']): Promise<boolean> {
    if (!isOnline()) {
      console.log('⚠️ Offline - cannot sync from server')
      return false
    }

    try {
      this.updateStatus('syncing')
      const supabase = createClient()

      for (const table of tables) {
        // supabase typed client doesn't accept dynamic table name here
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
          .from(table)
          .select('*')
          .order('created_at', { ascending: false })

        if (!error && data) {
          // Map Supabase table names to IndexedDB table names
          const localTable = this.getLocalTableName(table)
          const records = (data as Record<string, unknown>[]).map((record: Record<string, unknown>) => ({
            ...record,
            synced: true,
            lastModified: Date.now()
          }))

          // Bulk upsert to local database
          await (db as unknown as Record<string, { bulkPut: (records: unknown[]) => Promise<string> }>)[localTable].bulkPut(records)
          console.log(`✅ Synced ${records.length} ${table} from server`)
        }
      }

      this.updateStatus('idle')
      return true
    } catch (error) {
      console.error('❌ Sync from server error:', error)
      this.updateStatus('error')
      return false
    }
  }

  private getLocalTableName(supabaseTable: string): string {
    const mapping: Record<string, string> = {
      'animals': 'animals',
      'weight_records': 'weightRecords',
      'feeding_logs': 'feedingLogs',
      'medicine_logs': 'medicineLogs',
      'vaccine_logs': 'vaccineLogs',
      'inventory_items': 'inventoryItems'
    }
    return mapping[supabaseTable] || supabaseTable
  }

  // Get current sync status
  getStatus(): SyncStatus {
    return this.syncStatus
  }

  // Force sync now
  async forceSyncNow(): Promise<boolean> {
    const toServer = await this.syncToServer()
    const fromServer = await this.syncFromServer()
    return toServer && fromServer
  }

  // Stop sync service
  destroy() {
    this.stopPeriodicSync()
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.onlineHandler)
      window.removeEventListener('offline', this.offlineHandler)
    }
  }
}

// Export singleton instance
export const syncService = new SyncService()
