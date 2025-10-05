"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { ProtectedRoute } from "@/components/protected-route"
import { RoleBasedNav } from "@/components/navigation/role-based-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  Calendar,
  Target,
  Award
} from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { MetricCard } from "@/components/analytics/metric-card"

interface StaffAnalyticsData {
  overview: {
    total_assigned: number
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

export default function StaffAnalyticsPage() {
  const { user } = useAuth()
  const [analyticsData, setAnalyticsData] = useState<StaffAnalyticsData | null>(null)
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
      
      // Get staff-specific analytics by filtering by staff_id
      const data = await apiClient.getAdvancedAnalytics({
        ...filters,
        staff_id: user?.id
      })
      setAnalyticsData(data)
    } catch (err) {
      console.error('Failed to fetch staff analytics:', err)
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

  if (!user || user.role !== 'staff') {
    return (
      <ProtectedRoute allowedRoles={['staff']}>
        <div>Access denied</div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={['staff']}>
      <div className="flex h-screen bg-gray-50">
        <RoleBasedNav />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <TrendingUp className="h-8 w-8 mr-3 text-blue-600" />
                  My Performance Analytics
                </h1>
                <p className="text-gray-600">
                  Track your performance and improvement over time
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
                <Badge variant="outline" className="text-blue-600 border-blue-600">
                  {user.department}
                </Badge>
                <Badge variant="secondary">
                  Staff Member
                </Badge>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-6">
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
                    title="Total Assigned"
                    value={analyticsData.overview.total_assigned}
                    icon={<BarChart3 className="h-6 w-6" />}
                    color="blue"
                    subtitle="All time assignments"
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
                    subtitle="High priority handled"
                  />
                  <MetricCard
                    title="Avg Resolution Time"
                    value={`${analyticsData.overview.avg_resolution_time}h`}
                    icon={<Clock className="h-6 w-6" />}
                    color="purple"
                    subtitle="Average time to resolve"
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
                    title="Fastest Resolution"
                    value={`${analyticsData.performance.fastest_resolution_hours}h`}
                    icon={<Award className="h-6 w-6" />}
                    color="yellow"
                    subtitle="Best performance"
                  />
                </div>

                {/* Current Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <MetricCard
                    title="Pending"
                    value={analyticsData.overview.pending_concerns}
                    icon={<Clock className="h-6 w-6" />}
                    color="yellow"
                    subtitle="Awaiting your action"
                  />
                  <MetricCard
                    title="In Progress"
                    value={analyticsData.overview.in_progress_concerns}
                    icon={<Target className="h-6 w-6" />}
                    color="blue"
                    subtitle="Currently working on"
                  />
                  <MetricCard
                    title="Satisfaction Rate"
                    value={`${analyticsData.satisfaction_metrics.satisfaction_rate}%`}
                    icon={<Award className="h-6 w-6" />}
                    color="green"
                    subtitle={`${analyticsData.satisfaction_metrics.total_rated} total ratings`}
                  />
                </div>

                {/* Performance Trends */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Performance Trends (Last 30 Days)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analyticsData.trends.data.length > 0 ? (
                      <div className="space-y-4">
                        {analyticsData.trends.data.slice(-7).map((trend, index) => (
                          <div key={trend.period} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">{trend.period}</p>
                              <p className="text-sm text-gray-500">
                                {trend.total_concerns} concerns, {trend.resolved_concerns} resolved
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge variant={trend.resolution_rate >= 80 ? "default" : "secondary"}>
                                {trend.resolution_rate}%
                              </Badge>
                              <p className="text-sm text-gray-500 mt-1">
                                {trend.avg_resolution_time}h avg
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No performance data available for the selected period</p>
                        <p className="text-sm text-gray-400 mt-2">Data will appear as you work on concerns</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Satisfaction Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Award className="h-5 w-5 mr-2" />
                      Student Satisfaction
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">
                          {analyticsData.satisfaction_metrics.high_ratings}
                        </p>
                        <p className="text-sm text-green-600">High Ratings (4-5★)</p>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <p className="text-2xl font-bold text-yellow-600">
                          {analyticsData.satisfaction_metrics.good_ratings}
                        </p>
                        <p className="text-sm text-yellow-600">Good Ratings (3★)</p>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <p className="text-2xl font-bold text-red-600">
                          {analyticsData.satisfaction_metrics.low_ratings}
                        </p>
                        <p className="text-sm text-red-600">Low Ratings (1-2★)</p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">
                          {analyticsData.satisfaction_metrics.avg_rating.toFixed(1)}
                        </p>
                        <p className="text-sm text-blue-600">Average Rating</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
