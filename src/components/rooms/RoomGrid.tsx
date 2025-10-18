import { RoomCard } from './RoomCard'

type Room = {
  id: string
  identifier: string
  capacity: number
  current_count: number
  stage: {
    name: string
    display_name: string
  }
}

type RoomGridProps = {
  rooms: Room[]
  stageName: string
}

export function RoomGrid({ rooms, stageName }: RoomGridProps) {
  if (rooms.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No rooms available in the {stageName} stage</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {rooms.map((room) => (
        <RoomCard key={room.id} room={room} />
      ))}
    </div>
  )
}
