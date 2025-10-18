import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ roomId: string }>
}) {
  const { roomId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: room, error } = await supabase
    .from('rooms')
    .select(`
      *,
      stage:stages(*)
    `)
    .eq('id', roomId)
    .single()

  if (error || !room) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/${room.stage.name}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            Room {room.identifier}
          </h1>
          <p className="text-gray-600">
            {room.stage.display_name} • {room.current_count}/{room.capacity} animals
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-center text-gray-500">
          Room detail view - Coming soon
        </p>
        <p className="text-center text-sm text-gray-400 mt-2">
          This will show animals in this room, feeding logs, etc.
        </p>
      </div>
    </div>
  )
}
