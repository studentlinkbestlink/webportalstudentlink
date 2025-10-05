"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, MessageSquare, Bell, Settings, BarChart3, Shield, Database, Bot } from "lucide-react"
import { apiClient, DashboardStats } from "@/lib/api-client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const dashboardStats = await apiClient.getDashboardStats()
        setStats(dashboardStats)
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err)
        setError("Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  // Navigation handlers
  const handleManageUsers = () => {
    router.push('/admin/users')
  }

  const handleDatabaseAdmin = () => {
    router.push('/admin/settings')
  }

  const handleSystemConfig = () => {
    router.push('/admin/settings')
  }

  const handleAIChatbot = () => {
    router.push('/admin/chatbot')
  }

  const handleSystemAnalytics = () => {
    router.push('/admin/reports')
  }

  const handleNotificationCenter = () => {
    router.push('/admin/announcements')
  }
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
    <div className="space-y-8">
      {/* Admin Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-[#1E2A78]/20 bg-gradient-to-br from-white to-blue-50/30 hover:shadow-xl hover:shadow-[#1E2A78]/10 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Total Users</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2480EA] to-[#1E2A78] flex items-center justify-center shadow-lg shadow-[#2480EA]/25">
              <Users className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1E2A78] mb-1">{stats?.totalUsers || 0}</div>
            <p className="text-sm text-gray-600 font-medium">Registered users</p>
          </CardContent>
        </Card>

        <Card className="border-[#E22824]/20 bg-gradient-to-br from-white to-red-50/30 hover:shadow-xl hover:shadow-[#E22824]/10 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Active Concerns</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E22824] to-[#DC2626] flex items-center justify-center shadow-lg shadow-[#E22824]/25">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#E22824] mb-1">{stats?.activeConcerns || 0}</div>
            <p className="text-sm text-gray-600 font-medium">Currently open</p>
          </CardContent>
        </Card>

        <Card className="border-green-500/20 bg-gradient-to-br from-white to-green-50/30 hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">System Health</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/25">
              <Shield className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 mb-1">{stats?.systemHealth || 0}%</div>
            <p className="text-sm text-gray-600 font-medium">System uptime</p>
          </CardContent>
        </Card>

        <Card className="border-[#2480EA]/20 bg-gradient-to-br from-white to-blue-50/30 hover:shadow-xl hover:shadow-[#2480EA]/10 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">AI Interactions</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2480EA] to-[#1E2A78] flex items-center justify-center shadow-lg shadow-[#2480EA]/25">
              <Bot className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#2480EA] mb-1">{stats?.aiInteractions || 0}</div>
            <p className="text-sm text-gray-600 font-medium">Total interactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Quick Actions */}
      <div className="grid gap-8 md:grid-cols-2">
        <Card className="bg-gradient-to-br from-white to-blue-50/20 border-[#1E2A78]/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-[#1E2A78] text-xl font-bold">System Management</CardTitle>
            <CardDescription className="text-gray-600">Manage system-wide settings and configurations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleManageUsers}
              className="w-full justify-start h-12 text-left bg-gradient-to-r from-[#1E2A78] to-[#2480EA] hover:from-[#1A2568] hover:to-[#1E6FD8] shadow-lg shadow-[#1E2A78]/25"
            >
              <Users className="mr-3 h-5 w-5" />
              <span className="font-semibold">Manage All Users</span>
            </Button>
            <Button 
              onClick={handleDatabaseAdmin}
              className="w-full justify-start h-12 text-left bg-gradient-to-r from-[#1E2A78] to-[#2480EA] hover:from-[#1A2568] hover:to-[#1E6FD8] shadow-lg shadow-[#1E2A78]/25"
            >
              <Database className="mr-3 h-5 w-5" />
              <span className="font-semibold">Database Administration</span>
            </Button>
            <Button 
              onClick={handleSystemConfig}
              className="w-full justify-start h-12 text-left bg-gradient-to-r from-[#1E2A78] to-[#2480EA] hover:from-[#1A2568] hover:to-[#1E6FD8] shadow-lg shadow-[#1E2A78]/25"
            >
              <Settings className="mr-3 h-5 w-5" />
              <span className="font-semibold">System Configuration</span>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white to-blue-50/20 border-[#2480EA]/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-[#2480EA] text-xl font-bold">AI & Analytics</CardTitle>
            <CardDescription className="text-gray-600">Configure AI features and view system analytics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleAIChatbot}
              className="w-full justify-start h-12 text-left bg-gradient-to-r from-[#2480EA] to-[#1E2A78] hover:from-[#1E6FD8] hover:to-[#1A2568] shadow-lg shadow-[#2480EA]/25"
            >
              <Bot className="mr-3 h-5 w-5" />
              <span className="font-semibold">AI Chatbot Settings</span>
            </Button>
            <Button 
              onClick={handleSystemAnalytics}
              className="w-full justify-start h-12 text-left bg-gradient-to-r from-[#2480EA] to-[#1E2A78] hover:from-[#1E6FD8] hover:to-[#1A2568] shadow-lg shadow-[#2480EA]/25"
            >
              <BarChart3 className="mr-3 h-5 w-5" />
              <span className="font-semibold">System Analytics</span>
            </Button>
            <Button 
              onClick={handleNotificationCenter}
              className="w-full justify-start h-12 text-left bg-gradient-to-r from-[#2480EA] to-[#1E2A78] hover:from-[#1E6FD8] hover:to-[#1A2568] shadow-lg shadow-[#2480EA]/25"
            >
              <Bell className="mr-3 h-5 w-5" />
              <span className="font-semibold">Notification Center</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent System Activity */}
      <Card className="bg-gradient-to-br from-white to-gray-50/30 border-gray-200/60">
        <CardHeader className="pb-4">
          <CardTitle className="text-[#1E2A78] text-xl font-bold">Recent System Activity</CardTitle>
          <CardDescription className="text-gray-600">Latest department activities and performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.departmentStats && stats.departmentStats.length > 0 ? (
              stats.departmentStats.map((dept, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50/50 to-white/50 border border-gray-200/60 hover:shadow-md hover:shadow-gray-900/5 transition-all duration-200">
                  <div className="flex-1">
                    <p className="font-semibold text-[#1E2A78] text-lg">{dept.department} Department</p>
                    <p className="text-sm text-gray-600 font-medium">
                      {dept.concernCount} concerns, {dept.resolvedCount} resolved
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-sm font-semibold px-3 py-1">
                      Active
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <BarChart3 className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No recent activity data available</p>
                <p className="text-sm text-gray-400 mt-1">Activity will appear here once departments start using the system</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
