import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { InventoryForm } from '@/components/inventory/InventoryForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function NewInventoryPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/protected/inventory">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Add Inventory Item</h1>
          <p className="text-gray-600 mt-1">
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
