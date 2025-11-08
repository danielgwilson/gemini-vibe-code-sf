# Master Plan: Gemini AI Podcast Platform

This document outlines the master plan for developing a Gemini AI-based podcast content platform, synthesizing the findings from our initial research phase.

## 1. Project Vision

To create a seamless platform that leverages Gemini AI and Google Cloud services to handle the entire podcasting lifecycle: from idea generation and interview preparation to fully automated recording via Google Meet, AI-powered "Vibe Editing," and final production.

## 2. Core Technology Stack

-   **Frontend:** Next.js / React
-   **Backend:** Node.js / TypeScript
-   **Cloud Provider:** Google Cloud Platform
-   **AI Engine:** Google Gemini API
-   **Meeting/Recording:** Google Meet (via Media API)
-   **Transcription:** Google Cloud Speech-to-Text API
-   **Audio Generation:** Google Cloud Text-to-Speech API

## 3. Key Architectural Decisions & Features

### 3.1. Google Meet Integration & Recording

This is the most critical and complex part of the project. With the confirmation of Media API access, we can proceed with a fully automated solution.

-   **Decision:** We will build a custom recording solution. This provides the best user experience and gives us full control over the recording and transcription process.
-   **Action Item:** Begin development of the recording bot/service.
-   **Implementation:**
    1.  Use the **Google Meet REST API** to create and manage meeting spaces.
    2.  Use the **Google Meet Add-ons SDK** to build a custom in-meeting control panel. This panel will be the user's main interface for managing the podcast session.
    3.  Use the **Google Meet Media API** to have a service join the meeting and capture the raw audio stream.

### 3.2. Transcription

-   **Decision:** Use the Google Cloud Speech-to-Text API for all transcription.
-   **Implementation:**
    1.  Pipe the real-time audio stream from our Media API service to the **Speech-to-Text API's Streaming Recognition** endpoint.
    2.  Use the **Speaker Diarization** feature to identify and label speakers in the transcript.
    3.  Store the generated transcript for post-production.

### 3.3. The "Vibe Editing" Engine

This will be the platform's signature feature.

-   **Decision:** Leverage the Gemini API for all content generation and transformation tasks.
-   **Implementation:**
    1.  **Idea Generation:** Create a UI where users can input a topic and have Gemini generate episode ideas, guest questions, and talking points.
    2.  **Scripting:** Allow users to generate full scripts from prompts or existing documents.
    3.  **Vibe Editor:** Build an interface where users can load a transcript, select a target "vibe" (e.g., "Funny & Casual," "Serious & Authoritative"), and have Gemini rewrite the content to match. This is a text-based operation on the transcript.

### 3.4. Audio Production

-   **Decision:** Use the Google Cloud Text-to-Speech API for generating audio for intros, outros, and other segments.
-   **Implementation:**
    1.  Create a simple interface for users to input text.
    2.  Allow users to select from a variety of AI-generated voices.
    3.  Generate the audio file and make it available for download or integration into the final podcast.

## 4. Actionable Implementation Plan (Manual Prototype)

This revised plan focuses on a simpler, manual-start prototype. The core of this phase is building a robust post-production pipeline that automatically retrieves meeting artifacts after the user manually records a session.

### Phase 1: Build the Post-Production & Vibe Editing Pipeline

**Step 1: Create the Google Meet API Wrapper & Session Management**
-   **Task:** Develop a server-side module (`/src/lib/google-meet.ts`) for the Meet REST API and an API endpoint (`/src/app/api/sessions/create/route.ts`) to start a session.
-   **Functionality:**
    -   The frontend calls this endpoint.
    -   The endpoint uses the user's token to create a Google Meet space.
    -   It saves the `conferenceRecord` ID and user details to our database.
    -   It returns the `meetingUri` to the frontend, which redirects the user.
-   **Outcome:** A user can create and launch a new, tracked podcast meeting.

**Step 2: Implement the Google Drive Webhook**
-   **Task:** This is the core of the new architecture. We need to build the system that gets notified when recordings are ready.
-   **Functionality:**
    -   Create a new API endpoint (`/src/app/api/webhooks/google-drive/route.ts`) to receive notifications from Google.
    -   When a user starts a session (in Step 1), our backend will use the Google Drive API to subscribe to changes in that user's "Meet Recordings" folder, pointing the subscription to our webhook URL.
    -   The webhook handler will securely process incoming notifications to identify when a new recording or transcript has been added.
-   **Outcome:** A mechanism for Google to tell us the instant a user's podcast files are ready.

**Step 3: Build the File Processing Service**
-   **Task:** Create a backend service that acts on the webhook notifications.
-   **Functionality:**
    -   When the webhook is triggered, this service will use the information in the notification to access the user's Google Drive.
    -   It will download the relevant recording (MP4) and transcript (Google Doc) files.
    -   It will convert the Google Doc transcript into plain text.
    -   It will associate the downloaded files with the correct session in our database and mark it as "Ready for Editing."
-   **Outcome:** An automated pipeline that ingests podcast recordings and transcripts into our system.

**Step 4: Frontend UI & Dashboard**
-   **Task:** Create the user-facing dashboard.
-   **Functionality:**
    -   A "Start New Podcast Session" button.
    -   A list of all past sessions.
    -   The status of each session (e.g., "In Progress," "Processing," "Ready for Vibe Editing").
-   **Outcome:** The user's central hub for managing their podcasting workflow.

---

### Phase 2: Vibe Editing & Post-Production

-   **Task:** With the files now in our system, we can build the "Vibe Editing" feature.
-   **Functionality:**
    -   Allow users to select a "Ready" transcript from their dashboard.
    -   Provide the UI to choose a "vibe."
    -   Use the Gemini API to rewrite the text.
    -   Implement AI-powered show notes and summary generation.

### Phase 3: Advanced Features & Automation (Future)

-   **Task:** If we choose to pursue full automation in the future, we can revisit the real-time recording service.
-   **Functionality:**
    -   Develop the custom recording service using the Google Meet Media API.
    -   Build the in-meeting Add-on for live transcription.
    -   Integrate Gemini-powered idea generation and scripting tools.
