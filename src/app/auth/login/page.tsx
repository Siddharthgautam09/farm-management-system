import { LoginForm } from '@/app/auth/LoginForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Left: Login Card */}
      <div className="flex flex-1 items-center justify-center p-8">
        <Card className="w-full max-w-md p-8 shadow-2xl rounded-3xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-4 shadow-lg">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" fill="white"/>
                  <path d="M9 12l2 2 4-4" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div>
              <CardTitle className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</CardTitle>
              <p className="text-gray-600 text-base">Sign in to your SmartFarm account</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <LoginForm />
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-green-600 font-semibold hover:text-green-700 transition-colors">
                  Create account
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Right: Enhanced Branding Section */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <img src="/image_login.jpg" alt="Farm" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/60 via-green-800/40 to-green-700/60"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full w-full p-12 text-center">
          <div className="mb-8">
          </div>
          <div className="flex items-center space-x-2 text-green-200">

          </div>
        </div>
      </div>
    </div>
  )
}
