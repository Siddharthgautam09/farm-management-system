'use client'

import { useState } from 'react'
import { Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteAnimal } from '@/actions/animals'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

type DeleteAnimalButtonProps = {
  animalId: string
  animalName: string
}

export function DeleteAnimalButton({ animalId, animalName }: DeleteAnimalButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteAnimal(animalId)
      
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        })
      } else {
        toast({
          title: 'Success',
          description: `Animal ${animalName} has been deleted successfully.`,
        })
        setShowDialog(false)
        router.refresh()
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete animal. Please try again.',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => setShowDialog(true)}
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      {/* Confirmation Dialog */}
      {showDialog && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => !isDeleting && setShowDialog(false)}
          />
          
          {/* Dialog Content */}
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Animal</h3>
                <p className="text-sm text-gray-500 mt-1">Are you sure?</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => !isDeleting && setShowDialog(false)}
                disabled={isDeleting}
                className="h-8 w-8 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <p className="text-sm text-gray-600 mb-6">
              This will permanently delete animal <span className="font-semibold">{animalName}</span> and all its related records (movements, feeding logs, medicine logs, vaccine logs, etc.). This action cannot be undone.
            </p>
            
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDialog(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
