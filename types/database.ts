export interface User {
  id: string
  email: string
  full_name?: string
  created_at: string
  updated_at: string
}

export interface JournalEntry {
  id: string
  user_id: string
  content: string
  mood_score: number
  created_at: string
  updated_at: string
  emotions?: Emotion[]
  themes?: Theme[]
}

export interface Emotion {
  id: string
  name: string
}

export interface Theme {
  id: string
  name: string
}

export interface Suggestion {
  id: string
  title: string
  description: string
  category: string
  duration?: string
  impact?: string
  mood_target?: string
  created_at: string
}

export interface UserSuggestion {
  user_id: string
  suggestion_id: string
  status: "pending" | "accepted" | "declined" | "completed"
  scheduled_for?: string
  suggestion?: Suggestion
}

export interface MoodAnalysis {
  mood_score: number
  emotions: string[]
  themes: string[]
  summary: string
}
