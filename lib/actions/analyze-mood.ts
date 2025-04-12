"use server"

import { createServerClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

interface MoodAnalysisResult {
  mood_score: number
  emotions: string[]
  themes: string[]
  summary: string
  _apiResponse?: any
}

// Fixed user ID for all server actions
const FIXED_USER_ID = "00000000-0000-0000-0000-000000000000"

export async function analyzeMoodWithSolarPro(content: string): Promise<MoodAnalysisResult> {
  try {
    console.log("Analyzing mood with Solar Pro model...")

    // Construct the prompt for Solar Pro
    const prompt = `
You are an expert psychologist and mood analyst. Your task is to analyze the following journal entry and determine:

1. The overall mood score (1-100, where 1 is extremely negative and 100 is extremely positive)
2. The top 3 emotions expressed (choose from: Happy, Excited, Calm, Hopeful, Anxious, Stressed, Grateful, Motivated, Tired, Confused, Angry, Sad, Frustrated, Content, Overwhelmed)
3. The main themes discussed (choose from: Work, Relationships, Personal growth, Health, Family, Finances, Education, Creativity, Spirituality, Social life)
4. A brief summary of the mood and themes (2-3 sentences)

Respond in the following JSON format only:
{
  "mood_score": [number between 1-100],
  "emotions": ["emotion1", "emotion2", "emotion3"],
  "themes": ["theme1", "theme2"],
  "summary": "Brief summary of the mood and themes"
}

Journal entry:
${content}
`

    console.log("Sending request to Solar Pro API...")

    // Call the Solar Pro model
    const response = await fetch("https://api.upstage.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.UPSTAGE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "solar-pro",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        stream: false,
      }),
    })

    if (!response.ok) {
      console.error(`API error: ${response.status}`)
      const errorText = await response.text()
      console.error(`API error details: ${errorText}`)
      throw new Error(`API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log("Solar Pro API response received:", JSON.stringify(data).substring(0, 200) + "...")

    // Store the full API response for later reference
    const fullApiResponse = data

    // Extract the content from the response
    const messageContent = data.choices[0].message.content
    console.log("Extracted message content:", messageContent.substring(0, 200) + "...")

    // Parse the JSON response
    let result: MoodAnalysisResult

    try {
      // Try to parse the JSON directly
      result = JSON.parse(messageContent)
      console.log("Successfully parsed Solar Pro response:", result)
    } catch (e) {
      // If direct parsing fails, try to extract JSON from the text
      console.error("Failed to parse JSON directly, trying to extract JSON from text:", e)
      const jsonMatch = messageContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0])
        console.log("Successfully extracted and parsed JSON from text:", result)
      } else {
        console.error("Failed to extract JSON from text")
        throw new Error("Failed to parse JSON response")
      }
    }

    // Validate the result structure
    if (!result.mood_score || !result.emotions || !result.themes || !result.summary) {
      console.error("Invalid response format:", result)
      throw new Error("Invalid response format")
    }

    // Add the full API response to the result object
    const resultWithApiResponse = {
      ...result,
      _apiResponse: fullApiResponse,
    }

    console.log("Final analysis result:", resultWithApiResponse)
    return resultWithApiResponse
  } catch (error) {
    console.error("Error analyzing mood with Solar Pro:", error)
    // Return a fallback analysis if the API call fails
    return {
      mood_score: 50,
      emotions: ["Neutral", "Calm", "Thoughtful"],
      themes: ["Personal reflection", "Daily life"],
      summary: "The mood appears neutral. Unable to perform detailed analysis due to technical issues.",
    }
  }
}

export async function saveAnalyzedJournalEntry(content: string, analysis: MoodAnalysisResult) {
  try {
    console.log("Saving journal entry with analysis:", analysis)

    // Create a new Supabase client for this server action
    const supabase = createServerClient()

    // Log Supabase client initialization
    console.log("Supabase client initialized")

    // Use a fixed user ID for all entries
    const userId = FIXED_USER_ID
    console.log("Using user ID:", userId)

    // IMPORTANT: First, ensure the user exists in auth.users table
    console.log("Checking if user exists in auth.users table...")
    const { data: authUser, error: authUserError } = await supabase
      .from("auth.users")
      .select("id")
      .eq("id", userId)
      .maybeSingle()

    if (authUserError) {
      console.log("Error checking auth.users table:", authUserError)
      // This might be because we can't directly query the auth schema
      // We'll try to insert the user directly
    }

    if (!authUser) {
      console.log("User not found in auth.users, attempting to create...")

      // Use RPC to call a SQL function that will insert into auth.users
      // This is a workaround since we can't directly insert into auth.users from the API
      const { error: createUserError } = await supabase.rpc("create_demo_user", {
        user_id: userId,
        user_email: "demo@example.com",
      })

      if (createUserError) {
        console.error("Error creating user in auth.users:", createUserError)
        // Continue anyway, as we might have permissions to insert into journal_entries directly
      } else {
        console.log("Successfully created user in auth.users")
      }
    }

    // Next, check if the profile exists and create if not
    console.log("Checking if profile exists...")
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle()

    if (profileCheckError) {
      console.error("Error checking profile existence:", profileCheckError)
    }

    if (!existingProfile) {
      console.log("Profile does not exist, creating demo profile...")
      const { error: createProfileError } = await supabase.from("profiles").insert({
        id: userId,
        email: "demo@example.com",
        full_name: "Demo User",
      })

      if (createProfileError) {
        console.error("Error creating profile:", createProfileError)
        // Continue anyway, as we might have permissions to insert into journal_entries directly
      } else {
        console.log("Demo profile created successfully")
      }
    } else {
      console.log("Profile already exists, proceeding with journal entry")
    }

    // Extract the API response if it exists and ensure it's properly formatted for JSON storage
    let apiResponse = null
    if (analysis._apiResponse) {
      try {
        // Make sure the API response is serializable
        apiResponse = JSON.parse(JSON.stringify(analysis._apiResponse))
      } catch (e) {
        console.error("Error serializing API response:", e)
        apiResponse = { error: "Could not serialize API response" }
      }
    }

    // Remove the _apiResponse field from the analysis object to avoid duplication
    const { _apiResponse, ...cleanAnalysis } = analysis

    // Ensure all fields are properly formatted
    const formattedAnalysis = {
      mood_score: Number(cleanAnalysis.mood_score) || 50,
      emotions: Array.isArray(cleanAnalysis.emotions) ? cleanAnalysis.emotions : [],
      themes: Array.isArray(cleanAnalysis.themes) ? cleanAnalysis.themes : [],
      summary: cleanAnalysis.summary || "",
    }

    console.log("Formatted analysis:", formattedAnalysis)
    console.log("Inserting journal entry into database...")

    // Insert the journal entry with the full analysis data
    const { data, error } = await supabase
      .from("journal_entries")
      .insert({
        user_id: userId,
        content: content,
        mood_score: formattedAnalysis.mood_score,
        analysis_data: {
          analysis: formattedAnalysis,
          api_response: apiResponse,
        },
      })
      .select()
      .single()

    if (error) {
      console.error("Error inserting journal entry:", error)
      throw error
    }

    console.log("Journal entry saved successfully:", data)

    // Process emotions and themes only if we have a successful entry
    if (data && data.id) {
      // Process emotions
      for (const emotionName of formattedAnalysis.emotions) {
        try {
          console.log(`Processing emotion: ${emotionName}`)

          // Check if emotion exists
          const { data: existingEmotion, error: findError } = await supabase
            .from("emotions")
            .select("id")
            .eq("name", emotionName)
            .maybeSingle()

          if (findError) {
            console.error(`Error finding emotion ${emotionName}:`, findError)
            continue
          }

          let emotionId

          if (existingEmotion) {
            // Use existing emotion
            emotionId = existingEmotion.id
            console.log(`Found existing emotion: ${emotionName} with ID: ${emotionId}`)
          } else {
            // Create new emotion
            console.log(`Creating new emotion: ${emotionName}`)
            const { data: newEmotion, error: createError } = await supabase
              .from("emotions")
              .insert({ name: emotionName })
              .select()
              .single()

            if (createError) {
              console.error(`Error creating emotion ${emotionName}:`, createError)
              continue
            }

            emotionId = newEmotion.id
            console.log(`Created new emotion: ${emotionName} with ID: ${emotionId}`)
          }

          // Link emotion to entry
          console.log(`Linking emotion ${emotionName} to entry ${data.id}`)
          const { error: linkError } = await supabase.from("entry_emotions").insert({
            entry_id: data.id,
            emotion_id: emotionId,
          })

          if (linkError) {
            console.error(`Error linking emotion ${emotionName} to entry:`, linkError)
          }
        } catch (err) {
          console.error(`Error processing emotion ${emotionName}:`, err)
        }
      }

      // Process themes
      for (const themeName of formattedAnalysis.themes) {
        try {
          console.log(`Processing theme: ${themeName}`)

          // Check if theme exists
          const { data: existingTheme, error: findError } = await supabase
            .from("themes")
            .select("id")
            .eq("name", themeName)
            .maybeSingle()

          if (findError) {
            console.error(`Error finding theme ${themeName}:`, findError)
            continue
          }

          let themeId

          if (existingTheme) {
            // Use existing theme
            themeId = existingTheme.id
            console.log(`Found existing theme: ${themeName} with ID: ${themeId}`)
          } else {
            // Create new theme
            console.log(`Creating new theme: ${themeName}`)
            const { data: newTheme, error: createError } = await supabase
              .from("themes")
              .insert({ name: themeName })
              .select()
              .single()

            if (createError) {
              console.error(`Error creating theme ${themeName}:`, createError)
              continue
            }

            themeId = newTheme.id
            console.log(`Created new theme: ${themeName} with ID: ${themeId}`)
          }

          // Link theme to entry
          console.log(`Linking theme ${themeName} to entry ${data.id}`)
          const { error: linkError } = await supabase.from("entry_themes").insert({
            entry_id: data.id,
            theme_id: themeId,
          })

          if (linkError) {
            console.error(`Error linking theme ${themeName} to entry:`, linkError)
          }
        } catch (err) {
          console.error(`Error processing theme ${themeName}:`, err)
        }
      }
    }

    revalidatePath("/dashboard/journal")
    revalidatePath("/dashboard/history")

    return {
      success: true,
      entry: data,
    }
  } catch (error) {
    console.error("Error saving journal entry:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
