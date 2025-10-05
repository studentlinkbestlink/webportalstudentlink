import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"

export function AddUserDialog({ isOpen, onClose, onAddUser }) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("")
  const [departmentId, setDepartmentId] = useState("")
  const [phone, setPhone] = useState("")
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(false)

  // Fetch departments when dialog opens
  useEffect(() => {
    if (isOpen) {
      const fetchDepartments = async () => {
        try {
          const response = await apiClient.getDepartments()
          setDepartments(response)
        } catch (error) {
          console.error('Failed to fetch departments:', error)
        }
      }
      fetchDepartments()
    }
  }, [isOpen])

  const handleSubmit = async () => {
    if (!name || !email || !password || !role) {
      alert("Please fill out all required fields.")
      return
    }

    if (role === 'department_head' && !departmentId) {
      alert("Please select a department for department head role.")
      return
    }

    setLoading(true)
    try {
      await onAddUser({ 
        name, 
        email, 
        password, 
        role, 
        department_id: departmentId || null,
        phone: phone || null
      })
      // Reset form
      setName("")
      setEmail("")
      setPassword("")
      setRole("")
      setDepartmentId("")
      setPhone("")
      onClose()
    } catch (error) {
      console.error('Failed to add user:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Full Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            placeholder="Email Address *"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            placeholder="Password *"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Input
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Select onValueChange={setRole} value={role}>
            <SelectTrigger>
              <SelectValue placeholder="Select a role *" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="department_head">Department Head</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
              <SelectItem value="faculty">Faculty</SelectItem>
              <SelectItem value="student">Student</SelectItem>
            </SelectContent>
          </Select>
          {role === 'department_head' && (
            <Select onValueChange={setDepartmentId} value={departmentId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Department *" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept: any) => (
                  <SelectItem key={dept.id} value={dept.id.toString()}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="bg-[#1E2A78] hover:bg-[#2480EA]"
          >
            {loading ? 'Adding...' : 'Add User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
