import { useState, useCallback } from 'react'

type Toast = {
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

type ToastState = Toast & { id: string }

export function useToast() {
  const [toasts, setToasts] = useState<ToastState[]>([])

  const toast = useCallback(({ title, description, variant = 'default' }: Toast) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { id, title, description, variant }
    
    setToasts((prev) => [...prev, newToast])
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 5000)
    
    return id
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return {
    toast,
    toasts,
    dismiss,
  }
}
