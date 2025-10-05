"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  color: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'emerald' | 'orange'
  subtitle?: string
  trend?: {
    value: number
    direction: 'up' | 'down'
    period: string
  } | null
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    icon: 'text-blue-600',
    border: 'border-blue-200'
  },
  green: {
    bg: 'bg-green-50',
    text: 'text-green-600',
    icon: 'text-green-600',
    border: 'border-green-200'
  },
  red: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    icon: 'text-red-600',
    border: 'border-red-200'
  },
  yellow: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-600',
    icon: 'text-yellow-600',
    border: 'border-yellow-200'
  },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    icon: 'text-purple-600',
    border: 'border-purple-200'
  },
  emerald: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    icon: 'text-emerald-600',
    border: 'border-emerald-200'
  },
  orange: {
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    icon: 'text-orange-600',
    border: 'border-orange-200'
  }
}

export function MetricCard({ 
  title, 
  value, 
  icon, 
  color, 
  subtitle, 
  trend 
}: MetricCardProps) {
  const colors = colorClasses[color]

  return (
    <Card className={`${colors.bg} ${colors.border} border-2 hover:shadow-md transition-shadow`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className={`text-3xl font-bold ${colors.text} mb-2`}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {subtitle && (
              <p className="text-sm text-gray-500">{subtitle}</p>
            )}
            {trend && (
              <div className="flex items-center mt-2">
                {trend.direction === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {Math.abs(trend.value)}%
                </span>
                <span className="text-sm text-gray-500 ml-1">
                  vs {trend.period}
                </span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg ${colors.bg}`}>
            <div className={colors.icon}>
              {icon}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
