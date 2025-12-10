'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Eye, Plus } from 'lucide-react'
import Link from 'next/link'

type Room = {
  id: string
  identifier: string
  capacity: number
  current_count: number
  stage?: {
    name: string
    display_name: string
  }
}

type RoomCardProps = {
  room: Room
}

export function RoomCard({ room }: RoomCardProps) {
  const router = useRouter()
  const occupancyRate = (room.current_count / room.capacity) * 100
  
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="flex items-center justify-between text-base sm:text-lg">
          <span>Room {room.identifier}</span>
          <Badge 
            variant={occupancyRate > 90 ? 'destructive' : 'default'}
            className="text-xs sm:text-sm"
          >
            {room.current_count}/{room.capacity}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all ${
                occupancyRate > 90 ? 'bg-red-500' : 
                occupancyRate > 70 ? 'bg-yellow-500' : 
                'bg-green-500'
              }`}
              style={{ width: `${occupancyRate}%` }}
            />
          </div>
          <p className="text-xs sm:text-sm text-gray-600">
            {occupancyRate.toFixed(0)}% Occupied
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-9 text-xs sm:text-sm"
            onClick={() => router.push(`/rooms/${room.id}`)}
          >
            <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            View
          </Button>
          <Button
            variant="default"
            size="sm"
            className="flex-1 h-9 text-xs sm:text-sm"
            asChild
          >
            <Link href="/protected/animals">
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Add
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
