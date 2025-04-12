"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { FileText, Download, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { SidebarProvider } from "@/components/ui/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { format } from "date-fns"

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  // Function to extract content from metadata if needed
  const extractContentFromMetadata = (doc: any) => {
    if (doc.parsed_content && doc.parsed_content.trim()) {
      return doc.parsed_content
    }

    // If parsed_content is empty, try to extract from metadata
    if (doc.metadata && doc.metadata.content && doc.metadata.content.text) {
      return doc.metadata.content.text
    }

    return ""
  }

  useEffect(() => {
    async function fetchDocuments() {
      try {
        const { data, error } = await supabase
          .from("journal_documents")
          .select("*")
          .order("created_at", { ascending: false })

        if (error) throw error

        // Process documents to ensure parsed_content is available
        const processedDocs =
          data?.map((doc) => ({
            ...doc,
            parsed_content: extractContentFromMetadata(doc),
          })) || []

        setDocuments(processedDocs)
      } catch (err) {
        console.error("Error fetching documents:", err)
        setError("Failed to load documents")
      } finally {
        setLoading(false)
      }
    }

    fetchDocuments()
  }, [supabase])

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("image")) return "🖼️"
    if (fileType.includes("pdf")) return "📄"
    if (fileType.includes("word")) return "📝"
    if (fileType.includes("presentation")) return "📊"
    if (fileType.includes("sheet")) return "📈"
    return "📁"
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">Completed</span>
      case "processing":
        return <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">Processing</span>
      case "failed":
        return <span className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-800">Failed</span>
      default:
        return <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-800">{status}</span>
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col">
          <DashboardHeader />
          <main className="flex-1 p-6 md:p-8">
            <div className="w-full">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold">Uploaded Documents</h1>
                  <p className="text-muted-foreground">View and manage your uploaded journal documents</p>
                </div>
                <Button asChild className="bg-black text-white hover:bg-zinc-800">
                  <Link href="/dashboard/journal?tab=upload">Upload New Document</Link>
                </Button>
              </div>

              <Card className="border-zinc-100 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">Document Library</CardTitle>
                  <CardDescription>Your uploaded journal documents and notes</CardDescription>
                </CardHeader>
                <CardContent className="px-4 pb-6">
                  {loading ? (
                    <div className="flex h-40 items-center justify-center">
                      <p className="text-muted-foreground">Loading documents...</p>
                    </div>
                  ) : error ? (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
                      <p>{error}</p>
                    </div>
                  ) : documents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-6">
                      <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
                      <h3 className="mb-2 text-xl font-medium">No documents yet</h3>
                      <p className="mb-4 text-center text-muted-foreground">
                        Upload handwritten notes or documents to see them here
                      </p>
                      <Button asChild className="bg-black text-white hover:bg-zinc-800">
                        <Link href="/dashboard/journal?tab=upload">Upload Your First Document</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {documents.map((doc) => (
                        <Card key={doc.id} className="overflow-hidden">
                          <CardContent className="p-0">
                            <div className="flex items-center border-b p-4">
                              <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 text-2xl">
                                {getFileIcon(doc.file_type)}
                              </div>
                              <div className="flex-1">
                                <h3 className="font-medium">{doc.file_name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  Uploaded on {format(new Date(doc.created_at), "MMM d, yyyy 'at' h:mm a")}
                                </p>
                              </div>
                              <div className="ml-4">{getStatusBadge(doc.status)}</div>
                            </div>
                            <div className="flex items-center justify-between bg-zinc-50 p-4">
                              <div className="text-sm">
                                <span className="text-muted-foreground">Size: </span>
                                {(doc.file_size / 1024).toFixed(1)} KB
                              </div>
                              <div className="flex gap-2">
                                {doc.status === "completed" && doc.parsed_content && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                                    asChild
                                  >
                                    <Link href={`/dashboard/journal?content=${encodeURIComponent(doc.parsed_content)}`}>
                                      <Eye className="mr-1 h-4 w-4" />
                                      View Content
                                    </Link>
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                                  asChild
                                >
                                  <a href={doc.public_url} target="_blank" rel="noopener noreferrer">
                                    <Download className="mr-1 h-4 w-4" />
                                    Download
                                  </a>
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
