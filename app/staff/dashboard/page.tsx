"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { ProtectedRoute } from "@/components/protected-route"
import { RoleBasedNav } from "@/components/navigation/role-based-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  User,
  Building,
  Calendar,
  Activity
} from "lucide-react"
import { apiClient, type Concern, type StaffMember } from "@/lib/api-client"
import { websocketService } from "@/lib/websocket-service"

interface StaffDashboardStats {
  total_assigned: number
  newly_assigned: number
  pending: number
  in_progress: number
  resolved: number
  total_resolved: number
  overdue: number
  archived: number
  total_all_time: number
  this_week_resolved: number
  avg_response_time: string
}

export default function StaffDashboard() {
  const { user } = useAuth()
  const [concerns, setConcerns] = useState<Concern[]>([])
  const [stats, setStats] = useState<StaffDashboardStats>({
    total_assigned: 0,
    newly_assigned: 0,
    pending: 0,
    in_progress: 0,
    resolved: 0,
    total_resolved: 0,
    overdue: 0,
    archived: 0,
    total_all_time: 0,
    this_week_resolved: 0,
    avg_response_time: "0 hours"
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      let timeoutId: NodeJS.Timeout | null = null
      
      try {
        setLoading(true)
        
        // Add timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          setLoading(false)
          console.warn('Dashboard loading timeout - showing default state')
        }, 10000) // 10 second timeout
        
        // Fetch dashboard stats from backend and concerns for display
        const [dashboardStats, activeConcerns, archivedConcerns] = await Promise.all([
          apiClient.getMyDashboardStats(),
          apiClient.getMyConcerns(),
          apiClient.getMyArchivedConcerns()
        ])
        setConcerns(activeConcerns)

        // Calculate additional stats that aren't provided by backend
        const now = new Date()
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

        const calculatedStats: StaffDashboardStats = {
          ...dashboardStats,
          this_week_resolved: archivedConcerns.filter(c => {
            const resolvedAt = c.resolved_at ? new Date(c.resolved_at) : null
            return resolvedAt && resolvedAt >= oneWeekAgo
          }).length,
          avg_response_time: "2.5 hours" // This would be calculated from actual data
        }

        setStats(calculatedStats)
        if (timeoutId) clearTimeout(timeoutId) // Clear timeout on success
      } catch (error) {
        console.error('Failed to fetch staff dashboard data:', error)
        // Set default stats on error to prevent infinite loading
        setStats({
          total_assigned: 0,
          newly_assigned: 0,
          pending: 0,
          in_progress: 0,
          resolved: 0,
          total_resolved: 0,
          overdue: 0,
          archived: 0,
          total_all_time: 0,
          this_week_resolved: 0,
          avg_response_time: "0 hours"
        })
        setConcerns([])
        if (timeoutId) clearTimeout(timeoutId) // Clear timeout on error
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Set up real-time notifications (with delay to prevent conflicts)
    const setupWebSocket = () => {
      const handleConcernAssigned = (data: any) => {
        if (data.assigned_to === user?.id) {
          console.log('New concern assigned:', data)
          // Only refresh if not currently loading
          if (!loading) {
            fetchData()
          }
        }
      }

      const handleChatMessage = (data: any) => {
        console.log('New chat message:', data)
      }

      // Register WebSocket listeners
      websocketService.on('concern_assigned', handleConcernAssigned)
      websocketService.on('chat_message', handleChatMessage)

      return () => {
        websocketService.off('concern_assigned', handleConcernAssigned)
        websocketService.off('chat_message', handleChatMessage)
      }
    }

    // Set up WebSocket after a short delay to prevent conflicts
    const cleanup = setupWebSocket()
    return cleanup
  }, [user?.id]) // Only depend on user.id to prevent infinite loop

  if (!user || user.role !== 'staff') {
    return (
      <ProtectedRoute allowedRoles={['staff']}>
        <div>Access denied</div>
      </ProtectedRoute>
    )
  }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['staff']}>
        <div className="min-h-screen bg-gray-50">
          <RoleBasedNav />
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading dashboard...</p>
              <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
            </div>
          </div>
        </div>
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
                <h1 className="text-2xl font-bold text-gray-900">Staff Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user.name}</p>
              </div>
              <div className="flex items-center space-x-4">
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
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
                  {/* Total Assigned */}
                  <Card className="border-blue-500/20 bg-gradient-to-br from-white to-blue-50/30 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                      <CardTitle className="text-sm font-semibold text-gray-700">Total Assigned</CardTitle>
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                        <MessageSquare className="h-5 w-5 text-white" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-blue-600 mb-1">{stats.total_assigned}</div>
                      <p className="text-sm text-gray-600 font-medium">Active concerns</p>
                    </CardContent>
                  </Card>

                  {/* New Assigned */}
                  <Card className="border-purple-500/20 bg-gradient-to-br from-white to-purple-50/30 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                      <CardTitle className="text-sm font-semibold text-gray-700">New Assigned</CardTitle>
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                        <Activity className="h-5 w-5 text-white" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-purple-600 mb-1">{stats.newly_assigned}</div>
                      <p className="text-sm text-gray-600 font-medium">Recently assigned</p>
                    </CardContent>
                  </Card>

                  {/* In Progress */}
                  <Card className="border-orange-500/20 bg-gradient-to-br from-white to-orange-50/30 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                      <CardTitle className="text-sm font-semibold text-gray-700">In Progress</CardTitle>
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/25">
                        <Clock className="h-5 w-5 text-white" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-orange-600 mb-1">{stats.in_progress}</div>
                      <p className="text-sm text-gray-600 font-medium">Being worked on</p>
                    </CardContent>
                  </Card>

                  {/* Resolved */}
                  <Card className="border-green-500/20 bg-gradient-to-br from-white to-green-50/30 hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                      <CardTitle className="text-sm font-semibold text-gray-700">Resolved</CardTitle>
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/25">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-600 mb-1">{stats.total_resolved}</div>
                      <p className="text-sm text-gray-600 font-medium">
                        {stats.resolved > 0 ? `${stats.resolved} active` : 'All archived'}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Overdue - Enhanced for urgency */}
                  <Card className="border-red-500/30 bg-gradient-to-br from-white to-red-50/40 hover:shadow-xl hover:shadow-red-500/20 transition-all duration-300 ring-1 ring-red-200/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                      <CardTitle className="text-sm font-semibold text-gray-700">Overdue</CardTitle>
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/30">
                        <AlertCircle className="h-5 w-5 text-white" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-red-600 mb-1">{stats.overdue}</div>
                      <p className="text-sm text-gray-600 font-medium">Requires attention</p>
                    </CardContent>
                  </Card>

                  {/* Archived */}
                  <Card className="border-gray-500/20 bg-gradient-to-br from-white to-gray-50/30 hover:shadow-xl hover:shadow-gray-500/10 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                      <CardTitle className="text-sm font-semibold text-gray-700">Archived</CardTitle>
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center shadow-lg shadow-gray-500/25">
                        <Building className="h-5 w-5 text-white" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-gray-600 mb-1">{stats.archived}</div>
                      <p className="text-sm text-gray-600 font-medium">Completed items</p>
                    </CardContent>
                  </Card>

                  {/* Total All Time */}
                  <Card className="border-indigo-500/20 bg-gradient-to-br from-white to-indigo-50/30 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                      <CardTitle className="text-sm font-semibold text-gray-700">Total All Time</CardTitle>
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                        <Calendar className="h-5 w-5 text-white" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-indigo-600 mb-1">{stats.total_all_time}</div>
                      <p className="text-sm text-gray-600 font-medium">
                        {stats.total_assigned > 0 ? `${stats.total_assigned} active` : 'All completed'}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2" />
                        This Week's Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Concerns Resolved</span>
                          <span className="font-semibold text-green-600">{stats.this_week_resolved}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Avg Response Time</span>
                          <span className="font-semibold text-blue-600">{stats.avg_response_time}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Resolution Rate</span>
                          <span className="font-semibold text-purple-600">
                            {stats.total_assigned > 0 ? Math.round((stats.resolved / stats.total_assigned) * 100) : 0}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Activity className="h-5 w-5 mr-2" />
                        Quick Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Button className="w-full justify-start" variant="outline">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          View My Concerns
                        </Button>
                        <Button className="w-full justify-start" variant="outline">
                          <User className="h-4 w-4 mr-2" />
                          Update Profile
                        </Button>
                        <Button className="w-full justify-start" variant="outline">
                          <Building className="h-4 w-4 mr-2" />
                          Department Info
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Concerns */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MessageSquare className="h-5 w-5 mr-2" />
                      Recent Assigned Concerns
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {concerns.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <MessageSquare className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                        <p className="text-lg font-medium">No concerns assigned yet</p>
                        <p className="text-sm">You'll see assigned concerns here once they're assigned to you</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {concerns.slice(0, 5).map((concern) => (
                          <div key={concern.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{concern.subject}</h4>
                              <p className="text-sm text-gray-600">#{concern.reference_number}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant={
                                  concern.priority === 'urgent' ? 'destructive' :
                                  concern.priority === 'high' ? 'default' :
                                  concern.priority === 'medium' ? 'secondary' : 'outline'
                                }>
                                  {concern.priority}
                                </Badge>
                                <Badge variant={
                                  concern.status === 'resolved' ? 'default' :
                                  concern.status === 'in_progress' ? 'secondary' : 'outline'
                                }>
                                  {concern.status}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">
                                {new Date(concern.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
