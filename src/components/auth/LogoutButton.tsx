"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { LogOut } from "lucide-react";

interface LogoutButtonProps {
  variant?: "default" | "ghost" | "outline" | "secondary" | "destructive" | "link";
  className?: string;
  showText?: boolean;
}

export function LogoutButton({ 
  variant = "ghost", 
  className = "", 
  showText = true 
}: LogoutButtonProps) {
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
      variant={variant}
      onClick={handleLogout}
      disabled={loading}
      className={className || "hover:border hover:border-gray-300 hover:bg-gray-100 rounded-md transition-all h-9 sm:h-10 px-2 sm:px-3 min-w-[80px] sm:min-w-[96px]"}
    >
      {loading ? (
        <span className="text-xs sm:text-sm">Logging out...</span>
      ) : (
        <span className="flex items-center gap-1 sm:gap-2">
          <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
          {showText && <span className="text-sm sm:text-base">Log Out</span>}
        </span>
      )}
    </Button>
  );
}
