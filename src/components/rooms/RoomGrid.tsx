import { RoomCard } from './RoomCard'

type Room = {
  id: string
  identifier: string
  capacity: number
  current_count: number
  stage_id?: string
  stage: {
    name: string
    display_name: string
  }
}

type AllRoom = {
  id: string
  identifier: string
  capacity: number
  current_count: number
  stage_id: string
}

type Stage = {
  id: string
  name: string
  display_name: string
}

type RoomGridProps = {
  rooms: Room[]
  stageName: string
  allRooms?: AllRoom[]
  stages?: Stage[]
}

export function RoomGrid({ rooms, stageName, allRooms = [], stages = [] }: RoomGridProps) {
  if (rooms.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12">
        <p className="text-sm sm:text-base text-gray-500">No rooms available in the {stageName} stage</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
      {rooms.map((room) => (
        <RoomCard 
          key={room.id} 
          room={room} 
          rooms={allRooms}
          stages={stages}
        />
      ))}
    </div>
  )
}
