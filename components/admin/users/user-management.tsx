import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal, 
  UserCheck, 
  UserX, 
  Shield,
  Building,
  Calendar,
  Mail,
  Phone,
  Trash2,
  Edit,
  Eye
} from "lucide-react"
import { AddUserDialog } from "./add-user-dialog"
import { EditUserDialog } from "./edit-user-dialog"
import { apiClient, type User, type Department } from "@/lib/api-client"

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddUserOpen, setAddUserOpen] = useState(false)
  const [isEditUserOpen, setEditUserOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  const [pagination, setPagination] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  // Fetch users and departments from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch users with filters
        const filters = {
          role: roleFilter !== "all" ? roleFilter : undefined,
          department_id: departmentFilter !== "all" ? parseInt(departmentFilter) : undefined,
          is_active: statusFilter !== "all" ? statusFilter === "active" : undefined,
          page: currentPage,
          per_page: 20
        }
        
        const result = await apiClient.getUsers(filters)
        setUsers(result.data)
        setPagination(result.pagination)
        
        // Fetch departments
        const departmentsData = await apiClient.getDepartments()
        setDepartments(departmentsData)
      } catch (error) {
        console.error('Failed to fetch data:', error)
        setUsers([])
        setDepartments([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [roleFilter, departmentFilter, statusFilter, currentPage])

  // Apply client-side search filter
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle bulk operations
  const handleBulkActivate = async () => {
    try {
      for (const userId of selectedUsers) {
        await apiClient.updateUser(userId, { is_active: true })
      }
      setSelectedUsers([])
      // Refresh users
      window.location.reload()
    } catch (error) {
      console.error('Failed to activate users:', error)
    }
  }

  const handleBulkDeactivate = async () => {
    try {
      for (const userId of selectedUsers) {
        await apiClient.updateUser(userId, { is_active: false })
      }
      setSelectedUsers([])
      // Refresh users
      window.location.reload()
    } catch (error) {
      console.error('Failed to deactivate users:', error)
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedUsers.length} users? This action cannot be undone.`)) {
      return
    }
    
    try {
      for (const userId of selectedUsers) {
        await apiClient.deleteUser(userId)
      }
      setSelectedUsers([])
      // Refresh users
      window.location.reload()
    } catch (error) {
      console.error('Failed to delete users:', error)
    }
  }

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id))
    }
  }

  const handleSelectUser = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleFilterChange = (filterType: string, value: string) => {
    setCurrentPage(1) // Reset to first page when filters change
    switch (filterType) {
      case 'role':
        setRoleFilter(value)
        break
      case 'department':
        setDepartmentFilter(value)
        break
      case 'status':
        setStatusFilter(value)
        break
    }
  }

  const handleAddUser = async (user: any) => {
    try {
      const newUser = await apiClient.createUser({
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role,
        department_id: user.department_id,
        phone: user.phone,
      })
      setUsers([newUser, ...users])
      setAddUserOpen(false)
    } catch (error) {
      console.error('Failed to create user:', error)
    }
  }

  const handleUpdateUser = async (updatedUser: User) => {
    try {
      const updated = await apiClient.updateUser(updatedUser.id, updatedUser)
      setUsers(users.map((user) => (user.id === updated.id ? updated : user)))
      setEditUserOpen(false)
      setSelectedUser(null)
    } catch (error) {
      console.error('Failed to update user:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* User Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-[#1E2A78]" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-[#1E2A78]">{pagination?.total || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-green-600">
                  {users.filter(u => u.is_active).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserX className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Inactive Users</p>
                <p className="text-2xl font-bold text-red-600">
                  {users.filter(u => !u.is_active).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Departments</p>
                <p className="text-2xl font-bold text-blue-600">{departments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-[#1E2A78]">User Management</CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            <Button onClick={() => setAddUserOpen(true)} className="bg-[#1E2A78] hover:bg-[#2480EA]">
              <Plus className="mr-2 h-4 w-4" />
              Add New User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, email, or role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {showFilters && (
              <div className="grid gap-4 md:grid-cols-3 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="text-sm font-medium mb-2 block">Role</label>
                  <Select value={roleFilter} onValueChange={(value) => handleFilterChange('role', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="department_head">Department Head</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Department</label>
                  <Select value={departmentFilter} onValueChange={(value) => handleFilterChange('department', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select value={statusFilter} onValueChange={(value) => handleFilterChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Bulk Actions */}
            {selectedUsers.length > 0 && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-blue-800">
                  {selectedUsers.length} user(s) selected
                </span>
                <Button size="sm" variant="outline" onClick={handleBulkActivate}>
                  <UserCheck className="h-4 w-4 mr-1" />
                  Activate
                </Button>
                <Button size="sm" variant="outline" onClick={handleBulkDeactivate}>
                  <UserX className="h-4 w-4 mr-1" />
                  Deactivate
                </Button>
                <Button size="sm" variant="outline" onClick={handleBulkDelete} className="text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <Checkbox
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dept ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-4 text-center">Loading users...</td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-4 text-center text-muted-foreground">
                      No users found. Add your first user using the button above.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                  <tr key={user.id} className={selectedUsers.includes(user.id) ? 'bg-blue-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={() => handleSelectUser(user.id)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {user.avatar ? (
                            <img className="h-10 w-10 rounded-full" src={user.avatar} alt={user.name} />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="text-sm text-gray-500 flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.student_id || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'department_head' ? 'default' : 'secondary'}>
                        {user.role.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.department?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.department_id || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Switch
                          checked={user.is_active}
                          onCheckedChange={async (checked) => {
                            try {
                              await apiClient.updateUser(user.id, { is_active: checked })
                              // Update local state
                              setUsers(users.map(u => u.id === user.id ? { ...u, is_active: checked } : u))
                            } catch (error) {
                              console.error('Failed to update user status:', error)
                            }
                          }}
                        />
                        <span className={`ml-2 text-sm ${user.is_active ? 'text-green-600' : 'text-red-600'}`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.last_login_at ? (
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(user.last_login_at).toLocaleDateString()}
                        </div>
                      ) : (
                        'Never'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user)
                            setEditUserOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete ${user.name}?`)) {
                              apiClient.deleteUser(user.id).then(() => {
                                setUsers(users.filter(u => u.id !== user.id))
                              }).catch(error => {
                                console.error('Failed to delete user:', error)
                              })
                            }
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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
        </CardContent>
      </Card>

      <AddUserDialog
        isOpen={isAddUserOpen}
        onClose={() => setAddUserOpen(false)}
        onAddUser={handleAddUser}
      />

      {selectedUser && (
        <EditUserDialog
          isOpen={isEditUserOpen}
          onClose={() => {
            setEditUserOpen(false)
            setSelectedUser(null)
          }}
          user={selectedUser}
          onUpdateUser={handleUpdateUser}
        />
      )}
    </div>
  )
}
