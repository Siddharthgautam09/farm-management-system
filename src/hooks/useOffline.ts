'use client'

import { useState, useEffect } from 'react'
import { db, isOnline } from '@/lib/db/indexedDB'
import { syncService } from '@/lib/db/syncService'

export function useOfflineStatus() {
  const [online, setOnline] = useState(true)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle')

  useEffect(() => {
    // Set initial online status
    setOnline(isOnline())

    // Listen for online/offline events
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Subscribe to sync status
    const unsubscribe = syncService.onStatusChange(setSyncStatus)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      unsubscribe()
    }
  }, [])

  return { online, syncStatus }
}

export function useIndexedDB() {
  const [dbInfo, setDbInfo] = useState({
    animals: 0,
    weights: 0,
    feeding: 0,
    medicine: 0,
    vaccine: 0,
    inventory: 0,
    pendingSync: 0,
    databaseSize: '0 MB'
  })

  const refreshInfo = async () => {
    const info = await db.transaction('r', [
      db.animals,
      db.weightRecords,
      db.feedingLogs,
      db.medicineLogs,
      db.vaccineLogs,
      db.inventoryItems,
      db.syncQueue
    ], async () => {
      const animals = await db.animals.count()
      const weights = await db.weightRecords.count()
      const feeding = await db.feedingLogs.count()
      const medicine = await db.medicineLogs.count()
      const vaccine = await db.vaccineLogs.count()
      const inventory = await db.inventoryItems.count()
      const pendingSync = await db.syncQueue.count()

      let databaseSize = '0 MB'
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate()
        const usage = estimate.usage || 0
        const quota = estimate.quota || 0
        const usageMB = (usage / (1024 * 1024)).toFixed(2)
        const quotaMB = (quota / (1024 * 1024)).toFixed(2)
        databaseSize = `${usageMB} MB / ${quotaMB} MB`
      }

      return {
        animals,
        weights,
        feeding,
        medicine,
        vaccine,
        inventory,
        pendingSync,
        databaseSize
      }
    })

    setDbInfo(info)
  }

  useEffect(() => {
    refreshInfo()
  }, [])

  return { dbInfo, refreshInfo }
}
