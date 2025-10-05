import { UnifiedAnnouncements } from "@/components/shared/unified-announcements"

interface DepartmentAnnouncementsProps {
  department: {
    name: string
    code: string
    type: string
  }
}

export function DepartmentAnnouncements({ department }: DepartmentAnnouncementsProps) {
  return (
    <UnifiedAnnouncements
      userRole="department_head"
      department={department}
      title="Department Announcements"
      description="Create and manage announcements for your department with the new standardized format"
    />
  )
}

