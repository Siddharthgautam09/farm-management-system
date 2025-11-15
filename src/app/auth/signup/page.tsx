import { SignupForm } from "@/app/auth/SignupForm"
import Link from "next/link"
import Image from 'next/image'

export default function SignupPage() {
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
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">Create Account</h1>
            <p className="text-gray-600 text-xs sm:text-sm">
              Sign up for your SmartFarm account
            </p>
          </div>
        
          <SignupForm />
        
          <div className="text-center text-xs sm:text-sm text-gray-600">
            Already have an account?{' '}
            <Link 
              href="/auth/login" 
              className="text-[#2d5a2d] hover:text-[#1e3a1e] font-medium underline"
            >
              Sign in
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
        <div className="relative z-10 text-white text-center space-y-4 px-8 xl:px-12">
          <h2 className="text-3xl xl:text-4xl font-bold">Smart Farm Management</h2>
          <p className="text-lg xl:text-xl text-gray-200 max-w-lg mx-auto">
            Manage your farm with AI-powered insights and analytics
          </p>
        </div>
      </div>
    </div>
  )
}

