'use client'

import { useState, useTransition } from 'react'
import { signIn } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

export function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)

    startTransition(async () => {
      const result = await signIn(formData)

      if (result?.error) {
        setError(result.error)
        setIsLoading(false)
      }
      // If successful, loading state stays active until navigation completes
    })
  }

  const loading = isLoading || isPending

  return (
    <form action={handleSubmit} className="space-y-3 sm:space-y-4">
      {error && (
        <Alert variant="destructive" className="text-sm py-2">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-gray-700 font-medium text-sm">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="your@email.com"
          required
          disabled={loading}
          className="h-11 sm:h-12 px-3 sm:px-4 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5a2d] focus:border-transparent text-sm sm:text-base"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-gray-700 font-medium text-sm">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          disabled={loading}
          className="h-11 sm:h-12 px-3 sm:px-4 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5a2d] focus:border-transparent text-sm sm:text-base"
        />
      </div>

      <Button 
        type="submit" 
        className="w-full h-11 sm:h-12 bg-[#2d5a2d] hover:bg-[#1e3a1e] text-white font-medium text-sm sm:text-base" 
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </Button>
    </form>
  )
}
