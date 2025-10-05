"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare, Users, TrendingUp, Clock, CheckCircle, AlertTriangle } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useEffect, useState } from "react"

interface DepartmentHeadStats {
  departmentConcerns: number
  departmentUsers: number
  resolutionRate: number
  avgResponseTime: string
  priorityActions: {
    highPriority: number
    pendingReviews: number
    resolvedToday: number
  }
  recentActivity: Array<{
    action: string
    student: string
    time: string
    priority: string
  }>
}

export function DepartmentHeadDashboard() {
  const [stats, setStats] = useState<DepartmentHeadStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get department-specific data
        const concernsResponse = await apiClient.getConcerns({ department_id: 1 }) // TODO: Get department head's department
        const concerns = concernsResponse.data
        
        const departmentConcerns = concerns.length
        const departmentUsers = 12 // TODO: Get actual department users count
        const resolutionRate = 87 // TODO: Calculate actual resolution rate
        const avgResponseTime = "2.4h" // TODO: Calculate actual response time
        
        const highPriority = concerns.filter(c => c.priority === 'high' || c.priority === 'urgent').length
        const pendingReviews = concerns.filter(c => c.status === 'pending').length
        const resolvedToday = concerns.filter(c => 
          c.status === 'resolved' && 
          new Date(c.resolved_at || '').toDateString() === new Date().toDateString()
        ).length
        
        const recentActivity = concerns
          .slice(0, 4)
          .map(concern => ({
            action: `Concern: ${concern.subject}`,
            student: concern.is_anonymous ? 'Anonymous Student' : concern.student.name,
            time: new Date(concern.created_at).toLocaleDateString(),
            priority: concern.priority
          }))

        setStats({
          departmentConcerns,
          departmentUsers,
          resolutionRate,
          avgResponseTime,
          priorityActions: {
            highPriority,
            pendingReviews,
            resolvedToday
          },
          recentActivity
        })
      } catch (err) {
        console.error("Failed to fetch department head stats:", err)
        setError("Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-[#1E2A78]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-[#1E2A78] hover:bg-[#2480EA]">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Department Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-[#1E2A78]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Department Concerns</CardTitle>
            <MessageSquare className="h-4 w-4 text-[#2480EA]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1E2A78]">{stats?.departmentConcerns || 0}</div>
            <p className="text-xs text-muted-foreground">Total concerns</p>
          </CardContent>
        </Card>

        <Card className="border-[#1E2A78]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Department Users</CardTitle>
            <Users className="h-4 w-4 text-[#2480EA]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1E2A78]">{stats?.departmentUsers || 0}</div>
            <p className="text-xs text-muted-foreground">Active users</p>
          </CardContent>
        </Card>

        <Card className="border-[#1E2A78]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.resolutionRate || 0}%</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card className="border-[#1E2A78]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-[#E22824]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1E2A78]">{stats?.avgResponseTime || "0h"}</div>
            <p className="text-xs text-muted-foreground">Average time</p>
          </CardContent>
        </Card>
      </div>

      {/* Department Management */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-[#1E2A78]">Department Overview</CardTitle>
            <CardDescription>BS Information Technology Department</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start bg-[#1E2A78] hover:bg-[#2480EA]">
              <MessageSquare className="mr-2 h-4 w-4" />
              Review All Concerns
            </Button>
            <Button className="w-full justify-start bg-[#1E2A78] hover:bg-[#2480EA]">
              <Users className="mr-2 h-4 w-4" />
              Manage Users
            </Button>
            <Button className="w-full justify-start bg-[#1E2A78] hover:bg-[#2480EA]">
              <TrendingUp className="mr-2 h-4 w-4" />
              Department Reports
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[#1E2A78]">Priority Actions</CardTitle>
            <CardDescription>Items requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-[#E22824]" />
                <span className="text-sm">High Priority Concerns</span>
              </div>
              <Badge variant="destructive">{stats?.priorityActions.highPriority || 0}</Badge>
            </div>
            <div className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-[#DFD10F]" />
                <span className="text-sm">Pending Reviews</span>
              </div>
              <Badge variant="secondary">{stats?.priorityActions.pendingReviews || 0}</Badge>
            </div>
            <div className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Resolved Today</span>
              </div>
              <Badge variant="secondary">{stats?.priorityActions.resolvedToday || 0}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Department Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[#1E2A78]">Recent Department Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium text-[#1E2A78]">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.student}</p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        activity.priority === "high" || activity.priority === "urgent"
                          ? "destructive"
                          : activity.priority === "resolved"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {activity.time}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p>No recent department activity</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
