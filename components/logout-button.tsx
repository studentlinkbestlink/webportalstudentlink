"use client"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function LogoutButton() {
  const { logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.replace("/")
  }

  return (
    <Button 
      onClick={handleLogout}
      variant="outline"
      className="text-red-600 border-red-600 hover:bg-red-50"
    >
      Logout
    </Button>
  )
}
