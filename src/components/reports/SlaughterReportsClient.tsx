'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, Calendar, X, Package, Plus } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

type SlaughterReport = {
  id: string
  animal_id: string
  slaughter_date: string
  slaughter_weight: number
  carcass_weight: number
  carcass_percentage?: number
  selling_price: number
  created_at: string
  animals?: {
    animal_id: string
    category?: string
  } | null
}

type SlaughterReportsClientProps = {
  reports: SlaughterReport[]
}

export function SlaughterReportsClient({ reports }: SlaughterReportsClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('all')
  const [weightRange, setWeightRange] = useState('all')
  const [priceRange, setPriceRange] = useState('all')
  const [animalTypeFilter, setAnimalTypeFilter] = useState('all')
  const [sortBy, setSortBy] = useState('date-desc')

  // Get unique animal types from reports
  const animalTypes = useMemo(() => {
    const types = new Set<string>()
    reports.forEach(report => {
      if (report.animals?.category) {
        types.add(report.animals.category)
      }
    })
    return Array.from(types).sort()
  }, [reports])

  // Filter and sort reports
  const filteredReports = useMemo(() => {
    let filtered = [...reports]

    // Text search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(report => 
        (report.animals?.animal_id || report.animal_id)
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      )
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date()
      const filterDate = new Date()
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0)
          filtered = filtered.filter(report => 
            new Date(report.slaughter_date) >= filterDate
          )
          break
        case 'week':
          filterDate.setDate(now.getDate() - 7)
          filtered = filtered.filter(report => 
            new Date(report.slaughter_date) >= filterDate
          )
          break
        case 'month':
          filterDate.setMonth(now.getMonth() - 1)
          filtered = filtered.filter(report => 
            new Date(report.slaughter_date) >= filterDate
          )
          break
        case 'quarter':
          filterDate.setMonth(now.getMonth() - 3)
          filtered = filtered.filter(report => 
            new Date(report.slaughter_date) >= filterDate
          )
          break
      }
    }

    // Weight range filter
    if (weightRange !== 'all') {
      switch (weightRange) {
        case 'light':
          filtered = filtered.filter(report => report.slaughter_weight < 50)
          break
        case 'medium':
          filtered = filtered.filter(report => 
            report.slaughter_weight >= 50 && report.slaughter_weight <= 100
          )
          break
        case 'heavy':
          filtered = filtered.filter(report => report.slaughter_weight > 100)
          break
      }
    }

    // Price range filter
    if (priceRange !== 'all') {
      switch (priceRange) {
        case 'low':
          filtered = filtered.filter(report => report.selling_price < 500)
          break
        case 'medium':
          filtered = filtered.filter(report => 
            report.selling_price >= 500 && report.selling_price <= 1000
          )
          break
        case 'high':
          filtered = filtered.filter(report => report.selling_price > 1000)
          break
      }
    }

    // Animal type filter
    if (animalTypeFilter !== 'all') {
      filtered = filtered.filter(report => {
        return report.animals?.category === animalTypeFilter
      })
    }

    // Sort reports
    switch (sortBy) {
      case 'date-desc':
        filtered.sort((a, b) => new Date(b.slaughter_date).getTime() - new Date(a.slaughter_date).getTime())
        break
      case 'date-asc':
        filtered.sort((a, b) => new Date(a.slaughter_date).getTime() - new Date(b.slaughter_date).getTime())
        break
      case 'weight-desc':
        filtered.sort((a, b) => b.slaughter_weight - a.slaughter_weight)
        break
      case 'weight-asc':
        filtered.sort((a, b) => a.slaughter_weight - b.slaughter_weight)
        break
      case 'price-desc':
        filtered.sort((a, b) => b.selling_price - a.selling_price)
        break
      case 'price-asc':
        filtered.sort((a, b) => a.selling_price - b.selling_price)
        break
      case 'yield-desc':
        filtered.sort((a, b) => (b.carcass_percentage || 0) - (a.carcass_percentage || 0))
        break
      case 'yield-asc':
        filtered.sort((a, b) => (a.carcass_percentage || 0) - (b.carcass_percentage || 0))
        break
    }

    return filtered
  }, [reports, searchQuery, dateFilter, weightRange, priceRange, animalTypeFilter, sortBy])

  const clearAllFilters = () => {
    setSearchQuery('')
    setDateFilter('all')
    setWeightRange('all')
    setPriceRange('all')
    setAnimalTypeFilter('all')
    setSortBy('date-desc')
  }

  const hasActiveFilters = searchQuery || dateFilter !== 'all' || weightRange !== 'all' || priceRange !== 'all' || animalTypeFilter !== 'all'

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg sm:text-xl">Recent Reports</CardTitle>
            <CardDescription className="text-sm">
              Complete history of all slaughter transactions
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearAllFilters}
                className="h-9"
              >
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
            <Badge variant="secondary" className="px-3 py-1">
              {filteredReports.length} of {reports.length}
            </Badge>
          </div>
        </div>
        
        {/* Filters */}
        <div className="space-y-4">
          {/* Search and Sort */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by Animal ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48 h-9">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Date (Newest)</SelectItem>
                <SelectItem value="date-asc">Date (Oldest)</SelectItem>
                <SelectItem value="weight-desc">Weight (High to Low)</SelectItem>
                <SelectItem value="weight-asc">Weight (Low to High)</SelectItem>
                <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                <SelectItem value="yield-desc">Yield (High to Low)</SelectItem>
                <SelectItem value="yield-asc">Yield (Low to High)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Filter Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="h-9">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="quarter">Last 3 Months</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={animalTypeFilter} onValueChange={setAnimalTypeFilter}>
              <SelectTrigger className="h-9">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Animal type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Animals</SelectItem>
                {animalTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    <span className="capitalize">{type}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={weightRange} onValueChange={setWeightRange}>
              <SelectTrigger className="h-9">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Weight range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Weights</SelectItem>
                <SelectItem value="light">Light (&lt;50kg)</SelectItem>
                <SelectItem value="medium">Medium (50-100kg)</SelectItem>
                <SelectItem value="heavy">Heavy (&gt;100kg)</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="h-9">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Price range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="low">Low (&lt;$500)</SelectItem>
                <SelectItem value="medium">Medium ($500-$1000)</SelectItem>
                <SelectItem value="high">High (&gt;$1000)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {filteredReports.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {hasActiveFilters ? (
                <Search className="h-8 w-8 text-gray-400" />
              ) : (
                <Package className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {hasActiveFilters ? 'No reports match your filters' : 'No slaughter reports found'}
            </p>
            {hasActiveFilters ? (
              <Button variant="outline" onClick={clearAllFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear filters
              </Button>
            ) : (
              <Button asChild>
                <Link href="/protected/reports/slaughter/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first report
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Animal ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Weight
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Carcass
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Yield
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Price
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredReports.map((report, index) => (
                  <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-600 font-medium">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {format(new Date(report.slaughter_date), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="font-mono">
                        {report.animals?.animal_id || report.animal_id}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <span className="font-semibold">{report.slaughter_weight}</span> kg
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <span className="font-semibold">{report.carcass_weight}</span> kg
                    </td>
                    <td className="px-4 py-3">
                      <Badge 
                        variant="secondary" 
                        className="bg-green-100 text-green-800 hover:bg-green-100"
                      >
                        {report.carcass_percentage?.toFixed(1) || '0.0'}%
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-600">
                      ${report.selling_price?.toFixed(2) || '0.00'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}