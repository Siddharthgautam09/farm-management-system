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
import { FeedingLogForm } from '@/components/animals/FeedingLogForm'

type FeedingLogDialogProps = {
  animalId: string
  roomId: string
  stageId: string
  children: React.ReactNode
}

export function FeedingLogDialog({ animalId, roomId, stageId, children }: FeedingLogDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Feeding Log</DialogTitle>
          <DialogDescription>
            Record feeding information for this animal
          </DialogDescription>
        </DialogHeader>
        <FeedingLogForm 
          animalId={animalId}
          roomId={roomId}
          stageId={stageId}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
