import { Skeleton } from "@/components/ui/skeleton"

export default function DepartmentsLoading() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Department Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="h-8 w-8" />
              <div>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-16 mt-1" />
              </div>
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-2 bg-gray-50 rounded-lg">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-8 mt-1" />
              </div>
              <div className="p-2 bg-gray-50 rounded-lg">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-8 mt-1" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 flex-1" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
