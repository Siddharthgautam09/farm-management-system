'use client'

import { createClient } from '@/lib/supabase/client'
import { db, addToSyncQueue, isOnline } from '@/lib/db/indexedDB'
import type { Animal, WeightRecord, FeedingLog, MedicineLog, VaccineLog, InventoryItem } from '@/lib/db/indexedDB'
import React from 'react'

// Generic offline-first CRUD service
export class OfflineFirstService<T extends { id: string; synced?: boolean; lastModified?: number }> {
  constructor(
    private tableName: string,
    private localTable: { 
      add: (data: T) => Promise<string>;
      update: (id: string, data: Partial<T>) => Promise<number>;
      get: (id: string) => Promise<T | undefined>;
      delete: (id: string) => Promise<void>;
      toArray: () => Promise<T[]>;
      bulkPut: (data: T[]) => Promise<string>;
      put: (data: T) => Promise<string>;
      toCollection: () => { and: (fn: (item: T) => boolean) => { toArray: () => Promise<T[]> } };
    },
    private supabaseTable: string
  ) {}

  // Create record (works offline)
  async create(data: Omit<T, 'synced' | 'lastModified'>): Promise<{ data: T | null; error: string | null }> {
    try {
      const record = {
        ...data,
        synced: false,
        lastModified: Date.now()
      } as T

      // Save to IndexedDB immediately
      await this.localTable.add(record)

      // Add to sync queue
      await addToSyncQueue(this.tableName, 'create', record.id, data)

      // Try to sync to server if online
      if (isOnline()) {
        try {
          const supabase = createClient()
          // supabase typed client doesn't accept dynamic table name here
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error } = await (supabase as any).from(this.supabaseTable).insert(data)
          
          if (!error) {
            // Mark as synced
            await this.localTable.update(record.id, { synced: true } as Partial<T>)
            // Remove from queue
            const queue = await db.syncQueue.where('recordId').equals(record.id).toArray()
            if (queue.length > 0) {
              await db.syncQueue.delete(queue[0].id!)
            }
          }
        } catch {
          console.log('Offline - will sync later')
        }
      }

      return { data: record, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to create record' }
    }
  }

  // Read all records (offline-first)
  async getAll(): Promise<{ data: T[] | null; error: string | null }> {
    try {
      // Try server first if online
      if (isOnline()) {
        try {
          const supabase = createClient()
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data, error } = await (supabase as any).from(this.supabaseTable).select('*')
          
          if (!error && data) {
            // Update local cache
            const records = (data as Record<string, unknown>[]).map(d => ({
              ...d,
              synced: true,
              lastModified: Date.now()
            })) as unknown as T[]

            await this.localTable.bulkPut(records)
            return { data: records, error: null }
          }
        } catch {
          console.log('Server unavailable - using cached data')
        }
      }

      // Fallback to local data
      const localData = await this.localTable.toArray()
      return { data: localData, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch records' }
    }
  }

