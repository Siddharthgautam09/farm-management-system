'use client'

import { LogoutButton } from '@/components/auth/LogoutButton'
import { AnimalSearch } from '@/components/animals/AnimalSearch'
import { User, Bell, AlertTriangle, Syringe } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu' 
import { Button } from '@/components/ui/button'
import Link from 'next/link'

type LowStockItem = {
  id: string
  product_name: string
  quantity: number
  serial_number?: string | null
  unit?: string | null
  purchase_date?: string | null
  price?: number | null
  total_cost?: number | null
  category?: string | null
  alert_threshold?: number | null
  created_at?: string
  updated_at?: string
}

type UpcomingVaccine = {
  id: string
  vaccine_name: string
  second_dose_date?: string | null
  animal?: {
    animal_id: string
  }
}

type HeaderProps = {
  user: {
    email?: string
  }
  alertCount?: number
  lowStockItems?: LowStockItem[]
  upcomingVaccines?: UpcomingVaccine[] | null
}

export function Header({ user, alertCount = 0, lowStockItems = [], upcomingVaccines = [] }: HeaderProps) {
  const vaccines = upcomingVaccines || []
  
  return (
    <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-3 md:gap-4">
        {/* Search Bar - Hidden on mobile, visible from sm up */}
        <div className="hidden sm:flex flex-1 max-w-xs md:max-w-sm lg:max-w-md">
          <AnimalSearch />
        </div>

        {/* Spacer for mobile when search is hidden */}
        <div className="flex-1 sm:hidden" />

        <div className="flex items-center gap-1 sm:gap-2 md:gap-3 lg:gap-4">
          {/* Alerts Bell Icon with Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-9 w-9 sm:h-10 sm:w-10">
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                {alertCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-red-500 text-white text-[10px] sm:text-xs font-bold rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">
                    {alertCount > 9 ? '9+' : alertCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[calc(100vw-2rem)] sm:w-80 max-w-sm">
              <DropdownMenuLabel className="text-sm sm:text-base">Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {alertCount === 0 ? (
                <div className="px-3 sm:px-4 py-6 sm:py-8 text-center text-xs sm:text-sm text-gray-500">
                  No alerts at this time
                </div>
              ) : (
                <div className="max-h-[60vh] sm:max-h-96 overflow-y-auto">
                  {/* Low Stock Items */}
                  {lowStockItems.length > 0 && (
                    <div className="p-2.5 sm:p-3 border-b">
                      <div className="flex items-start gap-2 mb-2">
                        <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-red-600">
                            Low Stock Alert
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-600 mt-1">
                            <strong>{lowStockItems.length} inventory item(s)</strong> are running low on stock.
                          </p>
                        </div>
                      </div>
                      <Link href="/protected/inventory">
                        <Button variant="link" className="h-auto p-0 text-[10px] sm:text-xs text-[#2d5a2d]">
                          View Inventory →
                        </Button>
                      </Link>
                    </div>
                  )}

                  {/* Upcoming Vaccines */}
                  {vaccines.length > 0 && (
                    <div className="p-2.5 sm:p-3">
                      <div className="flex items-start gap-2 mb-2">
                        <Syringe className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-yellow-700">
                            Vaccine Schedule
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-600 mt-1">
                            <strong>{vaccines.length} vaccine dose(s)</strong> due in the next 7 days.
                          </p>
                        </div>
                      </div>
                      <Link href="/protected/animals">
                        <Button variant="link" className="h-auto p-0 text-[10px] sm:text-xs text-[#2d5a2d]">
                          View Schedule →
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-1.5 sm:gap-2 h-9 sm:h-10 px-2 sm:px-3">
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm font-medium hidden md:inline">Online</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 sm:w-56">
              <DropdownMenuLabel className="text-sm">Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-default focus:bg-transparent">
                <span className="text-xs sm:text-sm text-gray-700 truncate">{user.email}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <LogoutButton />
        </div>
      </div>
    </header>
  )
}
