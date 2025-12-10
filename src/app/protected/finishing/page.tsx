import { createClient } from '@/lib/supabase/server'
import { RoomGrid } from '@/components/rooms/RoomGrid'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/ui/back-button'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function FinishingPage() {
  const supabase = await createClient()

  // Get finishing stage
  const { data: stage } = await supabase
    .from('stages')
    .select('id, display_name')
    .eq('name', 'finishing')
    .single()

  if (!stage) {
    return <div>Error loading stage</div>
  }

  // Get rooms for this stage
  const { data: rooms } = await supabase
    .from('rooms')
    .select(`
      id,
      identifier,
      capacity,
      current_count,
      stage_id,
      stage:stages(name, display_name)
    `)
    .eq('stage_id', stage.id)
    .eq('is_active', true)
    .order('identifier')

  // Get all rooms for the modal
  const { data: allRooms } = await supabase
    .from('rooms')
    .select('*')
    .eq('is_active', true)
    .order('identifier')

  // Get all stages for the modal
  const { data: stages } = await supabase
    .from('stages')
    .select('*')
    .order('name')

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3 sm:gap-4">
        <BackButton 
          href="/protected/dashboard"
          variant="ghost"
          size="icon"
          className="h-9 w-9 sm:h-10 sm:w-10 shrink-0"
        />
        <div className="flex-1 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold">{stage.display_name}</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Rooms 13-28</p>
        </div>
        <Button asChild className="w-auto h-10 sm:h-11 text-sm sm:text-base shrink-0">
          <Link href="/animals/new">
            <Plus className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Add Animal</span>
            <span className="sm:hidden">Add</span>
          </Link>
        </Button>
      </div>

      <RoomGrid 
        rooms={rooms || []} 
        stageName="finishing" 
        allRooms={allRooms || []}
        stages={stages || []}
      />
    </div>
  )
}
