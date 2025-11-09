import { google } from 'googleapis';
import type { Session } from 'next-auth';

/**
 * Get an authenticated Gmail client using the user's OAuth access token
 */
export function getGmailClient(session: Session) {
  if (!session.accessToken) {
    throw new Error(
      'No access token available in session. User may need to re-authenticate.',
    );
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: session.accessToken,
  });

  return google.gmail({
    version: 'v1',
    auth: oauth2Client,
  });
}

/**
 * Create a draft email in Gmail
 */
export async function createDraftEmail(
  gmail: ReturnType<typeof getGmailClient>,
  email: {
    to: string;
    subject: string;
    body: string;
    fromName?: string;
  },
) {
  try {
    // Create email message in RFC 2822 format
    const message = [
      `To: ${email.to}`,
      `Subject: ${email.subject}`,
      'Content-Type: text/html; charset=utf-8',
      '',
      email.body,
    ].join('\n');

    // Encode message in base64url format
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const response = await gmail.users.drafts.create({
      userId: 'me',
      requestBody: {
        message: {
          raw: encodedMessage,
        },
      },
    });

    return {
      id: response.data.id,
      messageId: response.data.message?.id,
      threadId: response.data.message?.threadId,
      draftLink: `https://mail.google.com/mail/u/0/#drafts/${response.data.id}`,
    };
  } catch (error) {
    console.error('Error creating draft email:', error);
    throw error;
  }
}
