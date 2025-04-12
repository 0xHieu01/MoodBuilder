"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { SidebarProvider } from "@/components/ui/sidebar"
import { MoodChart } from "@/components/mood-chart"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { JournalSuggestions } from "@/components/journal-suggestions"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { format } from "date-fns"

export default function DashboardPage() {
  const [journalStreak, setJournalStreak] = useState(0)
  const [weeklyMood, setWeeklyMood] = useState(0)
  const [latestEntry, setLatestEntry] = useState<any>(null)
  const [journalEntries, setJournalEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [hasEntries, setHasEntries] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch latest entry
        const { data: latestEntryData, error: latestEntryError } = await supabase
          .from("journal_entries_v2") // Use v2 table
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle() // Use maybeSingle to handle case when no entries exist

        if (latestEntryData) {
          setLatestEntry(latestEntryData)
          setHasEntries(true)
        }

        // Fetch all entries for the calendar (last 90 days)
        const ninetyDaysAgo = new Date()
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

        const { data: entriesData } = await supabase
          .from("journal_entries_v2") // Use v2 table
          .select("id, created_at, mood_score, analysis_data")
          .gte("created_at", ninetyDaysAgo.toISOString())
          .order("created_at", { ascending: false })

        if (entriesData && entriesData.length > 0) {
          setJournalEntries(entriesData)
          setHasEntries(true)
        } else {
          // Reset values if no entries
          setJournalStreak(0)
          setWeeklyMood(0)
          setHasEntries(false)
        }

        // Update weekly mood based on latest entries
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

        const { data: weekEntries } = await supabase
          .from("journal_entries_v2") // Use v2 table
          .select("mood_score, analysis_data")
          .gte("created_at", oneWeekAgo.toISOString())

        if (weekEntries && weekEntries.length > 0) {
          // Calculate average mood score from entries and analysis_data
          const totalScore = weekEntries.reduce((sum, entry) => {
            // Use analysis_data.analysis.mood_score if available, otherwise use entry.mood_score
            const score = entry.analysis_data?.analysis?.mood_score || entry.mood_score || 50
            return sum + score
          }, 0)

          setWeeklyMood(Math.round(totalScore / weekEntries.length))
        } else {
          setWeeklyMood(0)
        }

        // Calculate journal streak
        const { data: recentEntries } = await supabase
          .from("journal_entries_v2") // Use v2 table
          .select("created_at")
          .order("created_at", { ascending: false })
          .limit(30)

        if (recentEntries && recentEntries.length > 0) {
          // Calculate streak by checking consecutive days
          let streak = 1
          const currentDate = new Date()
          currentDate.setHours(0, 0, 0, 0) // Set to start of day

          for (let i = 0; i < 30; i++) {
            // Check if there's an entry for this day
            const hasEntryForDay = recentEntries.some((entry) => {
              const entryDate = new Date(entry.created_at)
              entryDate.setHours(0, 0, 0, 0) // Set to start of day
              return entryDate.getTime() === currentDate.getTime()
            })

            if (hasEntryForDay) {
              if (i > 0) streak++
            } else {
              break
            }

            // Move to previous day
            currentDate.setDate(currentDate.getDate() - 1)
          }

          setJournalStreak(streak)
        } else {
          setJournalStreak(0)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        // Reset values on error
        setJournalStreak(0)
        setWeeklyMood(0)
        setHasEntries(false)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase])

  // Function to get mood description
  const getMoodDescription = (score: number) => {
    if (score >= 80) return "Very Positive"
    if (score >= 60) return "Positive"
    if (score >= 40) return "Neutral"
    if (score >= 20) return "Negative"
    return "Very Negative"
  }

  // Get mood score from latest entry or its analysis_data
  const getMoodScore = () => {
    if (!latestEntry) return 50

    if (latestEntry.analysis_data?.analysis?.mood_score) {
      return latestEntry.analysis_data.analysis.mood_score
    }

    return latestEntry.mood_score || 50
  }

  const moodScore = getMoodScore()
  const moodDescription = getMoodDescription(moodScore)

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-white">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col">
          <DashboardHeader />
          <main className="flex-1 p-6 md:p-8">
            <div className="mx-auto max-w-7xl">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-zinc-100 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-zinc-900">Current Mood</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {hasEntries ? (
                      <>
                        <div className="text-2xl font-bold text-zinc-900">{moodDescription}</div>
                        <p className="text-xs text-zinc-500">
                          {latestEntry
                            ? `Based on entry from ${format(new Date(latestEntry.created_at), "MMM d")}`
                            : "No recent entries"}
                        </p>
                        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                          <div className="h-full rounded-full bg-zinc-900" style={{ width: `${moodScore}%` }} />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-2xl font-bold text-zinc-900">No Data</div>
                        <p className="text-xs text-zinc-500">No entries yet</p>
                        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                          <div className="h-full rounded-full bg-zinc-900" style={{ width: "0%" }} />
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
                <Card className="border-zinc-100 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-zinc-900">Journal Streak</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-zinc-900">{journalStreak} days</div>
                    <p className="text-xs text-zinc-500">
                      {journalStreak > 0
                        ? "Keep it up! You're building a great habit."
                        : "Start journaling to build your streak!"}
                    </p>
                    <Progress className="mt-4" value={journalStreak * 10} />
                  </CardContent>
                </Card>
                <Card className="border-zinc-100 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-zinc-900">Weekly Mood</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {weeklyMood > 0 ? (
                      <>
                        <div className="text-2xl font-bold text-zinc-900">{weeklyMood}%</div>
                        <p className="text-xs text-zinc-500">Based on your entries from the past week</p>
                      </>
                    ) : (
                      <>
                        <div className="text-2xl font-bold text-zinc-900">No Data</div>
                        <p className="text-xs text-zinc-500">No entries in the past week</p>
                      </>
                    )}
                    <Progress className="mt-4" value={weeklyMood} />
                  </CardContent>
                </Card>
                <Card className="border-zinc-100 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-zinc-900">Next Goal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {hasEntries ? (
                      <>
                        <div className="text-2xl font-bold text-zinc-900">Exercise</div>
                        <p className="text-xs text-zinc-500">3 times this week (1/3 completed)</p>
                        <Progress className="mt-4" value={33} />
                      </>
                    ) : (
                      <>
                        <div className="text-2xl font-bold text-zinc-900">Set a Goal</div>
                        <p className="text-xs text-zinc-500">Start journaling to track your goals</p>
                        <Progress className="mt-4" value={0} />
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
              <div className="mt-6 grid gap-6 md:grid-cols-7">
                <Card className="border-zinc-100 shadow-sm md:col-span-4">
                  <CardHeader>
                    <CardTitle className="text-zinc-900">Mood Trends</CardTitle>
                    <CardDescription className="text-zinc-500">
                      Your emotional patterns over the past 7 days
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-2 pb-6">
                    <MoodChart />
                  </CardContent>
                </Card>
                <Card className="border-zinc-100 shadow-sm md:col-span-3">
                  <CardHeader>
                    <CardTitle className="text-zinc-900">Mood Boosters</CardTitle>
                    <CardDescription className="text-zinc-500">Based on your recent mood patterns</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <JournalSuggestions className="border-none p-0 shadow-none" />
                  </CardContent>
                </Card>
              </div>

              <div className="mt-8 flex justify-center">
                <Button asChild size="lg" className="bg-black px-8 py-6 text-white hover:bg-zinc-800">
                  <Link href="/dashboard/journal" className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    Write Today's Journal Entry
                  </Link>
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
