"use client"

import { useState } from "react"
import { Lightbulb, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CountdownTimerModal } from "@/components/countdown-timer-modal"

// Mood-enhancing activities instead of journal prompts
const moodEnhancingActivities = [
  {
    activity: "Take 5 deep breaths",
    description: "Breathe in for 4 counts, hold for 4, exhale for 6",
    duration: "1 min",
  },
  {
    activity: "Quick meditation",
    description: "Focus on your breath and clear your mind",
    duration: "5 min",
  },
  {
    activity: "Gratitude moment",
    description: "Think of three things you're grateful for right now",
    duration: "2 min",
  },
  {
    activity: "Stretch break",
    description: "Stand up and stretch your body to release tension",
    duration: "3 min",
  },
  {
    activity: "Positive visualization",
    description: "Imagine yourself succeeding at your current challenge",
    duration: "3 min",
  },
]

interface JournalSuggestionsProps {
  className?: string
}

export function JournalSuggestions({ className }: JournalSuggestionsProps) {
  const [activities, setActivities] = useState(moodEnhancingActivities)
  const [loading, setLoading] = useState(false)
  const [isTimerOpen, setIsTimerOpen] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<(typeof moodEnhancingActivities)[0] | null>(null)

  const handleActivityClick = (activity: (typeof moodEnhancingActivities)[0]) => {
    setSelectedActivity(activity)
    setIsTimerOpen(true)
  }

  const handleCloseTimer = () => {
    setIsTimerOpen(false)
  }

  // If the component is used directly in the dashboard, we don't need the Card wrapper
  if (className?.includes("border-none")) {
    return (
      <div className={className}>
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="mr-2 h-5 w-5 animate-spin text-zinc-500" />
            <p className="text-sm text-zinc-500">Loading activities...</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {activities.map((item, index) => (
              <li key={index} className="group rounded-lg border border-zinc-100 p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-medium text-zinc-900">{item.activity}</span>
                    <span className="text-xs text-zinc-500">{item.description}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500">{item.duration}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-zinc-200 text-zinc-900 hover:bg-zinc-50"
                      onClick={() => handleActivityClick(item)}
                    >
                      Start
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <CountdownTimerModal isOpen={isTimerOpen} onClose={handleCloseTimer} activity={selectedActivity} />
      </div>
    )
  }

  // Default view with Card wrapper for sidebar - this is no longer used but kept for compatibility
  return (
    <Card className={`border-zinc-100 ${className || ""}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg font-medium">
          <Lightbulb className="mr-2 h-5 w-5 text-amber-500" />
          Mood Boosters
        </CardTitle>
        <CardDescription>Quick activities to enhance your mood</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="mr-2 h-5 w-5 animate-spin text-zinc-500" />
            <p className="text-sm text-zinc-500">Loading activities...</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {activities.map((item, index) => (
              <li key={index} className="group">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left text-sm font-normal text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
                  onClick={() => handleActivityClick(item)}
                >
                  <div className="flex w-full flex-col">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{item.activity}</span>
                      <span className="text-xs text-zinc-500">{item.duration}</span>
                    </div>
                    <span className="line-clamp-1 text-xs text-zinc-500 group-hover:text-zinc-700">
                      {item.description}
                    </span>
                  </div>
                </Button>
              </li>
            ))}
          </ul>
        )}

        <CountdownTimerModal isOpen={isTimerOpen} onClose={handleCloseTimer} activity={selectedActivity} />
      </CardContent>
    </Card>
  )
}