  // Read single record (offline-first)
  async getById(id: string): Promise<{ data: T | null; error: string | null }> {
    try {
      // Try server first if online
      if (isOnline()) {
        try {
          const supabase = createClient()
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data, error } = await (supabase as any)
            .from(this.supabaseTable)
            .select('*')
            .eq('id', id)
            .single()
          
          if (!error && data) {
            const record = ({
              ...data,
              synced: true,
              lastModified: Date.now()
            } as unknown) as T
            
            await this.localTable.put(record)
            return { data: record, error: null }
          }
        } catch {
          console.log('Server unavailable - using cached data')
        }
      }

      // Fallback to local data
      const localData = await this.localTable.get(id)
      return { data: localData || null, error: localData ? null : 'Record not found' }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch record' }
    }
  }

  // Update record (works offline)
  async update(id: string, updates: Partial<T>): Promise<{ data: T | null; error: string | null }> {
    try {
      const record = {
        ...updates,
        synced: false,
        lastModified: Date.now()
      }

      // Update in IndexedDB
      await this.localTable.update(id, record)

      // Add to sync queue
      await addToSyncQueue(this.tableName, 'update', id, updates)

      // Try to sync to server if online
      if (isOnline()) {
        try {
          const supabase = createClient()
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error } = await (supabase as any)
            .from(this.supabaseTable)
            .update(updates)
            .eq('id', id)
          
          if (!error) {
            await this.localTable.update(id, { synced: true } as Partial<T>)
            const queue = await db.syncQueue.where('recordId').equals(id).toArray()
            if (queue.length > 0) {
              await db.syncQueue.delete(queue[0].id!)
            }
          }
        } catch {
          console.log('Offline - will sync later')
        }
      }

      const updated = await this.localTable.get(id)
      return { data: updated ?? null, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to update record' }
    }
  }

  // Delete record (works offline)
  async delete(id: string): Promise<{ error: string | null }> {
    try {
      // Delete from IndexedDB
      await this.localTable.delete(id)

      // Add to sync queue
      await addToSyncQueue(this.tableName, 'delete', id, {})

      // Try to sync to server if online
      if (isOnline()) {
        try {
          const supabase = createClient()
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error } = await (supabase as any)
            .from(this.supabaseTable)
            .delete()
            .eq('id', id)
          
          if (!error) {
            const queue = await db.syncQueue.where('recordId').equals(id).toArray()
            if (queue.length > 0) {
              await db.syncQueue.delete(queue[0].id!)
            }
          }
        } catch {
          console.log('Offline - will sync later')
        }
      }

      return { error: null }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to delete record' }
    }
  }

  // Query with filters (offline-first)
  async query(filters: Record<string, unknown>): Promise<{ data: T[] | null; error: string | null }> {
    try {
      // Try server first if online
      if (isOnline()) {
        try {
          const supabase = createClient()
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let query: any = (supabase as any).from(this.supabaseTable).select('*')
          
          // Apply filters
          Object.entries(filters).forEach(([key, value]) => {
            // value is unknown at compile time; cast for supabase filter
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            query = query.eq(key, value as any)
          })
          
          const { data, error } = await query
          
          if (!error && data) {
            const records = (data as Record<string, unknown>[]).map(d => ({
              ...d,
              synced: true,
              lastModified: Date.now()
            })) as unknown as T[]

            await this.localTable.bulkPut(records)
            return { data: records, error: null }
          }
        } catch {
          console.log('Server unavailable - using cached data')
        }
      }

      // Fallback to local query
      // Use `any` for collection since Dexie collection typing is dynamic here
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let collection: any = this.localTable.toCollection()

      Object.entries(filters).forEach(([key, value]) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        collection = collection.and((item: any) => (item as Record<string, unknown>)[key] === value)
      })

      const localData = await collection.toArray()
      return { data: localData, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to query records' }
    }
  }
}

// Service instances
export const animalService = new OfflineFirstService<Animal>('animals', db.animals, 'animals')
export const weightService = new OfflineFirstService<WeightRecord>('weightRecords', db.weightRecords, 'weight_records')
export const feedingService = new OfflineFirstService<FeedingLog>('feedingLogs', db.feedingLogs, 'feeding_logs')
export const medicineService = new OfflineFirstService<MedicineLog>('medicineLogs', db.medicineLogs, 'medicine_logs')
export const vaccineService = new OfflineFirstService<VaccineLog>('vaccineLogs', db.vaccineLogs, 'vaccine_logs')
export const inventoryService = new OfflineFirstService<InventoryItem>('inventoryItems', db.inventoryItems, 'inventory_items')

// Helper hook for offline-first data fetching
export function useOfflineFirst<T extends { id: string }>(
  service: OfflineFirstService<T>,
  filters?: Record<string, unknown>
) {
  const [data, setData] = React.useState<T[] | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const refetch = React.useCallback(async () => {
    setLoading(true)
    const result = filters 
      ? await service.query(filters)
      : await service.getAll()
    
    setData(result.data)
    setError(result.error)
    setLoading(false)
  }, [service, filters])

  React.useEffect(() => {
    refetch()
  }, [refetch])

  return { data, loading, error, refetch }
}

