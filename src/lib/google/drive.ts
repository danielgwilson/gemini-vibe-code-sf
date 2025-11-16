import { google } from 'googleapis';
import type { Session } from 'next-auth';

/**
 * Get an authenticated Google Drive client using the user's OAuth access token
 */
export function getDriveClient(session: Session) {
  if (!session.accessToken) {
    throw new Error(
      'No access token available in session. User may need to re-authenticate.',
    );
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: session.accessToken,
  });

  return google.drive({
    version: 'v3',
    auth: oauth2Client,
  });
}

/**
 * Find the "Meet Recordings" folder in the user's Google Drive
 */
export async function findMeetRecordingsFolder(
  drive: ReturnType<typeof getDriveClient>,
) {
  try {
    const response = await drive.files.list({
      q: "name='Meet Recordings' and mimeType='application/vnd.google-apps.folder' and trashed=false",
      fields: 'files(id, name)',
      spaces: 'drive',
    });

    if (response.data.files && response.data.files.length > 0) {
      return response.data.files[0];
    }

    return null;
  } catch (error) {
    console.error('Error finding Meet Recordings folder:', error);
    throw error;
  }
}

/**
 * List recent Google Meet recordings from the Meet Recordings folder
 */
export async function listMeetRecordings(
  drive: ReturnType<typeof getDriveClient>,
  folderId: string,
  limit = 10,
) {
  try {
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      orderBy: 'createdTime desc',
      pageSize: limit,
      fields: 'files(id, name, mimeType, createdTime, webViewLink)',
    });

    return response.data.files || [];
  } catch (error) {
    console.error('Error listing Meet recordings:', error);
    throw error;
  }
}

/**
 * Get the transcript from a Google Meet recording
 * Transcripts are saved as Google Docs in the same folder
 */
export async function getTranscriptForRecording(
  drive: ReturnType<typeof getDriveClient>,
  recordingId: string,
  folderId: string,
) {
  try {
    // Find the transcript document (usually has the same name as the recording but as a Google Doc)
    const recordings = await listMeetRecordings(drive, folderId, 50);
    const recording = recordings.find((file) => file.id === recordingId);

    if (!recording) {
      return null;
    }

    // Transcripts are typically Google Docs with similar names
    // Look for a Google Doc created around the same time
    const recordingName = recording.name?.replace(/\.mp4$/, '') || '';
    const transcriptFiles = recordings.filter(
      (file) =>
        file.mimeType === 'application/vnd.google-apps.document' &&
        file.name?.includes(recordingName.split(' ')[0]), // Match by meeting name prefix
    );

    if (transcriptFiles.length === 0) {
      return null;
    }

    // Get the most recent matching transcript
    const transcriptFile = transcriptFiles[0];
    if (!transcriptFile.id) {
      throw new Error('Transcript file is missing an id.');
    }

    // Export the Google Doc as plain text
    const exportedContent = await drive.files.export(
      {
        fileId: transcriptFile.id,
        mimeType: 'text/plain',
      },
      { responseType: 'text' },
    );

    return {
      transcript: exportedContent.data as string,
      transcriptId: transcriptFile.id,
      transcriptName: transcriptFile.name,
    };
  } catch (error) {
    console.error('Error getting transcript:', error);
    throw error;
  }
}

/**
 * Get recording metadata and download URL
 */
export async function getRecordingDetails(
  drive: ReturnType<typeof getDriveClient>,
  recordingId: string,
) {
  try {
    const file = await drive.files.get({
      fileId: recordingId,
      fields:
        'id, name, mimeType, createdTime, size, webViewLink, webContentLink',
    });

    return file.data;
  } catch (error) {
    console.error('Error getting recording details:', error);
    throw error;
  }
}

/**
 * Find or create a folder in Google Drive
 */
export async function findOrCreateFolder(
  drive: ReturnType<typeof getDriveClient>,
  folderName: string,
  parentFolderId?: string,
) {
  try {
    // First, try to find the folder
    let query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    if (parentFolderId) {
      query += ` and '${parentFolderId}' in parents`;
    } else {
      query += " and 'root' in parents";
    }

    const response = await drive.files.list({
      q: query,
      fields: 'files(id, name)',
      spaces: 'drive',
    });

    if (response.data.files && response.data.files.length > 0) {
      return response.data.files[0];
    }

    // Folder doesn't exist, create it
    const createResponse = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentFolderId ? [parentFolderId] : undefined,
      },
      fields: 'id, name',
    });

    return createResponse.data;
  } catch (error) {
    console.error('Error finding or creating folder:', error);
    throw error;
  }
}

/**
 * Create a Google Doc in Drive
 * Note: To add content, you'll need to use the Google Docs API separately
 */
export async function createGoogleDoc(
  drive: ReturnType<typeof getDriveClient>,
  doc: {
    title: string;
    content: string;
    parentFolderId?: string;
  },
) {
  try {
    // Create the document
    const createResponse = await drive.files.create({
      requestBody: {
        name: doc.title,
        mimeType: 'application/vnd.google-apps.document',
        parents: doc.parentFolderId ? [doc.parentFolderId] : undefined,
      },
      fields: 'id, name, webViewLink',
    });

    // For now, we'll create it empty. Content can be added via Google Docs API if needed.
    // The content parameter is kept for future implementation with Docs API.

    const { id, name, webViewLink } = createResponse.data;

    if (!id || !name || !webViewLink) {
      throw new Error('Missing fields in Google Drive create response.');
    }

    return {
      id,
      name,
      webViewLink,
    };
  } catch (error) {
    console.error('Error creating Google Doc:', error);
    throw error;
  }
}

/**
 * Create a text file in Drive
 */
export async function createTextFile(
  drive: ReturnType<typeof getDriveClient>,
  file: {
    name: string;
    content: string;
    parentFolderId?: string;
    mimeType?: string;
  },
) {
  try {
    const response = await drive.files.create({
      requestBody: {
        name: file.name,
        mimeType: file.mimeType || 'text/plain',
        parents: file.parentFolderId ? [file.parentFolderId] : undefined,
      },
      media: {
        mimeType: file.mimeType || 'text/plain',
        body: file.content,
      },
      fields: 'id, name, webViewLink',
    });

    return {
      id: response.data.id,
      name: response.data.name,
      webViewLink: response.data.webViewLink,
    };
  } catch (error) {
    console.error('Error creating text file:', error);
    throw error;
  }
}
