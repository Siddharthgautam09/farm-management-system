import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, Package, Plus, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { InventoryTable } from '@/components/inventory/InventoryTable'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function InventoryPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch all inventory items
  const { data: inventory } = await supabase
    .from('inventory')
    .select('*')
    .order('product_name')

  // Calculate statistics
  const totalItems = inventory?.length || 0
  const totalValue = inventory?.reduce((sum, item) => 
    sum + (item.quantity * (item.price || 0)), 0
  ) || 0
  
  const lowStockItems = inventory?.filter(item => 
    item.quantity <= (item.alert_threshold || 10)
  ) || []

  // Group by category
  const byCategory = inventory?.reduce((acc: Record<string, number>, item) => {
    const category = item.category || 'Uncategorized'
    acc[category] = (acc[category] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 sm:gap-4">
        <div className="flex-1 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold">Inventory Management</h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Low Stock Notification Bell */}
          {lowStockItems.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9 sm:h-10 sm:w-10 relative">
                  <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                    {lowStockItems.length}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[calc(100vw-2rem)] sm:w-80 max-w-sm">
                <DropdownMenuLabel className="text-sm sm:text-base">Low Stock Items</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <div className="max-h-[60vh] sm:max-h-96 overflow-y-auto">
                  <div className="p-2.5 sm:p-3">
                    <div className="flex items-start gap-2 mb-3">
                      <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-red-600">
                          Low Stock Alert
                        </p>
                        <p className="text-[10px] sm:text-xs text-gray-600 mt-1">
                          <strong>{lowStockItems.length} inventory item(s)</strong> are running low on stock.
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mt-3">
                      {lowStockItems.slice(0, 5).map((item) => (
                        <div key={item.id} className="p-2 bg-red-50 rounded-md border border-red-100">
                          <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                            {item.product_name}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-[10px] sm:text-xs text-gray-600">
                              Stock: <span className="font-semibold text-red-600">{item.quantity} {item.unit || 'units'}</span>
                            </p>
                            {item.alert_threshold && (
                              <p className="text-[10px] sm:text-xs text-gray-500">
                                Min: {item.alert_threshold}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {lowStockItems.length > 5 && (
                        <p className="text-[10px] sm:text-xs text-gray-500 text-center pt-1">
                          +{lowStockItems.length - 5} more items
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          <Button asChild className="h-9 sm:h-10 text-sm sm:text-base">
            <Link href="/protected/inventory/new">
              <Plus className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Add Item</span>
              <span className="sm:hidden">Add</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
              Total Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl sm:text-2xl font-bold">{totalItems}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl sm:text-2xl font-bold text-green-600 break-words">
              ${totalValue.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
              Low Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl sm:text-2xl font-bold text-red-600">
              {lowStockItems.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl sm:text-2xl font-bold">
              {Object.keys(byCategory).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl flex justify-centerß">All Inventory Items</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          {inventory && inventory.length > 0 ? (
            <InventoryTable inventory={inventory} />
          ) : (
            <div className="text-center py-8 sm:py-12">
              <Package className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <p className="text-sm sm:text-base text-gray-500 mb-3 sm:mb-4">No inventory items yet</p>
              <Button asChild className="h-9 sm:h-10 text-sm sm:text-base">
                <Link href="/protected/inventory/new">
                  <Plus className="h-4 w-4 mr-1 sm:mr-2" />
                  Add First Item
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
