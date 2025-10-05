"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { 
  Building, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  MessageSquare,
  BarChart3,
  Settings,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  MoreHorizontal
} from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { Department } from "@/lib/api-client"

interface DepartmentStats {
  total_concerns: number
  pending_concerns: number
  resolved_concerns: number
  total_users: number
}

interface DepartmentCardProps {
  department: Department
  stats: DepartmentStats
  onEdit: (department: Department) => void
  onDelete: (department: Department) => void
  onViewDetails: (department: Department) => void
}

function DepartmentCard({ department, stats, onEdit, onDelete, onViewDetails }: DepartmentCardProps) {
  const getDepartmentIcon = (type: string) => {
    switch (type) {
      case 'academic':
        return '🎓'
      case 'administrative':
        return '🏢'
      case 'support':
        return '🛠️'
      default:
        return '🏛️'
    }
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{getDepartmentIcon(department.type)}</div>
            <div>
              <CardTitle className="text-lg font-semibold text-[#1E2A78]">
                {department.name}
              </CardTitle>
              <p className="text-sm text-gray-600">{department.code}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(department.is_active)}>
              {department.is_active ? 'Active' : 'Inactive'}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewDetails(department)}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {department.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {department.description}
          </p>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
            <MessageSquare className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-xs text-gray-600">Concerns</p>
              <p className="text-sm font-semibold text-blue-600">{stats.total_concerns}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
            <Users className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-xs text-gray-600">Users</p>
              <p className="text-sm font-semibold text-green-600">{stats.total_users}</p>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        {department.contact_info && (
          <div className="space-y-2">
            {department.contact_info.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-3 w-3" />
                <span>{department.contact_info.phone}</span>
              </div>
            )}
            {department.contact_info.email && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-3 w-3" />
                <span>{department.contact_info.email}</span>
              </div>
            )}
            {department.contact_info.location && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-3 w-3" />
                <span>{department.contact_info.location}</span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(department)}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(department)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(department)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function DepartmentManagement() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [departmentStats, setDepartmentStats] = useState<Record<number, DepartmentStats>>({})
  const [loading, setLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
  const [viewingDepartment, setViewingDepartment] = useState<Department | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    type: "academic" as "academic" | "administrative" | "support",
    contact_info: {
      phone: "",
      email: "",
      location: "",
      office_hours: ""
    },
    is_active: true
  })

  useEffect(() => {
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    setLoading(true)
    try {
      const departmentsData = await apiClient.getDepartments()
      setDepartments(departmentsData)
      
      // Fetch stats for each department
      const statsPromises = departmentsData.map(async (dept) => {
        try {
          const stats = await apiClient.getDepartmentStats(dept.id)
          return { id: dept.id, stats }
        } catch (error) {
          console.error(`Failed to fetch stats for department ${dept.id}:`, error)
          return { id: dept.id, stats: { total_concerns: 0, pending_concerns: 0, resolved_concerns: 0, total_users: 0 } }
        }
      })
      
      const statsResults = await Promise.all(statsPromises)
      const statsMap = statsResults.reduce((acc, { id, stats }) => {
        acc[id] = stats
        return acc
      }, {} as Record<number, DepartmentStats>)
      
      setDepartmentStats(statsMap)
    } catch (error) {
      console.error("Failed to fetch departments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDepartment = async () => {
    if (!formData.name || !formData.code) {
      alert("Please fill in the required fields")
      return
    }

    setLoading(true)
    try {
      await apiClient.createDepartment(formData)
      setShowCreateForm(false)
      resetForm()
      fetchDepartments()
      alert("Department created successfully!")
    } catch (error) {
      console.error("Failed to create department:", error)
      alert("Failed to create department")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateDepartment = async () => {
    if (!editingDepartment || !formData.name || !formData.code) {
      alert("Please fill in the required fields")
      return
    }

    setLoading(true)
    try {
      await apiClient.updateDepartment(editingDepartment.id, formData)
      setEditingDepartment(null)
      resetForm()
      fetchDepartments()
      alert("Department updated successfully!")
    } catch (error) {
      console.error("Failed to update department:", error)
      alert("Failed to update department")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteDepartment = async (department: Department) => {
    if (!confirm(`Are you sure you want to delete ${department.name}?`)) {
      return
    }

    setLoading(true)
    try {
      await apiClient.deleteDepartment(department.id)
      fetchDepartments()
      alert("Department deleted successfully!")
    } catch (error) {
      console.error("Failed to delete department:", error)
      alert("Failed to delete department")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
      type: "academic",
      contact_info: {
        phone: "",
        email: "",
        location: "",
        office_hours: ""
      },
      is_active: true
    })
  }

  const openEditForm = (department: Department) => {
    setEditingDepartment(department)
    setFormData({
      name: department.name,
      code: department.code,
      description: department.description || "",
      type: department.type,
      contact_info: department.contact_info || {
        phone: "",
        email: "",
        location: "",
        office_hours: ""
      },
      is_active: department.is_active
    })
  }

  const filteredDepartments = departments.filter(dept => {
    const matchesSearch = dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dept.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || dept.type === filterType
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "active" && dept.is_active) ||
                         (filterStatus === "inactive" && !dept.is_active)
    
    return matchesSearch && matchesType && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1E2A78]">Department Management</h2>
          <p className="text-gray-600">Manage departments and their quick access forms</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-[#1E2A78] hover:bg-[#2480EA]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Department
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <Input
            placeholder="Search departments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="academic">Academic</SelectItem>
            <SelectItem value="administrative">Administrative</SelectItem>
            <SelectItem value="support">Support</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Department Cards Grid */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredDepartments.map((department) => (
            <DepartmentCard
              key={department.id}
              department={department}
              stats={departmentStats[department.id] || { total_concerns: 0, pending_concerns: 0, resolved_concerns: 0, total_users: 0 }}
              onEdit={openEditForm}
              onDelete={handleDeleteDepartment}
              onViewDetails={setViewingDepartment}
            />
          ))}
        </div>
      )}

      {filteredDepartments.length === 0 && !loading && (
        <div className="text-center py-12">
          <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No departments found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterType !== "all" || filterStatus !== "all"
              ? "Try adjusting your search or filters"
              : "Get started by creating your first department"}
          </p>
          {!searchTerm && filterType === "all" && filterStatus === "all" && (
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-[#1E2A78] hover:bg-[#2480EA]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Department
            </Button>
          )}
        </div>
      )}

      {/* Create/Edit Department Modal */}
      {(showCreateForm || editingDepartment) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-[#1E2A78]" />
                {editingDepartment ? "Edit Department" : "Create New Department"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-2 block">Name *</label>
                  <Input
                    placeholder="Department name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Code *</label>
                  <Input
                    placeholder="Department code"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  placeholder="Department description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-2 block">Type</label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: "academic" | "administrative" | "support") => 
                      setFormData(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="administrative">Administrative</SelectItem>
                      <SelectItem value="support">Support</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <label htmlFor="is_active" className="text-sm">
                    Active
                  </label>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Contact Information</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Phone</label>
                    <Input
                      placeholder="Phone number"
                      value={formData.contact_info.phone}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        contact_info: { ...prev.contact_info, phone: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email</label>
                    <Input
                      placeholder="Email address"
                      type="email"
                      value={formData.contact_info.email}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        contact_info: { ...prev.contact_info, email: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Location</label>
                    <Input
                      placeholder="Office location"
                      value={formData.contact_info.location}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        contact_info: { ...prev.contact_info, location: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Office Hours</label>
                    <Input
                      placeholder="e.g., Mon-Fri 9AM-5PM"
                      value={formData.contact_info.office_hours}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        contact_info: { ...prev.contact_info, office_hours: e.target.value }
                      }))}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={editingDepartment ? handleUpdateDepartment : handleCreateDepartment}
                  disabled={loading}
                  className="flex-1 bg-[#1E2A78] hover:bg-[#2480EA]"
                >
                  {loading ? "Saving..." : editingDepartment ? "Update Department" : "Create Department"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false)
                    setEditingDepartment(null)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Department Details Modal */}
      {viewingDepartment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-[#1E2A78]" />
                {viewingDepartment.name} Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium text-gray-900">Basic Information</h4>
                  <div className="mt-2 space-y-2">
                    <div>
                      <span className="text-sm text-gray-600">Code:</span>
                      <span className="ml-2 font-medium">{viewingDepartment.code}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Type:</span>
                      <Badge className="ml-2" variant="secondary">
                        {viewingDepartment.type}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Status:</span>
                      <Badge className={`ml-2 ${viewingDepartment.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {viewingDepartment.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Statistics</h4>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Concerns:</span>
                      <span className="font-medium">{departmentStats[viewingDepartment.id]?.total_concerns || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Pending:</span>
                      <span className="font-medium text-yellow-600">{departmentStats[viewingDepartment.id]?.pending_concerns || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Resolved:</span>
                      <span className="font-medium text-green-600">{departmentStats[viewingDepartment.id]?.resolved_concerns || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Users:</span>
                      <span className="font-medium">{departmentStats[viewingDepartment.id]?.total_users || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {viewingDepartment.description && (
                <div>
                  <h4 className="font-medium text-gray-900">Description</h4>
                  <p className="mt-2 text-gray-600">{viewingDepartment.description}</p>
                </div>
              )}

              {viewingDepartment.contact_info && (
                <div>
                  <h4 className="font-medium text-gray-900">Contact Information</h4>
                  <div className="mt-2 space-y-2">
                    {viewingDepartment.contact_info.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{viewingDepartment.contact_info.phone}</span>
                      </div>
                    )}
                    {viewingDepartment.contact_info.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{viewingDepartment.contact_info.email}</span>
                      </div>
                    )}
                    {viewingDepartment.contact_info.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{viewingDepartment.contact_info.location}</span>
                      </div>
                    )}
                    {viewingDepartment.contact_info.office_hours && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{viewingDepartment.contact_info.office_hours}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => openEditForm(viewingDepartment)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Department
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setViewingDepartment(null)}
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
