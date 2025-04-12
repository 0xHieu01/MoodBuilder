"use client"

import { useEffect, useState } from "react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "@/components/ui/chart"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { format, subDays } from "date-fns"

export function MoodChart() {
  const [mounted, setMounted] = useState(false)
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)
  const [hasData, setHasData] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    setMounted(true)

    async function fetchMoodData() {
      try {
        // Get entries from the last 7 days
        const sevenDaysAgo = subDays(new Date(), 7)

        const { data } = await supabase
          .from("journal_entries_v2") // Use v2 table
          .select("created_at, mood_score, analysis_data")
          .gte("created_at", sevenDaysAgo.toISOString())
          .order("created_at", { ascending: true })

        if (data && data.length > 0) {
          // Group entries by day and calculate average mood score
          const entriesByDay = {}

          // Process each entry
          data.forEach((entry) => {
            const entryDate = new Date(entry.created_at)
            const dateKey = format(entryDate, "yyyy-MM-dd")
            const moodScore = entry.analysis_data?.analysis?.mood_score || entry.mood_score || 50

            // Get emotions from analysis_data
            let keywords = []
            if (entry.analysis_data?.analysis?.emotions) {
              keywords = entry.analysis_data.analysis.emotions
            }

            // Initialize or update the day's data
            if (!entriesByDay[dateKey]) {
              entriesByDay[dateKey] = {
                date: entryDate,
                totalScore: moodScore,
                count: 1,
                allKeywords: keywords,
              }
            } else {
              entriesByDay[dateKey].totalScore += moodScore
              entriesByDay[dateKey].count += 1
              entriesByDay[dateKey].allKeywords = [...entriesByDay[dateKey].allKeywords, ...keywords]
            }
          })

          // Create chart data with daily averages
          const processedData = Object.values(entriesByDay).map((dayData) => {
            // Calculate average mood score for the day
            const avgMoodScore = Math.round(dayData.totalScore / dayData.count)

            // Get unique keywords
            const uniqueKeywords = Array.from(new Set(dayData.allKeywords))

            return {
              day: format(dayData.date, "EEE"),
              date: format(dayData.date, "MMM d"),
              mood: avgMoodScore,
              keywords: uniqueKeywords.slice(0, 5), // Limit to top 5 keywords
              entryCount: dayData.count,
            }
          })

          // Sort by date
          processedData.sort((a, b) => {
            const dateA = new Date(a.date)
            const dateB = new Date(b.date)
            return dateA.getTime() - dateB.getTime()
          })

          setChartData(processedData)
          setHasData(true)
        } else {
          // No data available
          setChartData([])
          setHasData(false)
        }
      } catch (error) {
        console.error("Error fetching mood data:", error)
        setChartData([])
        setHasData(false)
      } finally {
        setLoading(false)
      }
    }

    fetchMoodData()
  }, [supabase])

  if (!mounted) {
    return <div className="h-[300px]" />
  }

  if (loading) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <div className="text-sm text-zinc-500">Loading mood data...</div>
      </div>
    )
  }

  if (!hasData) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-zinc-500">No mood data available for the past 7 days.</p>
          <p className="mt-2 text-sm text-zinc-500">Start journaling to see your mood trends!</p>
        </div>
      </div>
    )
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
                  <div className="mt-1">
                    <span className="text-[0.70rem] uppercase text-zinc-500">Entries</span>
                    <span className="ml-1 text-xs font-medium text-zinc-900">{payload[0].payload.entryCount}</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-xs text-zinc-500">Keywords:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {payload[0].payload.keywords && payload[0].payload.keywords.length > 0 ? (
                        payload[0].payload.keywords.map((keyword: string, idx: number) => (
                          <span key={idx} className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-800">
                            {keyword}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-zinc-500">No keywords available</span>
                      )}
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
