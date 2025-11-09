'use client'

import { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Filter } from 'lucide-react'

type InventoryItem = {
  id: string
  serial_number: string | null
  product_name: string
  category: string | null
  quantity: number
  unit: string | null
  price: number | null
  alert_threshold: number | null
  created_at: string
}

type InventoryTableProps = {
  inventory: InventoryItem[]
}

export function InventoryTable({ inventory }: InventoryTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('product_name')

  // Filter and sort inventory
  const filteredInventory = useMemo(() => {
    let filtered = [...inventory]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.serial_number?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter)
    }

    // Status filter
    if (statusFilter === 'low') {
      filtered = filtered.filter(item => item.quantity <= (item.alert_threshold || 10))
    } else if (statusFilter === 'in-stock') {
      filtered = filtered.filter(item => item.quantity > (item.alert_threshold || 10))
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'product_name':
          return a.product_name.localeCompare(b.product_name)
        case 'serial_number':
          return (a.serial_number || '').localeCompare(b.serial_number || '')
        case 'quantity':
          return b.quantity - a.quantity
        case 'price':
          return (b.price || 0) - (a.price || 0)
        case 'total_value':
          return (b.quantity * (b.price || 0)) - (a.quantity * (a.price || 0))
        case 'created_at':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        default:
          return 0
      }
    })

    return filtered
  }, [inventory, searchTerm, categoryFilter, statusFilter, sortBy])

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name or serial..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="feed">Feed</SelectItem>
            <SelectItem value="medicine">Medicine</SelectItem>
            <SelectItem value="vaccine">Vaccine</SelectItem>
            <SelectItem value="supplies">Supplies</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="in-stock">In Stock</SelectItem>
            <SelectItem value="low">Low Stock</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort By */}
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger>
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="product_name">Product Name</SelectItem>
            <SelectItem value="serial_number">Serial Number</SelectItem>
            <SelectItem value="quantity">Quantity (High to Low)</SelectItem>
            <SelectItem value="price">Price (High to Low)</SelectItem>
            <SelectItem value="total_value">Total Value (High to Low)</SelectItem>
            <SelectItem value="created_at">Recently Added</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredInventory.length} of {inventory.length} items
      </div>

      {/* Table */}
      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-gray-50">
            <tr>
              <th className="px-6 py-3">Serial Number</th>
              <th className="px-6 py-3">Product Name</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Quantity</th>
              <th className="px-6 py-3">Unit</th>
              <th className="px-6 py-3">Price/Unit</th>
              <th className="px-6 py-3">Total Value</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.length > 0 ? (
              filteredInventory.map((item) => {
                const isLowStock = item.quantity <= (item.alert_threshold || 10)
                const totalValue = item.quantity * (item.price || 0)

                return (
                  <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-xs">
                      {item.serial_number || 'N/A'}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {item.product_name}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="capitalize">
                        {item.category}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className={isLowStock ? 'text-red-600 font-semibold' : ''}>
                        {item.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4">{item.unit}</td>
                    <td className="px-6 py-4">${(item.price || 0).toFixed(2)}</td>
                    <td className="px-6 py-4 font-semibold">
                      ${totalValue.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      {isLowStock ? (
                        <Badge variant="destructive">Low Stock</Badge>
                      ) : (
                        <Badge variant="default">In Stock</Badge>
                      )}
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                  No items found matching your filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
