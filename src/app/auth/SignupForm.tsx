'use client'

import { useState } from 'react'
import { signUp } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

export function SignupForm() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)

    // Validate passwords match
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    const result = await signUp(formData)

    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    }
    // If successful, redirect happens automatically
  }

  return (
    <form action={handleSubmit} className="space-y-3 sm:space-y-3.5">
      {error && (
        <Alert variant="destructive" className="text-sm py-2">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="fullName" className="text-gray-700 font-medium text-sm">Full Name</Label>
        <Input
          id="fullName"
          name="fullName"
          type="text"
          placeholder="John Doe"
          required
          disabled={isLoading}
          className="h-10 sm:h-11 px-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5a2d] focus:border-transparent text-sm sm:text-base"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-gray-700 font-medium text-sm">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="your@email.com"
          required
          disabled={isLoading}
          className="h-10 sm:h-11 px-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5a2d] focus:border-transparent text-sm sm:text-base"
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
          minLength={6}
          disabled={isLoading}
          className="h-10 sm:h-11 px-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5a2d] focus:border-transparent text-sm sm:text-base"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword" className="text-gray-700 font-medium text-sm">Confirm Password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          required
          minLength={6}
          disabled={isLoading}
          className="h-10 sm:h-11 px-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5a2d] focus:border-transparent text-sm sm:text-base"
        />
      </div>

      <Button 
        type="submit" 
        className="w-full h-10 sm:h-11 bg-[#2d5a2d] hover:bg-[#1e3a1e] text-white font-medium text-sm sm:text-base" 
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          'Create Account'
        )}
      </Button>
    </form>
  )
}

