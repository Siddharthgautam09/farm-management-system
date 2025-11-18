import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SlaughterReportForm } from '@/components/forms/SlaughterReportForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BackButton } from '@/components/ui/back-button'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function NewSlaughterReportPage() {
  console.log('=== NEW SLAUGHTER REPORT PAGE ===')
  
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  console.log('✅ User authenticated for new report:', user.id)

  // Get ALL animals (remove restrictions to test)
  const { data: animals, error: animalsError } = await supabase
    .from('animals')
    .select('id, animal_id, category, entry_weight')
    .order('animal_id')

  console.log('📋 Animals available for slaughter:')
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
              There are no animals available for slaughter reporting
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
      <div className="flex items-center justify-center gap-4 mb-6">
        <BackButton href="/protected/reports/slaughter" />
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold">New Slaughter Report</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Record a slaughter transaction
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Slaughter Details</CardTitle>
          <CardDescription>
            Fill in the slaughter information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SlaughterReportForm animals={animals} />
        </CardContent>
      </Card>
    </div>
  )
}
