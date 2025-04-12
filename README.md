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

---
## 🚀 Deployments

- **Platform Deployment**:  
  The Mood Builder platform is hosted on [Vercel](https://moodbuilder.vercel.app/) to ensure fast, scalable, and reliable performance.  

- **Model Context Protocol (MCP)**:  
  The MCP, which powers the PinAI Agent's context-aware interactions, is deployed as a serverless function on Vercel. It can be accessed at [https://model-context-protocol-mcp-with-vercel-functions-nine-lovat.vercel.app/sse](https://model-context-protocol-mcp-with-vercel-functions-nine-lovat.vercel.app/sse).  

- **PinAI Agent**:  
  The MoodBuilder Agent, one of core feature of Mood Builder, is created and managed on the PinAI platform. You can view the agent at [https://agent.pinai.tech/agent/338](https://agent.pinai.tech/agent/338).  
  In addition, Personal Profile is also modified to highlight the use case of this application. Assume users have some mental health problems.