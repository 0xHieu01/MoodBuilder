# Mood Builder - BUIDL AI 2025 Hackathon

Mood Builder - An AI-powered mood journaling platform designed to enhance your mental wellbeing by providing actionable insights, personalized feedback, and an interactive AI agent to support your emotional health journey.

###### Team Name: Indie Builder
###### Team Member: Ho Hieu (Alex)

###### Demo: [https://moodbuilder.vercel.app/](https://moodbuilder.vercel.app/)
---

# 🌟 Why Mood Builder?

Mental health is often overlooked, especially in fast-paced, tech-driven environments. Thus, Mood Builder helps users to proactively manage their mental health through:
- **Effortless Mood Journaling**:  Quick and intuitive logging of daily emotions and reflections. Users can either type their entries directly or upload journal documents, including handwritten files. The system leverages Document Parsing technology from the Upstage API to extract the journal from uploaded documents.
- **Automatic Emotional Analysis**: AI-powered interpretation of journal entries using the Upstage Solar Pro model to analyze user mood score, emotions, themes based on user input journaling. 
- **Add-on Features**: Additional features include a comprehensive Mood Trends Dashboard with visual analytics and mood boosters, a convenient Recent Entries and Calendar View to review and visualize emotional patterns, and personalized Mood Boosters like guided meditations, breathing exercises, and gratitude practices. 
- **Chat with PinAI Agent**: Chat with PinAI Agent is a highly empathetic and professional psychological counselor that leverages Upstage Solar Pro for real-time mood-enhancing suggestions. It automatically fetches user persona data from PinAI and references journaling entries and today’s mood of user from Supabase. By maintaining context with the Model Context Protocol (MCP), the agent tailors personalized and empathy-driven advice. This synergy transforms raw journaling data into actionable insights that empower each user to improve their mental wellbeing.

---
## 🛠️ Built With

- **Upstage AI API**: For robust document parsing (OCR) and the Solar Pro model powering empathetic mood analysis.

- **PinAI**: To seamlessly modify and fetch user persona data in AI agent that puts the humans at the center of conversation.

- **Next.js + Tailwind CSS + shadcn/ui + V0**: A modern, responsive frontend framework and design system for fast UI development.

- **Supabase**: For secure, real-time handling of journaling entries, mood data, and overall user information.

