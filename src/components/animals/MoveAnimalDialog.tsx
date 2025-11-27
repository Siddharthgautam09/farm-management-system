'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { moveAnimal } from '@/actions/animals'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { Info, Users, MoveRight } from 'lucide-react'

type Stage = {
  id: string
  name: string
  display_name: string
}

type Room = {
  id: string
  identifier: string
  stage_id: string
  current_count: number
  capacity: number
}

type MoveAnimalDialogProps = {
  animalId: string
  currentStageId: string
  stages: Stage[]
  rooms: Room[]
  children: React.ReactNode
}

export function MoveAnimalDialog({
  animalId,
  currentStageId,
  stages,
  rooms,
  children,
}: MoveAnimalDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedStageId, setSelectedStageId] = useState('')
  const [selectedRoomId, setSelectedRoomId] = useState('')
  const [isMoving, setIsMoving] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const availableRooms = rooms.filter(room => room.stage_id === selectedStageId)
  const selectedRoom = availableRooms.find(room => room.id === selectedRoomId)
  const selectedStage = stages.find(stage => stage.id === selectedStageId)
  
  // Check if selected room is at capacity
  const isRoomFull = selectedRoom && selectedRoom.current_count >= selectedRoom.capacity
  const canMove = selectedStageId && selectedRoomId && !isRoomFull

  async function handleMove() {
    if (!canMove) {
      toast({
        variant: 'destructive',
        title: 'Cannot Move Animal',
        description: isRoomFull ? 'Selected room is at full capacity' : 'Please select both stage and room',
      })
      return
    }

    setIsMoving(true)
    try {
      const result = await moveAnimal(animalId, selectedStageId, selectedRoomId)
      
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        })
      } else {
        toast({
          title: 'Success',
          description: `Animal moved to ${selectedStage?.display_name} - Room ${selectedRoom?.identifier}`,
        })
        setOpen(false)
        setSelectedStageId('')
        setSelectedRoomId('')
        router.refresh()
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to move animal',
      })
    } finally {
      setIsMoving(false)
    }
  }

  function handleClose() {
    setOpen(false)
    setSelectedStageId('')
    setSelectedRoomId('')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MoveRight className="h-5 w-5" />
            Move Animal
          </DialogTitle>
          <DialogDescription>
            Select the destination stage and room for this animal. Room capacities are shown to help you choose.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Destination Stage</Label>
            <Select 
              value={selectedStageId} 
              onValueChange={(value) => {
                setSelectedStageId(value)
                setSelectedRoomId('') // Reset room selection
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent>
                {stages.map((stage) => (
                  <SelectItem 
                    key={stage.id} 
                    value={stage.id}
                    disabled={stage.id === currentStageId}
                  >
                    {stage.display_name}
                    {stage.id === currentStageId && ' (Current)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Destination Room</Label>
            <Select 
              value={selectedRoomId} 
              onValueChange={setSelectedRoomId}
              disabled={!selectedStageId}
            >
              <SelectTrigger>
                <SelectValue placeholder={!selectedStageId ? "Select stage first" : "Select room"} />
              </SelectTrigger>
              <SelectContent>
                {availableRooms.length === 0 ? (
                  <div className="px-2 py-1.5 text-sm text-gray-500">
                    No rooms available for this stage
                  </div>
                ) : (
                  availableRooms.map((room) => {
                    const isFull = room.current_count >= room.capacity
                    const occupancyRate = room.capacity > 0 ? (room.current_count / room.capacity) * 100 : 0
                    
                    return (
                      <SelectItem 
                        key={room.id} 
                        value={room.id}
                        disabled={isFull}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>Room {room.identifier}</span>
                          <div className="flex items-center gap-2 ml-2">
                            <Badge 
                              variant={isFull ? "destructive" : occupancyRate > 80 ? "secondary" : "outline"}
                              className="text-xs"
                            >
                              <Users className="h-3 w-3 mr-1" />
                              {room.current_count}/{room.capacity}
                            </Badge>
                          </div>
                        </div>
                      </SelectItem>
                    )
                  })
                )}
              </SelectContent>
            </Select>
            
            {selectedStageId && availableRooms.length === 0 && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  No rooms available in the selected stage. Please contact your administrator to set up rooms.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {selectedRoom && (
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">Room Details</h4>
                  <Badge variant={isRoomFull ? "destructive" : "outline"}>
                    {isRoomFull ? "Full" : "Available"}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Room:</span>
                    <p className="font-medium">{selectedRoom.identifier}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Occupancy:</span>
                    <p className="font-medium">{selectedRoom.current_count}/{selectedRoom.capacity}</p>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        isRoomFull ? 'bg-red-500' : 
                        (selectedRoom.current_count / selectedRoom.capacity) > 0.8 ? 'bg-yellow-500' : 
                        'bg-green-500'
                      }`}
                      style={{ 
                        width: `${Math.min((selectedRoom.current_count / selectedRoom.capacity) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {isRoomFull && (
                <Alert variant="destructive">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    This room is at full capacity. Please select a different room.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleMove} disabled={!canMove || isMoving}>
            {isMoving ? 'Moving...' : 'Move Animal'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
