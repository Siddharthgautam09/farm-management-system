'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, X } from 'lucide-react'
import { AnimalForm } from '@/components/animals/AnimalForm'
import { useRouter } from 'next/navigation'

type Room = {
  id: string
  identifier: string
  stage_id: string
  current_count: number
  capacity: number
}

type Stage = {
  id: string
  name: string
  display_name: string
}

type AddAnimalModalProps = {
  rooms: Room[]
  stages: Stage[]
}

export function AddAnimalModal({ rooms, stages }: AddAnimalModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleSuccess = () => {
    setIsOpen(false)
    router.refresh()
  }

  return (
    <>
      <Button className="shrink-0" onClick={() => setIsOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Add Animal
      </Button>

      {/* Modal Overlay */}
      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
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
                  onClick={() => setIsOpen(false)}
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
                  onSuccessCallback={handleSuccess}
                  onCancelCallback={() => setIsOpen(false)}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
