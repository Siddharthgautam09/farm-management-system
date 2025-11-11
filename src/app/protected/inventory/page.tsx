import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, Package, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-gray-600 mt-2">
            Track and manage farm inventory
          </p>
        </div>
        <Button asChild>
          <Link href="/protected/inventory/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Link>
        </Button>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{lowStockItems.length} item(s)</strong> are running low on stock
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalItems}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              ${totalValue.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Low Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {lowStockItems.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {Object.keys(byCategory).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Inventory Items</CardTitle>
          <CardDescription>
            Complete list of inventory with stock levels and filters
          </CardDescription>
        </CardHeader>
        <CardContent>
          {inventory && inventory.length > 0 ? (
            <InventoryTable inventory={inventory} />
          ) : (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No inventory items yet</p>
              <Button asChild>
                <Link href="/protected/inventory/new">
                  <Plus className="h-4 w-4 mr-2" />
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
