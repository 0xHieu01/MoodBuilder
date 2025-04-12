"use server"

import { createServerClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"
import { createJournalDocumentsBucket } from "@/lib/create-storage-bucket"

// Fixed user ID for all server actions
const FIXED_USER_ID = "00000000-0000-0000-0000-000000000000"

export async function uploadJournalDocument(formData: FormData) {
  try {
    const file = formData.get("file") as File
    if (!file) {
      throw new Error("No file provided")
    }

    // Get file details
    const fileName = file.name
    const fileType = file.type
    const fileSize = file.size

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/bmp",
      "application/pdf",
      "image/tiff",
      "image/heic",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
      "application/vnd.openxmlformats-officedocument.presentationml.presentation", // pptx
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // xlsx
    ]

    if (!allowedTypes.includes(fileType)) {
      throw new Error("File type not supported")
    }

    // Use fixed user ID
    const userId = FIXED_USER_ID

    // Initialize Supabase client
    const supabase = createServerClient()

    // Create a unique file name
    const uniqueFileName = `${userId}/${uuidv4()}-${fileName}`

    // Ensure the storage bucket exists
    await createJournalDocumentsBucket()

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload file to Supabase Storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from("journal_documents")
      .upload(uniqueFileName, buffer, {
        contentType: fileType,
        cacheControl: "3600",
      })

    if (storageError) {
      throw storageError
    }

    // Get the public URL of the uploaded file
    const { data: publicUrlData } = await supabase.storage.from("journal_documents").getPublicUrl(uniqueFileName)

    const publicUrl = publicUrlData.publicUrl

    // Create a record in the database
    const { data: documentData, error: documentError } = await supabase
      .from("journal_documents")
      .insert({
        user_id: userId,
        file_name: fileName,
        file_type: fileType,
        file_size: fileSize,
        file_path: uniqueFileName,
        public_url: publicUrl,
        status: "processing",
      })
      .select()
      .single()

    if (documentError) {
      throw documentError
    }

    // Send the file to Upstage for parsing
    const upstageApiKey = process.env.UPSTAGE_API_KEY

    // Create FormData for Upstage API
    const upstageFormData = new FormData()
    upstageFormData.append("document", file)
    upstageFormData.append("output_formats", JSON.stringify(["html", "text"]))
    upstageFormData.append("base64_encoding", JSON.stringify(["table"]))
    upstageFormData.append("ocr", "auto")
    upstageFormData.append("coordinates", "true")
    upstageFormData.append("model", "document-parse")

    // Send the request to Upstage
    const upstageResponse = await fetch("https://api.upstage.ai/v1/document-digitization", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${upstageApiKey}`,
      },
      body: upstageFormData,
    })

    if (!upstageResponse.ok) {
      const errorText = await upstageResponse.text()
      console.error("Upstage API error:", errorText)

      // Update the document record with error status
      await supabase
        .from("journal_documents")
        .update({
          status: "failed",
        })
        .eq("id", documentData.id)

      throw new Error(`Upstage API error: ${upstageResponse.status} - ${errorText}`)
    }

    const upstageData = await upstageResponse.json()
    console.log("Upstage response received")

    // Extract the text and HTML content from the response
    let parsedText = ""
    let parsedHtml = ""

    // Check if content exists in the response
    if (upstageData && upstageData.content) {
      parsedText = upstageData.content.text || ""
      parsedHtml = upstageData.content.html || ""
    }

    console.log("Extracted text length:", parsedText.length)
    console.log("Extracted HTML length:", parsedHtml.length)

    // Update the document record with the parsed content
    const { error: updateError } = await supabase
      .from("journal_documents")
      .update({
        status: "completed",
        parsed_content: parsedText,
        parsed_html: parsedHtml,
        metadata: upstageData,
      })
      .eq("id", documentData.id)

    if (updateError) {
      console.error("Error updating document:", updateError)
      throw updateError
    }

    console.log("Document processed successfully:", documentData.id)

    revalidatePath("/dashboard/journal")
    revalidatePath("/dashboard/documents")

    return {
      success: true,
      documentId: documentData.id,
      parsedContent: parsedText,
    }
  } catch (error) {
    console.error("Error uploading document:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
