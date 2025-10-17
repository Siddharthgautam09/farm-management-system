'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'

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

export function RoomCard({ room }: { room: Room }) {
  const router = useRouter()
  const occupancyRate = (room.current_count / room.capacity) * 100
  
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => router.push(`/dashboard/${room.stage.name}/${room.id}`)}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Room {room.identifier}</span>
          <Badge variant={occupancyRate > 90 ? 'destructive' : 'default'}>
            {room.current_count}/{room.capacity}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                occupancyRate > 90 ? 'bg-red-500' : 
                occupancyRate > 70 ? 'bg-yellow-500' : 
                'bg-green-500'
              }`}
              style={{ width: `${occupancyRate}%` }}
            />
          </div>
          <p className="text-sm text-gray-600">
            {occupancyRate.toFixed(0)}% Occupied
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
