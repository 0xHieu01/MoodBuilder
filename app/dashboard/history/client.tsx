"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { JournalCalendar } from "@/components/journal-calendar"
import JournalEntries from "./journal-entries-v2"
import { getBrowserClient } from "@/lib/supabase"

export default function HistoryClient() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = getBrowserClient()

  useEffect(() => {
    // Fetch entries for both the journal entries list and calendar
    async function fetchEntries() {
      try {
        console.log("Fetching entries for history page...")
        const { data, error } = await supabase
          .from("journal_entries_v2") // Use the new v2 table
          .select("id, created_at, mood_score, analysis_data")
          .order("created_at", { ascending: false })

        if (error) {
          console.error("Error fetching entries for history page:", error)
          return
        }

        console.log(`Fetched ${data?.length || 0} entries for history page`)
        if (data) {
          setEntries(data)
        }
      } catch (error) {
        console.error("Error fetching entries for history page:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEntries()
  }, [supabase])

  return (
    <div className="grid gap-8 md:grid-cols-12">
      <Card className="border-zinc-100 shadow-sm md:col-span-7">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Recent Entries</CardTitle>
          <CardDescription>Your journal entries from the past week</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-4 pb-6">
          <JournalEntries />
        </CardContent>
      </Card>

      <Card className="border-zinc-100 shadow-sm md:col-span-5">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Calendar View</CardTitle>
          <CardDescription>Mood patterns by date</CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-6">
          <JournalCalendar entries={entries} />
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span className="text-sm">Positive</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500" />
              <span className="text-sm">Neutral</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-amber-500" />
              <span className="text-sm">Mixed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <span className="text-sm">Negative</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
