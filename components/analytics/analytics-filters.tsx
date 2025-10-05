"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Building, Clock } from "lucide-react"

interface AnalyticsFiltersProps {
  filters: {
    start_date: string
    end_date: string
    period: 'hourly' | 'daily' | 'weekly' | 'monthly'
    department_id?: number
  }
  onFiltersChange: (filters: any) => void
}

export function AnalyticsFilters({ filters, onFiltersChange }: AnalyticsFiltersProps) {
  const [localFilters, setLocalFilters] = useState(filters)

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const resetFilters = () => {
    const defaultFilters = {
      start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0],
      period: 'daily' as const,
      department_id: undefined,
    }
    setLocalFilters(defaultFilters)
    onFiltersChange(defaultFilters)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Date Range */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center">
          <Calendar className="h-4 w-4 mr-1" />
          Start Date
        </label>
        <Input
          type="date"
          value={localFilters.start_date}
          onChange={(e) => handleFilterChange('start_date', e.target.value)}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center">
          <Calendar className="h-4 w-4 mr-1" />
          End Date
        </label>
        <Input
          type="date"
          value={localFilters.end_date}
          onChange={(e) => handleFilterChange('end_date', e.target.value)}
          className="w-full"
        />
      </div>

      {/* Period */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center">
          <Clock className="h-4 w-4 mr-1" />
          Period
        </label>
        <Select
          value={localFilters.period}
          onValueChange={(value) => handleFilterChange('period', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hourly">Hourly</SelectItem>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Department Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center">
          <Building className="h-4 w-4 mr-1" />
          Department
        </label>
        <Select
          value={localFilters.department_id?.toString() || "all"}
          onValueChange={(value) => handleFilterChange('department_id', value === "all" ? undefined : parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            <SelectItem value="1">IT Department</SelectItem>
            <SelectItem value="2">Academic Affairs</SelectItem>
            <SelectItem value="3">Student Services</SelectItem>
            <SelectItem value="4">Finance</SelectItem>
            <SelectItem value="5">Human Resources</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reset Button */}
      <div className="flex items-end">
        <Button
          variant="outline"
          onClick={resetFilters}
          className="w-full"
        >
          Reset Filters
        </Button>
      </div>
    </div>
  )
}
