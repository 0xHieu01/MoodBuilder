"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Loader2 } from "lucide-react"

interface DocumentProcessingStatusProps {
  documentId: string
  onComplete?: (parsedContent: string) => void
}

export function DocumentProcessingStatus({ documentId, onComplete }: DocumentProcessingStatusProps) {
  const [status, setStatus] = useState<string>("processing")
  const [error, setError] = useState<string | null>(null)
  const [parsedContent, setParsedContent] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  // Function to extract content from metadata if needed
  const extractContentFromMetadata = (data: any) => {
    if (data.parsed_content && data.parsed_content.trim()) {
      return data.parsed_content
    }

    // If parsed_content is empty, try to extract from metadata
    if (data.metadata && data.metadata.content && data.metadata.content.text) {
      return data.metadata.content.text
    }

    return ""
  }

  useEffect(() => {
    if (!documentId) return

    // Set up a subscription to listen for changes to the document status
    const subscription = supabase
      .channel(`document-${documentId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "journal_documents",
          filter: `id=eq.${documentId}`,
        },
        (payload) => {
          console.log("Document updated:", payload.new)
          const newStatus = payload.new.status
          setStatus(newStatus)

          if (newStatus === "completed") {
            const content = extractContentFromMetadata(payload.new)
            setParsedContent(content)

            // Automatically trigger the onComplete callback when processing is done
            if (content && onComplete) {
              onComplete(content)
            }
          }
        },
      )
      .subscribe()

    // Also fetch the current status immediately
    const fetchStatus = async () => {
      try {
        const { data, error } = await supabase
          .from("journal_documents")
          .select("status, parsed_content, metadata")
          .eq("id", documentId)
          .single()

        if (error) throw error

        console.log("Fetched document status:", data)
        setStatus(data.status)

        if (data.status === "completed") {
          const content = extractContentFromMetadata(data)
          setParsedContent(content)

          // Automatically trigger the onComplete callback when processing is done
          if (content && onComplete) {
            onComplete(content)
          }
        }
      } catch (err) {
        setError("Failed to fetch document status")
        console.error(err)
      }
    }

    fetchStatus()

    // Clean up subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [documentId, supabase, onComplete])

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  if (status === "processing") {
    return (
      <div className="flex items-center space-x-2 text-zinc-600">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Processing document...</span>
      </div>
    )
  }

  if (status === "failed") {
    return <div className="text-red-500">Processing failed. Please try again or use a different file.</div>
  }

  // For completed status, we don't need to show anything here
  // as the onComplete callback will handle showing the content
  return null
}
