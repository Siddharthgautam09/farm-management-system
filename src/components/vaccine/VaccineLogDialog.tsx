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
import { VaccineLogForm } from '@/components/animals/VaccineLogForm'

type VaccineLogDialogProps = {
  animalId: string
  children: React.ReactNode
}

export function VaccineLogDialog({ animalId, children }: VaccineLogDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Vaccine Log</DialogTitle>
          <DialogDescription>
            Record vaccination information for this animal
          </DialogDescription>
        </DialogHeader>
        <VaccineLogForm 
          animalId={animalId}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
