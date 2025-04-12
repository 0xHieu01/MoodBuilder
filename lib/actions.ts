"use server"
import { revalidatePath } from "next/cache"
import { createClient } from "@supabase/supabase-js"

// Create a Supabase client for server actions
function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
    },
  })
}

// Get the current user ID - for development, use a temporary user ID
async function getCurrentUserId() {
  // For development, use a temporary user ID
  return "00000000-0000-0000-0000-000000000000"
}

// Type for mood analysis
export interface MoodAnalysis {
  mood_score: number
  emotions: string[]
  themes: string[]
  summary: string
}

// Save a journal entry
export async function saveJournalEntry(content: string, moodAnalysis: MoodAnalysis) {
  try {
    const supabase = createServerClient()

    // Get the current user ID
    const userId = await getCurrentUserId()

    // Insert the journal entry
    const { data: entry, error: entryError } = await supabase
      .from("journal_entries")
      .insert({
        user_id: userId,
        content,
        mood_score: moodAnalysis.mood_score,
      })
      .select()
      .single()

    if (entryError) throw entryError

    // Process emotions
    for (const emotionName of moodAnalysis.emotions) {
      // Check if emotion exists
      let { data: emotion } = await supabase.from("emotions").select("id").eq("name", emotionName).single()

      // If emotion doesn't exist, create it
      if (!emotion) {
        const { data: newEmotion } = await supabase.from("emotions").insert({ name: emotionName }).select().single()

        emotion = newEmotion
      }

      // Link emotion to entry
      if (emotion) {
        await supabase.from("entry_emotions").insert({
          entry_id: entry.id,
          emotion_id: emotion.id,
        })
      }
    }

    // Process themes
    for (const themeName of moodAnalysis.themes) {
      // Check if theme exists
      let { data: theme } = await supabase.from("themes").select("id").eq("name", themeName).single()

      // If theme doesn't exist, create it
      if (!theme) {
        const { data: newTheme } = await supabase.from("themes").insert({ name: themeName }).select().single()

        theme = newTheme
      }

      // Link theme to entry
      if (theme) {
        await supabase.from("entry_themes").insert({
          entry_id: entry.id,
          theme_id: theme.id,
        })
      }
    }

    revalidatePath("/dashboard/history")
    revalidatePath("/dashboard/analytics")

    return { success: true, entry }
  } catch (error) {
    console.error("Error saving journal entry:", error)
    return { success: false, error }
  }
}

// Get all journal entries
export async function getJournalEntries() {
  try {
    const supabase = createServerClient()

    // Get the current user ID
    const userId = await getCurrentUserId()

    const { data: entries, error } = await supabase
      .from("journal_entries")
      .select(`
        *,
        emotions:entry_emotions(emotions(id, name)),
        themes:entry_themes(themes(id, name))
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error

    // Transform the nested data structure
    const formattedEntries = entries.map((entry) => {
      const emotions = entry.emotions ? entry.emotions.map((e) => e.emotions).filter(Boolean) : []

      const themes = entry.themes ? entry.themes.map((t) => t.themes).filter(Boolean) : []

      return {
        ...entry,
        emotions,
        themes,
      }
    })

    return { success: true, entries: formattedEntries }
  } catch (error) {
    console.error("Error fetching journal entries:", error)
    return { success: false, error, entries: [] }
  }
}

// Get a single journal entry
export async function getJournalEntry(id: string) {
  try {
    const supabase = createServerClient()

    // Get the current user ID
    const userId = await getCurrentUserId()

    // Get the journal entry
    const { data: entry, error } = await supabase
      .from("journal_entries")
      .select(`
        *,
        emotions:entry_emotions(emotions(id, name)),
        themes:entry_themes(themes(id, name))
      `)
      .eq("id", id)
      .eq("user_id", userId)
      .single()

    if (error) throw error

    // Transform the nested data structure
    const emotions = entry.emotions ? entry.emotions.map((e) => e.emotions).filter(Boolean) : []

    const themes = entry.themes ? entry.themes.map((t) => t.themes).filter(Boolean) : []

    const formattedEntry = {
      ...entry,
      emotions,
      themes,
    }

    return { success: true, entry: formattedEntry }
  } catch (error) {
    console.error("Error fetching journal entry:", error)
    return { success: false, error, entry: null }
  }
}

// Get mood data for analytics
export async function getMoodData(timeRange = "30d") {
  try {
    const supabase = createServerClient()

    // Get the current user ID
    const userId = await getCurrentUserId()

    // Calculate the date range
    const now = new Date()
    const startDate = new Date()

    switch (timeRange) {
      case "7d":
        startDate.setDate(now.getDate() - 7)
        break
      case "30d":
        startDate.setDate(now.getDate() - 30)
        break
      case "90d":
        startDate.setDate(now.getDate() - 90)
        break
      case "1y":
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }

    // Get journal entries within the date range
    const { data: entries, error } = await supabase
      .from("journal_entries")
      .select(`
        *,
        emotions:entry_emotions(emotions(id, name)),
        themes:entry_themes(themes(id, name))
      `)
      .eq("user_id", userId)
      .gte("created_at", startDate.toISOString())
      .lte("created_at", now.toISOString())
      .order("created_at", { ascending: true })

    if (error) throw error

    // Transform the entries for the charts
    const moodTrends = entries.map((entry) => ({
      date: entry.created_at,
      mood: entry.mood_score,
    }))

    // Count emotions frequency
    const emotionCounts = {}
    entries.forEach((entry) => {
      if (entry.emotions) {
        entry.emotions.forEach((e) => {
          if (e.emotions) {
            const name = e.emotions.name
            emotionCounts[name] = (emotionCounts[name] || 0) + 1
          }
        })
      }
    })

    // Convert emotion counts to array and sort by frequency
    const emotionFrequency = Object.entries(emotionCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10) // Top 10 emotions

    // Calculate mood distribution
    const moodRanges = [
      { name: "Low", min: 0, max: 33, color: "#ef4444" },
      { name: "Medium", min: 34, max: 66, color: "#f59e0b" },
      { name: "High", min: 67, max: 100, color: "#10b981" },
    ]

    const moodDistribution = moodRanges.map((range) => {
      const count = entries.filter((entry) => entry.mood_score >= range.min && entry.mood_score <= range.max).length

      return {
        name: range.name,
        value: count,
        color: range.color,
      }
    })

    return {
      success: true,
      data: {
        entries: moodTrends,
        emotions: emotionFrequency,
        distribution: moodDistribution,
        raw: entries,
      },
    }
  } catch (error) {
    console.error("Error fetching mood data:", error)
    return {
      success: false,
      error,
      data: {
        entries: [],
        emotions: [],
        distribution: [],
        raw: [],
      },
    }
  }
}
