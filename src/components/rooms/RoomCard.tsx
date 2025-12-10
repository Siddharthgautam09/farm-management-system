'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Eye, Plus, X } from 'lucide-react'
import { AnimalForm } from '@/components/animals/AnimalForm'
import { useState } from 'react'

type Room = {
  id: string
  identifier: string
  capacity: number
  current_count: number
  stage_id?: string
  stage?: {
    name: string
    display_name: string
  }
}

type FormRoom = {
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

type RoomCardProps = {
  room: Room
  rooms?: FormRoom[]
  stages?: Stage[]
}

export function RoomCard({ room, rooms = [], stages = [] }: RoomCardProps) {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const occupancyRate = (room.current_count / room.capacity) * 100
  
  const handleSuccess = () => {
    setIsModalOpen(false)
    router.refresh()
  }
  
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
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            Add
          </Button>
        </div>
      </CardContent>

      {/* Add Animal Modal */}
      {isModalOpen && (
        <>
          {/* Backdrop with blur */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setIsModalOpen(false)}
          />
          
          {/* Modal Content */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-xl">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Plus className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Add New Animal</h2>
                    <p className="text-sm text-gray-500">Enter animal details below</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsModalOpen(false)}
                  className="h-8 w-8 rounded-full"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <AnimalForm 
                  rooms={rooms} 
                  stages={stages}
                  initialStageId={room.stage_id}
                  initialRoomId={room.id}
                  onSuccessCallback={handleSuccess}
                  onCancelCallback={() => setIsModalOpen(false)}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </Card>
  )
}
