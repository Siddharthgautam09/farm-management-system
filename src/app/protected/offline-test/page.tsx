'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useOfflineStatus, useIndexedDB } from '@/hooks/useOffline'
import { animalService } from '@/lib/db/offlineService'
import { syncService } from '@/lib/db/syncService'
import { db, clearAllData } from '@/lib/db/indexedDB'
import { CheckCircle, XCircle, RefreshCw, Database, Trash2, Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function OfflineTestPage() {
  const { online, syncStatus } = useOfflineStatus()
  const { dbInfo, refreshInfo } = useIndexedDB()
  const { toast } = useToast()
  const [testResults, setTestResults] = useState<{ test: string; passed: boolean; message: string }[]>([])
  const [testing, setTesting] = useState(false)

  const runTests = async () => {
    setTesting(true)
    const results: { test: string; passed: boolean; message: string }[] = []

    try {
      // Test 1: Create animal offline
      const testAnimal = {
        id: crypto.randomUUID(),
        animal_id: `TEST${Date.now()}`,
        category: 'beef' as const,
        entry_date: new Date().toISOString(),
        is_alive: true,
        is_sold: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const createResult = await animalService.create(testAnimal)
      results.push({
        test: 'Create Animal',
        passed: !createResult.error,
        message: createResult.error || `Created animal ${testAnimal.animal_id}`
      })

      // Test 2: Read animal
      const readResult = await animalService.getById(testAnimal.id)
      results.push({
        test: 'Read Animal',
        passed: !readResult.error && readResult.data?.id === testAnimal.id,
        message: readResult.error || `Found animal ${readResult.data?.animal_id}`
      })

      // Test 3: Update animal
      const updateResult = await animalService.update(testAnimal.id, {
        entry_weight: 250,
        updated_at: new Date().toISOString()
      })
      results.push({
        test: 'Update Animal',
        passed: !updateResult.error,
        message: updateResult.error || 'Animal updated successfully'
      })

      // Test 4: Query animals
      const queryResult = await animalService.query({ category: 'beef' })
      results.push({
        test: 'Query Animals',
        passed: !queryResult.error && (queryResult.data?.length || 0) > 0,
        message: queryResult.error || `Found ${queryResult.data?.length} beef animals`
      })

      // Test 5: Check sync queue
      const syncQueue = await db.syncQueue.toArray()
      results.push({
        test: 'Sync Queue',
        passed: true,
        message: `${syncQueue.length} items in sync queue`
      })

      // Test 6: Delete test animal
      const deleteResult = await animalService.delete(testAnimal.id)
      results.push({
        test: 'Delete Animal',
        passed: !deleteResult.error,
        message: deleteResult.error || 'Animal deleted successfully'
      })

      setTestResults(results)
      await refreshInfo()
      
      toast({
        title: '✅ Tests Complete',
        description: `${results.filter(r => r.passed).length}/${results.length} tests passed`
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      toast({
        title: '❌ Tests Failed',
        description: errorMessage,
        variant: 'destructive'
      })
    } finally {
      setTesting(false)
    }
  }

  const handleManualSync = async () => {
    toast({
      title: '🔄 Syncing...',
      description: 'Synchronizing with server'
    })

    const success = await syncService.forceSyncNow()
    
    if (success) {
      toast({
        title: '✅ Sync Complete',
        description: 'All data synchronized'
      })
      await refreshInfo()
    } else {
      toast({
        title: '❌ Sync Failed',
        description: 'Unable to sync. Check connection.',
        variant: 'destructive'
      })
    }
  }

  const handleClearData = async () => {
    if (confirm('⚠️ This will clear ALL local data. Continue?')) {
      await clearAllData()
      await refreshInfo()
      toast({
        title: '🗑️ Data Cleared',
        description: 'All local data has been removed'
      })
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Offline Support Test Page</h1>
          <p className="text-gray-600 mt-2">Test and monitor offline features</p>
        </div>
        <Badge 
          variant={online ? 'default' : 'destructive'}
          className="text-lg px-4 py-2"
        >
          {online ? '🟢 Online' : '🔴 Offline'}
        </Badge>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle>Connection & Sync Status</CardTitle>
          <CardDescription>Real-time system status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Connection</p>
              <p className="text-2xl font-bold">
                {online ? '🟢 Online' : '🔴 Offline'}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Sync Status</p>
              <p className="text-2xl font-bold flex items-center gap-2">
                {syncStatus === 'syncing' && <RefreshCw className="h-5 w-5 animate-spin" />}
                {syncStatus === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
                {syncStatus === 'idle' && <CheckCircle className="h-5 w-5 text-green-500" />}
                {syncStatus}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Pending Sync</p>
              <p className="text-2xl font-bold">
                {dbInfo.pendingSync} items
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Database Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            IndexedDB Statistics
          </CardTitle>
          <CardDescription>Local database contents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Animals</p>
              <p className="text-3xl font-bold text-blue-600">{dbInfo.animals}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Weights</p>
              <p className="text-3xl font-bold text-green-600">{dbInfo.weights}</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-gray-600">Feeding</p>
              <p className="text-3xl font-bold text-yellow-600">{dbInfo.feeding}</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Medicine</p>
              <p className="text-3xl font-bold text-purple-600">{dbInfo.medicine}</p>
            </div>
            <div className="text-center p-4 bg-pink-50 rounded-lg">
              <p className="text-sm text-gray-600">Vaccine</p>
              <p className="text-3xl font-bold text-pink-600">{dbInfo.vaccine}</p>
            </div>
            <div className="text-center p-4 bg-indigo-50 rounded-lg">
              <p className="text-sm text-gray-600">Inventory</p>
              <p className="text-3xl font-bold text-indigo-600">{dbInfo.inventory}</p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Storage Used</p>
            <p className="text-lg font-semibold">{dbInfo.databaseSize}</p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
          <CardDescription>Test and manage offline features</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button onClick={runTests} disabled={testing}>
            {testing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Run CRUD Tests
              </>
            )}
          </Button>
          <Button onClick={handleManualSync} disabled={!online || syncStatus === 'syncing'} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync Now
          </Button>
          <Button onClick={refreshInfo} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Stats
          </Button>
          <Button onClick={handleClearData} variant="destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Local Data
          </Button>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              {testResults.filter(r => r.passed).length}/{testResults.length} tests passed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg flex items-start gap-3 ${
                    result.passed ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  {result.passed ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  )}
                  <div>
                    <p className="font-semibold">{result.test}</p>
                    <p className="text-sm text-gray-600">{result.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>📖 Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="font-semibold">✅ What to Test</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Click &quot;Run CRUD Tests&quot; to test offline operations</li>
              <li>Disconnect internet and run tests again</li>
              <li>Reconnect and click &quot;Sync Now&quot; to sync changes</li>
              <li>Check the offline indicator in bottom-right corner</li>
            </ul>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg">
            <p className="font-semibold">🔍 How to Test Offline</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Open DevTools (F12) → Network tab</li>
              <li>Select &quot;Offline&quot; from throttling dropdown</li>
              <li>App should show &quot;🔴 Offline&quot; badge</li>
              <li>All operations still work!</li>
            </ul>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="font-semibold">💾 IndexedDB Browser</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>DevTools → Application → IndexedDB</li>
              <li>Open &quot;FarmManagementDB&quot;</li>
              <li>View all tables and data</li>
              <li>Check &quot;syncQueue&quot; for pending items</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
