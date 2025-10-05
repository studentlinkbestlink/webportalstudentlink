"use client"

import { ReportsAndAnalytics } from "@/components/admin/reports/reports-and-analytics"

export default function AdminReportsPage() {
  return (
    <>
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1E2A78] to-[#2480EA] flex items-center justify-center shadow-lg shadow-[#1E2A78]/25">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-[#1E2A78] tracking-tight">Reports & Analytics</h1>
            <p className="text-gray-600 text-lg font-medium">View comprehensive insights and generate detailed reports on student concerns and portal activity</p>
          </div>
        </div>
      </div>
      <ReportsAndAnalytics />
    </>
  )
}
