import { RoleBasedNav } from "@/components/navigation/role-based-nav"

export default function Loading() {
  return (
    <div className="flex h-screen bg-gray-50">
      <RoleBasedNav />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#1E2A78] mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-[#1E2A78] mb-2">Loading Reports</h2>
          <p className="text-gray-600">Generating system analytics and reports...</p>
        </div>
      </div>
    </div>
  )
}
