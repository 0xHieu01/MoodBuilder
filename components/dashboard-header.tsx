"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { UserProfile } from "@/components/user-profile"
import { useIsMobile } from "@/hooks/use-mobile"

export function DashboardHeader() {
  const pathname = usePathname()
  const isMobile = useIsMobile()

  const navigation = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Journal", href: "/dashboard/journal" },
    { name: "History", href: "/dashboard/history" },
    { name: "Chat with PinAI Agent", href: "https://agent.pinai.tech/agent/338"},
    { name: "Settings", href: "/dashboard/settings" },
  ]

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center border-b border-zinc-200 bg-white px-4 md:px-6">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center">
          <Link href="/dashboard" className="mr-6 flex items-center">
            <span className="text-xl font-bold text-primary">Mood Builder</span>
          </Link>

          {!isMobile && (
            <nav className="hidden md:flex md:items-center md:space-x-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-medium ${
                    pathname === item.href ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <UserProfile />

          {isMobile && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="ml-2">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex items-center py-4">
                  <span className="text-xl font-bold">Mood Builder</span>
                </div>
                <nav className="flex flex-col space-y-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`text-sm font-medium ${
                        pathname === item.href ? "text-primary" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  )
}
