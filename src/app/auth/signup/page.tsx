import { SignupForm } from "@/app/auth/SignupForm";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-500 flex items-center justify-center p-4 sm:p-6 lg:p-8 ">
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg ">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 lg:p-10 space-y-6 border-2 border-slate-800 h-screen ">
          <div className="text-center space-y-2">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Create An Account</h1>
          </div>
          <br />
          
          <SignupForm />
          
          <div className="text-center text-xs sm:text-sm text-gray-600">
            Already Have An Account?{' '}
            <Link 
              href="/auth/login" 
              className="text-blue-600 hover:text-blue-700 font-medium underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
