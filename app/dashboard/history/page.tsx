import { SidebarProvider } from "@/components/ui/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Suspense } from "react"
import HistoryClient from "./client"

export default function HistoryPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col">
          <DashboardHeader />
          <main className="flex-1 p-6 md:p-8">
            <div className="w-full">
              <div className="mb-8">
                <h1 className="text-3xl font-bold">Journal History</h1>
                <p className="text-muted-foreground">Review your past entries and mood patterns</p>
              </div>

              <Suspense
                fallback={
                  <div className="grid gap-6 md:grid-cols-12">
                    <div className="md:col-span-7 h-[400px] bg-zinc-50 rounded-md animate-pulse" />
                    <div className="md:col-span-5 h-[400px] bg-zinc-50 rounded-md animate-pulse" />
                  </div>
                }
              >
                <HistoryClient />
              </Suspense>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
