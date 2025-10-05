"use client"

import { UnifiedAnnouncements } from "@/components/shared/unified-announcements"

export default function AdminAnnouncementsPage() {
  return (
    <>
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1E2A78] to-[#2480EA] flex items-center justify-center shadow-lg shadow-[#1E2A78]/25">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-[#1E2A78] tracking-tight">Announcements Management</h1>
            <p className="text-gray-600 text-lg font-medium">Create, publish, and manage announcements with categories, action buttons, and rich content for students and staff</p>
          </div>
        </div>
      </div>
      <UnifiedAnnouncements 
        userRole="admin"
        title="Announcements Management"
        description="Create and manage system-wide announcements with the new standardized format"
      />
    </>
  )
}
