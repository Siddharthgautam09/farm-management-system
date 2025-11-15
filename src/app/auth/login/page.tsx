import { LoginForm } from '@/app/auth/LoginForm'
import Link from 'next/link'
import Image from 'next/image'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen">
        <div className="w-full max-w-md space-y-4 sm:space-y-6">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="bg-[#1e3a1e] rounded-lg sm:rounded-xl p-4">
              <Image 
                src="/image/Farm.png" 
                alt="Farm Logo" 
                width={98} 
                height={98}
                className="invert"
              />
            </div>
          </div>

          {/* Header */}
          <div className="text-center space-y-1">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">Welcome Back</h1>
            <p className="text-gray-600 text-xs sm:text-sm">
              Sign in to your SmartFarm account
            </p>
          </div>
          
          <LoginForm />
          
          <div className="text-center text-xs sm:text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link 
              href="/auth/signup" 
              className="text-[#2d5a2d] hover:text-[#1e3a1e] font-medium underline"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side - Image/Background */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#2d5a2d] to-[#1e3a1e] items-center justify-center">
        <Image 
          src="/image/image_login.jpg" 
          alt="Farm Background" 
          fill
          className="object-cover opacity-40"
        />
      </div>
    </div>
  )
}
