import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AnimalForm } from '@/components/animals/AnimalForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function NewAnimalPage() {
  const supabase = await createClient()

  // Check auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch stages with error logging
  const { data: stages, error: stagesError } = await supabase
    .from('stages')
    .select('*')
    .order('name')

  // Fetch rooms with error logging
  const { data: rooms, error: roomsError } = await supabase
    .from('rooms')
    .select('*, stage:stages(name, display_name)')
    .eq('is_active', true)
    .order('identifier')

  // Debug logging (check browser console)
  console.log('Stages:', stages)
  console.log('Stages Error:', stagesError)
  console.log('Rooms:', rooms)
  console.log('Rooms Error:', roomsError)

  // Show detailed error if data fetch failed
  if (stagesError || roomsError) {
    return (
      <div className="container mx-auto py-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Error Loading Form</CardTitle>
            <CardDescription>Unable to load required data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stagesError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded">
                  <p className="font-semibold text-red-800">Stages Error:</p>
                  <p className="text-red-600 text-sm">{stagesError.message}</p>
                </div>
              )}
              {roomsError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded">
                  <p className="font-semibold text-red-800">Rooms Error:</p>
                  <p className="text-red-600 text-sm">{roomsError.message}</p>
                </div>
              )}
              <p className="text-sm text-gray-600 mt-4">
                Please check Supabase database to ensure stages and rooms exist.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show error if no data exists
  if (!stages || stages.length === 0) {
    return (
      <div className="container mx-auto py-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>No Stages Found</CardTitle>
            <CardDescription>Please create stages in the database first</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Run the SQL script in Supabase to create stages and rooms.
            </p>
            <pre className="mt-4 p-4 bg-gray-100 rounded text-xs">
              {`SELECT * FROM stages;`}
            </pre>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!rooms || rooms.length === 0) {
    return (
      <div className="container mx-auto py-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>No Rooms Found</CardTitle>
            <CardDescription>Please create rooms in the database first</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Stages exist but no rooms found. Run the SQL script to create rooms.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Found {stages.length} stages but 0 rooms.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Register New Animal</h1>
          <p className="text-gray-600 mt-1">
            Add a new animal to the farm management system
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Animal Information</CardTitle>
          <CardDescription>
            Fill in the details below to register a new animal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AnimalForm stages={stages} rooms={rooms} />
        </CardContent>
      </Card>
    </div>
  )
}
