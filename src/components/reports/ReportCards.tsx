'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Skull, DollarSign, ArrowRight, Loader2, LucideIcon } from 'lucide-react'

type ReportCategory = {
  title: string
  description: string
  iconName: 'ShoppingCart' | 'Skull' | 'DollarSign'
  href: string
  color: string
  count: number
  bgColor: string
  iconColor: string
  hoverBg: string
}

type ReportCardsProps = {
  reportCategories: ReportCategory[]
}

const iconMap: Record<string, LucideIcon> = {
  ShoppingCart,
  Skull,
  DollarSign,
}

export function ReportCards({ reportCategories }: ReportCardsProps) {
  const router = useRouter()
  const [loadingHref, setLoadingHref] = useState<string | null>(null)

  const handleClick = (href: string) => {
    setLoadingHref(href)
    router.push(href)
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {reportCategories.map((report) => {
        const Icon = iconMap[report.iconName]
        const isLoading = loadingHref === report.href
        
        return (
          <button
            key={report.href}
            onClick={() => handleClick(report.href)}
            disabled={isLoading}
            className="group text-left w-full"
          >
            <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-200 h-28 sm:h-32">
              <CardContent className="p-4 h-full flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg ${report.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`h-6 w-6 sm:h-7 sm:w-7 ${report.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 truncate">{report.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{report.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
                  ) : (
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                  )}
                </div>
              </CardContent>
            </Card>
          </button>
        )
      })}
    </div>
  )
}
