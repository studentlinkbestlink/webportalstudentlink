import { RoleBasedNav } from "@/components/navigation/role-based-nav"

export default function Loading() {
  return (
    <div className="flex h-screen bg-gray-50">
      <RoleBasedNav />
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#1E2A78]"></div>
      </div>
    </div>
  )
}
