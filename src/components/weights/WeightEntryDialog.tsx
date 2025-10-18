'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { WeightEntryForm } from './WeightEntryForm'

type WeightEntryDialogProps = {
  animalId: string
  currentStageId: string
  currentRoomId: string
  children: React.ReactNode
}

export function WeightEntryDialog({
  animalId,
  currentStageId,
  currentRoomId,
  children,
}: WeightEntryDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Weight Record</DialogTitle>
          <DialogDescription>
            Record a new weight measurement for this animal
          </DialogDescription>
        </DialogHeader>
        <WeightEntryForm
          animalId={animalId}
          currentStageId={currentStageId}
          currentRoomId={currentRoomId}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
