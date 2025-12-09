'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, X } from 'lucide-react'
import { InventoryForm } from '@/components/inventory/InventoryForm'
import { useRouter } from 'next/navigation'

export function AddInventoryModal() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleSuccess = () => {
    setIsOpen(false)
    router.refresh()
  }

  return (
    <>
      <Button className="h-9 sm:h-10 text-sm sm:text-base" onClick={() => setIsOpen(true)}>
        <Plus className="h-4 w-4 mr-1 sm:mr-2" />
        <span className="hidden sm:inline">Add Item</span>
        <span className="sm:hidden">Add</span>
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
                  <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Plus className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Add Inventory Item</h2>
                    <p className="text-sm text-gray-500">Enter item details below</p>
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
                <InventoryForm 
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
