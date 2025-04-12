"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"
import { BookOpen, Calendar, ChevronLeft, ChevronRight, FileText, Home, MessageSquare, Settings } from "lucide-react"

export function DashboardSidebar() {
  const pathname = usePathname()
  const { isOpen, toggle } = useSidebar()

  const routes = [
    {
      label: "Dashboard",
      icon: Home,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Journal",
      icon: BookOpen,
      href: "/dashboard/journal",
      active: pathname === "/dashboard/journal",
    },
    {
      label: "History",
      icon: Calendar,
      href: "/dashboard/history",
      active: pathname === "/dashboard/history",
    },
    {
      label: "Documents",
      icon: FileText,
      href: "/dashboard/documents",
      active: pathname === "/dashboard/documents",
    },
    {
      label: "Chat with PinAI Agent",
      icon: MessageSquare,
      href: "https://agent.pinai.tech/agent/338",
      active: false,
      external: true,
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/dashboard/settings",
      active: pathname === "/dashboard/settings",
    },
  ]

  return (
    <div
      className={cn(
        "relative flex h-full flex-col border-r border-zinc-200 bg-white transition-all duration-300",
        isOpen ? "w-64" : "w-64", // Always use the expanded width
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-zinc-200 px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <span className="text-xl">Mood Builder</span>
        </Link>
        <Button onClick={toggle} variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-zinc-100">
          {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        {routes.map((route) => (
          <Button
            key={route.href}
            asChild
            variant={route.active ? "secondary" : "ghost"}
            size="default"
            className={cn("justify-start", route.active && "bg-zinc-100 font-medium text-zinc-900")}
          >
            {route.external ? (
              <a href={route.href} target="_blank" rel="noopener noreferrer">
                <route.icon className="h-5 w-5 mr-2" />
                <span>{route.label}</span>
              </a>
            ) : (
              <Link href={route.href}>
                <route.icon className="h-5 w-5 mr-2" />
                <span>{route.label}</span>
              </Link>
            )}
          </Button>
        ))}
      </div>
    </div>
  )
}
