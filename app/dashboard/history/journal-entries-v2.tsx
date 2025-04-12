"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import Link from "next/link"
import { getBrowserClient } from "@/lib/supabase"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function JournalEntries() {
  const [loading, setLoading] = useState(true)
  const [entries, setEntries] = useState([])
  const [error, setError] = useState(null)
  const [visibleEntries, setVisibleEntries] = useState(5) // Initially show 5 entries
  const supabase = getBrowserClient()

  useEffect(() => {
    async function fetchEntries() {
      try {
        console.log("Fetching journal entries...")
        // Fetch entries from the new v2 table
        const { data, error } = await supabase
          .from("journal_entries_v2")
          .select(`
            *,
            entry_emotions_v2(
              emotions(name)
            ),
            entry_themes_v2(
              themes(name)
            )
          `)
          .order("created_at", { ascending: false })

        if (error) {
          console.error("Error fetching journal entries:", error)
          throw error
        }

        console.log(`Fetched ${data?.length || 0} journal entries`)
        if (data) {
          setEntries(data)
        }
      } catch (err) {
        console.error("Failed to load journal entries:", err)
        setError(err.message || "Failed to load journal entries")
      } finally {
        setLoading(false)
      }
    }

    fetchEntries()
  }, [supabase])

  const loadMoreEntries = () => {
    setVisibleEntries((prev) => prev + 5)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        <p className="text-zinc-500">Loading journal entries...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-700">Failed to load journal entries: {error}</p>
      </div>
    )
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-6 text-center">
        <p className="text-zinc-500">No journal entries yet. Start writing to see your entries here.</p>
      </div>
    )
  }

  // Only show the first 'visibleEntries' number of entries
  const displayedEntries = entries.slice(0, visibleEntries)
  const hasMoreEntries = entries.length > visibleEntries

  return (
    <div className="space-y-6">
      {displayedEntries.map((entry) => {
        // Format the date
        const date = new Date(entry.created_at)
        const formattedDate = format(date, "MMMM d, yyyy 'at' h:mm a")

        // Truncate content if it's too long
        const truncatedContent = entry.content.length > 200 ? `${entry.content.substring(0, 200)}...` : entry.content

        // Determine mood color
        let moodColor = "bg-gray-200"
        if (entry.mood_score >= 80) moodColor = "bg-green-500"
        else if (entry.mood_score >= 60) moodColor = "bg-green-300"
        else if (entry.mood_score >= 40) moodColor = "bg-yellow-300"
        else if (entry.mood_score >= 20) moodColor = "bg-orange-300"
        else moodColor = "bg-red-300"

        // Get emotions and themes
        let emotions = []
        let themes = []

        // Try to get emotions from entry_emotions_v2
        if (entry.entry_emotions_v2 && entry.entry_emotions_v2.length > 0) {
          emotions = entry.entry_emotions_v2
            .map((item) => item.emotions)
            .filter(Boolean)
            .map((emotion) => emotion.name)
        }

        // Try to get themes from entry_themes_v2
        if (entry.entry_themes_v2 && entry.entry_themes_v2.length > 0) {
          themes = entry.entry_themes_v2
            .map((item) => item.themes)
            .filter(Boolean)
            .map((theme) => theme.name)
        }

        // If we have analysis_data, use that for emotions and themes
        if (entry.analysis_data && entry.analysis_data.analysis) {
          const analysis = entry.analysis_data.analysis
          if (analysis.emotions && analysis.emotions.length > 0) {
            emotions = analysis.emotions
          }
          if (analysis.themes && analysis.themes.length > 0) {
            themes = analysis.themes
          }
        }

        return (
          <div key={entry.id} className="rounded-lg border border-zinc-200 p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm text-zinc-500">{formattedDate}</div>
              <div className="flex items-center gap-2">
                <div className={`h-4 w-4 rounded-full ${moodColor}`}></div>
                <span className="text-sm font-medium">Mood: {entry.mood_score}/100</span>
              </div>
            </div>

            <p className="mb-3 whitespace-pre-wrap">{truncatedContent}</p>

            <div className="mb-3 flex flex-wrap gap-2">
              {emotions.map((emotion, index) => (
                <Badge key={`emotion-${index}`} variant="secondary">
                  {emotion}
                </Badge>
              ))}
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              {themes.map((theme, index) => (
                <Badge key={`theme-${index}`} variant="outline">
                  {theme}
                </Badge>
              ))}
            </div>

            <div className="flex justify-end">
              <Link
                href={`/dashboard/journal/${entry.id}`}
                className="text-sm font-medium text-zinc-900 hover:text-zinc-700 hover:underline"
              >
                View full entry
              </Link>
            </div>
          </div>
        )
      })}

      {hasMoreEntries && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            onClick={loadMoreEntries}
            className="flex items-center gap-2 border-zinc-200 text-zinc-600 hover:bg-zinc-50"
          >
            <ChevronDown className="h-4 w-4" />
            Load more entries
          </Button>
        </div>
      )}
    </div>
  )
}
