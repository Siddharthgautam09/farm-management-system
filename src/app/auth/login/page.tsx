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
			            <div className="flex flex-col items-center">
              <div className="bg-green-700 rounded-lg p-3 mb-4">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="24" height="24" rx="8" fill="#166534" />
                  <path
                    d="M12 6C10.067 6 8.5 7.567 8.5 9.5C8.5 11.433 10.067 13 12 13C13.933 13 15.5 11.433 15.5 9.5C15.5 7.567 13.933 6 12 6ZM12 11.5C11.172 11.5 10.5 10.828 10.5 10C10.5 9.172 11.172 8.5 12 8.5C12.828 8.5 13.5 9.172 13.5 10C13.5 10.828 12.828 11.5 12 11.5Z"
                    fill="white"
                  />
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
