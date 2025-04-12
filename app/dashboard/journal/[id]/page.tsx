"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { ArrowLeft, Calendar, Loader2 } from "lucide-react"
import { getBrowserClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarProvider } from "@/components/ui/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import MoodAnalysisResult from "@/components/mood-analysis-result"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function JournalEntryPage() {
  const params = useParams()
  const router = useRouter()
  const entryId = params.id as string
  const [entry, setEntry] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = getBrowserClient()

  useEffect(() => {
    async function fetchEntry() {
      try {
        console.log(`Fetching journal entry with ID: ${entryId}`)
        const { data, error } = await supabase
          .from("journal_entries_v2") // Use the new v2 table
          .select(`
            *,
            entry_emotions_v2(
              emotions(name)
            ),
            entry_themes_v2(
              themes(name)
            )
          `)
          .eq("id", entryId)
          .single()

        if (error) {
          console.error("Error fetching journal entry:", error)
          throw error
        }

        console.log("Journal entry fetched successfully:", data?.id)
        setEntry(data)
      } catch (err) {
        console.error("Error fetching journal entry:", err)
        setError("Failed to load journal entry")
      } finally {
        setLoading(false)
      }
    }

    if (entryId) {
      fetchEntry()
    }
  }, [entryId, supabase])

  // Function to extract emotions and themes from the entry
  const extractEmotionsAndThemes = (entry: any) => {
    let emotions = []
    let themes = []

    // Try to get emotions from entry_emotions_v2
    if (entry?.entry_emotions_v2 && entry.entry_emotions_v2.length > 0) {
      emotions = entry.entry_emotions_v2
        .map((item) => item.emotions)
        .filter(Boolean)
        .map((emotion) => emotion.name)
    }

    // Try to get themes from entry_themes_v2
    if (entry?.entry_themes_v2 && entry.entry_themes_v2.length > 0) {
      themes = entry.entry_themes_v2
        .map((item) => item.themes)
        .filter(Boolean)
        .map((theme) => theme.name)
    }

    return {
      emotions,
      themes,
    }
  }

  // Function to get analysis data
  const getAnalysisData = (entry: any) => {
    // If we have analysis_data stored, use that
    if (entry?.analysis_data?.analysis) {
      return entry.analysis_data.analysis
    }

    // Otherwise, construct from the entry data
    const { emotions, themes } = extractEmotionsAndThemes(entry)

    return {
      mood_score: entry?.mood_score || 50,
      emotions,
      themes,
      summary: "Analysis summary not available.",
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-white">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col">
          <DashboardHeader />
          <main className="flex-1 p-4 md:p-8">
            <div className="mx-auto max-w-4xl">
              <div className="mb-6">
                <Button
                  variant="ghost"
                  asChild
                  className="mb-2 pl-0 text-zinc-600 hover:bg-transparent hover:text-zinc-900"
                >
                  <Link href="/dashboard/history">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to History
                  </Link>
                </Button>
              </div>

              {loading ? (
                <div className="flex h-40 items-center justify-center">
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  <p className="text-zinc-500">Loading entry...</p>
                </div>
              ) : error ? (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : entry ? (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-2xl font-bold">Journal Entry</CardTitle>
                          <CardDescription className="flex items-center text-zinc-500">
                            <Calendar className="mr-1 h-4 w-4" />
                            {format(new Date(entry.created_at), "MMMM d, yyyy 'at' h:mm a")}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="prose max-w-none">
                        <div className="whitespace-pre-wrap">{entry.content}</div>
                      </div>
                    </CardContent>
                  </Card>

                  <MoodAnalysisResult analysis={getAnalysisData(entry)} />
                </div>
              ) : (
                <Alert>
                  <AlertTitle>Entry not found</AlertTitle>
                  <AlertDescription>
                    The journal entry you're looking for doesn't exist or has been removed.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
