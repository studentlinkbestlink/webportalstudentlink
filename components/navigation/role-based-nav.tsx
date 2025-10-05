"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Users,
  MessageSquare,
  Bell,
  BarChart3,
  Database,
  Bot,
  LogOut,
  User,
  TrendingUp,
  AlertTriangle,
  FileText,
  Building,
  Shield,
  AlertCircle,
  Activity,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { generateDepartmentSlug } from "@/lib/utils/department-utils"

export function RoleBasedNav() {
  const { user, logout } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  if (!user) return null

  const getNavItems = () => {
    switch (user.role) {
      case "admin":
        return [
          { href: "/admin", icon: BarChart3, label: "Dashboard", badge: null },
          { href: "/admin/users", icon: Users, label: "User Management", badge: null },
          { href: "/admin/departments", icon: Building, label: "Departments", badge: null },
          { href: "/admin/all-concerns", icon: MessageSquare, label: "All Concerns", badge: null },
          { href: "/department/chat", icon: MessageSquare, label: "Real-time Chat", badge: null },
          { href: "/admin/announcements", icon: Bell, label: "Announcements", badge: null },
          { href: "/admin/notifications", icon: Bell, label: "Push Notifications", badge: null },
          { href: "/admin/chatbot", icon: Bot, label: "AI Chatbot", badge: null },
          { href: "/admin/analytics", icon: TrendingUp, label: "Advanced Analytics", badge: "NEW" },
          { href: "/admin/settings", icon: Database, label: "System Settings", badge: null },
          { href: "/admin/reports", icon: BarChart3, label: "Reports", badge: null },
          { href: "/admin/emergency", icon: AlertTriangle, label: "Emergency Help", badge: null },
          { href: "/admin/audit-logs", icon: FileText, label: "Audit Logs", badge: null },
        ]

      case "department_head":
        const departmentSlug = generateDepartmentSlug(user.department || '')
        return [
          { href: `/department/${departmentSlug}`, icon: BarChart3, label: "Dashboard", badge: null },
          { href: `/department/${departmentSlug}?tab=concerns`, icon: MessageSquare, label: "Department Concerns", badge: null },
          { href: `/department/${departmentSlug}?tab=staff`, icon: Users, label: "Staff Management", badge: null },
          { href: `/department/oversight`, icon: Activity, label: "Staff Oversight", badge: null },
          { href: `/department/${departmentSlug}?tab=announcements`, icon: Bell, label: "Announcements", badge: null },
          { href: `/department/${departmentSlug}?tab=analytics`, icon: TrendingUp, label: "Analytics", badge: null },
          { href: `/department/${departmentSlug}?tab=settings`, icon: Database, label: "Settings", badge: null },
        ]

      case "staff":
        const staffDepartmentSlug = generateDepartmentSlug(user.department || '')
        return [
          { href: `/staff/dashboard`, icon: BarChart3, label: "My Dashboard", badge: null },
          { href: `/staff/concerns`, icon: MessageSquare, label: "My Concerns", badge: null },
          { href: `/staff/chat`, icon: MessageSquare, label: "Real-time Chat", badge: null },
          { href: `/staff/analytics`, icon: TrendingUp, label: "My Analytics", badge: null },
          { href: `/staff/profile`, icon: User, label: "My Profile", badge: null },
        ]

      default:
        return []
    }
  }

  const navItems = getNavItems()

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <nav className="w-72 bg-white border-r border-gray-200 h-screen flex flex-col shadow-lg">
      {/* Header */}
      <div className="p-5 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center flex-shrink-0">
            <Image 
              src="/studentlinklogo.png" 
              alt="StudentLink Logo" 
              width={48} 
              height={48}
              className="object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-[#1E2A78] tracking-tight truncate" style={{
              fontFamily: 'Inter Display, Inter, -apple-system, BlinkMacSystemFont, sans-serif',
              letterSpacing: '-0.01em'
            }}>
              StudentLink
            </h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Portal</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-5 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-[#1E2A78] rounded-lg flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[#1E2A78] truncate">{user.name}</p>
            <p className="text-sm text-gray-600 capitalize font-medium">{user.role.replace("_", " ")}</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button 
              variant="ghost" 
              className="w-full justify-start h-11 px-4 rounded-lg hover:bg-gray-100 hover:text-[#1E2A78] group transition-all duration-200"
            >
              <div className="mr-3 h-6 w-6 flex items-center justify-center rounded-lg bg-gray-100 group-hover:bg-[#1E2A78]/10 transition-all duration-200">
                <item.icon className="h-4 w-4 text-gray-600 group-hover:text-[#1E2A78] transition-colors" />
              </div>
              <span className="flex-1 text-left font-medium text-gray-700 group-hover:text-[#1E2A78] transition-colors">{item.label}</span>
              {item.badge && (
                <Badge variant="destructive" className="ml-2 bg-[#E22824] shadow-sm">
                  {item.badge}
                </Badge>
              )}
            </Button>
          </Link>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 space-y-2 bg-white">
        <Link href={`/${user.role}/profile`}>
          <Button variant="ghost" className="w-full justify-start h-11 px-4 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 group">
            <div className="mr-3 h-5 w-5 flex items-center justify-center rounded-md bg-gray-100 group-hover:bg-blue-100 transition-all duration-200">
              <User className="h-3 w-3 text-gray-600 group-hover:text-blue-600 transition-colors" />
            </div>
            <span className="font-medium">Profile & Settings</span>
          </Button>
        </Link>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-start h-11 px-4 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
              disabled={isLoggingOut}
            >
              <div className="mr-3 h-5 w-5 flex items-center justify-center rounded-md bg-gray-100 group-hover:bg-red-100 transition-all duration-200">
                <LogOut className="h-3 w-3 text-gray-600 group-hover:text-red-600 transition-colors" />
              </div>
              <span className="font-medium">{isLoggingOut ? "Logging out..." : "Logout"}</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                <LogOut className="h-8 w-8 text-red-600" />
              </div>
              <AlertDialogTitle className="text-xl font-semibold text-gray-900">
                Sign Out of StudentLink
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600 leading-relaxed">
                You're about to sign out of your account. Any unsaved changes will be lost and you'll need to sign in again to access your dashboard.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-3 sm:gap-2">
              <AlertDialogCancel className="w-full sm:w-auto order-2 sm:order-1">
                Stay Signed In
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleLogout}
                className="w-full sm:w-auto order-1 sm:order-2 bg-red-600 hover:bg-red-700 focus:ring-red-500"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </nav>
  )
}
