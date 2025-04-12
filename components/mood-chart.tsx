"use client"

import { useEffect, useState } from "react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "@/components/ui/chart"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { format, subDays } from "date-fns"

export function MoodChart() {
  const [mounted, setMounted] = useState(false)
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    setMounted(true)

    async function fetchMoodData() {
      try {
        // Get entries from the last 7 days
        const sevenDaysAgo = subDays(new Date(), 7)

        const { data } = await supabase
          .from("journal_entries")
          .select("created_at, mood_score, analysis_data")
          .gte("created_at", sevenDaysAgo.toISOString())
          .order("created_at", { ascending: true })

        if (data && data.length > 0) {
          // Process data for chart
          const processedData = data.map((entry) => {
            // Get mood score from entry or analysis_data
            const moodScore = entry.analysis_data?.analysis?.mood_score || entry.mood_score || 50

            // Get emotions from analysis_data
            let keywords = []
            if (entry.analysis_data?.analysis?.emotions) {
              keywords = entry.analysis_data.analysis.emotions
            }

            return {
              day: format(new Date(entry.created_at), "EEE"),
              date: format(new Date(entry.created_at), "MMM d"),
              mood: moodScore,
              keywords: keywords,
            }
          })

          setChartData(processedData)
        } else {
          // Use default data if no entries found
          setChartData([
            { day: "Mon", date: "Mon", mood: 65, keywords: ["busy", "productive"] },
            { day: "Tue", date: "Tue", mood: 75, keywords: ["energetic", "focused"] },
            { day: "Wed", date: "Wed", mood: 85, keywords: ["happy", "accomplished"] },
            { day: "Thu", date: "Thu", mood: 70, keywords: ["tired", "satisfied"] },
            { day: "Fri", date: "Fri", mood: 60, keywords: ["stressed", "anxious"] },
            { day: "Sat", date: "Sat", mood: 90, keywords: ["relaxed", "joyful"] },
            { day: "Sun", date: "Sun", mood: 80, keywords: ["content", "peaceful"] },
          ])
        }
      } catch (error) {
        console.error("Error fetching mood data:", error)
        // Use default data on error
        setChartData([
          { day: "Mon", date: "Mon", mood: 65, keywords: ["busy", "productive"] },
          { day: "Tue", date: "Tue", mood: 75, keywords: ["energetic", "focused"] },
          { day: "Wed", date: "Wed", mood: 85, keywords: ["happy", "accomplished"] },
          { day: "Thu", date: "Thu", mood: 70, keywords: ["tired", "satisfied"] },
          { day: "Fri", date: "Fri", mood: 60, keywords: ["stressed", "anxious"] },
          { day: "Sat", date: "Sat", mood: 90, keywords: ["relaxed", "joyful"] },
          { day: "Sun", date: "Sun", mood: 80, keywords: ["content", "peaceful"] },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchMoodData()
  }, [supabase])

  if (!mounted) {
    return <div className="h-[300px]" />
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#18181b" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#18181b" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="day" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#71717a"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          domain={[0, 100]}
          tickFormatter={(value) => `${value}`}
        />
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border border-zinc-200 bg-white p-2 shadow-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-zinc-500">Day</span>
                      <span className="font-bold text-zinc-900">{payload[0].payload.date}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-zinc-500">Mood</span>
                      <span className="font-bold text-zinc-900">{payload[0].value}%</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="text-xs text-zinc-500">Keywords:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {payload[0].payload.keywords.map((keyword: string, idx: number) => (
                        <span key={idx} className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-800">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )
            }
            return null
          }}
        />
        <Area type="monotone" dataKey="mood" stroke="#18181b" fillOpacity={1} fill="url(#moodGradient)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
