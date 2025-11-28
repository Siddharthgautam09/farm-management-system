"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  LayoutGrid,
  MapPin,
  Wheat,
  Heart,
  TrendingUp,
  CheckCircle,
  BarChart3,
  Package,
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
  { name: "Dashboard", href: "/protected/dashboard", icon: LayoutGrid, color: "text-blue-500" },
  { name: "Receiving", href: "/protected/receiving", icon: MapPin, color: "text-green-500" },
  { name: "Weaning", href: "/protected/weaning", icon: Wheat, color: "text-yellow-600" },
  { name: "Fattening", href: "/protected/fattening", icon: TrendingUp, color: "text-orange-500" },
  { name: "Finishing", href: "/protected/finishing", icon: CheckCircle, color: "text-purple-500" },
  { name: "Animals", href: "/protected/animals", icon: Heart, color: "text-red-500" },
  { name: "Reports", href: "/protected/reports", icon: BarChart3, color: "text-indigo-500" },
  { name: "Inventory", href: "/protected/inventory", icon: Package, color: "text-teal-500" },
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
        className="fixed top-4 left-4 z-30 lg:hidden bg-white text-gray-700 hover:bg-gray-100 shadow-lg border border-gray-200"
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
          "fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 z-40 flex flex-col shadow-sm",
          // Mobile styles
          isMobile && !isMobileOpen && "-translate-x-full",
          isMobile && isMobileOpen && "translate-x-0 w-64",
          // Desktop styles
          !isMobile && isCollapsed && "w-20",
          !isMobile && !isCollapsed && "w-64"
        )}
      >
        <div className="flex-1 overflow-y-auto p-0 ">
          {/* Logo Section */}
          <div className={cn(
            "mb-4 p-4 transition-all duration-300 relative flex justify-center-safe items-center",
            isCollapsed && !isMobile && "px-2"
          )}>
            {(!isCollapsed || isMobile) ? (
              <div className="flex items-center justify-between">
                <Image 
                  src="/image/Farm.png" 
                  alt="Farm Management Logo" 
                  width={120} 
                  height={40}
                  className="object-contain"
                  priority
                />
                {/* Collapse Button - Next to Logo when expanded */}
                {!isMobile && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-all h-8 w-8"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-3">
                <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">F</span>
                </div>
                {/* Collapse Button - Below logo when collapsed */}
                {!isMobile && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-all h-6 w-6"
                  >
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="space-y-1 px-3">
            {navigation.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-4 rounded-lg font-light transition-all duration-200 group ",
                    isActive
                      ? "bg-blue-50 text-blue-600 border-l-4 border-blue-500"
                      : "text-gray-700 hover:bg-gray-200",
                    isCollapsed && !isMobile
                      ? "justify-center px-2 py-2.5"
                      : "px-3 py-2.5"
                  )}
                  title={isCollapsed && !isMobile ? item.name : undefined}
                >
                  <item.icon className={cn(
                    "flex-shrink-0 transition-colors",
                    isActive ? "text-blue-500" : item.color,
                    isCollapsed && !isMobile ? "h-5 w-5" : "h-4 w-4"
                  )} />
                  {(!isCollapsed || isMobile) && (
                    <span className="truncate text-lg font-medium">{item.name}</span>
                  )}
                </Link>
              );
            })}
            
            {/* Alerts Menu Item */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className={cn(
                    "flex items-center gap-4 rounded-lg font-light transition-all duration-200 group w-full text-left",
                    "text-gray-700 hover:bg-gray-200",
                    isCollapsed && !isMobile
                      ? "justify-center px-2 py-2.5"
                      : "px-3 py-2.5"
                  )}
                >
                  <div className="relative">
                    <Bell className={cn(
                      "flex-shrink-0 transition-colors text-yellow-500",
                      isCollapsed && !isMobile ? "h-5 w-5" : "h-4 w-4"
                    )} />
                    {alertCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-3 w-3 flex items-center justify-center">
                        {alertCount > 9 ? '9' : alertCount}
                      </span>
                    )}
                  </div>
                  {(!isCollapsed || isMobile) && (
                    <span className="truncate text-lg font-medium">Alerts</span>
                  )}
                </button>
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
            
            {/* Logout Menu Item */}
            <LogoutButton 
              variant="ghost" 
              className={cn(
                "flex items-center gap-4rounded-lg font-medium transition-all duration-200 group w-full text-left justify-start mt-2",
                "text-gray-700 hover:bg-red-50 hover:text-red-600 ",
                isCollapsed && !isMobile
                  ? "justify-center px-2 py-2.5"
                  : "px-3 py-2.5"
              )}
              showText={!isCollapsed || isMobile}
            />
          </nav>
        </div>


      </aside>
    </>
  );
}
