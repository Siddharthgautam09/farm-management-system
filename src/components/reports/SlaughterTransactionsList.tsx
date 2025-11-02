'use client'

import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Search, Filter, Eye } from 'lucide-react'
import Link from 'next/link'

interface SlaughterReport {
  id: string
  animal_id: string
  slaughter_date: string
  slaughter_weight: number
  carcass_weight: number
  carcass_percentage: number | null
  selling_price: number | null
  created_at: string
  created_by?: string | null
  animal?: {
    animal_id: string
    category: string
  }
}

interface SlaughterTransactionsListProps {
  reports: SlaughterReport[]
}

export default function SlaughterTransactionsList({ reports }: SlaughterTransactionsListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [dateRange, setDateRange] = useState('all')
  const [sortBy, setSortBy] = useState('date-desc')

  // Get unique categories from reports
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(reports.map(r => r.animal?.category).filter((cat): cat is string => !!cat))]
    return uniqueCategories
  }, [reports])

  // Filter and sort reports
  const filteredAndSortedReports = useMemo(() => {
    const filtered = reports.filter(report => {
      // Search filter
      const matchesSearch = !searchTerm || 
        report.animal?.animal_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.animal?.category?.toLowerCase().includes(searchTerm.toLowerCase())

      // Category filter
      const matchesCategory = categoryFilter === 'all' || 
        report.animal?.category === categoryFilter

      // Date range filter
      let matchesDate = true
      if (dateRange !== 'all') {
        const reportDate = new Date(report.slaughter_date)
        const now = new Date()
        
        switch (dateRange) {
          case 'today':
            matchesDate = reportDate.toDateString() === now.toDateString()
            break
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            matchesDate = reportDate >= weekAgo
            break
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            matchesDate = reportDate >= monthAgo
            break
          case 'quarter':
            const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
            matchesDate = reportDate >= quarterAgo
            break
        }
      }

      return matchesSearch && matchesCategory && matchesDate
    })

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.slaughter_date).getTime() - new Date(a.slaughter_date).getTime()
        case 'date-asc':
          return new Date(a.slaughter_date).getTime() - new Date(b.slaughter_date).getTime()
        case 'weight-desc':
          return b.slaughter_weight - a.slaughter_weight
        case 'weight-asc':
          return a.slaughter_weight - b.slaughter_weight
        case 'price-desc':
          return (b.selling_price || 0) - (a.selling_price || 0)
        case 'price-asc':
          return (a.selling_price || 0) - (b.selling_price || 0)
        case 'animal-id':
          return (a.animal?.animal_id || '').localeCompare(b.animal?.animal_id || '')
        default:
          return 0
      }
    })

    return filtered
  }, [reports, searchTerm, categoryFilter, dateRange, sortBy])

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
          <CardDescription>
            Filter slaughter transactions by date, category, or search
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by Animal ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                  <SelectItem value="quarter">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort By */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Date (Newest First)</SelectItem>
                  <SelectItem value="date-asc">Date (Oldest First)</SelectItem>
                  <SelectItem value="weight-desc">Weight (Highest First)</SelectItem>
                  <SelectItem value="weight-asc">Weight (Lowest First)</SelectItem>
                  <SelectItem value="price-desc">Price (Highest First)</SelectItem>
                  <SelectItem value="price-asc">Price (Lowest First)</SelectItem>
                  <SelectItem value="animal-id">Animal ID (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Slaughter Transactions</CardTitle>
              <CardDescription>
                Complete list of slaughter transactions ({filteredAndSortedReports.length} shown)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAndSortedReports.length > 0 ? (
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 font-medium text-gray-900">Animal ID</th>
                    <th className="px-6 py-3 font-medium text-gray-900">Category</th>
                    <th className="px-6 py-3 font-medium text-gray-900">Date</th>
                    <th className="px-6 py-3 font-medium text-gray-900">Slaughter Weight</th>
                    <th className="px-6 py-3 font-medium text-gray-900">Carcass Weight</th>
                    <th className="px-6 py-3 font-medium text-gray-900">Carcass %</th>
                    <th className="px-6 py-3 font-medium text-gray-900">Selling Price</th>
                    <th className="px-6 py-3 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedReports.map((report, index) => (
                    <tr key={report.id} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {report.animal?.animal_id}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary">
                          {report.animal?.category}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {format(new Date(report.slaughter_date), 'MMM dd, yyyy')}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {report.slaughter_weight.toFixed(1)} kg
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {report.carcass_weight.toFixed(1)} kg
                      </td>
                      <td className="px-6 py-4">
                        <Badge 
                          variant={
                            (report.carcass_percentage || 0) >= 60 ? "default" : 
                            (report.carcass_percentage || 0) >= 55 ? "secondary" : "destructive"
                          }
                        >
                          {(report.carcass_percentage || 0).toFixed(1)}%
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-green-600 font-semibold text-lg">
                        ${(report.selling_price || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <Link href={`/protected/reports/slaughter/${report.id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-2 font-medium">No transactions match your filters</p>
              <p className="text-gray-400 text-sm mb-4">
                Try adjusting your search criteria or clearing filters
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('')
                  setCategoryFilter('all')
                  setDateRange('all')
                }}
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}