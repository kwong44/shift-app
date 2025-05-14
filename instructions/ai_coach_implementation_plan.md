# AI Coach Integration: Staged Implementation Plan

This document outlines a phased approach to integrating AI Coach features into the transformation app. Each stage focuses on specific functionalities, UI/UX considerations, backend integration, and strategies for managing LLM token usage and costs.

## Guiding Principles:
*   **User Value:** Prioritize features that deliver clear awareness, accountability, and goal achievement benefits.
*   **Iterative Development:** Start with core functionalities and build complexity gradually.
*   **Cost-Effectiveness:** Implement measures to minimize LLM API calls and token consumption from day one.
*   **Backend First for AI Logic:** All LLM interactions will be mediated through a dedicated backend service (Supabase Edge Functions) to protect API keys, manage prompts, and control costs.
*   **Clear User Feedback:** Ensure users understand when AI is assisting them and how their data is being used.

---

## ~~Stage 0: Foundation & Backend Setup~~ (✅ COMPLETED)

**Goal:** ~~Establish the necessary infrastructure for AI features.~~

**Features:**
1.  ~~**AI Configuration Service (Backend):**~~
    *   ~~Set up basic configuration for selecting LLM providers, models, and managing API keys (securely as environment variables in Supabase project settings).~~
2.  ~~**Backend AI Gateway (Supabase Edge Functions):**~~
    *   ~~Develop Supabase Edge Functions (TypeScript/JavaScript) that will serve as your AI backend. These functions will:~~
        *   ~~Be invoked by the mobile app (via `src/api/aiCoach.js`).~~
        *   ~~Access LLM API keys securely stored as environment variables in your Supabase project.~~
        *   ~~Construct and send prompts to the chosen LLM provider.~~
        *   ~~Process LLM responses.~~
        *   ~~Implement basic error handling and logging.~~
        *   ~~Easily interact with your Supabase database for context or storing results.~~
3.  ~~**Mobile App API Layer (`src/api/aiCoach.js`):**~~
    *   ~~Create a new file in `src/api/` to handle all outgoing requests to your Supabase Edge Function endpoints.~~
    *   ~~**Debug Log:** `console.debug('[aiCoachAPI] Sending request to Supabase Edge Function for AI task:', { functionName: '...', params: '...' });`~~

**UI/UX:**
*   ~~N/A (Infrastructure only).~~

**Backend (Supabase Edge Functions):**
*   ~~Focus on writing well-structured, efficient, and secure Supabase Edge Functions.~~
*   ~~Design functions to be scalable and easily modifiable for future AI tasks.~~
*   ~~An initial Edge Function could be a simple "test AI connection" that takes a string, calls the LLM, and returns a basic completion.~~

**Token Reduction:**
*   ~~N/A for this stage, but design the Edge Functions to allow for future caching and rate-limiting strategies.~~

---

## Stage 1: Core Journaling Insights (On-Demand)

**Goal:** Provide users with initial AI-powered awareness from their journal entries.

**Features:**
1.  ~~**AI Journal Analysis:**~~
    *   ~~When a user saves a journal entry in `JournalingEntry.js`.~~
    *   ~~An option (e.g., a button "🔍 Get AI Insights") appears *after* saving, or it could be an automatic process for premium users.~~
2.  ~~**Insight Display:**~~
    *   ~~Analyzed insights (e.g., sentiment, key themes, connection to goals) are stored with the journal entry or in a related table in your Supabase database.~~
    *   Display these insights on the `HomeScreen` (in the `Insights` component) or a new "Journal Insights" section.

**UI/UX:**
*   ~~**`JournalingEntry.js`:**~~
    *   ~~Clear button/toggle for "Get AI Insights."~~
    *   ~~Loading indicator while analysis is in progress.~~
    *   ~~Confirmation message once insights are ready.~~
*   **`HomeScreen.js` / Insight View:**
    *   Visually distinct card or section for AI-generated insights.
    *   Option to view past insights.
    *   **Comment:** `// UI should clearly attribute insights to the AI Coach.`

**Backend (Supabase Edge Function):**
*   ~~An Edge Function to receive journal content, user ID (for context like goals/mood if needed).~~
*   ~~Prompt Engineering within the Edge Function: Craft a prompt asking the LLM to identify:~~
    *   ~~Primary sentiment.~~
    *   ~~1-2 key themes.~~
    *   ~~A concise (1-2 sentence) actionable insight.~~
    *   ~~(Optional) 1-2 simple recommendations related to app features.~~
