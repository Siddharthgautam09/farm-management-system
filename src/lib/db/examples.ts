/**
 * Offline-First Example Usage Guide
 * 
 * This file demonstrates how to use the offline-first services
 * in your components and actions.
 */

import { 
  animalService, 
  weightService, 
  feedingService,
  medicineService,
  vaccineService,
  inventoryService 
} from '@/lib/db/offlineService'

// ===================================
// Example 1: Create Animal Offline
// ===================================

async function createAnimalExample() {
  const newAnimal = {
    id: crypto.randomUUID(),
    animal_id: 'A001',
    category: 'beef' as const,
    entry_date: new Date().toISOString(),
    entry_weight: 250,
    age_months: 12,
    purchase_price: 1500,
    is_alive: true,
    is_sold: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  const result = await animalService.create(newAnimal)
  
  if (result.error) {
    console.error('Error:', result.error)
  } else {
    console.log('Animal created:', result.data)
    // Will sync to server when online
  }
}

// ===================================
// Example 2: Get All Animals (Offline-First)
// ===================================

async function getAllAnimalsExample() {
  // This will:
  // 1. Try to fetch from server if online
  // 2. Update local cache
  // 3. Return cached data if offline
  
  const result = await animalService.getAll()
  
  if (result.error) {
    console.error('Error:', result.error)
  } else {
    console.log('Animals:', result.data)
  }
}

// ===================================
// Example 3: Update Animal Offline
// ===================================

async function updateAnimalExample(animalId: string) {
  const result = await animalService.update(animalId, {
    entry_weight: 300,
    updated_at: new Date().toISOString()
  })
  
  if (result.error) {
    console.error('Error:', result.error)
  } else {
    console.log('Animal updated:', result.data)
    // Will sync to server when online
  }
}

// ===================================
// Example 4: Query Animals by Category
// ===================================

async function queryAnimalsExample() {
  const result = await animalService.query({
    category: 'beef',
    is_alive: true
  })
  
  if (result.error) {
    console.error('Error:', result.error)
  } else {
    console.log('Beef animals:', result.data)
  }
}

// ===================================
// Example 5: Add Weight Record Offline
// ===================================

async function addWeightRecordExample(animalId: string) {
  const newWeight = {
    id: crypto.randomUUID(),
    animal_id: animalId,
    recorded_date: new Date().toISOString(),
    weight: 320,
    notes: 'Healthy growth',
    created_at: new Date().toISOString()
  }

  const result = await weightService.create(newWeight)
  
  if (result.error) {
    console.error('Error:', result.error)
  } else {
    console.log('Weight recorded:', result.data)
  }
}

// ===================================
// Example 6: Add Feeding Log Offline
// ===================================

async function addFeedingLogExample(roomId: string, stageId: string) {
  const feedingLog = {
    id: crypto.randomUUID(),
    room_id: roomId,
    stage_id: stageId,
    feed_type: 'mcr',
    daily_use: 50,
    date_of_use: new Date().toISOString(),
    mcr_price: 25.50,
    created_at: new Date().toISOString()
  }

  const result = await feedingService.create(feedingLog)
  
  if (result.error) {
    console.error('Error:', result.error)
  } else {
    console.log('Feeding log created:', result.data)
  }
}

// ===================================
// Example 7: Using in React Component
// ===================================

// Note: To use in React components, create a .tsx file with this code:
/*
'use client'

import { useOfflineFirst } from '@/lib/db/offlineService'
import { animalService } from '@/lib/db/offlineService'

function AnimalsListComponent() {
  const { data: animals, loading, error, refetch } = useOfflineFirst(animalService)

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <button onClick={refetch}>Refresh</button>
      {animals?.map(animal => (
        <div key={animal.id}>
          {animal.animal_id} - {animal.category}
        </div>
      ))}
    </div>
  )
}
*/

// ===================================
// Example 8: Using with Filters
// ===================================

// Note: To use in React components, create a .tsx file with this code:
/*
'use client'

import { useOfflineFirst } from '@/lib/db/offlineService'
import { animalService } from '@/lib/db/offlineService'

function BeefAnimalsComponent() {
  const { data: beefAnimals, loading, error } = useOfflineFirst(
    animalService,
    { category: 'beef', is_alive: true }
  )

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      {beefAnimals?.map(animal => (
        <div key={animal.id}>
          {animal.animal_id} - {animal.category}
        </div>
      ))}
    </div>
  )
}
*/

// ===================================
// Example 9: Delete Animal Offline
// ===================================

async function deleteAnimalExample(animalId: string) {
  const result = await animalService.delete(animalId)
  
  if (result.error) {
    console.error('Error:', result.error)
  } else {
    console.log('Animal deleted successfully')
    // Will sync deletion to server when online
  }
}

// ===================================
// Example 10: Medicine Log Offline
// ===================================

async function addMedicineLogExample(animalId: string, roomId: string, stageId: string) {
  const medicineLog = {
    id: crypto.randomUUID(),
    animal_id: animalId,
    room_id: roomId,
    stage_id: stageId,
    drug_name: 'Penicillin',
    drug_type: 'antibiotic',
    drug_dose: 10,
    drug_price: 50,
    treatment_days: 7,
    treatment_start_date: new Date().toISOString(),
    illness: 'Infection',
    created_at: new Date().toISOString()
  }

  const result = await medicineService.create(medicineLog)
  
  if (result.error) {
    console.error('Error:', result.error)
  } else {
    console.log('Medicine log created:', result.data)
  }
}

// ===================================
// Example 11: Vaccine Log Offline
// ===================================

async function addVaccineLogExample(animalId: string, roomId: string, stageId: string) {
  const vaccineLog = {
    id: crypto.randomUUID(),
    animal_id: animalId,
    room_id: roomId,
    stage_id: stageId,
    vaccine_name: 'Foot and Mouth Disease',
    vaccine_dose: 2,
    vaccine_price: 75,
    vaccine_company: 'VetPharma',
    first_dose_date: new Date().toISOString(),
    created_at: new Date().toISOString()
  }

  const result = await vaccineService.create(vaccineLog)
  
  if (result.error) {
    console.error('Error:', result.error)
  } else {
    console.log('Vaccine log created:', result.data)
  }
}

// ===================================
// Example 12: Inventory Management Offline
// ===================================

async function updateInventoryExample() {
  const newItem = {
    id: crypto.randomUUID(),
    item_name: 'Feed - MCR',
    category: 'feed',
    quantity: 1000,
    unit: 'kg',
    minimum_stock_level: 200,
    cost_per_unit: 0.50,
    supplier: 'Farm Supplies Inc',
    last_restocked: new Date().toISOString(),
    created_at: new Date().toISOString()
  }

  const result = await inventoryService.create(newItem)
  
  if (result.error) {
    console.error('Error:', result.error)
  } else {
    console.log('Inventory item created:', result.data)
  }
}

// ===================================
// Example 13: Check Offline Status in Component
// ===================================

// Note: To use in React components, create a .tsx file with this code:
/*
'use client'

import { useOfflineStatus } from '@/hooks/useOffline'

function MyComponent() {
  const { online, syncStatus } = useOfflineStatus()

  return (
    <div>
      <p>Status: {online ? 'Online' : 'Offline'}</p>
      <p>Sync: {syncStatus}</p>
      
      {!online && (
        <div className="bg-yellow-100 p-4 rounded">
          Working offline. Changes will sync when connection is restored.
        </div>
      )}
    </div>
  )
}
*/

// ===================================
// Example 14: Manual Sync Trigger
// ===================================

import { syncService } from '@/lib/db/syncService'

async function manualSyncExample() {
  console.log('Starting manual sync...')
  
  const success = await syncService.forceSyncNow()
  
  if (success) {
    console.log('✅ Sync completed successfully')
  } else {
    console.log('❌ Sync failed')
  }
}

// ===================================
// Example 15: Batch Operations
// ===================================

async function batchCreateAnimalsExample() {
  const animals = [
    { 
      id: crypto.randomUUID(), 
      animal_id: 'A001', 
      category: 'beef' as const,
      entry_date: new Date().toISOString(),
      entry_weight: 250,
      age_months: 12,
      purchase_price: 1500,
      is_alive: true,
      is_sold: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    { 
      id: crypto.randomUUID(), 
      animal_id: 'A002', 
      category: 'beef' as const,
      entry_date: new Date().toISOString(),
      entry_weight: 260,
      age_months: 12,
      purchase_price: 1550,
      is_alive: true,
      is_sold: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    { 
      id: crypto.randomUUID(), 
      animal_id: 'A003', 
      category: 'camel' as const,
      entry_date: new Date().toISOString(),
      entry_weight: 450,
      age_months: 24,
      purchase_price: 3000,
      is_alive: true,
      is_sold: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]

  const results = await Promise.all(
    animals.map(animal => animalService.create(animal))
  )

  const successful = results.filter(r => !r.error)
  const failed = results.filter(r => r.error)

  console.log(`Created ${successful.length} animals`)
  console.log(`Failed ${failed.length} animals`)
}

export {
  createAnimalExample,
  getAllAnimalsExample,
  updateAnimalExample,
  queryAnimalsExample,
  addWeightRecordExample,
  addFeedingLogExample,
  deleteAnimalExample,
  addMedicineLogExample,
  addVaccineLogExample,
  updateInventoryExample,
  manualSyncExample,
  batchCreateAnimalsExample
}
