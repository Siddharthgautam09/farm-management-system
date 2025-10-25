import { LoginForm } from '@/app/auth/LoginForm'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-500 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 lg:p-10 space-y-6 border-1 border-slate-600">
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-2xl lg:text-3xl font-semibold text-gray-800">Welcome Back</h1>
            <p className="text-gray-600 text-xs sm:text-sm lg:text-base px-2">
              Sign in to your account to continue
            </p>
          </div>
          
          <LoginForm />
          
          <div className="text-center text-xs sm:text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link 
              href="/auth/signup" 
              className="text-blue-600 hover:text-blue-700 font-medium underline"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
