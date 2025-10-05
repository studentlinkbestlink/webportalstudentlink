"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  User,
  Calendar,
  Activity,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info
} from "lucide-react"
import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"

interface AuditLog {
  id: number
  user_id: number
  user_name: string
  action: string
  resource: string
  resource_id: number
  details: string
  ip_address: string
  user_agent: string
  status: 'success' | 'failed' | 'warning'
  created_at: string
}

export function AuditLogs() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [actionFilter, setActionFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [exporting, setExporting] = useState(false)
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 20,
    total: 0,
    last_page: 1
  })
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchAuditLogs()
  }, [currentPage, searchTerm, statusFilter, actionFilter, dateFilter])

  const fetchAuditLogs = async () => {
    try {
      setLoading(true)
      const filters: any = {
        page: currentPage,
        per_page: 20
      }

      if (searchTerm) filters.search = searchTerm
      if (statusFilter !== "all") filters.status = statusFilter
      if (actionFilter !== "all") filters.action = actionFilter
      if (dateFilter !== "all") {
        const now = new Date()
        switch (dateFilter) {
          case "today":
            filters.date_from = now.toISOString().split('T')[0]
            filters.date_to = now.toISOString().split('T')[0]
            break
          case "week":
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            filters.date_from = weekAgo.toISOString().split('T')[0]
            filters.date_to = now.toISOString().split('T')[0]
            break
          case "month":
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            filters.date_from = monthAgo.toISOString().split('T')[0]
            filters.date_to = now.toISOString().split('T')[0]
            break
        }
      }

      const response = await apiClient.getAuditLogs(filters)
      setAuditLogs(response.data)
      setPagination(response.pagination)
    } catch (error) {
      console.error('Failed to fetch audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportLogs = async () => {
    try {
      setExporting(true)
      const blob = await apiClient.exportReport('audit-logs', {
        status: statusFilter,
        action: actionFilter,
        date_range: dateFilter
      })
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Failed to export audit logs:', error)
    } finally {
      setExporting(false)
    }
  }

  const handleRefreshLogs = async () => {
    setCurrentPage(1)
    await fetchAuditLogs()
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handleFilterChange = (filterType: string, value: string) => {
    switch (filterType) {
      case 'status':
        setStatusFilter(value)
        break
      case 'action':
        setActionFilter(value)
        break
      case 'date':
        setDateFilter(value)
        break
    }
    setCurrentPage(1) // Reset to first page when filtering
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      default:
        return <Info className="h-4 w-4 text-blue-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'bg-green-100 text-green-800'
      case 'update':
        return 'bg-blue-100 text-blue-800'
      case 'delete':
        return 'bg-red-100 text-red-800'
      case 'login':
        return 'bg-purple-100 text-purple-800'
      case 'logout':
        return 'bg-gray-100 text-gray-800'
      case 'export':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#1E2A78]">Audit Logs</h1>
          <p className="text-gray-600">Monitor system activities and user actions</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefreshLogs}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={handleExportLogs}
            disabled={exporting || auditLogs.length === 0}
            className="bg-[#1E2A78] hover:bg-[#2480EA]"
          >
            {exporting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export Logs
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Action</label>
              <Select value={actionFilter} onValueChange={(value) => handleFilterChange('action', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="logout">Logout</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="export">Export</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <Select value={dateFilter} onValueChange={(value) => handleFilterChange('date', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Audit Logs ({auditLogs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-[#1E2A78]" />
              <p className="text-gray-500">Loading audit logs...</p>
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No audit logs found matching your criteria.
            </div>
          ) : (
            <div className="space-y-4">
              {auditLogs.map((log) => (
                <div key={log.id} className="border p-4 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(log.status)}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getActionColor(log.action)}>
                            {log.action.toUpperCase()}
                          </Badge>
                          <Badge className={getStatusColor(log.status)}>
                            {log.status.toUpperCase()}
                          </Badge>
                        </div>
                        <h3 className="font-medium text-[#1E2A78]">
                          {log.details}
                        </h3>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(log.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{log.user_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-gray-400" />
                      <span>{log.resource} #{log.resource_id || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-gray-400" />
                      <span>{log.ip_address}</span>
                    </div>
                  </div>
                  
                  {log.user_agent && (
                    <div className="mt-3 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                      <strong>User Agent:</strong> {log.user_agent}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
        {/* Pagination Controls */}
        {pagination && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-gray-600">
              Showing {pagination.from || 0} to {pagination.to || 0} of {pagination.total} entries
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {currentPage} of {pagination.last_page}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= pagination.last_page}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

