"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, FileText, AlertCircle } from "lucide-react"
import { analyzeMoodWithSolarPro } from "@/lib/actions/analyze-mood-v2"
import MoodAnalysisResult from "@/components/mood-analysis-result"

interface DocumentContentConfirmationProps {
  content: string
  onConfirm: (content: string, analysis: any) => void
  onEdit: (content: string) => void
  onCancel: () => void
}

export function DocumentContentConfirmation({
  content,
  onConfirm,
  onEdit,
  onCancel,
}: DocumentContentConfirmationProps) {
  const [editedContent, setEditedContent] = useState(content)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (!editedContent.trim()) {
      setError("Content cannot be empty")
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      console.log("Analyzing content with Solar Pro model...")
      const result = await analyzeMoodWithSolarPro(editedContent)
      setAnalysis(result)
    } catch (err) {
      console.error("Error analyzing mood with Solar Pro:", err)
      setError("Failed to analyze mood. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleConfirm = () => {
    if (!analysis) {
      setError("Please analyze the content first")
      return
    }
    onConfirm(editedContent, analysis)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-zinc-600" />
          Review Extracted Content
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-zinc-700">Review and edit the extracted text from your document:</p>
          <Textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="min-h-[300px] resize-none border-zinc-200 focus-visible:ring-zinc-400"
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {analysis && <MoodAnalysisResult analysis={analysis} />}
      </CardContent>
      <CardFooter className="flex justify-between border-t bg-zinc-50 p-4">
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="outline" onClick={() => onEdit(editedContent)}>
            Edit in Journal
          </Button>
        </div>
        <div className="flex gap-2">
          {!analysis ? (
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !editedContent.trim()}
              className="bg-black text-white hover:bg-zinc-800"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing with Solar Pro...
                </>
              ) : (
                "Analyze Mood with Solar Pro"
              )}
            </Button>
          ) : (
            <Button onClick={handleConfirm} className="bg-green-600 text-white hover:bg-green-700">
              Save Journal Entry
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
