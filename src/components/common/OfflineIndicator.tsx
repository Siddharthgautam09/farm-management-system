'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Wifi, WifiOff, RefreshCw, Database, CheckCircle, XCircle, Clock } from 'lucide-react'
import { useOfflineStatus, useIndexedDB } from '@/hooks/useOffline'
import { syncService } from '@/lib/db/syncService'
import { useToast } from '@/hooks/use-toast'

export function OfflineIndicator() {
  const { online, syncStatus } = useOfflineStatus()
  const [showDetails, setShowDetails] = useState(false)
  const { dbInfo, refreshInfo } = useIndexedDB()
  const { toast } = useToast()

  const handleSync = async () => {
    toast({
      title: '🔄 Syncing...',
      description: 'Synchronizing with server'
    })

    const success = await syncService.forceSyncNow()
    
    if (success) {
      toast({
        title: '✅ Sync Complete',
        description: 'All data synchronized successfully'
      })
      refreshInfo()
    } else {
      toast({
        title: '❌ Sync Failed',
        description: 'Unable to sync. Check connection.',
        variant: 'destructive'
      })
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="flex flex-col items-end gap-2">
        {/* Status Badge */}
        <Badge 
          variant={online ? 'default' : 'destructive'}
          className="cursor-pointer flex items-center gap-2 px-3 py-1.5 shadow-lg"
          onClick={() => setShowDetails(!showDetails)}
        >
          {online ? (
            <>
              <Wifi className="h-4 w-4" />
              <span>Online</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4" />
              <span>Offline</span>
            </>
          )}
          
          {syncStatus === 'syncing' && (
            <RefreshCw className="h-3 w-3 animate-spin ml-1" />
          )}
          
          {syncStatus === 'error' && (
            <XCircle className="h-3 w-3 ml-1" />
          )}
        </Badge>

        {/* Details Panel */}
        {showDetails && (
          <Card className="w-80 shadow-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="h-5 w-5" />
                Offline Storage
              </CardTitle>
              <CardDescription className="text-xs">
                Local database status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Connection Status */}
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                <span className="text-sm font-medium">Connection</span>
                <Badge variant={online ? 'default' : 'destructive'} className="text-xs">
                  {online ? 'Online' : 'Offline'}
                </Badge>
              </div>

              {/* Sync Status */}
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                <span className="text-sm font-medium">Sync Status</span>
                <Badge 
                  variant={
                    syncStatus === 'syncing' ? 'secondary' :
                    syncStatus === 'error' ? 'destructive' : 'default'
                  }
                  className="text-xs flex items-center gap-1"
                >
                  {syncStatus === 'syncing' && <RefreshCw className="h-3 w-3 animate-spin" />}
                  {syncStatus === 'error' && <XCircle className="h-3 w-3" />}
                  {syncStatus === 'idle' && <CheckCircle className="h-3 w-3" />}
                  {syncStatus.charAt(0).toUpperCase() + syncStatus.slice(1)}
                </Badge>
              </div>

              {/* Pending Sync Items */}
              {dbInfo.pendingSync > 0 && (
                <div className="flex items-center justify-between p-2 bg-amber-50 rounded-md border border-amber-200">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-600" />
                    Pending Sync
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {dbInfo.pendingSync} items
                  </Badge>
                </div>
              )}

              {/* Data Stats */}
              <div className="space-y-2 pt-2 border-t">
                <div className="text-xs font-semibold text-gray-600 mb-2">Local Data</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Animals:</span>
                    <span className="font-medium">{dbInfo.animals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Weights:</span>
                    <span className="font-medium">{dbInfo.weights}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Feeding:</span>
                    <span className="font-medium">{dbInfo.feeding}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Medicine:</span>
                    <span className="font-medium">{dbInfo.medicine}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vaccine:</span>
                    <span className="font-medium">{dbInfo.vaccine}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Inventory:</span>
                    <span className="font-medium">{dbInfo.inventory}</span>
                  </div>
                </div>
              </div>

              {/* Database Size */}
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md text-xs">
                <span className="font-medium">Storage Used</span>
                <span className="text-gray-600">{dbInfo.databaseSize}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={refreshInfo}
                  className="flex-1 text-xs"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Refresh
                </Button>
                <Button
                  size="sm"
                  onClick={handleSync}
                  disabled={!online || syncStatus === 'syncing'}
                  className="flex-1 text-xs"
                >
                  {syncStatus === 'syncing' ? (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <Database className="h-3 w-3 mr-1" />
                      Sync Now
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
