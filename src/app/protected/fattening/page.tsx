import { createClient } from '@/lib/supabase/server'
import { RoomGrid } from '@/components/rooms/RoomGrid'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function FatteningPage() {
  const supabase = await createClient()

  // Get fattening stage
  const { data: stage } = await supabase
    .from('stages')
    .select('id, display_name')
    .eq('name', 'fattening')
    .single()

  if (!stage) {
    return <div>Error loading stage</div>
  }

  // Get rooms for this stage
  const { data: rooms } = await supabase
    .from('rooms')
    .select(`
      *,
      stage:stages(name, display_name)
    `)
    .eq('stage_id', stage.id)
    .eq('is_active', true)
    .order('identifier')

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{stage.display_name}</h1>
          <p className="text-gray-600 mt-1">Rooms A-E</p>
        </div>
        <Button asChild>
          <Link href="/animals/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Animal
          </Link>
        </Button>
      </div>

      <RoomGrid rooms={rooms || []} stageName="fattening" />
    </div>
  )
}
