"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
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
    <aside className="w-64 bg-[#2d5a2d] border-r min-h-full p-4">
      <div className="flex items-center gap-4">
        <h1 className="text-xl text-white font-bold p-3">Farm Management</h1>
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
