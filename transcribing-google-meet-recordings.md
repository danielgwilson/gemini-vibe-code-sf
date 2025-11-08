# Transcribing Google Meet Recordings

## Research Summary

Transcription can be handled natively within Google Meet (for paid users) or by using external services, with Google's own Speech-to-Text API being a powerful option.

### Key Findings:

1.  **Native Google Meet Transcription:**
    -   Available for paid Google Workspace editions.
    -   Can be enabled when scheduling a meeting or started manually during a meeting.
    -   Transcripts are saved as Google Docs in the host's Google Drive.
    -   This is a simple, integrated solution but lacks the advanced features and real-time capabilities needed for our project.

2.  **Third-Party Transcription Services:**
    -   Many services (like Otter.ai, Rev.ai) can transcribe audio files.
    -   This would involve downloading the Google Meet recording and then uploading it to the third-party service.
    -   Some services offer bots that can join the meeting and provide real-time transcription.

3.  **Google Cloud Speech-to-Text API:**
    -   This is Google's powerful, standalone transcription service.
    -   It offers features crucial for our project:
        -   **Streaming Recognition:** For real-time transcription.
        -   **Speaker Diarization:** To identify who is speaking.
        -   **High Accuracy:** Leverages Google's advanced AI models.
    -   This API would be the ideal choice for a custom, integrated solution.

## Implications for the Project

-   To achieve a seamless, real-time transcription experience, we need to stream audio from the Google Meet session directly to a transcription service.
-   The combination of the **Google Meet Media API (to get the audio stream)** and the **Google Cloud Speech-to-Text API (to transcribe the stream)** is the clear technical path for building this feature in-house.
-   If we opt for a simpler, non-real-time solution, we can retrieve the recording after the meeting and process it with the Speech-to-Text API's asynchronous recognition.
