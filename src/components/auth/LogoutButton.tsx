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
  size="icon"
  onClick={handleLogout}
  disabled={loading}
  className="hover:border hover:border-gray-300 hover:bg-gray-100 rounded-md transition-all w-[96px]"
>
  {loading ? (
    "Logging out..."
  ) : (
    <span className="flex items-center">
      <svg
        className="mr-2 h-4 w-4"
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
      Log Out
    </span>
  )}
</Button>

  );
}
