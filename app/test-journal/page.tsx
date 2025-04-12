"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { analyzeMoodWithSolarPro, saveAnalyzedJournalEntry } from "@/lib/actions/analyze-mood"
import MoodAnalysisResult from "@/components/mood-analysis-result"

export default function TestJournalPage() {
  const [content, setContent] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (!content.trim()) return

    setIsAnalyzing(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await analyzeMoodWithSolarPro(content)
      setAnalysis(result)
    } catch (error) {
      console.error("Error analyzing journal entry:", error)
      setError("Failed to analyze mood. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSave = async () => {
    if (!content.trim() || !analysis) return

    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await saveAnalyzedJournalEntry(content, analysis)
      if (result.success) {
        setSuccess(`Journal entry saved successfully with ID: ${result.entry.id}`)
      } else {
        setError(result.error || "Failed to save journal entry")
      }
    } catch (error) {
      console.error("Error saving journal entry:", error)
      setError("An unexpected error occurred while saving")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-3xl font-bold">Test Journal Entry Saving</h1>

      <Card>
        <CardHeader>
          <CardTitle>New Journal Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="How are you feeling today? What's on your mind?"
            className="min-h-[200px] resize-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </CardContent>
        <CardFooter className="flex flex-col items-start space-y-4">
          {error && (
            <Alert variant="destructive" className="w-full">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="w-full bg-green-50 text-green-800">
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {analysis && (
            <div className="w-full space-y-6">
              <MoodAnalysisResult analysis={analysis} />
            </div>
          )}

          <div className="flex w-full gap-4">
            {!analysis ? (
              <Button
                onClick={handleAnalyze}
                disabled={!content.trim() || isAnalyzing}
                className="bg-black text-white hover:bg-zinc-800"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze Mood"
                )}
              </Button>
            ) : (
              <Button onClick={handleSave} disabled={isSaving} className="bg-green-600 text-white hover:bg-green-700">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Journal Entry"
                )}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
