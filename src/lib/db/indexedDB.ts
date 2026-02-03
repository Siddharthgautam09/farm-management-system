import Dexie, { Table } from 'dexie'

// Define database schema types
export interface Animal {
  id: string
  animal_id: string
  category: 'beef' | 'camel' | 'sheep' | 'goat'
  entry_date: string
  entry_weight?: number
  age_months?: number
  purchase_price?: number
  is_alive: boolean
  is_sold: boolean
  incoming_company?: string
  old_calf_number?: string
  current_stage_id?: string
  current_room_id?: string
  created_at: string
  updated_at: string
  synced: boolean
  lastModified: number
}

export interface WeightRecord {
  id: string
  animal_id: string
  recorded_date: string
  weight: number
  stage_id?: string
  room_id?: string
  notes?: string
  created_at: string
  synced: boolean
  lastModified: number
}

export interface FeedingLog {
  id: string
  room_id: string
  stage_id: string
  feed_type: string
  daily_use: number
  date_of_use: string
  mcr_price?: number
  concentrate_price?: number
  bale_price?: number
  premix_price?: number
  notes?: string
  created_at: string
  synced: boolean
  lastModified: number
}

export interface MedicineLog {
  id: string
  animal_id: string
  room_id: string
  stage_id: string
  drug_name: string
  drug_type: string
  drug_dose?: number
  drug_price?: number
  treatment_days?: number
  treatment_start_date?: string
  illness?: string
  created_at: string
  synced: boolean
  lastModified: number
}

export interface VaccineLog {
  id: string
  animal_id: string
  room_id: string
  stage_id: string
  vaccine_name: string
  vaccine_dose?: number
  vaccine_volume?: number
  vaccine_price?: number
  vaccine_company?: string
  first_dose_date?: string
  second_dose_date?: string
  created_at: string
  synced: boolean
  lastModified: number
}

export interface InventoryItem {
  id: string
  item_name: string
  category: string
  quantity: number
  unit: string
  minimum_stock_level?: number
  cost_per_unit?: number
  supplier?: string
  last_restocked?: string
  notes?: string
  created_at: string
  synced: boolean
  lastModified: number
}

export interface SyncQueue {
  id?: number
  table: string
  operation: 'create' | 'update' | 'delete'
  recordId: string
  data: Record<string, unknown>
  timestamp: number
  retries: number
}

// Define the database schema
class FarmManagementDB extends Dexie {
  animals!: Table<Animal, string>
  weightRecords!: Table<WeightRecord, string>
  feedingLogs!: Table<FeedingLog, string>
  medicineLogs!: Table<MedicineLog, string>
  vaccineLogs!: Table<VaccineLog, string>
  inventoryItems!: Table<InventoryItem, string>
  syncQueue!: Table<SyncQueue, number>

  constructor() {
    super('FarmManagementDB')
    
    this.version(1).stores({
      animals: 'id, animal_id, category, is_alive, is_sold, current_stage_id, current_room_id, synced, lastModified',
      weightRecords: 'id, animal_id, recorded_date, stage_id, room_id, synced, lastModified',
      feedingLogs: 'id, room_id, stage_id, feed_type, date_of_use, synced, lastModified',
      medicineLogs: 'id, animal_id, room_id, stage_id, drug_type, synced, lastModified',
      vaccineLogs: 'id, animal_id, room_id, stage_id, vaccine_name, synced, lastModified',
      inventoryItems: 'id, item_name, category, synced, lastModified',
      syncQueue: '++id, table, operation, timestamp, retries'
    })
  }
}

// Create and export database instance
export const db = new FarmManagementDB()

// Helper function to check if online
export const isOnline = (): boolean => {
  if (typeof window !== 'undefined') {
    return window.navigator.onLine
  }
  return true
}

// Add to sync queue
export const addToSyncQueue = async (
  table: string,
  operation: 'create' | 'update' | 'delete',
  recordId: string,
  data: Record<string, unknown>
) => {
  await db.syncQueue.add({
    table,
    operation,
    recordId,
    data,
    timestamp: Date.now(),
    retries: 0
  })
}

// Clear sync queue after successful sync
export const clearSyncedItems = async (ids: number[]) => {
  await db.syncQueue.bulkDelete(ids)
}

// Get all pending sync items
export const getPendingSyncItems = async () => {
  return await db.syncQueue.toArray()
}

// Mark record as synced
export const markAsSynced = async (table: string, id: string) => {
  const tableRef = (db as unknown as Record<string, { update: (id: string, data: Record<string, unknown>) => Promise<void> }>)[table]
  if (tableRef) {
    await tableRef.update(id, { synced: true })
  }
}

// Clear all local data (for testing or reset)
export const clearAllData = async () => {
  await db.animals.clear()
  await db.weightRecords.clear()
  await db.feedingLogs.clear()
  await db.medicineLogs.clear()
  await db.vaccineLogs.clear()
  await db.inventoryItems.clear()
  await db.syncQueue.clear()
}

// Export database info
export const getDatabaseInfo = async () => {
  const animalsCount = await db.animals.count()
  const weightsCount = await db.weightRecords.count()
  const feedingCount = await db.feedingLogs.count()
  const medicineCount = await db.medicineLogs.count()
  const vaccineCount = await db.vaccineLogs.count()
  const inventoryCount = await db.inventoryItems.count()
  const syncQueueCount = await db.syncQueue.count()

  return {
    animals: animalsCount,
    weights: weightsCount,
    feeding: feedingCount,
    medicine: medicineCount,
    vaccine: vaccineCount,
    inventory: inventoryCount,
    pendingSync: syncQueueCount,
    databaseSize: await estimateDatabaseSize()
  }
}

// Estimate database size
const estimateDatabaseSize = async (): Promise<string> => {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate()
    const usage = estimate.usage || 0
    const quota = estimate.quota || 0
    const usageMB = (usage / (1024 * 1024)).toFixed(2)
    const quotaMB = (quota / (1024 * 1024)).toFixed(2)
    return `${usageMB} MB / ${quotaMB} MB`
  }
  return 'Unknown'
}
