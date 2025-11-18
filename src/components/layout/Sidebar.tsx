"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  Home,
  Inbox,
  Waves,
  TrendingUp,
  CheckCircle,
  FileText,
  Package,
  Users,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/protected/dashboard", icon: Home },
  { name: "Receiving", href: "/protected/receiving", icon: Inbox },
  { name: "Weaning", href: "/protected/weaning", icon: Waves },
  { name: "Fattening", href: "/protected/fattening", icon: TrendingUp },
  { name: "Finishing", href: "/protected/finishing", icon: CheckCircle },
  { name: "Animals", href: "/protected/animals", icon: Users },
  { name: "Reports", href: "/protected/reports", icon: FileText },
  { name: "Inventory", href: "/protected/inventory", icon: Package },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(false); // Reset collapse state on mobile
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-30 lg:hidden bg-[#2d5a2d] text-white hover:bg-[#1e3a1e] hover:text-white shadow-lg"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 h-screen bg-[#2d5a2d] border-r border-[#1e3a1e] transition-all duration-300 z-40 flex flex-col",
          // Mobile styles
          isMobile && !isMobileOpen && "-translate-x-full",
          isMobile && isMobileOpen && "translate-x-0 w-64",
          // Desktop styles
          !isMobile && isCollapsed && "w-20",
          !isMobile && !isCollapsed && "w-64"
        )}
      >
        <div className="flex-1 overflow-y-auto p-4">
          {/* Logo Section */}
          <div className={cn(
            "flex items-center justify-center mb-6 py-2 transition-all duration-300",
            isCollapsed && !isMobile && "px-0"
          )}>
            {(!isCollapsed || isMobile) ? (
              <Image 
                src="/image/Farm.png" 
                alt="Farm Management Logo" 
                width={150} 
                height={60}
                className="object-contain"
                priority
              />
            ) : (
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-[#2d5a2d] font-bold text-xl">F</span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg font-medium transition-all duration-200",
                    isActive
                      ? "bg-blue-50 text-gray-500"
                      : "text-white hover:bg-[#4a7c4a]",
                    isCollapsed && !isMobile
                      ? "justify-center px-4 py-4 text-base"
                      : "px-5 py-4 text-base"
                  )}
                  title={isCollapsed && !isMobile ? item.name : undefined}
                >
                  <item.icon className={cn(
                    "flex-shrink-0",
                    isCollapsed && !isMobile ? "h-6 w-6" : "h-5 w-5"
                  )} />
                  {(!isCollapsed || isMobile) && (
                    <span className="truncate">{item.name}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Toggle Button - Desktop Only */}
        {!isMobile && (
          <div className="p-4 border-t border-[#1e3a1e]">
            <Button
              variant="ghost"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={cn(
                "w-full text-white hover:bg-[#4a7c4a] hover:text-white transition-all h-12",
                isCollapsed ? "justify-center px-2" : "justify-start px-4"
              )}
            >
              {isCollapsed ? (
                <ChevronRight className="h-6 w-6" />
              ) : (
                <>
                  <ChevronLeft className="h-5 w-5 mr-2" />
                  <span className="text-base">Click</span>
                </>
              )}
            </Button>
          </div>
        )}
      </aside>
    </>
  );
}
