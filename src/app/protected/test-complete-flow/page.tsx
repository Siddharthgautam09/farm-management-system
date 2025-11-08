import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createSlaughterReport } from '@/actions/slaughter'
import { revalidatePath } from 'next/cache'

// Force dynamic
export const dynamic = 'force-dynamic'

async function handleCreateTestReport() {
  'use server'
  
  console.log('=== CREATING TEST SLAUGHTER REPORT ===')
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    console.error('❌ User not authenticated')
    return
  }

  // Get first available animal
  const { data: animals } = await supabase
    .from('animals')
    .select('id, animal_id, category')
    .limit(1)

  if (!animals || animals.length === 0) {
    console.error('❌ No animals found')
    return
  }

  const animal = animals[0]
  console.log('🐄 Using animal:', animal)

  // Create test report using the action
  const result = await createSlaughterReport({
    animal_id: animal.id,
    slaughter_date: new Date().toISOString().split('T')[0],
    slaughter_weight: 120,
    carcass_weight: 72,
    selling_price: 800
  })

  console.log('📊 Test report result:', result)

  // Force page refresh
  revalidatePath('/protected/test-complete-flow', 'page')
}

export default async function TestCompleteFlowPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  // Get current reports
  const { data: reports } = await supabase
    .from('slaughter_reports')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  // Get animals
  const { data: animals } = await supabase
    .from('animals')
    .select('id, animal_id, category')

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Complete Slaughter Report Flow Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Create Test Report */}
          <div className="border p-4 rounded">
            <h3 className="font-bold mb-4">Step 1: Create Test Report</h3>
            <form action={handleCreateTestReport}>
              <Button type="submit" size="lg">
                ✨ Create Test Slaughter Report
              </Button>
            </form>
          </div>

          {/* Step 2: View Reports */}
          <div className="border p-4 rounded">
            <h3 className="font-bold mb-4">Step 2: View Reports</h3>
            <div className="space-y-2">
              <Button asChild>
                <a href="/protected/reports/slaughter/new">
                  📝 Create New Report (Form)
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href="/protected/reports/slaughter">
                  📊 View All Reports
                </a>
              </Button>
            </div>
          </div>

          {/* Current Status */}
          <div className="border p-4 rounded bg-blue-50">
            <h3 className="font-bold mb-4">📈 Current Status</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p><strong>Animals Available:</strong> {animals?.length || 0}</p>
                {animals && animals.length > 0 && (
                  <ul className="text-sm text-gray-600 ml-4">
                    {animals.slice(0, 3).map(animal => (
                      <li key={animal.id}>• {animal.animal_id} ({animal.category})</li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <p><strong>Reports Created:</strong> {reports?.length || 0}</p>
                {reports && reports.length > 0 && (
                  <ul className="text-sm text-gray-600 ml-4">
                    {reports.map(report => (
                      <li key={report.id}>
                        • Animal {report.animal_id} - ${report.selling_price} ({new Date(report.created_at).toLocaleDateString()})
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="border p-4 rounded bg-green-50">
            <h3 className="font-bold mb-4">🎯 Instructions</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Click &ldquo;Create Test Slaughter Report&rdquo; to create a test report</li>
              <li>Go to &ldquo;View All Reports&rdquo; to see it in the list</li>
              <li>Use &ldquo;Create New Report (Form)&rdquo; to create reports manually</li>
              <li>Check that reports appear immediately after creation</li>
              <li>Test export functionality on the reports page</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}