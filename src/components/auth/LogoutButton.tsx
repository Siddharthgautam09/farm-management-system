"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    setLoading(false);
    router.push("/login");
  };

  return (
    <Button
      variant="ghost"
      onClick={handleLogout}
      disabled={loading}
      className="hover:border hover:border-gray-300 hover:bg-gray-100 rounded-md transition-all h-9 sm:h-10 px-2 sm:px-3 min-w-[80px] sm:min-w-[96px]"
    >
      {loading ? (
        <span className="text-xs sm:text-sm">Logging out...</span>
      ) : (
        <span className="flex items-center gap-1 sm:gap-2">
          <svg
            className="h-3.5 w-3.5 sm:h-4 sm:w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1"
            />
          </svg>
          <span className="text-xs sm:text-sm">Log Out</span>
        </span>
      )}
    </Button>
  );
}
