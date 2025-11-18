import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { InventoryForm } from '@/components/inventory/InventoryForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BackButton } from '@/components/ui/back-button'

export default async function NewInventoryPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <div className="flex items-center justify-center gap-4 mb-6">
        <BackButton href="/protected/inventory" />
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold">Add Inventory Item</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Add a new item to your inventory
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Item Details</CardTitle>
          <CardDescription>
            Fill in the inventory item information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InventoryForm />
        </CardContent>
      </Card>
    </div>
  )
}
