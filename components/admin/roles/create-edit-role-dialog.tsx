import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

export function CreateEditRoleDialog({ isOpen, onClose, onSave, role, permissions }) {
  const [name, setName] = useState("")
  const [selectedPermissions, setSelectedPermissions] = useState([])

  useEffect(() => {
    if (role) {
      setName(role.name)
      setSelectedPermissions(role.permissions)
    } else {
      setName("")
      setSelectedPermissions([])
    }
  }, [role, isOpen])

  const handleSave = () => {
    onSave({ id: role?.id, name, permissions: selectedPermissions })
    onClose()
  }

  const handlePermissionChange = (permissionId) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{role ? "Edit Role" : "Create Role"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Role Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div>
            <p className="font-medium mb-2">Permissions</p>
            <div className="space-y-2">
              {permissions.map((permission) => (
                <div key={permission.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`permission-${permission.id}`}
                    checked={selectedPermissions.includes(permission.id)}
                    onCheckedChange={() => handlePermissionChange(permission.id)}
                  />
                  <label htmlFor={`permission-${permission.id}`}>{permission.name}</label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-[#1E2A78] hover:bg-[#2480EA]">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
