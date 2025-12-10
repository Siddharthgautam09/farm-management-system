'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, X } from 'lucide-react'
import { DeathReportForm } from '@/components/reports/DeathReportForm'
import { useRouter } from 'next/navigation'

type Animal = {
  id: string
  animal_id: string
  category: string
}

type AddDeathReportModalProps = {
  animals: Animal[]
}

export function AddDeathReportModal({ animals }: AddDeathReportModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleSuccess = () => {
    setIsOpen(false)
    router.refresh()
  }

  if (!animals || animals.length === 0) {
    return (
      <Button disabled className="h-9 sm:h-10 text-sm sm:text-base">
        <Plus className="h-4 w-4 mr-1 sm:mr-2" />
        <span className="hidden sm:inline">New Report</span>
        <span className="sm:hidden">New</span>
      </Button>
    )
  }

  return (
    <>
      <Button className="h-9 sm:h-10 text-sm sm:text-base" onClick={() => setIsOpen(true)}>
        <Plus className="h-4 w-4 mr-1 sm:mr-2" />
        <span className="hidden sm:inline">New Report</span>
        <span className="sm:hidden">New</span>
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
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-xl z-10">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <Plus className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">New Death Report</h2>
                    <p className="text-sm text-gray-500">Record an animal death</p>
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
                <DeathReportForm 
                  animals={animals}
                  onSuccess={handleSuccess}
                  onCancel={() => setIsOpen(false)}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
