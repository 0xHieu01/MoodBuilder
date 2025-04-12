"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AlertCircle, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { SidebarProvider } from "@/components/ui/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import MoodAnalysisResult from "@/components/mood-analysis-result"
import { uploadJournalDocument } from "@/lib/actions/upload-actions"
import { DocumentProcessingStatus } from "@/components/document-processing-status"
import { DocumentContentConfirmation } from "@/components/document-content-confirmation"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { analyzeMoodWithSolarPro, saveAnalyzedJournalEntry } from "@/lib/actions/analyze-mood-v2"
// import { JournalSuggestions } from "@/components/journal-suggestions"

export default function JournalPage() {
  const searchParams = useSearchParams()
  const initialContent = searchParams.get("content") || ""

  const [content, setContent] = useState(initialContent)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("type")
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<any>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [parsedContent, setParsedContent] = useState("")

  // Auto-analyze if content is provided via query param
  useEffect(() => {
    if (initialContent && !analysis) {
      handleAnalyze()
    }
  }, [initialContent])

  const handleAnalyze = async () => {
    if (!content.trim()) return

    setIsAnalyzing(true)
    setError(null)

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

    try {
      const result = await saveAnalyzedJournalEntry(content, analysis)
      if (result.success) {
        // Redirect to the entry page
        router.push(`/dashboard/journal/${result.entry.id}`)
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]

    if (selectedFile) {
      // Check file size (limit to 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("File size exceeds 10MB limit")
        setFile(null)
        return
      }

      // Check file type
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/bmp",
        "application/pdf",
        "image/tiff",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
        "application/vnd.openxmlformats-officedocument.presentationml.presentation", // pptx
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // xlsx
      ]

      if (!allowedTypes.includes(selectedFile.type)) {
        setError("File type not supported. Please upload JPEG, PNG, BMP, PDF, TIFF, DOCX, PPTX, or XLSX files.")
        setFile(null)
        return
      }

      setFile(selectedFile)
      setError(null) // Clear any previous errors
    } else {
      setFile(null)
    }
  }

  const handleFileUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const result = await uploadJournalDocument(formData)

      if (result.success) {
        setUploadResult(result)
      } else {
        setError(result.error || "Failed to upload document")
      }
    } catch (error) {
      setError("An unexpected error occurred during upload")
      console.error("Upload error:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleParsedContent = (parsedContent: string) => {
    console.log("Received parsed content:", parsedContent.substring(0, 100) + "...")
    setParsedContent(parsedContent)
    setShowConfirmation(true)
  }

  const handleConfirmContent = async (confirmedContent: string, analysis: any) => {
    setContent(confirmedContent)
    setAnalysis(analysis)
    setShowConfirmation(false)
    setActiveTab("type")

    // Auto-save if we have content and analysis
    if (confirmedContent.trim() && analysis) {
      setIsSaving(true)
      try {
        const result = await saveAnalyzedJournalEntry(confirmedContent, analysis)
        if (result.success) {
          // Redirect to the entry page
          router.push(`/dashboard/journal/${result.entry.id}`)
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
  }

  const handleEditContent = (editedContent: string) => {
    setContent(editedContent)
    setShowConfirmation(false)
    setActiveTab("type")
  }

  const handleCancelConfirmation = () => {
    setShowConfirmation(false)
    setActiveTab("type")
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-white">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col">
          <DashboardHeader />
          <main className="flex-1 p-6 md:p-8">
            <div className="mx-auto max-w-7xl w-full px-0 md:px-2">
              <div className="mb-6">
                <h1 className="text-3xl font-bold">Journal Entry</h1>
                <p className="text-muted-foreground">Record your thoughts and feelings</p>
              </div>

              {showConfirmation ? (
                <DocumentContentConfirmation
                  content={parsedContent}
                  onConfirm={handleConfirmContent}
                  onEdit={handleEditContent}
                  onCancel={handleCancelConfirmation}
                />
              ) : (
                <Card className="border-zinc-100 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl text-zinc-900">New Journal Entry</CardTitle>
                    <CardDescription className="text-zinc-500">
                      Write your journal or upload your journal
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="type" value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="grid w-full grid-cols-2 bg-zinc-100">
                        <TabsTrigger
                          value="type"
                          className="data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-none"
                        >
                          Type your today journal
                        </TabsTrigger>
                        <TabsTrigger
                          value="upload"
                          className="data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-none"
                        >
                          Upload your journal
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="type" className="mt-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="md:col-span-2">
                            <Textarea
                              placeholder="How are you feeling today? What's on your mind?"
                              className="min-h-[400px] resize-none border-zinc-200 focus-visible:ring-zinc-400"
                              value={content}
                              onChange={(e) => setContent(e.target.value)}
                            />
                          </div>
                          <div className="md:col-span-1">
                            <Card className="border-zinc-100 h-fit">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Journal Prompts</CardTitle>
                                <CardDescription>Need inspiration? Try one of these prompts</CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <Button
                                  variant="outline"
                                  className="w-full justify-start text-left h-auto p-3 border-zinc-200"
                                  onClick={() => setContent((prev) => prev + "Today I'm feeling grateful for...")}
                                >
                                  <div>
                                    <p className="font-medium mb-1">Gratitude Reflection</p>
                                    <p className="text-xs text-zinc-500">Today I'm feeling grateful for...</p>
                                  </div>
                                </Button>
                                <Button
                                  variant="outline"
                                  className="w-full justify-start text-left h-auto p-3 border-zinc-200"
                                  onClick={() =>
                                    setContent((prev) => prev + "Something that challenged me today was...")
                                  }
                                >
                                  <div>
                                    <p className="font-medium mb-1">Challenge Reflection</p>
                                    <p className="text-xs text-zinc-500">Something that challenged me today was...</p>
                                  </div>
                                </Button>
                                <Button
                                  variant="outline"
                                  className="w-full justify-start text-left h-auto p-3 border-zinc-200"
                                  onClick={() => setContent((prev) => prev + "My goal for tomorrow is...")}
                                >
                                  <div>
                                    <p className="font-medium mb-1">Goal Setting</p>
                                    <p className="text-xs text-zinc-500">My goal for tomorrow is...</p>
                                  </div>
                                </Button>
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="upload" className="mt-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="md:col-span-2">
                            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-200 p-8 h-full">
                              <Upload className="mb-4 h-10 w-10 text-zinc-400" />
                              <h3 className="mb-2 text-lg font-medium text-zinc-900">Upload your journal</h3>
                              <p className="mb-4 text-sm text-zinc-500">Drag and drop your file, or click to browse</p>
                              <input
                                type="file"
                                id="file-upload"
                                className="hidden"
                                accept=".pdf,.jpg,.jpeg,.png,.bmp,.tiff,.docx,.pptx,.xlsx"
                                onChange={handleFileChange}
                              />
                              <Button
                                asChild
                                variant="outline"
                                className="border-zinc-200 text-zinc-900 hover:bg-zinc-50"
                              >
                                <label htmlFor="file-upload">Choose File</label>
                              </Button>
                              {file && (
                                <div className="mt-4 text-center">
                                  <p className="text-sm text-zinc-600">
                                    Selected file: <span className="font-medium">{file.name}</span>
                                  </p>
                                  <Button
                                    onClick={handleFileUpload}
                                    disabled={isUploading}
                                    className="mt-4 bg-black text-white hover:bg-zinc-800"
                                  >
                                    {isUploading ? "Uploading & Processing..." : "Upload & Process Document"}
                                  </Button>
                                </div>
                              )}
                              {uploadResult && uploadResult.success && (
                                <div className="mt-4 w-full">
                                  <DocumentProcessingStatus
                                    documentId={uploadResult.documentId}
                                    onComplete={handleParsedContent}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="md:col-span-1">
                            <Alert className="border-zinc-200 bg-zinc-50 h-full flex flex-col">
                              <div>
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle className="text-zinc-900">Supported formats</AlertTitle>
                                <AlertDescription className="text-zinc-600">
                                  We support the following file types:
                                </AlertDescription>
                              </div>
                              <div className="mt-4 space-y-2">
                                <p className="text-sm text-zinc-600">
                                  <strong>Images:</strong> JPG, PNG, BMP, TIFF
                                </p>
                                <p className="text-sm text-zinc-600">
                                  <strong>Documents:</strong> PDF, DOCX, PPTX, XLSX
                                </p>
                                <p className="text-sm text-zinc-600 mt-4">
                                  Both handwritten and typed journal entries can be processed.
                                </p>
                              </div>
                            </Alert>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                  <CardFooter className="flex flex-col items-start space-y-4 pt-4">
                    {error && (
                      <Alert variant="destructive" className="w-full">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    {analysis && (
                      <div className="w-full space-y-6">
                        <MoodAnalysisResult analysis={analysis} />
                        <div className="flex justify-end">
                          <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-black text-white hover:bg-zinc-800"
                          >
                            {isSaving ? "Saving..." : "Save Entry"}
                          </Button>
                        </div>
                      </div>
                    )}

                    {!analysis && activeTab === "type" && content.trim() && (
                      <Button
                        onClick={handleAnalyze}
                        disabled={!content.trim() || isAnalyzing}
                        className="w-full bg-black text-white hover:bg-zinc-800 sm:w-auto"
                      >
                        {isAnalyzing ? "Analyzing..." : "Analyze Mood with Mood Builder"}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
