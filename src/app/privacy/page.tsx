import type { Metadata } from 'next';

import { Footer } from '@/components/landing/footer';
import { Header } from '@/components/landing/header';

export const metadata: Metadata = {
  title: 'Privacy Policy – Gemcast',
  description:
    'How Gemcast uses and protects your information, including Google user data.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto max-w-3xl px-4 py-12 space-y-8">
        <section>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground">
            Last updated: November 16, 2025
          </p>
        </section>

        <section className="space-y-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Gemcast (&quot;Gemcast&quot;, &quot;we&quot;, &quot;us&quot; or
            &quot;our&quot;) provides tools to help you plan and run meetings,
            generate podcast content, and automate related workflows. This
            Privacy Policy explains how we collect, use, and share information
            when you use our application and related services (the
            &quot;Service&quot;).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Information we collect</h2>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
            <li>
              <span className="font-medium text-foreground">
                Account information:
              </span>{' '}
              When you sign in with Google, we receive your basic profile
              information (name, email address and profile image) so that we
              can create and manage your Gemcast account.
            </li>
            <li>
              <span className="font-medium text-foreground">
                Usage information:
              </span>{' '}
              We collect information about how you interact with the Service,
              such as the features you use, the content you create, and
              diagnostics that help us keep the Service reliable and secure.
            </li>
            <li>
              <span className="font-medium text-foreground">
                Content you provide:
              </span>{' '}
              This includes text prompts, chat messages, meeting details, and
              any other content you submit so that we can generate and store
              outputs for you.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Google user data</h2>
          <p className="text-sm text-muted-foreground">
            With your consent, Gemcast uses Google APIs to access certain
            Google services on your behalf. We request the following scopes
            through Google OAuth in order to provide the core functionality of
            the Service:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
            <li>
              <code>openid</code>, <code>email</code>, <code>profile</code> – to
              authenticate you with Google and identify your account.
            </li>
            <li>
              <code>https://www.googleapis.com/auth/calendar</code> – to create
              and manage events on your primary Google Calendar when you ask
              Gemcast to schedule meetings.
            </li>
            <li>
              <code>https://www.googleapis.com/auth/meetings.space.created</code>{' '}
              – to create Google Meet spaces for meetings you schedule through
              the Service.
            </li>
            <li>
              <code>https://www.googleapis.com/auth/drive.meet.readonly</code>{' '}
              and <code>https://www.googleapis.com/auth/drive.file</code> – to
              read Google Meet recordings and related transcripts stored in your
              Google Drive and to save files or documents that Gemcast creates
              for you.
            </li>
            <li>
              <code>https://www.googleapis.com/auth/gmail.compose</code> – to
              create draft emails in your Gmail account (for example, follow-up
              emails after meetings). We create drafts only and do not send
              emails on your behalf automatically.
            </li>
          </ul>
          <p className="text-sm text-muted-foreground">
            We use the access tokens issued by Google only to perform the
            specific actions you request inside the Service. We do not use
            Google user data to serve ads, and we do not sell Google user data
            to third parties.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">How we use information</h2>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
            <li>To provide and operate the Service and its features.</li>
            <li>To personalize your experience and save your settings.</li>
            <li>To generate and store AI outputs and meeting assets.</li>
            <li>
              To monitor and improve the performance, security, and reliability
              of the Service.
            </li>
            <li>
              To communicate with you about updates, security notices, and
              support.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">How we share information</h2>
          <p className="text-sm text-muted-foreground">
            We may share information in the following limited circumstances:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
            <li>
              With service providers that help us run the Service (for example,
              hosting, databases, and analytics), under agreements that require
              them to protect your information.
            </li>
            <li>
              If required by law, legal process, or government request, when we
              believe disclosure is necessary to comply with our legal
              obligations or protect the rights, property, or safety of Gemcast
              or others.
            </li>
            <li>
              In connection with a merger, acquisition, or other corporate
              transaction, subject to appropriate confidentiality and data
              protection obligations.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">
            Data retention and your choices
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
            <li>
              You can disconnect Gemcast&apos;s access to your Google account at
              any time from your Google Account security settings.
            </li>
            <li>
              We retain account information and content you create for as long
              as your account is active or as needed to provide the Service.
            </li>
            <li>
              You may contact us to request deletion of your account and related
              data as described below.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Security</h2>
          <p className="text-sm text-muted-foreground">
            We use reasonable technical and organizational measures to protect
            your information. However, no online service can guarantee absolute
            security. You are responsible for maintaining the security of your
            own devices and accounts.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Children&apos;s privacy</h2>
          <p className="text-sm text-muted-foreground">
            The Service is not directed to children under 13, and we do not
            knowingly collect personal information from children under 13. If
            you believe a child has provided us with personal information,
            please contact us so that we can take appropriate action.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Changes to this policy</h2>
          <p className="text-sm text-muted-foreground">
            We may update this Privacy Policy from time to time. When we do, we
            will update the &quot;Last updated&quot; date at the top of this
            page. Your continued use of the Service after any changes become
            effective constitutes your acceptance of the revised policy.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Contact</h2>
          <p className="text-sm text-muted-foreground">
            If you have questions about this Privacy Policy or how we handle
            your data, you can contact us at{' '}
            <a
              href="mailto:daniel@danielgwilson.com"
              className="underline underline-offset-4 hover:text-foreground"
            >
              daniel@danielgwilson.com
            </a>
            .
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}

