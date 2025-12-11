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
import { MedicineLogForm } from '@/components/animals/MedicineLogForm'

type MedicineLogDialogProps = {
  animalId: string
  roomId: string
  stageId: string
  children: React.ReactNode
}

export function MedicineLogDialog({ animalId, roomId, stageId, children }: MedicineLogDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Medicine Log</DialogTitle>
          <DialogDescription>
            Record medicine/treatment information for this animal
          </DialogDescription>
        </DialogHeader>
        <MedicineLogForm 
          animalId={animalId}
          roomId={roomId}
          stageId={stageId}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
