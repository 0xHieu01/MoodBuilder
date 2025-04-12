"use client"

import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export function UserProfile() {
  const { user, signOut } = useAuth()

  if (!user) {
    return null
  }

  // Get initials from user's name
  const getInitials = () => {
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const handleSignOut = () => {
    // Remove the cookie
    document.cookie = "isLoggedIn=; path=/; max-age=0"
    signOut()
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarFallback>{getInitials()}</AvatarFallback>
      </Avatar>
      <div>
        <p className="text-sm font-medium">{user.name}</p>
        <p className="text-xs text-muted-foreground">{user.email}</p>
      </div>
      <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Sign out">
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  )
}
