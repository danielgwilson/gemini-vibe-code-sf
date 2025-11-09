import { google } from 'googleapis';
import type { Session } from 'next-auth';

/**
 * Get an authenticated Google Meet client using the user's OAuth access token
 */
export function getMeetClient(session: Session) {
  if (!session.accessToken) {
    throw new Error('No access token available in session. User may need to re-authenticate.');
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: session.accessToken,
  });

  return google.meet({
    version: 'v2',
    auth: oauth2Client,
  });
}

/**
 * Create a Google Meet space/conference
 */
export async function createMeetSpace(
  meet: ReturnType<typeof getMeetClient>,
  config?: {
    config?: {
      accessType?: 'OPEN' | 'TRUSTED' | 'RESTRICTED';
    };
  },
) {
  try {
    const response = await meet.spaces.create({
      requestBody: {
        config: config?.config || {
          accessType: 'OPEN',
        },
      },
    });

    return {
      name: response.data.name,
      meetingUri: response.data.meetingUri,
      meetingCode: response.data.meetingCode,
      config: response.data.config,
    };
  } catch (error) {
    console.error('Error creating Meet space:', error);
    throw error;
  }
}

