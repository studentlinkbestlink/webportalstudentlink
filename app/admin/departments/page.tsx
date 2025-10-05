import { DepartmentManagement } from "@/components/admin/departments/department-management"

export default function DepartmentsPage() {
  return (
    <>
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1E2A78] to-[#2480EA] flex items-center justify-center shadow-lg shadow-[#1E2A78]/25">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-[#1E2A78] tracking-tight">Department Management</h1>
            <p className="text-gray-600 text-lg font-medium">Manage academic and administrative departments across the institution</p>
          </div>
        </div>
      </div>
      <DepartmentManagement />
    </>
  )
}
