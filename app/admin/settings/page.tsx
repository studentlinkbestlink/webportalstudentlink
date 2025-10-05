"use client"

import { Settings } from "@/components/admin/settings/settings"

export default function AdminSettingsPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1E2A78]">Settings</h1>
        <p className="text-gray-600">Manage portal configurations and preferences.</p>
      </div>
      <Settings />
    </>
  )
}