*   ~~The Edge Function will store the structured AI response in the Supabase database.~~
*   ~~**Debug Log (Edge Function):** `console.log('[AI Journal Analysis Function] Analyzing journal entry for user:', { userId: '...' });`~~

**Token Reduction:**
*   ~~**On-Demand:** User explicitly requests analysis, invoking the Edge Function.~~
*   ~~**Concise Prompts:** Ask for summarized output (e.g., "1-sentence insight," "2-3 keywords for themes").~~
*   ~~**Limit `max_tokens`:** Set a low `max_tokens` for the LLM response.~~
*   ~~**Frequency Limit (Optional):** For free tier, limit to X analyses per day/week (can be enforced in app or Edge Function).~~
*   ~~**No History (Initially):** Analyze each entry in isolation to keep prompts simple.~~

---

## Stage 2: AI-Assisted Weekly Goal Refinement

**Goal:** Help users create more effective weekly goals within `GrowthRoadmap.js`.

**Features:**
1.  **Smart Goal Suggestions:**
    *   When a user adds/edits a weekly goal in `GrowthRoadmap.js`.
    *   An icon/button ("✨ Refine with AI" or "Get Suggestions") appears next to the goal input, which calls an Edge Function.
2.  **AI Feedback:**
    *   AI provides suggestions to make the goal S.M.A.R.T. (Specific, Measurable, Achievable, Relevant, Time-bound).
    *   AI checks if the goal aligns with `focusAreas` or `currentPhase`.

**UI/UX (`GrowthRoadmap.js`):**
*   Non-intrusive icon next to the goal input field.
*   When clicked, AI suggestions appear below the input, or in a small modal/popover.
*   User can accept, modify, or ignore suggestions.
*   Loading state while AI is processing.
*   **Comment:** `// Ensure the interaction is quick and doesn't disrupt the goal-setting flow.`

**Backend (Supabase Edge Function):**
*   An Edge Function to receive goal text, user's current focus areas/phase (for context).
*   Prompt Engineering within the Edge Function:
    *   "User goal: '[goal_text]'. Is this S.M.A.R.T.? Provide 2-3 suggestions to make it more specific, measurable, and actionable. If relevant, link it to their focus areas: [focus_areas]."
*   Return structured suggestions from the Edge Function.
*   **Debug Log (Edge Function):** `console.log('[AI Goal Refinement Function] Refining goal for user:', { userId: '...', goalText: '...' });`

**Token Reduction:**
*   **User-Triggered:** Only calls AI (invokes Edge Function) when the user requests help.
*   **Targeted Prompts:** Focus only on the single goal text provided.
*   **Short Responses:** Request brief, actionable suggestions.
*   **No Chat History:** Each refinement is a single-turn interaction.

---

## Stage 3: Personalized Nudges & Basic Recommendations

**Goal:** Increase engagement and accountability through timely, relevant AI messages.

**Features:**
1.  **Contextual Nudges:**
    *   Based on data from `GrowthRoadmap.js` (progress, streak, goal completion, mood patterns).
    *   Delivered via push notifications or in-app messages on `HomeScreen`.
2.  **Simple Dynamic Exercise/Content Recommendations:**
    *   Suggest relevant app features (e.g., MindfulnessScreen, TaskPlanner) based on recent mood, journal themes, or goal struggles.

**UI/UX:**
*   **Push Notifications:** Clear, concise, and empathetic. Deep link into the app if relevant.
*   **In-App Messages (`HomeScreen`):**
    *   A dedicated "Coach's Tip" or "For You" section.
    *   Visually appealing cards for recommendations.
    *   Allow users to dismiss or act on them.
*   **Comment:** `// Personalize nudges with user's name but avoid overly chatty AI.`

**Backend (Supabase Edge Functions & Scheduled Tasks):**
*   Logic within an Edge Function (potentially triggered by Supabase cron jobs) to analyze user data from the database.
*   Prompt Engineering (can be simpler for some nudges):
    *   For some nudges, use templates and have the Edge Function fill in dynamic parts.
    *   For recommendations: "User is feeling [mood] and journaled about [theme]. Suggest one relevant exercise from [list_of_app_exercises]."
