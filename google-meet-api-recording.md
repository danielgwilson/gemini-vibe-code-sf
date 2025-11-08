# Google Meet API for Recording Meetings

## Research Summary

The standard Google Meet REST API **does not support programmatically starting or stopping a meeting *recording file***. However, the project has been granted the necessary OAuth scopes for the **Google Meet Media API**, which provides real-time access to a meeting's audio and video streams.

This is a critical distinction:
- We **cannot** tell Google Meet to "create a recording file" via an API.
- We **can** access the live audio stream during the meeting and create our own recording from it.

### Key Findings:

1.  **No Direct Recording Control (REST API):** The core limitation of the standard REST API remains. It cannot trigger the creation of a recording file in the user's Google Drive.

2.  **Real-time Media Access (Media API):** The project has the required permissions (`.../auth/meetings.media.audio.readonly`) to access the live audio stream of a meeting. This allows us to build a custom recording solution.

3.  **Custom Solution Required:** To achieve full automation, we will build a service (a "bot") that joins the meeting, captures the audio stream via the Media API, and processes it in real-time.

## Implications for the Project

- The path is clear for a fully automated, seamless recording experience.
- The previous blocker of needing to apply for a developer preview is removed.
- Our core development effort will be focused on building a robust service that utilizes the Google Meet Media API to capture audio and the Google Cloud Speech-to-Text API for real-time transcription.
