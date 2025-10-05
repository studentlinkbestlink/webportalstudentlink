"use client"

import { ConcernsManagement } from "@/components/admin/concerns/concerns-management"

export default function AdminConcernsPage() {
  return (
    <>
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1E2A78] to-[#2480EA] flex items-center justify-center shadow-lg shadow-[#1E2A78]/25">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-[#1E2A78] tracking-tight">All Concerns</h1>
            <p className="text-gray-600 text-lg font-medium">View and manage all student concerns from across all departments in one centralized location</p>
          </div>
        </div>
      </div>
      <ConcernsManagement />
    </>
  )
}
