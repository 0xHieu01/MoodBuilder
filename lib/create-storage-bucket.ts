"use server"

import { createServerClient } from "@/lib/supabase"

export async function createJournalDocumentsBucket() {
  try {
    const supabase = createServerClient()

    // Check if the bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      console.error("Error listing buckets:", listError)
      return { success: false, error: listError.message }
    }

    // Check if journal_documents bucket exists
    const bucketExists = buckets.some((bucket) => bucket.name === "journal_documents")

    if (!bucketExists) {
      // Create the bucket
      const { error: createError } = await supabase.storage.createBucket("journal_documents", {
        public: true, // Make files publicly accessible
        fileSizeLimit: 10485760, // 10MB limit
        allowedMimeTypes: [
          "image/jpeg",
          "image/png",
          "image/bmp",
          "application/pdf",
          "image/tiff",
          "image/heic",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
          "application/vnd.openxmlformats-officedocument.presentationml.presentation", // pptx
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // xlsx
        ],
      })

      if (createError) {
        console.error("Error creating bucket:", createError)
        return { success: false, error: createError.message }
      }

      return { success: true, message: "Bucket created successfully" }
    }

    return { success: true, message: "Bucket already exists" }
  } catch (error) {
    console.error("Error creating storage bucket:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}
