import { tool } from 'ai';
import type { Session } from 'next-auth';
import { z } from 'zod';
import { createDraftEmail, getGmailClient } from '@/lib/google/gmail';

type GmailProps = {
  session: Session;
};

export const gmail = ({ session }: GmailProps) =>
  tool({
    description:
      'Create draft emails in Gmail for guest outreach. Use this to draft personalized outreach emails that the user can review and send. The email will be created as a draft in the user\'s Gmail.',
    inputSchema: z.object({
      to: z
        .string()
        .email()
        .describe('Recipient email address'),
      subject: z
        .string()
        .describe('Email subject line'),
      body: z
        .string()
        .describe('Email body content (HTML supported)'),
      fromName: z
        .string()
        .optional()
        .describe('Sender name (optional, defaults to user\'s Gmail account name)'),
    }),
    execute: async ({ to, subject, body, fromName }) => {
      try {
        if (!session.accessToken) {
          return {
            error:
              'No access token available. Please sign out and sign back in to refresh your Google authentication.',
          };
        }

        const gmailClient = getGmailClient(session);

        // Format body as HTML if it contains HTML tags, otherwise wrap in <p> tags
        const htmlBody = body.includes('<') && body.includes('>')
          ? body
          : `<p>${body.replace(/\n/g, '<br>')}</p>`;

        const draft = await createDraftEmail(gmailClient, {
          to,
          subject,
          body: htmlBody,
          fromName,
        });

        return {
          success: true,
          draft: {
            id: draft.id,
            messageId: draft.messageId,
            threadId: draft.threadId,
            draftLink: draft.draftLink,
          },
          message: `Draft email created successfully. You can review and send it from: ${draft.draftLink}`,
        };
      } catch (error) {
        console.error('Error in gmail tool:', error);

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
                'Permission denied. Make sure you have granted the necessary Gmail permissions.',
            };
          }

          return {
            error: `Failed to create draft email: ${error.message}`,
          };
        }

        return {
          error: 'An unexpected error occurred while creating the draft email.',
        };
      }
    },
  });

