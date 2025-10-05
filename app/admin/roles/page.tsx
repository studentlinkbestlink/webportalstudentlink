"use client"

import { RoleManagement } from "@/components/admin/roles/role-management"

export default function AdminRolesPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1E2A78]">Role Management</h1>
        <p className="text-gray-600">Create, edit, and manage custom user roles.</p>
      </div>
      <RoleManagement />
    </>
  )
}
