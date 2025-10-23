import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { FileText, Skull, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react'

export default async function ReportsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const reportCategories = [
    {
      title: 'Slaughter House Reports',
      description: 'Track animal sales, carcass weights, and clearance ratios',
      icon: ShoppingCart,
      href: '/reports/slaughter',
      color: 'blue',
    },
    {
      title: 'Death Reports',
      description: 'Monitor mortality rates and causes of death',
      icon: Skull,
      href: '/reports/death',
      color: 'red',
    },
    {
      title: 'Cost Analysis',
      description: 'Complete financial breakdown of farm expenses',
      icon: DollarSign,
      href: '/reports/cost-analysis',
      color: 'green',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-gray-600 mt-2">
          Access all farm reports and analytics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reportCategories.map((report) => {
          const Icon = report.icon
          return (
            <Card key={report.href} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg bg-${report.color}-100 flex items-center justify-center mb-4`}>
                  <Icon className={`h-6 w-6 text-${report.color}-600`} />
                </div>
                <CardTitle>{report.title}</CardTitle>
                <CardDescription>{report.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href={report.href}>
                    View Reports
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Statistics</CardTitle>
          <CardDescription>
            Overview of key metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <FileText className="h-8 w-8 mx-auto mb-2 text-gray-600" />
              <p className="text-2xl font-bold">-</p>
              <p className="text-sm text-gray-600">Total Reports</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold">-</p>
              <p className="text-sm text-gray-600">Animals Sold</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <Skull className="h-8 w-8 mx-auto mb-2 text-red-600" />
              <p className="text-2xl font-bold">-</p>
              <p className="text-sm text-gray-600">Deaths Reported</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold">-</p>
              <p className="text-sm text-gray-600">Avg Growth Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
