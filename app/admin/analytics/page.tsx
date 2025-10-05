"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Filter,
  RefreshCw,
  Download,
  Calendar,
  Building,
  Star
} from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { AnalyticsFilters } from "@/components/analytics/analytics-filters"
import { MetricCard } from "@/components/analytics/metric-card"
import { ChartContainer } from "@/components/analytics/chart-container"

interface AnalyticsData {
  overview: {
    total_concerns: number
    pending_concerns: number
    in_progress_concerns: number
    resolved_concerns: number
    confirmed_concerns: number
    urgent_concerns: number
    high_priority_concerns: number
    archived_concerns: number
    resolution_rate: number
    avg_resolution_time: number
  }
  performance: {
    avg_first_response_time_hours: number
    avg_resolution_time_hours: number
    fastest_resolution_hours: number
    slowest_resolution_hours: number
    resolved_within_24h: number
    resolved_within_48h: number
    resolution_within_24h_rate: number
    resolution_within_48h_rate: number
  }
  trends: {
    period: string
    data: Array<{
      period: string
      total_concerns: number
      resolved_concerns: number
      urgent_concerns: number
      avg_resolution_time: number
      resolution_rate: number
    }>
  }
  department_analytics: Array<{
    id: number
    name: string
    code: string
    total_concerns: number
    resolved_concerns: number
    urgent_concerns: number
    staff_count: number
    avg_resolution_time: number
    resolution_rate: number
    workload_per_staff: number
  }>
  staff_analytics: Array<{
    id: number
    name: string
    email: string
    department: string
    total_assigned: number
    resolved_concerns: number
    urgent_concerns: number
    avg_resolution_time: number
    resolution_rate: number
  }>
  response_times: {
    avg_first_response_minutes: number
    avg_resolution_hours: number
    responded_within_30min: number
    responded_within_1hour: number
    resolved_within_2hours: number
    resolved_within_24hours: number
    response_within_30min_rate: number
    response_within_1hour_rate: number
  }
  satisfaction_metrics: {
    avg_rating: number
    high_ratings: number
    good_ratings: number
    low_ratings: number
    total_rated: number
    satisfaction_rate: number
  }
}

