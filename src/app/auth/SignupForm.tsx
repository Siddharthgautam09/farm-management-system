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
    <form action={handleSubmit} className="space-y-4 sm:space-y-6">
      {error && (
        <Alert variant="destructive" className="text-sm">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-gray-700 font-medium text-sm sm:text-base">Full Name</Label>
        <Input
          id="fullName"
          name="fullName"
          type="text"
          placeholder="John Doe"
          required
          disabled={isLoading}
          className="h-11 sm:h-12 lg:h-14 px-3 sm:px-4  rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent border-gray-600 placeholder:text-gray-400 text-sm sm:text-base"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-gray-700 font-medium text-sm sm:text-base">Email Address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          disabled={isLoading}
          className="h-11 sm:h-12 lg:h-14 px-3 sm:px-4 border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder:text-gray-400 text-sm sm:text-base"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-gray-700 font-medium text-sm sm:text-base">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          minLength={6}
          disabled={isLoading}
          className="h-11 sm:h-12 lg:h-14 px-3 sm:px-4 border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder:text-gray-400 text-sm sm:text-base"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-gray-700 font-medium text-sm sm:text-base">Confirm Password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          required
          minLength={6}
          disabled={isLoading}
          className="h-11 sm:h-12 lg:h-14 px-3 sm:px-4 border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder:text-gray-400 text-sm sm:text-base"
        />
      </div>

      <Button 
        type="submit" 
        className="w-full h-11 sm:h-12 lg:h-14 bg-emerald-900 hover:bg-emerald-300 hover:text-black text-white font-medium rounded-lg transition-colors duration-200 text-sm sm:text-base" 
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
