'use client'

import { LogoutButton } from '@/components/auth/LogoutButton'
import { AnimalSearch } from '@/components/animals/AnimalSearch'

type HeaderProps = {
  user: {
    email?: string
  }
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">Farm Management</h1>
        </div>

        <div className="flex-1 max-w-md mx-4">
          <AnimalSearch />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700 mr-2">{user.email}</span>
          <LogoutButton />
        </div>
      </div>
    </header>
  )
}
