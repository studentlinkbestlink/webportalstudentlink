import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CreateEditRoleDialog } from "@/components/admin/roles/create-edit-role-dialog"
import { DeleteRoleDialog } from "@/components/admin/roles/delete-role-dialog"

// Mock data for initial implementation
const mockRoles = [
  { id: "1", name: "Senior Staff", permissions: ["view-reports", "manage-concerns"] },
  { id: "2", name: "Admissions Officer", permissions: ["manage-admissions", "view-student-applications"] },
  { id: "3", name: "Librarian", permissions: ["manage-library-resources", "view-borrowing-history"] },
]

const mockPermissions = [
  { id: "view-reports", name: "View Reports" },
  { id: "manage-concerns", name: "Manage Concerns" },
  { id: "manage-admissions", name: "Manage Admissions" },
  { id: "view-student-applications", name: "View Student Applications" },
  { id: "manage-library-resources", name: "Manage Library Resources" },
  { id: "view-borrowing-history", name: "View Borrowing History" },
  { id: "manage-users", name: "Manage Users" },
  { id: "manage-system-settings", name: "Manage System Settings" },
  { id: "manage-announcements", name: "Manage Announcements" },
]

export function RoleManagement() {
  const [roles, setRoles] = useState(mockRoles)
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)

  const handleCreateRole = (role) => {
    // API call to create role would be here
    setRoles([...roles, { ...role, id: `${Date.now()}` }])
  }

  const handleUpdateRole = (updatedRole) => {
    // API call to update role would be here
    setRoles(roles.map((role) => (role.id === updatedRole.id ? updatedRole : role)))
  }

  const handleDeleteRole = (roleId) => {
    // API call to delete role would be here
    setRoles(roles.filter((role) => role.id !== roleId))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-[#1E2A78]">Custom Roles</CardTitle>
          <Button onClick={() => setCreateDialogOpen(true)} className="bg-[#1E2A78] hover:bg-[#2480EA]">
            <Plus className="mr-2 h-4 w-4" />
            Create Role
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {roles.map((role) => (
              <div key={role.id} className="flex items-center justify-between border p-4 rounded-md">
                <div>
                  <p className="font-medium text-[#1E2A78]">{role.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Permissions: {role.permissions.join(", ")}
                  </p>
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedRole(role)
                      setEditDialogOpen(true)
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setSelectedRole(role)
                      setDeleteDialogOpen(true)
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <CreateEditRoleDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSave={handleCreateRole}
        permissions={mockPermissions}
      />

      {selectedRole && (
        <CreateEditRoleDialog
          isOpen={isEditDialogOpen}
          onClose={() => {
            setEditDialogOpen(false)
            setSelectedRole(null)
          }}
          onSave={handleUpdateRole}
          role={selectedRole}
          permissions={mockPermissions}
        />
      )}

      {selectedRole && (
        <DeleteRoleDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false)
            setSelectedRole(null)
          }}
          onDelete={() => {
            handleDeleteRole(selectedRole.id)
            setDeleteDialogOpen(false)
            setSelectedRole(null)
          }}
          roleName={selectedRole.name}
        />
      )}
    </div>
  )
}
