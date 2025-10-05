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
  Users, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Eye,
  Filter,
  Search,
  RefreshCw
} from "lucide-react"
import { apiClient, type StaffMember, type Concern } from "@/lib/api-client"

interface StaffPerformance {
  id: number
  name: string
  email: string
  employee_id: string
  total_concerns: number
  pending_concerns: number
  in_progress_concerns: number
  resolved_concerns: number
  avg_response_time: string
  resolution_rate: number
  last_activity: string
  is_online: boolean
}

interface DepartmentStats {
  total_staff: number
  total_concerns: number
  pending_concerns: number
  in_progress_concerns: number
  resolved_concerns: number
  avg_response_time: string
  resolution_rate: number
  staff_performance: StaffPerformance[]
}

export default function DepartmentOversight() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DepartmentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [performanceFilter, setPerformanceFilter] = useState("all")

  useEffect(() => {
    const fetchOversightData = async () => {
      if (!user || user.role !== 'department_head') return

      try {
        setLoading(true)
        
        // Fetch staff and their performance data
        const staffData = await apiClient.getStaff()
        const concernsData = await apiClient.getConcerns({
          department_id: user.department_id,
          per_page: 100
        })
        
        // Calculate performance metrics for each staff member
        const staffPerformance: StaffPerformance[] = staffData.map(staff => {
          const staffConcerns = concernsData.data.filter(concern => 
            concern.assigned_to?.id === staff.id
          )
          
          const total = staffConcerns.length
          const pending = staffConcerns.filter(c => c.status === 'pending').length
          const inProgress = staffConcerns.filter(c => c.status === 'in_progress').length
          const resolved = staffConcerns.filter(c => c.status === 'resolved').length
          
          const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0
          const avgResponseTime = "2.5 hours" // This would be calculated from actual data
          
          return {
            id: staff.id,
            name: staff.name,
            email: staff.email,
            employee_id: staff.employee_id || 'N/A',
            total_concerns: total,
            pending_concerns: pending,
            in_progress_concerns: inProgress,
            resolved_concerns: resolved,
            avg_response_time: avgResponseTime,
            resolution_rate: resolutionRate,
            last_activity: staff.last_login_at || 'Never',
            is_online: false // This would come from real-time status
          }
        })
        
        // Calculate department-wide stats
        const totalStaff = staffData.length
        const totalConcerns = concernsData.data.length
        const pendingConcerns = concernsData.data.filter(c => c.status === 'pending').length
        const inProgressConcerns = concernsData.data.filter(c => c.status === 'in_progress').length
        const resolvedConcerns = concernsData.data.filter(c => c.status === 'resolved').length
        const departmentResolutionRate = totalConcerns > 0 ? Math.round((resolvedConcerns / totalConcerns) * 100) : 0
        
        setStats({
          total_staff: totalStaff,
          total_concerns: totalConcerns,
          pending_concerns: pendingConcerns,
          in_progress_concerns: inProgressConcerns,
          resolved_concerns: resolvedConcerns,
          avg_response_time: "2.5 hours",
          resolution_rate: departmentResolutionRate,
          staff_performance: staffPerformance
        })
        
      } catch (error) {
        console.error('Failed to fetch oversight data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOversightData()
  }, [user])

  const filteredStaff = stats?.staff_performance.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && staff.total_concerns > 0) ||
      (statusFilter === 'idle' && staff.total_concerns === 0) ||
      (statusFilter === 'overloaded' && staff.total_concerns > 10)
    
    const matchesPerformance = performanceFilter === 'all' ||
      (performanceFilter === 'high' && staff.resolution_rate >= 80) ||
      (performanceFilter === 'medium' && staff.resolution_rate >= 50 && staff.resolution_rate < 80) ||
      (performanceFilter === 'low' && staff.resolution_rate < 50)
    
    return matchesSearch && matchesStatus && matchesPerformance
  }) || []

  const getPerformanceColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600 bg-green-100'
    if (rate >= 50) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getWorkloadColor = (total: number) => {
    if (total === 0) return 'text-gray-600 bg-gray-100'
    if (total <= 5) return 'text-green-600 bg-green-100'
    if (total <= 10) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
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
                <h1 className="text-2xl font-bold text-gray-900">Staff Oversight</h1>
                <p className="text-gray-600">Monitor staff performance and department operations</p>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="text-blue-600 border-blue-600">
                  {user.department}
                </Badge>
                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
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
                {/* Department Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Total Staff</p>
                          <p className="text-2xl font-bold text-gray-900">{stats?.total_staff || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <MessageSquare className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Total Concerns</p>
                          <p className="text-2xl font-bold text-gray-900">{stats?.total_concerns || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                          <Clock className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                          <p className="text-2xl font-bold text-gray-900">{stats?.avg_response_time || 'N/A'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <TrendingUp className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Resolution Rate</p>
                          <p className="text-2xl font-bold text-gray-900">{stats?.resolution_rate || 0}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Concern Status Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2" />
                      Concern Status Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">{stats?.pending_concerns || 0}</div>
                        <div className="text-sm text-yellow-700">Pending</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{stats?.in_progress_concerns || 0}</div>
                        <div className="text-sm text-blue-700">In Progress</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{stats?.resolved_concerns || 0}</div>
                        <div className="text-sm text-green-700">Resolved</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Staff Performance */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center">
                        <Activity className="h-5 w-5 mr-2" />
                        Staff Performance
                      </CardTitle>
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <Input
                            placeholder="Search staff..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 w-64"
                          />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="idle">Idle</SelectItem>
                            <SelectItem value="overloaded">Overloaded</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={performanceFilter} onValueChange={setPerformanceFilter}>
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Performance" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Performance</SelectItem>
                            <SelectItem value="high">High (80%+)</SelectItem>
                            <SelectItem value="medium">Medium (50-79%)</SelectItem>
                            <SelectItem value="low">Low (&lt;50%)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {filteredStaff.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                        <p className="text-lg font-medium">No staff members found</p>
                        <p className="text-sm">Try adjusting your search or filter criteria</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredStaff.map((staff) => (
                          <div
                            key={staff.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-semibold text-lg">
                                  {staff.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{staff.name}</h3>
                                <p className="text-sm text-gray-600">{staff.email}</p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    ID: {staff.employee_id}
                                  </Badge>
                                  <div className="flex items-center space-x-1">
                                    <div className={`w-2 h-2 rounded-full ${
                                      staff.is_online ? 'bg-green-500' : 'bg-gray-300'
                                    }`} />
                                    <span className="text-xs text-gray-500">
                                      {staff.is_online ? 'Online' : 'Offline'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-6">
                              {/* Workload */}
                              <div className="text-center">
                                <div className={`text-lg font-semibold ${getWorkloadColor(staff.total_concerns)}`}>
                                  {staff.total_concerns}
                                </div>
                                <div className="text-xs text-gray-500">Total Concerns</div>
                              </div>

                              {/* Performance */}
                              <div className="text-center">
                                <div className={`text-lg font-semibold ${getPerformanceColor(staff.resolution_rate)}`}>
                                  {staff.resolution_rate}%
                                </div>
                                <div className="text-xs text-gray-500">Resolution Rate</div>
                              </div>

                              {/* Response Time */}
                              <div className="text-center">
                                <div className="text-lg font-semibold text-gray-900">
                                  {staff.avg_response_time}
                                </div>
                                <div className="text-xs text-gray-500">Avg Response</div>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center space-x-2">
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4 mr-1" />
                                  View Details
                                </Button>
                              </div>
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