export default function AdvancedAnalyticsPage() {
  const { user } = useAuth()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    period: 'daily' as 'hourly' | 'daily' | 'weekly' | 'monthly',
    department_id: undefined as number | undefined,
  })
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchAnalytics()
  }, [filters])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await apiClient.getAdvancedAnalytics(filters)
      setAnalyticsData(data)
    } catch (err) {
      console.error('Failed to fetch analytics:', err)
      setError('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await apiClient.clearAnalyticsCache()
      await fetchAnalytics()
    } catch (err) {
      console.error('Failed to refresh analytics:', err)
    } finally {
      setRefreshing(false)
    }
  }

  const handleFilterChange = (newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  if (!user || !['admin', 'department_head'].includes(user.role)) {
    return <div>Access denied</div>
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <BarChart3 className="h-8 w-8 mr-3 text-blue-600" />
              Advanced Analytics Dashboard
            </h1>
            <p className="text-gray-600">
              Comprehensive insights and performance metrics
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
            <Button
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              {user.role === 'admin' ? 'System Admin' : 'Department Head'}
            </Badge>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Analytics Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AnalyticsFilters
              filters={filters}
              onFiltersChange={handleFilterChange}
            />
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">Error Loading Analytics</p>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={fetchAnalytics}>
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : analyticsData ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Concerns"
                value={analyticsData.overview.total_concerns}
                icon={<BarChart3 className="h-6 w-6" />}
                color="blue"
                trend={null}
              />
              <MetricCard
                title="Resolved"
                value={analyticsData.overview.resolved_concerns}
                icon={<CheckCircle className="h-6 w-6" />}
                color="green"
                subtitle={`${analyticsData.overview.resolution_rate}% resolution rate`}
              />
              <MetricCard
                title="Urgent Concerns"
                value={analyticsData.overview.urgent_concerns}
                icon={<AlertTriangle className="h-6 w-6" />}
                color="red"
                subtitle={`${analyticsData.overview.high_priority_concerns} high priority`}
              />
              <MetricCard
                title="Avg Resolution Time"
                value={`${analyticsData.overview.avg_resolution_time}h`}
                icon={<Clock className="h-6 w-6" />}
                color="purple"
                subtitle="Average time to resolve"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="First Response"
                value={`${analyticsData.performance.avg_first_response_time_hours}h`}
                icon={<Clock className="h-6 w-6" />}
                color="blue"
                subtitle="Average first response time"
              />
              <MetricCard
                title="24h Resolution"
                value={`${analyticsData.performance.resolution_within_24h_rate}%`}
                icon={<TrendingUp className="h-6 w-6" />}
                color="green"
                subtitle={`${analyticsData.performance.resolved_within_24h} concerns`}
              />
              <MetricCard
                title="48h Resolution"
                value={`${analyticsData.performance.resolution_within_48h_rate}%`}
                icon={<CheckCircle className="h-6 w-6" />}
                color="emerald"
                subtitle={`${analyticsData.performance.resolved_within_48h} concerns`}
              />
              <MetricCard
                title="Fastest Resolution"
                value={`${analyticsData.performance.fastest_resolution_hours}h`}
                icon={<TrendingUp className="h-6 w-6" />}
                color="yellow"
                subtitle="Best performance"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartContainer
                title="Concerns Over Time"
                chartType="concerns_over_time"
                filters={filters}
              />
              <ChartContainer
                title="Priority Distribution"
                chartType="priority_distribution"
                filters={filters}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartContainer
                title="Department Performance"
                chartType="department_performance"
                filters={filters}
              />
              <ChartContainer
                title="Resolution Times"
                chartType="resolution_times"
                filters={filters}
              />
            </div>

            <ChartContainer
              title="Staff Workload Distribution"
              chartType="staff_workload"
              filters={filters}
            />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Department Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Department</th>
                        <th className="text-right py-3 px-4 font-medium">Total Concerns</th>
                        <th className="text-right py-3 px-4 font-medium">Resolved</th>
                        <th className="text-right py-3 px-4 font-medium">Resolution Rate</th>
                        <th className="text-right py-3 px-4 font-medium">Avg Time</th>
                        <th className="text-right py-3 px-4 font-medium">Staff Count</th>
                        <th className="text-right py-3 px-4 font-medium">Workload/Staff</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.department_analytics.map((dept) => (
                        <tr key={dept.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium">{dept.name}</div>
                              <div className="text-sm text-gray-500">{dept.code}</div>
                            </div>
                          </td>
                          <td className="text-right py-3 px-4">{dept.total_concerns}</td>
                          <td className="text-right py-3 px-4">{dept.resolved_concerns}</td>
                          <td className="text-right py-3 px-4">
                            <Badge variant={dept.resolution_rate >= 80 ? "default" : "secondary"}>
                              {dept.resolution_rate}%
                            </Badge>
                          </td>
                          <td className="text-right py-3 px-4">{dept.avg_resolution_time}h</td>
                          <td className="text-right py-3 px-4">{dept.staff_count}</td>
                          <td className="text-right py-3 px-4">{dept.workload_per_staff}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Top Performing Staff
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Staff Member</th>
                        <th className="text-left py-3 px-4 font-medium">Department</th>
                        <th className="text-right py-3 px-4 font-medium">Total Assigned</th>
                        <th className="text-right py-3 px-4 font-medium">Resolved</th>
                        <th className="text-right py-3 px-4 font-medium">Resolution Rate</th>
                        <th className="text-right py-3 px-4 font-medium">Avg Time</th>
                        <th className="text-right py-3 px-4 font-medium">Urgent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.staff_analytics.map((staff) => (
                        <tr key={staff.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium">{staff.name}</div>
                              <div className="text-sm text-gray-500">{staff.email}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4">{staff.department}</td>
                          <td className="text-right py-3 px-4">{staff.total_assigned}</td>
                          <td className="text-right py-3 px-4">{staff.resolved_concerns}</td>
                          <td className="text-right py-3 px-4">
                            <Badge variant={staff.resolution_rate >= 80 ? "default" : "secondary"}>
                              {staff.resolution_rate}%
                            </Badge>
                          </td>
                          <td className="text-right py-3 px-4">{staff.avg_resolution_time}h</td>
                          <td className="text-right py-3 px-4">
                            {staff.urgent_concerns > 0 && (
                              <Badge variant="destructive">{staff.urgent_concerns}</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard
                title="Average Rating"
                value={analyticsData.satisfaction_metrics.avg_rating.toFixed(1)}
                icon={<Star className="h-6 w-6" />}
                color="yellow"
                subtitle={`${analyticsData.satisfaction_metrics.total_rated} total ratings`}
              />
              <MetricCard
                title="Satisfaction Rate"
                value={`${analyticsData.satisfaction_metrics.satisfaction_rate}%`}
                icon={<TrendingUp className="h-6 w-6" />}
                color="green"
                subtitle={`${analyticsData.satisfaction_metrics.high_ratings} high ratings`}
              />
              <MetricCard
                title="Response Rate"
                value={`${analyticsData.response_times.response_within_30min_rate}%`}
                icon={<Clock className="h-6 w-6" />}
                color="blue"
                subtitle="Within 30 minutes"
              />
            </div>
          </div>
        ) : null}
      </main>
    </div>
  )
}