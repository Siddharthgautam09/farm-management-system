import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DeathReportForm } from '@/components/reports/DeathReportForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function NewDeathReportPage() {
  console.log('=== NEW DEATH REPORT PAGE ===')
  
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  console.log('✅ User authenticated for new report:', user.id)

  // Get ALL animals (remove restrictions to test)
  const { data: animals, error: animalsError } = await supabase
    .from('animals')
    .select('id, animal_id, category')
    .order('animal_id')

  console.log('📋 Animals available for death report:')
  console.log('- Count:', animals?.length || 0)
  console.log('- Error:', animalsError?.message || 'none')
  
  if (animals && animals.length > 0) {
    console.log('- Sample animals:', animals.slice(0, 3))
  }

  if (!animals || animals.length === 0) {
    return (
      <div className="container mx-auto py-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>No Animals Available</CardTitle>
            <CardDescription>
              There are no animals available for death reporting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              All animals are either already sold or deceased.
            </p>
            <Button asChild>
              <Link href="/protected/animals/new">Register New Animal</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/protected/reports/death">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">New Death Report</h1>
          <p className="text-gray-600 mt-1">
            Record an animal death
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Death Report Details</CardTitle>
          <CardDescription>
            Fill in the death information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DeathReportForm animals={animals} />
        </CardContent>
      </Card>
    </div>
  )
}
