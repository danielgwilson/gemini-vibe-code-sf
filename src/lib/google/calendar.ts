import { google } from 'googleapis';
import type { Session } from 'next-auth';

/**
 * Get an authenticated Google Calendar client using the user's OAuth access token
 */
export function getCalendarClient(session: Session) {
  if (!session.accessToken) {
    throw new Error('No access token available in session. User may need to re-authenticate.');
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: session.accessToken,
  });

  return google.calendar({
    version: 'v3',
    auth: oauth2Client,
  });
}

/**
 * Create a calendar event
 */
export async function createCalendarEvent(
  calendar: ReturnType<typeof getCalendarClient>,
  event: {
    summary: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    location?: string;
    attendees?: Array<{ email: string; name?: string }>;
    meetLink?: boolean; // If true, add Google Meet link
  },
) {
  try {
    const eventData: any = {
      summary: event.summary,
      description: event.description || '',
      start: {
        dateTime: event.startTime.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: event.endTime.toISOString(),
        timeZone: 'UTC',
      },
    };

    if (event.location) {
      eventData.location = event.location;
    }

    if (event.attendees && event.attendees.length > 0) {
      eventData.attendees = event.attendees.map((a) => ({
        email: a.email,
        displayName: a.name,
      }));
    }

    // Add Google Meet link if requested
    if (event.meetLink) {
      eventData.conferenceData = {
        createRequest: {
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      };
    }

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: eventData,
      conferenceDataVersion: event.meetLink ? 1 : 0,
    });

    return {
      id: response.data.id,
      summary: response.data.summary,
      start: response.data.start?.dateTime,
      end: response.data.end?.dateTime,
      htmlLink: response.data.htmlLink,
      meetLink: response.data.conferenceData?.entryPoints?.find(
        (ep: any) => ep.entryPointType === 'video',
      )?.uri,
    };
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
}

/**
 * List calendar events in a date range
 */
export async function listCalendarEvents(
  calendar: ReturnType<typeof getCalendarClient>,
  timeMin: Date,
  timeMax: Date,
) {
  try {
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    return response.data.items || [];
  } catch (error) {
    console.error('Error listing calendar events:', error);
    throw error;
  }
}

