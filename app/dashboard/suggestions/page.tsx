"use client"

import Link from "next/link"
import { Calendar, Check, ChevronUp, Clock, Edit3, Home, LineChart, Settings, User, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"

const suggestions = [
  {
    id: 1,
    title: "Morning Mindfulness",
    description: "Start your day with a 5-minute breathing exercise to center yourself and set a positive intention.",
    category: "Mindfulness",
    duration: "5 min",
    impact: "Reduces anxiety",
    moodTarget: "Stress",
  },
  {
    id: 2,
    title: "Nature Walk",
    description: "Take a 15-minute walk outside during lunch. Focus on the sights, sounds, and smells around you.",
    category: "Exercise",
    duration: "15 min",
    impact: "Boosts mood",
    moodTarget: "Low energy",
  },
  {
    id: 3,
    title: "Gratitude Practice",
    description: "Write down 3 things you're grateful for today. Be specific about why they matter to you.",
    category: "Reflection",
    duration: "10 min",
    impact: "Increases positivity",
    moodTarget: "Negativity",
  },
  {
    id: 4,
    title: "Digital Sunset",
    description: "Turn off all screens at least 30 minutes before bedtime to improve sleep quality.",
    category: "Sleep",
    duration: "30 min",
    impact: "Better sleep",
    moodTarget: "Fatigue",
  },
  {
    id: 5,
    title: "Connect with a Friend",
    description: "Reach out to someone you care about. A quick text or call can strengthen social bonds.",
    category: "Social",
    duration: "15 min",
    impact: "Reduces loneliness",
    moodTarget: "Isolation",
  },
]

export default function SuggestionsPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-4 py-2">
              <div className="rounded-full bg-primary p-1">
                <div className="h-6 w-6 rounded-full bg-white" />
              </div>
              <div>
                <p className="text-sm font-medium">Alex</p>
                <p className="text-xs text-muted-foreground">Premium Member</p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard">
                    <Home className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard/journal">
                    <Edit3 className="h-4 w-4" />
                    <span>Journal</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard/history">
                    <Calendar className="h-4 w-4" />
                    <span>History</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard/analytics">
                    <LineChart className="h-4 w-4" />
                    <span>Analytics</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive>
                  <Link href="/dashboard/suggestions">
                    <Settings className="h-4 w-4" />
                    <span>Suggestions</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <User className="h-4 w-4" />
                  <span>Account</span>
                  <ChevronUp className="ml-auto h-4 w-4" />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <div className="flex flex-1 flex-col">
          <DashboardHeader />
          <main className="flex-1 p-4 md:p-8">
            <div className="mx-auto max-w-5xl">
              <div className="mb-8">
                <h1 className="text-3xl font-bold">Personalized Suggestions</h1>
                <p className="text-muted-foreground">Based on your recent journal entries and mood patterns</p>
              </div>

              <div className="grid gap-6">
                {suggestions.map((suggestion) => (
                  <Card key={suggestion.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{suggestion.title}</CardTitle>
                          <CardDescription>Targets: {suggestion.moodTarget}</CardDescription>
                        </div>
                        <Badge variant="outline">{suggestion.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p>{suggestion.description}</p>
                      <div className="mt-4 flex items-center gap-4">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="mr-1 h-4 w-4" />
                          {suggestion.duration}
                        </div>
                        <div className="text-sm text-muted-foreground">{suggestion.impact}</div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" size="sm">
                        Schedule
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
                        >
                          <Check className="h-4 w-4" />
                          <span className="sr-only">Accept</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Decline</span>
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
