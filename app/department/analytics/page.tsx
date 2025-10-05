"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { ProtectedRoute } from "@/components/protected-route"
import { RoleBasedNav } from "@/components/navigation/role-based-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  Star,
  Target,
  Award
} from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { MetricCard } from "@/components/analytics/metric-card"
import { ChartContainer } from "@/components/analytics/chart-container"

interface DepartmentAnalyticsData {
  overview: {
    total_concerns: number
    resolved_concerns: number
    pending_concerns: number
    in_progress_concerns: number
    urgent_concerns: number
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
  satisfaction_metrics: {
    avg_rating: number
    high_ratings: number
    good_ratings: number
    low_ratings: number
    total_rated: number
    satisfaction_rate: number
  }
}

export default function DepartmentAnalyticsPage() {
  const { user } = useAuth()
  const [analyticsData, setAnalyticsData] = useState<DepartmentAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    period: 'daily' as 'hourly' | 'daily' | 'weekly' | 'monthly',
  })
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchAnalytics()
  }, [filters])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Get department-specific analytics by filtering by department_id
      const data = await apiClient.getAdvancedAnalytics({
        ...filters,
        department_id: user?.department_id
      })
      setAnalyticsData(data)
    } catch (err) {
      console.error('Failed to fetch department analytics:', err)
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

  if (!user || user.role !== 'department_head') {
    return (
      <ProtectedRoute allowedRoles={['department_head']}>
        <div>Access denied</div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={['department_head']}>
      <div className="flex h-screen bg-gray-50">
        <RoleBasedNav />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Building className="h-8 w-8 mr-3 text-blue-600" />
                  Department Analytics Dashboard
                </h1>
                <p className="text-gray-600">
                  Monitor department performance and staff analytics
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
                  {user.department}
                </Badge>
                <Badge variant="secondary">
                  Department Head
                </Badge>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-6">
            {/* Filters */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Analytics Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Start Date
                    </label>
                    <Input
                      type="date"
                      value={filters.start_date}
                      onChange={(e) => setFilters(prev => ({ ...prev, start_date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      End Date
                    </label>
                    <Input
                      type="date"
                      value={filters.end_date}
                      onChange={(e) => setFilters(prev => ({ ...prev, end_date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Period
                    </label>
                    <Select
                      value={filters.period}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, period: value as any }))}
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
                </div>
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
                {/* Overview Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <MetricCard
                    title="Total Concerns"
                    value={analyticsData.overview.total_concerns}
                    icon={<BarChart3 className="h-6 w-6" />}
                    color="blue"
                    subtitle="Department total"
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
                    subtitle="High priority items"
                  />
                  <MetricCard
                    title="Avg Resolution Time"
                    value={`${analyticsData.overview.avg_resolution_time}h`}
                    icon={<Clock className="h-6 w-6" />}
                    color="purple"
                    subtitle="Department average"
                  />
                </div>

                {/* Performance Metrics */}
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
                    title="Satisfaction Rate"
                    value={`${analyticsData.satisfaction_metrics.satisfaction_rate}%`}
                    icon={<Star className="h-6 w-6" />}
                    color="yellow"
                    subtitle={`${analyticsData.satisfaction_metrics.total_rated} total ratings`}
                  />
                </div>

                {/* Staff Performance Table */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Staff Performance Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 font-medium">Staff Member</th>
                            <th className="text-right py-3 px-4 font-medium">Total Assigned</th>
                            <th className="text-right py-3 px-4 font-medium">Resolved</th>
                            <th className="text-right py-3 px-4 font-medium">Resolution Rate</th>
                            <th className="text-right py-3 px-4 font-medium">Avg Time</th>
                            <th className="text-right py-3 px-4 font-medium">Urgent</th>
                            <th className="text-right py-3 px-4 font-medium">Performance</th>
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
                              <td className="text-right py-3 px-4">
                                <Badge 
                                  variant={
                                    staff.resolution_rate >= 90 ? "default" :
                                    staff.resolution_rate >= 70 ? "secondary" : "destructive"
                                  }
                                >
                                  {staff.resolution_rate >= 90 ? "Excellent" :
                                   staff.resolution_rate >= 70 ? "Good" : "Needs Improvement"}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ChartContainer
                    title="Department Concerns Over Time"
                    chartType="concerns_over_time"
                    filters={{...filters, department_id: user.department_id}}
                  />
                  <ChartContainer
                    title="Priority Distribution"
                    chartType="priority_distribution"
                    filters={{...filters, department_id: user.department_id}}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ChartContainer
                    title="Resolution Times"
                    chartType="resolution_times"
                    filters={{...filters, department_id: user.department_id}}
                  />
                  <ChartContainer
                    title="Staff Workload"
                    chartType="staff_workload"
                    filters={{...filters, department_id: user.department_id}}
                  />
                </div>

                {/* Current Status Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <MetricCard
                    title="Pending"
                    value={analyticsData.overview.pending_concerns}
                    icon={<Clock className="h-6 w-6" />}
                    color="yellow"
                    subtitle="Awaiting action"
                  />
                  <MetricCard
                    title="In Progress"
                    value={analyticsData.overview.in_progress_concerns}
                    icon={<Target className="h-6 w-6" />}
                    color="blue"
                    subtitle="Currently being handled"
                  />
                  <MetricCard
                    title="Average Rating"
                    value={analyticsData.satisfaction_metrics.avg_rating.toFixed(1)}
                    icon={<Award className="h-6 w-6" />}
                    color="green"
                    subtitle="Student satisfaction"
                  />
                </div>
              </div>
            ) : null}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
