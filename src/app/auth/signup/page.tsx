import { SignupForm } from "@/app/auth/SignupForm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from 'next/image';
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Left: Signup Card */}
      <div className="flex flex-1 items-center justify-center">
        <Card className="w-full max-w-md p-8 shadow-lg rounded-2xl">
          <CardHeader className="items-center">
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
              <CardTitle className="text-2xl font-bold mb-1">
                Create Account
              </CardTitle>
              <p className="text-gray-600 text-center mb-2">
                Sign up for your SmartFarm account
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <SignupForm />
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-green-700 font-semibold hover:underline"
              >
                Log in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Right: Enhanced Branding Section */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <Image src="/image_login.jpg" alt="Farm" fill className="absolute inset-0 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/60 via-green-800/40 to-green-700/60"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full w-full p-12 text-center">
          <div className="mb-8"></div>
          <div className="flex items-center space-x-2 text-green-200"></div>
        </div>
      </div>
    </div>
  );
}
