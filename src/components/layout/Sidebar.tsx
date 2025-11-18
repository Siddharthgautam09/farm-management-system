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
  Bell,
  AlertTriangle,
  Syringe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/auth/LogoutButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type LowStockItem = {
  id: string
  product_name: string
  quantity: number
  unit?: string | null
  alert_threshold?: number | null
}

type UpcomingVaccine = {
  id: string
  vaccine_name: string
  second_dose_date?: string | null
  animal?: {
    animal_id: string
  }
}

type SidebarProps = {
  alertCount?: number
  lowStockItems?: LowStockItem[]
  upcomingVaccines?: UpcomingVaccine[] | null
}

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

export function Sidebar({ alertCount = 0, lowStockItems = [], upcomingVaccines = [] }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const vaccines = upcomingVaccines || [];

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

        {/* Alert Bell and Logout Section */}
        <div className={cn(
          "p-4 border-t border-[#1e3a1e] space-y-2",
          !isMobile && "border-b border-[#1e3a1e]"
        )}>
          {/* Alert Bell */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className={cn(
                  "w-full text-white hover:bg-[#4a7c4a] hover:text-white transition-all h-12 relative",
                  isCollapsed && !isMobile ? "justify-center px-2" : "justify-start px-4"
                )}
              >
                <Bell className={cn(
                  "flex-shrink-0",
                  isCollapsed && !isMobile ? "h-6 w-6" : "h-5 w-5"
                )} />
                {alertCount > 0 && (
                  <span className="absolute top-2 left-7 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {alertCount > 9 ? '9+' : alertCount}
                  </span>
                )}
                {(!isCollapsed || isMobile) && (
                  <span className="ml-3 truncate">Alerts</span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-80 max-w-sm ml-4">
              <DropdownMenuLabel className="text-sm">Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {alertCount === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-500">
                  No alerts at this time
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  {/* Low Stock Items */}
                  {lowStockItems.length > 0 && (
                    <div className="p-3 border-b">
                      <div className="flex items-start gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-red-600">
                            Low Stock Alert
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            <strong>{lowStockItems.length} inventory item(s)</strong> are running low on stock.
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mt-3">
                        {lowStockItems.slice(0, 5).map((item) => (
                          <div key={item.id} className="p-2 bg-red-50 rounded-md border border-red-100">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item.product_name}
                            </p>
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-xs text-gray-600">
                                Stock: <span className="font-semibold text-red-600">{item.quantity} {item.unit || 'units'}</span>
                              </p>
                              {item.alert_threshold && (
                                <p className="text-xs text-gray-500">
                                  Min: {item.alert_threshold}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                        
                        {lowStockItems.length > 5 && (
                          <p className="text-xs text-gray-500 text-center pt-1">
                            +{lowStockItems.length - 5} more items
                          </p>
                        )}
                      </div>
                      
                      <Link href="/protected/inventory">
                        <Button variant="link" className="h-auto p-0 text-xs text-[#2d5a2d] mt-2">
                          View Inventory →
                        </Button>
                      </Link>
                    </div>
                  )}

                  {/* Upcoming Vaccines */}
                  {vaccines.length > 0 && (
                    <div className="p-3">
                      <div className="flex items-start gap-2 mb-2">
                        <Syringe className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-yellow-700">
                            Vaccine Schedule
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            <strong>{vaccines.length} vaccine dose(s)</strong> due in the next 7 days.
                          </p>
                        </div>
                      </div>
                      <Link href="/protected/animals">
                        <Button variant="link" className="h-auto p-0 text-xs text-[#2d5a2d] mt-2">
                          View Schedule →
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Logout Button */}
          <LogoutButton 
            variant="ghost" 
            className={cn(
              "w-full text-white hover:bg-red-600 hover:text-white transition-all h-12",
              isCollapsed && !isMobile ? "justify-center px-2" : "justify-start px-4"
            )}
            showText={!isCollapsed || isMobile}
          />
        </div>

        {/* Toggle Button - Desktop Only */}
        {!isMobile && (
          <div className="p-4">
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
