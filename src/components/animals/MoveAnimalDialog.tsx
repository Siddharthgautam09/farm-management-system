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
import { useToast } from '@/hooks/use-toast'

type Stage = {
  id: string
  name: string
  display_name: string
}

type Room = {
  id: string
  identifier: string
  stage_id: string
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

  async function handleMove() {
    if (!selectedStageId || !selectedRoomId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select both stage and room',
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
          description: 'Animal moved successfully',
        })
        setOpen(false)
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move Animal</DialogTitle>
          <DialogDescription>
            Select the destination stage and room for this animal
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
                <SelectValue placeholder="Select room" />
              </SelectTrigger>
              <SelectContent>
                {availableRooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    Room {room.identifier}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleMove} disabled={isMoving}>
            {isMoving ? 'Moving...' : 'Move Animal'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
