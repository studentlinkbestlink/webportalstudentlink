"use client"

import type React from "react"

import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { getDepartmentRoute } from "@/lib/utils/department-utils"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: Array<"admin" | "department_head" | "staff" | "faculty">
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login")
        return
      }

      if (!allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard if user doesn't have access
        switch (user.role) {
          case "admin":
            router.push("/admin")
            break
          case "department_head":
            // Generate department route from user's department
            const departmentRoute = getDepartmentRoute(user)
            router.push(departmentRoute)
            break
          case "staff":
            router.push("/staff")
            break
          case "faculty":
            router.push("/faculty")
            break
        }
      }
    }
  }, [user, loading, allowedRoles, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#1E2A78]"></div>
      </div>
    )
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#1E2A78]"></div>
      </div>
    )
  }

  return <>{children}</>
}
