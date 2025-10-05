"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Bell, 
  Send, 
  Users, 
  Building, 
  Shield, 
  AlertTriangle,
  MessageSquare,
  Settings,
  TestTube,
  History,
  Target,
  Clock
} from "lucide-react"
import { apiClient } from "@/lib/api-client"

interface NotificationTemplate {
  id: string
  name: string
  title: string
  body: string
  type: string
  target: string
  enabled: boolean
}

interface NotificationStats {
  total_sent: number
  total_delivered: number
  total_failed: number
  active_tokens: number
  users_with_tokens: number
}

export function NotificationManagement() {
  const [activeTab, setActiveTab] = useState("send")
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<NotificationStats | null>(null)
  const [departments, setDepartments] = useState<any[]>([])
  const [recentNotifications, setRecentNotifications] = useState<any[]>([])
  
  // Send notification form
  const [notificationForm, setNotificationForm] = useState({
    title: "",
    body: "",
    type: "general",
    target: "all",
    department_id: "",
    role: "",
    priority: "normal",
    scheduled: false,
    scheduled_at: "",
  })

  // Templates
  const [templates, setTemplates] = useState<NotificationTemplate[]>([
    {
      id: "welcome",
      name: "Welcome Message",
      title: "Welcome to StudentLink!",
      body: "Thank you for joining our platform. We're here to help with all your concerns.",
      type: "welcome",
      target: "new_users",
      enabled: true
    },
    {
      id: "concern_update",
      name: "Concern Update",
      title: "Concern Status Update",
      body: "Your concern has been updated. Please check the details.",
      type: "concern_update",
      target: "specific_user",
      enabled: true
    },
    {
      id: "announcement",
      name: "New Announcement",
      title: "Important Announcement",
      body: "A new announcement has been posted. Please read it carefully.",
      type: "announcement",
      target: "all",
      enabled: true
    },
    {
      id: "emergency",
      name: "Emergency Alert",
      title: "Emergency Alert",
      body: "This is an emergency notification. Please follow the instructions.",
      type: "emergency",
      target: "all",
      enabled: true
    }
  ])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [departmentsData, statsData, recentData] = await Promise.all([
        apiClient.getDepartments(),
        apiClient.getNotificationStats(),
        apiClient.getRecentNotifications(10)
      ])
      
      setDepartments(departmentsData)
      setStats(statsData)
      setRecentNotifications(recentData)
    } catch (error) {
      console.error("Failed to fetch notification data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendNotification = async () => {
    if (!notificationForm.title || !notificationForm.body) {
      alert("Please fill in the title and body")
      return
    }

    setLoading(true)
    try {
      const result = await apiClient.sendNotification(notificationForm)
      
      if (result.success) {
        alert("Notification sent successfully!")
        setNotificationForm({
          title: "",
          body: "",
          type: "general",
          target: "all",
          department_id: "",
          role: "",
          priority: "normal",
          scheduled: false,
          scheduled_at: "",
        })
        fetchData() // Refresh stats
      } else {
        alert("Failed to send notification: " + result.message)
      }
    } catch (error) {
      console.error("Failed to send notification:", error)
      alert("Failed to send notification")
    } finally {
      setLoading(false)
    }
  }

  const handleTestNotification = async () => {
    if (!notificationForm.title || !notificationForm.body) {
      alert("Please fill in the title and body")
      return
    }

    setLoading(true)
    try {
      const result = await apiClient.testNotification({
        title: notificationForm.title,
        body: notificationForm.body
      })
      
      if (result.success) {
        alert("Test notification sent successfully!")
      } else {
        alert("Failed to send test notification: " + result.message)
      }
    } catch (error) {
      console.error("Failed to send test notification:", error)
      alert("Failed to send test notification")
    } finally {
      setLoading(false)
    }
  }

  const handleTemplateSelect = (template: NotificationTemplate) => {
    setNotificationForm(prev => ({
      ...prev,
      title: template.title,
      body: template.body,
      type: template.type,
      target: template.target
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1E2A78]">Notification Management</h2>
          <p className="text-gray-600">Send push notifications to users and manage notification settings</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setActiveTab("send")}
            className={activeTab === "send" ? "bg-[#1E2A78] text-white" : ""}
          >
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
          <Button
            variant="outline"
            onClick={() => setActiveTab("templates")}
            className={activeTab === "templates" ? "bg-[#1E2A78] text-white" : ""}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Templates
          </Button>
          <Button
            variant="outline"
            onClick={() => setActiveTab("stats")}
            className={activeTab === "stats" ? "bg-[#1E2A78] text-white" : ""}
          >
            <Bell className="h-4 w-4 mr-2" />
            Statistics
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Send className="h-8 w-8 text-[#1E2A78]" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Sent</p>
                  <p className="text-2xl font-bold text-[#1E2A78]">{stats.total_sent}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Bell className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Delivered</p>
                  <p className="text-2xl font-bold text-green-600">{stats.total_delivered}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{stats.total_failed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Tokens</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.active_tokens}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Send Notification Tab */}
      {activeTab === "send" && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-[#1E2A78]" />
                Send Notification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Title *</label>
                <Input
                  placeholder="Notification title"
                  value={notificationForm.title}
                  onChange={(e) => setNotificationForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Message *</label>
                <Textarea
                  placeholder="Notification message"
                  value={notificationForm.body}
                  onChange={(e) => setNotificationForm(prev => ({ ...prev, body: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-2 block">Type</label>
                  <Select
                    value={notificationForm.type}
                    onValueChange={(value) => setNotificationForm(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="announcement">Announcement</SelectItem>
                      <SelectItem value="concern_update">Concern Update</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Priority</label>
                  <Select
                    value={notificationForm.priority}
                    onValueChange={(value) => setNotificationForm(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Target Audience</label>
                <Select
                  value={notificationForm.target}
                  onValueChange={(value) => setNotificationForm(prev => ({ ...prev, target: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="students">Students Only</SelectItem>
                    <SelectItem value="department_heads">Department Heads Only</SelectItem>
                    <SelectItem value="department">Specific Department</SelectItem>
                    <SelectItem value="role">Specific Role</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {notificationForm.target === "department" && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Department</label>
                  <Select
                    value={notificationForm.department_id}
                    onValueChange={(value) => setNotificationForm(prev => ({ ...prev, department_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {notificationForm.target === "role" && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Role</label>
                  <Select
                    value={notificationForm.role}
                    onValueChange={(value) => setNotificationForm(prev => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="department_head">Department Head</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id="scheduled"
                  checked={notificationForm.scheduled}
                  onCheckedChange={(checked) => setNotificationForm(prev => ({ ...prev, scheduled: checked }))}
                />
                <label htmlFor="scheduled" className="text-sm">
                  Schedule for later
                </label>
              </div>

              {notificationForm.scheduled && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Schedule Date & Time</label>
                  <Input
                    type="datetime-local"
                    value={notificationForm.scheduled_at}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, scheduled_at: e.target.value }))}
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleSendNotification}
                  disabled={loading}
                  className="flex-1 bg-[#1E2A78] hover:bg-[#2480EA]"
                >
                  {loading ? "Sending..." : "Send Notification"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleTestNotification}
                  disabled={loading}
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  Test
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-[#1E2A78]" />
                Quick Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-sm">{template.name}</h4>
                        <p className="text-xs text-gray-600 mt-1">{template.title}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {template.target}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === "templates" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-[#1E2A78]" />
              Notification Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {templates.map((template) => (
                <div key={template.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{template.name}</h3>
                      <Badge variant={template.enabled ? "default" : "secondary"}>
                        {template.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={template.enabled}
                        onCheckedChange={(checked) => {
                          setTemplates(prev => prev.map(t => 
                            t.id === template.id ? { ...t, enabled: checked } : t
                          ))
                        }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTemplateSelect(template)}
                      >
                        Use Template
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium">Title: </span>
                      <span className="text-sm">{template.title}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Body: </span>
                      <span className="text-sm">{template.body}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span>Type: {template.type}</span>
                      <span>Target: {template.target}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Tab */}
      {activeTab === "stats" && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-[#1E2A78]" />
                Delivery Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Sent</span>
                    <span className="font-semibold">{stats.total_sent}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Successfully Delivered</span>
                    <span className="font-semibold text-green-600">{stats.total_delivered}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Failed Deliveries</span>
                    <span className="font-semibold text-red-600">{stats.total_failed}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Success Rate</span>
                    <span className="font-semibold">
                      {stats.total_sent > 0 ? Math.round((stats.total_delivered / stats.total_sent) * 100) : 0}%
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#1E2A78]" />
                Token Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Active FCM Tokens</span>
                    <span className="font-semibold">{stats.active_tokens}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Users with Tokens</span>
                    <span className="font-semibold">{stats.users_with_tokens}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Tokens per User</span>
                    <span className="font-semibold">
                      {stats.users_with_tokens > 0 ? Math.round(stats.active_tokens / stats.users_with_tokens * 10) / 10 : 0}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Notifications */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-[#1E2A78]" />
                Recent Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentNotifications.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No recent notifications
                </div>
              ) : (
                <div className="space-y-3">
                  {recentNotifications.map((notification, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          <p className="text-xs text-gray-600 mt-1">{notification.body}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className="text-xs">
                            {notification.type}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(notification.created_at).toLocaleDateString()}
                          </p>
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
    </div>
  )
}
