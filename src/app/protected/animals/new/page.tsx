import { createClient } from '@/lib/supabase/server'
import { AnimalForm } from '@/components/animals/AnimalForm'
import { redirect } from 'next/navigation'

export default async function NewAnimalPage() {
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch stages
  const { data: stages } = await supabase
    .from('stages')
    .select('*')
    .order('name')

  // Fetch rooms
  const { data: rooms } = await supabase
    .from('rooms')
    .select('*')
    .eq('is_active', true)
    .order('identifier')

  if (!stages || !rooms) {
    return <div>Error loading form data</div>
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Register New Animal</h1>
          <p className="text-gray-600 mt-2">
            Add a new animal to the farm management system
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <AnimalForm rooms={rooms} stages={stages} />
        </div>
      </div>
    </div>
  )
}
