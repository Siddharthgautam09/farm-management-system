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
    <header className="bg-white border-b sticky top-0 z-10 px-[48px] shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">


        <div className="flex-1 max-w-md mx-4">
          <AnimalSearch />
        </div>

        <div className="flex items-center gap-4">
          {/* Alerts Bell Icon with Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {alertCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {alertCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
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
                        <div className="flex-1">
                          <p className="text-sm font-medium text-red-600">
                            Low Stock Alert
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            <strong>{lowStockItems.length} inventory item(s)</strong> are running low on stock.
                          </p>
                        </div>
                      </div>
                      <Link href="/protected/inventory">
                        <Button variant="link" className="h-auto p-0 text-xs text-[#2d5a2d]">
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
                        <div className="flex-1">
                          <p className="text-sm font-medium text-yellow-700">
                            Vaccine Schedule
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            <strong>{vaccines.length} vaccine dose(s)</strong> due in the next 7 days.
                          </p>
                        </div>
                      </div>
                      <Link href="/protected/animals">
                        <Button variant="link" className="h-auto p-0 text-xs text-[#2d5a2d]">
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
              <Button variant="ghost" className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <span className="text-sm font-medium">Online</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-default focus:bg-transparent">
                <span className="text-sm text-gray-700">{user.email}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <LogoutButton />
        </div>
      </div>
    </header>
  )
}
