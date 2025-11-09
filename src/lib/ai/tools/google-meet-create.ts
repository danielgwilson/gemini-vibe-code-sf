import { tool } from 'ai';
import type { Session } from 'next-auth';
import { z } from 'zod';
import { createMeetSpace, getMeetClient } from '@/lib/google/meet';

type GoogleMeetCreateProps = {
  session: Session;
};

export const googleMeetCreate = ({ session }: GoogleMeetCreateProps) =>
  tool({
    description:
      'Create Google Meet spaces/conferences for podcast recording sessions. Use this when scheduling recording events to generate Meet links.',
    inputSchema: z.object({
      accessType: z
        .enum(['OPEN', 'TRUSTED', 'RESTRICTED'])
        .optional()
        .default('OPEN')
        .describe('Access type for the Meet space: OPEN (anyone with link), TRUSTED (domain users), RESTRICTED (invite only)'),
    }),
    execute: async ({ accessType = 'OPEN' }) => {
      try {
        if (!session.accessToken) {
          return {
            error:
              'No access token available. Please sign out and sign back in to refresh your Google authentication.',
          };
        }

        const meet = getMeetClient(session);

        const space = await createMeetSpace(meet, {
          config: {
            accessType: accessType as 'OPEN' | 'TRUSTED' | 'RESTRICTED',
          },
        });

        return {
          success: true,
          space: {
            name: space.name,
            meetingUri: space.meetingUri,
            meetingCode: space.meetingCode,
            accessType: space.config?.accessType,
          },
        };
      } catch (error) {
        console.error('Error in googleMeetCreate tool:', error);

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
                'Permission denied. Make sure you have granted the necessary Google Meet permissions.',
            };
          }

          return {
            error: `Failed to create Meet space: ${error.message}`,
          };
        }

        return {
          error: 'An unexpected error occurred while creating the Meet space.',
        };
      }
    },
  });

