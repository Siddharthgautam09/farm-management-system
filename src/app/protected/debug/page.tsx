import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createTestData } from '@/actions/test-data'

async function CreateTestDataButton() {
  async function handleCreateTestData() {
    'use server'
    const result = await createTestData()
    console.log('Test data creation result:', result)
  }

  return (
    <form action={handleCreateTestData}>
      <Button type="submit" variant="outline">
        Create Test Data
      </Button>
    </form>
  )
}

export default async function DatabaseTestPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  // Test various database queries
  const { data: animals, error: animalsError } = await supabase
    .from('animals')
    .select('*')
    .limit(10)

  const { data: slaughterReports, error: reportsError } = await supabase
    .from('slaughter_reports')
    .select('*')
    .limit(10)

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .limit(5)

  console.log('Database test results:', {
    animals: { count: animals?.length, error: animalsError },
    slaughterReports: { count: slaughterReports?.length, error: reportsError },
    profiles: { count: profiles?.length, error: profilesError }
  })

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Database Connection Test</h1>
        <p className="text-gray-600 mt-2">Testing Supabase database connectivity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Animals Test */}
        <Card>
          <CardHeader>
            <CardTitle>Animals Table</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Count:</strong> {animals?.length || 0}</p>
              <p><strong>Has Error:</strong> {animalsError ? 'Yes' : 'No'}</p>
              {animalsError && (
                <div className="p-2 bg-red-100 rounded text-red-800 text-sm">
                  {animalsError.message}
                </div>
              )}
              {animals && animals.length > 0 && (
                <div>
                  <p className="font-medium">Sample animals:</p>
                  <ul className="text-sm">
                    {animals.slice(0, 3).map((animal: { id: string; animal_id: string; category: string }) => (
                      <li key={animal.id}>
                        {animal.animal_id} - {animal.category}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Slaughter Reports Test */}
        <Card>
          <CardHeader>
            <CardTitle>Slaughter Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Count:</strong> {slaughterReports?.length || 0}</p>
              <p><strong>Has Error:</strong> {reportsError ? 'Yes' : 'No'}</p>
              {reportsError && (
                <div className="p-2 bg-red-100 rounded text-red-800 text-sm">
                  {reportsError.message}
                </div>
              )}
              {slaughterReports && slaughterReports.length > 0 && (
                <div>
                  <p className="font-medium">Sample reports:</p>
                  <ul className="text-sm">
                    {slaughterReports.slice(0, 3).map((report: { 
                      id: string; 
                      animal_id: string; 
                      selling_price: number | null;
                      slaughter_date: string;
                      slaughter_weight: number;
                      carcass_weight: number;
                      carcass_percentage: number | null;
                      created_at: string;
                      created_by: string | null;
                    }) => (
                      <li key={report.id}>
                        {report.animal_id} - ${report.selling_price || 0}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Profiles Test */}
        <Card>
          <CardHeader>
            <CardTitle>Profiles Table</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Count:</strong> {profiles?.length || 0}</p>
              <p><strong>Has Error:</strong> {profilesError ? 'Yes' : 'No'}</p>
              {profilesError && (
                <div className="p-2 bg-red-100 rounded text-red-800 text-sm">
                  {profilesError.message}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>User ID:</strong> {user.id}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Created:</strong> {new Date(user.created_at || '').toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button asChild>
          <a href="/protected/reports/slaughter">Go to Slaughter Reports</a>
        </Button>
        <Button asChild variant="outline">
          <a href="/protected/dashboard">Go to Dashboard</a>
        </Button>
        <CreateTestDataButton />
      </div>
    </div>
  )
}