*   Edge Function integrates with a push notification service (e.g., Supabase's own or a third-party).
*   **Debug Log (Edge Function):** `console.log('[AI Nudge Function] Generating nudge/recommendation for user:', { userId: '...', trigger: '...' });`

**Token Reduction:**
*   **Template-Based Nudges:** Reduce LLM calls for common scenarios.
*   **Limited Frequency:** Control how often nudges are sent.
*   **Batch Processing:** Scheduled Edge Functions can process users in batches.
*   **Simplified Logic for Basic Recs:** Use keywords from mood/journal for basic matches before escalating to LLM.

---

## Stage 4: Advanced Roadmap Guidance & Deeper Reflection

**Goal:** Provide more sophisticated coaching related to the user's overall journey and self-awareness.

**Features:**
1.  **AI-Powered Reflection Prompts:**
    *   In `JournalingSetupScreen.js`, call an Edge Function to generate personalized prompts based on `GrowthRoadmap` data.
2.  **Contextual Advice on Roadmap:**
    *   Display AI-generated tips/insights (fetched from an Edge Function) within `GrowthRoadmap.js` related to `currentPhase`, `nextMilestone`, or balancing `focusAreas`.

**UI/UX:**
*   **`JournalingSetupScreen.js`:**
    *   Option to "Get an AI-Generated Prompt."
    *   Display the personalized prompt clearly.
*   **`GrowthRoadmap.js`:**
    *   Small, dismissible "Coach's Insight" cards related to specific roadmap sections.
    *   **Comment:** `// Ensure AI prompts for journaling are open-ended but guided by user's context.`

**Backend (Supabase Edge Functions):**
*   Edge Functions for generating reflection prompts and roadmap advice.
*   Prompt Engineering:
    *   Reflection: "User is in phase '[phase_name]', focusing on '[focus_areas]', and recently [achieved/missed] goal '[goal_text]'. Generate one insightful reflection prompt."
    *   Roadmap Advice: "Provide a brief tip (1-2 sentences) for a user in phase '[phase_name]' working towards milestone '[milestone_text]'."
*   **Debug Log (Edge Function):** `console.log('[AI Reflection Prompt Function] Generating prompt for user:', { userId: '...' });`

**Token Reduction:**
*   **Contextual but Concise:** Prompts use user data but request short outputs.
*   **Cache Generic Advice:** Some roadmap tips might be cacheable (e.g., in a separate table, populated/updated by an Edge Function) and slightly personalized.
*   **User-Initiated (for prompts):** Reflection prompts generated when user accesses journaling setup.

---

## Stage 5: "AI Coach" Premium Features & Iteration

**Goal:** Bundle advanced AI features into a premium offering and gather user feedback for future development.

**Features (Examples):**
1.  **"Chat with Coach" (Limited Scope):**
    *   Allow users to ask their AI Coach specific questions related to their goals, challenges, or app usage, handled by an Edge Function.
    *   (Start with very limited Q&A capabilities, e.g., pre-defined topics or using RAG on app's help content).
2.  **Deeper Longitudinal Analysis:**
    *   Edge Functions provide weekly/monthly summaries of progress, patterns, and insights.
3.  **Proactive Goal Adjustment Suggestions:**
    *   Edge Functions proactively suggest adjustments to goals if progress is stalling.

**UI/UX:**
*   Clear delineation of premium AI features.
*   If chat is implemented: simple, clean interface. Manage expectations about AI capabilities.
*   Dedicated "AI Coach Report" screen for summaries.

**Backend (Supabase Edge Functions):**
*   More complex prompt engineering within Edge Functions.
*   Retrieval Augmented Generation (RAG) for Q&A, implemented within an Edge Function.
*   Sophisticated data analysis for reports, performed by Edge Functions.

**Token Reduction:**
*   **Strict Scope for Chat:** Heavily restrict topics or use RAG to ground responses.
*   **Summarization for Reports:** Train prompts to provide concise summaries.
*   **Rate Limits on Premium Features:** Enforce via app logic or Edge Functions.
*   **Model Selection:** Use more powerful (and expensive) models only for features that absolutely require them.

---

This plan provides a roadmap. We'll need to assess technical feasibility, user feedback, and cost implications at each stage.