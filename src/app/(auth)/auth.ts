import type { DefaultSession, NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { createUser, getUser } from '@/lib/db/queries';

if (!process.env.GOOGLE_CLIENT_ID) {
  throw new Error('Missing GOOGLE_CLIENT_ID in .env.local');
}

if (!process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('Missing GOOGLE_CLIENT_SECRET in .env.local');
}

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('Missing NEXTAUTH_SECRET in .env.local');
}

export type UserType = 'regular';

// biome-ignore lint/nursery/useConsistentTypeDefinitions: "Required"
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      type: UserType;
    } & DefaultSession['user'];
    accessToken?: string;
  }

  interface User {
    id?: string;
    email?: string | null;
    type?: UserType;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    type?: UserType;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope:
            'openid email profile https://www.googleapis.com/auth/meetings.space.created https://www.googleapis.com/auth/drive.meet.readonly https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/gmail.compose',
          access_type: 'offline',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Handle Google OAuth sign in - create user in database if doesn't exist
      if (user.email) {
        try {
          const existingUsers = await getUser(user.email);

          if (existingUsers.length === 0) {
            // Create user - OAuth users don't need passwords, but schema requires it
            // Generate a random password hash (they'll never use it)
            const { generateUUID } = await import('@/lib/utils');
            const randomPassword = generateUUID();
            await createUser(user.email, randomPassword);
            console.log('✅ User created successfully:', user.email);
          } else {
            console.log('✅ User already exists:', user.email);
          }
        } catch (error) {
          console.error('❌ FATAL ERROR creating user:', error);
          throw new Error(
            `Database error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
        }
      }

      return true;
    },
    async jwt({ token, user, account, trigger }) {
      // Store tokens when account is available (on sign in or token refresh)
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at
          ? account.expires_at * 1000 // Convert to milliseconds
          : undefined;
      }

      // Handle token refresh if needed
      if (trigger === 'update' && token.refreshToken && token.expiresAt) {
        const now = Date.now();
        // Refresh if token expires in less than 5 minutes
        if (token.expiresAt - now < 5 * 60 * 1000) {
          try {
            const response = await fetch(
              'https://oauth2.googleapis.com/token',
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                  client_id: process.env.GOOGLE_CLIENT_ID!,
                  client_secret: process.env.GOOGLE_CLIENT_SECRET!,
                  refresh_token: token.refreshToken,
                  grant_type: 'refresh_token',
                }),
              },
            );

            if (response.ok) {
              const data = await response.json();
              token.accessToken = data.access_token;
              token.expiresAt = Date.now() + data.expires_in * 1000;
              if (data.refresh_token) {
                token.refreshToken = data.refresh_token;
              }
            }
          } catch (error) {
            console.error('Error refreshing token:', error);
            // Token refresh failed, will need to re-authenticate
            token.accessToken = undefined;
          }
        }
      }

      if (user && user.email) {
        // Fetch user ID from database
        const users = await getUser(user.email);
        if (users.length > 0) {
          token.id = users[0].id;
          token.type = 'regular';
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id;
        session.user.type = (token.type as UserType) || 'regular';
      }

      // Include access token in session for API calls
      if (token.accessToken) {
        session.accessToken = token.accessToken;
      }

      return session;
    },
  },
};

// Helper function for v4 compatibility
export async function auth() {
  const { getServerSession } = await import('next-auth');
  return getServerSession(authOptions);
}
