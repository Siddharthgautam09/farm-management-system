import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SlaughterReportForm } from '@/components/forms/SlaughterReportForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function NewSlaughterReportPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get alive, unsold animals
  const { data: animals } = await supabase
    .from('animals')
    .select('id, animal_id, category, entry_weight')
    .eq('is_alive', true)
    .eq('is_sold', false)
    .order('animal_id')

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
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/protected/reports/slaughter">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">New Slaughter Report</h1>
          <p className="text-gray-600 mt-1">
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
