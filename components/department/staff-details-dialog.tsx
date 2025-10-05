"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Progress } from "@/components/ui/progress" // Component not available
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Activity
} from "lucide-react"
import { type StaffMember } from "@/lib/api-client"

interface StaffDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  staff: StaffMember | null
}

export function StaffDetailsDialog({ isOpen, onClose, staff }: StaffDetailsDialogProps) {
  if (!staff) return null

  const getWorkloadColor = (workload: number) => {
    if (workload === 0) return "text-green-600"
    if (workload <= 5) return "text-blue-600"
    if (workload <= 10) return "text-yellow-600"
    return "text-red-600"
  }

  const getWorkloadPercentage = (workload: number) => {
    // Assuming max workload of 15 concerns
    return Math.min((workload / 15) * 100, 100)
  }

  const getWorkloadLabel = (workload: number) => {
    if (workload === 0) return "Available"
    if (workload <= 5) return "Light Load"
    if (workload <= 10) return "Moderate Load"
    return "Heavy Load"
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Staff Member Details</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-lg">
                    {staff.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{staff.name}</h3>
                  <div className="flex items-center space-x-2">
                    <Badge variant={staff.role === 'department_head' ? 'default' : 'secondary'}>
                      {staff.role === 'department_head' ? 'Department Head' : 'Staff Member'}
                    </Badge>
                    {staff.is_active ? (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-red-600 border-red-600">
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{staff.email}</span>
                </div>
                
                {staff.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{staff.phone}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{staff.department?.name}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Employee ID: {staff.employee_id || 'Not assigned'}</span>
                </div>
              </div>

              {staff.last_login_at && (
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Last login: {new Date(staff.last_login_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Workload Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Current Workload</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Overall Workload</span>
                <div className="flex items-center space-x-2">
                  <span className={`text-lg font-semibold ${getWorkloadColor(staff.workload?.total_assigned || 0)}`}>
                    {staff.workload?.total_assigned || 0} concerns
                  </span>
                  <Badge variant="outline" className={getWorkloadColor(staff.workload?.total_assigned || 0)}>
                    {getWorkloadLabel(staff.workload?.total_assigned || 0)}
                  </Badge>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${getWorkloadPercentage(staff.workload?.total_assigned || 0)}%` }}
                ></div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">Pending</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{staff.workload?.pending || 0}</p>
                </div>

                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <TrendingUp className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-600">In Progress</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-600">{staff.workload?.in_progress || 0}</p>
                </div>

                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">Resolved</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{staff.workload?.resolved || 0}</p>
                </div>

                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-600">Overdue</span>
                  </div>
                  <p className="text-2xl font-bold text-red-600">{staff.workload?.overdue || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Resolution Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {staff.workload?.total_assigned 
                      ? Math.round(((staff.workload?.resolved || 0) / staff.workload.total_assigned) * 100)
                      : 0}%
                  </p>
                </div>

                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Active Concerns</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(staff.workload?.pending || 0) + (staff.workload?.in_progress || 0)}
                  </p>
                </div>

                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Member Since</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {staff.created_at ? new Date(staff.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
