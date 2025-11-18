import { createClient } from '@/lib/supabase/server'
import { RoomGrid } from '@/components/rooms/RoomGrid'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function ReceivingPage() {
  const supabase = await createClient()

  // Get receiving stage
  const { data: stage } = await supabase
    .from('stages')
    .select('id, display_name')
    .eq('name', 'receiving')
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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold">{stage.display_name}</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Rooms A-E</p>
        </div>
        <Button asChild className="w-full sm:w-auto h-10 sm:h-11 text-sm sm:text-base">
          <Link href="/animals/new">
            <Plus className="h-4 w-4 mr-1 sm:mr-2" />
            Add Animal
          </Link>
        </Button>
      </div>

      <RoomGrid rooms={rooms || []} stageName="receiving" />
    </div>
  )
}
