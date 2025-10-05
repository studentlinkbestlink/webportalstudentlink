"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3, 
  PieChart, 
  LineChart, 
  TrendingUp,
  RefreshCw,
  Download,
  Maximize2
} from "lucide-react"
import { apiClient } from "@/lib/api-client"

interface ChartContainerProps {
  title: string
  chartType: string
  filters: any
  className?: string
}

interface ChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string
    borderWidth?: number
  }>
}

export function ChartContainer({ 
  title, 
  chartType, 
  filters, 
  className = "" 
}: ChartContainerProps) {
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    fetchChartData()
  }, [chartType, filters])

  const fetchChartData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await apiClient.getChartData(chartType, filters)
      setChartData(data)
    } catch (err) {
      console.error('Failed to fetch chart data:', err)
      setError('Failed to load chart data')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    await fetchChartData()
  }

  const handleExport = () => {
    // TODO: Implement chart export functionality
    console.log('Export chart:', chartType)
  }

  const getChartIcon = () => {
    switch (chartType) {
      case 'concerns_over_time':
        return <LineChart className="h-5 w-5" />
      case 'priority_distribution':
        return <PieChart className="h-5 w-5" />
      case 'department_performance':
      case 'staff_workload':
        return <BarChart3 className="h-5 w-5" />
      case 'resolution_times':
        return <TrendingUp className="h-5 w-5" />
      default:
        return <BarChart3 className="h-5 w-5" />
    }
  }

  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500 mb-2">{error}</p>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              Retry
            </Button>
          </div>
        </div>
      )
    }

    if (!chartData) {
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">No data available</p>
        </div>
      )
    }

    // Simple chart visualization using CSS and HTML
    // In a real implementation, you would use Chart.js, Recharts, or similar
    return (
      <div className="space-y-4">
        {chartType === 'priority_distribution' ? (
          <div className="grid grid-cols-2 gap-4">
            {chartData.labels.map((label, index) => {
              const value = chartData.datasets[0].data[index]
              const total = chartData.datasets[0].data.reduce((sum, val) => sum + val, 0)
              const percentage = total > 0 ? (value / total) * 100 : 0
              const colors = ['#EF4444', '#F97316', '#EAB308', '#10B981']
              
              return (
                <div key={label} className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: colors[index] || '#6B7280' }}
                  />
                  <div className="flex-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{label}</span>
                      <span className="text-gray-500">{value}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="h-2 rounded-full"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: colors[index] || '#6B7280'
                        }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {chartData.labels.map((label, index) => {
              const values = chartData.datasets.map(dataset => dataset.data[index])
              const maxValue = Math.max(...chartData.datasets.flatMap(d => d.data))
              
              return (
                <div key={label} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{label}</span>
                    <div className="flex space-x-4">
                      {chartData.datasets.map((dataset, datasetIndex) => (
                        <span key={datasetIndex} className="text-gray-500">
                          {dataset.label}: {dataset.data[index]}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {chartData.datasets.map((dataset, datasetIndex) => {
                      const value = dataset.data[index]
                      const width = maxValue > 0 ? (value / maxValue) * 100 : 0
                      const colors = ['#3B82F6', '#10B981', '#EF4444', '#F97316']
                      
                      return (
                        <div key={datasetIndex} className="flex-1">
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className="h-3 rounded-full"
                              style={{ 
                                width: `${width}%`,
                                backgroundColor: colors[datasetIndex] || '#6B7280'
                              }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  const chartCard = (
    <Card className={`${className} ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            {getChartIcon()}
            <span className="ml-2">{title}</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {chartType.replace('_', ' ')}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExport}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  )

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto">
          {chartCard}
        </div>
      </div>
    )
  }

  return chartCard
}
