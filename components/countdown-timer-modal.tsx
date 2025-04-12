"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Pause, Play, X } from "lucide-react"

interface CountdownTimerModalProps {
  isOpen: boolean
  onClose: () => void
  activity: {
    activity: string
    description: string
    duration: string
  } | null
}

export function CountdownTimerModal({ isOpen, onClose, activity }: CountdownTimerModalProps) {
  const [timeLeft, setTimeLeft] = useState(0)
  const [totalTime, setTotalTime] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  // Parse duration string (e.g., "5 min") to seconds
  useEffect(() => {
    if (activity) {
      const durationMatch = activity.duration.match(/(\d+)\s*min/)
      if (durationMatch && durationMatch[1]) {
        const minutes = Number.parseInt(durationMatch[1], 10)
        const seconds = minutes * 60
        setTimeLeft(seconds)
        setTotalTime(seconds)
        setIsPaused(false)
        setIsCompleted(false)
      }
    }
  }, [activity])

  // Countdown timer
  useEffect(() => {
    if (!isOpen || isPaused || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setIsCompleted(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen, isPaused, timeLeft])

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Calculate progress percentage
  const progressPercentage = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0

  const handleTogglePause = () => {
    setIsPaused(!isPaused)
  }

  const handleClose = () => {
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">{activity?.activity}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center space-y-6 py-4">
          {isCompleted ? (
            <div className="flex flex-col items-center space-y-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
              <p className="text-xl font-medium">Activity Completed!</p>
              <p className="text-center text-muted-foreground">{activity?.description}</p>
              <Button onClick={handleClose} className="mt-4 bg-black text-white hover:bg-zinc-800">
                Done
              </Button>
            </div>
          ) : (
            <>
              <div className="relative flex h-40 w-40 items-center justify-center rounded-full border-4 border-zinc-100">
                <span className="text-4xl font-bold">{formatTime(timeLeft)}</span>
              </div>
              <p className="text-center text-muted-foreground">{activity?.description}</p>
              <Progress value={progressPercentage} className="h-2 w-full" />
              <div className="flex gap-4">
                <Button
                  onClick={handleTogglePause}
                  variant="outline"
                  className="flex gap-2 border-zinc-200 hover:bg-zinc-100"
                >
                  {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  {isPaused ? "Resume" : "Pause"}
                </Button>
                <Button
                  onClick={handleClose}
                  variant="outline"
                  className="flex gap-2 border-zinc-200 hover:bg-zinc-100"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
