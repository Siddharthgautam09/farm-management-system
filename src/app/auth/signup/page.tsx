import { SignupForm } from "@/app/auth/SignupForm"
import Link from "next/link"
import Image from 'next/image'

export default function SignupPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
            {/* Logo */}
            <div className="flex justify-center">
              <div className="bg-gray-900 rounded-2xl p-4">
                <Image 
                  src="/image/Farm.png" 
                  alt="Farm Logo" 
                  width={48} 
                  height={48}
                  className="invert"
                />
              </div>
            </div>

            {/* Header */}
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-semibold text-gray-800">Create Account</h1>
              <p className="text-gray-600 text-sm">
                Sign up for your SmartFarm account
              </p>
            </div>
          
            <SignupForm />
          
            <div className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link 
                href="/auth/login" 
                className="text-[#2d5a2d] hover:text-[#1e3a1e] font-medium"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Image/Background */}
      <div className="hidden lg:block lg:w-1/2 relative bg-gradient-to-br from-[#2d5a2d] to-[#1e3a1e]">
        <Image 
          src="/image/image_login.jpg" 
          alt="Farm Background" 
          fill
          className="object-cover opacity-40"
        />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-white text-center space-y-4">
            <h2 className="text-4xl font-bold">Smart Farm Management</h2>
            <p className="text-xl text-gray-200">
              Manage your farm with AI-powered insights and analytics
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
