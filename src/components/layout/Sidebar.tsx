'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home,
  Inbox,
  Waves,
  TrendingUp,
  CheckCircle,
  FileText,
  Package,
} from 'lucide-react'

const navigation = [
  { name: 'Receiving', href: '/receiving', icon: Inbox },
  { name: 'Weaning', href: '/weaning', icon: Waves },
  { name: 'Fattening', href: '/fattening', icon: TrendingUp },
  { name: 'Finishing', href: '/finishing', icon: CheckCircle },
  { name: 'Animals', href: '/animals', icon: Home },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Inventory', href: '/inventory', icon: Package },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white border-r min-h-[calc(100vh-4rem)] p-4">
      <nav className="space-y-1">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
