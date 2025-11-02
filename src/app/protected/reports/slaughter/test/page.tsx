import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

async function createTestReport() {
  'use server'
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    console.error('Not authenticated')
    return
  }

  // Get first available animal
  const { data: animals } = await supabase
    .from('animals')
    .select('id, animal_id')
    .limit(1)
    .single()

  if (!animals) {
    console.error('No animals found')
    return
  }

  // Create a test slaughter report
  const { data: report, error } = await supabase
    .from('slaughter_reports')
    .insert({
      animal_id: animals.id,
      slaughter_date: new Date().toISOString().split('T')[0],
      slaughter_weight: 100,
      carcass_weight: 60,
      carcass_percentage: 60,
      selling_price: 500,
      created_by: user.id
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating report:', error.message)
    return
  }

  console.log('Test report created:', report)

  // Revalidate the reports page
  revalidatePath('/protected/reports/slaughter', 'page')
}

export default async function TestSlaughterReportPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  // Get all reports
  const { data: reports, error } = await supabase
    .from('slaughter_reports')
    .select(`
      *,
      animal:animals(animal_id, category)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test Slaughter Report Creation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form action={createTestReport}>
            <Button type="submit">
              Create Test Report
            </Button>
          </form>
          
          <div className="mt-4">
            <h3 className="font-bold mb-2">Current Reports: {reports?.length || 0}</h3>
            {error && (
              <p className="text-red-600">Error: {error.message}</p>
            )}
            {reports && reports.length > 0 && (
              <div className="space-y-2">
                {reports.map((report) => (
                  <div key={report.id} className="p-2 bg-gray-100 rounded">
                    <p><strong>ID:</strong> {report.id}</p>
                    <p><strong>Animal:</strong> {report.animal?.animal_id}</p>
                    <p><strong>Date:</strong> {report.slaughter_date}</p>
                    <p><strong>Weight:</strong> {report.slaughter_weight} kg</p>
                    <p><strong>Price:</strong> ${report.selling_price}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mt-4">
        <Button asChild>
          <a href="/protected/reports/slaughter">
            Go to Slaughter Reports Page
          </a>
        </Button>
      </div>
    </div>
  )
}
