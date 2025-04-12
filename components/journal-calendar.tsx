"use client"

import { useState, useEffect } from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Entry {
  id: string
  created_at: string
  mood_score: number
  analysis_data?: {
    analysis?: {
      mood_score?: number
    }
  }
}

interface JournalCalendarProps {
  entries: Entry[]
}

export function JournalCalendar({ entries = [] }: JournalCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [entryMap, setEntryMap] = useState<Record<string, { score: number; count: number }>>({})
  const [mounted, setMounted] = useState(false)

  // Process entries to map them by date
  useEffect(() => {
    setMounted(true)

    // Create a map of dates to mood scores
    const map: Record<string, { score: number; count: number }> = {}

    entries.forEach((entry) => {
      try {
        // Skip invalid entries
        if (!entry.created_at) return

        const date = new Date(entry.created_at)
        if (isNaN(date.getTime())) return

        const dateKey = format(date, "yyyy-MM-dd")
        const score = entry.mood_score || entry.analysis_data?.analysis?.mood_score || 50

        if (map[dateKey]) {
          map[dateKey].score = (map[dateKey].score * map[dateKey].count + score) / (map[dateKey].count + 1)
          map[dateKey].count += 1
        } else {
          map[dateKey] = { score, count: 1 }
        }
      } catch (error) {
        console.error("Error processing entry:", error)
      }
    })

    // Add some sample data if no entries exist (for demo purposes)
    if (entries.length === 0) {
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const twoDaysAgo = new Date(today)
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

      map[format(today, "yyyy-MM-dd")] = { score: 85, count: 1 }
      map[format(yesterday, "yyyy-MM-dd")] = { score: 60, count: 2 }
      map[format(twoDaysAgo, "yyyy-MM-dd")] = { score: 30, count: 1 }
    }

    setEntryMap(map)
  }, [entries])

  // Get days for the current month
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Navigation functions
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

  // Get mood color based on score
  const getMoodColor = (score: number) => {
    if (score >= 80) return "bg-green-500" // Very positive
    if (score >= 60) return "bg-green-300" // Positive
    if (score >= 40) return "bg-blue-500" // Neutral
    if (score >= 20) return "bg-amber-500" // Mixed
    return "bg-red-500" // Negative
  }

  // Get mood description based on score
  const getMoodDescription = (score: number) => {
    if (score >= 80) return "Very Positive"
    if (score >= 60) return "Positive"
    if (score >= 40) return "Neutral"
    if (score >= 20) return "Mixed"
    return "Negative"
  }

  // Don't render during SSR
  if (!mounted) {
    return <div className="h-[350px] animate-pulse rounded-md bg-zinc-50" />
  }

  return (
    <div className="w-full">
      {/* Calendar header with month navigation */}
      <div className="mb-4 flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={prevMonth} className="h-8 w-8 rounded-full p-0">
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous month</span>
        </Button>

        <h2 className="text-lg font-medium">{format(currentMonth, "MMMM yyyy")}</h2>

        <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8 rounded-full p-0">
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next month</span>
        </Button>
      </div>

      {/* Calendar grid */}
      <div className="rounded-md border border-zinc-200">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-zinc-200 bg-zinc-50 text-center">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <div key={day} className="py-2 text-xs font-medium text-zinc-500">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {/* Add empty cells for days before the start of the month */}
          {Array.from({ length: monthStart.getDay() }).map((_, index) => (
            <div key={`empty-start-${index}`} className="h-12 border-b border-r border-zinc-100 bg-zinc-50/50 p-1" />
          ))}

          {/* Actual days of the month */}
          {monthDays.map((day) => {
            const dateKey = format(day, "yyyy-MM-dd")
            const entry = entryMap[dateKey]
            const isToday = isSameDay(day, new Date())

            return (
              <TooltipProvider key={dateKey}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={`relative h-12 border-b border-r border-zinc-100 p-1 ${isToday ? "bg-zinc-50" : ""}`}
                    >
                      <div className="flex h-full flex-col">
                        {/* Day number */}
                        <div className={`text-xs ${isToday ? "font-bold" : ""}`}>{format(day, "d")}</div>

                        {/* Mood indicator */}
                        {entry && (
                          <div className="mt-auto">
                            <div
                              className={`h-2 w-full rounded-sm ${getMoodColor(entry.score)}`}
                              aria-label={`Mood: ${getMoodDescription(entry.score)}`}
                            />
                            {entry.count > 1 && (
                              <div className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-200 text-[10px] text-zinc-700">
                                {entry.count}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </TooltipTrigger>
                  {entry && (
                    <TooltipContent>
                      <div className="text-sm">
                        <p className="font-medium">{format(day, "MMMM d, yyyy")}</p>
                        <p>
                          Mood: {getMoodDescription(entry.score)} ({Math.round(entry.score)}/100)
                        </p>
                        <p>
                          {entry.count} {entry.count === 1 ? "entry" : "entries"}
                        </p>
                      </div>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            )
          })}

          {/* Add empty cells for days after the end of the month */}
          {Array.from({ length: 6 - monthEnd.getDay() }).map((_, index) => (
            <div key={`empty-end-${index}`} className="h-12 border-b border-r border-zinc-100 bg-zinc-50/50 p-1" />
          ))}
        </div>
      </div>
    </div>
  )
}
