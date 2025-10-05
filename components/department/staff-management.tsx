"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Users, 
  UserPlus, 
  Search, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  UserCheck
} from "lucide-react"
import { apiClient, type StaffMember } from "@/lib/api-client"
import { AddStaffDialog } from "@/components/department/add-staff-dialog"
import { StaffDetailsDialog } from "@/components/department/staff-details-dialog"

interface DepartmentStaffManagementProps {
  departmentId: number
  departmentName: string
}

export function DepartmentStaffManagement({ departmentId, departmentName }: DepartmentStaffManagementProps) {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddStaffOpen, setAddStaffOpen] = useState(false)
  const [isStaffDetailsOpen, setStaffDetailsOpen] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [workloadStats, setWorkloadStats] = useState({
    total_staff: 0,
    total_concerns: 0,
    average_workload: 0,
    overloaded_staff: 0,
    available_staff: 0
  })

  // Fetch staff for this department
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        console.log('Fetching staff for department:', departmentId)
        
        // Fetch staff for this department
        const staffResult = await apiClient.getStaff({
          department_id: departmentId,
          role: roleFilter !== "all" ? roleFilter : undefined,
        })
        console.log('Staff API Result:', staffResult)
        setStaff(staffResult.data || [])
        
        // Fetch workload stats for this department
        const statsResult = await apiClient.getStaffWorkloadStats({
          department_id: departmentId
        })
        setWorkloadStats(statsResult || {
          total_staff: 0,
          total_concerns: 0,
          average_workload: 0,
          overloaded_staff: 0,
          available_staff: 0
        })
      } catch (error) {
        console.error('Failed to fetch staff data:', error)
        console.error('Error details:', error)
        setStaff([])
        setWorkloadStats({
          total_staff: 0,
          total_concerns: 0,
          average_workload: 0,
          overloaded_staff: 0,
          available_staff: 0
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [departmentId, roleFilter])

  // Apply client-side search filter
  const filteredStaff = (staff || []).filter(staffMember =>
    staffMember.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staffMember.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (staffMember.employee_id && staffMember.employee_id.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleAddStaff = async (staffData: any) => {
    try {
      const newStaff = await apiClient.createStaff({
        ...staffData,
        department_id: departmentId
      })
      setStaff([newStaff, ...staff])
      setAddStaffOpen(false)
    } catch (error) {
      console.error('Failed to create staff:', error)
    }
  }

  const handleViewStaffDetails = (staffMember: StaffMember) => {
    setSelectedStaff(staffMember)
    setStaffDetailsOpen(true)
  }

  const getWorkloadColor = (workload: number) => {
    if (workload === 0) return "bg-green-100 text-green-800"
    if (workload <= 5) return "bg-blue-100 text-blue-800"
    if (workload <= 10) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  const getWorkloadLabel = (workload: number) => {
    if (workload === 0) return "Available"
    if (workload <= 5) return "Light"
    if (workload <= 10) return "Moderate"
    return "Heavy"
  }

  return (
    <div className="space-y-6">
      {/* Department Staff Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Staff</p>
                <p className="text-2xl font-bold text-blue-600">{workloadStats.total_staff}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Workload</p>
                <p className="text-2xl font-bold text-green-600">{workloadStats.average_workload.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-blue-600">{workloadStats.available_staff}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Overloaded</p>
                <p className="text-2xl font-bold text-red-600">{workloadStats.overloaded_staff}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Concerns</p>
                <p className="text-2xl font-bold text-purple-600">{workloadStats.total_concerns}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search staff..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="department_head">Dept Head</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={() => setAddStaffOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Staff Member
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Staff List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>{departmentName} Staff ({filteredStaff.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-lg font-medium">No staff members found</p>
              <p className="text-sm">
                {searchTerm ? 'No staff members match your search criteria' : 'Add your first staff member to get started'}
              </p>
              {!searchTerm && (
                <Button 
                  onClick={() => setAddStaffOpen(true)} 
                  className="mt-4 bg-blue-600 hover:bg-blue-700"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add First Staff Member
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredStaff.map((staffMember) => (
                <div
                  key={staffMember.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {staffMember.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{staffMember.name}</h3>
                      <p className="text-sm text-gray-600">{staffMember.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={staffMember.role === 'department_head' ? 'default' : 'secondary'}>
                          {staffMember.role === 'department_head' ? 'Department Head' : 'Staff Member'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          ID: {staffMember.employee_id || 'N/A'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Workload:</span>
                        <Badge className={getWorkloadColor(staffMember.workload?.total_assigned || 0)}>
                          {staffMember.workload?.total_assigned || 0} concerns
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {getWorkloadLabel(staffMember.workload?.total_assigned || 0)}
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewStaffDetails(staffMember)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddStaffDialog
        isOpen={isAddStaffOpen}
        onClose={() => setAddStaffOpen(false)}
        onAddStaff={handleAddStaff}
        departmentId={departmentId}
        departmentName={departmentName}
      />

      <StaffDetailsDialog
        isOpen={isStaffDetailsOpen}
        onClose={() => setStaffDetailsOpen(false)}
        staff={selectedStaff}
      />
    </div>
  )
}
