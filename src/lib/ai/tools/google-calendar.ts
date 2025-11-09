import { tool } from 'ai';
import type { Session } from 'next-auth';
import { z } from 'zod';
import { createCalendarEvent, getCalendarClient, listCalendarEvents } from '@/lib/google/calendar';

type GoogleCalendarProps = {
  session: Session;
};

export const googleCalendar = ({ session }: GoogleCalendarProps) =>
  tool({
    description:
      'Create and manage Google Calendar events for podcast production schedules. Use this to schedule episodes, prep tasks, recording sessions, and editing tasks. Can create events with Google Meet links for recording sessions.',
    inputSchema: z.object({
      action: z
        .enum(['create_event', 'list_events'])
        .describe('Action to perform: "create_event" to schedule a new event, "list_events" to view upcoming events'),
      summary: z
        .string()
        .optional()
        .describe('Event title/summary (required for create_event)'),
      description: z
        .string()
        .optional()
        .describe('Event description/details'),
      startTime: z
        .string()
        .optional()
        .describe('Start time in ISO 8601 format (e.g., "2024-12-15T14:00:00Z") - required for create_event'),
      endTime: z
        .string()
        .optional()
        .describe('End time in ISO 8601 format (e.g., "2024-12-15T16:00:00Z") - required for create_event'),
      location: z
        .string()
        .optional()
        .describe('Event location'),
      attendees: z
        .array(z.object({
          email: z.string().email(),
          name: z.string().optional(),
        }))
        .optional()
        .describe('List of attendees (for guest episodes)'),
      meetLink: z
        .boolean()
        .optional()
        .default(false)
        .describe('Whether to add a Google Meet link to the event (use true for recording sessions)'),
      timeMin: z
        .string()
        .optional()
        .describe('Start of date range for list_events (ISO 8601 format)'),
      timeMax: z
        .string()
        .optional()
        .describe('End of date range for list_events (ISO 8601 format)'),
    }),
    execute: async ({ action, summary, description, startTime, endTime, location, attendees, meetLink, timeMin, timeMax }) => {
      try {
        if (!session.accessToken) {
          return {
            error:
              'No access token available. Please sign out and sign back in to refresh your Google authentication.',
          };
        }

        const calendar = getCalendarClient(session);

        if (action === 'create_event') {
          if (!summary || !startTime || !endTime) {
            return {
              error: 'summary, startTime, and endTime are required for create_event',
            };
          }

          const event = await createCalendarEvent(calendar, {
            summary,
            description,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            location,
            attendees,
            meetLink: meetLink ?? false,
          });

          return {
            success: true,
            action: 'create_event',
            event: {
              id: event.id,
              summary: event.summary,
              start: event.start,
              end: event.end,
              htmlLink: event.htmlLink,
              meetLink: event.meetLink,
            },
          };
        }

        if (action === 'list_events') {
          const timeMinDate = timeMin ? new Date(timeMin) : new Date();
          const timeMaxDate = timeMax ? new Date(timeMax) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Default to 30 days ahead

          const events = await listCalendarEvents(calendar, timeMinDate, timeMaxDate);

          return {
            success: true,
            action: 'list_events',
            events: events.map((event) => ({
              id: event.id,
              summary: event.summary,
              start: event.start?.dateTime || event.start?.date,
              end: event.end?.dateTime || event.end?.date,
              htmlLink: event.htmlLink,
              meetLink: event.conferenceData?.entryPoints?.find(
                (ep: any) => ep.entryPointType === 'video',
              )?.uri,
            })),
            count: events.length,
          };
        }

        return {
          error: `Unknown action: ${action}`,
        };
      } catch (error) {
        console.error('Error in googleCalendar tool:', error);

        if (error instanceof Error) {
          if (error.message.includes('Invalid Credentials') || error.message.includes('401')) {
            return {
              error:
                'Authentication failed. Please sign out and sign back in to refresh your Google authentication.',
            };
          }

          if (error.message.includes('403')) {
            return {
              error:
                'Permission denied. Make sure you have granted the necessary Google Calendar permissions.',
            };
          }

          return {
            error: `Failed to manage calendar: ${error.message}`,
          };
        }

        return {
          error: 'An unexpected error occurred while managing calendar events.',
        };
      }
    },
  });

