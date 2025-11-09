import { createUser, getUser } from '@/lib/db/queries';
import type { NextAuthOptions, DefaultSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

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

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      type: UserType;
    } & DefaultSession['user'];
  }

  // biome-ignore lint/nursery/useConsistentTypeDefinitions: "Required"
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
            'openid email profile https://www.googleapis.com/auth/meetings.space.created https://www.googleapis.com/auth/drive.meet.readonly https://www.googleapis.com/auth/calendar.app.created',
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
          throw new Error(`Database error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return true;
    },
    async jwt({ token, user }) {
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

      return session;
    },
  },
};

// Helper function for v4 compatibility
export async function auth() {
  const { getServerSession } = await import('next-auth');
  return getServerSession(authOptions);
}
