'use client'

import { LogoutButton } from '@/components/auth/LogoutButton'
import { AnimalSearch } from '@/components/animals/AnimalSearch'
import { User } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu' 
import { Button } from '@/components/ui/button'

type HeaderProps = {
  user: {
    email?: string
  }
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="bg-white border-b sticky top-0 z-10 px-[48px] shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">


        <div className="flex-1 max-w-md mx-4">
          <AnimalSearch />
        </div>

        <div className="flex items-center gap-10">
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
