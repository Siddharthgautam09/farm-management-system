"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  Home,
  Inbox,
  Waves,
  TrendingUp,
  CheckCircle,
  FileText,
  Package,
  Users,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home }, // Add this
  { name: "Receiving", href: "/receiving", icon: Inbox },
  { name: "Weaning", href: "/weaning", icon: Waves },
  { name: "Fattening", href: "/fattening", icon: TrendingUp },
  { name: "Finishing", href: "/finishing", icon: CheckCircle },
  { name: "Animals", href: "/animals", icon: Users }, // Changed icon from Home to Users
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Inventory", href: "/inventory", icon: Package },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-[#2d5a2d] border-r p-4">
      <div className="flex items-center justify-center gap-4 mb-6 py-2">
        <Image 
          src="/image/Farm.png" 
          alt="Farm Management Logo" 
          width={150} 
          height={60}
          className="object-contain"
        />
      </div>

      <nav className="space-y-4">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-6 py-4 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-white hover:bg-[#4a7c4a]  "
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
