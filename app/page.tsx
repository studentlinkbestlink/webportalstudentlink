"use client"

import { useAuth } from "@/components/auth-provider"
import { LoginForm } from "@/components/login-form"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { getDepartmentRoute } from "@/lib/utils/department-utils"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      // Redirect based on role with proper department routing
      if (user.role === "admin") {
        router.replace("/admin")
      } else if (user.role === "department_head") {
        // Generate department route from user's department
        const departmentRoute = getDepartmentRoute(user)
        router.replace(departmentRoute)
      } else if (user.role === "staff") {
        // Redirect staff to their dashboard
        router.replace("/staff/dashboard")
      } else {
        // For other roles, redirect to login (they shouldn't exist in this system)
        router.replace("/login")
      }
    }
  }, [user, router])

  // Show login form if not authenticated
  if (!user) {
    return <LoginForm />
  }

  // Show nothing while redirecting
  return null
}